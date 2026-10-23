import "server-only";

import { format, startOfMonth, subMonths, endOfMonth } from "date-fns";
import { PickupStatus, WalletTxType } from "@prisma/client";
import { prisma } from "@/prisma";
import { ensureUserDashboardRecords } from "@/features/dashboard/services/ensure-user-records";
import {
  decimalToNumber,
  signedWalletAmount,
  type ActivityItem,
  type ChartPoint,
  type DashboardData,
  type LeaderboardEntry,
  type NotificationItem,
  type ProfileSummary,
  type WalletSummary,
  type WalletTxItem,
} from "@/features/dashboard/types";

const PENDING_PICKUP: PickupStatus[] = [
  PickupStatus.REQUESTED,
  PickupStatus.ASSIGNED,
  PickupStatus.SCHEDULED,
  PickupStatus.IN_TRANSIT,
  PickupStatus.IN_PROGRESS,
  PickupStatus.AWAITING_VERIFICATION,
  PickupStatus.AWAITING_SIGNATURE,
];

function hrefFromNotificationData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const href = (data as { href?: unknown }).href;
  return typeof href === "string" && href.startsWith("/") ? href : null;
}

function mapNotification(n: {
  id: string;
  type: NotificationItem["type"];
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
  data?: unknown;
}): NotificationItem {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    readAt: n.readAt,
    createdAt: n.createdAt,
    href: hrefFromNotificationData(n.data),
  };
}

function monthLabels(
  count: number,
): { key: string; label: string; start: Date; end: Date }[] {
  const now = new Date();
  const months: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = subMonths(now, i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    months.push({
      key: format(start, "yyyy-MM"),
      label: format(start, "MMM"),
      start,
      end,
    });
  }
  return months;
}

function computeProfileCompletion(input: {
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  bio: string | null;
}): ProfileSummary {
  const checks: { label: string; ok: boolean }[] = [
    { label: "Name", ok: Boolean(input.name?.trim()) },
    { label: "Email", ok: Boolean(input.email?.trim()) },
    { label: "Photo", ok: Boolean(input.image) },
    { label: "Phone", ok: Boolean(input.phone?.trim()) },
    { label: "City", ok: Boolean(input.city?.trim()) },
    { label: "Address", ok: Boolean(input.address?.trim()) },
    { label: "Bio", ok: Boolean(input.bio?.trim()) },
  ];
  const filled = checks.filter((c) => c.ok).length;
  return {
    phone: input.phone,
    city: input.city,
    address: input.address,
    bio: input.bio,
    level: "BRONZE",
    completionPercent: Math.round((filled / checks.length) * 100),
    missingFields: checks.filter((c) => !c.ok).map((c) => c.label),
  };
}

function mapWalletTx(tx: {
  id: string;
  type: WalletTxType;
  status: WalletTxItem["status"];
  amount: { toString(): string };
  title: string | null;
  description: string | null;
  balanceAfter: { toString(): string } | null;
  createdAt: Date;
}): WalletTxItem {
  return {
    id: tx.id,
    type: tx.type,
    status: tx.status,
    amount: decimalToNumber(tx.amount),
    title: tx.title,
    description: tx.description,
    balanceAfter: tx.balanceAfter ? decimalToNumber(tx.balanceAfter) : null,
    createdAt: tx.createdAt,
  };
}

