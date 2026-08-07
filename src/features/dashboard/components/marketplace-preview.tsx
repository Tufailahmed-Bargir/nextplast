import Link from "next/link";
import { Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinIcon } from "@/components/shared/brand";
import { formatCoin, formatInr } from "@/utils/coin";
import type { MarketplacePreviewItem } from "@/features/dashboard/types";

interface MarketplacePreviewProps {
  products: MarketplacePreviewItem[];
}

/**
 * Marketplace teaser — real products when catalog exists, empty otherwise.
 */
export function MarketplacePreview({ products }: MarketplacePreviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Marketplace</CardTitle>
        <Link
          href="/marketplace"
          className="text-sm font-medium text-primary hover:underline"
        >
          Browse
        </Link>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Store className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Catalog coming online</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Eco products will appear here once the marketplace catalog is
              published. Your Nature Coins stay ready to redeem.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((product) => (
              <Link
                key={product.id}
                href="/marketplace"
                className="rounded-xl border border-border/60 p-3 transition-all hover:border-primary/40 hover:shadow-soft"
              >
                <p className="text-xs text-muted-foreground">
                  {product.categoryName}
                </p>
                <p className="mt-1 font-medium text-foreground">{product.name}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 coin-text font-semibold">
                    <CoinIcon size={14} />
                    {formatCoin(product.priceCoins)}
                  </span>
                  <span className="text-muted-foreground">
                    or {formatInr(product.priceInr)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
