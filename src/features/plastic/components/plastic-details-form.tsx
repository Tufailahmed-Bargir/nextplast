"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { QUALITY_MULTIPLIERS } from "@/constants/platform";
import { formatWeight } from "@/utils/coin";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  resinType: string;
}

export interface PlasticDetailsValue {
  quality: "CLEAN" | "MIXED" | "CONTAMINATED";
  claimedWeightGrams: number;
  categoryId: string;
  claimedQuantity: number;
  notes?: string;
}

interface PlasticDetailsFormProps {
  categories: CategoryOption[];
  value: PlasticDetailsValue;
  onChange: (value: PlasticDetailsValue) => void;
  /** Total confirmed in the AI review step; locks the quantity when present. */
  confirmedQuantity?: number;
}

const QUALITY_OPTIONS = [
  {
    id: "CLEAN" as const,
    label: "Clean & Sorted",
    hint: `+${Math.round((QUALITY_MULTIPLIERS.clean - 1) * 100)}%`,
  },
  {
    id: "MIXED" as const,
    label: "Mixed",
    hint: "Standard",
  },
  {
    id: "CONTAMINATED" as const,
    label: "Contaminated",
    hint: `${Math.round((QUALITY_MULTIPLIERS.contaminated - 1) * 100)}%`,
  },
];

/**
 * Plastic type, weight, quality, and notes form.
 */
export function PlasticDetailsForm({
  categories,
  value,
  onChange,
  confirmedQuantity,
}: PlasticDetailsFormProps) {
  const quantityLocked = confirmedQuantity != null;
  const weightKg = value.claimedWeightGrams / 1000;

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Plastic type</Label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const selected = value.categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange({ ...value, categoryId: category.id })}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  selected
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                    : "border-border hover:border-emerald-300",
                )}
              >
                <p className="font-medium">{category.name}</p>
                <p className="text-muted-foreground text-xs">
                  {category.resinType}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="weight">Estimated weight</Label>
          <span className="font-display text-lg font-semibold">
            {weightKg.toFixed(1)} kg
          </span>
        </div>
        <input
          id="weight"
          type="range"
          min={0.1}
          max={200}
          step={0.1}
          value={weightKg}
          onChange={(e) =>
            onChange({
              ...value,
              claimedWeightGrams: Math.round(Number(e.target.value) * 1000),
            })
          }
          className="w-full accent-emerald-600"
        />
        <p className="text-muted-foreground text-xs">
          {formatWeight(value.claimedWeightGrams)} claimed (collector will
          verify)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qty">Item quantity</Label>
        <Input
          id="qty"
          type="number"
          min={1}
          value={confirmedQuantity ?? value.claimedQuantity}
          readOnly={quantityLocked}
          aria-describedby={quantityLocked ? "qty-hint" : undefined}
          className={quantityLocked ? "bg-muted/50" : undefined}
          onChange={(e) =>
            onChange({
              ...value,
              claimedQuantity: Math.max(1, Number(e.target.value) || 1),
            })
          }
        />
        {quantityLocked ? (
          <p id="qty-hint" className="text-muted-foreground text-xs">
            From your confirmed AI review. Go back to the review step to change
            it.
          </p>
        ) : null}
      </div>

      <div>
        <Label className="mb-3 block">Quality grade</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUALITY_OPTIONS.map((option) => {
            const selected = value.quality === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ ...value, quality: option.id })}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  selected
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                    : "border-border hover:border-emerald-300",
                )}
              >
                <p className="font-medium">{option.label}</p>
                <p className="text-muted-foreground text-xs">{option.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          rows={3}
          value={value.notes ?? ""}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="Anything collectors should know?"
        />
      </div>
    </div>
  );
}
