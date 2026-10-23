import "server-only";

import {
  ListingStatus,
  PickupStatus,
  PlasticQuality,
  Prisma,
  ProfileVerificationStatus,
} from "@prisma/client";
import { prisma } from "@/prisma";
import { logger } from "@/utils/logger";
import { uploadImage } from "@/utils/upload";
import { resolveImageMime } from "@/utils/image-mime";
import { estimateNatureCoins } from "@/features/plastic/services/coin-estimate";
import { MAX_IMAGE_BYTES } from "@/validations/collector";
import {
  generatePickupOtp,
  hashPickupOtp,
  isOtpLocked,
  verifyPickupOtp,
} from "@/features/collector/services/otp";
import { ensureCollectorProfile } from "@/features/collector/services/ensure-collector";
import { creditNatureCoins } from "@/features/collector/services/wallet-credit";
import { applyInventoryHandoff } from "@/features/collector/services/inventory-handoff";
import { applyEnvironmentalImpact } from "@/features/collector/services/impact";
import {
  getPickupForCollector,
  pickupDetailInclude,
} from "@/features/collector/services/pickup-queries";

async function assertCollectorOwnsPickup(
  pickupId: string,
  userId: string,
) {
  const collector = await ensureCollectorProfile(userId);
  const pickup = await getPickupForCollector(pickupId, collector.id);
  if (!pickup) {
    throw new Error("PICKUP_NOT_FOUND");
  }
  return { collector, pickup };
}

function assertStatus(
  status: PickupStatus,
  allowed: readonly PickupStatus[],
) {
  if (!allowed.includes(status)) {
    throw new Error("INVALID_PICKUP_STATE");
  }
}

async function redactOtpNotifications(
  tx: Prisma.TransactionClient,
  input: { userId: string; pickupId: string },
) {
  const notifications = await tx.notification.findMany({
    where: { userId: input.userId, type: "PICKUP" },
    select: { id: true, body: true, data: true },
  });

  for (const notification of notifications) {
    const data = notification.data as { pickupId?: string } | null;
    if (data?.pickupId !== input.pickupId) continue;
    if (!/OTP/i.test(notification.body)) continue;
    await tx.notification.update({
      where: { id: notification.id },
      data: {
        body: "Your pickup OTP was verified and is no longer shown.",
      },
    });
  }
}

/**
 * Admin assigns a collector and issues a customer OTP.
 */
export async function assignPickupToCollector(input: {
  adminUserId: string;
  pickupId: string;
  collectorId: string;
}) {
  const pickup = await prisma.pickupRequest.findUnique({
    where: { id: input.pickupId },
    include: {
      listing: { include: { user: { select: { id: true, name: true } } } },
      collector: true,
    },
  });
  if (!pickup) throw new Error("PICKUP_NOT_FOUND");
  if (pickup.status !== PickupStatus.REQUESTED || pickup.collectorId) {
    throw new Error("PICKUP_NOT_ASSIGNABLE");
  }
  if (
    pickup.listing.status !== ListingStatus.AWAITING_COLLECTOR &&
    pickup.listing.status !== ListingStatus.APPROVED
  ) {
    throw new Error("PICKUP_NOT_ASSIGNABLE");
  }

  const collector = await prisma.collector.findUnique({
    where: { id: input.collectorId },
    include: { user: { select: { id: true, name: true, isActive: true } } },
  });
  if (!collector || !collector.user.isActive) {
    throw new Error("COLLECTOR_NOT_FOUND");
  }
  if (!collector.isOnDuty) {
    throw new Error("COLLECTOR_OFF_DUTY");
  }
  if (collector.verificationStatus !== ProfileVerificationStatus.APPROVED) {
    throw new Error("COLLECTOR_NOT_APPROVED");
  }

  const otp = generatePickupOtp();
  const otpHash = hashPickupOtp(otp);

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.pickupRequest.update({
      where: { id: pickup.id },
      data: {
        collectorId: collector.id,
        status: PickupStatus.ASSIGNED,
        otpHash,
        otpFailCount: 0,
      },
    });

    if (pickup.listing.status === ListingStatus.APPROVED) {
      await tx.plasticListing.update({
        where: { id: pickup.listingId },
        data: { status: ListingStatus.AWAITING_COLLECTOR },
      });
    }

    await tx.notification.createMany({
      data: [
        {
          userId: pickup.listing.userId,
          type: "PICKUP",
          title: "Collector assigned",
          body: `Your pickup OTP is ${otp}. Share it only when the collector arrives.`,
          data: JSON.parse(
            JSON.stringify({
              pickupId: pickup.id,
              listingId: pickup.listingId,
              collectorId: collector.id,
              containsOtp: true,
            }),
          ) as Prisma.InputJsonValue,
        },
        {
          userId: collector.userId,
          type: "PICKUP",
          title: "New pickup assigned",
          body: `Pickup at ${pickup.address.slice(0, 80)} was assigned to you.`,
          data: JSON.parse(
            JSON.stringify({
              pickupId: pickup.id,
              listingId: pickup.listingId,
            }),
          ) as Prisma.InputJsonValue,
        },
      ],
    });

    await tx.adminLog.create({
      data: {
        adminId: input.adminUserId,
        action: "PICKUP_ASSIGNED",
        targetType: "PickupRequest",
        targetId: pickup.id,
        metadata: JSON.parse(
          JSON.stringify({ collectorId: collector.id }),
        ) as Prisma.InputJsonValue,
      },
    });

    return row;
  });

  logger.info(
    "Pickup assigned",
    {
      pickupId: pickup.id,
      collectorId: collector.id,
      adminUserId: input.adminUserId,
    },
    "collector",
  );

  return updated;
}

