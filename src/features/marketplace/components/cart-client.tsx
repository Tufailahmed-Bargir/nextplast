"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  removeCartAction,
  updateCartAction,
} from "@/features/marketplace/actions/marketplace-actions";
import { formatCoin, formatInr } from "@/utils/coin";
import { CoinIcon } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

interface CartClientProps {
  cart: {
    items: {
      productId: string;
      quantity: number;
      lineInr: number;
      lineCoins: number;
      product: {
        name: string;
        slug: string;
        stock: number;
        imageUrl: string | null;
        priceInr: number;
        priceCoins: number;
      };
    }[];
    itemCount: number;
    subtotalInr: number;
    subtotalCoins: number;
  };
}

export function CartClient({ cart }: CartClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setQty(productId: string, quantity: number) {
    startTransition(async () => {
      const result = await updateCartAction({ productId, quantity });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function remove(productId: string) {
    startTransition(async () => {
      const result = await removeCartAction(productId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  if (cart.items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link
            href="/marketplace"
            className={cn(buttonVariants(), "mt-4 inline-flex")}
          >
            Browse marketplace
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {cart.items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex gap-4 p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Link
                  href={`/marketplace/${item.product.slug}`}
                  className="font-semibold hover:underline"
                >
                  {item.product.name}
                </Link>
                <div className="flex items-center gap-2 text-sm">
                  <CoinIcon className="h-4 w-4" />
                  {formatCoin(item.product.priceCoins)} ·{" "}
                  {formatInr(item.product.priceInr)}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={pending || item.quantity <= 1}
                    onClick={() => setQty(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={
                      pending || item.quantity >= item.product.stock
                    }
                    onClick={() => setQty(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => remove(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right text-sm font-semibold">
                <p>{formatCoin(item.lineCoins)}</p>
                <p className="text-muted-foreground">
                  {formatInr(item.lineInr)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Cart totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="flex justify-between">
            <span className="text-muted-foreground">Items</span>
            <span>{cart.itemCount}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground">Subtotal (cash)</span>
            <span>{formatInr(cart.subtotalInr)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground">Subtotal (coins)</span>
            <span>{formatCoin(cart.subtotalCoins)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Hybrid split and shipping are calculated at checkout.
          </p>
          <Link href="/checkout" className={cn(buttonVariants(), "w-full")}>
            Checkout
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
