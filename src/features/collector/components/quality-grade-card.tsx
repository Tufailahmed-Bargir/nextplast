"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { QUALITY_MULTIPLIERS } from "@/constants/platform";

export type VerifiedQuality = "CLEAN" | "MIXED" | "CONTAMINATED";

interface QualityGradeCardProps {
  value: VerifiedQuality;
  onChange: (value: VerifiedQuality) => void;
  claimedQuality?: string | null;
}

const OPTIONS: {
  id: VerifiedQuality;
  label: string;
  hint: string;
}[] = [
  {
    id: "CLEAN",
    label: "Clean & Sorted",
    hint: `+${Math.round((QUALITY_MULTIPLIERS.clean - 1) * 100)}%`,
  },
  { id: "MIXED", label: "Mixed", hint: "Standard" },
  {
    id: "CONTAMINATED",
    label: "Contaminated",
    hint: `${Math.round((QUALITY_MULTIPLIERS.contaminated - 1) * 100)}%`,
  },
];

/**
 * Collector quality grade selection (stored separately from user claim).
 */
export function QualityGradeCard({
  value,
  onChange,
  claimedQuality,
}: QualityGradeCardProps) {
  return (
    <div className="space-y-3">
      <Label>Verified quality grade</Label>
      {claimedQuality ? (
        <p className="text-xs text-muted-foreground">
          User claimed: {claimedQuality}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                selected
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-950"
                  : "border-border hover:border-sky-300",
              )}
            >
              <p className="font-medium">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
