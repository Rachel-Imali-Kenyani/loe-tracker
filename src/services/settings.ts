import { supabase } from '../lib/supabase';
import type { SettingsRecord } from './types';

type ProfileRow = {
  full_name: string | null;
};

type UserSettingsRow = {
  email_alerts: boolean | null;
  weekly_digest: boolean | null;
};

export async function getSettings(userId: string, email: string) {
  const [{ data: profile, error: profileError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle<ProfileRow>(),
    supabase
      .from('user_settings')
      .select('email_alerts, weekly_digest')
      .eq('user_id', userId)
      .maybeSingle<UserSettingsRow>(),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (settingsError) {
    throw settingsError;
  }

  return {
    record: {
      fullName: profile?.full_name ?? '',
      email,
      emailAlerts: settings?.email_alerts ?? true,
      weeklyDigest: settings?.weekly_digest ?? true,
    },
    isEmpty: !profile && !settings,
  };
}

export async function updateSettings(userId: string, settings: SettingsRecord) {
  const [{ error: profileError }, { error: settingsError }] = await Promise.all([
    supabase.from('profiles').upsert(
      {
        id: userId,
        full_name: settings.fullName,
        email: settings.email,
      },
      { onConflict: 'id' },
    ),
    supabase.from('user_settings').upsert(
      {
        user_id: userId,
        email_alerts: settings.emailAlerts,
        weekly_digest: settings.weeklyDigest,
      },
      { onConflict: 'user_id' },
    ),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (settingsError) {
    throw settingsError;
  }
}
