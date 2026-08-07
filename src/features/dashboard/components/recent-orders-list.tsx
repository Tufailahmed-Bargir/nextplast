import { ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { formatCoin } from "@/utils/coin";
import { formatDateTime } from "@/utils/date";
import type { OrderSummaryItem } from "@/features/dashboard/types";

interface RecentOrdersListProps {
  orders: OrderSummaryItem[];
  title?: string;
}

/**
 * Shared recent-orders list for profile and history pages.
 */
export function RecentOrdersList({
  orders,
  title = "Recent orders",
}: RecentOrdersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <DashboardEmpty
            icon={ShoppingBag}
            title="No orders yet"
            description="Marketplace orders will appear here after checkout. Nature Coins stay ready to redeem."
          />
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {order.itemCount} item(s) ·{" "}
                    {order.status.toLowerCase().replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(order.placedAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold coin-text">
                  {formatCoin(order.coinAmount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
