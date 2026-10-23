"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  moveWishlistToCartAction,
  toggleWishlistAction,
} from "@/features/marketplace/actions/marketplace-actions";
import { formatCoin, formatInr } from "@/utils/coin";
import { cn } from "@/lib/utils";
import { usePendingAction } from "@/hooks/use-pending-action";

interface WishlistClientProps {
  items: {
    productId: string;
    product: {
      name: string;
      slug: string;
      priceInr: number;
      priceCoins: number;
      imageUrl: string | null;
      stock: number;
    };
  }[];
}

export function WishlistClient({ items }: WishlistClientProps) {
  const router = useRouter();
  const { pending, run, isRunning } = usePendingAction();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Link
            href="/marketplace"
            className={cn(buttonVariants(), "mt-4 inline-flex")}
          >
            Discover products
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.productId}>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="bg-muted relative h-20 w-20 overflow-hidden rounded-xl">
              {item.product.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <Link
                href={`/marketplace/${item.product.slug}`}
                className="font-semibold hover:underline"
              >
                {item.product.name}
              </Link>
              <p className="text-muted-foreground text-sm">
                {formatCoin(item.product.priceCoins)} ·{" "}
                {formatInr(item.product.priceInr)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={pending || item.product.stock <= 0}
                loading={isRunning(`move:${item.productId}`)}
                onClick={() =>
                  run(`move:${item.productId}`, async () => {
                    const result = await moveWishlistToCartAction(
                      item.productId,
                    );
                    if (!result.success) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(result.message);
                    router.refresh();
                  })
                }
              >
                Move to cart
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                loading={isRunning(`remove:${item.productId}`)}
                onClick={() =>
                  run(`remove:${item.productId}`, async () => {
                    const result = await toggleWishlistAction({
                      productId: item.productId,
                    });
                    if (!result.success) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(result.message);
                    router.refresh();
                  })
                }
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
