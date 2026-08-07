import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import {
  getMarketplaceHomeSections,
  listCategories,
  listProducts,
} from "@/features/marketplace/services/catalog";
import { getMarketplaceFlags } from "@/features/marketplace/services/marketplace-settings";
import { getWishlistProductIds } from "@/features/marketplace/services/wishlist";
import { getWalletBalance } from "@/features/dashboard/services/dashboard-queries";
import { MarketplaceHero } from "@/features/marketplace/components/marketplace-hero";
import { MarketplaceFilters } from "@/features/marketplace/components/marketplace-filters";
import { ProductGrid } from "@/features/marketplace/components/product-grid";
import { RecommendationCarousel } from "@/features/marketplace/components/recommendation-carousel";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Eco Marketplace",
  description: "Redeem Nature Coins for sustainable products.",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    cursor?: string;
  }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const flags = await getMarketplaceFlags();

  if (!flags.enabled) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <h2 className="font-display text-2xl font-bold">Marketplace paused</h2>
          <p className="mt-2 text-muted-foreground">
            The marketplace is temporarily disabled by an administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasFilters = Boolean(sp.q || (sp.category && sp.category !== "all") || sp.sort);

  const [categories, sections, filtered, coinBalance, wishlistIds] =
    await Promise.all([
      listCategories(),
      hasFilters
        ? Promise.resolve(null)
        : getMarketplaceHomeSections(),
      hasFilters
        ? listProducts({
            q: sp.q,
            category: sp.category,
            sort: sp.sort,
            cursor: sp.cursor,
            take: 24,
            inStock: false,
          })
        : Promise.resolve({ items: [] as Awaited<ReturnType<typeof listProducts>>["items"], nextCursor: undefined }),
      session?.user?.id ? getWalletBalance(session.user.id) : Promise.resolve(0),
      session?.user?.id
        ? getWishlistProductIds(session.user.id)
        : Promise.resolve(new Set<string>()),
    ]);

  const catalogItems = hasFilters
    ? filtered.items
    : (sections?.catalog ?? []);

  const authenticated = Boolean(session?.user);

  return (
    <div className="space-y-8 animate-fade-in">
      <MarketplaceHero
        authenticated={authenticated}
        coinBalance={coinBalance}
      />

      <Suspense fallback={null}>
        <MarketplaceFilters
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.name,
          }))}
        />
      </Suspense>

      {hasFilters || !sections ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">
            {sp.q ? `Results for “${sp.q}”` : "All products"}
          </h2>
          <ProductGrid
            products={catalogItems}
            wishlistIds={wishlistIds}
            authenticated={authenticated}
          />
        </section>
      ) : (
        <>
          <RecommendationCarousel
            title="Featured"
            description="High eco-score picks from live inventory"
            products={sections.featured}
            wishlistIds={wishlistIds}
            href="/marketplace?sort=eco"
            authenticated={authenticated}
          />
          <RecommendationCarousel
            title="Trending"
            description="Popular with NexPlast recyclers"
            products={sections.trending}
            wishlistIds={wishlistIds}
            href="/marketplace?sort=popular"
            authenticated={authenticated}
          />
          <RecommendationCarousel
            title="Recently added"
            products={sections.recentlyAdded}
            wishlistIds={wishlistIds}
            href="/marketplace?sort=newest"
            authenticated={authenticated}
          />
          <RecommendationCarousel
            title="Best redeemable"
            description="Lowest Nature Coin cost"
            products={sections.bestRedeemable}
            wishlistIds={wishlistIds}
            href="/marketplace?sort=coins"
            authenticated={authenticated}
          />
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold">Categories</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`/marketplace?category=${c.slug}`}
                  className="rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-float"
                >
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c._count.products} products
                  </p>
                </a>
              ))}
            </div>
          </section>
          <RecommendationCarousel
            title="Popular products"
            products={sections.popular}
            wishlistIds={wishlistIds}
            authenticated={authenticated}
          />
          <RecommendationCarousel
            title="Recommended for you"
            description="Based on highly rated catalog items"
            products={sections.recommended}
            wishlistIds={wishlistIds}
            authenticated={authenticated}
          />
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold">Full catalog</h2>
            <ProductGrid
              products={catalogItems}
              wishlistIds={wishlistIds}
              authenticated={authenticated}
            />
          </section>
        </>
      )}
    </div>
  );
}
