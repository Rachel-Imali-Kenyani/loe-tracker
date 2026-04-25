import { Card } from "antd";

interface TimeLogsStatsProps {
  quickStats: [string, number][];
}

export function TimeLogsStats({ quickStats }: TimeLogsStatsProps) {
  return (
    <Card className="fixed bottom-6 right-6 w-64 z-10">
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
            <span className="text-primary font-mono font-bold">{value}h</span>
          </div>
        ))
      )}
    </Card>
  );
}
