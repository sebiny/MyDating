create extension if not exists pgcrypto;

create type public.gender_identity as enum ('woman', 'man', 'non-binary', 'other');
create type public.gender_preference as enum ('everyone', 'women', 'men', 'non-binary');
create type public.interest_status as enum ('pending', 'accepted', 'declined', 'withdrawn');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  age smallint check (age between 18 and 100),
  gender public.gender_identity,
  city text,
  occupation text,
  education text,
  height text,
  bio text,
  photo_urls text[] not null default '{}',
  interests text[] not null default '{}',
  hobbies text[] not null default '{}',
  lifestyle text[] not null default '{}',
  music text,
  relationship_goal text,
  preferred_gender public.gender_preference not null default 'everyone',
  min_age smallint not null default 18 check (min_age >= 18),
  max_age smallint not null default 100 check (max_age <= 100 and max_age >= min_age),
  personality jsonb not null default '{}'::jsonb,
  is_complete boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status public.interest_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> recipient_id),
  unique (sender_id, recipient_id)
);

create table public.selected_profiles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id),
  check (user_id <> profile_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_one uuid not null references public.profiles(id) on delete cascade,
  user_two uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_one < user_two),
  unique (user_one, user_two)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('interest', 'match', 'message')),
  entity_id uuid,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index interests_recipient_status_idx on public.interests(recipient_id, status, created_at desc);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger interests_touch_updated_at before update on public.interests
for each row execute function public.touch_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger auth_user_profile after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- Profiles are visible only when both people satisfy each other's declared preferences.
create or replace function public.discover_profiles()
returns setof public.profiles
language sql stable security definer set search_path = '' as $$
  select candidate.*
  from public.profiles viewer
  join public.profiles candidate on candidate.id <> viewer.id
  where viewer.id = (select auth.uid())
    and viewer.is_complete and viewer.is_visible
    and candidate.is_complete and candidate.is_visible
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
  order by
    (select count(*) from unnest(candidate.interests) candidate_interest where candidate_interest = any(viewer.interests)) desc,
    (select count(*) from jsonb_each_text(viewer.personality) viewer_answer
      join jsonb_each_text(candidate.personality) candidate_answer using (key)
      where viewer_answer.value = candidate_answer.value) desc,
    candidate.created_at desc;
$$;
revoke all on function public.discover_profiles() from public;
grant execute on function public.discover_profiles() to authenticated;

-- Accepting the reciprocal interest atomically creates a match and its conversation.
create or replace function public.respond_to_interest(interest_id uuid, accept boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  incoming public.interests;
  match_uuid uuid;
  low_user uuid;
  high_user uuid;
begin
  select * into incoming from public.interests
    where id = interest_id and recipient_id = current_user_id and status = 'pending'
    for update;
  if not found then raise exception 'Interest not found'; end if;

  update public.interests set status = case when accept then 'accepted'::public.interest_status else 'declined'::public.interest_status end
    where id = incoming.id;
  if not accept then return null; end if;

  low_user := least(incoming.sender_id, incoming.recipient_id);
  high_user := greatest(incoming.sender_id, incoming.recipient_id);
  insert into public.matches(user_one, user_two) values (low_user, high_user)
    on conflict (user_one, user_two) do update set user_one = excluded.user_one
    returning id into match_uuid;
  insert into public.conversations(match_id) values (match_uuid) on conflict (match_id) do nothing;
  insert into public.notifications(user_id, actor_id, kind, entity_id, body)
    values (incoming.sender_id, current_user_id, 'match', match_uuid, 'Your interest was accepted. You can now chat.');
  return match_uuid;
end;
$$;
revoke all on function public.respond_to_interest(uuid, boolean) from public;
grant execute on function public.respond_to_interest(uuid, boolean) to authenticated;

alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.selected_profiles enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

create policy "Users can read their own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Users can read eligible candidate profiles" on public.profiles for select to authenticated using (
  id <> (select auth.uid()) and is_complete and is_visible
  and (
    exists (select 1 from public.discover_profiles() d where d.id = profiles.id)
    or exists (select 1 from public.interests i where
      (i.sender_id = (select auth.uid()) and i.recipient_id = profiles.id)
      or (i.recipient_id = (select auth.uid()) and i.sender_id = profiles.id))
    or exists (select 1 from public.matches m where
      (m.user_one = (select auth.uid()) and m.user_two = profiles.id)
      or (m.user_two = (select auth.uid()) and m.user_one = profiles.id))
  )
);
create policy "Users can create their profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "Users can update their profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Participants can view interests" on public.interests for select to authenticated using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy "Users can send an interest to an eligible person" on public.interests for insert to authenticated with check (
  sender_id = (select auth.uid()) and exists (select 1 from public.discover_profiles() d where d.id = recipient_id)
);

create policy "Users can view their selected profiles" on public.selected_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "Users can select eligible profiles" on public.selected_profiles for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (select 1 from public.discover_profiles() d where d.id = profile_id)
);
create policy "Users can remove their selections" on public.selected_profiles for delete to authenticated using (user_id = (select auth.uid()));
create policy "Match participants can read matches" on public.matches for select to authenticated using (user_one = (select auth.uid()) or user_two = (select auth.uid()));
create policy "Participants can read conversations" on public.conversations for select to authenticated using (exists (
  select 1 from public.matches m where m.id = match_id and (m.user_one = (select auth.uid()) or m.user_two = (select auth.uid()))
));
create policy "Participants can read messages" on public.messages for select to authenticated using (exists (
  select 1 from public.conversations c join public.matches m on m.id = c.match_id
  where c.id = conversation_id and (m.user_one = (select auth.uid()) or m.user_two = (select auth.uid()))
));
create policy "Participants can send messages" on public.messages for insert to authenticated with check (
  sender_id = (select auth.uid()) and exists (
    select 1 from public.conversations c join public.matches m on m.id = c.match_id
    where c.id = conversation_id and (m.user_one = (select auth.uid()) or m.user_two = (select auth.uid()))
  )
);
create policy "Users can read own notifications" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "Users can mark own notifications read" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create or replace function public.notify_new_interest()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications(user_id, actor_id, kind, entity_id, body)
  values (new.recipient_id, new.sender_id, 'interest', new.id, 'Someone sent you an interest.');
  return new;
end;
$$;
create trigger interest_notification after insert on public.interests
for each row execute function public.notify_new_interest();

-- Message notification records are created transactionally with the message.
create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = '' as $$
declare recipient uuid;
begin
  select case when m.user_one = new.sender_id then m.user_two else m.user_one end into recipient
  from public.conversations c join public.matches m on m.id = c.match_id
  where c.id = new.conversation_id;
  insert into public.notifications(user_id, actor_id, kind, entity_id, body)
  values (recipient, new.sender_id, 'message', new.id, 'You have a new message.');
  return new;
end;
$$;
create trigger message_notification after insert on public.messages
for each row execute function public.notify_new_message();

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
create policy "Anyone can view profile photos" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload their own profile photos" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can update their own profile photos" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can delete their own profile photos" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
