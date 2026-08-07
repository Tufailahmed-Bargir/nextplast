import "server-only";

import { PaymentMode, type Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";
import { assertMarketplaceEnabled } from "@/features/marketplace/services/marketplace-settings";
import {
  computePaymentSplit,
  shippingChargeInr,
} from "@/features/marketplace/lib/pricing";
import { spendNatureCoins } from "@/features/marketplace/services/wallet-spend";
import { getPaymentProvider } from "@/features/marketplace/services/payment-provider";
import type { ShippingAddress } from "@/validations/marketplace";

export async function getSavedAddresses(userId: string): Promise<ShippingAddress[]> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { preferences: true, phone: true, city: true, address: true },
  });

  const prefs = (profile?.preferences ?? {}) as {
    savedAddresses?: ShippingAddress[];
  };
  const saved = (prefs.savedAddresses ?? []).filter(
    (a) => a.pinCode && a.pinCode !== "000000" && a.addressLine1 && a.city,
  );

  return saved;
}

export async function saveAddressToProfile(
  userId: string,
  address: ShippingAddress,
) {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      phone: address.phone,
      city: address.city,
      address: address.addressLine1,
      preferences: {
        savedAddresses: [address],
      } as Prisma.InputJsonValue,
    },
    update: {},
  });

  const prefs = (profile.preferences ?? {}) as {
    savedAddresses?: ShippingAddress[];
  };
  const existing = prefs.savedAddresses ?? [];
  const filtered = existing.filter(
    (a) =>
      !(
        a.addressLine1 === address.addressLine1 &&
        a.pinCode === address.pinCode
      ),
  );
  const next = [address, ...filtered].slice(0, 5);

  await prisma.userProfile.update({
    where: { userId },
    data: {
      phone: address.phone,
      city: address.city,
      address: address.addressLine1,
      preferences: {
        ...prefs,
        savedAddresses: next,
      } as Prisma.InputJsonValue,
    },
  });
}

function allocateShares(
  total: number,
  weights: number[],
  decimals: number,
): number[] {
  if (weights.length === 0) return [];
  const weightSum = weights.reduce((s, w) => s + w, 0);
  if (weightSum <= 0) {
    return weights.map((_, i) => (i === 0 ? total : 0));
  }
  const parts = weights.map((w) =>
    Number(((total * w) / weightSum).toFixed(decimals)),
  );
  const sum = parts.reduce((s, n) => s + n, 0);
  const diff = Number((total - sum).toFixed(decimals));
  parts[parts.length - 1] = Number(
    ((parts[parts.length - 1] ?? 0) + diff).toFixed(decimals),
  );
  return parts;
}

