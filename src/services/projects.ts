import { supabase } from '../lib/supabase';
import type { AllocationSummary, ProjectOption } from './types';

type AllocationRow = {
  id: string;
  loe_percent: number;
  start_date: string;
  projects: {
    id: string;
    name: string;
  } | null;
};

export async function getDashboardAllocations(userId: string) {
  const { data, error } = await supabase
    .from('project_allocations')
    .select('id, loe_percent, start_date, projects:project_id ( id, name )')
    .eq('user_id', userId)
    .is('end_date', null)
    .order('start_date', { ascending: true })
    .returns<AllocationRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row) => row.projects)
    .map((row): AllocationSummary => ({
      id: row.id,
      projectId: row.projects!.id,
      projectName: row.projects!.name,
      loePercent: row.loe_percent,
      startDate: row.start_date,
    }));
}

export async function getActiveProjects(userId: string) {
  const allocations = await getDashboardAllocations(userId);

  return allocations.map(
    (allocation): ProjectOption => ({
      allocationId: allocation.id,
      projectId: allocation.projectId,
      name: allocation.projectName,
    }),
  );
}
