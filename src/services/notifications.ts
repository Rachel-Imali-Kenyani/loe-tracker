import { supabase } from '../lib/supabase';
import type { NotificationRecord, NotificationType } from './types';

type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<NotificationRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (row): NotificationRecord => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      unread: !row.read,
      createdAt: row.created_at,
    }),
  );
}

export async function markNotificationsRead(notificationIds: string[]) {
  if (notificationIds.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .in('id', notificationIds);

  if (error) {
    throw error;
  }
}
