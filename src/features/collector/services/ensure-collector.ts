import "server-only";

import {
  ProfileVerificationStatus,
  UserRole,
  type Collector,
} from "@prisma/client";
import { prisma } from "@/prisma";

/**
 * Ensure a Collector profile exists for users with the COLLECTOR role.
 */
export async function ensureCollectorProfile(userId: string): Promise<Collector> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) {
    throw new Error("COLLECTOR_NOT_FOUND");
  }
  if (
    user.role !== UserRole.COLLECTOR &&
    user.role !== UserRole.ADMIN &&
    user.role !== UserRole.SUPER_ADMIN
  ) {
    throw new Error("NOT_A_COLLECTOR");
  }

  return prisma.collector.upsert({
    where: { userId },
    create: {
      userId,
      isOnDuty: false,
      verificationStatus: ProfileVerificationStatus.PENDING,
      zone: "Default",
    },
    update: {},
  });
}

export async function getCollectorByUserId(userId: string) {
  return prisma.collector.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

export async function listAssignableCollectors() {
  return prisma.collector.findMany({
    where: {
      isOnDuty: true,
      verificationStatus: ProfileVerificationStatus.APPROVED,
      user: { isActive: true, role: UserRole.COLLECTOR },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: {
        select: {
          pickupRequests: {
            where: {
              status: {
                in: ["ASSIGNED", "SCHEDULED", "IN_TRANSIT", "IN_PROGRESS"],
              },
            },
          },
        },
      },
    },
    orderBy: [{ completedPickups: "desc" }],
  });
}

/** Full roster for admin collectors page (includes suspended / off-duty). */
export async function listAllCollectors() {
  return prisma.collector.findMany({
    where: {
      user: { role: UserRole.COLLECTOR },
    },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      _count: {
        select: {
          pickupRequests: {
            where: {
              status: {
                in: [
                  "ASSIGNED",
                  "SCHEDULED",
                  "IN_TRANSIT",
                  "IN_PROGRESS",
                  "AWAITING_VERIFICATION",
                  "AWAITING_SIGNATURE",
                ],
              },
            },
          },
        },
      },
    },
    orderBy: [{ isOnDuty: "desc" }, { completedPickups: "desc" }],
  });
}
