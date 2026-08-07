import type { LucideIcon } from "lucide-react";

interface DashboardEmptyProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Inline empty state for use inside an existing Card (avoids nested cards).
 */
export function DashboardEmpty({
  icon: Icon,
  title,
  description,
}: DashboardEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
