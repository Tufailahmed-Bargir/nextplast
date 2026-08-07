import "server-only";

import { ProfileVerificationStatus } from "@prisma/client";
import { prisma } from "@/prisma";
import { writeAdminLog } from "@/features/admin/services/admin-audit";

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

  const updated = await prisma.collector.update({
    where: { id: collector.id },
    data: {
      verificationStatus: input.verificationStatus,
      isOnDuty: input.isOnDuty ?? collector.isOnDuty,
      zone: input.zone ?? collector.zone,
    },
  });

  await writeAdminLog(prisma, {
    adminId: input.adminId,
    action: "COLLECTOR_UPDATED",
    targetType: "Collector",
    targetId: collector.id,
    metadata: {
      verificationStatus: input.verificationStatus,
      isOnDuty: updated.isOnDuty,
      zone: updated.zone,
    },
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

  const updated = await prisma.recycler.update({
    where: { id: recycler.id },
    data: {
      verificationStatus: input.verificationStatus,
      companyName: input.companyName ?? recycler.companyName,
    },
  });

  await writeAdminLog(prisma, {
    adminId: input.adminId,
    action: "RECYCLER_UPDATED",
    targetType: "Recycler",
    targetId: recycler.id,
    metadata: {
      verificationStatus: input.verificationStatus,
      companyName: updated.companyName,
    },
  });

  return updated;
}
