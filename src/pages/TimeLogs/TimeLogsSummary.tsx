import { Card } from "antd";
import { AlertTriangle, Clock, Info } from "lucide-react";

interface TimeLogsSummaryProps {
  workDays: number;
  totalLoggedHours: number;
  remainingHours: number;
}

export function TimeLogsSummary({
  workDays,
  remainingHours,
}: TimeLogsSummaryProps) {
  const expectedHours = workDays * 8;

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <Card className="border-l-4 border-l-secondary">
        <div className="flex items-center gap-4">
          <div>
            <Info size={20} className="text-secondary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">
              SUBMISSION DEADLINE
            </span>
            <span className="text-base text-on-surface font-mono">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              , 23:59 EST
            </span>
          </div>
        </div>
      </Card>
      <Card className="border-l-4 border-l-primary">
        <div className="flex items-center gap-4">
          <div>
            <Clock size={20} className="text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">
              WORK DAYS
            </span>
            <span className="text-base text-on-surface font-mono">
              {workDays} Days ({expectedHours} Hours Total)
            </span>
          </div>
        </div>
      </Card>
      <Card className="border-l-4 border-l-on-surface">
        <div className="flex items-center gap-4">
          <div>
            <AlertTriangle size={20} className="text-on-surface" />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">
              STATUS
            </span>
            <span className="text-base text-on-surface font-mono">
              {remainingHours > 0 ? `${remainingHours} Hours` : "Complete"}
              {remainingHours > 0 ? " Remaining" : ""}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
