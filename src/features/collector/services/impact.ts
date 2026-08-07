import "server-only";

import { Prisma } from "@prisma/client";
import { IMPACT_FACTORS } from "@/constants/platform";
import type { Prisma as PrismaNs } from "@prisma/client";

/**
 * Bump environmental impact aggregates after a verified pickup.
 */
export async function applyEnvironmentalImpact(
  tx: PrismaNs.TransactionClient,
  input: { userId: string; weightGrams: number },
) {
  const kg = input.weightGrams / 1000;
  const co2 = new Prisma.Decimal(kg * IMPACT_FACTORS.co2KgPerKgPlastic);
  const trees = new Prisma.Decimal(kg * IMPACT_FACTORS.treesPerKgPlastic);
  const water = new Prisma.Decimal(kg * IMPACT_FACTORS.waterLitersPerKgPlastic);
  const energy = new Prisma.Decimal(kg * IMPACT_FACTORS.energyKwhPerKgPlastic);
  const oil = new Prisma.Decimal(kg * IMPACT_FACTORS.oilLitersPerKgPlastic);
  const ocean = new Prisma.Decimal(kg);

  await tx.environmentalImpact.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      plasticRecycledGrams: input.weightGrams,
      co2SavedKg: co2,
      treesSaved: trees,
      oceanPlasticPreventedKg: ocean,
      waterSavedLiters: water,
      energySavedKwh: energy,
      oilSavedLiters: oil,
    },
    update: {
      plasticRecycledGrams: { increment: input.weightGrams },
      co2SavedKg: { increment: co2 },
      treesSaved: { increment: trees },
      oceanPlasticPreventedKg: { increment: ocean },
      waterSavedLiters: { increment: water },
      energySavedKwh: { increment: energy },
      oilSavedLiters: { increment: oil },
    },
  });
}
