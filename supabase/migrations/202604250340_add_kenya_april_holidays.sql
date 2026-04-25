-- Add time-off entries for Kenyan national holidays in April 2026
-- April 4th: Good Friday
-- April 6th: Easter Monday

insert into public.time_logs (id, user_id, log_date, project_id, category, hours, is_time_off)
select
  gen_random_uuid(),
  p.id as user_id,
  holiday_date,
  null as project_id,
  'TIME-OFF'::text as category,
  8 as hours,
  true as is_time_off
from public.profiles p
cross join (
  values
    ('2026-04-04'::date),
    ('2026-04-06'::date)
) as holidays(holiday_date)
where p.country = 'KE'
  and not exists (
    select 1
    from public.time_logs tl
    where tl.user_id = p.id
      and tl.log_date = holiday_date
  );
