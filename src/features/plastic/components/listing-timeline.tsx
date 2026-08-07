import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/date";
import type { LifecycleLabel } from "@/features/plastic/services/status";

interface ListingTimelineProps {
  items: { label: LifecycleLabel; done: boolean; at?: Date | null }[];
}

/**
 * Status timeline for a plastic listing / pickup lifecycle.
 */
export function ListingTimeline({ items }: ListingTimelineProps) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={item.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border",
                item.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {item.done ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < items.length - 1 ? (
              <div
                className={cn(
                  "mt-1 w-px flex-1",
                  item.done ? "bg-emerald-400" : "bg-border",
                )}
              />
            ) : null}
          </div>
          <div className="pb-4">
            <p
              className={cn(
                "text-sm font-medium",
                item.done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </p>
            {item.at ? (
              <p className="text-xs text-muted-foreground">
                {formatDateTime(item.at)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
