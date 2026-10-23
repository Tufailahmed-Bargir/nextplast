import "server-only";

import {
  NotificationType,
  ProfileVerificationStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/prisma";
import { writeAdminLog } from "@/features/admin/services/admin-audit";

const verificationNotice: Partial<
  Record<ProfileVerificationStatus, { title: string; body: string }>
> = {
  APPROVED: {
    title: "Verification approved",
    body: "Your partner profile has been approved. You can now receive work.",
  },
  SUSPENDED: {
    title: "Verification suspended",
    body: "Your partner profile has been suspended. Contact support for details.",
  },
};

function verificationNoticeData(
  kind: string,
  previous: ProfileVerificationStatus,
  next: ProfileVerificationStatus,
  userId: string,
) {
  return {
    userId,
    type: NotificationType.SYSTEM,
    title: verificationNotice[next]?.title ?? "Verification updated",
    body: verificationNotice[next]?.body ?? `Status changed to ${next}.`,
    data: JSON.parse(
      JSON.stringify({ kind, previous, next }),
    ) as Prisma.InputJsonValue,
  };
}

export async function updateCollectorAdmin(input: {
  adminId: string;
  collectorId: string;
  verificationStatus: ProfileVerificationStatus;
  isOnDuty?: boolean;
  zone?: string;
}) {
  const collector = await prisma.collector.findUnique({
    where: { id: input.collectorId },
  });
  if (!collector) throw new Error("COLLECTOR_NOT_FOUND");

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.collector.update({
      where: { id: collector.id },
      data: {
        verificationStatus: input.verificationStatus,
        isOnDuty: input.isOnDuty ?? collector.isOnDuty,
        zone: input.zone ?? collector.zone,
      },
    });

    if (row.verificationStatus !== collector.verificationStatus) {
      await tx.notification.create({
        data: verificationNoticeData(
          "COLLECTOR_VERIFICATION",
          collector.verificationStatus,
          row.verificationStatus,
          collector.userId,
        ),
      });
    }

    await writeAdminLog(tx, {
      adminId: input.adminId,
      action: "COLLECTOR_UPDATED",
      targetType: "Collector",
      targetId: collector.id,
      metadata: {
        verificationStatus: input.verificationStatus,
        isOnDuty: row.isOnDuty,
        zone: row.zone,
      },
    });

    return row;
  });

  return updated;
}

export async function updateRecyclerAdmin(input: {
  adminId: string;
  recyclerId: string;
  verificationStatus: ProfileVerificationStatus;
  companyName?: string;
}) {
  const recycler = await prisma.recycler.findUnique({
    where: { id: input.recyclerId },
  });
  if (!recycler) throw new Error("RECYCLER_NOT_FOUND");

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.recycler.update({
      where: { id: recycler.id },
      data: {
        verificationStatus: input.verificationStatus,
        companyName: input.companyName ?? recycler.companyName,
      },
    });

    if (row.verificationStatus !== recycler.verificationStatus) {
      await tx.notification.create({
        data: verificationNoticeData(
          "RECYCLER_VERIFICATION",
          recycler.verificationStatus,
          row.verificationStatus,
          recycler.userId,
        ),
      });
    }

    await writeAdminLog(tx, {
      adminId: input.adminId,
      action: "RECYCLER_UPDATED",
      targetType: "Recycler",
      targetId: recycler.id,
      metadata: {
        verificationStatus: input.verificationStatus,
        companyName: row.companyName,
      },
    });

    return row;
  });

  return updated;
}
