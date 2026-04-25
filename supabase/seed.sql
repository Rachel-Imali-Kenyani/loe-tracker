-- Seed data for local/dev Supabase environments.
-- Run this in the Supabase SQL editor or with `supabase db reset`.
--
-- Assumptions:
-- - The auth users already exist in auth.users with emails:
--   - rachel.kenyani@pixeledge.io
--   - david.mutiso@pixeledge.io
-- - Tables exist:
--   public.projects(id, name, code, active)
--   public.profiles(id, email, full_name)
--   public.project_allocations(id, user_id, project_id, loe_percent, start_date, end_date)
--   public.user_settings(user_id, email_alerts, weekly_digest)
--   public.time_logs(id, user_id, project_id, log_date, category, hours, is_time_off)

begin;

with project_seed(name, code, active) as (
  values
    ('BDC', 'PROJ-FIN-104', true),
    ('ERM Assess', 'PROJ-ERM-009', true),
    ('ML Dashboard', 'PROJ-ML-201', true),
    ('LoanEdge', 'PROJ-LED-301', true),
    ('Company Website', 'PROJ-WEB-011', true),
    ('HSF', 'PROJ-HSF-021', true)
)
insert into public.projects (id, name, code, active)
select gen_random_uuid(), ps.name, ps.code, ps.active
from project_seed ps
where not exists (
  select 1
  from public.projects p
  where p.code = ps.code
);

with auth_user as (
  select id, email
  from auth.users
  where email = 'rachel.kenyani@pixeledge.io'
)
insert into public.profiles (id, email, full_name, country)
select au.id, au.email, 'Rachel Kenyani', 'KE'
from auth_user au
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  country = excluded.country;

with auth_user as (
  select id, email
  from auth.users
  where email = 'david.mutiso@pixeledge.io'
)
insert into public.profiles (id, email, full_name, country)
select au.id, au.email, 'David Mutiso', 'US'
from auth_user au
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  country = excluded.country;

with auth_user as (
  select id
  from auth.users
  where email = 'rachel.kenyani@pixeledge.io'
)
insert into public.user_settings (user_id, email_alerts, weekly_digest)
select au.id, true, true
from auth_user au
on conflict (user_id) do update
set
  email_alerts = excluded.email_alerts,
  weekly_digest = excluded.weekly_digest;

with auth_user as (
  select id
  from auth.users
  where email = 'david.mutiso@pixeledge.io'
)
insert into public.user_settings (user_id, email_alerts, weekly_digest)
select au.id, false, true
from auth_user au
on conflict (user_id) do update
set
  email_alerts = excluded.email_alerts,
  weekly_digest = excluded.weekly_digest;

-- Suggested allocations for Rachel:
-- - BDC: primary project
-- - ERM Assess: secondary project
-- - HSF: smaller ongoing allocation
-- - Company Website: ended allocation to exercise removal notifications/history
with auth_user as (
  select id
  from auth.users
  where email = 'rachel.kenyani@pixeledge.io'
),
allocation_seed(project_code, loe_percent, start_date, end_date) as (
  values
    ('PROJ-FIN-104', 40, current_date - interval '90 days', null),
    ('PROJ-ERM-009', 25, current_date - interval '60 days', null),
    ('PROJ-HSF-021', 20, current_date - interval '21 days', null),
    ('PROJ-WEB-011', 15, current_date - interval '120 days', current_date - interval '14 days')
)
insert into public.project_allocations (id, user_id, project_id, loe_percent, start_date, end_date)
select
  gen_random_uuid(),
  au.id,
  p.id,
  seed.loe_percent,
  seed.start_date::date,
  seed.end_date::date
from allocation_seed seed
join public.projects p on p.code = seed.project_code
cross join auth_user au
where not exists (
  select 1
  from public.project_allocations pa
  where pa.user_id = au.id
    and pa.project_id = p.id
    and pa.start_date = seed.start_date::date
);

