import "server-only";

import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";

export async function getAdminReports(input?: { from?: Date; to?: Date }) {
  const createdAt =
    input?.from || input?.to
      ? {
          ...(input.from ? { gte: input.from } : {}),
          ...(input.to ? { lte: input.to } : {}),
        }
      : undefined;

  const [
    users,
    listings,
    inventory,
    orders,
    walletTx,
    impact,
  ] = await Promise.all([
    prisma.user.findMany({
      where: createdAt ? { createdAt } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.plasticListing.findMany({
      where: {
        deletedAt: null,
        ...(createdAt ? { createdAt } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        status: true,
        quality: true,
        claimedWeightGrams: true,
        actualWeightGrams: true,
        estimatedCoins: true,
        finalCoins: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
    prisma.inventory.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        category: { select: { name: true } },
      },
    }),
    prisma.order.findMany({
      where: createdAt ? { createdAt } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { email: true } } },
    }),
    prisma.walletTransaction.findMany({
      where: createdAt ? { createdAt } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        wallet: { include: { user: { select: { email: true } } } },
      },
    }),
    prisma.environmentalImpact.findMany({
      orderBy: { plasticRecycledGrams: "desc" },
      take: 100,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    })),
    listings: listings.map((l) => ({
      id: l.id,
      status: l.status,
      quality: l.quality,
      claimedWeightGrams: l.claimedWeightGrams,
      actualWeightGrams: l.actualWeightGrams,
      estimatedCoins: decimalToNumber(l.estimatedCoins),
      finalCoins: decimalToNumber(l.finalCoins),
      userEmail: l.user.email,
      createdAt: l.createdAt,
    })),
    inventory: inventory.map((i) => ({
      id: i.id,
      category: i.category.name,
      grade: i.grade,
      ownerType: i.ownerType,
      quantityGrams: i.quantityGrams,
      status: i.status,
    })),
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      paymentMode: o.paymentMode,
      cashAmountInr: decimalToNumber(o.cashAmountInr),
      coinAmount: decimalToNumber(o.coinAmount),
      userEmail: o.user.email,
      createdAt: o.createdAt,
    })),
    wallet: walletTx.map((t) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      amount: decimalToNumber(t.amount),
      userEmail: t.wallet.user.email,
      createdAt: t.createdAt,
    })),
    impact: impact.map((i) => ({
      userId: i.userId,
      userName: i.user.name ?? i.user.email,
      plasticRecycledGrams: i.plasticRecycledGrams,
      co2SavedKg: decimalToNumber(i.co2SavedKg),
      treesSaved: decimalToNumber(i.treesSaved),
    })),
  };
}
