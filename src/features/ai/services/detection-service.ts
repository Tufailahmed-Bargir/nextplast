import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { detectPlasticInImage } from "@/features/ai/services/plastic-detector";
import { evaluateFraud } from "@/features/ai/services/fraud-detection-service";
import { validateImageBuffer } from "@/features/ai/services/image-processing-service";
import { hashImageBuffer } from "@/features/ai/services/image-hash-service";

export interface DetectAndPersistInput {
  userId: string;
  listingId: string;
  listingImageId: string;
  buffer: Buffer;
  mimeType: string;
  userCount?: number;
  claimedWeightGrams?: number | null;
  /** Skip creating a new row when this image hash was already processed for the listing. */
  skipDuplicateProcessing?: boolean;
}

/**
 * Orchestrates validate → detect → fraud → persist for a single listing image.
 */
export async function detectAndPersist(input: DetectAndPersistInput) {
  const meta = validateImageBuffer(input.buffer, input.mimeType);
  const contentHash = hashImageBuffer(input.buffer);

  if (input.skipDuplicateProcessing !== false) {
    const existing = await prisma.aiDetectionResult.findFirst({
      where: {
        listingId: input.listingId,
        listingImageId: input.listingImageId,
      },
      orderBy: { createdAt: "desc" },
    });
    if (existing) {
      const payload = existing.rawPayload as { analysis?: { contentHash?: string } } | null;
      if (payload?.analysis?.contentHash === contentHash) {
        return { reused: true as const, result: existing };
      }
    }
  }

  const duplicate = await prisma.listingImage.findFirst({
    where: {
      contentHash,
      id: { not: input.listingImageId },
      listing: { deletedAt: null, status: { not: "DRAFT" } },
    },
    select: { id: true, listingId: true },
  });

  const detection = await detectPlasticInImage({
    buffer: input.buffer,
    mimeType: meta.mimeType,
    width: meta.width,
    height: meta.height,
    bytes: meta.bytes,
  });

  const fraud = evaluateFraud({
    confidence: detection.confidence,
    aiCount: detection.detectedCount,
    userCount: input.userCount ?? detection.detectedCount,
    isDuplicateImage: Boolean(duplicate),
    decision: detection.decision,
    estimatedWeightGrams: detection.estimatedWeightGrams,
    claimedWeightGrams: input.claimedWeightGrams ?? undefined,
    processingTimeMs: detection.processingTimeMs,
  });

  await prisma.listingImage.update({
    where: { id: input.listingImageId },
    data: { contentHash },
  });

  const result = await prisma.aiDetectionResult.create({
    data: {
      listingId: input.listingId,
      listingImageId: input.listingImageId,
      detectedClass: detection.detectedClass,
      detectedCount: detection.detectedCount,
      userConfirmedCount: input.userCount ?? detection.detectedCount,
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
      actorId: input.userId,
      action: "AI_INFERENCE",
      entityType: "AiDetectionResult",
      entityId: result.id,
      metadata: {
        listingId: input.listingId,
        listingImageId: input.listingImageId,
        provider: detection.analysis.provider,
        confidence: detection.confidence,
        decision: detection.decision,
        processingTimeMs: detection.processingTimeMs,
      } as Prisma.InputJsonValue,
    },
  });

  return { reused: false as const, result, detection, fraud };
}

export const DetectionService = {
  detectAndPersist,
};
