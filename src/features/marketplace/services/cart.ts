import "server-only";

import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";
import { assertMarketplaceEnabled } from "@/features/marketplace/services/marketplace-settings";

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        include: {
          category: { select: { name: true, slug: true } },
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = items
    .filter((i) => i.product.isActive && !i.product.deletedAt)
    .map((i) => ({
      id: i.id,
      productId: i.productId,
      quantity: i.quantity,
      paymentMode: i.paymentMode,
      product: {
        id: i.product.id,
        name: i.product.name,
        slug: i.product.slug,
        priceInr: decimalToNumber(i.product.priceInr),
        priceCoins: decimalToNumber(i.product.priceCoins),
        stock: i.product.stock,
        ecoScore: i.product.ecoScore,
        category: i.product.category.name,
        imageUrl: i.product.images[0]?.url ?? null,
      },
      lineInr: decimalToNumber(i.product.priceInr) * i.quantity,
      lineCoins: decimalToNumber(i.product.priceCoins) * i.quantity,
    }));

  const subtotalInr = mapped.reduce((s, i) => s + i.lineInr, 0);
  const subtotalCoins = mapped.reduce((s, i) => s + i.lineCoins, 0);

  return {
    id: cart.id,
    items: mapped,
    itemCount: mapped.reduce((s, i) => s + i.quantity, 0),
    subtotalInr: Number(subtotalInr.toFixed(2)),
    subtotalCoins: Number(subtotalCoins.toFixed(4)),
  };
}

export async function addToCart(input: {
  userId: string;
  productId: string;
  quantity: number;
}) {
  await assertMarketplaceEnabled();

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: input.productId,
        isActive: true,
        deletedAt: null,
      },
    });
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (product.stock < 1) throw new Error("OUT_OF_STOCK");

    const cart = await tx.cart.upsert({
      where: { userId: input.userId },
      create: { userId: input.userId },
      update: {},
    });

    const existing = await tx.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId: product.id },
      },
    });

    const nextQty = (existing?.quantity ?? 0) + input.quantity;
    if (nextQty > product.stock) throw new Error("INSUFFICIENT_STOCK");

    await tx.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: product.id },
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: input.quantity,
      },
      update: { quantity: nextQty },
    });
  });

  return getCart(input.userId);
}

export async function updateCartItem(input: {
  userId: string;
  productId: string;
  quantity: number;
}) {
  await assertMarketplaceEnabled();

  const cart = await getOrCreateCart(input.userId);
  if (input.quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: input.productId },
    });
    return getCart(input.userId);
  }

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: input.productId, isActive: true, deletedAt: null },
    });
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (input.quantity > product.stock) throw new Error("INSUFFICIENT_STOCK");

    await tx.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: input.productId },
      },
      create: {
        cartId: cart.id,
        productId: input.productId,
        quantity: input.quantity,
      },
      update: { quantity: input.quantity },
    });
  });

  return getCart(input.userId);
}

export async function removeFromCart(userId: string, productId: string) {
  await assertMarketplaceEnabled();
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
