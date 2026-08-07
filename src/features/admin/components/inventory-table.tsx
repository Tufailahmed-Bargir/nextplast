"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adjustInventoryAction } from "@/features/admin/actions/admin-actions";
import { formatWeight } from "@/utils/coin";

export interface InventoryTableRow {
  id: string;
  category: string;
  grade: string;
  ownerType: string;
  quantityGrams: number;
  status: string;
}

interface InventoryTableProps {
  rows: InventoryTableRow[];
}

export function InventoryTable({ rows }: InventoryTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deltas, setDeltas] = useState<Record<string, string>>({});

  function adjust(id: string) {
    const delta = Number(deltas[id] ?? 0);
    if (!delta) {
      toast.error("Enter a non-zero gram delta.");
      return;
    }
    startTransition(async () => {
      const result = await adjustInventoryAction({
        inventoryId: id,
        deltaGrams: delta,
        notes: "Admin panel adjustment",
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDeltas((prev) => ({ ...prev, [id]: "" }));
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <p className="text-sm text-muted-foreground">
          Platform and recycler stock from collector handoffs.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No inventory yet. Complete collector verifications to stock plastic.
          </p>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {row.category} · Grade {row.grade}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{row.ownerType.toLowerCase()}</Badge>
                  <Badge variant="secondary">{row.status.toLowerCase()}</Badge>
                  <span>{formatWeight(row.quantityGrams)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  className="w-28"
                  type="number"
                  placeholder="± grams"
                  value={deltas[row.id] ?? ""}
                  onChange={(e) =>
                    setDeltas((prev) => ({ ...prev, [row.id]: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  onClick={() => adjust(row.id)}
                >
                  Adjust
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
