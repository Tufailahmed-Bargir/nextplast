import "server-only";

import { prisma } from "@/prisma";

/**
 * User-submitted marketplace product requests.
 */
export async function createProductRequest(input: {
  userId: string;
  title: string;
  description: string;
}) {
  return prisma.productRequest.create({
    data: {
      userId: input.userId,
      title: input.title.trim(),
      description: input.description.trim(),
      status: "OPEN",
    },
  });
}

export async function getProductRequestById(id: string) {
  return prisma.productRequest.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      fulfilledProduct: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}
