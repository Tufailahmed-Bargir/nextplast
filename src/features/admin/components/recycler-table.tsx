"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateRecyclerAction } from "@/features/admin/actions/admin-actions";

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
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recyclers</CardTitle>
        <p className="text-sm text-muted-foreground">
          Partner verification for future recycler purchases (Phase 8).
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recyclers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recyclers yet. Assign the Recycler role from Users.
          </p>
        ) : (
          recyclers.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{r.companyName}</p>
                <p className="text-sm text-muted-foreground">
                  {r.name ?? r.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {r.verificationStatus.toLowerCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Inventory lots: {r.inventoryLots}
                  </span>
                </div>
              </div>
              <select
                className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                defaultValue={r.verificationStatus}
                disabled={pending}
                onChange={(e) => {
                  startTransition(async () => {
                    const result = await updateRecyclerAction({
                      recyclerId: r.id,
                      verificationStatus: e.target.value as
                        | "PENDING"
                        | "APPROVED"
                        | "SUSPENDED",
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
