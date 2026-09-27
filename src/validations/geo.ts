import { z } from "zod";
import { PIN_CODE_REGEX } from "@/validations/plastic";

export const pincodeQuerySchema = z.object({
  pin: z.string().trim().regex(PIN_CODE_REGEX, "Enter a valid 6-digit PIN code"),
});

export const placeSearchQuerySchema = z.object({
  q: z.string().trim().min(3).max(120),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

/** Rough India bounding box — reverse lookups outside it are rejected. */
export const reverseGeocodeQuerySchema = z.object({
  lat: z.coerce.number().min(6).max(38),
  lng: z.coerce.number().min(68).max(98),
});
