import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Truck } from "lucide-react";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import {
  listAdminPickupRequests,
  listUnassignedPickups,
} from "@/features/collector/services/pickup-queries";
import { listAssignableCollectors } from "@/features/collector/services/ensure-collector";
import { AssignPickupForm } from "@/features/collector/components/assign-pickup-form";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatWeight } from "@/utils/coin";
import { formatDateTime } from "@/utils/date";

export const metadata: Metadata = {
  title: "Pickup Requests",
};

/**
 * Admin pickup assignment queue.
 */
export default async function AdminPickupRequestsPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const [unassigned, all, collectors] = await Promise.all([
    listUnassignedPickups(),
    listAdminPickupRequests(),
    listAssignableCollectors(),
  ]);

  const collectorOptions = collectors.map((c) => ({
    id: c.id,
    label: `${c.user.name ?? c.user.email}${c.isOnDuty ? " · on duty" : ""}`,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Pickup requests</h2>
        <p className="text-sm text-muted-foreground">
          Assign collectors to submitted plastic pickups. Customers receive an
          OTP after assignment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Awaiting assignment ({unassigned.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {unassigned.length === 0 ? (
            <DashboardEmpty
              icon={Truck}
              title="Queue clear"
              description="New Phase 5 submissions that need a collector will appear here."
            />
          ) : (
            unassigned.map((pickup) => (
              <div
                key={pickup.id}
                className="space-y-3 rounded-xl border border-border p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {pickup.listing.status.toLowerCase().replaceAll("_", " ")}
                  </Badge>
                  <span className="text-sm font-semibold">
                    #{pickup.id.slice(0, 8)} ·{" "}
                    {pickup.listing.user.name ?? "User"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{pickup.address}</p>
                <p className="text-xs text-muted-foreground">
                  {pickup.listing.claimedWeightGrams != null
                    ? formatWeight(pickup.listing.claimedWeightGrams)
                    : "Weight n/a"}
                  {" · "}
                  {formatDateTime(pickup.createdAt)}
                </p>
                <AssignPickupForm
                  pickupId={pickup.id}
                  collectors={collectorOptions}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent pickups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {all.map((pickup) => (
            <div
              key={pickup.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  #{pickup.id.slice(0, 8)} ·{" "}
                  {pickup.listing.user.name ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pickup.collector?.user.name
                    ? `Collector: ${pickup.collector.user.name}`
                    : "Unassigned"}
                </p>
              </div>
              <Badge variant="secondary">
                {pickup.status.toLowerCase().replaceAll("_", " ")}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
