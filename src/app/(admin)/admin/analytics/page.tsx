import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { getAdminAnalytics } from "@/features/admin/services/admin-analytics";
import { AnalyticsCard } from "@/features/admin/components/analytics-card";
import { formatCoin, formatNumber, formatWeight } from "@/utils/coin";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const analytics = await getAdminAnalytics();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground text-sm">
          Concise KPIs from live Prisma aggregates — no mock statistics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnalyticsCard
          title="Plastic collected"
          description="Verified collector weight (last 6 months)"
        >
          <ul className="space-y-1 text-sm">
            {analytics.plasticCollected.map((m) => (
              <li key={m.month} className="flex justify-between">
                <span className="text-muted-foreground">{m.month}</span>
                <span className="font-medium">{formatWeight(m.grams)}</span>
              </li>
            ))}
          </ul>
        </AnalyticsCard>

        <AnalyticsCard title="User growth" description="New accounts by month">
          <ul className="space-y-1 text-sm">
            {analytics.userGrowth.map((m) => (
              <li key={m.month} className="flex justify-between">
                <span className="text-muted-foreground">{m.month}</span>
                <span className="font-medium">{formatNumber(m.users)}</span>
              </li>
            ))}
          </ul>
        </AnalyticsCard>

        <AnalyticsCard
          title="Inventory levels"
          description="Stock by quality grade"
        >
          {analytics.inventoryLevels.length === 0 ? (
            <p className="text-muted-foreground text-sm">No inventory yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {analytics.inventoryLevels.map((g) => (
                <li key={g.grade} className="flex justify-between">
                  <span className="text-muted-foreground">Grade {g.grade}</span>
                  <span className="font-medium">{formatWeight(g.grams)}</span>
                </li>
              ))}
            </ul>
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Nature Coin usage"
          description="Completed earn, spend, and admin adjust"
        >
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Earned / bonus</span>
              <span className="coin-text font-medium">
                {formatCoin(analytics.natureCoinUsage.earned)}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-medium">
                {formatCoin(analytics.natureCoinUsage.spent)}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Admin adjustments</span>
              <span className="font-medium">
                {formatCoin(analytics.natureCoinUsage.adjusted)}
              </span>
            </p>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          title="Marketplace activity"
          description="Orders by status + GMV"
        >
          <div className="space-y-2 text-sm">
            {analytics.marketplaceActivity.byStatus.length === 0 ? (
              <p className="text-muted-foreground">No orders yet.</p>
            ) : (
              analytics.marketplaceActivity.byStatus.map((s) => (
                <p key={s.status} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {s.status.toLowerCase().replaceAll("_", " ")}
                  </span>
                  <span className="font-medium">{s.count}</span>
                </p>
              ))
            )}
            <p className="border-border flex justify-between border-t pt-2">
              <span className="text-muted-foreground">GMV</span>
              <span className="font-medium">
                ₹
                {formatNumber(Math.round(analytics.marketplaceActivity.gmvInr))}{" "}
                · {formatCoin(analytics.marketplaceActivity.gmvCoins)}
              </span>
            </p>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          title="Recycler inventory"
          description="Recycler-owned inventory lots"
        >
          <p className="font-display text-3xl font-bold">
            {formatNumber(analytics.recyclerInventoryLots)}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Roles — users {analytics.roleCounts.users}, collectors{" "}
            {analytics.roleCounts.collectors}, recyclers{" "}
            {analytics.roleCounts.recyclers}
          </p>
        </AnalyticsCard>
      </div>
    </div>
  );
}
