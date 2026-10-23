import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  getCollectorContext,
  getPickupForCollector,
} from "@/features/collector/services/pickup-queries";
import { PickupDetails } from "@/features/collector/components/pickup-details";
import { PickupWorkflowPanel } from "@/features/collector/components/pickup-workflow-panel";
import { isOtpLocked } from "@/features/collector/services/otp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatDateTime } from "@/utils/date";

export const metadata: Metadata = {
  title: "Pickup details",
};

interface PageProps {
  params: Promise<{ pickupId: string }>;
}

/**
 * Collector pickup detail + verification workflow.
 */
export default async function CollectorPickupDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { pickupId } = await params;
  const collector = await getCollectorContext(session.user.id);
  const pickup = await getPickupForCollector(pickupId, collector.id);
  if (!pickup) notFound();

  const claimedQuantity = pickup.listing.items.reduce(
    (sum, item) => sum + item.claimedQuantity,
    0,
  );

  const aiSummary =
    pickup.listing.aiResults.length > 0
      ? pickup.listing.aiResults
          .map(
            (r) =>
              `${r.detectedClass}: AI ${r.detectedCount} / user ${r.userConfirmedCount ?? r.detectedCount} (${Math.round(Number(r.confidence) * 100)}%)`,
          )
          .join(" · ")
      : null;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">
          Pickup #{pickup.id.slice(0, 8)}
        </h2>
        <p className="text-muted-foreground text-sm">
          Assigned workflow from arrival to verified inventory handoff.
        </p>
      </div>

      <PickupDetails
        pickupId={pickup.id}
        status={pickup.status}
        address={pickup.address}
        latitude={pickup.latitude != null ? Number(pickup.latitude) : null}
        longitude={pickup.longitude != null ? Number(pickup.longitude) : null}
        scheduledAt={pickup.scheduledAt}
        distanceKm={pickup.distanceKm ? Number(pickup.distanceKm) : null}
        notes={pickup.notes}
        customerName={pickup.listing.user.name}
        customerEmail={pickup.listing.user.email}
        claimedWeightGrams={pickup.listing.claimedWeightGrams}
        claimedQuantity={claimedQuantity || null}
        quality={pickup.listing.quality}
        estimatedCoins={
          pickup.listing.estimatedCoins
            ? Number(pickup.listing.estimatedCoins)
            : null
        }
        imageUrl={pickup.listing.images[0]?.url ?? null}
        aiSummary={aiSummary}
      />

      <PickupWorkflowPanel
        pickupId={pickup.id}
        status={pickup.status}
        claimedWeightGrams={pickup.listing.claimedWeightGrams}
        claimedQuantity={claimedQuantity || null}
        claimedQuality={pickup.listing.quality}
        otpLocked={isOtpLocked(pickup.otpFailCount)}
      />

      {pickup.verification ? (
        <Card>
          <CardHeader>
            <CardTitle>Verification record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Verified weight:{" "}
              {formatWeight(pickup.verification.actualWeightGrams)}
            </p>
            <p>
              Verified quantity: {pickup.verification.actualQuantity ?? "—"}
            </p>
            <p>Verified quality: {pickup.verification.verifiedQuality}</p>
            <p>
              Coins credited:{" "}
              {formatCoin(Number(pickup.verification.recalculatedCoins))}
            </p>
            <p>
              Customer confirmed:{" "}
              {pickup.verification.customerConfirmed ? "Yes" : "No"}
            </p>
            <p>Verified at: {formatDateTime(pickup.verification.verifiedAt)}</p>
            {pickup.verification.notes ? (
              <p className="text-muted-foreground">
                Notes: {pickup.verification.notes}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
