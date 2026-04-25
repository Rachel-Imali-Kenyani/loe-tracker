import type { MouseEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  AlertTriangle,
  LoaderCircle,
  X,
  Calendar,
  Lock,
} from "lucide-react";
import { useAuth } from '../auth/AuthContext';
import {
  getActiveProjects,
} from '../services/projects';
import { createTimeLog, deleteTimeLog, getTimeLogsForMonth, updateTimeLog } from '../services/timeLogs';
import type { Category, ProjectOption, TimeLogRecord } from '../services/types';

const MEETINGS_OPTION = '__meetings__';
const OTHERS_OPTION = '__others__';

type SelectableProject = ProjectOption & {
  value: string;
};

function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatMonthBoundary(date: Date, boundary: 'start' | 'end') {
  const year = date.getFullYear();
  const month = date.getMonth();

  if (boundary === 'start') {
    return formatDateStr(year, month, 1);
  }

  return formatDateStr(year, month, new Date(year, month + 1, 0).getDate());
}

function getDisplayProject(log: TimeLogRecord) {
  if (log.isTimeOff) {
    return 'TIME-OFF';
  }

  if (log.category === 'MEETINGS') {
    return 'MEETINGS';
  }

  return log.project;
}

function isWorkDay(date: Date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

function getLoggedHoursForDate(logs: TimeLogRecord[], dateStr: string) {
  return logs
    .filter((log) => log.date === dateStr)
    .reduce((sum, log) => sum + log.hours, 0);
}

function getFirstIncompleteWorkDay(logs: TimeLogRecord[], year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let firstWorkDay: Date | null = null;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (!isWorkDay(date)) {
      continue;
    }

    if (!firstWorkDay) {
      firstWorkDay = date;
    }

    const dateStr = formatDateStr(year, month, day);
    const hoursLogged = getLoggedHoursForDate(logs, dateStr);

    if (hoursLogged < 8) {
      return date;
    }
  }

  return firstWorkDay ?? new Date(year, month, 1);
}

