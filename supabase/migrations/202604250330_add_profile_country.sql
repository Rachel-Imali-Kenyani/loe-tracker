-- Add a country code to the profiles table so national holiday lookups can be associated with each user.

alter table public.profiles
  add column if not exists country text;
