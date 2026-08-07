import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Recycle } from "lucide-react";
import { auth } from "@/auth";
import { getHistoryPageData } from "@/features/dashboard";
import { ActivityTimeline } from "@/features/dashboard/components/activity-timeline";
import { PickupStatusCard } from "@/features/dashboard/components/pickup-status-card";
import { RecentOrdersList } from "@/features/dashboard/components/recent-orders-list";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatDateTime } from "@/utils/date";

export const metadata: Metadata = {
  title: "History",
};

/**
 * Activity history — listings, pickups, orders, and timeline from Prisma.
 */
export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getHistoryPageData(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Activity history</h2>
        <p className="text-sm text-muted-foreground">
          Your circular economy activity across listings, pickups, and orders.
        </p>
      </div>

      <ActivityTimeline items={data.activities} title="Timeline" />

      <div className="grid gap-4 lg:grid-cols-2">
        <PickupStatusCard
          pickups={data.pickups}
          pendingCount={data.pickupCounts.pending}
          completedCount={data.pickupCounts.completed}
          showHeaderLink={false}
        />

        <Card>
          <CardHeader>
            <CardTitle>Recent listings</CardTitle>
          </CardHeader>
          <CardContent>
            {data.listings.length === 0 ? (
              <DashboardEmpty
                icon={Recycle}
                title="No listings yet"
                description="Start from Sell Plastic when you are ready to submit recyclable waste."
              />
            ) : (
              <ul className="space-y-3">
                {data.listings.map((listing) => (
                  <li key={listing.id}>
                    <Link
                      href={`/sell/${listing.id}`}
                      className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 transition-colors hover:bg-muted/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {listing.status.toLowerCase().replaceAll("_", " ")}
                          </Badge>
                          {listing.claimedWeightGrams != null ? (
                            <span className="text-xs text-muted-foreground">
                              {formatWeight(listing.claimedWeightGrams)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(listing.createdAt)}
                        </p>
                      </div>
                      {listing.estimatedCoins != null ? (
                        <span className="text-sm font-semibold coin-text">
                          ~{formatCoin(listing.estimatedCoins)}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <RecentOrdersList orders={data.orders} />
    </div>
  );
}
