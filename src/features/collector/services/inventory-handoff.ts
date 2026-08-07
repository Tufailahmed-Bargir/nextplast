import "server-only";

import {
  InventoryGrade,
  InventoryMovementType,
  InventoryOwnerType,
  PlasticQuality,
  type Prisma,
} from "@prisma/client";

function qualityToGrade(quality: PlasticQuality): InventoryGrade {
  if (quality === PlasticQuality.CLEAN) return InventoryGrade.A;
  if (quality === PlasticQuality.CONTAMINATED) return InventoryGrade.C;
  return InventoryGrade.B;
}

/**
 * Add verified plastic into platform inventory, split across listing categories.
 * Allocated grams always sum exactly to actualWeightGrams.
 */
export async function applyInventoryHandoff(
  tx: Prisma.TransactionClient,
  input: {
    pickupRequestId: string;
    actualWeightGrams: number;
    verifiedQuality: PlasticQuality;
    items: {
      categoryId: string;
      claimedQuantity: number;
      claimedWeightGrams: number | null;
    }[];
  },
) {
  if (input.items.length === 0 || input.actualWeightGrams <= 0) {
    return [];
  }

  const grade = qualityToGrade(input.verifiedQuality);
  const ownerKey = "PLATFORM";
  const weights = allocateWeights(input.actualWeightGrams, input.items);
  const movements = [];

  for (const part of weights) {
    if (part.grams <= 0) continue;

    const inventory = await tx.inventory.upsert({
      where: {
        ownerKey_categoryId_grade: {
          ownerKey,
          categoryId: part.categoryId,
          grade,
        },
      },
      create: {
        ownerType: InventoryOwnerType.PLATFORM,
        ownerKey,
        categoryId: part.categoryId,
        grade,
        quantityGrams: part.grams,
        status: "IN_STOCK",
      },
      update: {
        quantityGrams: { increment: part.grams },
        status: "IN_STOCK",
      },
    });

    const movement = await tx.inventoryMovement.create({
      data: {
        inventoryId: inventory.id,
        type: InventoryMovementType.IN,
        quantityGrams: part.grams,
        pickupRequestId: input.pickupRequestId,
        notes: "Collector verification handoff",
        metadata: JSON.parse(
          JSON.stringify({
            verifiedQuality: input.verifiedQuality,
          }),
        ) as Prisma.InputJsonValue,
      },
    });
    movements.push(movement);
  }

  return movements;
}

function allocateWeights(
  totalGrams: number,
  items: {
    categoryId: string;
    claimedQuantity: number;
    claimedWeightGrams: number | null;
  }[],
): { categoryId: string; grams: number }[] {
  const valid = items.filter((i) => i.categoryId);
  if (valid.length === 0) return [];

  const claimedSum = valid.reduce(
    (sum, item) =>
      sum + (item.claimedWeightGrams ?? Math.max(1, item.claimedQuantity) * 100),
    0,
  );

  const floors = valid.map((item) => {
    const weight =
      item.claimedWeightGrams ?? Math.max(1, item.claimedQuantity) * 100;
    return Math.floor((totalGrams * weight) / Math.max(claimedSum, 1));
  });

  const allocated = floors.reduce((sum, n) => sum + n, 0);
  let remainder = totalGrams - allocated;

  return valid.map((item, index) => {
    let grams = floors[index]!;
    // Give leftover grams to the last bucket so the total matches exactly.
    if (index === valid.length - 1) {
      grams += remainder;
      remainder = 0;
    }
    return { categoryId: item.categoryId, grams: Math.max(0, grams) };
  });
}
