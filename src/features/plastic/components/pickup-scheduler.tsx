"use client";

import { addDays, format, setHours, setMinutes, isAfter } from "date-fns";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface PickupDetailsValue {
  address: string;
  scheduledAt: string;
  specialInstructions: string;
}

interface PickupSchedulerProps {
  value: PickupDetailsValue;
  onChange: (value: PickupDetailsValue) => void;
}

function buildSlots(): { label: string; value: string; sub: string }[] {
  const now = new Date();
  const slots: { label: string; value: string; sub: string }[] = [];

  for (let offset = 0; offset < 5 && slots.length < 4; offset += 1) {
    const day = addDays(now, offset);
    // Prefer 4:00 PM; if that slot is already past, use 6:00 PM same day.
    const candidates = [
      setMinutes(setHours(day, 16), 0),
      setMinutes(setHours(day, 18), 0),
    ];
    for (const slot of candidates) {
      if (!isAfter(slot, now)) continue;
      slots.push({
        label:
          offset === 0
            ? "Today"
            : offset === 1
              ? "Tomorrow"
              : format(day, "MMM d"),
        sub: format(slot, "h:mm a"),
        value: slot.toISOString(),
      });
      break;
    }
  }

  return slots;
}

/**
 * Pickup address, preferred slot, and special instructions.
 */
export function PickupScheduler({ value, onChange }: PickupSchedulerProps) {
  const slots = buildSlots();

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Preferred pickup time</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {slots.map((slot) => {
            const selected = value.scheduledAt === slot.value;
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => onChange({ ...value, scheduledAt: slot.value })}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition-all",
                  selected
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                    : "border-border hover:border-emerald-300",
                )}
              >
                <p className="text-sm font-semibold">{slot.label}</p>
                <p className="text-xs text-muted-foreground">{slot.sub}</p>
              </button>
            );
          })}
        </div>
        {slots.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No upcoming slots available. Try again later.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Pickup address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="address"
            className="pl-9"
            rows={3}
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="Building, street, city, PIN"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Special instructions (optional)</Label>
        <Input
          id="instructions"
          value={value.specialInstructions}
          onChange={(e) =>
            onChange({ ...value, specialInstructions: e.target.value })
          }
          placeholder="Gate code, landmark, preferred contact…"
        />
      </div>
    </div>
  );
}
