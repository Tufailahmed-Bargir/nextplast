import "server-only";

import { Prisma } from "@prisma/client";
import type { Prisma as PrismaNs } from "@prisma/client";

/**
 * Credit Nature Coins to a user's wallet after verified pickup.
 * Idempotent via unique idempotencyKey.
 */
export async function creditNatureCoins(
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
  if (existing) {
    return existing;
  }

  const amount = new Prisma.Decimal(input.amount);

  const wallet = await tx.wallet.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      availableBalance: amount,
      earnedTotal: amount,
    },
    update: {
      availableBalance: { increment: amount },
      earnedTotal: { increment: amount },
    },
  });

  const refreshed = await tx.wallet.findUniqueOrThrow({
    where: { id: wallet.id },
  });

  try {
    return await tx.walletTransaction.create({
      data: {
        walletId: refreshed.id,
        type: "EARN",
        status: "COMPLETED",
        amount,
        balanceAfter: refreshed.availableBalance,
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
      return tx.walletTransaction.findUniqueOrThrow({
        where: { idempotencyKey: input.idempotencyKey },
      });
    }
    throw error;
  }
}
