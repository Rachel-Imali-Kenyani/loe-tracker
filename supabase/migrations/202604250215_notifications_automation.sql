create schema if not exists app_private;

alter table if exists public.notifications
  add column if not exists source_key text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists notifications_source_key_idx
  on public.notifications (source_key)
  where source_key is not null;

create or replace function app_private.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_source_key text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    read,
    source_key,
    metadata
  )
  values (
    p_user_id,
    p_type,
    p_title,
    p_message,
    false,
    p_source_key,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (source_key) where source_key is not null do nothing;
end;
$$;

create or replace function public.handle_project_allocation_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_name text;
begin
  select p.name
  into v_project_name
  from public.projects p
  where p.id = new.project_id;

  if v_project_name is null then
    return new;
  end if;

  perform app_private.create_notification(
    new.user_id,
    'PROJECT_ADDED',
    'New project allocation: ' || v_project_name,
    'Resource Management has allocated you to ' || v_project_name || ' effective ' || new.start_date || '.',
    'allocation-added:' || new.id::text,
    jsonb_build_object(
      'allocation_id', new.id,
      'project_id', new.project_id,
      'event', 'project_added'
    )
  );

  return new;
end;
$$;

drop trigger if exists project_allocation_insert_notification on public.project_allocations;

create trigger project_allocation_insert_notification
after insert on public.project_allocations
for each row
execute function public.handle_project_allocation_insert();

create or replace function public.handle_project_allocation_removed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_name text;
begin
  if old.end_date is not null then
    return new;
  end if;

  if new.end_date is null then
    return new;
  end if;

  select p.name
  into v_project_name
  from public.projects p
  where p.id = new.project_id;

  if v_project_name is null then
    return new;
  end if;

  perform app_private.create_notification(
    new.user_id,
    'PROJECT_REMOVED',
    'Project allocation removed: ' || v_project_name,
    'You have been rolled off ' || v_project_name || ' effective ' || new.end_date || '. You no longer need to log hours for this project.',
    'allocation-removed:' || new.id::text || ':' || new.end_date::text,
    jsonb_build_object(
      'allocation_id', new.id,
      'project_id', new.project_id,
      'event', 'project_removed',
      'end_date', new.end_date
    )
  );

  return new;
end;
$$;

drop trigger if exists project_allocation_removed_notification on public.project_allocations;

create trigger project_allocation_removed_notification
after update of end_date on public.project_allocations
for each row
execute function public.handle_project_allocation_removed();
