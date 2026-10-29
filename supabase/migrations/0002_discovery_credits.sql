-- Discovery is paginated server-side so clients cannot download locked profiles in advance.
-- First visit starts with 100 credits; users then receive 50 credits per UTC day.
-- Opening each additional page costs 25 credits. A page is charged only once per user.

create table public.credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  last_daily_grant_on date not null,
  created_at timestamptz not null default now()
);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null check (reason in ('welcome', 'daily', 'page_unlock')),
  page_number integer,
  created_at timestamptz not null default now()
);

create table public.discovery_page_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, page_number)
);

-- Records which profiles were actually returned to each user, so RLS cannot expose locked pages.
create table public.discovery_visible_profiles (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  page_number integer not null check (page_number >= 0),
  shown_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

create index credit_transactions_user_created_idx on public.credit_transactions(user_id, created_at desc);

alter table public.credit_wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.discovery_page_unlocks enable row level security;
alter table public.discovery_visible_profiles enable row level security;

create policy "Users can read their credit wallet" on public.credit_wallets
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users can read their credit history" on public.credit_transactions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users can read their revealed profile ids" on public.discovery_visible_profiles
  for select to authenticated using (user_id = (select auth.uid()));

-- Tighten the original broad discovery read policy; discovery now reveals rows page by page.
drop policy if exists "Users can read eligible candidate profiles" on public.profiles;
create policy "Users can read profiles revealed or connected to them" on public.profiles for select to authenticated using (
  exists (select 1 from public.discovery_visible_profiles v
    where v.user_id = (select auth.uid()) and v.profile_id = profiles.id)
  or exists (select 1 from public.selected_profiles s
    where s.user_id = (select auth.uid()) and s.profile_id = profiles.id)
  or exists (select 1 from public.interests i where
    (i.sender_id = (select auth.uid()) and i.recipient_id = profiles.id)
    or (i.recipient_id = (select auth.uid()) and i.sender_id = profiles.id))
  or exists (select 1 from public.matches m where
    (m.user_one = (select auth.uid()) and m.user_two = profiles.id)
    or (m.user_two = (select auth.uid()) and m.user_one = profiles.id))
);
drop policy if exists "Users can select eligible profiles" on public.selected_profiles;
create policy "Users can select revealed profiles" on public.selected_profiles for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (
    select 1 from public.discovery_visible_profiles v
    where v.user_id = (select auth.uid()) and v.profile_id = selected_profiles.profile_id
  )
);
drop policy if exists "Users can send an interest to an eligible person" on public.interests;
create policy "Users can send interest to revealed profiles" on public.interests for insert to authenticated with check (
  sender_id = (select auth.uid()) and exists (
    select 1 from public.discovery_visible_profiles v
    where v.user_id = (select auth.uid()) and v.profile_id = interests.recipient_id
  )
);

-- Keep the original unpaged discovery RPC private; the paged RPC below is the only client entry point.
revoke all on function public.discover_profiles() from authenticated;

-- Initializes the wallet and applies one daily grant. Clients cannot directly change balances.
create or replace function public.get_discovery_credits()
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  wallet public.credit_wallets;
  inserted_count integer;
  utc_today date := (now() at time zone 'UTC')::date;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;

  insert into public.credit_wallets(user_id, balance, last_daily_grant_on)
  values (current_user_id, 100, utc_today)
  on conflict (user_id) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 1 then
    insert into public.credit_transactions(user_id, amount, reason)
    values (current_user_id, 100, 'welcome');
  end if;

  select * into wallet from public.credit_wallets
  where user_id = current_user_id for update;

  if wallet.last_daily_grant_on < utc_today then
    update public.credit_wallets
      set balance = balance + 50, last_daily_grant_on = utc_today
      where user_id = current_user_id
      returning * into wallet;
    insert into public.credit_transactions(user_id, amount, reason)
    values (current_user_id, 50, 'daily');
  end if;

  return jsonb_build_object(
    'balance', wallet.balance,
    'daily_credits', 50,
    'page_cost', 25,
    'profiles_per_page', 10,
    'last_daily_grant_on', wallet.last_daily_grant_on
  );
end;
$$;

