import "server-only";

import { Prisma, UserRole, WalletTxType } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";
import { writeAdminLog } from "@/features/admin/services/admin-audit";
import { getSetting } from "@/features/admin/services/app-settings";
import { SETTING_KEYS } from "@/validations/admin";

export async function listWalletTransactions(take = 60) {
  const rows = await prisma.walletTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      wallet: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return rows.map((tx) => ({
    id: tx.id,
    type: tx.type,
    status: tx.status,
    amount: decimalToNumber(tx.amount),
    balanceAfter: decimalToNumber(tx.balanceAfter),
    title: tx.title,
    description: tx.description,
    createdAt: tx.createdAt,
    userId: tx.wallet.user.id,
    userName: tx.wallet.user.name ?? tx.wallet.user.email,
  }));
}

export async function adjustUserWallet(input: {
  adminId: string;
  userId: string;
  amount: number;
  reason: string;
}) {
  if (input.adminId === input.userId) {
    throw new Error("CANNOT_ADJUST_SELF");
  }

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) throw new Error("USER_NOT_FOUND");
  if (
    target.role === UserRole.ADMIN ||
    target.role === UserRole.SUPER_ADMIN
  ) {
    throw new Error("CANNOT_ADJUST_ADMIN");
  }

  const walletSettings = await getSetting(SETTING_KEYS.wallet, {
    adjustmentsEnabled: true,
    maxAdjustmentCoins: 10_000,
  });
  if (!walletSettings.adjustmentsEnabled) {
    throw new Error("ADJUSTMENTS_DISABLED");
  }
  if (Math.abs(input.amount) > walletSettings.maxAdjustmentCoins) {
    throw new Error("ADJUSTMENT_TOO_LARGE");
  }

  const amount = new Prisma.Decimal(input.amount);
  const idempotencyKey = `admin-adjust:${randomUUID()}`;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.wallet.findUnique({
      where: { userId: input.userId },
    });

    if (!existing && amount.lessThan(0)) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const wallet = existing
      ? await tx.wallet.update({
          where: { id: existing.id },
          data: {
            availableBalance: { increment: amount },
            earnedTotal: amount.greaterThan(0)
              ? { increment: amount }
              : undefined,
            spentTotal: amount.lessThan(0)
              ? { increment: amount.abs() }
              : undefined,
          },
        })
      : await tx.wallet.create({
          data: {
            userId: input.userId,
            availableBalance: amount,
            earnedTotal: amount.greaterThan(0) ? amount : new Prisma.Decimal(0),
          },
        });

    if (wallet.availableBalance.lessThan(0)) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: WalletTxType.ADJUST,
        status: "COMPLETED",
        amount,
        balanceAfter: wallet.availableBalance,
        title: "Admin wallet adjustment",
        description: input.reason,
        referenceType: "AdminAdjustment",
        referenceId: input.adminId,
        idempotencyKey,
        metadata: JSON.parse(
          JSON.stringify({
            adminId: input.adminId,
            reason: input.reason,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    await writeAdminLog(tx, {
      adminId: input.adminId,
      action: "WALLET_ADJUST",
      targetType: "User",
      targetId: input.userId,
      metadata: {
        amount: input.amount,
        reason: input.reason,
        transactionId: transaction.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: input.userId,
        type: "SYSTEM",
        title: "Wallet updated",
        body: `An admin adjusted your Nature Coin balance by ${input.amount}.`,
        data: JSON.parse(
          JSON.stringify({
            amount: input.amount,
            reason: input.reason,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    return transaction;
  });
}
