"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatWeight } from "@/utils/coin";

export interface WeightEntryValue {
  actualWeightGrams: number;
  actualQuantity: number;
}

interface WeightEntryFormProps {
  value: WeightEntryValue;
  onChange: (value: WeightEntryValue) => void;
  claimedWeightGrams?: number | null;
  claimedQuantity?: number | null;
}

/**
 * Collector verified weight and quantity entry.
 */
export function WeightEntryForm({
  value,
  onChange,
  claimedWeightGrams,
  claimedQuantity,
}: WeightEntryFormProps) {
  const kg = value.actualWeightGrams / 1000;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="verified-weight">Verified weight (kg)</Label>
          <span className="font-display text-lg font-semibold">
            {kg.toFixed(1)} kg
          </span>
        </div>
        <input
          id="verified-weight"
          type="range"
          min={0.1}
          max={200}
          step={0.1}
          value={kg}
          onChange={(e) =>
            onChange({
              ...value,
              actualWeightGrams: Math.round(Number(e.target.value) * 1000),
            })
          }
          className="w-full accent-sky-600"
        />
        <Input
          type="number"
          min={0.1}
          step={0.1}
          value={kg}
          onChange={(e) =>
            onChange({
              ...value,
              actualWeightGrams: Math.max(
                100,
                Math.round(Number(e.target.value || 0) * 1000),
              ),
            })
          }
        />
        {claimedWeightGrams != null ? (
          <p className="text-xs text-muted-foreground">
            User claimed {formatWeight(claimedWeightGrams)} — original claim is
            preserved.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="verified-qty">Verified quantity</Label>
        <Input
          id="verified-qty"
          type="number"
          min={0}
          value={value.actualQuantity}
          onChange={(e) =>
            onChange({
              ...value,
              actualQuantity: Math.max(0, Number(e.target.value) || 0),
            })
          }
        />
        {claimedQuantity != null ? (
          <p className="text-xs text-muted-foreground">
            User claimed {claimedQuantity} item(s).
          </p>
        ) : null}
      </div>
    </div>
  );
}
