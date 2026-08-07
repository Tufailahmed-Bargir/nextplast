import { Leaf, Recycle, Truck } from "lucide-react";
import { CoinIcon } from "@/components/shared/brand";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { WalletCard } from "@/features/dashboard/components/wallet-card";
import { ImpactCard } from "@/features/dashboard/components/impact-card";
import { ProgressCard } from "@/features/dashboard/components/progress-card";
import { PickupStatusCard } from "@/features/dashboard/components/pickup-status-card";
import { ActivityTimeline } from "@/features/dashboard/components/activity-timeline";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { NotificationList } from "@/features/dashboard/components/notification-list";
import { LeaderboardPreview } from "@/features/dashboard/components/leaderboard-preview";
import { MarketplacePreview } from "@/features/dashboard/components/marketplace-preview";
import { ChartCard } from "@/features/dashboard/components/chart-card";
import {
  coinsToInternalInr,
  formatCoin,
  formatInr,
  formatNumber,
  formatWeight,
} from "@/utils/coin";
import type { DashboardData } from "@/features/dashboard/types";

interface DashboardHomeProps {
  data: DashboardData;
}

/**
 * Assembled user dashboard — welcome, stats, charts, workflow widgets.
 */
export function DashboardHome({ data }: DashboardHomeProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeBanner
        name={data.user.name}
        plasticRecycledGrams={data.impact.plasticRecycledGrams}
        co2SavedKg={data.impact.co2SavedKg}
      />

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
          sub="all time"
          icon={Recycle}
          href="/profile"
          tone="emerald"
        />
        <DashboardCard
          label="Pickups"
          value={String(
            data.pickupCounts.pending + data.pickupCounts.completed,
          )}
          sub={`${data.pickupCounts.pending} pending`}
          icon={Truck}
          href="/history"
          tone="sky"
        />
        <DashboardCard
          label="CO₂ reduced"
          value={`${formatNumber(data.impact.co2SavedKg)} kg`}
          sub={`${formatNumber(data.impact.treesSaved)} trees`}
          icon={Leaf}
          href="/profile"
          tone="teal"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Plastic recycled"
            description="Kilograms completed over the last 6 months"
            data={data.charts.plasticByMonth}
            valueLabel="kg"
            emptyMessage="Complete pickups to see recycling trends here."
          />
        </div>
        <ChartCard
          title="Nature Coins earned"
          description="Completed earn & bonus credits"
          data={data.charts.coinsEarnedByMonth}
          valueLabel="coins"
          color="#f59e0b"
          emptyMessage="Earned coins will chart here after verified pickups."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WalletCard wallet={data.wallet} />
        <ImpactCard impact={data.impact} />
        <ProgressCard
          level={data.profile.level}
          profileCompletion={data.profile.completionPercent}
          badgesEarned={data.badgesEarned}
          badgesTotal={data.badgesTotal}
          userRank={data.userRank}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <QuickActions />
        <div className="lg:col-span-2">
          <PickupStatusCard
            pickups={data.recentPickups}
            pendingCount={data.pickupCounts.pending}
            completedCount={data.pickupCounts.completed}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityTimeline items={data.activities} />
        <NotificationList
          notifications={data.notifications}
          unreadCount={data.unreadNotifications}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaderboardPreview
          entries={data.leaderboard}
          userRank={data.userRank}
        />
        <MarketplacePreview products={data.marketplacePreview} />
      </div>
    </div>
  );
}
