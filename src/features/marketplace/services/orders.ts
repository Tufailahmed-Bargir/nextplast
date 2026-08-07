import "server-only";

import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";
import type { ShippingAddress } from "@/validations/marketplace";

export async function listUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: true,
      _count: { select: { items: true } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    status: o.status,
    paymentMode: o.paymentMode,
    cashAmountInr: decimalToNumber(o.cashAmountInr),
    coinAmount: decimalToNumber(o.coinAmount),
    itemCount: o._count.items,
    placedAt: o.placedAt,
    items: o.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
    })),
  }));
}

export async function getUserOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              images: {
                take: 1,
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
              },
            },
          },
        },
      },
    },
  });
  if (!order) return null;

  const address = order.shippingAddress as ShippingAddress;

  return {
    id: order.id,
    status: order.status,
    paymentMode: order.paymentMode,
    cashAmountInr: decimalToNumber(order.cashAmountInr),
    coinAmount: decimalToNumber(order.coinAmount),
    notes: order.notes,
    placedAt: order.placedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    shippingAddress: address,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      slug: i.product?.slug ?? null,
      imageUrl: i.product?.images[0]?.url ?? null,
      quantity: i.quantity,
      unitPriceInr: decimalToNumber(i.unitPriceInr),
      unitPriceCoins: decimalToNumber(i.unitPriceCoins),
      cashAmountInr: decimalToNumber(i.cashAmountInr),
      coinAmount: decimalToNumber(i.coinAmount),
    })),
    timeline: buildTimeline(order),
  };
}

function buildTimeline(order: {
  status: string;
  placedAt: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
}) {
  const steps = [
    {
      key: "placed",
      label: "Order placed",
      at: order.placedAt,
      done: true,
    },
    {
      key: "processing",
      label: "Processing",
      at: order.placedAt,
      done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      key: "shipped",
      label: "Shipped",
      at: order.shippedAt,
      done: ["SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      key: "delivered",
      label: "Delivered",
      at: order.deliveredAt,
      done: order.status === "DELIVERED",
    },
  ];

  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    return [
      steps[0],
      {
        key: "cancelled",
        label: order.status === "REFUNDED" ? "Refunded" : "Cancelled",
        at: order.cancelledAt,
        done: true,
      },
    ];
  }

  return steps;
}

export async function userHasPurchasedProduct(
  userId: string,
  productId: string,
) {
  const item = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: "DELIVERED",
      },
    },
    select: { id: true },
  });
  return Boolean(item);
}
