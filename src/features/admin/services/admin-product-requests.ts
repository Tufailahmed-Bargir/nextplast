import "server-only";

import { NotificationType, Prisma, ProductRequestStatus } from "@prisma/client";
import { prisma } from "@/prisma";
import { writeAdminLog } from "@/features/admin/services/admin-audit";

export async function listAdminProductRequests(status?: ProductRequestStatus) {
  return prisma.productRequest.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      fulfilledProduct: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function rejectProductRequest(input: {
  adminId: string;
  requestId: string;
  adminNotes?: string;
}) {
  const request = await prisma.productRequest.findFirst({
    where: { id: input.requestId, deletedAt: null },
  });
  if (!request) throw new Error("PRODUCT_REQUEST_NOT_FOUND");
  if (request.status !== "OPEN") throw new Error("PRODUCT_REQUEST_NOT_OPEN");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.productRequest.update({
      where: { id: request.id },
      data: {
        status: "REJECTED",
        adminNotes: input.adminNotes?.trim() || null,
        reviewedById: input.adminId,
        reviewedAt: new Date(),
      },
    });

    await writeAdminLog(tx, {
      adminId: input.adminId,
      action: "PRODUCT_REQUEST_REJECTED",
      targetType: "ProductRequest",
      targetId: request.id,
      metadata: { notes: input.adminNotes ?? null },
    });

    await tx.notification.create({
      data: {
        userId: request.userId,
        type: NotificationType.SYSTEM,
        title: "Product request declined",
        body: `We could not list “${request.title}” right now. Try another request or check back later.`,
        data: JSON.parse(
          JSON.stringify({
            requestId: request.id,
            href: "/marketplace",
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    return updated;
  });
}

/**
 * Mark an OPEN request as fulfilled after admin creates the marketplace product.
 * Notifies the requester with a deep link to the product page.
 */
export async function fulfillProductRequest(input: {
  adminId: string;
  requestId: string;
  productId: string;
  productName: string;
  productSlug: string;
}) {
  const request = await prisma.productRequest.findFirst({
    where: { id: input.requestId, deletedAt: null },
  });
  if (!request) throw new Error("PRODUCT_REQUEST_NOT_FOUND");
  if (request.status !== "OPEN") {
    // Already handled — still ok if admin recreates; skip duplicate notify.
    return request;
  }

  const href = `/marketplace/${input.productSlug}`;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.productRequest.update({
      where: { id: request.id },
      data: {
        status: "FULFILLED",
        fulfilledProductId: input.productId,
        reviewedById: input.adminId,
        reviewedAt: new Date(),
      },
    });

    await writeAdminLog(tx, {
      adminId: input.adminId,
      action: "PRODUCT_REQUEST_FULFILLED",
      targetType: "ProductRequest",
      targetId: request.id,
      metadata: {
        productId: input.productId,
        productSlug: input.productSlug,
      },
    });

    await tx.notification.create({
      data: {
        userId: request.userId,
        type: NotificationType.SYSTEM,
        title: "Your requested product is listed",
        body: `“${input.productName}” is now in the marketplace — you can purchase it.`,
        data: JSON.parse(
          JSON.stringify({
            requestId: request.id,
            productId: input.productId,
            slug: input.productSlug,
            href,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    return updated;
  });
}