-- Suggested allocations for David:
-- - ML Dashboard: primary build stream
-- - LoanEdge: secondary delivery track
-- - HSF: advisory allocation
with auth_user as (
  select id
  from auth.users
  where email = 'david.mutiso@pixeledge.io'
),
allocation_seed(project_code, loe_percent, start_date, end_date) as (
  values
    ('PROJ-ML-201', 45, current_date - interval '75 days', null),
    ('PROJ-LED-301', 35, current_date - interval '40 days', null),
    ('PROJ-HSF-021', 20, current_date - interval '14 days', null)
)
insert into public.project_allocations (id, user_id, project_id, loe_percent, start_date, end_date)
select
  gen_random_uuid(),
  au.id,
  p.id,
  seed.loe_percent,
  seed.start_date::date,
  seed.end_date::date
from allocation_seed seed
join public.projects p on p.code = seed.project_code
cross join auth_user au
where not exists (
  select 1
  from public.project_allocations pa
  where pa.user_id = au.id
    and pa.project_id = p.id
    and pa.start_date = seed.start_date::date
);

-- Rachel current-month logs:
-- - weekdays only
-- - mostly BDC / ERM Assess / HSF
-- - includes meetings and one time-off day
with auth_user as (
  select id
  from auth.users
  where email = 'rachel.kenyani@pixeledge.io'
),
project_lookup as (
  select id, code
  from public.projects
  where code in ('PROJ-FIN-104', 'PROJ-ERM-009', 'PROJ-HSF-021')
),
workdays as (
  select day::date as log_date
  from generate_series(
    date_trunc('month', current_date)::date,
    least(current_date, (date_trunc('month', current_date) + interval '13 days')::date),
    interval '1 day'
  ) day
  where extract(isodow from day) < 6
),
time_log_seed as (
  select
    wd.log_date,
    case
      when extract(day from wd.log_date)::int = 5 then 'TIME-OFF'
      when extract(day from wd.log_date)::int % 4 = 0 then 'MEETINGS'
      when extract(day from wd.log_date)::int % 3 = 0 then 'PROJ-ERM-009'
      when extract(day from wd.log_date)::int % 5 = 0 then 'PROJ-HSF-021'
      else 'PROJ-FIN-104'
    end as slot_a,
    case
      when extract(day from wd.log_date)::int = 5 then null
      when extract(day from wd.log_date)::int % 4 = 0 then 'PROJ-FIN-104'
      when extract(day from wd.log_date)::int % 3 = 0 then 'MEETINGS'
      when extract(day from wd.log_date)::int % 5 = 0 then 'PROJ-ERM-009'
      else 'MEETINGS'
    end as slot_b
  from workdays wd
),
expanded_logs as (
  select
    tls.log_date,
    tls.slot_a as slot_name,
    case when tls.slot_a = 'TIME-OFF' then 8::numeric else 6::numeric end as hours
  from time_log_seed tls
  union all
  select
    tls.log_date,
    tls.slot_b as slot_name,
    2::numeric as hours
  from time_log_seed tls
  where tls.slot_b is not null
),
resolved_logs as (
  select
    el.log_date,
    case
      when el.slot_name = 'TIME-OFF' then null
      when el.slot_name = 'MEETINGS' then null
      else pl.id
    end as project_id,
    case
      when el.slot_name = 'TIME-OFF' then 'TIME-OFF'
      when el.slot_name = 'MEETINGS' then 'MEETINGS'
      else 'PROJECT WORK'
    end as category,
    el.hours,
    (el.slot_name = 'TIME-OFF') as is_time_off
  from expanded_logs el
  left join project_lookup pl on pl.code = el.slot_name
)
insert into public.time_logs (id, user_id, project_id, log_date, category, hours, is_time_off)
select
  gen_random_uuid(),
  au.id,
  rl.project_id,
  rl.log_date,
  rl.category,
  rl.hours,
  rl.is_time_off
