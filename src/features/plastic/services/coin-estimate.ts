/**
 * Nature Coin estimate for plastic listings (docs + platform constants).
 */
import {
  NATURE_COIN,
  QUALITY_MULTIPLIERS,
  type PlasticQuality,
} from "@/constants/platform";
import { gramsToCoins } from "@/utils/coin";

const QUALITY_KEY: Record<string, PlasticQuality> = {
  CLEAN: "clean",
  MIXED: "mixed",
  CONTAMINATED: "contaminated",
  clean: "clean",
  mixed: "mixed",
  contaminated: "contaminated",
};

export function qualityMultiplier(quality: string): number {
  const key = QUALITY_KEY[quality] ?? "mixed";
  return QUALITY_MULTIPLIERS[key];
}

/**
 * Provisional coin estimate — final amount set after collector verification.
 */
export function estimateNatureCoins(input: {
  weightGrams: number;
  quality: string;
}): number {
  const base = gramsToCoins(Math.max(0, input.weightGrams));
  const coins = base * qualityMultiplier(input.quality);
  return Math.round(coins * 10000) / 10000;
}

export function estimateInternalInr(coins: number): number {
  return coins * NATURE_COIN.INTERNAL_VALUE_INR;
}
