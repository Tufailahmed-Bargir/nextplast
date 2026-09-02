"use server";

import { revalidatePath } from "next/cache";
import { PaymentMode } from "@prisma/client";
import { AuthHttpError, requireAuth, requireAdmin } from "@/features/auth/services/guards";
import {
  adminProductSchema,
  cartAddSchema,
  cartUpdateSchema,
  checkoutSchema,
  createProductRequestSchema,
  reviewSchema,
  wishlistToggleSchema,
} from "@/validations/marketplace";
import { addToCart, removeFromCart, updateCartItem } from "@/features/marketplace/services/cart";
import {
  moveWishlistToCart,
  toggleWishlist,
} from "@/features/marketplace/services/wishlist";
import { placeOrder } from "@/features/marketplace/services/checkout";
import { createReview } from "@/features/marketplace/services/reviews";
import {
  seedStarterCatalogIfEmpty,
  upsertAdminProduct,
} from "@/features/marketplace/services/admin-catalog";
import { createProductRequest } from "@/features/marketplace/services/product-requests";
import { fulfillProductRequest } from "@/features/admin/services/admin-product-requests";
import { logger } from "@/utils/logger";

export type MarketActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

function mapError(error: unknown): string {
  if (error instanceof AuthHttpError) {
    if (error.code === "FORBIDDEN") return "Access denied.";
    if (error.code === "UNAUTHORIZED") return "Please sign in.";
  }
  const message = error instanceof Error ? error.message : "unknown";
  const map: Record<string, string> = {
    MARKETPLACE_DISABLED: "Marketplace is currently disabled.",
    PRODUCT_NOT_FOUND: "Product not found.",
    OUT_OF_STOCK: "This product is out of stock.",
    INSUFFICIENT_STOCK: "Not enough stock for that quantity.",
    CART_EMPTY: "Your cart is empty.",
    INSUFFICIENT_COINS: "Not enough Nature Coins in your wallet.",
    HYBRID_DISABLED: "Hybrid payments are disabled.",
    PAYMENT_FAILED: "Payment could not be recorded.",
    NOT_A_VERIFIED_BUYER: "Only verified buyers can review this product.",
    WALLET_NOT_FOUND: "Wallet not found. Earn coins by recycling first.",
    DUPLICATE_SPEND: "Payment already processed. Refresh and check orders.",
    INVALID_CHECKOUT: "Invalid checkout session. Please retry.",
    PRODUCT_REQUEST_NOT_FOUND: "Product request not found.",
    PRODUCT_REQUEST_NOT_OPEN: "This request is no longer open.",
  };
  return map[message] ?? "Something went wrong. Please try again.";
}

function revalidateMarket() {
  revalidatePath("/marketplace");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/wishlist");
  revalidatePath("/orders");
  revalidatePath("/wallet");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  revalidatePath("/admin/products");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/product-requests");
}

export async function addToCartAction(
  raw: unknown,
): Promise<MarketActionResult<{ itemCount: number }>> {
  try {
    const user = await requireAuth();
    const parsed = cartAddSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid cart item." };
    const cart = await addToCart({
      userId: user.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity ?? 1,
    });
    revalidateMarket();
    return {
      success: true,
      data: { itemCount: cart.itemCount },
      message: "Added to cart.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function updateCartAction(
  raw: unknown,
): Promise<MarketActionResult<{ itemCount: number }>> {
  try {
    const user = await requireAuth();
    const parsed = cartUpdateSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid quantity." };
    const cart = await updateCartItem({
      userId: user.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    });
    revalidateMarket();
    return { success: true, data: { itemCount: cart.itemCount } };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function removeCartAction(
  productId: string,
): Promise<MarketActionResult<{ ok: true }>> {
  try {
    const user = await requireAuth();
    await removeFromCart(user.id, productId);
    revalidateMarket();
    return { success: true, data: { ok: true }, message: "Removed from cart." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function toggleWishlistAction(
  raw: unknown,
): Promise<MarketActionResult<{ wished: boolean }>> {
  try {
    const user = await requireAuth();
    const parsed = wishlistToggleSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid product." };
    const result = await toggleWishlist(user.id, parsed.data.productId);
    revalidateMarket();
    return {
      success: true,
      data: result,
      message: result.wished ? "Saved to wishlist." : "Removed from wishlist.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function moveWishlistToCartAction(
  productId: string,
): Promise<MarketActionResult<{ ok: true }>> {
  try {
    const user = await requireAuth();
    await moveWishlistToCart(user.id, productId);
    revalidateMarket();
    return { success: true, data: { ok: true }, message: "Moved to cart." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function placeOrderAction(
  raw: unknown,
): Promise<MarketActionResult<{ orderId: string }>> {
  try {
    const user = await requireAuth();
    const parsed = checkoutSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid checkout.",
      };
    }

    const order = await placeOrder({
      userId: user.id,
      paymentMode: parsed.data.paymentMode as PaymentMode,
      coinsToRedeem: parsed.data.coinsToRedeem,
      deliveryMethod: parsed.data.deliveryMethod,
      shippingAddress: parsed.data.shippingAddress,
      saveAddress: parsed.data.saveAddress,
      notes: parsed.data.notes,
      checkoutId: parsed.data.checkoutId,
    });

    revalidateMarket();
    revalidatePath(`/orders/${order.id}`);
    return {
      success: true,
      data: { orderId: order.id },
      message: "Order placed successfully.",
    };
  } catch (error) {
    logger.error("placeOrder failed", { error }, "marketplace");
    return { success: false, error: mapError(error) };
  }
}

export async function submitReviewAction(
  raw: unknown,
): Promise<MarketActionResult<{ ok: true }>> {
  try {
    const user = await requireAuth();
    const parsed = reviewSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid review." };
    await createReview({
      userId: user.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });
    revalidateMarket();
    return { success: true, data: { ok: true }, message: "Review submitted." };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function createProductRequestAction(
  raw: unknown,
): Promise<MarketActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const parsed = createProductRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid request.",
      };
    }
    const request = await createProductRequest({
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
    });
    revalidatePath("/admin/product-requests");
    return {
      success: true,
      data: { id: request.id },
      message: "Request sent. We’ll notify you when it’s listed.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function upsertAdminProductAction(
  raw: unknown,
): Promise<MarketActionResult<{ id: string; slug: string }>> {
  try {
    const admin = await requireAdmin();
    const parsed = adminProductSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid product.",
      };
    }
    const { requestId, ...productInput } = parsed.data;
    const product = await upsertAdminProduct({
      adminId: admin.id,
      ...productInput,
    });

    if (requestId && !productInput.id) {
      await fulfillProductRequest({
        adminId: admin.id,
        requestId,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
      });
    }

    revalidateMarket();
    return {
      success: true,
      data: { id: product.id, slug: product.slug },
      message: productInput.id
        ? "Product updated."
        : requestId
          ? "Product created and requester notified."
          : "Product created.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function seedMarketplaceCatalogAction(): Promise<
  MarketActionResult<{ seeded: boolean; count: number }>
> {
  try {
    const admin = await requireAdmin();
    const result = await seedStarterCatalogIfEmpty(admin.id);
    revalidateMarket();
    return {
      success: true,
      data: result,
      message: result.seeded
        ? "Starter catalog seeded."
        : "Catalog already has products.",
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}
