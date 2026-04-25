import type { TimeLogRecord } from "../../services/types";
import { formatDateStr, getLoggedHoursForDate, isWorkDay } from "./dateUtils";

export function getDisplayProject(log: TimeLogRecord) {
  if (log.isTimeOff) {
    return "TIME-OFF";
  }

  if (log.category === "MEETINGS") {
    return "MEETINGS";
  }

  return log.project;
}

export function calculateIncompleteDays(
  logs: TimeLogRecord[],
  year: number,
  month: number,
  holidayMap: Map<string, string>,
) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const missingDays = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateStr(year, month, day);
    if (!isWorkDay(date) || holidayMap.has(dateStr)) {
      continue;
    }

    const hoursLogged = getLoggedHoursForDate(logs, dateStr);

    if (hoursLogged < 8) {
      missingDays.push(day);
    }
  }

  return missingDays;
}

export function calculateWorkDays(
  year: number,
  month: number,
  holidayMap: Map<string, string>,
) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateStr(year, month, day);
    const dayOfWeek = date.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayMap.has(dateStr)) {
      count += 1;
    }
  }

  return count;
}

export function calculateQuickStats(logs: TimeLogRecord[]) {
  const grouped = new Map<string, number>();

  logs.forEach((log) => {
    const key = getDisplayProject(log);
    grouped.set(key, (grouped.get(key) ?? 0) + log.hours);
  });

  return [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
}
