import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  className?: string;
}

export function MetricCard({ title, value, change, changeType = "neutral", icon, className }: MetricCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {change && (
          <p className={cn("text-xs mt-1 font-medium", {
            "text-success": changeType === "positive",
            "text-destructive": changeType === "negative",
            "text-muted-foreground": changeType === "neutral",
          })}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
