import Link from "next/link";
import { CheckCircle2, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatRelative } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { PickupStatus } from "@prisma/client";

interface PickupCardProps {
  id: string;
  status: PickupStatus;
  customerName?: string | null;
  address: string;
  claimedWeightGrams?: number | null;
  estimatedCoins?: number | null;
  distanceKm?: number | null;
  scheduledAt?: Date | null;
  href: string;
}

function statusLabel(status: PickupStatus): string {
  return status.toLowerCase().replaceAll("_", " ");
}

/**
 * Compact pickup row for collector lists.
 */
export function PickupCard({
  id,
  status,
  customerName,
  address,
  claimedWeightGrams,
  estimatedCoins,
  distanceKm,
  scheduledAt,
  href,
}: PickupCardProps) {
  const done = status === "COMPLETED";
  const active =
    status === "IN_PROGRESS" ||
    status === "AWAITING_VERIFICATION" ||
    status === "IN_TRANSIT";

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl bg-muted/40 p-3.5 transition-colors hover:bg-muted"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          done && "bg-emerald-50 dark:bg-emerald-950",
          active && "bg-sky-50 dark:bg-sky-950",
          !done && !active && "bg-muted",
        )}
      >
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <Truck
            className={cn(
              "h-5 w-5",
              active ? "text-sky-600" : "text-muted-foreground",
            )}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold">
            #{id.slice(0, 8)}
            {customerName ? ` · ${customerName}` : ""}
          </p>
          <Badge variant="secondary">{statusLabel(status)}</Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {address}
          {distanceKm != null ? ` · ${distanceKm} km` : ""}
          {scheduledAt ? ` · ${formatRelative(scheduledAt)}` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {claimedWeightGrams != null ? (
          <p className="text-sm font-semibold">
            {formatWeight(claimedWeightGrams)}
          </p>
        ) : null}
        {estimatedCoins != null ? (
          <p className="text-xs text-muted-foreground">
            ~{formatCoin(estimatedCoins)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
