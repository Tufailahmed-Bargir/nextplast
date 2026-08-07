import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserOrder } from "@/features/marketplace/services/orders";
import { OrderTimeline } from "@/features/marketplace/components/order-timeline";
import { InvoiceButton } from "@/features/marketplace/components/invoice-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatCoin, formatInr } from "@/utils/coin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/orders");

  const { id } = await params;
  const order = await getUserOrder(session.user.id, id);
  if (!order) notFound();

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/orders"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Orders
          </Link>
          <h1 className="font-display text-2xl font-bold">
            Order #{order.id.slice(0, 8)}
          </h1>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {order.status.toLowerCase().replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline">
              {order.paymentMode.toLowerCase()}
            </Badge>
          </div>
        </div>
        <InvoiceButton orderId={order.id} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-xl border border-border p-3"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  {item.slug ? (
                    <Link
                      href={`/marketplace/${item.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="font-medium">{item.productName}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Qty {item.quantity}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>{formatCoin(item.coinAmount)}</p>
                  <p className="text-muted-foreground">
                    {formatInr(item.cashAmountInr)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Nature Coins</span>
                <span>{formatCoin(order.coinAmount)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Cash</span>
                <span>{formatInr(order.cashAmountInr)}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2
                  ? `, ${order.shippingAddress.addressLine2}`
                  : ""}
              </p>
              <p>
                {order.shippingAddress.city} {order.shippingAddress.pinCode}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Status timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline steps={order.timeline} />
            </CardContent>
          </Card>
          <Link
            href="/marketplace"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