-- Returns only the requested ranked slice. Page zero is free; later pages cost 25 credits once.
create or replace function public.get_curated_page(p_page_number integer)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  wallet public.credit_wallets;
  page_profiles jsonb;
  more_available boolean;
  already_unlocked boolean;
  offset_rows integer;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if p_page_number < 0 or p_page_number > 10000 then raise exception 'Invalid page'; end if;
  if p_page_number > 1 and not exists (
    select 1 from public.discovery_page_unlocks
    where user_id = current_user_id and discovery_page_unlocks.page_number = p_page_number - 1
  ) then raise exception 'PREVIOUS_PAGE_LOCKED'; end if;

  perform public.get_discovery_credits();
  select * into wallet from public.credit_wallets
    where user_id = current_user_id for update;
  offset_rows := p_page_number * 10;

  with viewer as (
    select * from public.profiles where id = current_user_id and is_complete and is_visible
  ), candidates as (
    select candidate.*,
      (select count(*)::integer from unnest(candidate.interests) candidate_interest
       where candidate_interest = any(viewer.interests)) as interest_score,
      (select count(*)::integer
       from jsonb_each_text(viewer.personality) viewer_answer
       join jsonb_each_text(candidate.personality) candidate_answer using (key)
       where viewer_answer.value = candidate_answer.value) as personality_score
    from viewer
    join public.profiles candidate on candidate.id <> viewer.id
    where candidate.is_complete and candidate.is_visible
      and candidate.age between viewer.min_age and viewer.max_age
      and viewer.age between candidate.min_age and candidate.max_age
      and (viewer.preferred_gender = 'everyone'
        or (viewer.preferred_gender = 'women' and candidate.gender = 'woman')
        or (viewer.preferred_gender = 'men' and candidate.gender = 'man')
        or (viewer.preferred_gender = 'non-binary' and candidate.gender = 'non-binary'))
      and (candidate.preferred_gender = 'everyone'
        or (candidate.preferred_gender = 'women' and viewer.gender = 'woman')
        or (candidate.preferred_gender = 'men' and viewer.gender = 'man')
        or (candidate.preferred_gender = 'non-binary' and viewer.gender = 'non-binary'))
      and not exists (
        select 1 from public.interests i
        where (i.sender_id = viewer.id and i.recipient_id = candidate.id)
           or (i.sender_id = candidate.id and i.recipient_id = viewer.id)
      )
  ), ranked as (
    select candidates.*,
      row_number() over (order by interest_score desc, personality_score desc, created_at desc, id desc) as row_number,
      count(*) over () as total_count
    from candidates
  ), requested_page as (
    select * from ranked where row_number > offset_rows and row_number <= offset_rows + 10
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'id', requested_page.id,
      'display_name', requested_page.display_name,
      'age', requested_page.age,
      'bio', requested_page.bio,
      'photo_urls', requested_page.photo_urls,
      'occupation', requested_page.occupation,
      'city', requested_page.city,
      'interests', requested_page.interests
    ) order by requested_page.row_number), '[]'::jsonb),
    coalesce((select max(total_count) > offset_rows + 10 from ranked), false)
  into page_profiles, more_available
  from requested_page;

  if p_page_number > 0 and jsonb_array_length(page_profiles) > 0 then
    select exists (
      select 1 from public.discovery_page_unlocks
      where user_id = current_user_id and discovery_page_unlocks.page_number = p_page_number
    ) into already_unlocked;

    if not already_unlocked then
      if wallet.balance < 25 then
        return jsonb_build_object(
          'profiles', '[]'::jsonb,
          'has_more', more_available,
          'page', p_page_number,
          'balance', wallet.balance,
          'insufficient_credits', true
        );
      end if;
      update public.credit_wallets set balance = balance - 25
        where user_id = current_user_id returning * into wallet;
      insert into public.discovery_page_unlocks(user_id, page_number)
        values (current_user_id, p_page_number);
      insert into public.credit_transactions(user_id, amount, reason, page_number)
        values (current_user_id, -25, 'page_unlock', p_page_number);
    end if;
  end if;

  insert into public.discovery_visible_profiles(user_id, profile_id, page_number)
  select current_user_id, (revealed.value ->> 'id')::uuid, p_page_number
  from jsonb_array_elements(page_profiles) revealed(value)
  on conflict (user_id, profile_id) do nothing;

  return jsonb_build_object(
    'profiles', page_profiles,
    'has_more', more_available,
    'page', p_page_number,
    'balance', wallet.balance
  );
end;
$$;

revoke all on function public.get_discovery_credits() from public;
revoke all on function public.get_curated_page(integer) from public;
grant execute on function public.get_discovery_credits() to authenticated;
grant execute on function public.get_curated_page(integer) to authenticated;
