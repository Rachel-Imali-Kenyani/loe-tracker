export type Category = 'PROJECT WORK' | 'MEETINGS' | 'TIME-OFF';
export type NotificationType = 'REMINDER' | 'PROJECT_ADDED' | 'PROJECT_REMOVED';

export type AllocationSummary = {
  id: string;
  projectId: string;
  projectName: string;
  loePercent: number;
  startDate: string;
};

export type ProjectOption = {
  allocationId: string;
  projectId: string;
  name: string;
};

export type TimeLogRecord = {
  id: string;
  date: string;
  project: string;
  projectId: string | null;
  category: Category;
  hours: number;
  isTimeOff: boolean;
};

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  unread: boolean;
  createdAt: string;
};

export type SettingsRecord = {
  fullName: string;
  email: string;
  country: string;
  emailAlerts: boolean;
  weeklyDigest: boolean;
};
