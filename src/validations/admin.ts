import { z } from "zod";

export const setUserActiveSchema = z.object({
  userId: z.string().min(1),
  isActive: z.boolean(),
});

export const setCollectorVerificationSchema = z.object({
  collectorId: z.string().min(1),
  verificationStatus: z.enum(["PENDING", "APPROVED", "SUSPENDED"]),
  isOnDuty: z.boolean().optional(),
  zone: z.string().max(80).optional(),
});

export const setRecyclerVerificationSchema = z.object({
  recyclerId: z.string().min(1),
  verificationStatus: z.enum(["PENDING", "APPROVED", "SUSPENDED"]),
  companyName: z.string().min(2).max(120).optional(),
});

export const reviewListingSchema = z.object({
  listingId: z.string().min(1),
  decision: z.enum(["APPROVE", "KEEP_REVIEW", "REJECT"]),
  notes: z.string().max(1000).optional(),
});

export const walletAdjustSchema = z.object({
  userId: z.string().min(1),
  amount: z
    .number()
    .refine((n) => n !== 0, "Amount cannot be zero")
    .refine((n) => Math.abs(n) <= 100_000, "Adjustment too large"),
  reason: z
    .string()
    .trim()
    .min(5, "Reason must be at least 5 characters (for audit log)")
    .max(500, "Reason is too long"),
});

export const inventoryAdjustSchema = z.object({
  inventoryId: z.string().min(1),
  deltaGrams: z
    .number()
    .int()
    .refine((n) => n !== 0, "Delta cannot be zero")
    .refine((n) => Math.abs(n) <= 1_000_000, "Delta too large"),
  notes: z.string().max(500).optional(),
});

export const SETTING_KEYS = {
  general: "admin.general",
  marketplace: "admin.marketplace",
  wallet: "admin.wallet",
  notifications: "admin.notifications",
} as const;

export const SETTING_KEY_VALUES = [
  SETTING_KEYS.general,
  SETTING_KEYS.marketplace,
  SETTING_KEYS.wallet,
  SETTING_KEYS.notifications,
] as const;

export const upsertSettingSchema = z.object({
  key: z.enum(SETTING_KEY_VALUES),
  label: z.string().max(120).optional(),
  value: z.record(z.string(), z.unknown()),
});

export const productToggleSchema = z.object({
  productId: z.string().min(1),
  isActive: z.boolean(),
});

export const adminSearchSchema = z.object({
  q: z.string().min(2).max(100),
});
