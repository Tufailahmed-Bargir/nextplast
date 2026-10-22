import "server-only";

import {
  AiDecision,
  ListingStatus,
  PickupStatus,
  PlasticQuality,
  UserRole,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/prisma";
import { deleteFile, uploadImage } from "@/utils/upload";
import { logger } from "@/utils/logger";
import {
  detectPlasticInImage,
  hashImageBuffer,
  readImageDimensions,
} from "@/features/ai/services/plastic-detector";
import { resolveImageMime } from "@/utils/image-mime";
import { ensurePlasticCategories } from "@/features/plastic/services/categories";
import { estimateNatureCoins } from "@/features/plastic/services/coin-estimate";
import { evaluateFraud } from "@/features/ai/services/fraud-detection-service";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_LISTING,
} from "@/validations/plastic";

const EDITABLE_STATUSES: ListingStatus[] = [
  ListingStatus.DRAFT,
  ListingStatus.AI_PROCESSING,
];

async function assertListingOwner(listingId: string, userId: string) {
  const listing = await prisma.plasticListing.findFirst({
    where: { id: listingId, userId, deletedAt: null },
  });
  if (!listing) {
    throw new Error("LISTING_NOT_FOUND");
  }
  return listing;
}

function assertEditable(status: ListingStatus) {
  if (!EDITABLE_STATUSES.includes(status)) {
    throw new Error("LISTING_LOCKED");
  }
}

/**
 * Reuse the user's latest DRAFT when present to avoid orphan drafts on refresh.
 */
