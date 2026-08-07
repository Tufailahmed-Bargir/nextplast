import "server-only";

import { Prisma } from "@prisma/client";
import type { Prisma as PrismaNs } from "@prisma/client";

/**
 * Debit Nature Coins for marketplace spend. Idempotent via unique key.
 * On unique-key conflict, throw so the surrounding transaction rolls back
 * any balance decrement (avoids double-debit).
 */
export async function spendNatureCoins(
  tx: PrismaNs.TransactionClient,
  input: {
    userId: string;
    amount: number;
    title: string;
    description: string;
    referenceType: string;
    referenceId: string;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
  },
) {
  if (input.amount <= 0) {
    throw new Error("INVALID_COIN_AMOUNT");
  }

  const existing = await tx.walletTransaction.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) return existing;

  const amount = new Prisma.Decimal(input.amount);

  const wallet = await tx.wallet.findUnique({
    where: { userId: input.userId },
  });
  if (!wallet) throw new Error("WALLET_NOT_FOUND");
  if (wallet.availableBalance.lessThan(amount)) {
    throw new Error("INSUFFICIENT_COINS");
  }

  const updated = await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      availableBalance: { decrement: amount },
      spentTotal: { increment: amount },
    },
  });

  if (updated.availableBalance.lessThan(0)) {
    throw new Error("INSUFFICIENT_COINS");
  }

  try {
    return await tx.walletTransaction.create({
      data: {
        walletId: updated.id,
        type: "SPEND",
        status: "COMPLETED",
        amount,
        balanceAfter: updated.availableBalance,
        title: input.title,
        description: input.description,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        idempotencyKey: input.idempotencyKey,
        metadata: input.metadata
          ? (JSON.parse(
              JSON.stringify(input.metadata),
            ) as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Force TX rollback so the decrement above is undone.
      throw new Error("DUPLICATE_SPEND");
    }
    throw error;
  }
}
