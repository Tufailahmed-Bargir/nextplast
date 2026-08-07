import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listUserOrders } from "@/features/marketplace/services/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCoin, formatInr } from "@/utils/coin";
import { formatRelative } from "@/utils/date";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/orders");

  const orders = await listUserOrders(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Your orders</h1>
        <p className="text-sm text-muted-foreground">
          Marketplace order history from Prisma.
        </p>
      </div>
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No orders yet.{" "}
            <Link href="/marketplace" className="underline">
              Start shopping
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="transition hover:shadow-float">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">#{o.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {o.items.map((i) => i.productName).join(", ")} ·{" "}
                      {formatRelative(o.placedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {o.status.toLowerCase().replaceAll("_", " ")}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatCoin(o.coinAmount)} · {formatInr(o.cashAmountInr)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
