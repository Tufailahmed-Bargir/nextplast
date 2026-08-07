import "server-only";

import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";
import { writeAdminLog } from "@/features/admin/services/admin-audit";

export async function listAdminProducts(take = 60) {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      category: { select: { name: true } },
      seller: { select: { name: true, email: true } },
      _count: { select: { orderItems: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    seller: p.seller?.name ?? p.seller?.email ?? "Platform",
    priceInr: decimalToNumber(p.priceInr),
    priceCoins: decimalToNumber(p.priceCoins),
    stock: p.stock,
    isActive: p.isActive,
    orderCount: p._count.orderItems,
    createdAt: p.createdAt,
  }));
}

export async function listAdminOrders(take = 60) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    status: o.status,
    paymentMode: o.paymentMode,
    cashAmountInr: decimalToNumber(o.cashAmountInr),
    coinAmount: decimalToNumber(o.coinAmount),
    userName: o.user.name ?? o.user.email,
    itemCount: o._count.items,
    createdAt: o.createdAt,
  }));
}

export async function setProductActive(input: {
  adminId: string;
  productId: string;
  isActive: boolean;
}) {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, deletedAt: null },
  });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { isActive: input.isActive },
  });

  await writeAdminLog(prisma, {
    adminId: input.adminId,
    action: input.isActive ? "PRODUCT_ACTIVATED" : "PRODUCT_DEACTIVATED",
    targetType: "Product",
    targetId: product.id,
  });

  return updated;
}
