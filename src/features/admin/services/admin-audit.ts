import "server-only";

import { Prisma } from "@prisma/client";
import type { Prisma as PrismaNs } from "@prisma/client";

export async function writeAdminLog(
  tx: PrismaNs.TransactionClient | typeof import("@/prisma").prisma,
  input: {
    adminId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  return tx.adminLog.create({
    data: {
      adminId: input.adminId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata
        ? (JSON.parse(JSON.stringify(input.metadata)) as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
