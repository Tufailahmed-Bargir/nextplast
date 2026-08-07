import Link from "next/link";
import Image from "next/image";
import { Leaf, Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCoin, formatInr } from "@/utils/coin";
import { CoinIcon } from "@/components/shared/brand";
import { WishlistButton } from "@/features/marketplace/components/wishlist-button";
import { AddToCartButton } from "@/features/marketplace/components/add-to-cart-button";
import type { ProductListItem } from "@/features/marketplace/services/catalog";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductListItem;
  wished?: boolean;
  showActions?: boolean;
  authenticated?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  wished = false,
  showActions = true,
  authenticated = true,
  className,
}: ProductCardProps) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-float",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted/40">
        <Link href={`/marketplace/${product.slug}`} className="block h-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8" />
            </div>
          )}
        </Link>
        {showActions && authenticated ? (
          <div className="absolute right-2.5 top-2.5">
            <WishlistButton productId={product.id} initialWished={wished} />
          </div>
        ) : null}
        {product.ecoScore != null ? (
          <div className="absolute left-2.5 top-2.5">
            <span className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold backdrop-blur">
              <Leaf className="h-3 w-3 text-emerald-600" />
              {product.ecoScore}
            </span>
          </div>
        ) : null}
        {product.stock <= 0 ? (
          <Badge className="absolute bottom-2.5 left-2.5" variant="secondary">
            Out of stock
          </Badge>
        ) : null}
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <Link href={`/marketplace/${product.slug}`}>
          <h3 className="line-clamp-1 text-sm font-semibold hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {product.ratingAvg.toFixed(1)} ({product.reviewCount})
        </div>
        <div className="mt-auto space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CoinIcon className="h-4 w-4" />
              <span className="font-display text-lg font-bold">
                {formatCoin(product.priceCoins)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatInr(product.priceInr)}
            </span>
          </div>
          {showActions ? (
            authenticated ? (
              <AddToCartButton
                productId={product.id}
                disabled={product.stock <= 0}
                size="sm"
                className="w-full"
              />
            ) : (
              <Link
                href={`/login?callbackUrl=/marketplace/${product.slug}`}
                className="inline-flex h-7 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground"
              >
                Sign in to buy
              </Link>
            )
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
