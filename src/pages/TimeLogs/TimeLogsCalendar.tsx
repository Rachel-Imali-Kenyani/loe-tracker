import { useMemo } from "react";
import { Card, Tooltip } from "antd";
import { formatDateStr, isWorkDay } from "./dateUtils";
import type { TimeLogRecord } from "../../services/types";

interface TimeLogsCalendarProps {
  year: number;
  month: number;
  logs: TimeLogRecord[];
  selectedDate: Date;
  firstIncompleteDate: Date;
  holidayMap: Map<string, string>;
  onDateSelect: (date: Date) => void;
  onLogEdit: (
    event: React.MouseEvent<HTMLDivElement>,
    log: TimeLogRecord,
  ) => void;
}

export function TimeLogsCalendar({
  year,
  month,
  logs,
  selectedDate,
  firstIncompleteDate,
  holidayMap,
  onDateSelect,
  onLogEdit,
}: TimeLogsCalendarProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    while (days.length < 42) {
      days.push(null);
    }
    return days;
  }, [daysInMonth, startOffset]);

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year === selectedDate.getFullYear();

  return (
    <Card className="mb-8">
      <div className="grid grid-cols-7 border-b border-outline-variant">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
          <div
            key={day}
            className="p-4 text-center text-xs text-on-surface-variant tracking-wider border-r border-outline-variant last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[120px] border-r border-b border-outline-variant last:border-r-0"
              />
            );
          }

          const dateStr = formatDateStr(year, month, day);
          const dayLogs = logs.filter((log) => log.date === dateStr);
          const isSelectedDay = isSelected(day);
          const isTodayDay = isToday(day);
          const dayDate = new Date(year, month, day);
          const isHoliday = holidayMap.has(dateStr);
          const holidayName = holidayMap.get(dateStr);
          const isWeekend = !isWorkDay(dayDate);
          const isAfterFirstIncomplete = dayDate > firstIncompleteDate;
          const isLockedDay =
            !isWeekend && !isHoliday && isAfterFirstIncomplete;

          return (
            <Tooltip
              key={day}
              title={
                isWeekend
                  ? "Weekends cannot be edited"
                  : isHoliday
                    ? `Holiday: ${holidayName ?? "National holiday"}`
                    : isLockedDay
                      ? "Complete earlier work days first"
                      : undefined
              }
            >
              <div
                className={`min-h-[120px] p-2 border-r border-b border-outline-variant last:border-r-0 cursor-pointer transition-colors ${
                  isSelectedDay
                    ? "bg-primary/10 border-primary"
                    : isTodayDay
                      ? "bg-secondary/10"
                      : isHoliday
                        ? "bg-surface-container"
                        : isWeekend
                          ? "bg-surface-container opacity-50"
                          : isLockedDay
                            ? "bg-error/5"
                            : "hover:bg-surface-container"
                }`}
                onClick={() =>
                  !isLockedDay && onDateSelect(new Date(year, month, day))
                }
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isSelectedDay
                        ? "text-primary"
                        : isTodayDay
                          ? "text-secondary"
                          : isHoliday
                            ? "text-on-surface-variant"
                            : isWeekend
                              ? "text-on-surface-variant opacity-50"
                              : "text-on-surface"
                    }`}
                  >
                    {day}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                        log.isTimeOff
                          ? "bg-secondary/20 text-secondary hover:bg-secondary/30"
                          : log.category === "MEETINGS"
                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                            : "bg-surface-container text-on-surface hover:bg-surface-container-hover"
                      }`}
                      onClick={(event) => onLogEdit(event, log)}
                    >
                      <div className="font-medium truncate">
                        {log.isTimeOff
                          ? "TIME-OFF"
                          : log.category === "MEETINGS"
                            ? "MEETINGS"
                            : log.project || "PROJECT WORK"}
                      </div>
                      <div className="text-[0.65rem] opacity-75">
                        {log.hours}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </Card>
  );
}
