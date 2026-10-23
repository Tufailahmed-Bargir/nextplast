"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AuthHttpError, requireRoles } from "@/features/auth/services/guards";
import { rolePermissions } from "@/features/auth/services/permissions";
import { purchaseInventoryLot } from "@/features/recycler/services/purchase";
import { logger } from "@/utils/logger";

const purchaseSchema = z.object({
  platformInventoryId: z.string().min(1),
  quantityGrams: z.number().int().positive().max(5_000_000),
  unitPriceInrPerKg: z.number().min(0).max(10_000),
});

export type RecyclerActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

function mapError(error: unknown): string {
  if (error instanceof AuthHttpError) {
    return error.code === "UNAUTHORIZED"
      ? "Please sign in again."
      : "Permission denied.";
  }
  const message = error instanceof Error ? error.message : "unknown";
  const map: Record<string, string> = {
    INVALID_QUANTITY: "Enter a positive purchase quantity.",
    INVALID_PRICE: "Enter a valid price per kg.",
    RECYCLER_NOT_FOUND: "Recycler profile not found.",
    RECYCLER_NOT_APPROVED: "Your recycler account is pending admin approval.",
    LOT_NOT_FOUND: "Inventory lot not found.",
    LOT_NOT_AVAILABLE: "This lot is no longer available for purchase.",
    INSUFFICIENT_STOCK: "Not enough stock in this lot.",
  };
  return map[message] ?? "Purchase failed. Please try again.";
}

export async function purchaseLotAction(
  raw: unknown,
): Promise<RecyclerActionResult<{ amountInr: number; quantityGrams: number }>> {
  try {
    const user = await requireRoles(rolePermissions.recyclerOps);
    const parsed = purchaseSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: "Invalid purchase form." };
    }
    const result = await purchaseInventoryLot({
      userId: user.id,
      ...parsed.data,
    });
    revalidatePath("/recycler");
    revalidatePath("/recycler/inventory");
    revalidatePath("/recycler/history");
    revalidatePath("/admin/inventory");
    return {
      success: true,
      data: {
        amountInr: result.amountInr,
        quantityGrams: result.quantityGrams,
      },
      message: `Purchased ${result.quantityGrams} g for ₹${result.amountInr.toFixed(2)}.`,
    };
  } catch (error) {
    logger.error(
      "purchaseLotAction failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "recycler",
    );
    return { success: false, error: mapError(error) };
  }
}
