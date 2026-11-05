-- Forward migration: use one shared date-style selection and count only activities both profiles chose.
-- Date styles are shared activities, so the same profile field serves both sides of this comparison.

-- This RPC is the backend that builds each user's Discovery page. It returns only profiles that pass the filters below.
create or replace function public.get_curated_page(p_page_number integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
-- uid is the signed-in viewer; wallet tracks credits; rows/more describe the result page; offset_rows selects the requested 20-profile page.
declare uid uuid := (select auth.uid()); wallet public.credit_wallets; rows jsonb; more boolean; unlocked boolean; offset_rows integer;
begin
 -- Never build a discovery list without a signed-in user.
 if uid is null then raise exception 'Authentication required'; end if;
 if p_page_number<0 or p_page_number>10000 then raise exception 'Invalid page'; end if;
 if p_page_number>1 and not exists(select 1 from public.discovery_page_unlocks where user_id=uid and page_number=p_page_number-1) then raise exception 'PREVIOUS_PAGE_LOCKED'; end if;
 -- Grant today's credits if due, lock the wallet row, and calculate where this page starts.
 perform public.get_discovery_credits(); select * into wallet from public.credit_wallets where user_id=uid for update; offset_rows:=p_page_number*20;
 -- viewer is the completed, visible profile for the signed-in user. candidates are possible matches.
 with viewer as (select * from public.profiles where id=uid and is_complete and is_visible), candidates as (
  select c.*,
   -- Count how many of the viewer's preferred appearance, personality, and date-style traits the candidate has.
   (select count(*)::int from unnest(v.preferred_appearance) x where x=any(c.appearance)) as a,
   (select count(*)::int from unnest(v.preferred_personality) x where x=any(c.personality_tags)) as p,
   -- A date activity counts as a match only when both people chose it to do together.
   (select count(*)::int from unnest(v.dating_style) x where x=any(c.dating_style)) as d,
   -- total is the number of traits the viewer selected; it is the denominator for the match percentage.
   cardinality(v.preferred_appearance)+cardinality(v.preferred_personality)+cardinality(v.dating_style) as total
  from viewer v join public.profiles c on c.id<>v.id
  -- Only complete, visible candidates in both users' age ranges can match.
  where c.is_complete and c.is_visible and c.age between v.min_age and v.max_age and v.age between c.min_age and c.max_age
   -- These two rules make gender preferences mutual: each person must fit the other's choice.
   and (v.preferred_gender='everyone' or (v.preferred_gender='women' and c.gender='woman') or (v.preferred_gender='men' and c.gender='man') or (v.preferred_gender='non-binary' and c.gender='non-binary'))
   and (c.preferred_gender='everyone' or (c.preferred_gender='women' and v.gender='woman') or (c.preferred_gender='men' and v.gender='man') or (c.preferred_gender='non-binary' and v.gender='non-binary'))
   -- Do not show someone if either user has already sent an interest to the other.
   and not exists(select 1 from public.interests i where (i.sender_id=v.id and i.recipient_id=c.id) or (i.sender_id=c.id and i.recipient_id=v.id))
 ), ranked as (
  -- Calculate the percentage of selected traits found on the candidate. If the viewer selected none, show everyone with a 0 score.
  select *,case when total=0 then 0 else round((a+p+d)*100.0/total)::int end as pct,
   -- Rank strongest type scores first; use profile age and id as stable tie-breakers.
   row_number() over(order by (case when total=0 then 0 else (a+p+d)*100.0/total end) desc,created_at desc,id desc) rn,count(*) over() cnt
  -- The 20% cutoff keeps the pool broad while the app has relatively few members.
  from candidates where total=0 or (a+p+d)*100.0/total>=20
 ), -- Keep only the 20 profiles for the requested page.
 page as(select * from ranked where rn>offset_rows and rn<=offset_rows+20)
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'display_name',display_name,'age',age,'bio',bio,'photo_urls',photo_urls,'occupation',occupation,'city',city,'interests',interests,'match_percent',pct) order by rn),'[]'::jsonb),coalesce((select max(cnt)>offset_rows+20 from ranked),false) into rows,more from page;
 -- Later pages cost credits, but the first page is free. Do not charge for an empty page.
 if p_page_number>0 and jsonb_array_length(rows)>0 then
  select exists(select 1 from public.discovery_page_unlocks where user_id=uid and page_number=p_page_number) into unlocked;
  if not unlocked then
   if wallet.balance<100 then return jsonb_build_object('profiles','[]'::jsonb,'has_more',more,'page',p_page_number,'balance',wallet.balance,'insufficient_credits',true); end if;
   update public.credit_wallets set balance=balance-100 where user_id=uid returning * into wallet;
   insert into public.discovery_page_unlocks(user_id,page_number) values(uid,p_page_number);
   insert into public.credit_transactions(user_id,amount,reason,page_number) values(uid,-100,'page_unlock',p_page_number);
  end if;
 end if;
 -- Record which profiles have been revealed so the app can enforce who the viewer may contact.
 insert into public.discovery_visible_profiles(user_id,profile_id,page_number) select uid,(x.value->>'id')::uuid,p_page_number from jsonb_array_elements(rows) x(value) on conflict do nothing;
 -- Notify the viewer once when a very strong match (80% or higher) appears.
 insert into public.notifications(user_id,actor_id,kind,entity_id,body)
 select uid,(x.value->>'id')::uuid,'ideal',(x.value->>'id')::uuid,'Your perfect ideal type just appeared to you. Send them a message to discover the vibe!'
 from jsonb_array_elements(rows) x(value) where (x.value->>'match_percent')::int>=80 and not exists(select 1 from public.notifications n where n.user_id=uid and n.kind='ideal' and n.entity_id=(x.value->>'id')::uuid and n.body like 'Your perfect ideal type%');
 -- Return the profiles, paging state, and wallet balance to the app.
 return jsonb_build_object('profiles',rows,'has_more',more,'page',p_page_number,'balance',wallet.balance);
end; $$;
revoke all on function public.get_curated_page(integer) from public;
grant execute on function public.get_curated_page(integer) to authenticated;
