import type {
  GamificationLevel,
  NotificationType,
  OrderStatus,
  PickupStatus,
  WalletTxStatus,
  WalletTxType,
} from "@prisma/client";

/** Decimal-safe number coercion for Prisma Decimal fields. */
export function decimalToNumber(
  value: { toString(): string } | number | string | null | undefined,
): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(value.toString());
  return Number.isFinite(n) ? n : 0;
}

export interface WalletSummary {
  availableBalance: number;
  pendingBalance: number;
  earnedTotal: number;
  spentTotal: number;
}

export interface ImpactSummary {
  plasticRecycledGrams: number;
  co2SavedKg: number;
  treesSaved: number;
  oceanPlasticPreventedKg: number;
  waterSavedLiters: number;
  energySavedKwh: number;
  oilSavedLiters: number;
  rankCache: number | null;
}

export interface ProfileSummary {
  phone: string | null;
  city: string | null;
  address: string | null;
  bio: string | null;
  level: GamificationLevel;
  completionPercent: number;
  missingFields: string[];
  referralCode?: string | null;
}

export interface PickupSummaryItem {
  id: string;
  status: PickupStatus;
  address: string;
  scheduledAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  weightGrams: number | null;
  coins: number | null;
  listingId: string;
}

export interface ListingSummaryItem {
  id: string;
  status: string;
  claimedWeightGrams: number | null;
  estimatedCoins: number | null;
  createdAt: Date;
}

export interface OrderSummaryItem {
  id: string;
  status: OrderStatus;
  cashAmountInr: number;
  coinAmount: number;
  placedAt: Date;
  itemCount: number;
}

export interface WalletTxItem {
  id: string;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  title: string | null;
  description: string | null;
  balanceAfter: number | null;
  createdAt: Date;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
  /** Deep link from notification `data.href` when present. */
  href?: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  metric: string;
  isCurrentUser: boolean;
}

export interface MarketplacePreviewItem {
  id: string;
  name: string;
  slug: string;
  priceInr: number;
  priceCoins: number;
  ecoScore: number | null;
  imageUrl: string | null;
  categoryName: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  kind: "wallet" | "pickup" | "listing" | "order" | "notification";
  title: string;
  detail: string;
  at: Date;
  coins?: number | null;
}

export interface DashboardData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  wallet: WalletSummary;
  impact: ImpactSummary;
  profile: ProfileSummary;
  pickupCounts: { pending: number; completed: number };
  recentPickups: PickupSummaryItem[];
  recentListings: ListingSummaryItem[];
  recentOrders: OrderSummaryItem[];
  recentTransactions: WalletTxItem[];
  notifications: NotificationItem[];
  unreadNotifications: number;
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  marketplacePreview: MarketplacePreviewItem[];
  charts: {
    plasticByMonth: ChartPoint[];
    coinsEarnedByMonth: ChartPoint[];
  };
  activities: ActivityItem[];
  badgesEarned: number;
  badgesTotal: number;
}
