"use server";

import { revalidatePath } from "next/cache";
import {
  AuthHttpError,
  requireAuth,
  requireAdmin,
  requireRoles,
} from "@/features/auth/services/guards";
import { rolePermissions } from "@/features/auth/services/permissions";
import { runListingAiDetection } from "@/features/plastic/services/listing-service";
import { generateRecommendations } from "@/features/ai/services/recommendation-service";
import { calculateOverallConfidence } from "@/features/ai/services/confidence-engine";
import { evaluateFraud } from "@/features/ai/services/fraud-detection-service";
import { getAiAnalytics } from "@/features/ai/services/ai-analytics";
import { getAiServiceStatus } from "@/features/ai/services/ai-client";
import { logger } from "@/utils/logger";

export type AiActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

function mapError(error: unknown): string {
  if (error instanceof AuthHttpError) {
    if (error.code === "FORBIDDEN") return "Permission denied.";
    if (error.code === "UNAUTHORIZED") return "Please sign in again.";
  }
  const message = error instanceof Error ? error.message : "unknown";
  const map: Record<string, string> = {
    LISTING_NOT_FOUND: "Listing not found.",
    LISTING_LOCKED: "This listing can no longer be edited.",
    NO_IMAGES: "Upload at least one plastic photo first.",
    IMAGE_FETCH_FAILED: "Could not read an uploaded image for AI analysis.",
  };
  return map[message] ?? "Something went wrong. Please try again.";
}

/** Detect plastic for a sell listing (orchestrates full image set). */
export async function detectPlasticAction(
  listingId: string,
): Promise<AiActionResult<{ listingId: string }>> {
  try {
    const user = await requireRoles(rolePermissions.sell);
    await runListingAiDetection({ userId: user.id, listingId, force: false });
    revalidatePath("/sell");
    revalidatePath("/ai");
    revalidatePath("/listings");
    return { success: true, data: { listingId }, message: "Detection complete." };
  } catch (error) {
    logger.error(
      "detectPlasticAction failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "ai-actions",
    );
    return { success: false, error: mapError(error) };
  }
}

/** Force re-run inference even when content-hash results already exist. */
export async function retryDetectionAction(
  listingId: string,
): Promise<AiActionResult<{ listingId: string }>> {
  try {
    const user = await requireRoles(rolePermissions.sell);
    await runListingAiDetection({ userId: user.id, listingId, force: true });
    revalidatePath("/sell");
    revalidatePath("/ai");
    revalidatePath("/listings");
    return { success: true, data: { listingId }, message: "Detection retried." };
  } catch (error) {
    logger.error(
      "retryDetectionAction failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "ai-actions",
    );
    return { success: false, error: mapError(error) };
  }
}

export async function calculateConfidenceAction(input: {
  modelConfidence: number;
  imageWidth?: number;
  imageHeight?: number;
  imageBytes?: number;
  categoryCertainty?: number;
  fraudAlertCount?: number;
}): Promise<AiActionResult<{ confidence: number }>> {
  try {
    await requireAuth();
    const confidence = calculateOverallConfidence(input);
    return { success: true, data: { confidence } };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function requestRecommendationAction(): Promise<
  AiActionResult<Awaited<ReturnType<typeof generateRecommendations>>>
> {
  try {
    const user = await requireAuth();
    const data = await generateRecommendations(user.id);
    revalidatePath("/dashboard");
    revalidatePath("/ai");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function evaluateFraudAction(input: {
  confidence: number;
  aiCount: number;
  userCount: number;
  isDuplicateImage: boolean;
  decision?: string;
}): Promise<AiActionResult<{ alerts: ReturnType<typeof evaluateFraud> }>> {
  try {
    await requireAuth();
    return { success: true, data: { alerts: evaluateFraud(input) } };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function getAiStatusAction() {
  try {
    await requireAuth();
    return { success: true as const, data: await getAiServiceStatus() };
  } catch (error) {
    return { success: false as const, error: mapError(error) };
  }
}

export async function getAdminAiAnalyticsAction() {
  try {
    await requireAdmin();
    return { success: true as const, data: await getAiAnalytics() };
  } catch (error) {
    return { success: false as const, error: mapError(error) };
  }
}
