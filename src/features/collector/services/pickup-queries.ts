import "server-only";

import {
  PickupStatus,
  type PickupStatus as PickupStatusType,
} from "@prisma/client";
import { prisma } from "@/prisma";
import { ensureCollectorProfile } from "@/features/collector/services/ensure-collector";

const ACTIVE_STATUSES: PickupStatusType[] = [
  PickupStatus.ASSIGNED,
  PickupStatus.SCHEDULED,
  PickupStatus.IN_TRANSIT,
  PickupStatus.IN_PROGRESS,
  PickupStatus.AWAITING_VERIFICATION,
  PickupStatus.AWAITING_SIGNATURE,
];

const PENDING_VERIFY_STATUSES: PickupStatusType[] = [
  PickupStatus.IN_PROGRESS,
  PickupStatus.AWAITING_VERIFICATION,
  PickupStatus.AWAITING_SIGNATURE,
];

export const pickupDetailInclude = {
  listing: {
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      items: { include: { category: true } },
      images: { orderBy: { sortOrder: "asc" as const }, take: 6 },
      aiResults: { orderBy: { createdAt: "asc" as const } },
    },
  },
  verification: true,
  collector: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
} as const;

export async function getCollectorContext(userId: string) {
  const collector = await ensureCollectorProfile(userId);
  return collector;
}

export async function listCollectorPickups(
  collectorId: string,
  filter: "assigned" | "pending" | "completed" | "today" | "all" = "all",
) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const where =
    filter === "completed"
      ? { collectorId, status: PickupStatus.COMPLETED }
      : filter === "pending"
        ? { collectorId, status: { in: PENDING_VERIFY_STATUSES } }
        : filter === "assigned"
          ? {
              collectorId,
              status: {
                in: [
                  PickupStatus.ASSIGNED,
                  PickupStatus.SCHEDULED,
                  PickupStatus.IN_TRANSIT,
                ],
              },
            }
          : filter === "today"
            ? {
                collectorId,
                OR: [
                  { scheduledAt: { gte: start, lte: end } },
                  {
                    status: { in: ACTIVE_STATUSES },
                    createdAt: { gte: start, lte: end },
                  },
                ],
              }
            : { collectorId };

  return prisma.pickupRequest.findMany({
    where,
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    include: pickupDetailInclude,
  });
}

export async function getPickupForCollector(
  pickupId: string,
  collectorId: string,
) {
  return prisma.pickupRequest.findFirst({
    where: { id: pickupId, collectorId },
    include: pickupDetailInclude,
  });
}

export async function getCollectorDashboardData(userId: string) {
  const collector = await ensureCollectorProfile(userId);

  const [assigned, pending, completed, today, recentCompleted] =
    await Promise.all([
      listCollectorPickups(collector.id, "assigned"),
      listCollectorPickups(collector.id, "pending"),
      prisma.pickupRequest.count({
        where: { collectorId: collector.id, status: PickupStatus.COMPLETED },
      }),
      listCollectorPickups(collector.id, "today"),
      prisma.pickupRequest.findMany({
        where: { collectorId: collector.id, status: PickupStatus.COMPLETED },
        orderBy: { completedAt: "desc" },
        take: 8,
        include: pickupDetailInclude,
      }),
    ]);

  const completedWithVerification = await prisma.collectorVerification.findMany(
    {
      where: { pickupRequest: { collectorId: collector.id } },
      select: {
        actualWeightGrams: true,
        verifiedAt: true,
        createdAt: true,
        pickupRequest: { select: { acceptedAt: true, completedAt: true } },
      },
    },
  );

  const totalPlasticGrams = completedWithVerification.reduce(
    (sum, row) => sum + row.actualWeightGrams,
    0,
  );

  const durations = completedWithVerification
    .map((row) => {
      const startAt = row.pickupRequest.acceptedAt;
      const endAt = row.pickupRequest.completedAt ?? row.verifiedAt;
      if (!startAt || !endAt) return null;
      return (endAt.getTime() - startAt.getTime()) / 60_000;
    })
    .filter((v): v is number => v != null && v >= 0);

  const avgVerificationMinutes =
    durations.length > 0
      ? Math.round(
          durations.reduce((a, b) => a + b, 0) / durations.length,
        )
      : null;

  const totalAssignedLike =
    completed + assigned.length + pending.length;
  const successRate =
    totalAssignedLike > 0
      ? Math.round((completed / totalAssignedLike) * 1000) / 10
      : 0;

  const active =
    pending.find((p) =>
      (
        [
          PickupStatus.IN_PROGRESS,
          PickupStatus.AWAITING_VERIFICATION,
          PickupStatus.IN_TRANSIT,
        ] as PickupStatusType[]
      ).includes(p.status),
    ) ??
    assigned.find((p) => p.status === PickupStatus.SCHEDULED) ??
    assigned[0] ??
    null;

  return {
    collector,
    stats: {
      todayCount: today.length,
      assignedCount: assigned.length,
      pendingCount: pending.length,
      completedCount: completed,
      totalPlasticGrams,
      successRate,
      avgVerificationMinutes,
      rating: Number(collector.rating),
    },
    active,
    today,
    assigned: assigned.slice(0, 8),
    pending: pending.slice(0, 8),
    recentCompleted,
  };
}

export async function listUnassignedPickups() {
  return prisma.pickupRequest.findMany({
    where: {
      collectorId: null,
      status: PickupStatus.REQUESTED,
      listing: {
        deletedAt: null,
        status: { in: ["AWAITING_COLLECTOR", "APPROVED"] },
      },
    },
    orderBy: { createdAt: "asc" },
    include: pickupDetailInclude,
  });
}

export async function listAdminPickupRequests() {
  return prisma.pickupRequest.findMany({
    where: {
      listing: { deletedAt: null },
      status: { not: PickupStatus.CANCELLED },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: pickupDetailInclude,
  });
}
