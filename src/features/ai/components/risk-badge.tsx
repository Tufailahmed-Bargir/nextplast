import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  risk: "none" | "low" | "medium" | "high";
  className?: string;
}

const styles: Record<RiskBadgeProps["risk"], string> = {
  none: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  low: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  high: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
};

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  return (
    <Badge variant="outline" className={cn(styles[risk], className)}>
      Risk: {risk}
    </Badge>
  );
}
