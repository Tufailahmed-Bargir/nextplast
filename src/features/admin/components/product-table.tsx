"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toggleProductAction } from "@/features/admin/actions/admin-actions";
import { formatCoin, formatNumber } from "@/utils/coin";
import { formatRelative } from "@/utils/date";
import { usePendingAction } from "@/hooks/use-pending-action";

export interface ProductTableRow {
  id: string;
  name: string;
  category: string;
  seller: string;
  priceInr: number;
  priceCoins: number;
  stock: number;
  isActive: boolean;
  orderCount: number;
  createdAt: Date;
}

interface ProductTableProps {
  products: ProductTableRow[];
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const { pending, run, isRunning } = usePendingAction();

  function toggle(id: string, isActive: boolean) {
    run(id, async () => {
      const result = await toggleProductAction({ productId: id, isActive });
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
        <CardTitle>Marketplace products</CardTitle>
        <p className="text-muted-foreground text-sm">
          Catalog readiness for Phase 8 sales — activate or pause products.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No products yet. Empty state prepared for marketplace integration.
          </p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-muted-foreground text-sm">
                  {p.category} · {p.seller} · Stock {p.stock} · {p.orderCount}{" "}
                  order line(s)
                </p>
                <p className="text-muted-foreground text-xs">
                  ₹{formatNumber(Math.round(p.priceInr))} ·{" "}
                  {formatCoin(p.priceCoins)} · {formatRelative(p.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.isActive ? "default" : "secondary"}>
                  {p.isActive ? "active" : "inactive"}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  loading={isRunning(p.id)}
                  onClick={() => toggle(p.id, !p.isActive)}
                >
                  {p.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
