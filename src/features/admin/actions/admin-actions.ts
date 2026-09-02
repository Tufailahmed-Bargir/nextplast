"use server";

import { revalidatePath } from "next/cache";
import { ProfileVerificationStatus } from "@prisma/client";
import {
  AuthHttpError,
  requireAdmin,
} from "@/features/auth/services/guards";
import {
  inventoryAdjustSchema,
  productToggleSchema,
  reviewListingSchema,
  setCollectorVerificationSchema,
  setRecyclerVerificationSchema,
  setUserActiveSchema,
  upsertSettingSchema,
  walletAdjustSchema,
} from "@/validations/admin";
import { rejectProductRequestSchema } from "@/validations/marketplace";
import { rejectProductRequest } from "@/features/admin/services/admin-product-requests";
import { setUserActiveStatus } from "@/features/admin/services/admin-users";
import { reviewPlasticListing } from "@/features/admin/services/admin-listings";
import { adjustInventory } from "@/features/admin/services/admin-inventory";
import { adjustUserWallet } from "@/features/admin/services/admin-wallet";
import { setProductActive } from "@/features/admin/services/admin-marketplace";
import {
  updateCollectorAdmin,
  updateRecyclerAdmin,
} from "@/features/admin/services/admin-partners";
import { upsertSetting } from "@/features/admin/services/app-settings";
import { globalAdminSearch } from "@/features/admin/services/admin-users";
import { writeAdminLog } from "@/features/admin/services/admin-audit";
import { prisma } from "@/prisma";
import { adminSearchSchema } from "@/validations/admin";
import { logger } from "@/utils/logger";

export type AdminActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

function mapError(error: unknown): string {
  if (error instanceof AuthHttpError) {
    if (error.code === "FORBIDDEN") return "Admin access required.";
    if (error.code === "UNAUTHORIZED") return "Please sign in again.";
  }
  const message = error instanceof Error ? error.message : "unknown";
  const map: Record<string, string> = {
    USER_NOT_FOUND: "User not found.",
    CANNOT_CHANGE_OWN_STATUS: "You cannot change your own account status.",
    CANNOT_MODIFY_ADMIN: "Admin accounts cannot be modified here.",
    CANNOT_ADJUST_ADMIN: "Admin wallets cannot be adjusted here.",
    CANNOT_ADJUST_SELF: "You cannot adjust your own wallet.",
    LISTING_NOT_FOUND: "Listing not found.",
    INVENTORY_NOT_FOUND: "Inventory row not found.",
    INVENTORY_NEGATIVE: "Inventory cannot go below zero.",
    ADJUSTMENTS_DISABLED: "Wallet adjustments are disabled in settings.",
    ADJUSTMENT_TOO_LARGE: "Adjustment exceeds the configured maximum.",
    INSUFFICIENT_BALANCE: "User wallet balance is insufficient.",
    PRODUCT_NOT_FOUND: "Product not found.",
    PRODUCT_REQUEST_NOT_FOUND: "Product request not found.",
    PRODUCT_REQUEST_NOT_OPEN: "This request is no longer open.",
    COLLECTOR_NOT_FOUND: "Collector not found.",
    RECYCLER_NOT_FOUND: "Recycler not found.",
  };
  return map[message] ?? "Something went wrong. Please try again.";
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/collectors");
  revalidatePath("/admin/recyclers");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/pickup-requests");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin/product-requests");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/coin-economy");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/settings");
  revalidatePath("/notifications");
  revalidatePath("/marketplace");
}

