import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Share2, Star } from "lucide-react";
import { auth } from "@/auth";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/features/marketplace/services/catalog";
import { isInWishlist } from "@/features/marketplace/services/wishlist";
import { userHasPurchasedProduct } from "@/features/marketplace/services/orders";
import { getMarketplaceFlags } from "@/features/marketplace/services/marketplace-settings";
import { ProductGallery } from "@/features/marketplace/components/product-gallery";
import { PriceDisplay } from "@/features/marketplace/components/price-display";
import { EcoScoreCard } from "@/features/marketplace/components/eco-score-card";
import { WishlistButton } from "@/features/marketplace/components/wishlist-button";
import { AddToCartButton } from "@/features/marketplace/components/add-to-cart-button";
import { ReviewCard } from "@/features/marketplace/components/review-card";
import { ReviewForm } from "@/features/marketplace/components/review-form";
import { RecommendationCarousel } from "@/features/marketplace/components/recommendation-carousel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.description ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const flags = await getMarketplaceFlags();
  if (!flags.enabled) notFound();

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();
  const [wished, canReview, related] = await Promise.all([
    session?.user?.id
      ? isInWishlist(session.user.id, product.id)
      : Promise.resolve(false),
    session?.user?.id
      ? userHasPurchasedProduct(session.user.id, product.id)
      : Promise.resolve(false),
    getRelatedProducts(product.id, product.category.id),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">
              {product.category.name}
            </p>
            <h1 className="font-display text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {product.ratingAvg.toFixed(1)} ({product.reviewCount} reviews)
              </div>
              <Badge variant={product.stock > 0 ? "secondary" : "outline"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </Badge>
            </div>
          </div>

          <PriceDisplay
            priceInr={product.priceInr}
            priceCoins={product.priceCoins}
            hybridCashInr={product.hybridCashInr}
            hybridCoins={product.hybridCoins}
            size="lg"
          />

          <p className="text-sm text-muted-foreground">
            {product.description ?? "Sustainable product from the NexPlast circular catalog."}
          </p>

          <div className="flex flex-wrap gap-2">
            {session?.user ? (
              <>
                <AddToCartButton
                  productId={product.id}
                  disabled={product.stock <= 0}
                  label="Add to cart"
                />
                <WishlistButton
                  productId={product.id}
                  initialWished={wished}
                  className="h-10 w-10 border border-border"
                />
              </>
            ) : (
              <Link
                href={`/login?callbackUrl=/marketplace/${product.slug}`}
                className={cn(buttonVariants())}
              >
                Sign in to purchase
              </Link>
            )}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(`${process.env.NEXTAUTH_URL ?? ""}/marketplace/${product.slug}`)}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </a>
          </div>

          <EcoScoreCard
            ecoScore={product.ecoScore}
            materials={product.materials}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Materials</span>
                <span>
                  {product.materials.length
                    ? product.materials.join(", ")
                    : "—"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Seller</span>
                <span>
                  {product.seller?.name ?? "NexPlast Platform"} (future-ready)
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Standard free · Express ₹79</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold">Reviews</h2>
          {product.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            product.reviews.map((r) => (
              <ReviewCard
                key={r.id}
                rating={r.rating}
                comment={r.comment}
                userName={r.userName}
                createdAt={r.createdAt}
              />
            ))
          )}
          {session?.user ? (
            <ReviewForm productId={product.id} canReview={canReview} />
          ) : null}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Can I pay with coins?</strong>
              <br />
              Yes — coins, cash, or hybrid at checkout.
            </p>
            <p>
              <strong className="text-foreground">Are coins cash?</strong>
              <br />
              No. Nature Coins are marketplace-only and not withdrawable.
            </p>
            <p>
              <strong className="text-foreground">Returns?</strong>
              <br />
              Contact support for damaged items. Coupons and advanced shipping
              are future-ready.
            </p>
          </CardContent>
        </Card>
      </section>

      <RecommendationCarousel
        title="Related products"
        products={related}
      />
    </div>
  );
}
