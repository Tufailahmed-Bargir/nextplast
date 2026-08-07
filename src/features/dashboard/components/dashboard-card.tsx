import Link from "next/link";
import type { ComponentType } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string; size?: number }>;

interface DashboardCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: IconComponent;
  href?: string;
  tone?: "coin" | "emerald" | "sky" | "teal";
  className?: string;
}

const toneClasses = {
  coin: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
} as const;

/**
 * Stat tile used across dashboard surfaces.
 */
export function DashboardCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  tone = "emerald",
  className,
}: DashboardCardProps) {
  const body = (
    <Card
      className={cn(
        "h-full py-5 transition-all hover:-translate-y-0.5 hover:shadow-float",
        href && "cursor-pointer",
        className,
      )}
    >
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              toneClasses[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {href ? (
            <ChevronRight
              className="h-4 w-4 text-muted-foreground"
              aria-hidden
            />
          ) : null}
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {body}
      </Link>
    );
  }

  return body;
}