export async function createDraftListing(userId: string) {
  await ensurePlasticCategories();

  const existing = await prisma.plasticListing.findFirst({
    where: { userId, status: ListingStatus.DRAFT, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;

  return prisma.plasticListing.create({
    data: {
      userId,
      status: ListingStatus.DRAFT,
      quality: PlasticQuality.MIXED,
    },
  });
}

export async function getListingForUser(listingId: string, userId: string) {
  return prisma.plasticListing.findFirst({
    where: { id: listingId, userId, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      items: { include: { category: true } },
      aiResults: { orderBy: { createdAt: "asc" } },
      pickupRequest: true,
    },
  });
}

function decimalOrNull(
  value: { toString(): string } | number | string | null | undefined,
): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(n) ? n : null;
}

/**
 * Plain JSON-safe listing for Client Components / Server Actions.
 * Prisma Decimal fields cannot cross the RSC boundary.
 */
export function serializeSellListing(
  listing: NonNullable<Awaited<ReturnType<typeof getListingForUser>>>,
) {
  return {
    id: listing.id,
    userId: listing.userId,
    status: listing.status,
    quality: listing.quality,
    claimedWeightGrams: listing.claimedWeightGrams,
    actualWeightGrams: listing.actualWeightGrams,
    estimatedCoins: decimalOrNull(listing.estimatedCoins),
    finalCoins: decimalOrNull(listing.finalCoins),
    pickupAddress: listing.pickupAddress,
    notes: listing.notes,
    deletedAt: listing.deletedAt,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    images: listing.images.map((img) => ({
      id: img.id,
      listingId: img.listingId,
      url: img.url,
      publicId: img.publicId,
      contentHash: img.contentHash,
      width: img.width,
      height: img.height,
      bytes: img.bytes,
      sortOrder: img.sortOrder,
      categoryId: img.categoryId,
      createdAt: img.createdAt,
    })),
    items: listing.items.map((item) => ({
      id: item.id,
      listingId: item.listingId,
      categoryId: item.categoryId,
      claimedQuantity: item.claimedQuantity,
      claimedWeightGrams: item.claimedWeightGrams,
      createdAt: item.createdAt,
      category: item.category,
    })),
    aiResults: listing.aiResults.map((row) => ({
      id: row.id,
      listingId: row.listingId,
      listingImageId: row.listingImageId,
      detectedClass: row.detectedClass,
      detectedCount: row.detectedCount,
      userConfirmedCount: row.userConfirmedCount,
      userConfirmedClass: row.userConfirmedClass,
      confidence: decimalOrNull(row.confidence) ?? 0,
      decision: row.decision,
      matchedClaimed: row.matchedClaimed,
      rawPayload: row.rawPayload,
      createdAt: row.createdAt,
    })),
    pickupRequest: listing.pickupRequest
      ? {
          id: listing.pickupRequest.id,
          listingId: listing.pickupRequest.listingId,
          collectorId: listing.pickupRequest.collectorId,
          status: listing.pickupRequest.status,
          address: listing.pickupRequest.address,
          scheduledAt: listing.pickupRequest.scheduledAt,
          completedAt: listing.pickupRequest.completedAt,
          notes: listing.pickupRequest.notes,
          latitude: decimalOrNull(listing.pickupRequest.latitude),
          longitude: decimalOrNull(listing.pickupRequest.longitude),
          distanceKm: decimalOrNull(listing.pickupRequest.distanceKm),
          createdAt: listing.pickupRequest.createdAt,
          updatedAt: listing.pickupRequest.updatedAt,
        }
      : null,
  };
}

export type SerializedSellListing = ReturnType<typeof serializeSellListing>;

export async function listUserListings(userId: string, take = 30) {
  return prisma.plasticListing.findMany({
    where: { userId, deletedAt: null, status: { not: ListingStatus.DRAFT } },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      pickupRequest: {
        select: { status: true, scheduledAt: true, completedAt: true },
      },
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      _count: { select: { aiResults: true, items: true } },
    },
  });
}

export async function uploadListingImages(input: {
  userId: string;
  listingId: string;
  files: { buffer: Buffer; mimeType: string; fileName: string }[];
}) {
  const listing = await assertListingOwner(input.listingId, input.userId);
  assertEditable(listing.status);

  const existingCount = await prisma.listingImage.count({
    where: { listingId: input.listingId },
  });
  if (existingCount + input.files.length > MAX_IMAGES_PER_LISTING) {
    throw new Error("TOO_MANY_IMAGES");
  }

  const created = [];

  for (const [index, file] of input.files.entries()) {
    const mimeType = resolveImageMime(file.buffer, file.mimeType);
    if (file.buffer.length > MAX_IMAGE_BYTES) {
      throw new Error("IMAGE_TOO_LARGE");
    }

    const contentHash = hashImageBuffer(file.buffer);
    const dims = readImageDimensions(file.buffer, mimeType);

    const uploaded = await uploadImage(
      `data:${mimeType};base64,${file.buffer.toString("base64")}`,
      "nexplast/listings",
    );

    const image = await prisma.listingImage.create({
      data: {
        listingId: input.listingId,
        url: uploaded.url,
        publicId: uploaded.publicId,
        contentHash,
        width: uploaded.width ?? dims?.width,
        height: uploaded.height ?? dims?.height,
        bytes: uploaded.bytes ?? file.buffer.length,
        sortOrder: existingCount + index,
      },
    });
    created.push(image);
  }

  return created;
}

export async function runListingAiDetection(input: {
  userId: string;
  listingId: string;
  /** When true, re-run inference even if a matching content-hash result exists. */
  force?: boolean;
}) {
  const listing = await assertListingOwner(input.listingId, input.userId);
  assertEditable(listing.status);

  const images = await prisma.listingImage.findMany({
    where: { listingId: input.listingId },
    orderBy: { sortOrder: "asc" },
  });
  if (images.length === 0) {
    throw new Error("NO_IMAGES");
  }

  await prisma.plasticListing.update({
    where: { id: listing.id },
    data: { status: ListingStatus.AI_PROCESSING },
  });

  try {
    const existingRows = await prisma.aiDetectionResult.findMany({
      where: { listingId: listing.id },
      orderBy: { createdAt: "desc" },
    });

    let totalEstWeight = 0;
    const keepImageIds: string[] = [];

    for (const image of images) {
      if (!image.publicId && !image.url) continue;

      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error("IMAGE_FETCH_FAILED");
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = resolveImageMime(
        buffer,
        response.headers.get("content-type")?.split(";")[0] ?? undefined,
      );
      const contentHash = image.contentHash ?? hashImageBuffer(buffer);

      const cached = existingRows.find((row) => {
        if (row.listingImageId !== image.id) return false;
        const payload = row.rawPayload as
          | {
              analysis?: { contentHash?: string };
              estimatedWeightGrams?: number;
            }
          | null;
        return payload?.analysis?.contentHash === contentHash;
      });

      if (cached && !input.force) {
        const payload = cached.rawPayload as
          | { estimatedWeightGrams?: number }
          | null;
        totalEstWeight += Number(payload?.estimatedWeightGrams ?? 0);
        keepImageIds.push(image.id);
        continue;
      }

      const duplicate = await prisma.listingImage.findFirst({
        where: {
          contentHash,
          id: { not: image.id },
          listing: { deletedAt: null, status: { not: ListingStatus.DRAFT } },
        },
        select: { id: true, listingId: true },
      });

      const detection = await detectPlasticInImage({
        buffer,
        mimeType,
        width: image.width,
        height: image.height,
        bytes: image.bytes,
      });

      if (!image.contentHash) {
        await prisma.listingImage.update({
          where: { id: image.id },
          data: { contentHash: detection.analysis.contentHash },
        });
      }

      const fraud = evaluateFraud({
        confidence: detection.confidence,
        aiCount: detection.detectedCount,
        userCount: detection.detectedCount,
        isDuplicateImage: Boolean(duplicate),
        decision: detection.decision,
        estimatedWeightGrams: detection.estimatedWeightGrams,
        claimedWeightGrams: listing.claimedWeightGrams ?? undefined,
        processingTimeMs: detection.processingTimeMs,
      });

      await prisma.aiDetectionResult.deleteMany({
        where: { listingId: listing.id, listingImageId: image.id },
      });

      await prisma.aiDetectionResult.create({
        data: {
          listingId: listing.id,
          listingImageId: image.id,
          detectedClass: detection.detectedClass,
          detectedCount: detection.detectedCount,
          userConfirmedCount: detection.detectedCount,
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
          entityId: listing.id,
          metadata: {
            listingId: listing.id,
            listingImageId: image.id,
            provider: detection.analysis.provider,
            confidence: detection.confidence,
            processingTimeMs: detection.processingTimeMs,
            reused: false,
          } as Prisma.InputJsonValue,
        },
      });

      totalEstWeight += detection.estimatedWeightGrams;
      keepImageIds.push(image.id);
    }

    await prisma.aiDetectionResult.deleteMany({
      where: {
        listingId: listing.id,
        OR: [
          { listingImageId: null },
          ...(keepImageIds.length > 0
            ? [{ listingImageId: { notIn: keepImageIds } }]
            : [{ listingImageId: { not: null } }]),
        ],
      },
    });

    const estimatedCoins = estimateNatureCoins({
      weightGrams: totalEstWeight || listing.claimedWeightGrams || 1000,
      quality: listing.quality,
    });

    // Stay DRAFT until the user submits — avoids locked uploads and listing pollution.
    const updated = await prisma.plasticListing.update({
      where: { id: listing.id },
      data: {
        status: ListingStatus.DRAFT,
        claimedWeightGrams: listing.claimedWeightGrams ?? totalEstWeight,
        estimatedCoins,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        aiResults: true,
        items: { include: { category: true } },
        pickupRequest: true,
      },
    });

    return updated;
  } catch (error) {
    await prisma.plasticListing
      .update({
        where: { id: listing.id },
        data: { status: ListingStatus.DRAFT },
      })
      .catch(() => undefined);
    throw error;
  }
}

export async function saveDetectionEdits(input: {
  userId: string;
  listingId: string;
  edits: {
    detectionId: string;
    userConfirmedCount: number;
    userConfirmedClass: string;
  }[];
}) {
  const listing = await assertListingOwner(input.listingId, input.userId);
  assertEditable(listing.status);

  await prisma.$transaction(
    input.edits.map((edit) =>
      prisma.aiDetectionResult.updateMany({
        where: { id: edit.detectionId, listingId: input.listingId },
        data: {
          userConfirmedCount: edit.userConfirmedCount,
          userConfirmedClass: edit.userConfirmedClass,
        },
      }),
    ),
  );

  const rows = await prisma.aiDetectionResult.findMany({
    where: { listingId: input.listingId },
  });
  await prisma.$transaction(
    rows.map((row) =>
      prisma.aiDetectionResult.update({
        where: { id: row.id },
        data: {
          matchedClaimed:
            (row.userConfirmedCount ?? row.detectedCount) ===
              row.detectedCount &&
            (row.userConfirmedClass ?? row.detectedClass) ===
              row.detectedClass,
        },
      }),
    ),
  );

  return getListingForUser(input.listingId, input.userId);
}

export async function savePlasticDetails(input: {
  userId: string;
  listingId: string;
  quality: PlasticQuality;
  claimedWeightGrams: number;
  notes?: string;
  items: {
    categoryId: string;
    claimedQuantity: number;
    claimedWeightGrams?: number;
  }[];
}) {
  const listing = await assertListingOwner(input.listingId, input.userId);
  assertEditable(listing.status);
  await ensurePlasticCategories();

  const categoryIds = [...new Set(input.items.map((item) => item.categoryId))];
  const categories = await prisma.plasticCategory.findMany({
    where: { id: { in: categoryIds }, isActive: true },
    select: { id: true },
  });
  if (categories.length !== categoryIds.length) {
    throw new Error("INVALID_CATEGORY");
  }

  const estimatedCoins = estimateNatureCoins({
    weightGrams: input.claimedWeightGrams,
    quality: input.quality,
  });

  await prisma.$transaction(async (tx) => {
    await tx.listingItem.deleteMany({ where: { listingId: input.listingId } });
    await tx.listingItem.createMany({
      data: input.items.map((item) => ({
        listingId: input.listingId,
        categoryId: item.categoryId,
        claimedQuantity: item.claimedQuantity,
        claimedWeightGrams: item.claimedWeightGrams,
      })),
    });

    const firstItem = input.items[0];
    if (firstItem) {
      const firstImage = await tx.listingImage.findFirst({
        where: { listingId: input.listingId },
        orderBy: { sortOrder: "asc" },
      });
      if (firstImage && !firstImage.categoryId) {
        await tx.listingImage.update({
          where: { id: firstImage.id },
          data: { categoryId: firstItem.categoryId },
        });
      }
    }

    await tx.plasticListing.update({
      where: { id: input.listingId },
      data: {
        quality: input.quality,
        claimedWeightGrams: input.claimedWeightGrams,
        notes: input.notes,
        estimatedCoins,
      },
    });
  });

  return getListingForUser(input.listingId, input.userId);
}

export async function savePickupDetails(input: {
  userId: string;
  listingId: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  scheduledAt: Date;
  specialInstructions?: string;
}) {
  const listing = await assertListingOwner(input.listingId, input.userId);
  assertEditable(listing.status);

  if (input.scheduledAt.getTime() < Date.now() - 60_000) {
    throw new Error("PICKUP_IN_PAST");
  }

  await prisma.plasticListing.update({
    where: { id: input.listingId },
    data: {
      pickupAddress: input.address,
    },
  });

  const hasCoords =
    typeof input.latitude === "number" && typeof input.longitude === "number";
  const coords = {
    latitude: hasCoords ? input.latitude : null,
    longitude: hasCoords ? input.longitude : null,
  };

  await prisma.pickupRequest.upsert({
    where: { listingId: input.listingId },
    create: {
      listingId: input.listingId,
      address: input.address,
      ...coords,
      scheduledAt: input.scheduledAt,
      status: PickupStatus.REQUESTED,
      notes: input.specialInstructions,
    },
    update: {
      address: input.address,
      ...coords,
      scheduledAt: input.scheduledAt,
      notes: input.specialInstructions,
      status: PickupStatus.REQUESTED,
    },
  });

  return getListingForUser(input.listingId, input.userId);
}

const ADDRESS_LOCKED_LISTING: ListingStatus[] = [
  ListingStatus.COMPLETED,
  ListingStatus.CANCELLED,
  ListingStatus.AI_REJECTED,
];

const ADDRESS_LOCKED_PICKUP: PickupStatus[] = [
  PickupStatus.COMPLETED,
  PickupStatus.CANCELLED,
];

/** Customers may fix the pickup address any time until the pickup is closed. */
export function canEditPickupAddress(
  listingStatus: ListingStatus,
  pickupStatus: PickupStatus | null | undefined,
): boolean {
  if (!pickupStatus) return false;
  return (
    !ADDRESS_LOCKED_LISTING.includes(listingStatus) &&
    !ADDRESS_LOCKED_PICKUP.includes(pickupStatus)
  );
}

/**
 * Update the address on a submitted pickup. Admin and collector screens read
 * PickupRequest.address, so they pick up the change automatically.
 */
export async function updatePickupAddress(input: {
  userId: string;
  listingId: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const listing = await prisma.plasticListing.findFirst({
    where: { id: input.listingId, userId: input.userId, deletedAt: null },
    include: { pickupRequest: true },
  });
  if (!listing) throw new Error("LISTING_NOT_FOUND");
  const pickup = listing.pickupRequest;
  if (!pickup) throw new Error("PICKUP_REQUIRED");
  if (!canEditPickupAddress(listing.status, pickup.status)) {
    throw new Error("PICKUP_ADDRESS_LOCKED");
  }

  const hasCoords =
    typeof input.latitude === "number" && typeof input.longitude === "number";

  await prisma.$transaction([
    prisma.plasticListing.update({
      where: { id: listing.id },
      data: { pickupAddress: input.address },
    }),
    prisma.pickupRequest.update({
      where: { id: pickup.id },
      data: {
        address: input.address,
        latitude: hasCoords ? input.latitude : null,
        longitude: hasCoords ? input.longitude : null,
      },
    }),
  ]);

  logger.info(
    "Pickup address updated by customer",
    { listingId: listing.id, pickupId: pickup.id, pickupStatus: pickup.status },
    "plastic",
  );

  return { pickupId: pickup.id };
}

export async function submitListing(input: {
  userId: string;
  listingId: string;
}) {
  const listing = await getListingForUser(input.listingId, input.userId);
  if (!listing) throw new Error("LISTING_NOT_FOUND");
  assertEditable(listing.status);
  if (listing.images.length === 0) throw new Error("NO_IMAGES");
  if (listing.aiResults.length === 0) throw new Error("AI_REQUIRED");
  if (!listing.claimedWeightGrams) throw new Error("DETAILS_REQUIRED");
  if (!listing.pickupAddress || !listing.pickupRequest) {
    throw new Error("PICKUP_REQUIRED");
  }

  const detections = listing.aiResults;
  const avgConfidence =
    detections.reduce((s, d) => s + Number(d.confidence), 0) /
    Math.max(detections.length, 1);

  const totalAi = detections.reduce((s, d) => s + d.detectedCount, 0);
  const totalUser = detections.reduce(
    (s, d) => s + (d.userConfirmedCount ?? d.detectedCount),
    0,
  );

  const hasDuplicate = detections.some((d) => {
    const payload = d.rawPayload as {
      duplicateListingId?: string | null;
    } | null;
    return Boolean(payload?.duplicateListingId);
  });

  const hasReject = detections.some((d) => d.decision === AiDecision.REJECT);

  const fraud = evaluateFraud({
    confidence: avgConfidence,
    aiCount: totalAi,
    userCount: totalUser,
    isDuplicateImage: hasDuplicate,
    decision: hasReject ? AiDecision.REJECT : undefined,
    claimedWeightGrams: listing.claimedWeightGrams ?? undefined,
  });

  const needsManualReview =
    fraud.some((f) => f.severity !== "low") ||
    avgConfidence < 0.55;

  const estimatedCoins = estimateNatureCoins({
    weightGrams: listing.claimedWeightGrams,
    quality: listing.quality,
  });

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.plasticListing.update({
      where: { id: listing.id },
      data: {
        status: needsManualReview
          ? ListingStatus.PENDING_REVIEW
          : ListingStatus.AWAITING_COLLECTOR,
        estimatedCoins,
      },
      include: {
        images: true,
        aiResults: true,
        items: { include: { category: true } },
        pickupRequest: true,
      },
    });

    await tx.notification.create({
      data: {
        userId: input.userId,
        type: "PICKUP",
        title: "Plastic listing submitted",
        body: needsManualReview
          ? "Your listing was submitted and is pending review before collector assignment."
          : "Your listing was submitted. A collector will be assigned soon.",
        data: JSON.parse(
          JSON.stringify({ listingId: listing.id, fraud }),
        ) as Prisma.InputJsonValue,
      },
    });

    const admins = await tx.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        isActive: true,
      },
      select: { id: true },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "SYSTEM" as const,
          title: "New plastic pickup request",
          body: `Listing ${listing.id.slice(0, 8)} needs collector assignment.`,
          data: JSON.parse(
            JSON.stringify({ listingId: listing.id, userId: input.userId }),
          ) as Prisma.InputJsonValue,
        })),
      });
    }

    return row;
  });

  logger.info(
    "Listing submitted",
    { listingId: listing.id, userId: input.userId, needsManualReview },
    "plastic",
  );

  return updated;
}

export async function deleteListingImage(input: {
  userId: string;
  listingId: string;
  imageId: string;
}) {
  const listing = await assertListingOwner(input.listingId, input.userId);
  assertEditable(listing.status);

  const image = await prisma.listingImage.findFirst({
    where: { id: input.imageId, listingId: input.listingId },
  });
  if (!image) {
    throw new Error("LISTING_NOT_FOUND");
  }

  if (image.publicId) {
    try {
      await deleteFile(image.publicId);
    } catch (error) {
      logger.warn(
        "Cloudinary delete failed; removing DB row anyway",
        { error, publicId: image.publicId },
        "plastic",
      );
    }
  }

  await prisma.listingImage.delete({ where: { id: image.id } });
  return getListingForUser(input.listingId, input.userId);
}
