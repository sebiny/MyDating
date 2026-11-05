-- Free plan: 100 welcome credits, +20 UTC daily, capped at 100; 20 profiles per 100 credits.
alter table public.profiles
  add column if not exists appearance text[] not null default '{}',
  add column if not exists personality_tags text[] not null default '{}',
  add column if not exists preferred_appearance text[] not null default '{}',
  add column if not exists preferred_personality text[] not null default '{}',
  add column if not exists preferred_dating_style text[] not null default '{}',
  add column if not exists dating_style text[] not null default '{}';

alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in ('interest','match','message','ideal'));

-- Backfill legacy wallets that never received their one-time welcome grant.
insert into public.credit_wallets(user_id,balance,last_daily_grant_on)
select id,100,(now() at time zone 'UTC')::date from auth.users on conflict(user_id) do nothing;
update public.credit_wallets w set balance=least(100,w.balance+100)
where not exists(select 1 from public.credit_transactions t where t.user_id=w.user_id and t.reason='welcome');
insert into public.credit_transactions(user_id,amount,reason)
select w.user_id,100,'welcome' from public.credit_wallets w
where not exists(select 1 from public.credit_transactions t where t.user_id=w.user_id and t.reason='welcome');

create or replace function public.get_discovery_credits()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); wallet public.credit_wallets; inserted integer; today date := (now() at time zone 'UTC')::date;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 insert into public.credit_wallets(user_id,balance,last_daily_grant_on) values(uid,100,today) on conflict(user_id) do nothing;
 get diagnostics inserted = row_count;
 if inserted=1 then insert into public.credit_transactions(user_id,amount,reason) values(uid,100,'welcome'); end if;
 select * into wallet from public.credit_wallets where user_id=uid for update;
 if wallet.last_daily_grant_on<today then
  update public.credit_wallets set balance=least(100,balance+20),last_daily_grant_on=today where user_id=uid returning * into wallet;
  insert into public.credit_transactions(user_id,amount,reason) values(uid,20,'daily');
 end if;
 return jsonb_build_object('balance',wallet.balance,'daily_credits',20,'credit_cap',100,'page_cost',100,'profiles_per_page',20,'last_daily_grant_on',wallet.last_daily_grant_on);
end; $$;

-- The existing RPC remains the sole path that returns revealed profiles and charges for pages.
create or replace function public.get_curated_page(p_page_number integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); wallet public.credit_wallets; rows jsonb; more boolean; unlocked boolean; offset_rows integer;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if p_page_number<0 or p_page_number>10000 then raise exception 'Invalid page'; end if;
 if p_page_number>1 and not exists(select 1 from public.discovery_page_unlocks where user_id=uid and page_number=p_page_number-1) then raise exception 'PREVIOUS_PAGE_LOCKED'; end if;
 perform public.get_discovery_credits(); select * into wallet from public.credit_wallets where user_id=uid for update; offset_rows:=p_page_number*20;
 with viewer as (select * from public.profiles where id=uid and is_complete and is_visible), candidates as (
  select c.*,
   (select count(*)::int from unnest(v.preferred_appearance) x where x=any(c.appearance)) as a,
   (select count(*)::int from unnest(v.preferred_personality) x where x=any(c.personality_tags)) as p,
   (select count(*)::int from unnest(v.preferred_dating_style) x where x=any(c.dating_style)) as d,
   cardinality(v.preferred_appearance)+cardinality(v.preferred_personality)+cardinality(v.preferred_dating_style) as total,
   (select count(*)::int from unnest(c.interests) x where x=any(v.interests)) as shared
  from viewer v join public.profiles c on c.id<>v.id
  where c.is_complete and c.is_visible and c.age between v.min_age and v.max_age and v.age between c.min_age and c.max_age
   and (v.preferred_gender='everyone' or (v.preferred_gender='women' and c.gender='woman') or (v.preferred_gender='men' and c.gender='man') or (v.preferred_gender='non-binary' and c.gender='non-binary'))
   and (c.preferred_gender='everyone' or (c.preferred_gender='women' and v.gender='woman') or (c.preferred_gender='men' and v.gender='man') or (c.preferred_gender='non-binary' and v.gender='non-binary'))
   and not exists(select 1 from public.interests i where (i.sender_id=v.id and i.recipient_id=c.id) or (i.sender_id=c.id and i.recipient_id=v.id))
 ), ranked as (
  select *,case when total=0 then 0 else round((a+p+d)*100.0/total)::int end as pct,
   row_number() over(order by (case when total=0 then 0 else (a+p+d)*100.0/total end) desc,shared desc,created_at desc,id desc) rn,count(*) over() cnt
  from candidates where total=0 or (a+p+d)*100.0/total>=60
 ), page as(select * from ranked where rn>offset_rows and rn<=offset_rows+20)
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'display_name',display_name,'age',age,'bio',bio,'photo_urls',photo_urls,'occupation',occupation,'city',city,'interests',interests,'match_percent',pct) order by rn),'[]'::jsonb),coalesce((select max(cnt)>offset_rows+20 from ranked),false) into rows,more from page;
 if p_page_number>0 and jsonb_array_length(rows)>0 then
  select exists(select 1 from public.discovery_page_unlocks where user_id=uid and page_number=p_page_number) into unlocked;
  if not unlocked then
   if wallet.balance<100 then return jsonb_build_object('profiles','[]'::jsonb,'has_more',more,'page',p_page_number,'balance',wallet.balance,'insufficient_credits',true); end if;
   update public.credit_wallets set balance=balance-100 where user_id=uid returning * into wallet;
   insert into public.discovery_page_unlocks(user_id,page_number) values(uid,p_page_number);
   insert into public.credit_transactions(user_id,amount,reason,page_number) values(uid,-100,'page_unlock',p_page_number);
  end if;
 end if;
 insert into public.discovery_visible_profiles(user_id,profile_id,page_number) select uid,(x.value->>'id')::uuid,p_page_number from jsonb_array_elements(rows) x(value) on conflict do nothing;
 insert into public.notifications(user_id,actor_id,kind,entity_id,body)
 select uid,(x.value->>'id')::uuid,'ideal',(x.value->>'id')::uuid,'Your perfect ideal type just appeared to you. Send them a message to discover the vibe!'
 from jsonb_array_elements(rows) x(value) where (x.value->>'match_percent')::int>=80 and not exists(select 1 from public.notifications n where n.user_id=uid and n.kind='ideal' and n.entity_id=(x.value->>'id')::uuid and n.body like 'Your perfect ideal type%');
 return jsonb_build_object('profiles',rows,'has_more',more,'page',p_page_number,'balance',wallet.balance);
end; $$;
revoke all on function public.get_curated_page(integer) from public;
grant execute on function public.get_curated_page(integer) to authenticated;


