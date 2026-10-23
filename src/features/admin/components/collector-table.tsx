"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateCollectorAction } from "@/features/admin/actions/admin-actions";
import { usePendingAction } from "@/hooks/use-pending-action";

export interface CollectorTableRow {
  id: string;
  name: string | null;
  email: string;
  zone: string | null;
  isOnDuty: boolean;
  verificationStatus: string;
  completedPickups: number;
  activeAssigned: number;
  isActive: boolean;
}

interface CollectorTableProps {
  collectors: CollectorTableRow[];
}

export function CollectorTable({ collectors }: CollectorTableProps) {
  const router = useRouter();
  const { pending, run, isRunning } = usePendingAction();
  const [zones, setZones] = useState<Record<string, string>>(() =>
    Object.fromEntries(collectors.map((c) => [c.id, c.zone ?? "Default"])),
  );

  useEffect(() => {
    setZones(
      Object.fromEntries(collectors.map((c) => [c.id, c.zone ?? "Default"])),
    );
  }, [collectors]);

  function update(
    collectorId: string,
    verificationStatus: "PENDING" | "APPROVED" | "SUSPENDED",
    isOnDuty?: boolean,
    zone?: string,
  ) {
    run(collectorId, async () => {
      const result = await updateCollectorAction({
        collectorId,
        verificationStatus,
        isOnDuty,
        zone,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collectors</CardTitle>
        <p className="text-muted-foreground text-sm">
          New collectors start as Pending until approved for assignment.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {collectors.length === 0 ? (
          <p className="text-muted-foreground text-sm">No collectors yet.</p>
        ) : (
          collectors.map((c) => (
            <div
              key={c.id}
              className="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{c.name ?? c.email}</p>
                <p className="text-muted-foreground text-sm">{c.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={c.isOnDuty ? "default" : "secondary"}>
                    {c.isOnDuty ? "On duty" : "Off duty"}
                  </Badge>
                  <Badge variant="secondary">
                    {c.verificationStatus.toLowerCase()}
                  </Badge>
                  {!c.isActive ? (
                    <Badge variant="destructive">user suspended</Badge>
                  ) : null}
                  <span className="text-muted-foreground text-xs">
                    Done {c.completedPickups} · Active {c.activeAssigned}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  className="h-9 w-28"
                  value={zones[c.id] ?? ""}
                  disabled={pending}
                  onChange={(e) =>
                    setZones((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                  onBlur={() => {
                    const next = (zones[c.id] ?? "").trim();
                    if (next && next !== (c.zone ?? "Default")) {
                      update(
                        c.id,
                        c.verificationStatus as
                          "PENDING" | "APPROVED" | "SUSPENDED",
                        c.isOnDuty,
                        next,
                      );
                    }
                  }}
                  aria-label="Collector zone"
                />
                <select
                  className="border-input h-9 rounded-lg border bg-transparent px-2 text-sm"
                  defaultValue={c.verificationStatus}
                  disabled={pending}
                  onChange={(e) =>
                    update(
                      c.id,
                      e.target.value as "PENDING" | "APPROVED" | "SUSPENDED",
                      c.isOnDuty,
                      zones[c.id],
                    )
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  disabled={pending}
                  loading={isRunning(c.id)}
                  onClick={() =>
                    update(
                      c.id,
                      c.verificationStatus as
                        "PENDING" | "APPROVED" | "SUSPENDED",
                      !c.isOnDuty,
                      zones[c.id],
                    )
                  }
                >
                  {c.isOnDuty ? "Set off duty" : "Set on duty"}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
