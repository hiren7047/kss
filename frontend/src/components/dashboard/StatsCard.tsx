import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "primary" | "success" | "warning" | "info";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "primary",
}: StatsCardProps) {
  const variantStyles = {
    primary: {
      card: "stats-card-primary",
      icon: "icon-container-primary",
    },
    success: {
      card: "stats-card-success",
      icon: "icon-container-success",
    },
    warning: {
      card: "stats-card-warning",
      icon: "icon-container-warning",
    },
    info: {
      card: "stats-card-info",
      icon: "icon-container-info",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.card, "animate-fade-in")}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-2xl font-bold tracking-tight lg:text-3xl">{value}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
          {trend && (
            <div className="mt-1 flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          )}
        </div>
        <div className={styles.icon}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
