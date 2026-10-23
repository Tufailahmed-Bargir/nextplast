import Link from "next/link";
import { ProductCard } from "@/features/marketplace/components/product-card";
import type { ProductListItem } from "@/features/marketplace/services/catalog";

interface RecommendationCarouselProps {
  title: string;
  description?: string;
  products: ProductListItem[];
  wishlistIds?: Set<string>;
  href?: string;
  authenticated?: boolean;
}

export function RecommendationCarousel({
  title,
  description,
  products,
  wishlistIds,
  href,
  authenticated = true,
}: RecommendationCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
          >
            View all
          </Link>
        ) : null}
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="w-56 shrink-0 snap-start sm:w-64">
            <ProductCard
              product={product}
              wished={wishlistIds?.has(product.id) ?? false}
              authenticated={authenticated}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
