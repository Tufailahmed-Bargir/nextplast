"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleDutyAction } from "@/features/collector/actions/collector-actions";

interface DutyToggleProps {
  isOnDuty: boolean;
}

export function DutyToggle({ isOnDuty }: DutyToggleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnDuty ? "default" : "secondary"}>
        {isOnDuty ? "On Duty" : "Off Duty"}
      </Badge>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await toggleDutyAction({ isOnDuty: !isOnDuty });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {isOnDuty ? "Go off duty" : "Go on duty"}
      </Button>
    </div>
  );
}
