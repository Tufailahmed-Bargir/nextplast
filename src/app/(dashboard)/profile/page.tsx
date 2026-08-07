import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getProfilePageData } from "@/features/dashboard";
import { ImpactCard } from "@/features/dashboard/components/impact-card";
import { ProgressCard } from "@/features/dashboard/components/progress-card";
import { RecentOrdersList } from "@/features/dashboard/components/recent-orders-list";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { CoinIcon } from "@/components/shared/brand";
import { Leaf, Recycle, Trophy } from "lucide-react";
import {
  coinsToInternalInr,
  formatCoin,
  formatInr,
  formatNumber,
  formatWeight,
} from "@/utils/coin";
import { QrCard } from "@/components/shared/qr-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profile",
};

/**
 * Profile summary — identity, completion, impact, referral QR, and recent orders.
 */
export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getProfilePageData(session.user.id);
  const displayName = data.user.name ?? "Recycler";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const referralCode = data.profile.referralCode ?? null;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              {data.user.image ? (
                <AvatarImage src={data.user.image} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-bold">{displayName}</h2>
                <Badge variant="secondary">{data.profile.level}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{data.user.email}</p>
              <p className="text-sm text-muted-foreground">
                {[data.profile.city, data.profile.phone]
                  .filter(Boolean)
                  .join(" · ") || "Add city and phone to complete your profile"}
              </p>
              {referralCode ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Referral:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {referralCode}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Link
              href="/settings"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Edit profile
            </Link>
            {referralCode ? (
              <QrCard
                kind="referral"
                id={referralCode}
                label="Referral QR"
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardCard
          label="Nature Coins"
          value={formatCoin(data.wallet.availableBalance)}
          sub={`≈ ${formatInr(coinsToInternalInr(data.wallet.availableBalance))}`}
          icon={CoinIcon}
          href="/wallet"
          tone="coin"
        />
        <DashboardCard
          label="Plastic recycled"
          value={formatWeight(data.impact.plasticRecycledGrams)}
          icon={Recycle}
          tone="emerald"
        />
        <DashboardCard
          label="Pickups completed"
          value={String(data.pickupCounts.completed)}
          sub={`${data.pickupCounts.pending} pending`}
          icon={Leaf}
          href="/history"
          tone="sky"
        />
        <DashboardCard
          label="Leaderboard"
          value={data.userRank != null ? `#${data.userRank}` : "—"}
          sub={`${formatNumber(data.impact.treesSaved)} trees saved`}
          icon={Trophy}
          href="/leaderboard"
          tone="teal"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ProgressCard
          level={data.profile.level}
          profileCompletion={data.profile.completionPercent}
          badgesEarned={data.badgesEarned}
          badgesTotal={data.badgesTotal}
          userRank={data.userRank}
        />
        <div className="lg:col-span-2">
          <ImpactCard impact={data.impact} />
        </div>
      </div>

      <RecentOrdersList orders={data.recentOrders} />

      {data.profile.missingFields.length > 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-5 text-sm text-muted-foreground">
            Complete your profile: {data.profile.missingFields.join(", ")}.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
