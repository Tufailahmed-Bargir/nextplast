import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatRelative } from "@/utils/date";
import { getListingLifecycleLabel } from "@/features/plastic/services/status";
import type { ListingStatus, PickupStatus } from "@prisma/client";
import { optimizedImageUrl } from "@/utils/cloudinary-url";

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
    <Card className="hover:shadow-float transition-all hover:-translate-y-0.5">
      <CardContent className="flex gap-3 py-4">
        <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          {imageUrl ? (
            <Image
              src={optimizedImageUrl(imageUrl, 160)}
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
            <span className="text-muted-foreground text-xs">
              {formatRelative(createdAt)}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 truncate text-sm">
            #{id.slice(0, 8)}
            {claimedWeightGrams != null
              ? ` · ${formatWeight(claimedWeightGrams)}`
              : ""}
          </p>
          {coins != null ? (
            <p className="coin-text mt-1 text-sm font-semibold">
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
