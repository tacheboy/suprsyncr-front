import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  delivered: "bg-success/10 text-success",
  active: "bg-success/10 text-success",
  in_stock: "bg-success/10 text-success",
  connected: "bg-success/10 text-success",
  shipped: "bg-primary/10 text-primary",
  processing: "bg-warning/10 text-warning",
  pending: "bg-warning/10 text-warning",
  low_stock: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
  returned: "bg-destructive/10 text-destructive",
  out_of_stock: "bg-destructive/10 text-destructive",
  error: "bg-destructive/10 text-destructive",
  inactive: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono-data",
      statusStyles[status] || "bg-muted text-muted-foreground",
      className
    )}>
      {label}
    </span>
  );
}
