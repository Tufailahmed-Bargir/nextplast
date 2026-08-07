import type { ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string }>;

interface CollectorDashboardCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: IconComponent;
  tone?: "sky" | "emerald" | "coin" | "teal";
  className?: string;
}

const tones = {
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  coin: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
} as const;

/**
 * Stat tile for collector dashboard surfaces.
 */
export function CollectorDashboardCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "sky",
  className,
}: CollectorDashboardCardProps) {
  return (
    <Card
      className={cn(
        "py-5 transition-all hover:-translate-y-0.5 hover:shadow-float",
        className,
      )}
    >
      <CardContent className="space-y-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {sub ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
