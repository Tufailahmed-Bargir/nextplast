import { CheckCircle2, Circle } from "lucide-react";
import { formatDateTime } from "@/utils/date";
import { cn } from "@/lib/utils";

interface TimelineStep {
  key: string;
  label: string;
  at: Date | null;
  done: boolean;
}

interface OrderTimelineProps {
  steps: TimelineStep[];
}

export function OrderTimeline({ steps }: OrderTimelineProps) {
  return (
    <ol className="space-y-3">
      {steps.map((step) => (
        <li key={step.key} className="flex items-start gap-3">
          {step.done ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
          ) : (
            <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                step.done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </p>
            {step.at ? (
              <p className="text-xs text-muted-foreground">
                {formatDateTime(step.at)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
