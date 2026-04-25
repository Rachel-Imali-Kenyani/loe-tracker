import type { TimeLogRecord } from "../../services/types";

export function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatMonthBoundary(date: Date, boundary: "start" | "end") {
  const year = date.getFullYear();
  const month = date.getMonth();

  if (boundary === "start") {
    return formatDateStr(year, month, 1);
  }

  return formatDateStr(year, month, new Date(year, month + 1, 0).getDate());
}

export function isWorkDay(date: Date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

export function getLoggedHoursForDate(logs: TimeLogRecord[], dateStr: string) {
  return logs
    .filter((log) => log.date === dateStr)
    .reduce((sum, log) => sum + log.hours, 0);
}

export function getFirstIncompleteWorkDay(
  logs: TimeLogRecord[],
  year: number,
  month: number,
  holidayDates: string[] = [],
) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let firstWorkDay: Date | null = null;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateStr(year, month, day);

    if (!isWorkDay(date) || holidayDates.includes(dateStr)) {
      continue;
    }

    if (!firstWorkDay) {
      firstWorkDay = date;
    }

    const hoursLogged = getLoggedHoursForDate(logs, dateStr);

    if (hoursLogged < 8) {
      return date;
    }
  }

  return firstWorkDay ?? new Date(year, month, 1);
}
