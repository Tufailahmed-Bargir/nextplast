import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/validations/plastic";

export const COLLECTOR_OTP_LENGTH = 6;
export const MAX_OTP_ATTEMPTS = 5;

export { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES };

export const assignPickupSchema = z.object({
  pickupId: z.string().min(1),
  collectorId: z.string().min(1),
});

export type AssignPickupInput = z.infer<typeof assignPickupSchema>;

export const verifyOtpSchema = z.object({
  pickupId: z.string().min(1),
  otp: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${COLLECTOR_OTP_LENGTH}}$`), {
      message: `Enter the ${COLLECTOR_OTP_LENGTH}-digit OTP`,
    }),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const completeVerificationSchema = z.object({
  pickupId: z.string().min(1),
  actualQuantity: z.number().int().min(0).max(50_000),
  actualWeightGrams: z
    .number()
    .int()
    .min(100, "Minimum verified weight is 100 g")
    .max(200_000, "Maximum verified weight is 200 kg"),
  verifiedQuality: z.enum(["CLEAN", "MIXED", "CONTAMINATED"]),
  notes: z.string().max(2000).optional(),
  customerConfirmed: z.boolean(),
  proofImageUrl: z.string().url().optional(),
  proofPublicId: z.string().min(1).optional(),
});

export type CompleteVerificationInput = z.infer<
  typeof completeVerificationSchema
>;

export const toggleDutySchema = z.object({
  isOnDuty: z.boolean(),
});
