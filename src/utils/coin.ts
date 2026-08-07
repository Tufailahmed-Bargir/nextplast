import { NATURE_COIN } from "@/constants/platform";

/**
 * Nature Coin & currency formatting utilities.
 * Source of truth: Updated Nature Coin System in platform documentation.
 */

/** Convert grams of plastic to Nature Coins (base rate, before quality multipliers). */
export function gramsToCoins(grams: number): number {
  return grams / NATURE_COIN.GRAMS_PER_COIN;
}

/** Convert kilograms to Nature Coins. */
export function kgToCoins(kg: number): number {
  return gramsToCoins(kg * 1000);
}

/** Internal INR reward value of coins (not cash-convertible). */
export function coinsToInternalInr(coins: number): number {
  return coins * NATURE_COIN.INTERNAL_VALUE_INR;
}

/**
 * Marketplace coin price from INR using the official rate
 * (1 coin ≈ ₹0.50 ⇒ ₹100 = 200 coins).
 */
export function inrToNatureCoins(priceInr: number): number {
  if (!Number.isFinite(priceInr) || priceInr <= 0) return 0;
  return Math.round(priceInr / NATURE_COIN.INTERNAL_VALUE_INR);
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

export function formatCoin(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`;
  }
  return `${grams} g`;
}
