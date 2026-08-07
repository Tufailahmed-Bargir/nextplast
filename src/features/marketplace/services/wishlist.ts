import "server-only";

import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";
import { assertMarketplaceEnabled } from "@/features/marketplace/services/marketplace-settings";
import { addToCart } from "@/features/marketplace/services/cart";

export async function listWishlist(userId: string) {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          category: { select: { name: true } },
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  return rows
    .filter((r) => r.product.isActive && !r.product.deletedAt)
    .map((r) => {
      const reviewCount = r.product.reviews.length;
      const ratingAvg =
        reviewCount === 0
          ? 0
          : r.product.reviews.reduce((s, x) => s + x.rating, 0) / reviewCount;
      return {
        id: r.id,
        productId: r.productId,
        createdAt: r.createdAt,
        product: {
          id: r.product.id,
          name: r.product.name,
          slug: r.product.slug,
          priceInr: decimalToNumber(r.product.priceInr),
          priceCoins: decimalToNumber(r.product.priceCoins),
          stock: r.product.stock,
          ecoScore: r.product.ecoScore,
          category: r.product.category.name,
          imageUrl: r.product.images[0]?.url ?? null,
          ratingAvg: Number(ratingAvg.toFixed(1)),
          reviewCount,
        },
      };
    });
}

export async function isInWishlist(userId: string, productId: string) {
  const row = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return Boolean(row);
}

export async function getWishlistProductIds(userId: string) {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}

export async function toggleWishlist(userId: string, productId: string) {
  await assertMarketplaceEnabled();

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true, deletedAt: null },
  });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return { wished: false };
  }

  await prisma.wishlist.create({
    data: { userId, productId },
  });
  return { wished: true };
}

export async function moveWishlistToCart(userId: string, productId: string) {
  await addToCart({ userId, productId, quantity: 1 });
  await prisma.wishlist.deleteMany({ where: { userId, productId } });
  return { moved: true };
}
