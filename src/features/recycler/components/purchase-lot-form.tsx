"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purchaseLotAction } from "@/features/recycler/actions/recycler-actions";
import { formatWeight } from "@/utils/coin";

interface PurchaseLotFormProps {
  inventoryId: string;
  availableGrams: number;
}

export function PurchaseLotForm({
  inventoryId,
  availableGrams,
}: PurchaseLotFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await purchaseLotAction({
            platformInventoryId: inventoryId,
            quantityGrams: Number(fd.get("quantityGrams") || 0),
            unitPriceInrPerKg: Number(fd.get("unitPriceInrPerKg") || 0),
          });
          if (result.success) toast.success(result.message);
          else toast.error(result.error);
          // Refresh on every outcome so the available stock badge and max stay current.
          router.refresh();
        });
      }}
    >
      <div className="space-y-1">
        <Label htmlFor={`qty-${inventoryId}`}>Grams</Label>
        <Input
          id={`qty-${inventoryId}`}
          name="quantityGrams"
          type="number"
          min={1}
          max={availableGrams}
          defaultValue={Math.min(1000, availableGrams)}
          className="w-28"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`price-${inventoryId}`}>₹ / kg</Label>
        <Input
          id={`price-${inventoryId}`}
          name="unitPriceInrPerKg"
          type="number"
          min={0}
          step="0.5"
          placeholder="Enter price"
          className="w-24"
          required
        />
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={availableGrams <= 0}
        loading={pending}
      >
        Buy (max {formatWeight(availableGrams)})
      </Button>
    </form>
  );
}
