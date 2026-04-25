import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Card, ConfigProvider, theme } from "antd";
import { useAuth } from "../auth/AuthContext";
import {
  createTimeLog,
  deleteTimeLog,
  updateTimeLog,
} from "../services/timeLogs";
import type { Category, TimeLogRecord } from "../services/types";
import {
  useTimeLogs,
  useProjects,
  useHolidays,
  useCountry,
  TimeLogsHeader,
  TimeLogsSummary,
  TimeLogsStats,
  TimeLogsCalendar,
  TimeLogModal,
  formatDateStr,
  getFirstIncompleteWorkDay,
  calculateIncompleteDays,
  calculateWorkDays,
  calculateQuickStats,
  MEETINGS_OPTION,
  OTHERS_OPTION,
} from "./TimeLogs/index";

export function TimeLogs() {
  const { userId } = useAuth();
  const selectedCellRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return getFirstIncompleteWorkDay([], today.getFullYear(), today.getMonth());
  });
  const [selectedProject, setSelectedProject] = useState<string>(OTHERS_OPTION);
  const [hours, setHours] = useState<number | string | null>(8);
  const [isTimeOff, setIsTimeOff] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Custom hooks
  const { logs, isLoading, queryError, firstIncompleteDate } = useTimeLogs(
    userId,
    currentDate,
    reloadKey,
  );
  const { projects, queryError: projectsError } = useProjects(userId);
  const { country, countryError } = useCountry(userId);
  const {
    holidayDates,
    holidayError,
    holidayAutoFilled,
    setHolidayAutoFilled,
  } = useHolidays(country, year);

  // Computed values
  const holidayMap = useMemo(
    () =>
      new Map(holidayDates.map((holiday) => [holiday.date, holiday.localName])),
    [holidayDates],
  );

  const monthName = currentDate
    .toLocaleString("default", { month: "long", year: "numeric" })
    .toUpperCase();

  const dateStrSelected = formatDateStr(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );
  const selectedDayLogs = logs.filter((log) => log.date === dateStrSelected);
  const totalHoursSelectedDay = selectedDayLogs.reduce(
    (sum, log) => sum + log.hours,
    0,
  );
  const hasTimeOffSelectedDay = selectedDayLogs.some(
    (log) => log.category === "TIME-OFF",
  );
  const showForm =
    editingLogId !== null ||
    !(totalHoursSelectedDay >= 8 || hasTimeOffSelectedDay);

  const incompleteDays = useMemo(
    () => calculateIncompleteDays(logs, year, month, holidayMap),
    [logs, year, month, holidayMap],
  );

  const workDays = useMemo(
    () => calculateWorkDays(year, month, holidayMap),
    [year, month, holidayMap],
  );

  const quickStats = useMemo(() => calculateQuickStats(logs), [logs]);

  const totalLoggedHours = logs.reduce((sum, log) => sum + log.hours, 0);
  const expectedHours = workDays * 8;
  const remainingHours = expectedHours - totalLoggedHours;

  const today = new Date();
  const isViewingCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const disableNextMonth = isViewingCurrentMonth && incompleteDays.length > 0;

  // Effects
  useEffect(() => {
    if (selectedCellRef.current) {
      window.setTimeout(() => {
        selectedCellRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [selectedDate, currentDate]);

  useEffect(() => {
    if (
      !userId ||
      !country ||
      holidayDates.length === 0 ||
      isLoading ||
      holidayAutoFilled
    ) {
      return;
    }

    const missingHolidayLogs = holidayDates.filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      const isWorkDay =
        holidayDate.getDay() !== 0 && holidayDate.getDay() !== 6;
      if (!isWorkDay) {
        return false;
      }

      return !logs.some((log) => log.date === holiday.date);
    });

    if (missingHolidayLogs.length === 0) {
      setHolidayAutoFilled(true);
      return;
    }

    const fillHolidays = async () => {
      setIsSaving(true);

      try {
        await Promise.all(
          missingHolidayLogs.map((holiday) =>
            createTimeLog({
              userId,
              date: holiday.date,
              projectId: null,
              category: "TIME-OFF",
              hours: 8,
              isTimeOff: true,
            }),
          ),
        );
        setReloadKey((value) => value + 1);
      } catch {
        // Do not block the user if holiday auto-fill fails.
      } finally {
        setIsSaving(false);
        setHolidayAutoFilled(true);
      }
    };

    void fillHolidays();
  }, [
    country,
    holidayAutoFilled,
    holidayDates,
    isLoading,
    logs,
    setHolidayAutoFilled,
    userId,
  ]);

  // Track if the user has manually selected a date to avoid auto-selection conflicts
  const userSelectedDateRef = useRef(false);

  // Auto-select first incomplete work day when month/year changes or holidays load
  // Only do this if user hasn't manually selected a date
  const desiredSelectedDate = useMemo(() => {
    return getFirstIncompleteWorkDay(
      logs,
      year,
      month,
      Array.from(holidayMap.keys()),
    );
  }, [logs, year, month, holidayMap]);

  useEffect(() => {
    if (!userSelectedDateRef.current) {
      setSelectedDate(desiredSelectedDate);
    }
  }, [desiredSelectedDate]);

  // Event handlers
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

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

  const handleDateSelect = (date: Date) => {
    userSelectedDateRef.current = true; // Mark that user manually selected a date
    setSelectedDate(date);

    // Check if the selected date needs logging
    const dateStr = formatDateStr(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const dayLogs = logs.filter((log) => log.date === dateStr);
    const totalHours = dayLogs.reduce((sum, log) => sum + log.hours, 0);
    const hasTimeOff = dayLogs.some((log) => log.category === "TIME-OFF");

    if (!(totalHours >= 8 || hasTimeOff)) {
      openCreateLogModal();
    }
  };

  const handleEditLog = (
    event: React.MouseEvent<HTMLDivElement>,
    log: TimeLogRecord,
  ) => {
    event.stopPropagation();
    setSaveError(null);
    const [logYear, logMonth, logDay] = log.date.split("-").map(Number);
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

    if (log.category === "MEETINGS") {
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
      setSaveError(
        error instanceof Error ? error.message : "Unable to delete time log.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogTime = async () => {
    if (!userId) {
      return;
    }

    const dateStr = dateStrSelected;
    if (
      !editingLogId &&
      dateStr !==
        formatDateStr(
          firstIncompleteDate.getFullYear(),
          firstIncompleteDate.getMonth(),
          firstIncompleteDate.getDate(),
        )
    ) {
      setSaveError(
        "Complete the earliest incomplete work day before logging a later date.",
      );
      return;
    }

    const otherLogsHours = logs
      .filter((log) => log.date === dateStr && log.id !== editingLogId)
      .reduce((sum, log) => sum + log.hours, 0);
    const nextHours = isTimeOff ? 8 : Number(hours);

    if (otherLogsHours + nextHours > 8) {
      const remainingCapacity = 8 - otherLogsHours;
      setSaveError(
        `Total logged hours for a day cannot exceed 8 hours. You have already logged ${otherLogsHours}h, leaving only ${remainingCapacity}h available.`,
      );
      return;
    }

    if (
      !isTimeOff &&
      (!hours || Number.isNaN(Number(hours)) || Number(hours) <= 0)
    ) {
      setSaveError("Hours must be greater than zero.");
      return;
    }

    const category: Category = isTimeOff
      ? "TIME-OFF"
      : selectedProject === MEETINGS_OPTION
        ? "MEETINGS"
        : "PROJECT WORK";
    const projectId =
      isTimeOff ||
      selectedProject === MEETINGS_OPTION ||
      selectedProject === OTHERS_OPTION
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
      setSaveError(
        error instanceof Error ? error.message : "Unable to save time log.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="max-w-7xl mx-auto h-full overflow-y-auto">
        <ConfigProvider>
          <Card className="p-6 border-none rounded-none h-full">
            <TimeLogsHeader
              monthName={monthName}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              disableNextMonth={disableNextMonth}
              incompleteDaysCount={incompleteDays.length}
            />

            {(queryError || projectsError || countryError) && (
              <Alert
                message={queryError || projectsError || countryError}
                type="error"
                showIcon
                className="mb-6"
              />
            )}

            {holidayError && (
              <Alert
                message={holidayError}
                type="warning"
                showIcon
                className="mb-6"
              />
            )}

            {saveError && (
              <Alert
                message={saveError}
                type="error"
                showIcon
                className="mb-6"
              />
            )}

            <TimeLogsSummary
              workDays={workDays}
              totalLoggedHours={totalLoggedHours}
              remainingHours={remainingHours}
            />

            {!isLoading && logs.length === 0 && (
              <Alert
                message="No time logs found for this month yet. Pick a work day and create the first entry."
                type="info"
                showIcon
                className="mb-8"
              />
            )}

            {!showForm && (
              <Alert
                message="Maximum hours (8h) logged for this day. Click on an entry in the calendar to edit it."
                type="info"
                showIcon
                className="mb-8"
              />
            )}

            {isLoading && (
              <Alert
                message="Loading time logs..."
                type="info"
                showIcon
                className="mb-8"
              />
            )}

            <TimeLogsCalendar
              year={year}
              month={month}
              logs={logs}
              selectedDate={selectedDate}
              firstIncompleteDate={firstIncompleteDate}
              holidayMap={holidayMap}
              onDateSelect={handleDateSelect}
              onLogEdit={handleEditLog}
            />

            <TimeLogsStats quickStats={quickStats} />

            <TimeLogModal
              isOpen={isLogModalOpen}
              editingLogId={editingLogId}
              selectedDate={selectedDate}
              selectedProject={selectedProject}
              hours={hours}
              isTimeOff={isTimeOff}
              projects={projects}
              saveError={saveError}
              isSaving={isSaving}
              onClose={closeLogModal}
              onProjectChange={setSelectedProject}
              onHoursChange={setHours}
              onTimeOffChange={setIsTimeOff}
              onSave={handleLogTime}
              onDelete={handleDeleteLog}
            />
          </Card>
        </ConfigProvider>
      </div>
    </ConfigProvider>
  );
}
