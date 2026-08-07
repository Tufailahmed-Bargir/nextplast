import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import type { RecommendationItem } from "@/features/ai/types";

export type { RecommendationItem } from "@/features/ai/types";

/**
 * Rule-based recommendation abstraction (no ML models in Phase 9).
 * Call with `persist: true` to store history in AuditLog.
 */
export async function generateRecommendations(
  userId: string,
  options?: { persist?: boolean },
): Promise<{
  items: RecommendationItem[];
  generatedAt: string;
}> {
  const persist = options?.persist ?? true;
  const [
    wallet,
    listingStats,
    recentCategories,
    orderCount,
    impact,
    leaderboardEntries,
  ] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.plasticListing.groupBy({
      by: ["status"],
      where: { userId, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.listingItem.findMany({
      where: { listing: { userId, deletedAt: null } },
      select: { category: { select: { name: true, resinType: true } } },
      take: 20,
      orderBy: { id: "desc" },
    }),
    prisma.order.count({ where: { userId } }),
    prisma.environmentalImpact.findUnique({ where: { userId } }),
    prisma.leaderboard.count({ where: { userId } }),
  ]);

  const items: RecommendationItem[] = [];
  const balance = wallet ? Number(wallet.availableBalance) : 0;
  const draftCount =
    listingStats.find((s) => s.status === "DRAFT")?._count._all ?? 0;
  const completedCount =
    listingStats.find((s) => s.status === "COMPLETED")?._count._all ?? 0;
  const month = new Date().getMonth(); // 0-11

  if (draftCount > 0) {
    items.push({
      id: "finish-draft",
      title: "Finish your draft listing",
      description: `You have ${draftCount} unfinished plastic listing(s). Complete pickup details to earn Nature Coins.`,
      href: "/sell",
      category: "recycling",
      priority: 100,
    });
  } else {
    items.push({
      id: "sell-more",
      title: "Sell plastic this week",
      description:
        "Upload photos for AI detection and schedule a collector pickup.",
      href: "/sell",
      category: "recycling",
      priority: 70,
    });
  }

  if (balance >= 10) {
    items.push({
      id: "redeem-coins",
      title: "Redeem Nature Coins",
      description: `You have ${balance.toFixed(1)} coins — browse eco products in the marketplace.`,
      href: "/marketplace",
      category: "marketplace",
      priority: 90,
    });
  } else if (balance < 2 && completedCount > 0) {
    items.push({
      id: "earn-more",
      title: "Grow your wallet",
      description: "List more recyclable plastic to unlock marketplace rewards.",
      href: "/sell",
      category: "wallet",
      priority: 80,
    });
  }

  const topResin = recentCategories
    .map((c) => c.category?.resinType ?? c.category?.name)
    .filter(Boolean)[0];
  if (topResin) {
    items.push({
      id: "category-focus",
      title: `Keep sorting ${topResin}`,
      description:
        "Consistent categories help collectors verify faster and improve AI accuracy.",
      href: "/listings",
      category: "plastic",
      priority: 60,
    });
  }

  if (orderCount === 0 && balance >= 5) {
    items.push({
      id: "first-order",
      title: "Try the marketplace",
      description: "Use hybrid cash + coin checkout on your first eco purchase.",
      href: "/marketplace",
      category: "marketplace",
      priority: 75,
    });
  }

  const co2 = impact ? Number(impact.co2SavedKg) : 0;
  if (co2 > 0) {
    items.push({
      id: "impact",
      title: "Your impact is growing",
      description: `You've helped avoid about ${co2.toFixed(1)} kg CO₂ — check your dashboard badges.`,
      href: "/dashboard",
      category: "impact",
      priority: 55,
    });
  }

  if (leaderboardEntries === 0) {
    items.push({
      id: "achievements",
      title: "Climb the eco leaderboard",
      description: "Complete a verified pickup to appear on the leaderboard.",
      href: "/leaderboard",
      category: "impact",
      priority: 50,
    });
  }

  // Seasonal campaign rules (simple calendar heuristics).
  if (month === 3 || month === 4) {
    items.push({
      id: "earth-month",
      title: "Earth Month challenge",
      description: "List clean PET bottles this month for bonus progress.",
      href: "/sell",
      category: "campaign",
      priority: 85,
    });
  } else if (month === 11 || month === 0) {
    items.push({
      id: "year-end-recycle",
      title: "Year-end recycling drive",
      description: "Clear household plastic and redeem coins on marketplace deals.",
      href: "/marketplace",
      category: "campaign",
      priority: 85,
    });
  }

  items.sort((a, b) => b.priority - a.priority);
  const top = items.slice(0, 6);
  const generatedAt = new Date().toISOString();

  if (persist) {
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "AI_RECOMMENDATION",
        entityType: "User",
        entityId: userId,
        metadata: {
          count: top.length,
          ids: top.map((i) => i.id),
          generatedAt,
        } as Prisma.InputJsonValue,
      },
    });
  }

  return { items: top, generatedAt };
}

export const RecommendationService = {
  generate: generateRecommendations,
};
