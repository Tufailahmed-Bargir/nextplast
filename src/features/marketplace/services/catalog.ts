import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInr: number;
  priceCoins: number;
  hybridCashInr: number | null;
  hybridCoins: number | null;
  stock: number;
  ecoScore: number | null;
  materials: string[];
  category: { id: string; name: string; slug: string };
  imageUrl: string | null;
  ratingAvg: number;
  reviewCount: number;
  createdAt: Date;
};

function mapProduct(
  p: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    priceInr: Prisma.Decimal;
    priceCoins: Prisma.Decimal;
    hybridCashInr: Prisma.Decimal | null;
    hybridCoins: Prisma.Decimal | null;
    stock: number;
    ecoScore: number | null;
    materials: string[];
    createdAt: Date;
    category: { id: string; name: string; slug: string };
    images: { url: string; isPrimary: boolean; sortOrder: number }[];
    reviews: { rating: number }[];
    _count?: { reviews: number };
  },
): ProductListItem {
  const sample = p.reviews;
  const reviewCount = p._count?.reviews ?? sample.length;
  const ratingAvg =
    sample.length === 0
      ? 0
      : sample.reduce((s, r) => s + r.rating, 0) / sample.length;
  const primary =
    p.images.find((i) => i.isPrimary) ??
    [...p.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    priceInr: decimalToNumber(p.priceInr),
    priceCoins: decimalToNumber(p.priceCoins),
    hybridCashInr:
      p.hybridCashInr != null ? decimalToNumber(p.hybridCashInr) : null,
    hybridCoins:
      p.hybridCoins != null ? decimalToNumber(p.hybridCoins) : null,
    stock: p.stock,
    ecoScore: p.ecoScore,
    materials: p.materials,
    category: p.category,
    imageUrl: primary?.url ?? null,
    ratingAvg: Number(ratingAvg.toFixed(1)),
    reviewCount,
    createdAt: p.createdAt,
  };
}

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: {
    select: { url: true, isPrimary: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
    take: 3,
  },
  // Cap reviews pulled for list cards (avoids loading every rating row).
  reviews: { select: { rating: true }, take: 20 },
  _count: { select: { reviews: true } },
} satisfies Prisma.ProductInclude;

export async function listCategories() {
  return prisma.marketplaceCategory.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { products: { where: { isActive: true, deletedAt: null } } } },
    },
  });
}

export async function listProducts(input?: {
  q?: string;
  category?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  minCoins?: number;
  maxCoins?: number;
  minRating?: number;
  minEco?: number;
  inStock?: boolean;
  cursor?: string;
  take?: number;
}) {
  const take = input?.take ?? 24;
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
  };

  if (input?.category && input.category !== "all") {
    where.category = { slug: input.category };
  }
  if (input?.q) {
    const q = input.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { materials: { has: q } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (input?.minPrice != null || input?.maxPrice != null) {
    where.priceInr = {
      ...(input.minPrice != null ? { gte: input.minPrice } : {}),
      ...(input.maxPrice != null ? { lte: input.maxPrice } : {}),
    };
  }
  if (input?.minCoins != null || input?.maxCoins != null) {
    where.priceCoins = {
      ...(input.minCoins != null ? { gte: input.minCoins } : {}),
      ...(input.maxCoins != null ? { lte: input.maxCoins } : {}),
    };
  }
  if (input?.minEco != null) {
    where.ecoScore = { gte: input.minEco };
  }
  if (input?.inStock) {
    where.stock = { gt: 0 };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (input?.sort) {
      case "newest":
        return [{ createdAt: "desc" }];
      case "price_asc":
        return [{ priceInr: "asc" }];
      case "price_desc":
        return [{ priceInr: "desc" }];
      case "coins":
        return [{ priceCoins: "asc" }];
      case "eco":
        return [{ ecoScore: "desc" }, { createdAt: "desc" }];
      case "rating":
      case "popular":
      default:
        return [{ createdAt: "desc" }];
    }
  })();

  const rows = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy,
    take: take + 1,
    ...(input?.cursor
      ? { cursor: { id: input.cursor }, skip: 1 }
      : {}),
  });

  let mapped = rows.map(mapProduct);
  if (input?.minRating != null && input.minRating > 0) {
    mapped = mapped.filter((p) => p.ratingAvg >= input.minRating!);
  }
  if (input?.sort === "rating" || input?.sort === "popular") {
    mapped = [...mapped].sort((a, b) =>
      input.sort === "rating"
        ? b.ratingAvg - a.ratingAvg || b.reviewCount - a.reviewCount
        : b.reviewCount - a.reviewCount || b.ratingAvg - a.ratingAvg,
    );
  }

  const hasMore = mapped.length > take;
  const items = hasMore ? mapped.slice(0, take) : mapped;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return { items, nextCursor };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      seller: { select: { id: true, name: true, email: true } },
    },
  });
  if (!product) return null;

  const reviewCount = product.reviews.length;
  const ratingAvg =
    reviewCount === 0
      ? 0
      : product.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount;
  const primary =
    product.images.find((i) => i.isPrimary) ?? product.images[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceInr: decimalToNumber(product.priceInr),
    priceCoins: decimalToNumber(product.priceCoins),
    hybridCashInr:
      product.hybridCashInr != null
        ? decimalToNumber(product.hybridCashInr)
        : null,
    hybridCoins:
      product.hybridCoins != null
        ? decimalToNumber(product.hybridCoins)
        : null,
    stock: product.stock,
    ecoScore: product.ecoScore,
    materials: product.materials,
    category: product.category,
    imageUrl: primary?.url ?? null,
    ratingAvg: Number(ratingAvg.toFixed(1)),
    reviewCount,
    createdAt: product.createdAt,
    images: product.images.map((i) => ({
      id: i.id,
      url: i.url,
      isPrimary: i.isPrimary,
    })),
    seller: product.seller
      ? {
          id: product.seller.id,
          name: product.seller.name,
          email: product.seller.email,
        }
      : null,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userName: r.user.name ?? "Buyer",
      userImage: r.user.image,
    })),
  };
}

export async function getMarketplaceHomeSections() {
  // Single catalog pull — bucket in memory (avoids 5 parallel Neon round-trips).
  const pool = await listProducts({ sort: "newest", take: 40, inStock: true });
  const items = pool.items;

  const byEco = [...items].sort(
    (a, b) => (b.ecoScore ?? 0) - (a.ecoScore ?? 0),
  );
  const byCoins = [...items].sort((a, b) => a.priceCoins - b.priceCoins);
  const byRating = [...items].sort(
    (a, b) =>
      b.ratingAvg - a.ratingAvg || b.reviewCount - a.reviewCount,
  );
  const byPopular = [...items].sort(
    (a, b) =>
      b.reviewCount - a.reviewCount || b.ratingAvg - a.ratingAvg,
  );

  return {
    featured: byEco.slice(0, 8),
    trending: byPopular.slice(0, 8),
    recentlyAdded: items.slice(0, 8),
    bestRedeemable: byCoins.slice(0, 8),
    popular: byPopular.slice(0, 8),
    recommended: byRating.slice(0, 6),
    catalog: items.slice(0, 24),
  };
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  take = 4,
) {
  const rows = await prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      isActive: true,
      deletedAt: null,
      stock: { gt: 0 },
    },
    include: productInclude,
    take,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProduct);
}
