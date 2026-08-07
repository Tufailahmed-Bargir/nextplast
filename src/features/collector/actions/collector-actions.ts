"use server";

import { revalidatePath } from "next/cache";
import { PlasticQuality } from "@prisma/client";
import {
  AuthHttpError,
  requireAdmin,
  requireRoles,
} from "@/features/auth/services/guards";
import { rolePermissions } from "@/features/auth/services/permissions";
import {
  assignPickupSchema,
  completeVerificationSchema,
  toggleDutySchema,
  verifyOtpSchema,
} from "@/validations/collector";
import { sniffImageMime } from "@/features/ai/services/plastic-detector";
import {
  acceptPickup,
  assignPickupToCollector,
  completePickupVerification,
  markCollectorArrived,
  setCollectorDuty,
  uploadPickupProof,
  verifyPickupOtpForCollector,
} from "@/features/collector/services/pickup-workflow";
import { logger } from "@/utils/logger";

export type CollectorActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

function mapError(error: unknown): string {
  if (error instanceof AuthHttpError) {
    if (error.code === "FORBIDDEN") return "You do not have access.";
    if (error.code === "UNAUTHORIZED") return "Please sign in again.";
  }
  const message = error instanceof Error ? error.message : "unknown";
  const map: Record<string, string> = {
    PICKUP_NOT_FOUND: "Pickup not found or not assigned to you.",
    PICKUP_NOT_ASSIGNABLE: "This pickup cannot be assigned.",
    COLLECTOR_NOT_FOUND: "Collector profile not found.",
    NOT_A_COLLECTOR: "Collector role required.",
    INVALID_PICKUP_STATE: "This action is not allowed for the current pickup status.",
    INVALID_OTP: "Incorrect OTP. Ask the customer to check their notification.",
    OTP_LOCKED:
      "Too many incorrect OTP attempts. Ask an admin to reassign this pickup.",
    COLLECTOR_OFF_DUTY: "Collector is off duty and cannot be assigned.",
    COLLECTOR_NOT_APPROVED: "Collector is not approved for assignments.",
    ALREADY_COMPLETED: "This pickup was already completed.",
    CUSTOMER_CONFIRMATION_REQUIRED: "Customer confirmation is required.",
    PROOF_REQUIRED: "Upload at least one proof photo.",
    INVALID_IMAGE_TYPE: "Only JPEG, PNG, and WEBP images are allowed.",
    IMAGE_TOO_LARGE: "Each image must be under 10 MB.",
    INVALID_COIN_AMOUNT: "Coin amount must be positive.",
  };
  return map[message] ?? "Something went wrong. Please try again.";
}

function revalidateCollectorPaths(pickupId?: string) {
  revalidatePath("/collector");
  revalidatePath("/collector/assigned");
  revalidatePath("/collector/pending");
  revalidatePath("/collector/completed");
  revalidatePath("/collector/navigation");
  revalidatePath("/collector/profile");
  revalidatePath("/admin/pickup-requests");
  revalidatePath("/admin/collectors");
  revalidatePath("/listings");
  revalidatePath("/wallet");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  revalidatePath("/history");
  if (pickupId) {
    revalidatePath(`/collector/pickups/${pickupId}`);
    revalidatePath(`/sell/${pickupId}`);
  }
}

async function requireCollector() {
  return requireRoles(rolePermissions.collector);
}

export async function assignPickupAction(
  raw: unknown,
): Promise<CollectorActionResult<{ pickupId: string }>> {
  try {
    const admin = await requireAdmin();
    const parsed = assignPickupSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: "Invalid assignment payload." };
    }
    await assignPickupToCollector({
      adminUserId: admin.id,
      pickupId: parsed.data.pickupId,
      collectorId: parsed.data.collectorId,
    });
    revalidateCollectorPaths(parsed.data.pickupId);
    return {
      success: true,
      data: { pickupId: parsed.data.pickupId },
      message: "Collector assigned. Customer received an OTP.",
    };
  } catch (error) {
    logger.error("assignPickup failed", { error }, "collector");
    return { success: false, error: mapError(error) };
  }
}

export async function acceptPickupAction(
  pickupId: string,
): Promise<CollectorActionResult<{ ok: true }>> {
  try {
    const user = await requireCollector();
    await acceptPickup({ userId: user.id, pickupId });
    revalidateCollectorPaths(pickupId);
    return { success: true, data: { ok: true }, message: "Pickup accepted." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function markArrivedAction(
  pickupId: string,
): Promise<CollectorActionResult<{ ok: true }>> {
  try {
    const user = await requireCollector();
    await markCollectorArrived({ userId: user.id, pickupId });
    revalidateCollectorPaths(pickupId);
    return {
      success: true,
      data: { ok: true },
      message: "Arrival recorded. Ask the customer for OTP.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function verifyOtpAction(
  raw: unknown,
): Promise<CollectorActionResult<{ ok: true }>> {
  try {
    const user = await requireCollector();
    const parsed = verifyOtpSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid OTP.",
      };
    }
    await verifyPickupOtpForCollector({
      userId: user.id,
      pickupId: parsed.data.pickupId,
      otp: parsed.data.otp,
    });
    revalidateCollectorPaths(parsed.data.pickupId);
    return {
      success: true,
      data: { ok: true },
      message: "OTP verified. Enter verified weight and upload proof.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function uploadProofAction(
  formData: FormData,
): Promise<CollectorActionResult<{ url: string; publicId: string }>> {
  try {
    const user = await requireCollector();
    const pickupId = String(formData.get("pickupId") ?? "");
    const file = formData.get("file");
    if (!pickupId || !(file instanceof File)) {
      return { success: false, error: "Missing pickup or image file." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageMime(buffer);
    const result = await uploadPickupProof({
      userId: user.id,
      pickupId,
      buffer,
      mimeType: sniffed ?? file.type,
    });
    revalidateCollectorPaths(pickupId);
    return {
      success: true,
      data: { url: result.url, publicId: result.publicId },
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function completeVerificationAction(
  raw: unknown,
): Promise<CollectorActionResult<{ pickupId: string }>> {
  try {
    const user = await requireCollector();
    const parsed = completeVerificationSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ?? "Invalid verification details.",
      };
    }

    await completePickupVerification({
      userId: user.id,
      pickupId: parsed.data.pickupId,
      actualQuantity: parsed.data.actualQuantity,
      actualWeightGrams: parsed.data.actualWeightGrams,
      verifiedQuality: parsed.data.verifiedQuality as PlasticQuality,
      notes: parsed.data.notes,
      customerConfirmed: parsed.data.customerConfirmed,
      proofImageUrl: parsed.data.proofImageUrl,
      proofPublicId: parsed.data.proofPublicId,
    });

    revalidateCollectorPaths(parsed.data.pickupId);
    return {
      success: true,
      data: { pickupId: parsed.data.pickupId },
      message: "Pickup completed. Nature Coins credited to the user.",
    };
  } catch (error) {
    logger.error("completeVerification failed", { error }, "collector");
    return { success: false, error: mapError(error) };
  }
}

export async function toggleDutyAction(
  raw: unknown,
): Promise<CollectorActionResult<{ isOnDuty: boolean }>> {
  try {
    const user = await requireCollector();
    const parsed = toggleDutySchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: "Invalid duty status." };
    }
    const collector = await setCollectorDuty({
      userId: user.id,
      isOnDuty: parsed.data.isOnDuty,
    });
    revalidatePath("/collector");
    revalidatePath("/collector/profile");
    return {
      success: true,
      data: { isOnDuty: collector.isOnDuty },
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}
