import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Truck } from "lucide-react";
import { auth } from "@/auth";
import {
  getCollectorContext,
  listCollectorPickups,
} from "@/features/collector/services/pickup-queries";
import { PickupCard } from "@/features/collector/components/pickup-card";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Assigned Pickups",
};

export default async function AssignedPickupsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const collector = await getCollectorContext(session.user.id);
  const pickups = await listCollectorPickups(collector.id, "assigned");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Assigned pickups</h2>
          <p className="text-sm text-muted-foreground">
            Accept jobs and open navigation when ready.
          </p>
        </div>
        <Link href="/collector/navigation" className={cn(buttonVariants({ variant: "outline" }))}>
          Navigation
        </Link>
      </div>

      {pickups.length === 0 ? (
        <DashboardEmpty
          icon={Truck}
          title="No assigned pickups"
          description="When an admin assigns a pickup to you, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {pickups.map((pickup) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
