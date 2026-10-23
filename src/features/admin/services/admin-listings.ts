import "server-only";

import { ListingStatus, PickupStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";
import { writeAdminLog } from "@/features/admin/services/admin-audit";

export async function listAdminListings(input?: {
  status?: string;
  q?: string;
  take?: number;
}) {
  const where: Prisma.PlasticListingWhereInput = { deletedAt: null };
  if (input?.status && input.status !== "ALL") {
    where.status = input.status as ListingStatus;
  }
  if (input?.q) {
    where.OR = [
      { id: { contains: input.q } },
      { pickupAddress: { contains: input.q, mode: "insensitive" } },
      { user: { email: { contains: input.q, mode: "insensitive" } } },
    ];
  }

  const listings = await prisma.plasticListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: input?.take ?? 50,
    include: {
      user: { select: { id: true, name: true, email: true } },
      pickupRequest: { select: { id: true, status: true, collectorId: true } },
      aiResults: { orderBy: { createdAt: "asc" } },
      _count: { select: { images: true, items: true } },
    },
  });

  return listings.map((l) => ({
    id: l.id,
    status: l.status,
    quality: l.quality,
    claimedWeightGrams: l.claimedWeightGrams,
    actualWeightGrams: l.actualWeightGrams,
    estimatedCoins: decimalToNumber(l.estimatedCoins),
    finalCoins: decimalToNumber(l.finalCoins),
    createdAt: l.createdAt,
    user: l.user,
    pickupStatus: l.pickupRequest?.status ?? null,
    pickupId: l.pickupRequest?.id ?? null,
    imageCount: l._count.images,
    itemCount: l._count.items,
    aiResults: l.aiResults.map((r) => ({
      id: r.id,
      detectedClass: r.detectedClass,
      detectedCount: r.detectedCount,
      userConfirmedCount: r.userConfirmedCount,
      userConfirmedClass: r.userConfirmedClass,
      confidence: Number(r.confidence),
      decision: r.decision,
      matchedClaimed: r.matchedClaimed,
      fraudAlerts:
        (
          r.rawPayload as {
            fraudAlerts?: { code: string; message: string; severity: string }[];
          } | null
        )?.fraudAlerts ?? [],
    })),
  }));
}

export async function listFlaggedListingsForAiReview() {
  return listAdminListings({ status: ListingStatus.PENDING_REVIEW, take: 40 });
}

/**
 * Admin listing review — does not mutate AI prediction rows.
 */
export async function reviewPlasticListing(input: {
  adminId: string;
  listingId: string;
  decision: "APPROVE" | "KEEP_REVIEW" | "REJECT";
  notes?: string;
}) {
  const listing = await prisma.plasticListing.findFirst({
    where: { id: input.listingId, deletedAt: null },
    include: { pickupRequest: { select: { id: true, status: true } } },
  });
  if (!listing) throw new Error("LISTING_NOT_FOUND");
  if (
    listing.status === ListingStatus.COMPLETED ||
    listing.status === ListingStatus.CANCELLED
  ) {
    throw new Error("LISTING_NOT_REVIEWABLE");
  }

  let nextStatus: ListingStatus = listing.status;
  if (input.decision === "APPROVE") {
    nextStatus = ListingStatus.AWAITING_COLLECTOR;
  } else if (input.decision === "REJECT") {
    nextStatus = ListingStatus.AI_REJECTED;
  } else {
    nextStatus = ListingStatus.PENDING_REVIEW;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.plasticListing.update({
      where: { id: listing.id },
      data: {
        status: nextStatus,
        notes: input.notes
          ? [listing.notes, `Admin: ${input.notes}`].filter(Boolean).join("\n")
          : listing.notes,
      },
    });

    if (input.decision === "REJECT" && listing.pickupRequest) {
      const terminal: PickupStatus[] = [
        PickupStatus.COMPLETED,
        PickupStatus.CANCELLED,
      ];
      if (!terminal.includes(listing.pickupRequest.status)) {
        const pickup = await tx.pickupRequest.findUnique({
          where: { id: listing.pickupRequest.id },
          select: { notes: true },
        });
        await tx.pickupRequest.update({
          where: { id: listing.pickupRequest.id },
          data: {
            status: PickupStatus.CANCELLED,
            otpHash: null,
            otpFailCount: 0,
            notes: [
              pickup?.notes,
              "Cancelled: listing rejected by admin AI review",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        });
      }
    }

    await writeAdminLog(tx, {
      adminId: input.adminId,
      action: `LISTING_${input.decision}`,
      targetType: "PlasticListing",
      targetId: listing.id,
      metadata: {
        previousStatus: listing.status,
        nextStatus,
        notes: input.notes ?? null,
        cancelledPickupId:
          input.decision === "REJECT"
            ? (listing.pickupRequest?.id ?? null)
            : null,
      },
    });

    if (input.decision === "APPROVE") {
      await tx.notification.create({
        data: {
          userId: listing.userId,
          type: "SYSTEM",
          title: "Listing approved",
          body: "An admin approved your plastic listing for collector assignment.",
          data: JSON.parse(
            JSON.stringify({ listingId: listing.id }),
          ) as Prisma.InputJsonValue,
        },
      });
    }
    if (input.decision === "REJECT") {
      await tx.notification.create({
        data: {
          userId: listing.userId,
          type: "SYSTEM",
          title: "Listing rejected",
          body: "An admin rejected your plastic listing after AI review.",
          data: JSON.parse(
            JSON.stringify({ listingId: listing.id }),
          ) as Prisma.InputJsonValue,
        },
      });
    }

    return row;
  });

  return updated;
}
