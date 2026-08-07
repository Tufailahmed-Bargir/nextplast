"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateCollectorAction } from "@/features/admin/actions/admin-actions";

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
  const [pending, startTransition] = useTransition();
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
    startTransition(async () => {
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
        <p className="text-sm text-muted-foreground">
          New collectors start as Pending until approved for assignment.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {collectors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collectors yet.</p>
        ) : (
          collectors.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{c.name ?? c.email}</p>
                <p className="text-sm text-muted-foreground">{c.email}</p>
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
                  <span className="text-xs text-muted-foreground">
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
                          | "PENDING"
                          | "APPROVED"
                          | "SUSPENDED",
                        c.isOnDuty,
                        next,
                      );
                    }
                  }}
                  aria-label="Collector zone"
                />
                <select
                  className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
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
                <button
                  type="button"
                  disabled={pending}
                  className="h-9 rounded-lg border border-input px-3 text-sm"
                  onClick={() =>
                    update(
                      c.id,
                      c.verificationStatus as
                        | "PENDING"
                        | "APPROVED"
                        | "SUSPENDED",
                      !c.isOnDuty,
                      zones[c.id],
                    )
                  }
                >
                  {c.isOnDuty ? "Set off duty" : "Set on duty"}
                </button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
