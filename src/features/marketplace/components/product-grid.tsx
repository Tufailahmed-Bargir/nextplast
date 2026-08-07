import { ProductCard } from "@/features/marketplace/components/product-card";
import type { ProductListItem } from "@/features/marketplace/services/catalog";

interface ProductGridProps {
  products: ProductListItem[];
  wishlistIds?: Set<string> | string[];
  authenticated?: boolean;
}

export function ProductGrid({
  products,
  wishlistIds,
  authenticated = true,
}: ProductGridProps) {
  const wished =
    wishlistIds instanceof Set
      ? wishlistIds
      : new Set(wishlistIds ?? []);

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No products match your filters yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          wished={wished.has(product.id)}
          authenticated={authenticated}
        />
      ))}
    </div>
  );
}
