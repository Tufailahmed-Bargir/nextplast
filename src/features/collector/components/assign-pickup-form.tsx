"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignPickupAction } from "@/features/collector/actions/collector-actions";
import { useState } from "react";

interface AssignPickupFormProps {
  pickupId: string;
  collectors: { id: string; label: string }[];
}

/**
 * Admin form to assign a collector to an unassigned pickup.
 */
export function AssignPickupForm({
  pickupId,
  collectors,
}: AssignPickupFormProps) {
  const router = useRouter();
  const [collectorId, setCollectorId] = useState(collectors[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  if (collectors.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No collectors available. Assign the Collector role from Users first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select
        value={collectorId}
        onValueChange={(value) => setCollectorId(value ?? "")}
        items={collectors.map((c) => ({ value: c.id, label: c.label }))}
      >
        <SelectTrigger className="sm:w-56">
          <SelectValue placeholder="Select collector" />
        </SelectTrigger>
        <SelectContent>
          {collectors.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        size="sm"
        disabled={!collectorId}
        loading={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await assignPickupAction({
              pickupId,
              collectorId,
            });
            if (result.success) {
              toast.success(result.message ?? "Assigned");
            } else {
              toast.error(result.error);
            }
            // Refresh either way so a stale card (e.g. assigned in another
            // tab or by a double click) reflects the real pickup state.
            router.refresh();
          });
        }}
      >
        Assign
      </Button>
    </div>
  );
}
