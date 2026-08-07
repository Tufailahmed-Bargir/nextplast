import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/prisma";

/**
 * Ensure every authenticated user has the 1:1 dashboard records.
 * Creates zeroed Wallet / UserProfile / EnvironmentalImpact when missing.
 *
 * Uses createMany + skipDuplicates so concurrent dashboard requests
 * (common under Turbopack) do not race on unique userId upserts.
 */
export async function ensureUserDashboardRecords(userId: string): Promise<void> {
  try {
    await prisma.$transaction([
      prisma.wallet.createMany({
        data: [{ userId }],
        skipDuplicates: true,
      }),
      prisma.userProfile.createMany({
        data: [{ userId }],
        skipDuplicates: true,
      }),
      prisma.environmentalImpact.createMany({
        data: [{ userId }],
        skipDuplicates: true,
      }),
    ]);
  } catch (error) {
    // Last-resort guard if another request won a create race mid-transaction.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }
    throw error;
  }
}
