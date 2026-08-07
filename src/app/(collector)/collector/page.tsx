import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Star, Timer, Truck } from "lucide-react";
import { auth } from "@/auth";
import { getCollectorDashboardData } from "@/features/collector/services/pickup-queries";
import { CollectorDashboardCard } from "@/features/collector/components/collector-dashboard-card";
import { PickupCard } from "@/features/collector/components/pickup-card";
import { PerformanceCard } from "@/features/collector/components/performance-card";
import { DutyToggle } from "@/features/collector/components/duty-toggle";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatWeight } from "@/utils/coin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Collector Dashboard",
};

/**
 * Collector home — schedule, active pickup, performance.
 */
export default async function CollectorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getCollectorDashboardData(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Collector Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            {session.user.name ?? "Collector"}
            {data.collector.zone ? ` · ${data.collector.zone}` : ""}
          </p>
        </div>
        <DutyToggle isOnDuty={data.collector.isOnDuty} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CollectorDashboardCard
          label="Today's pickups"
          value={String(data.stats.todayCount)}
          icon={Truck}
          tone="sky"
        />
        <CollectorDashboardCard
          label="Total plastic collected"
          value={formatWeight(data.stats.totalPlasticGrams)}
          icon={Package}
          tone="emerald"
        />
        <CollectorDashboardCard
          label="Completed"
          value={String(data.stats.completedCount)}
          sub={`${data.stats.successRate}% success`}
          icon={Timer}
          tone="teal"
        />
        <CollectorDashboardCard
          label="Rating"
          value={
            data.stats.rating > 0 ? `${data.stats.rating.toFixed(1)} ★` : "—"
          }
          icon={Star}
          tone="coin"
        />
      </div>

      {data.active ? (
        <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 dark:border-sky-900 dark:from-sky-950 dark:to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle>Active pickup</CardTitle>
            <p className="text-sm text-muted-foreground">
              #{data.active.id.slice(0, 8)} ·{" "}
              {data.active.listing.user.name ?? "Customer"}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <PickupCard
              id={data.active.id}
              status={data.active.status}
              customerName={data.active.listing.user.name}
              address={data.active.address}
              claimedWeightGrams={data.active.listing.claimedWeightGrams}
              estimatedCoins={
                data.active.listing.estimatedCoins
                  ? Number(data.active.listing.estimatedCoins)
                  : null
              }
              distanceKm={
                data.active.distanceKm
                  ? Number(data.active.distanceKm)
                  : null
              }
              scheduledAt={data.active.scheduledAt}
              href={`/collector/pickups/${data.active.id}`}
            />
            <Link
              href={`/collector/pickups/${data.active.id}`}
              className={cn(buttonVariants())}
            >
              Open workflow
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DashboardEmpty
          icon={Truck}
          title="No active pickup"
          description="Accepted or in-progress pickups will appear here once assigned by admin."
        />
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s schedule</CardTitle>
            <Link
              href="/collector/assigned"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.today.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing scheduled for today.
              </p>
            ) : (
              data.today.map((pickup) => (
                <PickupCard
                  key={pickup.id}
                  id={pickup.id}
                  status={pickup.status}
                  customerName={pickup.listing.user.name}
                  address={pickup.address}
                  claimedWeightGrams={pickup.listing.claimedWeightGrams}
                  estimatedCoins={
                    pickup.listing.estimatedCoins
                      ? Number(pickup.listing.estimatedCoins)
                      : null
                  }
                  distanceKm={
                    pickup.distanceKm ? Number(pickup.distanceKm) : null
                  }
                  scheduledAt={pickup.scheduledAt}
                  href={`/collector/pickups/${pickup.id}`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <PerformanceCard
          completedCount={data.stats.completedCount}
          successRate={data.stats.successRate}
          avgVerificationMinutes={data.stats.avgVerificationMinutes}
          totalPlasticGrams={data.stats.totalPlasticGrams}
          rating={data.stats.rating}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned pickups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.assigned.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No assigned pickups yet.
              </p>
            ) : (
              data.assigned.map((pickup) => (
                <PickupCard
                  key={pickup.id}
                  id={pickup.id}
                  status={pickup.status}
                  customerName={pickup.listing.user.name}
                  address={pickup.address}
                  claimedWeightGrams={pickup.listing.claimedWeightGrams}
                  estimatedCoins={
                    pickup.listing.estimatedCoins
                      ? Number(pickup.listing.estimatedCoins)
                      : null
                  }
                  href={`/collector/pickups/${pickup.id}`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentCompleted.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Completed pickups will show here.
              </p>
            ) : (
              data.recentCompleted.map((pickup) => (
                <PickupCard
                  key={pickup.id}
                  id={pickup.id}
                  status={pickup.status}
                  customerName={pickup.listing.user.name}
                  address={pickup.address}
                  claimedWeightGrams={
                    pickup.verification?.actualWeightGrams ??
                    pickup.listing.actualWeightGrams
                  }
                  estimatedCoins={
                    pickup.listing.finalCoins
                      ? Number(pickup.listing.finalCoins)
                      : null
                  }
                  href={`/collector/pickups/${pickup.id}`}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
