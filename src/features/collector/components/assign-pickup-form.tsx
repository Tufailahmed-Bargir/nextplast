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
      <p className="text-sm text-muted-foreground">
        No collectors available. Assign the Collector role from Users first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select
        value={collectorId}
        onValueChange={(value) => setCollectorId(value ?? "")}
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
        disabled={pending || !collectorId}
        onClick={() => {
          startTransition(async () => {
            const result = await assignPickupAction({
              pickupId,
              collectorId,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message ?? "Assigned");
            router.refresh();
          });
        }}
      >
        Assign
      </Button>
    </div>
  );
}
