import Image from "next/image";
import { ExternalLink, MapPin, Package, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatDateTime } from "@/utils/date";
import {
  googleMapsDirectionsUrl,
  googleMapsSearchUrl,
} from "@/features/collector/lib/maps";
import { cn } from "@/lib/utils";

interface PickupDetailsProps {
  pickupId: string;
  status: string;
  address: string;
  scheduledAt?: Date | null;
  distanceKm?: number | null;
  notes?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  claimedWeightGrams?: number | null;
  claimedQuantity?: number | null;
  quality?: string | null;
  estimatedCoins?: number | null;
  imageUrl?: string | null;
  aiSummary?: string | null;
}

/**
 * Read-only pickup / customer / listing summary for collectors.
 */
export function PickupDetails({
  pickupId,
  status,
  address,
  scheduledAt,
  distanceKm,
  notes,
  customerName,
  customerEmail,
  claimedWeightGrams,
  claimedQuantity,
  quality,
  estimatedCoins,
  imageUrl,
  aiSummary,
}: PickupDetailsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 dark:border-sky-900 dark:from-sky-950 dark:to-slate-900">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Pickup details</CardTitle>
            <Badge variant="secondary">
              {status.toLowerCase().replaceAll("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            #{pickupId.slice(0, 8)}
            {scheduledAt ? ` · ${formatDateTime(scheduledAt)}` : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-xl bg-background/80 p-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Address
            </p>
            <p className="mt-1 font-semibold">{address}</p>
            {distanceKm != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                ~{distanceKm} km away
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={googleMapsSearchUrl(address)}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Open in Maps <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={googleMapsDirectionsUrl(address)}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                Directions
              </a>
            </div>
          </div>

          <div className="rounded-xl bg-background/80 p-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" /> Customer
            </p>
            <p className="mt-1 font-semibold">{customerName ?? "Customer"}</p>
            {customerEmail ? (
              <p className="text-xs text-muted-foreground">{customerEmail}</p>
            ) : null}
          </div>

          {notes ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Instructions: </span>
              {notes}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Submitted plastic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {imageUrl ? (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              <Image
                src={imageUrl}
                alt="Listing photo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                unoptimized
              />
            </div>
          ) : null}
          <div className="rounded-xl border border-border p-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" /> User claim (do not overwrite)
            </p>
            <p className="mt-1 font-semibold">
              {claimedWeightGrams != null
                ? formatWeight(claimedWeightGrams)
                : "—"}
              {claimedQuantity != null ? ` · ${claimedQuantity} item(s)` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Quality claimed: {quality ?? "—"}
              {estimatedCoins != null
                ? ` · ~${formatCoin(estimatedCoins)} est. coins`
                : ""}
            </p>
            {aiSummary ? (
              <p className="mt-2 text-xs text-muted-foreground">{aiSummary}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
