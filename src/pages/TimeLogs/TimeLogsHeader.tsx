import { Button, Typography } from "antd";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

interface TimeLogsHeaderProps {
  monthName: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  disableNextMonth: boolean;
  incompleteDaysCount: number;
}

export function TimeLogsHeader({
  monthName,
  onPrevMonth,
  onNextMonth,
  disableNextMonth,
  incompleteDaysCount,
}: TimeLogsHeaderProps) {
  return (
    <header className="flex justify-between items-start pb-6 border-b border-outline-variant mb-6">
      <div>
        <Typography.Title level={2} className="mb-1">
          Time Logger
        </Typography.Title>
        <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded border border-outline-variant mt-2">
          <span className="font-mono text-sm text-on-surface-variant mr-4">
            {monthName}
          </span>
          <Button
            type="text"
            icon={<ChevronLeft size={16} />}
            onClick={onPrevMonth}
          />
          <Button
            type="text"
            icon={<ChevronRight size={16} />}
            onClick={onNextMonth}
            disabled={disableNextMonth}
            title={
              disableNextMonth
                ? "Complete the current month before moving to next months"
                : undefined
            }
          />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Button
          type="primary"
          danger
          disabled={incompleteDaysCount > 0}
          icon={<AlertTriangle size={16} />}
          className="flex items-center gap-2"
        >
          SUBMIT LOE
        </Button>
      </div>
    </header>
  );
}
