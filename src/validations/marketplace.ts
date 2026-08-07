import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  addressLine1: z.string().min(5).max(240),
  addressLine2: z.string().max(240).optional(),
  city: z.string().min(2).max(80),
  pinCode: z.string().min(4).max(12),
  label: z.string().max(40).optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const cartAddSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).optional().default(1),
});

export const cartUpdateSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
});

export const wishlistToggleSchema = z.object({
  productId: z.string().min(1),
});

export const catalogQuerySchema = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(80).optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "coins", "rating", "popular", "eco"])
    .optional()
    .default("popular"),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minCoins: z.coerce.number().min(0).optional(),
  maxCoins: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minEco: z.coerce.number().int().min(0).max(100).optional(),
  inStock: z.coerce.boolean().optional(),
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(48).optional().default(24),
});

export const checkoutSchema = z.object({
  paymentMode: z.enum(["CASH", "COINS", "HYBRID"]),
  coinsToRedeem: z.number().min(0).max(1_000_000).optional(),
  deliveryMethod: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
  shippingAddress: shippingAddressSchema,
  saveAddress: z.boolean().optional().default(true),
  notes: z.string().max(500).optional(),
  checkoutId: z.string().min(8).max(80),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const adminProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  description: z.string().max(5000).optional(),
  categoryId: z.string().min(1),
  priceInr: z.number().positive().max(1_000_000),
  priceCoins: z.number().positive().max(1_000_000),
  hybridCashInr: z.number().min(0).max(1_000_000).optional(),
  hybridCoins: z.number().min(0).max(1_000_000).optional(),
  stock: z.number().int().min(0).max(1_000_000),
  ecoScore: z.number().int().min(0).max(100).optional(),
  materials: z.array(z.string().max(80)).max(20).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional().default(true),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(500).optional(),
});