export async function placeOrder(input: {
  userId: string;
  paymentMode: PaymentMode;
  coinsToRedeem?: number;
  deliveryMethod: "STANDARD" | "EXPRESS";
  shippingAddress: ShippingAddress;
  saveAddress?: boolean;
  notes?: string;
  /** Client-generated UUID; prevents double-submit duplicates. */
  checkoutId: string;
}) {
  const flags = await assertMarketplaceEnabled();

  if (!input.checkoutId || input.checkoutId.length < 8) {
    throw new Error("INVALID_CHECKOUT");
  }

  const checkoutMarker = `checkoutId:${input.checkoutId}`;

  // Replay: return existing order for the same checkout attempt.
  const existing = await prisma.order.findFirst({
    where: {
      userId: input.userId,
      notes: { contains: checkoutMarker },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return {
      id: existing.id,
      status: existing.status,
      paymentMode: existing.paymentMode,
      cashAmountInr: decimalToNumber(existing.cashAmountInr),
      coinAmount: decimalToNumber(existing.coinAmount),
      itemCount: existing.items.length,
      replayed: true as const,
    };
  }

  const shipping = shippingChargeInr(input.deliveryMethod);

  const order = await prisma.$transaction(async (tx) => {
    // Serialize concurrent checkouts with the same client checkoutId (Postgres).
    await tx.$executeRawUnsafe(
      `SELECT pg_advisory_xact_lock(hashtext($1))`,
      `checkout:${input.checkoutId}`,
    );

    // Re-check replay inside TX (race between two parallel submits).
    const raced = await tx.order.findFirst({
      where: {
        userId: input.userId,
        notes: { contains: checkoutMarker },
      },
      include: { items: true },
    });
    if (raced) {
      return raced;
    }

    const cart = await tx.cart.findUnique({
      where: { userId: input.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      throw new Error("CART_EMPTY");
    }

    const liveLines: {
      productId: string;
      productName: string;
      quantity: number;
      unitPriceInr: number;
      unitPriceCoins: number;
      lineInr: number;
      lineCoins: number;
    }[] = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product.isActive || product.deletedAt) {
        throw new Error("PRODUCT_NOT_FOUND");
      }
      if (product.stock < item.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }
      const unitPriceInr = decimalToNumber(product.priceInr);
      const unitPriceCoins = decimalToNumber(product.priceCoins);
      liveLines.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPriceInr,
        unitPriceCoins,
        lineInr: Number((unitPriceInr * item.quantity).toFixed(2)),
        lineCoins: Number((unitPriceCoins * item.quantity).toFixed(4)),
      });
    }

    const merchandiseInr = Number(
      liveLines.reduce((s, l) => s + l.lineInr, 0).toFixed(2),
    );
    const listCoins = Number(
      liveLines.reduce((s, l) => s + l.lineCoins, 0).toFixed(4),
    );

    const wallet = await tx.wallet.findUnique({
      where: { userId: input.userId },
    });
    const walletBalance = wallet
      ? decimalToNumber(wallet.availableBalance)
      : 0;

    const split = computePaymentSplit({
      mode: input.paymentMode,
      totalInr: merchandiseInr,
      listCoins,
      coinsToRedeem: input.coinsToRedeem,
      walletBalance,
      allowHybrid: flags.allowHybridPayments,
    });

    const cashAmountInr = Number(
      (split.cashAmountInr + shipping).toFixed(2),
    );

    const weights = liveLines.map((l) => l.lineInr);
    const itemCoinsParts = allocateShares(
      split.coinAmount,
      weights,
      4,
    );
    const itemCashParts = allocateShares(
      split.cashAmountInr,
      weights,
      2,
    );

    // Claim cart inside TX before creating the order (blocks double checkout).
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    const created = await tx.order.create({
      data: {
        userId: input.userId,
        status: "PENDING_PAYMENT",
        paymentMode: split.mode,
        cashAmountInr,
        coinAmount: split.coinAmount,
        shippingAddress: JSON.parse(
          JSON.stringify(input.shippingAddress),
        ) as Prisma.InputJsonValue,
        notes: [
          input.notes,
          checkoutMarker,
          `delivery:${input.deliveryMethod}`,
          `shippingInr:${shipping}`,
          `merchandiseInr:${merchandiseInr}`,
        ]
          .filter(Boolean)
          .join(" | "),
        items: {
          create: liveLines.map((line, idx) => ({
            productId: line.productId,
            productName: line.productName,
            quantity: line.quantity,
            unitPriceInr: line.unitPriceInr,
            unitPriceCoins: line.unitPriceCoins,
            cashAmountInr: itemCashParts[idx] ?? 0,
            coinAmount: itemCoinsParts[idx] ?? 0,
          })),
        },
      },
      include: { items: true },
    });

    for (const line of liveLines) {
      const updated = await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.stock < 0) throw new Error("INSUFFICIENT_STOCK");
    }

    if (split.coinAmount > 0) {
      await spendNatureCoins(tx, {
        userId: input.userId,
        amount: split.coinAmount,
        title: "Marketplace purchase",
        description: `Order ${created.id.slice(0, 8)}`,
        referenceType: "Order",
        referenceId: created.id,
        idempotencyKey: `order-spend:${input.checkoutId}`,
        metadata: { paymentMode: split.mode, orderId: created.id },
      });
    }

    const provider = getPaymentProvider();
    const cashResult = await provider.initiateCashPayment({
      orderId: created.id,
      amountInr: cashAmountInr,
      userId: input.userId,
    });

    if (cashResult.status === "failed") {
      throw new Error("PAYMENT_FAILED");
    }

    const finalized = await tx.order.update({
      where: { id: created.id },
      data: {
        status: "PROCESSING",
        notes: [
          created.notes,
          `paymentProvider:${cashResult.provider}`,
          cashResult.externalId ? `externalId:${cashResult.externalId}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
      },
      include: { items: true },
    });

    await tx.notification.create({
      data: {
        userId: input.userId,
        type: "ORDER",
        title: "Order placed",
        body: `Your order #${created.id.slice(0, 8)} is being processed.`,
        data: JSON.parse(
          JSON.stringify({ orderId: created.id }),
        ) as Prisma.InputJsonValue,
      },
    });

    return finalized;
  });

  if (input.saveAddress) {
    await saveAddressToProfile(input.userId, input.shippingAddress);
  }

  return {
    id: order.id,
    status: order.status,
    paymentMode: order.paymentMode,
    cashAmountInr: decimalToNumber(order.cashAmountInr),
    coinAmount: decimalToNumber(order.coinAmount),
    itemCount: order.items.length,
    replayed: false as const,
  };
}
