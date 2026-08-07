import {
  CheckCircle2,
  Cpu,
  FileSearch,
  Scan,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  id: string;
  label: string;
  done: boolean;
  detail?: string;
}

const defaultIcons = [Upload, Cpu, Scan, FileSearch, ShieldAlert, CheckCircle2];

interface ProcessingTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function ProcessingTimeline({ steps, className }: ProcessingTimelineProps) {
  return (
    <ol className={cn("space-y-3", className)}>
      {steps.map((step, index) => {
        const Icon = defaultIcons[index % defaultIcons.length]!;
        return (
          <li key={step.id} className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                step.done
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{step.label}</p>
              {step.detail ? (
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
