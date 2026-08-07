import "server-only";

import { InventoryMovementType, type Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { writeAdminLog } from "@/features/admin/services/admin-audit";

export async function listAdminInventory(take = 80) {
  return prisma.inventory.findMany({
    orderBy: { updatedAt: "desc" },
    take,
    include: {
      category: { select: { id: true, name: true, resinType: true } },
      recycler: {
        select: {
          id: true,
          companyName: true,
          user: { select: { name: true, email: true } },
        },
      },
      _count: { select: { movements: true } },
    },
  });
}

export async function adjustInventory(input: {
  adminId: string;
  inventoryId: string;
  deltaGrams: number;
  notes?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { id: input.inventoryId },
    });
    if (!inventory) throw new Error("INVENTORY_NOT_FOUND");

    const previous = inventory.quantityGrams;
    if (previous + input.deltaGrams < 0) {
      throw new Error("INVENTORY_NEGATIVE");
    }

    // Atomic increment avoids lost updates under concurrent admin adjusts.
    const row = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantityGrams: { increment: input.deltaGrams },
      },
    });

    if (row.quantityGrams < 0) {
      throw new Error("INVENTORY_NEGATIVE");
    }

    const withStatus = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        status: row.quantityGrams === 0 ? "DEPLETED" : "IN_STOCK",
      },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryId: inventory.id,
        type: InventoryMovementType.ADJUST,
        quantityGrams: input.deltaGrams,
        notes: input.notes ?? "Admin inventory adjustment",
        metadata: JSON.parse(
          JSON.stringify({
            adminId: input.adminId,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    await writeAdminLog(tx, {
      adminId: input.adminId,
      action: "INVENTORY_ADJUST",
      targetType: "Inventory",
      targetId: inventory.id,
      metadata: {
        deltaGrams: input.deltaGrams,
        previous,
        next: withStatus.quantityGrams,
        notes: input.notes ?? null,
      },
    });

    return withStatus;
  });
}
