import { z } from "zod";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_LISTING = 6;

export const plasticDetailsSchema = z.object({
  listingId: z.string().min(1),
  quality: z.enum(["CLEAN", "MIXED", "CONTAMINATED"]),
  claimedWeightGrams: z
    .number()
    .int()
    .min(100, "Minimum weight is 100 g")
    .max(200_000, "Maximum weight is 200 kg"),
  items: z
    .array(
      z.object({
        categoryId: z.string().min(1),
        claimedQuantity: z.number().int().min(0).max(10_000),
        claimedWeightGrams: z.number().int().min(0).max(200_000).optional(),
      }),
    )
    .min(1, "Add at least one plastic category"),
  notes: z.string().max(1000).optional(),
});

export type PlasticDetailsInput = z.infer<typeof plasticDetailsSchema>;

export const pickupDetailsSchema = z.object({
  listingId: z.string().min(1),
  address: z.string().min(8, "Enter a full pickup address").max(500),
  scheduledAt: z.coerce.date(),
  specialInstructions: z.string().max(1000).optional(),
});

export type PickupDetailsInput = z.infer<typeof pickupDetailsSchema>;

export const reviewDetectionsSchema = z.object({
  listingId: z.string().min(1),
  edits: z.array(
    z.object({
      detectionId: z.string().min(1),
      userConfirmedCount: z.number().int().min(0).max(10_000),
      userConfirmedClass: z.string().min(1).max(40),
    }),
  ),
});

export type ReviewDetectionsInput = z.infer<typeof reviewDetectionsSchema>;
