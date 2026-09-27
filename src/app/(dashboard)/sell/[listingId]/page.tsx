import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import {
  canEditPickupAddress,
  getListingForUser,
} from "@/features/plastic/services/listing-service";
import { EditPickupAddressDialog } from "@/features/plastic/components/edit-pickup-address-dialog";
import { DetectionSummary } from "@/features/plastic/components/detection-summary";
import { ListingTimeline } from "@/features/plastic/components/listing-timeline";
import { CoinPreviewCard } from "@/features/plastic/components/coin-preview-card";
import { mapListingDetections } from "@/features/plastic/lib/map-detections";
import {
  buildStatusTimeline,
  getListingLifecycleLabel,
} from "@/features/plastic/services/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatWeight, formatCoin } from "@/utils/coin";
import { formatDateTime } from "@/utils/date";
import { decimalToNumber } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Listing details",
};

interface PageProps {
  params: Promise<{ listingId: string }>;
}

/**
 * Listing detail — AI results, pickup handoff, and status timeline.
 */
export default async function ListingDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { listingId } = await params;
  const listing = await getListingForUser(listingId, session.user.id);
  if (!listing) notFound();

  const label = getListingLifecycleLabel({
    listingStatus: listing.status,
    pickupStatus: listing.pickupRequest?.status,
    finalCoins: listing.finalCoins
      ? decimalToNumber(listing.finalCoins)
      : null,
  });

  const timeline = buildStatusTimeline({
    listingStatus: listing.status,
    pickupStatus: listing.pickupRequest?.status,
    finalCoins: listing.finalCoins
      ? decimalToNumber(listing.finalCoins)
      : null,
    createdAt: listing.createdAt,
    scheduledAt: listing.pickupRequest?.scheduledAt,
    completedAt: listing.pickupRequest?.completedAt,
  });

  const detections = mapListingDetections(listing.aiResults, listing.images);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold">
              Listing #{listing.id.slice(0, 8)}
            </h2>
            <Badge variant="secondary">{label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Submitted {formatDateTime(listing.createdAt)}
          </p>
        </div>
        <Link href="/sell" className={cn(buttonVariants({ variant: "outline" }))}>
          New listing
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Weight claimed:{" "}
              {listing.claimedWeightGrams != null
                ? formatWeight(listing.claimedWeightGrams)
                : "—"}
            </p>
            <p>Quality: {listing.quality}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p>
                Address: {listing.pickupRequest?.address ?? listing.pickupAddress}
              </p>
              {listing.pickupRequest &&
              canEditPickupAddress(listing.status, listing.pickupRequest.status) ? (
                <EditPickupAddressDialog
                  listingId={listing.id}
                  address={listing.pickupRequest.address}
                  latitude={
                    listing.pickupRequest.latitude != null
                      ? Number(listing.pickupRequest.latitude)
                      : null
                  }
                  longitude={
                    listing.pickupRequest.longitude != null
                      ? Number(listing.pickupRequest.longitude)
                      : null
                  }
                />
              ) : null}
            </div>
            {listing.pickupRequest?.scheduledAt ? (
              <p>
                Pickup: {formatDateTime(listing.pickupRequest.scheduledAt)}
              </p>
            ) : null}
            {listing.items.length > 0 ? (
              <ul className="list-inside list-disc text-muted-foreground">
                {listing.items.map((item) => (
                  <li key={item.id}>
                    {item.category.name}: {item.claimedQuantity} item(s)
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
        <CoinPreviewCard
          estimatedCoins={decimalToNumber(
            listing.finalCoins ?? listing.estimatedCoins,
          )}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingTimeline items={timeline} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI detection (collector handoff)</CardTitle>
        </CardHeader>
        <CardContent>
          <DetectionSummary detections={detections} />
          <p className="mt-4 text-xs text-muted-foreground">
            AI values and user-confirmed values are stored for Phase 6 collector
            verification. Estimated coins:{" "}
            {formatCoin(decimalToNumber(listing.estimatedCoins))} (provisional).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
