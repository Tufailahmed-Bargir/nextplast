"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleWishlistAction } from "@/features/marketplace/actions/marketplace-actions";

interface WishlistButtonProps {
  productId: string;
  initialWished?: boolean;
  className?: string;
}

export function WishlistButton({
  productId,
  initialWished = false,
  className,
}: WishlistButtonProps) {
  const router = useRouter();
  const [wished, setWished] = useState(initialWished);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleWishlistAction({ productId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setWished(result.data.wished);
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={toggle}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition hover:scale-110",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          wished ? "fill-red-500 text-red-500" : "text-foreground",
        )}
      />
    </button>
  );
}