from resolved_logs rl
cross join auth_user au
where not exists (
  select 1
  from public.time_logs tl
  where tl.user_id = au.id
    and tl.log_date = rl.log_date
    and coalesce(tl.project_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(rl.project_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and tl.category = rl.category
    and tl.hours = rl.hours
);

-- Rachel holiday time-off entries for April 2026
-- April 4th: Good Friday, April 6th: Easter Monday
insert into public.time_logs (id, user_id, project_id, log_date, category, hours, is_time_off)
select
  gen_random_uuid(),
  au.id,
  null,
  holiday_date,
  'TIME-OFF',
  8,
  true
from (
  select id
  from auth.users
  where email = 'rachel.kenyani@pixeledge.io'
) au
cross join (
  values
    ('2026-04-04'::date),
    ('2026-04-06'::date)
) as holidays(holiday_date)
where not exists (
  select 1
  from public.time_logs tl
  where tl.user_id = au.id
    and tl.log_date = holiday_date
);

-- David current-month logs:
-- - weekdays only
-- - mostly ML Dashboard / LoanEdge / HSF
-- - includes meetings and one time-off day
with auth_user as (
  select id
  from auth.users
  where email = 'david.mutiso@pixeledge.io'
),
project_lookup as (
  select id, code
  from public.projects
  where code in ('PROJ-ML-201', 'PROJ-LED-301', 'PROJ-HSF-021')
),
workdays as (
  select day::date as log_date
  from generate_series(
    date_trunc('month', current_date)::date,
    least(current_date, (date_trunc('month', current_date) + interval '11 days')::date),
    interval '1 day'
  ) day
  where extract(isodow from day) < 6
),
time_log_seed as (
  select
    wd.log_date,
    case
      when extract(day from wd.log_date)::int = 4 then 'TIME-OFF'
      when extract(day from wd.log_date)::int % 2 = 0 then 'PROJ-ML-201'
      when extract(day from wd.log_date)::int % 3 = 0 then 'PROJ-LED-301'
      else 'PROJ-HSF-021'
    end as slot_a,
    case
      when extract(day from wd.log_date)::int = 4 then null
      when extract(day from wd.log_date)::int % 2 = 0 then 'MEETINGS'
      when extract(day from wd.log_date)::int % 3 = 0 then 'PROJ-ML-201'
      else 'MEETINGS'
    end as slot_b
  from workdays wd
),
expanded_logs as (
  select
    tls.log_date,
    tls.slot_a as slot_name,
    case when tls.slot_a = 'TIME-OFF' then 8::numeric else 5.5::numeric end as hours
  from time_log_seed tls
  union all
  select
    tls.log_date,
    tls.slot_b as slot_name,
    2.5::numeric as hours
  from time_log_seed tls
  where tls.slot_b is not null
),
resolved_logs as (
  select
    el.log_date,
    case
      when el.slot_name = 'TIME-OFF' then null
      when el.slot_name = 'MEETINGS' then null
      else pl.id
    end as project_id,
    case
      when el.slot_name = 'TIME-OFF' then 'TIME-OFF'
      when el.slot_name = 'MEETINGS' then 'MEETINGS'
      else 'PROJECT WORK'
    end as category,
    el.hours,
    (el.slot_name = 'TIME-OFF') as is_time_off
  from expanded_logs el
  left join project_lookup pl on pl.code = el.slot_name
)
insert into public.time_logs (id, user_id, project_id, log_date, category, hours, is_time_off)
select
  gen_random_uuid(),
  au.id,
  rl.project_id,
  rl.log_date,
  rl.category,
  rl.hours,
  rl.is_time_off
from resolved_logs rl
cross join auth_user au
where not exists (
  select 1
  from public.time_logs tl
  where tl.user_id = au.id
    and tl.log_date = rl.log_date
    and coalesce(tl.project_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(rl.project_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and tl.category = rl.category
    and tl.hours = rl.hours
);

commit;
