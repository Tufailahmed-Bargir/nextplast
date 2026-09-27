"use server";

import { revalidatePath } from "next/cache";
import { PlasticQuality } from "@prisma/client";
import {
  AuthHttpError,
  requireRoles,
} from "@/features/auth/services/guards";
import { rolePermissions } from "@/features/auth/services/permissions";
import {
  createDraftListing,
  deleteListingImage,
  getListingForUser,
  listUserListings,
  runListingAiDetection,
  saveDetectionEdits,
  savePickupDetails,
  savePlasticDetails,
  serializeSellListing,
  submitListing,
  updatePickupAddress,
  uploadListingImages,
} from "@/features/plastic/services/listing-service";
import { ensurePlasticCategories } from "@/features/plastic/services/categories";
import {
  pickupDetailsSchema,
  plasticDetailsSchema,
  reviewDetectionsSchema,
  updatePickupAddressSchema,
} from "@/validations/plastic";
import { sniffImageMime } from "@/features/ai/services/plastic-detector";
import { lookupPincode } from "@/features/geo/services/geo-service";
import { composeAddress } from "@/features/geo/lib/address";
import { logger } from "@/utils/logger";

export type SellActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

function mapError(error: unknown): string {
  if (error instanceof AuthHttpError) {
    if (error.code === "FORBIDDEN") {
      return "You do not have permission to sell plastic.";
    }
    if (error.code === "UNAUTHORIZED") {
      return "Please sign in again.";
    }
  }
  const message = error instanceof Error ? error.message : "unknown";
  const map: Record<string, string> = {
    LISTING_NOT_FOUND: "Listing not found.",
    LISTING_LOCKED: "This listing can no longer be edited.",
    TOO_MANY_IMAGES: "You can upload up to 6 images per listing.",
    INVALID_IMAGE_TYPE: "Only JPEG, PNG, and WEBP images are allowed.",
    IMAGE_TOO_LARGE: "Each image must be under 10 MB.",
    NO_IMAGES: "Upload at least one plastic photo first.",
    AI_REQUIRED: "Run AI detection before submitting.",
    DETAILS_REQUIRED: "Complete plastic details before submitting.",
    PICKUP_REQUIRED: "Add pickup address and schedule before submitting.",
    PICKUP_IN_PAST: "Pickup time must be in the future.",
    PICKUP_ADDRESS_LOCKED:
      "This pickup is already completed or cancelled, so the address can't be changed.",
    IMAGE_FETCH_FAILED: "Could not read an uploaded image for AI analysis.",
    INVALID_CATEGORY: "Select a valid plastic category.",
  };
  return map[message] ?? "Something went wrong. Please try again.";
}

async function requireSellUser() {
  return requireRoles(rolePermissions.sell);
}

function revalidateSellPaths() {
  revalidatePath("/sell");
  revalidatePath("/listings");
  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
}

export async function startSellListingAction(): Promise<
  SellActionResult<{ listingId: string }>
> {
  try {
    const user = await requireSellUser();
    const listing = await createDraftListing(user.id);
    return { success: true, data: { listingId: listing.id } };
  } catch (error) {
    logger.error("startSellListing failed", { error }, "plastic");
    return { success: false, error: mapError(error) };
  }
}

export async function getSellListingAction(
  listingId: string,
): Promise<
  SellActionResult<ReturnType<typeof serializeSellListing>>
> {
  try {
    const user = await requireSellUser();
    const listing = await getListingForUser(listingId, user.id);
    if (!listing) return { success: false, error: "Listing not found." };
    return { success: true, data: serializeSellListing(listing) };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function getPlasticCategoriesAction() {
  await requireSellUser();
  const categories = await ensurePlasticCategories();
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    resinType: c.resinType,
  }));
}

export async function uploadListingImagesAction(
  formData: FormData,
): Promise<SellActionResult<{ uploaded: number }>> {
  try {
    const user = await requireSellUser();
    const listingId = String(formData.get("listingId") ?? "");
    if (!listingId) return { success: false, error: "Missing listing id." };

    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return { success: false, error: "Select at least one image." };
    }

    const prepared = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const sniffed = sniffImageMime(buffer);
        return {
          buffer,
          mimeType: sniffed ?? file.type,
          fileName: file.name,
        };
      }),
    );

    await uploadListingImages({
      userId: user.id,
      listingId,
      files: prepared,
    });

    revalidateSellPaths();
    return { success: true, data: { uploaded: prepared.length } };
  } catch (error) {
    logger.error("uploadListingImages failed", { error }, "plastic");
    return { success: false, error: mapError(error) };
  }
}

