import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Coins,
  Factory,
  Package,
  Recycle,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { getAdminDashboardStats } from "@/features/admin/services/admin-stats";
import { listFlaggedListingsForAiReview } from "@/features/admin/services/admin-listings";
import { AdminDashboardCard } from "@/features/admin/components/admin-dashboard-card";
import { AdminGlobalSearch } from "@/features/admin/components/admin-global-search";
import { AiReviewPanel } from "@/features/admin/components/ai-review-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCoin, formatNumber, formatWeight } from "@/utils/coin";
import { formatRelative } from "@/utils/date";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const [stats, flagged] = await Promise.all([
    getAdminDashboardStats(),
    listFlaggedListingsForAiReview(),
  ]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Manage users, collectors, recyclers, and platform operations.
          </p>
        </div>
        <Link
          href="/admin/reports"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Open reports
        </Link>
      </div>

      <AdminGlobalSearch />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminDashboardCard
          label="Total users"
          value={formatNumber(stats.users.total)}
          sub={`${stats.users.active} active`}
          icon={Users}
          href="/admin/users"
          tone="emerald"
        />
        <AdminDashboardCard
          label="Collectors"
          value={formatNumber(stats.users.collectors)}
          icon={Truck}
          href="/admin/collectors"
          tone="sky"
        />
        <AdminDashboardCard
          label="Recyclers"
          value={formatNumber(stats.users.recyclers)}
          icon={Factory}
          href="/admin/recyclers"
          tone="teal"
        />
        <AdminDashboardCard
          label="Marketplace GMV"
          value={`₹${formatNumber(Math.round(stats.marketplace.gmvInr))}`}
          sub={`${formatCoin(stats.marketplace.gmvCoins)} coins`}
          icon={Store}
          href="/admin/orders"
          tone="coin"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminDashboardCard
          label="Pickups open"
          value={formatNumber(stats.pickups.requested + stats.pickups.inFlight)}
          sub={`${stats.pickups.completed} completed`}
          icon={Truck}
          href="/admin/pickup-requests"
          tone="sky"
        />
        <AdminDashboardCard
          label="Inventory"
          value={formatWeight(stats.inventoryGrams)}
          icon={Package}
          href="/admin/inventory"
          tone="teal"
        />
        <AdminDashboardCard
          label="Wallet available"
          value={formatCoin(stats.wallet.available)}
          sub={`${formatCoin(stats.wallet.earned)} earned`}
          icon={Coins}
          href="/admin/coin-economy"
          tone="coin"
        />
        <AdminDashboardCard
          label="Plastic recycled"
          value={formatWeight(stats.impact.plasticRecycledGrams)}
          sub={`${formatNumber(stats.impact.co2SavedKg)} kg CO₂`}
          icon={Recycle}
          href="/admin/analytics"
          tone="emerald"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pickup summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Requested: {stats.pickups.requested}</p>
            <p>In progress: {stats.pickups.inFlight}</p>
            <p>Completed: {stats.pickups.completed}</p>
            <p>
              Listings awaiting collector: {stats.listings.awaitingCollector}
            </p>
            <p>Pending AI review: {stats.listings.pendingReview}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent marketplace orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            ) : (
              stats.recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="bg-muted/40 flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      #{o.id.slice(0, 8)} · {o.userName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatRelative(o.createdAt)} · {o.itemCount} item(s)
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {o.status.toLowerCase().replaceAll("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <AiReviewPanel listings={flagged} />
    </div>
  );
}
