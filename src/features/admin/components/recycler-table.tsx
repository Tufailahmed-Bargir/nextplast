"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateRecyclerAction } from "@/features/admin/actions/admin-actions";
import { usePendingAction } from "@/hooks/use-pending-action";

export interface RecyclerTableRow {
  id: string;
  companyName: string;
  name: string | null;
  email: string;
  verificationStatus: string;
  inventoryLots: number;
  isActive: boolean;
}

interface RecyclerTableProps {
  recyclers: RecyclerTableRow[];
}

export function RecyclerTable({ recyclers }: RecyclerTableProps) {
  const router = useRouter();
  const { pending, run, isRunning } = usePendingAction();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recyclers</CardTitle>
        <p className="text-muted-foreground text-sm">
          Partner verification for future recycler purchases (Phase 8).
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recyclers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No recyclers yet. Assign the Recycler role from Users.
          </p>
        ) : (
          recyclers.map((r) => (
            <div
              key={r.id}
              className="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{r.companyName}</p>
                <p className="text-muted-foreground text-sm">
                  {r.name ?? r.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {r.verificationStatus.toLowerCase()}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    Inventory lots: {r.inventoryLots}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isRunning(r.id) ? (
                  <Loader2
                    className="text-muted-foreground h-4 w-4 animate-spin"
                    aria-label="Saving"
                  />
                ) : null}
                <select
                  className="border-input h-9 rounded-lg border bg-transparent px-2 text-sm"
                  defaultValue={r.verificationStatus}
                  disabled={pending}
                  onChange={(e) => {
                    run(r.id, async () => {
                      const result = await updateRecyclerAction({
                        recyclerId: r.id,
                        verificationStatus: e.target.value as
                          "PENDING" | "APPROVED" | "SUSPENDED",
                      });
                      if (!result.success) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(result.message);
                      router.refresh();
                    });
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
