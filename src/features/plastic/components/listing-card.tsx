import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatRelative } from "@/utils/date";
import { getListingLifecycleLabel } from "@/features/plastic/services/status";
import type { ListingStatus, PickupStatus } from "@prisma/client";

interface ListingCardProps {
  id: string;
  status: ListingStatus;
  pickupStatus?: PickupStatus | null;
  claimedWeightGrams?: number | null;
  estimatedCoins?: number | null;
  finalCoins?: number | null;
  imageUrl?: string | null;
  createdAt: Date;
  href?: string;
}

/**
 * Compact listing card for history / sell lists.
 */
export function ListingCard({
  id,
  status,
  pickupStatus,
  claimedWeightGrams,
  estimatedCoins,
  finalCoins,
  imageUrl,
  createdAt,
  href,
}: ListingCardProps) {
  const label = getListingLifecycleLabel({
    listingStatus: status,
    pickupStatus,
    finalCoins: finalCoins != null ? Number(finalCoins) : null,
  });
  const coins = finalCoins ?? estimatedCoins;
  const content = (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-float">
      <CardContent className="flex gap-3 py-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{label}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelative(createdAt)}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            #{id.slice(0, 8)}
            {claimedWeightGrams != null
              ? ` · ${formatWeight(claimedWeightGrams)}`
              : ""}
          </p>
          {coins != null ? (
            <p className="mt-1 text-sm font-semibold coin-text">
              ~{formatCoin(Number(coins))} coins
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
