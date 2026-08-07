import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import {
  getCollectorContext,
  listCollectorPickups,
} from "@/features/collector/services/pickup-queries";
import { PickupCard } from "@/features/collector/components/pickup-card";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";

export const metadata: Metadata = {
  title: "Completed Pickups",
};

export default async function CompletedPickupsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const collector = await getCollectorContext(session.user.id);
  const pickups = await listCollectorPickups(collector.id, "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Completed pickups</h2>
        <p className="text-sm text-muted-foreground">
          Verified collections with inventory and coin handoff recorded.
        </p>
      </div>

      {pickups.length === 0 ? (
        <DashboardEmpty
          icon={CheckCircle2}
          title="No completed pickups yet"
          description="Finished jobs will appear here after verification."
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
          ))}
        </div>
      )}
    </div>
  );
}
