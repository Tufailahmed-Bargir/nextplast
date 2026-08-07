import "server-only";

import {
  InventoryMovementType,
  InventoryOwnerType,
  InventoryStatus,
  Prisma,
  ProfileVerificationStatus,
} from "@prisma/client";
import { prisma } from "@/prisma";

export async function getRecyclerForUser(userId: string) {
  return prisma.recycler.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

export async function listPlatformLotsForPurchase() {
  return prisma.inventory.findMany({
    where: {
      ownerType: InventoryOwnerType.PLATFORM,
      quantityGrams: { gt: 0 },
      status: { in: [InventoryStatus.IN_STOCK, InventoryStatus.RESERVED] },
    },
    include: {
      category: { select: { id: true, name: true, resinType: true } },
    },
    orderBy: [{ grade: "asc" }, { quantityGrams: "desc" }],
  });
}

export async function listRecyclerPurchases(recyclerId: string) {
  return prisma.inventoryMovement.findMany({
    where: {
      type: InventoryMovementType.IN,
      inventory: { recyclerId },
    },
    include: {
      inventory: {
        include: { category: { select: { name: true, resinType: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Purchase grams from a PLATFORM lot into recycler-owned inventory.
 * Records OUT on platform lot + IN on recycler lot with unit price (revenue).
 * Prevents negative platform stock inside a transaction.
 */
export async function purchaseInventoryLot(input: {
  userId: string;
  platformInventoryId: string;
  quantityGrams: number;
  unitPriceInrPerKg: number;
}) {
  if (input.quantityGrams <= 0) {
    throw new Error("INVALID_QUANTITY");
  }
  if (input.unitPriceInrPerKg < 0) {
    throw new Error("INVALID_PRICE");
  }

  const recycler = await prisma.recycler.findUnique({
    where: { userId: input.userId },
  });
  if (!recycler) throw new Error("RECYCLER_NOT_FOUND");
  if (recycler.verificationStatus !== ProfileVerificationStatus.APPROVED) {
    throw new Error("RECYCLER_NOT_APPROVED");
  }

  return prisma.$transaction(async (tx) => {
    const platformLot = await tx.inventory.findUnique({
      where: { id: input.platformInventoryId },
    });
    if (!platformLot || platformLot.ownerType !== InventoryOwnerType.PLATFORM) {
      throw new Error("LOT_NOT_FOUND");
    }
    if (platformLot.quantityGrams < input.quantityGrams) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    const amountInr = Number(
      ((input.quantityGrams / 1000) * input.unitPriceInrPerKg).toFixed(2),
    );

    const updatedPlatform = await tx.inventory.update({
      where: { id: platformLot.id },
      data: {
        quantityGrams: { decrement: input.quantityGrams },
        status:
          platformLot.quantityGrams - input.quantityGrams <= 0
            ? InventoryStatus.DEPLETED
            : InventoryStatus.IN_STOCK,
      },
    });

    if (updatedPlatform.quantityGrams < 0) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    await tx.inventoryMovement.create({
      data: {
        inventoryId: platformLot.id,
        type: InventoryMovementType.OUT,
        quantityGrams: input.quantityGrams,
        unitPriceInr: amountInr,
        notes: `Recycler purchase by ${recycler.companyName}`,
        metadata: {
          recyclerId: recycler.id,
          unitPriceInrPerKg: input.unitPriceInrPerKg,
          revenueInr: amountInr,
        } as Prisma.InputJsonValue,
      },
    });

    const recyclerLot = await tx.inventory.upsert({
      where: {
        ownerKey_categoryId_grade: {
          ownerKey: recycler.id,
          categoryId: platformLot.categoryId,
          grade: platformLot.grade,
        },
      },
      create: {
        ownerType: InventoryOwnerType.RECYCLER,
        ownerKey: recycler.id,
        recyclerId: recycler.id,
        categoryId: platformLot.categoryId,
        grade: platformLot.grade,
        quantityGrams: input.quantityGrams,
        status: InventoryStatus.IN_STOCK,
      },
      update: {
        quantityGrams: { increment: input.quantityGrams },
        status: InventoryStatus.IN_STOCK,
        recyclerId: recycler.id,
      },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryId: recyclerLot.id,
        type: InventoryMovementType.IN,
        quantityGrams: input.quantityGrams,
        unitPriceInr: amountInr,
        notes: "Purchased from NexPlast platform inventory",
        metadata: {
          fromInventoryId: platformLot.id,
          revenueInr: amountInr,
        } as Prisma.InputJsonValue,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: input.userId,
        action: "RECYCLER_PURCHASE",
        entityType: "Inventory",
        entityId: platformLot.id,
        metadata: {
          grams: input.quantityGrams,
          amountInr,
          recyclerId: recycler.id,
        } as Prisma.InputJsonValue,
      },
    });

    return {
      platformInventoryId: platformLot.id,
      recyclerInventoryId: recyclerLot.id,
      quantityGrams: input.quantityGrams,
      amountInr,
    };
  });
}