export async function setUserActiveAction(
  raw: unknown,
): Promise<AdminActionResult<{ ok: true }>> {
  try {
    const admin = await requireAdmin();
    const parsed = setUserActiveSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid payload." };
    await setUserActiveStatus({
      adminId: admin.id,
      userId: parsed.data.userId,
      isActive: parsed.data.isActive,
    });
    revalidateAdmin();
    return {
      success: true,
      data: { ok: true },
      message: parsed.data.isActive ? "User activated." : "User suspended.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function reviewListingAction(
  raw: unknown,
): Promise<AdminActionResult<{ ok: true }>> {
  try {
    const admin = await requireAdmin();
    const parsed = reviewListingSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid review." };
    await reviewPlasticListing({
      adminId: admin.id,
      listingId: parsed.data.listingId,
      decision: parsed.data.decision,
      notes: parsed.data.notes,
    });
    revalidateAdmin();
    return { success: true, data: { ok: true }, message: "Listing review saved." };
  } catch (error) {
    logger.error("reviewListing failed", { error }, "admin");
    return { success: false, error: mapError(error) };
  }
}

export async function adjustWalletAction(
  raw: unknown,
): Promise<AdminActionResult<{ ok: true }>> {
  try {
    const admin = await requireAdmin();
    const parsed = walletAdjustSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid adjustment.",
      };
    }
    await adjustUserWallet({
      adminId: admin.id,
      userId: parsed.data.userId,
      amount: parsed.data.amount,
      reason: parsed.data.reason,
    });
    revalidateAdmin();
    revalidatePath("/wallet");
    revalidatePath("/notifications");
    return { success: true, data: { ok: true }, message: "Wallet adjusted." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function adjustInventoryAction(
  raw: unknown,
): Promise<AdminActionResult<{ ok: true }>> {
  try {
    const admin = await requireAdmin();
    const parsed = inventoryAdjustSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid inventory delta." };
    await adjustInventory({
      adminId: admin.id,
      inventoryId: parsed.data.inventoryId,
      deltaGrams: parsed.data.deltaGrams,
      notes: parsed.data.notes,
    });
    revalidateAdmin();
    return { success: true, data: { ok: true }, message: "Inventory updated." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function updateCollectorAction(
  raw: unknown,
): Promise<AdminActionResult<{ ok: true }>> {
  try {
    const admin = await requireAdmin();
    const parsed = setCollectorVerificationSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid collector update." };
    await updateCollectorAdmin({
      adminId: admin.id,
      collectorId: parsed.data.collectorId,
      verificationStatus:
        parsed.data.verificationStatus as ProfileVerificationStatus,
      isOnDuty: parsed.data.isOnDuty,
      zone: parsed.data.zone,
    });
    revalidateAdmin();
    return { success: true, data: { ok: true }, message: "Collector updated." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function updateRecyclerAction(
  raw: unknown,
): Promise<AdminActionResult<{ ok: true }>> {
  try {
    const admin = await requireAdmin();
    const parsed = setRecyclerVerificationSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid recycler update." };
    await updateRecyclerAdmin({
      adminId: admin.id,
      recyclerId: parsed.data.recyclerId,
      verificationStatus:
        parsed.data.verificationStatus as ProfileVerificationStatus,
      companyName: parsed.data.companyName,
    });
    revalidateAdmin();
    return { success: true, data: { ok: true }, message: "Recycler updated." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function toggleProductAction(
  raw: unknown,
): Promise<AdminActionResult<{ ok: true }>> {
  try {
    const admin = await requireAdmin();
    const parsed = productToggleSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid product update." };
    await setProductActive({
      adminId: admin.id,
      productId: parsed.data.productId,
      isActive: parsed.data.isActive,
    });
    revalidateAdmin();
    return { success: true, data: { ok: true }, message: "Product updated." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function upsertSettingAction(
  raw: unknown,
): Promise<AdminActionResult<{ ok: true }>> {
  try {
    const admin = await requireAdmin();
    const parsed = upsertSettingSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid settings." };
    await upsertSetting(parsed.data);
    await writeAdminLog(prisma, {
      adminId: admin.id,
      action: "SETTINGS_UPDATED",
      targetType: "AppSettings",
      targetId: parsed.data.key,
    });
    revalidateAdmin();
    return { success: true, data: { ok: true }, message: "Settings saved." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function globalAdminSearchAction(
  q: string,
): Promise<AdminActionResult<Awaited<ReturnType<typeof globalAdminSearch>>>> {
  try {
    await requireAdmin();
    const parsed = adminSearchSchema.safeParse({ q });
    if (!parsed.success) {
      return { success: false, error: "Enter at least 2 characters." };
    }
    const data = await globalAdminSearch(parsed.data.q);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function rejectProductRequestAction(
  raw: unknown,
): Promise<AdminActionResult<{ id: string }>> {
  try {
    const admin = await requireAdmin();
    const parsed = rejectProductRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: "Invalid product request." };
    }
    const updated = await rejectProductRequest({
      adminId: admin.id,
      requestId: parsed.data.requestId,
      adminNotes: parsed.data.adminNotes,
    });
    revalidateAdmin();
    return {
      success: true,
      data: { id: updated.id },
      message: "Request rejected.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}
