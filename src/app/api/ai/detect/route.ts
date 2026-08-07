import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import {
  AuthHttpError,
  requireAuth,
  assertOwnership,
} from "@/features/auth/services/guards";
import { prisma } from "@/prisma";
import { detectPlasticInImage } from "@/features/ai/services/plastic-detector";
import { evaluateFraud } from "@/features/ai/services/fraud-detection-service";
import { validateImageBuffer } from "@/features/ai/services/image-processing-service";
import { hashImageBuffer } from "@/features/ai/services/image-hash-service";
import { checkRateLimit } from "@/features/ai/services/rate-limit";
import { aiDetectBodySchema } from "@/validations/ai";
import {
  apiError,
  apiForbidden,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
  apiValidationError,
} from "@/utils/api-response";
import { logger } from "@/utils/logger";

/**
 * Authenticated proxy — runs detection for a listing image the user owns.
 * Never exposes the FastAPI service to the browser.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const limited = checkRateLimit({
      key: `ai:detect:${user.id}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limited.allowed) {
      return apiError("RATE_LIMITED", "Too many AI detection requests.", 429);
    }

    const json = await request.json();
    const parsed = aiDetectBodySchema.safeParse(json);
    if (!parsed.success) {
      return apiValidationError(parsed.error.flatten());
    }

    const listing = await prisma.plasticListing.findFirst({
      where: { id: parsed.data.listingId, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!listing) {
      return apiError("NOT_FOUND", "Listing not found.", 404);
    }
    assertOwnership(user, listing.userId);

    const image =
      listing.images.find((img) => img.id === parsed.data.listingImageId) ??
      listing.images[0];
    if (!image) {
      return apiError("NO_IMAGES", "Upload an image before running detection.", 400);
    }

    // Prevent duplicate processing for the same image hash on this listing.
    if (image.contentHash) {
      const existing = await prisma.aiDetectionResult.findFirst({
        where: {
          listingId: listing.id,
          listingImageId: image.id,
        },
        orderBy: { createdAt: "desc" },
      });
      const payload = existing?.rawPayload as
        | { analysis?: { contentHash?: string } }
        | null;
      if (
        existing &&
        payload?.analysis?.contentHash === image.contentHash
      ) {
        return apiSuccess({
          reused: true,
          detectionId: existing.id,
          detectedClass: existing.detectedClass,
          detectedCount: existing.detectedCount,
          confidence: Number(existing.confidence),
          decision: existing.decision,
          rawPayload: existing.rawPayload,
        });
      }
    }

    const response = await fetch(image.url);
    if (!response.ok) {
      return apiError("IMAGE_FETCH_FAILED", "Could not fetch listing image.", 502);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const meta = validateImageBuffer(
      buffer,
      response.headers.get("content-type")?.split(";")[0] ?? undefined,
    );

    const duplicate = await prisma.listingImage.findFirst({
      where: {
        contentHash: image.contentHash ?? hashImageBuffer(buffer),
        id: { not: image.id },
        listing: { deletedAt: null, status: { not: "DRAFT" } },
      },
      select: { listingId: true },
    });

    const detection = await detectPlasticInImage({
      buffer,
      mimeType: meta.mimeType,
      width: image.width ?? meta.width,
      height: image.height ?? meta.height,
      bytes: image.bytes ?? meta.bytes,
    });

    const fraud = evaluateFraud({
      confidence: detection.confidence,
      aiCount: detection.detectedCount,
      userCount: parsed.data.userCount ?? detection.detectedCount,
      isDuplicateImage: Boolean(duplicate),
      decision: detection.decision,
      estimatedWeightGrams: detection.estimatedWeightGrams,
      claimedWeightGrams: listing.claimedWeightGrams ?? undefined,
      processingTimeMs: detection.processingTimeMs,
    });

    if (!image.contentHash) {
      await prisma.listingImage.update({
        where: { id: image.id },
        data: { contentHash: detection.analysis.contentHash },
      });
    }

    const row = await prisma.aiDetectionResult.create({
      data: {
        listingId: listing.id,
        listingImageId: image.id,
        detectedClass: detection.detectedClass,
        detectedCount: detection.detectedCount,
        userConfirmedCount:
          parsed.data.userCount ?? detection.detectedCount,
        userConfirmedClass: detection.detectedClass,
        confidence: detection.confidence,
        decision: detection.decision,
        matchedClaimed: true,
        rawPayload: JSON.parse(
          JSON.stringify({
            boxes: detection.boxes,
            analysis: detection.analysis,
            plasticTypes: detection.plasticTypes,
            estimatedWeightGrams: detection.estimatedWeightGrams,
            processingTimeMs: detection.processingTimeMs,
            fraudAlerts: fraud,
            duplicateListingId: duplicate?.listingId ?? null,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "AI_INFERENCE",
        entityType: "AiDetectionResult",
        entityId: row.id,
        metadata: {
          listingId: listing.id,
          provider: detection.analysis.provider,
          confidence: detection.confidence,
        } as Prisma.InputJsonValue,
      },
    });

    return apiSuccess({
      reused: false,
      detectionId: row.id,
      detectedClass: detection.detectedClass,
      detectedCount: detection.detectedCount,
      confidence: detection.confidence,
      decision: detection.decision,
      boxes: detection.boxes,
      plasticTypes: detection.plasticTypes,
      estimatedWeightGrams: detection.estimatedWeightGrams,
      processingTimeMs: detection.processingTimeMs,
      fraudAlerts: fraud,
      analysis: detection.analysis,
    });
  } catch (error) {
    if (error instanceof AuthHttpError) {
      if (error.code === "UNAUTHORIZED") return apiUnauthorized();
      return apiForbidden(error.message);
    }
    logger.error(
      "AI detect API failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "api/ai/detect",
    );
    return apiServerError("AI detection failed.");
  }
}
