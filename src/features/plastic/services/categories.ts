import "server-only";

import { prisma } from "@/prisma";
import { PLASTIC_TYPES } from "@/constants/platform";
import type { PlasticResinType } from "@prisma/client";

const LABELS: Record<string, string> = {
  PET: "PET Bottles",
  HDPE: "HDPE Containers",
  PP: "PP Plastics",
  LDPE: "LDPE Bags & Film",
  PVC: "PVC",
  PS: "Polystyrene",
  OTHER: "Other Plastics",
};

/**
 * Ensure resin catalog exists (idempotent). Listings require category FKs.
 */
export async function ensurePlasticCategories() {
  await Promise.all(
    PLASTIC_TYPES.map((type) =>
      prisma.plasticCategory.upsert({
        where: { slug: type.toLowerCase() },
        create: {
          name: LABELS[type] ?? type,
          slug: type.toLowerCase(),
          resinType: type as PlasticResinType,
          description: `${type} recyclable plastic`,
          isActive: true,
        },
        update: {
          isActive: true,
          deletedAt: null,
        },
      }),
    ),
  );

  return prisma.plasticCategory.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { name: "asc" },
  });
}
