import { supabase } from '../lib/supabase';
import type { Category, TimeLogRecord } from './types';

type TimeLogRow = {
  id: string;
  log_date: string;
  project_id: string | null;
  category: Category;
  hours: number;
  is_time_off: boolean;
  projects: {
    name: string;
  } | null;
};

export async function getTimeLogsForMonth(userId: string, monthStart: string, monthEnd: string) {
  const { data, error } = await supabase
    .from('time_logs')
    .select('id, log_date, project_id, category, hours, is_time_off, projects:project_id ( name )')
    .eq('user_id', userId)
    .gte('log_date', monthStart)
    .lte('log_date', monthEnd)
    .order('log_date', { ascending: true })
    .returns<TimeLogRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (row): TimeLogRecord => ({
      id: row.id,
      date: row.log_date,
      project: row.is_time_off ? 'TIME-OFF' : row.projects?.name?.toUpperCase() ?? 'OTHERS',
      projectId: row.project_id,
      category: row.category,
      hours: Number(row.hours),
      isTimeOff: row.is_time_off,
    }),
  );
}

export async function createTimeLog(input: {
  userId: string;
  date: string;
  projectId: string | null;
  category: Category;
  hours: number;
  isTimeOff: boolean;
}) {
  const { error } = await supabase.from('time_logs').insert({
    user_id: input.userId,
    log_date: input.date,
    project_id: input.projectId,
    category: input.category,
    hours: input.hours,
    is_time_off: input.isTimeOff,
  });

  if (error) {
    throw error;
  }
}

export async function updateTimeLog(
  logId: string,
  input: {
    date: string;
    projectId: string | null;
    category: Category;
    hours: number;
    isTimeOff: boolean;
  },
) {
  const { error } = await supabase
    .from('time_logs')
    .update({
      log_date: input.date,
      project_id: input.projectId,
      category: input.category,
      hours: input.hours,
      is_time_off: input.isTimeOff,
    })
    .eq('id', logId);

  if (error) {
    throw error;
  }
}

export async function deleteTimeLog(logId: string) {
  const { error } = await supabase.from('time_logs').delete().eq('id', logId);

  if (error) {
    throw error;
  }
}
