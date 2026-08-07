import { z } from "zod";

export const aiDetectBodySchema = z.object({
  listingId: z.string().cuid(),
  listingImageId: z.string().cuid().optional(),
  userCount: z.number().int().min(0).max(10_000).optional(),
});

export const aiFraudBodySchema = z.object({
  confidence: z.number().min(0).max(1),
  aiCount: z.number().int().min(0),
  userCount: z.number().int().min(0),
  isDuplicateImage: z.boolean().default(false),
  decision: z.enum(["ACCEPT", "MANUAL_REVIEW", "REJECT"]).optional(),
  estimatedWeightGrams: z.number().min(0).optional(),
  claimedWeightGrams: z.number().min(0).optional(),
  processingTimeMs: z.number().min(0).optional(),
});

export const aiRecommendBodySchema = z.object({
  limit: z.number().int().min(1).max(12).optional(),
});
