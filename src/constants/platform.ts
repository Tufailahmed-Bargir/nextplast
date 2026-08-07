import { natureCoinConfig } from "@/config/app";

/**
 * Nature Coin economy constants (from NexPlast documentation — Updated Coin System).
 */
export const NATURE_COIN = {
  GRAMS_PER_COIN: natureCoinConfig.gramsPerCoin,
  INTERNAL_VALUE_INR: natureCoinConfig.internalValueInr,
  CASH_CONVERTIBLE: natureCoinConfig.cashConvertible,
} as const;

/** Plastic types supported by the platform */
export const PLASTIC_TYPES = [
  "PET",
  "HDPE",
  "PP",
  "LDPE",
  "PVC",
  "PS",
  "OTHER",
] as const;

export type PlasticType = (typeof PLASTIC_TYPES)[number];

/** Quality multipliers for coin rewards */
export const QUALITY_MULTIPLIERS = {
  clean: 1.2,
  mixed: 1.0,
  contaminated: 0.7,
} as const;

export type PlasticQuality = keyof typeof QUALITY_MULTIPLIERS;

/**
 * Environmental impact factors used when collector verification completes.
 * Tuned for college-project clarity; replace with research-backed rates later.
 */
export const IMPACT_FACTORS = {
  /** kg CO₂ avoided per kg plastic recycled */
  co2KgPerKgPlastic: 1.5,
  /** trees saved equivalent per kg plastic */
  treesPerKgPlastic: 0.02,
  /** liters water saved per kg plastic */
  waterLitersPerKgPlastic: 20,
  /** kWh energy saved per kg plastic */
  energyKwhPerKgPlastic: 5,
  /** liters oil equivalent saved per kg plastic */
  oilLitersPerKgPlastic: 1.8,
} as const;

/** Gamification levels */
export const GAMIFICATION_LEVELS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
] as const;

export type GamificationLevel = (typeof GAMIFICATION_LEVELS)[number];

/** Marketplace hybrid payment modes */
export const PAYMENT_MODES = ["CASH", "COINS", "HYBRID"] as const;

export type PaymentMode = (typeof PAYMENT_MODES)[number];