/**
 * Full dashboard payload for the authenticated user.
 * All values come from Prisma — zeros / empty arrays when no domain data yet.
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  await ensureUserDashboardRecords(userId);

  const months = monthLabels(6);
  const rangeStart = months[0]!.start;

  // Batched queries — avoid opening ~18 Neon connections at once (pool timeout).
  const [user, wallet, impact, profile] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true },
    }),
    prisma.wallet.findUniqueOrThrow({ where: { userId } }),
    prisma.environmentalImpact.findUniqueOrThrow({ where: { userId } }),
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
  ]);

  const [
    pendingPickups,
    completedPickups,
    recentPickups,
    recentListings,
    recentOrders,
    recentTransactions,
  ] = await Promise.all([
    prisma.pickupRequest.count({
      where: {
        listing: { userId },
        status: { in: PENDING_PICKUP },
      },
    }),
    prisma.pickupRequest.count({
      where: {
        listing: { userId },
        status: PickupStatus.COMPLETED,
      },
    }),
    prisma.pickupRequest.findMany({
      where: { listing: { userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        listing: {
          select: {
            id: true,
            actualWeightGrams: true,
            claimedWeightGrams: true,
            finalCoins: true,
            estimatedCoins: true,
          },
        },
        verification: {
          select: { actualWeightGrams: true, recalculatedCoins: true },
        },
      },
    }),
    prisma.plasticListing.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        claimedWeightGrams: true,
        estimatedCoins: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
      take: 5,
      include: { _count: { select: { items: true } } },
    }),
    prisma.walletTransaction.findMany({
      where: { wallet: { userId } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const [
    notifications,
    unreadNotifications,
    leaderboardRows,
    products,
    badgesEarned,
    badgesTotal,
  ] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.notification.count({
      where: { userId, readAt: null },
    }),
    prisma.leaderboard.findMany({
      where: {
        periodType: "ALL_TIME",
        periodKey: "ALL",
        metric: "coins",
      },
      orderBy: { rank: "asc" },
      take: 5,
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null, stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        category: { select: { name: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.userBadge.count({ where: { userId } }),
    prisma.badge.count({ where: { isActive: true } }),
  ]);

  const [completedListingsForChart, earnTransactionsForChart] =
    await Promise.all([
      prisma.plasticListing.findMany({
        where: {
          userId,
          status: "COMPLETED",
          deletedAt: null,
          updatedAt: { gte: rangeStart },
        },
        select: {
          updatedAt: true,
          actualWeightGrams: true,
          claimedWeightGrams: true,
        },
      }),
      prisma.walletTransaction.findMany({
        where: {
          wallet: { userId },
          type: {
            in: [
              WalletTxType.EARN,
              WalletTxType.BONUS,
              WalletTxType.PENDING_RELEASE,
            ],
          },
          status: "COMPLETED",
          createdAt: { gte: rangeStart },
        },
        select: { createdAt: true, amount: true },
      }),
    ]);

  const walletSummary: WalletSummary = {
    availableBalance: decimalToNumber(wallet.availableBalance),
    pendingBalance: decimalToNumber(wallet.pendingBalance),
    earnedTotal: decimalToNumber(wallet.earnedTotal),
    spentTotal: decimalToNumber(wallet.spentTotal),
  };

  const impactSummary = {
    plasticRecycledGrams: impact.plasticRecycledGrams,
    co2SavedKg: decimalToNumber(impact.co2SavedKg),
    treesSaved: decimalToNumber(impact.treesSaved),
    oceanPlasticPreventedKg: decimalToNumber(impact.oceanPlasticPreventedKg),
    waterSavedLiters: decimalToNumber(impact.waterSavedLiters),
    energySavedKwh: decimalToNumber(impact.energySavedKwh),
    oilSavedLiters: decimalToNumber(impact.oilSavedLiters),
    rankCache: impact.rankCache,
  };

  const profileSummary = computeProfileCompletion({
    name: user.name,
    email: user.email,
    image: user.image,
    phone: profile.phone,
    city: profile.city,
    address: profile.address,
    bio: profile.bio,
  });
  profileSummary.level = profile.level;

  const plasticByMonth: ChartPoint[] = months.map((m) => {
    const grams = completedListingsForChart
      .filter((l) => l.updatedAt >= m.start && l.updatedAt <= m.end)
      .reduce(
        (sum, l) => sum + (l.actualWeightGrams ?? l.claimedWeightGrams ?? 0),
        0,
      );
    return { label: m.label, value: Math.round((grams / 1000) * 10) / 10 };
  });

  const coinsEarnedByMonth: ChartPoint[] = months.map((m) => {
    const coins = earnTransactionsForChart
      .filter((t) => t.createdAt >= m.start && t.createdAt <= m.end)
      .reduce((sum, t) => sum + decimalToNumber(t.amount), 0);
    return { label: m.label, value: Math.round(coins * 100) / 100 };
  });

  let leaderboard: LeaderboardEntry[] = leaderboardRows.map((row) => ({
    rank: row.rank,
    userId: row.userId,
    name: row.user.name ?? "Recycler",
    score: decimalToNumber(row.score),
    metric: row.metric,
    isCurrentUser: row.userId === userId,
  }));

  // Fallback ranking from environmental impact when leaderboard snapshots are empty.
  if (leaderboard.length === 0) {
    const topImpact = await prisma.environmentalImpact.findMany({
      orderBy: { plasticRecycledGrams: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true } } },
    });
    leaderboard = topImpact.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      name: row.user.name ?? "Recycler",
      score: row.plasticRecycledGrams / 1000,
      metric: "plastic_kg",
      isCurrentUser: row.userId === userId,
    }));
  }

  const userRankRow = await prisma.leaderboard.findFirst({
    where: {
      userId,
      periodType: "ALL_TIME",
      periodKey: "ALL",
      metric: "coins",
    },
    select: { rank: true },
  });

  const userRankEntry = leaderboard.find((e) => e.isCurrentUser);
  const userRank =
    userRankRow?.rank ?? userRankEntry?.rank ?? impact.rankCache ?? null;

  const mappedNotifications: NotificationItem[] =
    notifications.map(mapNotification);

  const activities: ActivityItem[] = [
    ...recentTransactions.map((t) => ({
      id: `tx-${t.id}`,
      kind: "wallet" as const,
      title: t.title ?? t.type,
      detail: t.description ?? t.status,
      at: t.createdAt,
      coins: signedWalletAmount(t.type, decimalToNumber(t.amount)),
    })),
    ...recentPickups.map((p) => ({
      id: `pickup-${p.id}`,
      kind: "pickup" as const,
      title: `Pickup ${p.status.toLowerCase().replaceAll("_", " ")}`,
      detail: p.address,
      at: p.updatedAt,
      coins: p.verification
        ? decimalToNumber(p.verification.recalculatedCoins)
        : decimalToNumber(p.listing.finalCoins ?? p.listing.estimatedCoins),
    })),
    ...recentListings.map((l) => ({
      id: `listing-${l.id}`,
      kind: "listing" as const,
      title: `Listing ${l.status.toLowerCase().replaceAll("_", " ")}`,
      detail: l.claimedWeightGrams
        ? `${(l.claimedWeightGrams / 1000).toFixed(1)} kg claimed`
        : "Plastic listing",
      at: l.createdAt,
      coins: decimalToNumber(l.estimatedCoins),
    })),
    ...recentOrders.map((o) => ({
      id: `order-${o.id}`,
      kind: "order" as const,
      title: `Order ${o.status.toLowerCase().replaceAll("_", " ")}`,
      detail: `${o._count.items} item(s)`,
      at: o.placedAt,
      coins: -decimalToNumber(o.coinAmount),
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);

  return {
    user,
    wallet: walletSummary,
    impact: impactSummary,
    profile: profileSummary,
    pickupCounts: { pending: pendingPickups, completed: completedPickups },
    recentPickups: recentPickups.map((p) => ({
      id: p.id,
      status: p.status,
      address: p.address,
      scheduledAt: p.scheduledAt,
      completedAt: p.completedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      weightGrams:
        p.verification?.actualWeightGrams ??
        p.listing.actualWeightGrams ??
        p.listing.claimedWeightGrams,
      coins: p.verification
        ? decimalToNumber(p.verification.recalculatedCoins)
        : decimalToNumber(p.listing.finalCoins ?? p.listing.estimatedCoins),
      listingId: p.listing.id,
    })),
    recentListings: recentListings.map((l) => ({
      id: l.id,
      status: l.status,
      claimedWeightGrams: l.claimedWeightGrams,
      estimatedCoins: decimalToNumber(l.estimatedCoins),
      createdAt: l.createdAt,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      status: o.status,
      cashAmountInr: decimalToNumber(o.cashAmountInr),
      coinAmount: decimalToNumber(o.coinAmount),
      placedAt: o.placedAt,
      itemCount: o._count.items,
    })),
    recentTransactions: recentTransactions.map(mapWalletTx),
    notifications: mappedNotifications,
    unreadNotifications,
    leaderboard,
    userRank,
    marketplacePreview: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceInr: decimalToNumber(p.priceInr),
      priceCoins: decimalToNumber(p.priceCoins),
      ecoScore: p.ecoScore,
      imageUrl: p.images[0]?.url ?? null,
      categoryName: p.category.name,
    })),
    charts: { plasticByMonth, coinsEarnedByMonth },
    activities,
    badgesEarned,
    badgesTotal,
  };
}

export async function getWalletPageData(userId: string) {
  await ensureUserDashboardRecords(userId);
  const [wallet, transactions] = await Promise.all([
    prisma.wallet.findUniqueOrThrow({ where: { userId } }),
    prisma.walletTransaction.findMany({
      where: { wallet: { userId } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    wallet: {
      availableBalance: decimalToNumber(wallet.availableBalance),
      pendingBalance: decimalToNumber(wallet.pendingBalance),
      earnedTotal: decimalToNumber(wallet.earnedTotal),
      spentTotal: decimalToNumber(wallet.spentTotal),
    } satisfies WalletSummary,
    transactions: transactions.map(mapWalletTx),
  };
}

export async function getNotificationsPageData(userId: string) {
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    notifications: notifications.map(
      mapNotification,
    ) satisfies NotificationItem[],
    unread,
  };
}

export async function getHistoryPageData(userId: string) {
  await ensureUserDashboardRecords(userId);

  const [
    pendingPickups,
    completedPickups,
    pickups,
    listings,
    orders,
    transactions,
  ] = await Promise.all([
    prisma.pickupRequest.count({
      where: { listing: { userId }, status: { in: PENDING_PICKUP } },
    }),
    prisma.pickupRequest.count({
      where: { listing: { userId }, status: PickupStatus.COMPLETED },
    }),
    prisma.pickupRequest.findMany({
      where: { listing: { userId } },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        listing: {
          select: {
            id: true,
            actualWeightGrams: true,
            claimedWeightGrams: true,
            finalCoins: true,
            estimatedCoins: true,
          },
        },
        verification: {
          select: { actualWeightGrams: true, recalculatedCoins: true },
        },
      },
    }),
    prisma.plasticListing.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        status: true,
        claimedWeightGrams: true,
        estimatedCoins: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
      take: 25,
      include: { _count: { select: { items: true } } },
    }),
    prisma.walletTransaction.findMany({
      where: { wallet: { userId } },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const mappedPickups = pickups.map((p) => ({
    id: p.id,
    status: p.status,
    address: p.address,
    scheduledAt: p.scheduledAt,
    completedAt: p.completedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    weightGrams:
      p.verification?.actualWeightGrams ??
      p.listing.actualWeightGrams ??
      p.listing.claimedWeightGrams,
    coins: p.verification
      ? decimalToNumber(p.verification.recalculatedCoins)
      : decimalToNumber(p.listing.finalCoins ?? p.listing.estimatedCoins),
    listingId: p.listing.id,
  }));

  const mappedListings = listings.map((l) => ({
    id: l.id,
    status: l.status,
    claimedWeightGrams: l.claimedWeightGrams,
    estimatedCoins: decimalToNumber(l.estimatedCoins),
    createdAt: l.createdAt,
  }));

  const mappedOrders = orders.map((o) => ({
    id: o.id,
    status: o.status,
    cashAmountInr: decimalToNumber(o.cashAmountInr),
    coinAmount: decimalToNumber(o.coinAmount),
    placedAt: o.placedAt,
    itemCount: o._count.items,
  }));

  const mappedTx = transactions.map(mapWalletTx);

  const activities: ActivityItem[] = [
    ...mappedTx.map((t) => ({
      id: `tx-${t.id}`,
      kind: "wallet" as const,
      title: t.title ?? t.type,
      detail: t.description ?? t.status,
      at: t.createdAt,
      coins: signedWalletAmount(t.type, t.amount),
    })),
    ...mappedPickups.map((p) => ({
      id: `pickup-${p.id}`,
      kind: "pickup" as const,
      title: `Pickup ${p.status.toLowerCase().replaceAll("_", " ")}`,
      detail: p.address,
      at: p.updatedAt,
      coins: p.coins,
    })),
    ...mappedListings.map((l) => ({
      id: `listing-${l.id}`,
      kind: "listing" as const,
      title: `Listing ${l.status.toLowerCase().replaceAll("_", " ")}`,
      detail: l.claimedWeightGrams
        ? `${(l.claimedWeightGrams / 1000).toFixed(1)} kg claimed`
        : "Plastic listing",
      at: l.createdAt,
      coins: l.estimatedCoins,
    })),
    ...mappedOrders.map((o) => ({
      id: `order-${o.id}`,
      kind: "order" as const,
      title: `Order ${o.status.toLowerCase().replaceAll("_", " ")}`,
      detail: `${o.itemCount} item(s)`,
      at: o.placedAt,
      coins: -o.coinAmount,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 40);

  return {
    activities,
    transactions: mappedTx,
    pickups: mappedPickups,
    listings: mappedListings,
    orders: mappedOrders,
    pickupCounts: { pending: pendingPickups, completed: completedPickups },
  };
}

export async function getProfilePageData(userId: string) {
  await ensureUserDashboardRecords(userId);

  const [
    user,
    wallet,
    impact,
    profile,
    pendingPickups,
    completedPickups,
    recentOrders,
    badgesEarned,
    badgesTotal,
    userRankRow,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true },
    }),
    prisma.wallet.findUniqueOrThrow({ where: { userId } }),
    prisma.environmentalImpact.findUniqueOrThrow({ where: { userId } }),
    prisma.userProfile.findUniqueOrThrow({ where: { userId } }),
    prisma.pickupRequest.count({
      where: { listing: { userId }, status: { in: PENDING_PICKUP } },
    }),
    prisma.pickupRequest.count({
      where: { listing: { userId }, status: PickupStatus.COMPLETED },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
      take: 5,
      include: { _count: { select: { items: true } } },
    }),
    prisma.userBadge.count({ where: { userId } }),
    prisma.badge.count({ where: { isActive: true } }),
    prisma.leaderboard.findFirst({
      where: {
        userId,
        periodType: "ALL_TIME",
        periodKey: "ALL",
        metric: "coins",
      },
      select: { rank: true },
    }),
  ]);

  const profileSummary = computeProfileCompletion({
    name: user.name,
    email: user.email,
    image: user.image,
    phone: profile.phone,
    city: profile.city,
    address: profile.address,
    bio: profile.bio,
  });
  profileSummary.level = profile.level;

  return {
    user,
    profile: {
      ...profileSummary,
      referralCode: profile.referralCode,
    },
    wallet: {
      availableBalance: decimalToNumber(wallet.availableBalance),
      pendingBalance: decimalToNumber(wallet.pendingBalance),
      earnedTotal: decimalToNumber(wallet.earnedTotal),
      spentTotal: decimalToNumber(wallet.spentTotal),
    } satisfies WalletSummary,
    impact: {
      plasticRecycledGrams: impact.plasticRecycledGrams,
      co2SavedKg: decimalToNumber(impact.co2SavedKg),
      treesSaved: decimalToNumber(impact.treesSaved),
      oceanPlasticPreventedKg: decimalToNumber(impact.oceanPlasticPreventedKg),
      waterSavedLiters: decimalToNumber(impact.waterSavedLiters),
      energySavedKwh: decimalToNumber(impact.energySavedKwh),
      oilSavedLiters: decimalToNumber(impact.oilSavedLiters),
      rankCache: impact.rankCache,
    },
    pickupCounts: { pending: pendingPickups, completed: completedPickups },
    userRank: userRankRow?.rank ?? impact.rankCache,
    badgesEarned,
    badgesTotal,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      status: o.status,
      cashAmountInr: decimalToNumber(o.cashAmountInr),
      coinAmount: decimalToNumber(o.coinAmount),
      placedAt: o.placedAt,
      itemCount: o._count.items,
    })),
  };
}

export async function getLeaderboardPageData(userId: string) {
  await ensureUserDashboardRecords(userId);

  const [leaderboardRows, userRankRow, impact] = await Promise.all([
    prisma.leaderboard.findMany({
      where: {
        periodType: "ALL_TIME",
        periodKey: "ALL",
        metric: "coins",
      },
      orderBy: { rank: "asc" },
      take: 50,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.leaderboard.findFirst({
      where: {
        userId,
        periodType: "ALL_TIME",
        periodKey: "ALL",
        metric: "coins",
      },
      select: { rank: true },
    }),
    prisma.environmentalImpact.findUnique({
      where: { userId },
      select: { rankCache: true },
    }),
  ]);

  let leaderboard: LeaderboardEntry[] = leaderboardRows.map((row) => ({
    rank: row.rank,
    userId: row.userId,
    name: row.user.name ?? "Recycler",
    score: decimalToNumber(row.score),
    metric: row.metric,
    isCurrentUser: row.userId === userId,
  }));

  if (leaderboard.length === 0) {
    const topImpact = await prisma.environmentalImpact.findMany({
      orderBy: { plasticRecycledGrams: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true } } },
    });
    leaderboard = topImpact.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      name: row.user.name ?? "Recycler",
      score: row.plasticRecycledGrams / 1000,
      metric: "plastic_kg",
      isCurrentUser: row.userId === userId,
    }));
  }

  const userRank =
    userRankRow?.rank ??
    leaderboard.find((e) => e.isCurrentUser)?.rank ??
    impact?.rankCache ??
    null;

  return { leaderboard, userRank };
}

export async function getWalletBalance(userId: string): Promise<number> {
  // Do not call ensure* here — layout runs in parallel with page data loaders.
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { availableBalance: true },
  });
  return decimalToNumber(wallet?.availableBalance);
}
