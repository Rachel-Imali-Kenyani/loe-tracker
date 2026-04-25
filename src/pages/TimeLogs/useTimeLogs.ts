import { useEffect, useState } from "react";
import { getTimeLogsForMonth } from "../../services/timeLogs";
import type { TimeLogRecord } from "../../services/types";
import { formatMonthBoundary, getFirstIncompleteWorkDay } from "./dateUtils";

export function useTimeLogs(
  userId: string | null,
  currentDate: Date,
  reloadKey: number,
) {
  const [logs, setLogs] = useState<TimeLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queryError, setQueryError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
          formatMonthBoundary(currentDate, "start"),
          formatMonthBoundary(currentDate, "end"),
        );
        setLogs(nextLogs);
      } catch (error) {
        setQueryError(
          error instanceof Error ? error.message : "Unable to load time logs.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadTimeLogs();
  }, [currentDate, reloadKey, userId]);

  const firstIncompleteDate = getFirstIncompleteWorkDay(logs, year, month);

  return {
    logs,
    isLoading,
    queryError,
    firstIncompleteDate,
    reload: () => setLogs([]), // This will trigger a reload via useEffect
  };
}
