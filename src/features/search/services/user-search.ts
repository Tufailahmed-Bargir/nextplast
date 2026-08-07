import "server-only";

import { prisma } from "@/prisma";
import { ListingStatus, OrderStatus } from "@prisma/client";

/**
 * User-facing global search across products, own listings, and own orders.
 */
export async function globalUserSearch(userId: string, query: string) {
  const q = query.trim();
  if (q.length < 2) {
    return { products: [], listings: [], orders: [] };
  }

  const statusListing = Object.values(ListingStatus).find(
    (s) => s === q.toUpperCase(),
  );
  const statusOrder = Object.values(OrderStatus).find(
    (s) => s === q.toUpperCase(),
  );

  const [products, listings, orders] = await Promise.all([
    prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        priceInr: true,
        priceCoins: true,
      },
    }),
    prisma.plasticListing.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { id: { contains: q } },
          { notes: { contains: q, mode: "insensitive" } },
          ...(statusListing ? [{ status: statusListing }] : []),
        ],
      },
      take: 8,
      select: {
        id: true,
        status: true,
        claimedWeightGrams: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: {
        userId,
        OR: [
          { id: { contains: q } },
          ...(statusOrder ? [{ status: statusOrder }] : []),
        ],
      },
      take: 8,
      select: {
        id: true,
        status: true,
        cashAmountInr: true,
        coinAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { products, listings, orders };
}
