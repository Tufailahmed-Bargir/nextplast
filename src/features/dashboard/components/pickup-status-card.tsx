import Link from "next/link";
import { Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { formatRelative } from "@/utils/date";
import { formatCoin, formatWeight } from "@/utils/coin";
import type { PickupSummaryItem } from "@/features/dashboard/types";

interface PickupStatusCardProps {
  pickups: PickupSummaryItem[];
  pendingCount: number;
  completedCount: number;
  showHeaderLink?: boolean;
}

function statusLabel(status: string): string {
  return status.toLowerCase().replaceAll("_", " ");
}

/**
 * Recent pickup statuses for the circular economy workflow.
 */
export function PickupStatusCard({
  pickups,
  pendingCount,
  completedCount,
  showHeaderLink = true,
}: PickupStatusCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Pickup status</CardTitle>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
        {showHeaderLink ? (
          <Link
            href="/history"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>
        {pickups.length === 0 ? (
          <DashboardEmpty
            icon={Truck}
            title="No pickups yet"
            description="Sell plastic to schedule your first collector pickup. Status updates will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {pickups.map((pickup) => (
              <li
                key={pickup.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/60 p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{statusLabel(pickup.status)}</Badge>
                    {pickup.weightGrams != null ? (
                      <span className="text-xs text-muted-foreground">
                        {formatWeight(pickup.weightGrams)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-foreground">
                    {pickup.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelative(
                      pickup.scheduledAt ??
                        pickup.completedAt ??
                        pickup.updatedAt ??
                        pickup.createdAt,
                    )}
                  </p>
                </div>
                {pickup.coins != null && pickup.coins > 0 ? (
                  <span className="shrink-0 text-sm font-semibold coin-text">
                    +{formatCoin(pickup.coins)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