export async function removeListingImageAction(input: {
  listingId: string;
  imageId: string;
}): Promise<SellActionResult<{ ok: true }>> {
  try {
    const user = await requireSellUser();
    await deleteListingImage({
      userId: user.id,
      listingId: input.listingId,
      imageId: input.imageId,
    });
    revalidateSellPaths();
    return { success: true, data: { ok: true } };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function runAiDetectionAction(
  listingId: string,
): Promise<SellActionResult<{ listingId: string }>> {
  try {
    const user = await requireSellUser();
    await runListingAiDetection({ userId: user.id, listingId, force: false });
    revalidateSellPaths();
    return {
      success: true,
      data: { listingId },
      message: "AI detection complete.",
    };
  } catch (error) {
    logger.error("runAiDetection failed", { error }, "plastic");
    return { success: false, error: mapError(error) };
  }
}

export async function saveDetectionEditsAction(
  raw: unknown,
): Promise<SellActionResult<{ ok: true }>> {
  try {
    const user = await requireSellUser();
    const parsed = reviewDetectionsSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: "Invalid detection edits." };
    }
    await saveDetectionEdits({
      userId: user.id,
      listingId: parsed.data.listingId,
      edits: parsed.data.edits,
    });
    return { success: true, data: { ok: true } };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function savePlasticDetailsAction(
  raw: unknown,
): Promise<SellActionResult<{ estimatedCoins: number }>> {
  try {
    const user = await requireSellUser();
    const parsed = plasticDetailsSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid plastic details.",
      };
    }

    const listing = await savePlasticDetails({
      userId: user.id,
      listingId: parsed.data.listingId,
      quality: parsed.data.quality as PlasticQuality,
      claimedWeightGrams: parsed.data.claimedWeightGrams,
      notes: parsed.data.notes,
      items: parsed.data.items,
    });

    return {
      success: true,
      data: { estimatedCoins: Number(listing?.estimatedCoins ?? 0) },
    };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

/** India Post check; lookup outages are allowed through. */
async function checkPinMatchesState(parts: {
  pinCode: string;
  state: string;
}): Promise<string | null> {
  const pin = await lookupPincode(parts.pinCode);
  if (pin.status === "not_found") {
    return `PIN code ${parts.pinCode} was not found. Please check it.`;
  }
  if (pin.status === "found" && pin.state && pin.state !== parts.state) {
    return `PIN code ${parts.pinCode} belongs to ${pin.state}, not ${parts.state}.`;
  }
  return null;
}

export async function savePickupDetailsAction(
  raw: unknown,
): Promise<SellActionResult<{ ok: true }>> {
  try {
    const user = await requireSellUser();
    const parsed = pickupDetailsSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid pickup details.",
      };
    }

    const parts = parsed.data.addressParts;
    const pinError = await checkPinMatchesState(parts);
    if (pinError) return { success: false, error: pinError };

    await savePickupDetails({
      userId: user.id,
      listingId: parsed.data.listingId,
      address: composeAddress(parts),
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      scheduledAt: parsed.data.scheduledAt,
      specialInstructions: parsed.data.specialInstructions,
    });

    return { success: true, data: { ok: true } };
  } catch (error) {
    return { success: false, error: mapError(error) };
  }
}

export async function updatePickupAddressAction(
  raw: unknown,
): Promise<SellActionResult<{ ok: true }>> {
  try {
    const user = await requireSellUser();
    const parsed = updatePickupAddressSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid pickup address.",
      };
    }

    const parts = parsed.data.addressParts;
    const pinError = await checkPinMatchesState(parts);
    if (pinError) return { success: false, error: pinError };

    await updatePickupAddress({
      userId: user.id,
      listingId: parsed.data.listingId,
      address: composeAddress(parts),
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    });

    revalidatePath(`/sell/${parsed.data.listingId}`);
    revalidateSellPaths();
    revalidatePath("/admin", "layout");
    revalidatePath("/collector", "layout");

    return { success: true, data: { ok: true }, message: "Pickup address updated." };
  } catch (error) {
    logger.error("updatePickupAddress failed", { error }, "plastic");
    return { success: false, error: mapError(error) };
  }
}

export async function submitListingAction(
  listingId: string,
): Promise<SellActionResult<{ listingId: string }>> {
  try {
    const user = await requireSellUser();
    await submitListing({ userId: user.id, listingId });
    revalidateSellPaths();
    return {
      success: true,
      data: { listingId },
      message: "Listing submitted. Awaiting collector assignment.",
    };
  } catch (error) {
    logger.error("submitListing failed", { error }, "plastic");
    return { success: false, error: mapError(error) };
  }
}

export async function listMyListingsAction() {
  const user = await requireSellUser();
  return listUserListings(user.id);
}
