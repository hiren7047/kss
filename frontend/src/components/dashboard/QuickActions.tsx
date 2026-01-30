import { UserPlus, Heart, Calendar, FileCheck, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { title: "Add Member", icon: UserPlus, color: "text-primary" },
  { title: "Add Donation", icon: Heart, color: "text-success" },
  { title: "Create Event", icon: Calendar, color: "text-info" },
  { title: "Approve Expense", icon: FileCheck, color: "text-warning" },
  { title: "Upload Report", icon: Upload, color: "text-chart-5" },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => (
          <button
            key={action.title}
            className="quick-action group"
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10",
              action.color
            )}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-center">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