export function TimeLogs() {
  const { userId } = useAuth();
  const selectedCellRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return getFirstIncompleteWorkDay([], today.getFullYear(), today.getMonth());
  });
  const [selectedProject, setSelectedProject] = useState<string>(OTHERS_OPTION);
  const [hours, setHours] = useState<number | string>(8);
  const [isTimeOff, setIsTimeOff] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logs, setLogs] = useState<TimeLogRecord[]>([]);
  const [projects, setProjects] = useState<SelectableProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    if (selectedCellRef.current) {
      window.setTimeout(() => {
        selectedCellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [selectedDate, currentDate]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadProjects = async () => {
      try {
        const activeProjects = await getActiveProjects(userId);
        setProjects([
          ...activeProjects.map((project) => ({
            ...project,
            value: project.projectId,
          })),
          { allocationId: MEETINGS_OPTION, projectId: '', name: 'Meetings', value: MEETINGS_OPTION },
          { allocationId: OTHERS_OPTION, projectId: '', name: 'Others', value: OTHERS_OPTION },
        ]);
      } catch (error) {
        setQueryError(error instanceof Error ? error.message : 'Unable to load active projects.');
      }
    };

    void loadProjects();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadTimeLogs = async () => {
      setIsLoading(true);
      setQueryError(null);

      try {
        const nextLogs = await getTimeLogsForMonth(
          userId,
          formatMonthBoundary(currentDate, 'start'),
          formatMonthBoundary(currentDate, 'end'),
        );
        setLogs(nextLogs);
        setSelectedDate(getFirstIncompleteWorkDay(nextLogs, year, month));
      } catch (error) {
        setQueryError(error instanceof Error ? error.message : 'Unable to load time logs.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadTimeLogs();
  }, [currentDate, month, reloadKey, userId, year]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

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

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const dateStrSelected = formatDateStr(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );
  const selectedDayLogs = logs.filter((log) => log.date === dateStrSelected);
  const totalHoursSelectedDay = selectedDayLogs.reduce((sum, log) => sum + log.hours, 0);
  const hasTimeOffSelectedDay = selectedDayLogs.some((log) => log.category === 'TIME-OFF');
  const showForm = editingLogId !== null || !(totalHoursSelectedDay >= 8 || hasTimeOffSelectedDay);
  const totalLoggedHours = logs.reduce((sum, log) => sum + log.hours, 0);

  const incompleteDays = useMemo(() => {
    const missingDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (!isWorkDay(date)) {
        continue;
      }

      const dateStr = formatDateStr(year, month, day);
      const hoursLogged = getLoggedHoursForDate(logs, dateStr);

      if (hoursLogged < 8) {
        missingDays.push(day);
      }
    }

    return missingDays;
  }, [daysInMonth, logs, month, year]);

  const workDays = useMemo(() => {
    let count = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count += 1;
      }
    }

    return count;
  }, [daysInMonth, month, year]);

  const firstIncompleteDate = useMemo(
    () => getFirstIncompleteWorkDay(logs, year, month),
    [logs, month, year],
  );
  const firstIncompleteDateStr = formatDateStr(
    firstIncompleteDate.getFullYear(),
    firstIncompleteDate.getMonth(),
    firstIncompleteDate.getDate(),
  );

  const quickStats = useMemo(() => {
    const grouped = new Map<string, number>();

    logs.forEach((log) => {
      const key = getDisplayProject(log);
      grouped.set(key, (grouped.get(key) ?? 0) + log.hours);
    });

    return [...grouped.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [logs]);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day: number) => (
    day === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year === selectedDate.getFullYear()
  );

  const resetForm = () => {
    setEditingLogId(null);
    setSelectedProject(OTHERS_OPTION);
    setHours(8);
    setIsTimeOff(false);
  };

  const closeLogModal = () => {
    setIsLogModalOpen(false);
    setSaveError(null);
    resetForm();
  };

  const openCreateLogModal = () => {
    setSaveError(null);
    resetForm();
    setIsLogModalOpen(true);
  };

  const handleEditLog = (event: MouseEvent, log: TimeLogRecord) => {
    event.stopPropagation();
    setSaveError(null);
    const [logYear, logMonth, logDay] = log.date.split('-').map(Number);
    setSelectedDate(new Date(logYear, logMonth - 1, logDay));
    setEditingLogId(log.id);
    setIsLogModalOpen(true);

    if (log.isTimeOff) {
      setIsTimeOff(true);
      setHours(8);
      return;
    }

    setIsTimeOff(false);
    setHours(log.hours);

    if (log.category === 'MEETINGS') {
      setSelectedProject(MEETINGS_OPTION);
      return;
    }

    if (log.projectId) {
      setSelectedProject(log.projectId);
      return;
    }

    setSelectedProject(OTHERS_OPTION);
  };

  const handleDeleteLog = async () => {
    if (!editingLogId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await deleteTimeLog(editingLogId);
      closeLogModal();
      setReloadKey((value) => value + 1);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to delete time log.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogTime = async () => {
    if (!userId) {
      return;
    }

    const dateStr = dateStrSelected;
    if (!editingLogId && dateStr !== firstIncompleteDateStr) {
      setSaveError('Complete the earliest incomplete work day before logging a later date.');
      return;
    }

    const otherLogsHours = logs
      .filter((log) => log.date === dateStr && log.id !== editingLogId)
      .reduce((sum, log) => sum + log.hours, 0);
    const nextHours = isTimeOff ? 8 : Number(hours);

    if (otherLogsHours + nextHours > 8) {
      setSaveError('Total logged hours for a day cannot exceed 8 hours.');
      return;
    }

    if (!isTimeOff && (!hours || Number.isNaN(Number(hours)) || Number(hours) <= 0)) {
      setSaveError('Hours must be greater than zero.');
      return;
    }

    const category: Category =
      isTimeOff ? 'TIME-OFF' : selectedProject === MEETINGS_OPTION ? 'MEETINGS' : 'PROJECT WORK';
    const projectId =
      isTimeOff || selectedProject === MEETINGS_OPTION || selectedProject === OTHERS_OPTION
        ? null
        : selectedProject;

    setIsSaving(true);
    setSaveError(null);

    try {
      if (editingLogId) {
        await updateTimeLog(editingLogId, {
          date: dateStr,
          projectId,
          category,
          hours: nextHours,
          isTimeOff,
        });
      } else {
        await createTimeLog({
          userId,
          date: dateStr,
          projectId,
          category,
          hours: nextHours,
          isTimeOff,
        });
      }

      closeLogModal();
      setReloadKey((value) => value + 1);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save time log.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <header className="flex justify-between items-start pb-6 border-b border-outline-variant mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Time Logger</h1>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded border border-outline-variant mt-2">
            <span className="font-mono text-sm text-on-surface-variant mr-4">
              {monthName}
            </span>
            <button
              className="p-1 rounded text-on-surface hover:bg-surface-variant transition-colors"
              onClick={handlePrevMonth}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="p-1 rounded text-on-surface hover:bg-surface-variant transition-colors"
              onClick={handleNextMonth}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            className="px-6 py-3 rounded font-bold transition-colors flex items-center justify-center gap-2 text-sm bg-error-container text-on-error-container hover:bg-error"
            disabled={incompleteDays.length > 0}
            style={
              incompleteDays.length > 0
                ? {
                    opacity: 0.5,
                    cursor: "not-allowed",
                    filter: "grayscale(1)",
                  }
                : {}
            }
          >
            <AlertTriangle size={16} /> SUBMIT LOE
          </button>
          {incompleteDays.length > 0 ? (
            <span className="text-[0.65rem] text-error text-right max-w-[250px] leading-tight mt-1">
              Missing logs for {incompleteDays.length} work day(s)
            </span>
          ) : null}
        </div>
      </header>

      {queryError ? (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {queryError}
        </div>
      ) : null}

      {saveError ? (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {saveError}
        </div>
      ) : null}

      <div className="pt-0">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex items-center gap-4 border-l-4 border-l-secondary">
            <div>
              <Info size={20} className="text-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">
                SUBMISSION DEADLINE
              </span>
              <span className="text-base text-on-surface font-mono">
                {new Date(year, month + 1, 0).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                , 23:59 EST
              </span>
            </div>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex items-center gap-4 border-l-4 border-l-primary">
            <div>
              <Clock size={20} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">
                WORK DAYS
              </span>
              <span className="text-base text-on-surface font-mono">
                {workDays} Days ({workDays * 8} Hours Total)
              </span>
            </div>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex items-center gap-4 border-l-4 border-l-on-surface">
            <div>
              <AlertTriangle size={20} className="text-on-surface" />
            </div>
            <div className="flex flex-col">
              <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">
                STATUS
              </span>
              <span className="text-base text-on-surface font-mono">
                {Math.max(0, workDays * 8 - totalLoggedHours)} Hours Remaining
              </span>
            </div>
          </div>
        </div>

        {!isLoading && logs.length === 0 && (
          <div className="mb-8 rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
            No time logs found for this month yet. Pick a work day and create
            the first entry.
          </div>
        )}

        {!showForm && (
          <div className="flex items-center justify-center p-6 bg-surface-variant/20 rounded border border-outline-variant mb-8">
            <span className="text-sm text-on-surface-variant flex items-center gap-2">
              <Info size={16} className="text-primary" /> Maximum hours (8h)
              logged for this day. Click on an entry in the calendar to edit it.
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="mb-8 rounded-lg border border-outline-variant bg-surface-container p-6 text-sm text-on-surface-variant">
            Loading time logs...
          </div>
        ) : null}

        <div className="border border-outline-variant bg-surface-container rounded-lg overflow-hidden mb-8">
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
                    className="min-h-[120px] border-r border-b border-outline-variant p-2 bg-black/20 cursor-default [&:nth-child(7n)]:border-r-0"
                  ></div>
                );
              }

              const dateStr = formatDateStr(year, month, day);
              const dayLogs = logs.filter((log) => log.date === dateStr);
              const isSelectedDay = isSelected(day);
              const isTodayDay = isToday(day);
              const dayDate = new Date(year, month, day);
              const isWeekend = !isWorkDay(dayDate);
              const isAfterFirstIncomplete = dayDate > firstIncompleteDate;
              const isLockedDay = !isWeekend && isAfterFirstIncomplete;

              return (
                <div
                  key={`day-${day}`}
                  ref={isSelectedDay ? selectedCellRef : null}
                  onClick={() => {
                    if (isWeekend || isLockedDay) {
                      return;
                    }
                    setSelectedDate(new Date(year, month, day));
                    resetForm();
                  }}
                  className={`relative min-h-[120px] border-r border-b border-outline-variant p-2 flex flex-col gap-1 [&:nth-child(7n)]:border-r-0 ${
                    isWeekend || isLockedDay
                      ? "bg-black/40 opacity-50 cursor-not-allowed"
                      : `cursor-pointer transition-colors hover:bg-surface-variant/30 ${isSelectedDay ? "bg-surface-variant/20 ring-1 ring-inset ring-primary" : ""}`
                  }`}
                >
                  <span
                    className={`text-sm font-mono mb-1 ${isTodayDay ? "text-secondary font-bold bg-secondary/10 px-1 py-0.5 rounded" : "text-on-surface-variant"}`}
                  >
                    {String(day).padStart(2, "0")}
                  </span>

                  {isWeekend && (
                    <Calendar
                      size={12}
                      className="absolute top-1 right-1 text-on-surface-variant/50"
                    />
                  )}
                  {isLockedDay && (
                    <Lock
                      size={12}
                      className="absolute top-1 right-1 text-on-surface-variant/50"
                    />
                  )}

                  {dayLogs.map((log) => {
                    const entryClass =
                      log.category === "PROJECT WORK"
                        ? "bg-primary/15 text-primary"
                        : log.category === "MEETINGS"
                          ? "bg-white/10 text-on-surface-variant"
                          : "bg-secondary/15 text-secondary";
                    return (
                      <div
                        key={log.id}
                        className={`flex justify-between p-1 px-2 rounded-sm text-[0.65rem] font-mono cursor-pointer ${entryClass}`}
                        onClick={(event) => handleEditLog(event, log)}
                        style={{
                          outline:
                            editingLogId === log.id
                              ? "2px solid currentColor"
                              : "none",
                        }}
                      >
                        <span className="truncate mr-2 font-semibold">
                          {getDisplayProject(log)}
                        </span>
                        <span>{log.hours.toFixed(1)}h</span>
                      </div>
                    );
                  })}

                  {isSelectedDay && showForm && !editingLogId ? (
                    <button
                      type="button"
                      className="bg-secondary text-black p-2 text-center text-xs font-bold rounded border border-secondary hover:bg-secondary/90 transition-colors"
                      onClick={(event) => {
                        event.stopPropagation();
                        openCreateLogModal();
                      }}
                    >
                      LOG TIME HERE
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="fixed bottom-6 right-6 bg-[#080a0f] border border-outline-variant p-5 rounded-lg shadow-2xl w-64 z-10">
          <h4 className="text-[0.65rem] text-on-surface-variant tracking-widest mb-4 font-bold">
            QUICK STATS
          </h4>
          {quickStats.length === 0 ? (
            <div className="text-sm text-on-surface-variant">
              No logged hours this month.
            </div>
          ) : (
            quickStats.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between mb-3 text-sm last:mb-0"
              >
                <span className="text-on-surface-variant">{label}</span>
                <span className="text-primary font-mono font-bold">
                  {value}h
                </span>
              </div>
            ))
          )}
        </div>

        {isLogModalOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeLogModal}
          >
            <div
              className="w-full max-w-2xl rounded-2xl border border-outline-variant bg-[#080a0f] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-outline-variant px-6 py-5">
                <div>
                  <p className="text-[0.65rem] tracking-[0.2em] text-on-surface-variant">
                    LOG LOE DETAILS
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-primary">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-outline-variant p-2 text-on-surface-variant transition-colors hover:bg-surface-variant"
                  onClick={closeLogModal}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5">
                {saveError ? (
                  <div className="mb-5 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                    {saveError}
                  </div>
                ) : null}

                <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-end">
                  <div className="flex flex-row items-center gap-3">
                    <label
                      className={`text-xs tracking-wider cursor-pointer font-semibold ${isTimeOff ? "text-primary" : "text-on-surface-variant"}`}
                      onClick={() => setIsTimeOff(!isTimeOff)}
                    >
                      TIME OFF
                    </label>
                    <div
                      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${isTimeOff ? "bg-primary" : "bg-outline-variant"}`}
                      onClick={() => setIsTimeOff(!isTimeOff)}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] transition-transform duration-200 ${isTimeOff ? "translate-x-5 bg-black" : ""}`}
                      ></div>
                    </div>
                  </div>

                  {!isTimeOff ? (
                    <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-on-surface-variant tracking-wider">
                          PROJECT / ACTIVITY
                        </label>
                        <select
                          className="bg-transparent border border-outline-variant text-on-surface px-4 py-2.5 rounded text-sm focus:border-primary outline-none min-w-[200px]"
                          value={selectedProject}
                          onChange={(event) =>
                            setSelectedProject(event.target.value)
                          }
                        >
                          {projects.map((project) => (
                            <option
                              key={project.value}
                              value={project.value}
                              className="bg-surface"
                            >
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-on-surface-variant tracking-wider">
                          HOURS
                        </label>
                        <input
                          type="number"
                          className="bg-transparent border border-outline-variant text-on-surface px-4 py-2.5 rounded text-sm focus:border-primary outline-none w-full md:w-24 text-center"
                          min="0.5"
                          max={
                            8 -
                            (totalHoursSelectedDay -
                              (editingLogId
                                ? logs.find((log) => log.id === editingLogId)
                                    ?.hours || 0
                                : 0))
                          }
                          step="0.5"
                          value={hours}
                          onChange={(event) => setHours(event.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-outline-variant bg-surface-variant/20 px-4 py-3 text-sm text-on-surface-variant">
                      Time off will fill the selected day with 8.0 hours.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant px-6 py-4">
                {editingLogId ? (
                  <button
                    className="px-4 py-2.5 rounded font-bold transition-colors text-sm bg-error-container text-on-error-container hover:bg-error disabled:opacity-50"
                    onClick={() => void handleDeleteLog()}
                    disabled={isSaving}
                  >
                    DELETE
                  </button>
                ) : null}
                <button
                  className="px-4 py-2.5 rounded font-bold transition-colors text-sm border border-outline-variant text-on-surface hover:bg-surface-variant"
                  onClick={closeLogModal}
                >
                  CANCEL
                </button>
                <button
                  className="bg-secondary text-black hover:bg-secondary/90 px-6 py-2.5 rounded font-bold text-sm disabled:opacity-60"
                  onClick={() => void handleLogTime()}
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="animate-spin" size={16} /> SAVING
                    </span>
                  ) : editingLogId ? (
                    "UPDATE"
                  ) : (
                    "LOG TIME"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
