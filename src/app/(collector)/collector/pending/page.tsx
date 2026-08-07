import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { auth } from "@/auth";
import {
  getCollectorContext,
  listCollectorPickups,
} from "@/features/collector/services/pickup-queries";
import { PickupCard } from "@/features/collector/components/pickup-card";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";

export const metadata: Metadata = {
  title: "Pending Verification",
};

export default async function PendingVerificationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const collector = await getCollectorContext(session.user.id);
  const pickups = await listCollectorPickups(collector.id, "pending");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Pending verification</h2>
        <p className="text-sm text-muted-foreground">
          OTP, weight, quality, and proof still need to be finished.
        </p>
      </div>

      {pickups.length === 0 ? (
        <DashboardEmpty
          icon={Clock}
          title="Nothing pending"
          description="In-progress pickups awaiting OTP or weight verification show up here."
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
              href={`/collector/pickups/${pickup.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
