import { z } from "zod";
import { INDIAN_STATES } from "@/constants/indian-states";

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

export const PIN_CODE_REGEX = /^[1-9][0-9]{5}$/;

const JUNK_WORDS = new Set([
  "test",
  "testing",
  "asdf",
  "qwerty",
  "abc",
  "xyz",
  "na",
  "n/a",
  "none",
  "nil",
  "null",
  "address",
  "home",
]);

function countLetters(value: string): number {
  return value.match(/\p{L}/gu)?.length ?? 0;
}

function isJunk(value: string): boolean {
  const compact = value.trim().toLowerCase();
  return JUNK_WORDS.has(compact) || /^(.)\1+$/u.test(compact.replace(/\s/g, ""));
}

export const pickupAddressSchema = z.object({
  house: z
    .string()
    .trim()
    .min(1, "Enter house / flat number")
    .max(120),
  street: z
    .string()
    .trim()
    .min(3, "Enter street / area")
    .max(200)
    .refine((v) => countLetters(v) >= 3, "Street / area must include a name, not just numbers")
    .refine((v) => !isJunk(v), "Enter a real street or area name"),
  landmark: z.string().trim().max(120),
  city: z
    .string()
    .trim()
    .min(2, "Enter city")
    .max(80)
    .regex(/^\p{L}[\p{L} .'-]*$/u, "City should contain letters only")
    .refine((v) => !isJunk(v), "Enter a real city name"),
  state: z.enum(INDIAN_STATES, { message: "Select a state" }),
  pinCode: z
    .string()
    .trim()
    .regex(PIN_CODE_REGEX, "Enter a valid 6-digit PIN code"),
});

export type PickupAddressInput = z.infer<typeof pickupAddressSchema>;

export const pickupDetailsSchema = z.object({
  listingId: z.string().min(1),
  addressParts: pickupAddressSchema,
  latitude: z.number().min(6).max(38).nullable().optional(),
  longitude: z.number().min(68).max(98).nullable().optional(),
  scheduledAt: z.coerce.date(),
  specialInstructions: z.string().max(1000).optional(),
});

export type PickupDetailsInput = z.infer<typeof pickupDetailsSchema>;

export const updatePickupAddressSchema = z.object({
  listingId: z.string().min(1),
  addressParts: pickupAddressSchema,
  latitude: z.number().min(6).max(38).nullable().optional(),
  longitude: z.number().min(68).max(98).nullable().optional(),
});

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
