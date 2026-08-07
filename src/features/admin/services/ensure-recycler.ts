import "server-only";

import {
  ProfileVerificationStatus,
  UserRole,
  type Recycler,
} from "@prisma/client";
import { prisma } from "@/prisma";

/**
 * Ensure a Recycler profile exists when a user holds the RECYCLER role.
 */
export async function ensureRecyclerProfile(
  userId: string,
  companyName = "Recycler Partner",
): Promise<Recycler> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true, name: true },
  });
  if (!user || !user.isActive) {
    throw new Error("RECYCLER_NOT_FOUND");
  }
  if (
    user.role !== UserRole.RECYCLER &&
    user.role !== UserRole.ADMIN &&
    user.role !== UserRole.SUPER_ADMIN
  ) {
    throw new Error("NOT_A_RECYCLER");
  }

  return prisma.recycler.upsert({
    where: { userId },
    create: {
      userId,
      companyName: companyName || user.name || "Recycler Partner",
      verificationStatus: ProfileVerificationStatus.PENDING,
    },
    update: {},
  });
}

export async function listRecyclers() {
  return prisma.recycler.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      _count: { select: { inventory: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
