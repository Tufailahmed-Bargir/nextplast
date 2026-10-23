"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/features/marketplace/actions/marketplace-actions";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
}

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled,
  size = "default",
  className,
  label = "Add to cart",
}: AddToCartButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const result = await addToCartAction({ productId, quantity });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={disabled}
      loading={pending}
      onClick={add}
      className={cn(className)}
    >
      <ShoppingCart className="mr-1.5 h-4 w-4" />
      {pending ? "Adding…" : label}
    </Button>
  );
}
