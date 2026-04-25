# Supabase Automation

This repo now includes backend notification automation scaffolding:

- `migrations/202604250215_notifications_automation.sql`
  - creates notification helper functions
  - inserts `PROJECT_ADDED` notifications when `project_allocations` rows are inserted
  - inserts `PROJECT_REMOVED` notifications when `project_allocations.end_date` changes from `null` to a real date
- `migrations/202604250220_loe_reminder_rpc.sql`
  - creates `public.users_with_incomplete_loe(...)` for reminder targeting
- `migrations/202604250330_add_profile_country.sql`
  - adds `country` column to `profiles` table for holiday lookups
- `migrations/202604250340_add_kenya_april_holidays.sql`
  - inserts time-off entries for Kenyan national holidays (April 4th and 6th, 2026)
- `functions/send-loe-reminders/index.ts`
  - scheduled Edge Function that inserts `REMINDER` notifications for users with incomplete LoE
- `seed.sql`
  - inserts starter projects
  - upserts Rachel and David profile/settings rows from `auth.users`
  - inserts suggested allocations for both users
  - inserts current-month sample time logs for both users

## Assumptions

These files assume the following tables/columns already exist:

- `projects(id, name)`
- `project_allocations(id, user_id, project_id, start_date, end_date)`
- `time_logs(user_id, log_date, hours)`
- `notifications(user_id, type, title, message, read)`
- `profiles(id, email)`

The automation migration also adds:

- `notifications.source_key`
- `notifications.metadata`

## Apply Migrations

If you are using the Supabase CLI:

```bash
supabase db push
```

Or run the SQL files manually in the Supabase SQL editor in this order:

1. `202604250215_notifications_automation.sql`
2. `202604250220_loe_reminder_rpc.sql`
3. `202604250330_add_profile_country.sql`
4. `202604250340_add_kenya_april_holidays.sql`
5. `seed.sql`

## Deploy Reminder Function

```bash
supabase functions deploy send-loe-reminders
```

Set the required secrets in Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Schedule Reminders

Create a scheduled job in Supabase to call the function daily or on your preferred cadence. A typical pattern is once each weekday afternoon.

The function is idempotent per user/day because it writes notifications with a unique `source_key`.
