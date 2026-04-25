create or replace function public.users_with_incomplete_loe(
  p_month_start date,
  p_month_end date,
  p_expected_hours integer
)
returns table (
  user_id uuid,
  missing_days integer,
  missing_hours integer
)
language sql
security definer
set search_path = public
as $$
  with month_logs as (
    select
      tl.user_id,
      coalesce(sum(tl.hours), 0)::integer as logged_hours
    from public.time_logs tl
    where tl.log_date >= p_month_start
      and tl.log_date <= p_month_end
    group by tl.user_id
  )
  select
    p.id as user_id,
    greatest(ceil((p_expected_hours - coalesce(ml.logged_hours, 0)) / 8.0), 0)::integer as missing_days,
    greatest(p_expected_hours - coalesce(ml.logged_hours, 0), 0)::integer as missing_hours
  from public.profiles p
  left join month_logs ml on ml.user_id = p.id
  where greatest(p_expected_hours - coalesce(ml.logged_hours, 0), 0) > 0;
$$;