export async function acceptPickup(input: {
  userId: string;
  pickupId: string;
}) {
  const { pickup } = await assertCollectorOwnsPickup(
    input.pickupId,
    input.userId,
  );
  if (
    pickup.status !== PickupStatus.ASSIGNED
  ) {
    throw new Error("INVALID_PICKUP_STATE");
  }

  return prisma.$transaction(async (tx) => {
    const row = await tx.pickupRequest.update({
      where: { id: pickup.id },
      data: {
        status: PickupStatus.SCHEDULED,
        acceptedAt: pickup.acceptedAt ?? new Date(),
      },
    });

    await tx.notification.create({
      data: {
        userId: pickup.listing.userId,
        type: "PICKUP",
        title: "Pickup reminder",
        body: "Your collector accepted the job and will arrive at the scheduled time. Keep your OTP ready.",
        data: JSON.parse(
          JSON.stringify({ pickupId: pickup.id }),
        ) as Prisma.InputJsonValue,
      },
    });

    return row;
  });
}

export async function markCollectorArrived(input: {
  userId: string;
  pickupId: string;
}) {
  const { pickup } = await assertCollectorOwnsPickup(
    input.pickupId,
    input.userId,
  );
  assertStatus(pickup.status, [PickupStatus.SCHEDULED]);

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.pickupRequest.update({
      where: { id: pickup.id },
      data: { status: PickupStatus.IN_PROGRESS },
    });

    await tx.notification.create({
      data: {
        userId: pickup.listing.userId,
        type: "PICKUP",
        title: "Collector arrived",
        body: "Your collector has marked arrival. Share your OTP to continue verification.",
        data: JSON.parse(
          JSON.stringify({ pickupId: pickup.id }),
        ) as Prisma.InputJsonValue,
      },
    });

    return row;
  });

  return updated;
}

export async function verifyPickupOtpForCollector(input: {
  userId: string;
  pickupId: string;
  otp: string;
}) {
  const { pickup } = await assertCollectorOwnsPickup(
    input.pickupId,
    input.userId,
  );
  assertStatus(pickup.status, [PickupStatus.IN_PROGRESS]);

  if (isOtpLocked(pickup.otpFailCount)) {
    throw new Error("OTP_LOCKED");
  }

  if (!verifyPickupOtp(input.otp, pickup.otpHash)) {
    const nextFails = pickup.otpFailCount + 1;
    await prisma.pickupRequest.update({
      where: { id: pickup.id },
      data: { otpFailCount: nextFails },
    });
    if (isOtpLocked(nextFails)) {
      throw new Error("OTP_LOCKED");
    }
    throw new Error("INVALID_OTP");
  }

  return prisma.$transaction(async (tx) => {
    const row = await tx.pickupRequest.update({
      where: { id: pickup.id },
      data: {
        status: PickupStatus.AWAITING_VERIFICATION,
        acceptedAt: pickup.acceptedAt ?? new Date(),
        otpFailCount: 0,
      },
    });

    await redactOtpNotifications(tx, {
      userId: pickup.listing.userId,
      pickupId: pickup.id,
    });

    return row;
  });
}

export async function uploadPickupProof(input: {
  userId: string;
  pickupId: string;
  buffer: Buffer;
  mimeType?: string;
}) {
  const { pickup } = await assertCollectorOwnsPickup(
    input.pickupId,
    input.userId,
  );
  assertStatus(pickup.status, [PickupStatus.AWAITING_VERIFICATION]);
  if (input.buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }
  const mimeType = resolveImageMime(input.buffer, input.mimeType);
  const uploaded = await uploadImage(
    `data:${mimeType};base64,${input.buffer.toString("base64")}`,
    "nexplast/pickup-proofs",
  );

  return {
    pickupId: pickup.id,
    url: uploaded.url,
    publicId: uploaded.publicId,
  };
}

