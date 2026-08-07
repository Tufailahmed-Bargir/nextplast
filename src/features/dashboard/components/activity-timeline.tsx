import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Coins,
  Package,
  Recycle,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelative } from "@/utils/date";
import { formatCoin } from "@/utils/coin";
import type { ActivityItem } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

const kindIcon: Record<ActivityItem["kind"], LucideIcon> = {
  wallet: Coins,
  pickup: Truck,
  listing: Recycle,
  order: ShoppingBag,
  notification: Bell,
};

interface ActivityTimelineProps {
  items: ActivityItem[];
  title?: string;
  className?: string;
}

/**
 * Chronological activity feed from wallet, pickups, listings, and orders.
 */
export function ActivityTimeline({
  items,
  title = "Recent activity",
  className,
}: ActivityTimelineProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Sell plastic, complete pickups, or shop the marketplace to see your
              history here.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {items.map((item) => {
              const Icon = kindIcon[item.kind];
              return (
                <li key={item.id} className="flex gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.coins != null && item.coins !== 0 ? (
                        <span
                          className={cn(
                            "shrink-0 text-xs font-semibold",
                            item.coins > 0 ? "coin-text" : "text-destructive",
                          )}
                        >
                          {item.coins > 0 ? "+" : ""}
                          {formatCoin(item.coins)}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelative(item.at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
