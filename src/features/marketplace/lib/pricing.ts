import { natureCoinConfig } from "@/config/app";
import { PaymentMode } from "@prisma/client";

/**
 * Client + server safe Nature Coin pricing helpers.
 * Shipping is always cash — never pass shipping into merchandise totals.
 */

export function coinsToCashCredit(coins: number): number {
  return Number((coins * natureCoinConfig.internalValueInr).toFixed(2));
}

export function maxCoinsForCashTotal(totalInr: number): number {
  if (totalInr <= 0) return 0;
  return Math.floor(totalInr / natureCoinConfig.internalValueInr);
}

export type PaymentSplit = {
  mode: PaymentMode;
  coinAmount: number;
  /** Cash for merchandise only (shipping added by caller). */
  cashAmountInr: number;
  totalInr: number;
  listCoins: number;
};

/**
 * Compute merchandise payment split.
 * @param totalInr Merchandise subtotal only (exclude shipping).
 * @param listCoins Sum of product coin list prices × qty.
 */
export function computePaymentSplit(input: {
  mode: PaymentMode;
  totalInr: number;
  listCoins: number;
  coinsToRedeem?: number;
  walletBalance: number;
  allowHybrid: boolean;
}): PaymentSplit {
  const totalInr = Math.max(0, Number(input.totalInr.toFixed(2)));
  const listCoins = Math.max(0, Number(input.listCoins.toFixed(4)));

  if (input.mode === PaymentMode.CASH) {
    return {
      mode: PaymentMode.CASH,
      coinAmount: 0,
      cashAmountInr: totalInr,
      totalInr,
      listCoins,
    };
  }

  if (input.mode === PaymentMode.COINS) {
    if (input.walletBalance < listCoins) {
      throw new Error("INSUFFICIENT_COINS");
    }
    return {
      mode: PaymentMode.COINS,
      coinAmount: listCoins,
      cashAmountInr: 0,
      totalInr,
      listCoins,
    };
  }

  if (!input.allowHybrid) {
    throw new Error("HYBRID_DISABLED");
  }

  // Cap by cash-equivalent, wallet, AND list coin price so hybrid cannot undercut COINS.
  const maxUseful = maxCoinsForCashTotal(totalInr);
  const requested = Math.max(0, input.coinsToRedeem ?? 0);
  const coinAmount = Math.min(
    requested,
    maxUseful,
    listCoins,
    Math.floor(input.walletBalance * 10000) / 10000,
  );
  const cashAmountInr = Math.max(
    0,
    Number((totalInr - coinsToCashCredit(coinAmount)).toFixed(2)),
  );

  if (coinAmount > input.walletBalance) {
    throw new Error("INSUFFICIENT_COINS");
  }

  return {
    mode: PaymentMode.HYBRID,
    coinAmount,
    cashAmountInr,
    totalInr,
    listCoins,
  };
}

export function shippingChargeInr(method: "STANDARD" | "EXPRESS"): number {
  return method === "EXPRESS" ? 79 : 0;
}

/** Preview totals for checkout UI (merchandise split + shipping cash). */
export function previewCheckoutTotals(input: {
  mode: PaymentMode;
  merchandiseInr: number;
  listCoins: number;
  coinsToRedeem: number;
  walletBalance: number;
  allowHybrid: boolean;
  shippingInr: number;
}) {
  const split = computePaymentSplit({
    mode: input.mode,
    totalInr: input.merchandiseInr,
    listCoins: input.listCoins,
    coinsToRedeem: input.coinsToRedeem,
    walletBalance: input.walletBalance,
    allowHybrid: input.allowHybrid,
  });
  return {
    coinAmount: split.coinAmount,
    merchandiseCashInr: split.cashAmountInr,
    shippingInr: input.shippingInr,
    cashAmountInr: Number(
      (split.cashAmountInr + input.shippingInr).toFixed(2),
    ),
  };
}
