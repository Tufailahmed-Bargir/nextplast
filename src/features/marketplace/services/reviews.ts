import "server-only";

import { prisma } from "@/prisma";
import { userHasPurchasedProduct } from "@/features/marketplace/services/orders";
import { assertMarketplaceEnabled } from "@/features/marketplace/services/marketplace-settings";

export async function createReview(input: {
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
}) {
  await assertMarketplaceEnabled();

  const purchased = await userHasPurchasedProduct(
    input.userId,
    input.productId,
  );
  if (!purchased) throw new Error("NOT_A_VERIFIED_BUYER");

  const product = await prisma.product.findFirst({
    where: { id: input.productId, deletedAt: null },
  });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  return prisma.review.upsert({
    where: {
      userId_productId: {
        userId: input.userId,
        productId: input.productId,
      },
    },
    create: {
      userId: input.userId,
      productId: input.productId,
      rating: input.rating,
      comment: input.comment,
    },
    update: {
      rating: input.rating,
      comment: input.comment,
    },
  });
}
