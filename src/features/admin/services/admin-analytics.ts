import "server-only";

import { OrderStatus, UserRole } from "@prisma/client";
import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Concise analytics from live Prisma aggregates (no mocks).
 */
export async function getAdminAnalytics() {
  const now = new Date();
  const months: { key: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ key: monthKey(start), start, end });
  }

  const [
    plasticByMonth,
    userGrowth,
    inventoryByGrade,
    coinSpend,
    coinEarn,
    coinAdjust,
    recyclerPurchases,
    marketplaceOrders,
  ] = await Promise.all([
    Promise.all(
      months.map(async (m) => {
        const verifications = await prisma.collectorVerification.aggregate({
          where: { verifiedAt: { gte: m.start, lt: m.end } },
          _sum: { actualWeightGrams: true },
        });
        return {
          month: m.key,
          grams: verifications._sum.actualWeightGrams ?? 0,
        };
      }),
    ),
    Promise.all(
      months.map(async (m) => ({
        month: m.key,
        users: await prisma.user.count({
          where: { createdAt: { gte: m.start, lt: m.end } },
        }),
      })),
    ),
    prisma.inventory.groupBy({
      by: ["grade"],
      _sum: { quantityGrams: true },
    }),
    prisma.walletTransaction.aggregate({
      where: { type: "SPEND", status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: { type: { in: ["EARN", "BONUS"] }, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: { type: "ADJUST", status: "COMPLETED" },
      _sum: { amount: true },
    }),
    // Recycler purchases prepared for Phase 8 — currently empty-ready count of recycler-owned inventory
    prisma.inventory.count({
      where: { ownerType: "RECYCLER" },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const deliveredGmv = await prisma.order.aggregate({
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
  });

  return {
    plasticCollected: plasticByMonth,
    userGrowth,
    inventoryLevels: inventoryByGrade.map((g) => ({
      grade: g.grade,
      grams: g._sum.quantityGrams ?? 0,
    })),
    natureCoinUsage: {
      earned: decimalToNumber(coinEarn._sum.amount),
      spent: decimalToNumber(coinSpend._sum.amount),
      adjusted: decimalToNumber(coinAdjust._sum.amount),
    },
    recyclerInventoryLots: recyclerPurchases,
    marketplaceActivity: {
      byStatus: marketplaceOrders.map((o) => ({
        status: o.status,
        count: o._count._all,
      })),
      gmvInr: decimalToNumber(deliveredGmv._sum.cashAmountInr),
      gmvCoins: decimalToNumber(deliveredGmv._sum.coinAmount),
    },
    roleCounts: {
      users: await prisma.user.count({ where: { role: UserRole.USER } }),
      collectors: await prisma.collector.count(),
      recyclers: await prisma.recycler.count(),
    },
  };
}
