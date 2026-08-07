import "server-only";

import { ListingStatus, OrderStatus, PickupStatus, UserRole } from "@prisma/client";
import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";

/**
 * Aggregated platform overview for the admin dashboard.
 */
export async function getAdminDashboardStats() {
  const [
    userCount,
    collectorCount,
    recyclerCount,
    sellerCount,
    activeUsers,
    pickupRequested,
    pickupAssigned,
    pickupCompleted,
    listingPendingReview,
    listingAwaiting,
    listingCompleted,
    productCount,
    activeProducts,
    orderCount,
    completedOrders,
    walletAgg,
    inventoryAgg,
    impactAgg,
    recentOrders,
    gmv,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.collector.count(),
    prisma.recycler.count(),
    prisma.user.count({ where: { role: UserRole.SELLER } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.pickupRequest.count({ where: { status: PickupStatus.REQUESTED } }),
    prisma.pickupRequest.count({
      where: {
        status: {
          in: [
            PickupStatus.ASSIGNED,
            PickupStatus.SCHEDULED,
            PickupStatus.IN_TRANSIT,
            PickupStatus.IN_PROGRESS,
            PickupStatus.AWAITING_VERIFICATION,
            PickupStatus.AWAITING_SIGNATURE,
          ],
        },
      },
    }),
    prisma.pickupRequest.count({ where: { status: PickupStatus.COMPLETED } }),
    prisma.plasticListing.count({
      where: { status: ListingStatus.PENDING_REVIEW, deletedAt: null },
    }),
    prisma.plasticListing.count({
      where: { status: ListingStatus.AWAITING_COLLECTOR, deletedAt: null },
    }),
    prisma.plasticListing.count({
      where: { status: ListingStatus.COMPLETED, deletedAt: null },
    }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.wallet.aggregate({
      _sum: {
        availableBalance: true,
        earnedTotal: true,
        spentTotal: true,
      },
    }),
    prisma.inventory.aggregate({ _sum: { quantityGrams: true } }),
    prisma.environmentalImpact.aggregate({
      _sum: {
        plasticRecycledGrams: true,
        co2SavedKg: true,
        treesSaved: true,
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.aggregate({
      where: {
        status: {
          in: [
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      _sum: { cashAmountInr: true, coinAmount: true },
    }),
  ]);

  return {
    users: {
      total: userCount,
      active: activeUsers,
      collectors: collectorCount,
      recyclers: recyclerCount,
      sellers: sellerCount,
    },
    pickups: {
      requested: pickupRequested,
      inFlight: pickupAssigned,
      completed: pickupCompleted,
    },
    listings: {
      pendingReview: listingPendingReview,
      awaitingCollector: listingAwaiting,
      completed: listingCompleted,
    },
    marketplace: {
      products: productCount,
      activeProducts,
      orders: orderCount,
      deliveredOrders: completedOrders,
      gmvInr: decimalToNumber(gmv._sum.cashAmountInr),
      gmvCoins: decimalToNumber(gmv._sum.coinAmount),
    },
    wallet: {
      available: decimalToNumber(walletAgg._sum.availableBalance),
      earned: decimalToNumber(walletAgg._sum.earnedTotal),
      spent: decimalToNumber(walletAgg._sum.spentTotal),
    },
    inventoryGrams: inventoryAgg._sum.quantityGrams ?? 0,
    impact: {
      plasticRecycledGrams: impactAgg._sum.plasticRecycledGrams ?? 0,
      co2SavedKg: decimalToNumber(impactAgg._sum.co2SavedKg),
      treesSaved: decimalToNumber(impactAgg._sum.treesSaved),
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      status: o.status,
      cashAmountInr: decimalToNumber(o.cashAmountInr),
      coinAmount: decimalToNumber(o.coinAmount),
      userName: o.user.name ?? o.user.email,
      itemCount: o._count.items,
      createdAt: o.createdAt,
    })),
  };
}