export async function completePickupVerification(input: {
  userId: string;
  pickupId: string;
  actualQuantity: number;
  actualWeightGrams: number;
  verifiedQuality: PlasticQuality;
  notes?: string;
  customerConfirmed: boolean;
  proofImageUrl?: string;
  proofPublicId?: string;
}) {
  const { collector, pickup } = await assertCollectorOwnsPickup(
    input.pickupId,
    input.userId,
  );

  if (pickup.status === PickupStatus.COMPLETED || pickup.verification) {
    throw new Error("ALREADY_COMPLETED");
  }
  assertStatus(pickup.status, [PickupStatus.AWAITING_VERIFICATION]);
  if (!input.customerConfirmed) {
    throw new Error("CUSTOMER_CONFIRMATION_REQUIRED");
  }
  if (!input.proofImageUrl) {
    throw new Error("PROOF_REQUIRED");
  }

  const coins = estimateNatureCoins({
    weightGrams: input.actualWeightGrams,
    quality: input.verifiedQuality,
  });

  await prisma.$transaction(async (tx) => {
    await tx.collectorVerification.create({
      data: {
        pickupRequestId: pickup.id,
        actualQuantity: input.actualQuantity,
        actualWeightGrams: input.actualWeightGrams,
        verifiedQuality: input.verifiedQuality,
        customerConfirmed: true,
        proofImageUrl: input.proofImageUrl,
        proofPublicId: input.proofPublicId,
        digitalSignatureRef: `CUSTOMER_CONFIRMED:${new Date().toISOString()}`,
        recalculatedCoins: new Prisma.Decimal(coins),
        notes: input.notes,
        verifiedAt: new Date(),
      },
    });

    await tx.pickupRequest.update({
      where: { id: pickup.id },
      data: {
        status: PickupStatus.COMPLETED,
        completedAt: new Date(),
        otpHash: null,
        otpFailCount: 0,
      },
    });

    // Preserve claimedWeightGrams / listing.quality / AI rows; set verified fields only.
    await tx.plasticListing.update({
      where: { id: pickup.listingId },
      data: {
        status: ListingStatus.COMPLETED,
        actualWeightGrams: input.actualWeightGrams,
        finalCoins: new Prisma.Decimal(coins),
      },
    });

    await creditNatureCoins(tx, {
      userId: pickup.listing.userId,
      amount: coins,
      title: "Plastic recycling reward",
      description: `Nature Coins credited after collector verification of pickup ${pickup.id.slice(0, 8)}.`,
      referenceType: "PickupRequest",
      referenceId: pickup.id,
      idempotencyKey: `pickup-credit:${pickup.id}`,
      metadata: {
        listingId: pickup.listingId,
        actualWeightGrams: input.actualWeightGrams,
        verifiedQuality: input.verifiedQuality,
        estimatedCoins: pickup.listing.estimatedCoins
          ? Number(pickup.listing.estimatedCoins)
          : null,
      },
    });

    await applyInventoryHandoff(tx, {
      pickupRequestId: pickup.id,
      actualWeightGrams: input.actualWeightGrams,
      verifiedQuality: input.verifiedQuality,
      items: pickup.listing.items.map((item) => ({
        categoryId: item.categoryId,
        claimedQuantity: item.claimedQuantity,
        claimedWeightGrams: item.claimedWeightGrams,
      })),
    });

    await applyEnvironmentalImpact(tx, {
      userId: pickup.listing.userId,
      weightGrams: input.actualWeightGrams,
    });

    await tx.collector.update({
      where: { id: collector.id },
      data: { completedPickups: { increment: 1 } },
    });

    await redactOtpNotifications(tx, {
      userId: pickup.listing.userId,
      pickupId: pickup.id,
    });

    await tx.notification.createMany({
      data: [
        {
          userId: pickup.listing.userId,
          type: "REWARD",
          title: "Nature Coins credited",
          body: `${coins} Nature Coins were added to your wallet after pickup verification.`,
          data: JSON.parse(
            JSON.stringify({
              pickupId: pickup.id,
              coins,
              listingId: pickup.listingId,
            }),
          ) as Prisma.InputJsonValue,
        },
        {
          userId: pickup.listing.userId,
          type: "PICKUP",
          title: "Pickup completed",
          body: "Your plastic pickup was verified and completed.",
          data: JSON.parse(
            JSON.stringify({ pickupId: pickup.id }),
          ) as Prisma.InputJsonValue,
        },
        {
          userId: collector.userId,
          type: "PICKUP",
          title: "Verification submitted",
          body: `Pickup ${pickup.id.slice(0, 8)} verification was submitted successfully.`,
          data: JSON.parse(
            JSON.stringify({ pickupId: pickup.id }),
          ) as Prisma.InputJsonValue,
        },
      ],
    });
  });

  logger.info(
    "Pickup verification completed",
    {
      pickupId: pickup.id,
      collectorId: collector.id,
      coins,
      weightGrams: input.actualWeightGrams,
    },
    "collector",
  );

  return getPickupForCollector(pickup.id, collector.id);
}

export async function setCollectorDuty(input: {
  userId: string;
  isOnDuty: boolean;
}) {
  const collector = await ensureCollectorProfile(input.userId);
  return prisma.collector.update({
    where: { id: collector.id },
    data: { isOnDuty: input.isOnDuty },
  });
}
