"use client";

import { useMemo } from "react";
import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinIcon } from "@/components/shared/brand";
import { formatCoin, formatInr } from "@/utils/coin";
import {
  maxCoinsForCashTotal,
  previewCheckoutTotals,
} from "@/features/marketplace/lib/pricing";
import { PaymentMode } from "@prisma/client";

interface HybridPriceSelectorProps {
  /** Merchandise subtotal only — shipping is never coin-redeemable. */
  merchandiseInr: number;
  listCoins: number;
  shippingInr: number;
  walletBalance: number;
  allowHybrid: boolean;
  value: {
    mode: "CASH" | "COINS" | "HYBRID";
    coinsToRedeem: number;
  };
  onChange: (next: {
    mode: "CASH" | "COINS" | "HYBRID";
    coinsToRedeem: number;
  }) => void;
}

export function HybridPriceSelector({
  merchandiseInr,
  listCoins,
  shippingInr,
  walletBalance,
  allowHybrid,
  value,
  onChange,
}: HybridPriceSelectorProps) {
  const maxUseful = maxCoinsForCashTotal(merchandiseInr);
  const maxRedeemable = Math.min(maxUseful, walletBalance, listCoins);

  const preview = useMemo(() => {
    try {
      return previewCheckoutTotals({
        mode: value.mode as PaymentMode,
        merchandiseInr,
        listCoins,
        coinsToRedeem: value.coinsToRedeem,
        walletBalance,
        allowHybrid,
        shippingInr,
      });
    } catch {
      return {
        coinAmount: 0,
        merchandiseCashInr: merchandiseInr,
        shippingInr,
        cashAmountInr: merchandiseInr + shippingInr,
      };
    }
  }, [
    value,
    merchandiseInr,
    listCoins,
    walletBalance,
    allowHybrid,
    shippingInr,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["COINS", "All coins"],
              ["CASH", "All cash"],
              ...(allowHybrid ? ([["HYBRID", "Hybrid"]] as const) : []),
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() =>
                onChange({
                  mode,
                  coinsToRedeem:
                    mode === "HYBRID"
                      ? Math.min(
                          maxRedeemable,
                          value.coinsToRedeem || listCoins,
                        )
                      : mode === "COINS"
                        ? listCoins
                        : 0,
                })
              }
              className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                value.mode === mode
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {value.mode === "COINS" ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <CoinIcon className="h-5 w-5" /> Pay with Nature Coins
            </div>
            <p className="text-sm text-muted-foreground">
              Wallet: {formatCoin(walletBalance)} · Products:{" "}
              {formatCoin(listCoins)} coins
            </p>
            {shippingInr > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Shipping {formatInr(shippingInr)} is paid in cash.
              </p>
            ) : null}
            {walletBalance < listCoins ? (
              <p className="mt-2 text-sm text-destructive">
                Insufficient coins — choose cash or hybrid.
              </p>
            ) : null}
          </div>
        ) : null}

        {value.mode === "CASH" ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="font-semibold">Pay with cash / UPI</p>
            <p className="text-sm text-muted-foreground">
              Total due: {formatInr(merchandiseInr + shippingInr)}{" "}
              (gateway-ready via PaymentProvider)
            </p>
          </div>
        ) : null}

        {value.mode === "HYBRID" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Coins to redeem (merchandise)</span>
              <span className="flex items-center gap-1 font-bold">
                <CoinIcon className="h-4 w-4" />
                {formatCoin(value.coinsToRedeem)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, maxRedeemable)}
              step={1}
              value={Math.min(value.coinsToRedeem, maxRedeemable)}
              onChange={(e) =>
                onChange({
                  mode: "HYBRID",
                  coinsToRedeem: Number(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="space-y-1 rounded-xl bg-muted/40 p-3 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Coins portion</span>
                <span>{formatCoin(preview.coinAmount)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Merchandise cash</span>
                <span>{formatInr(preview.merchandiseCashInr)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Shipping (cash)</span>
                <span>
                  {shippingInr === 0 ? "Free" : formatInr(shippingInr)}
                </span>
              </p>
              <p className="flex justify-between font-semibold">
                <span>Cash due</span>
                <span>{formatInr(preview.cashAmountInr)}</span>
              </p>
            </div>
          </div>
        ) : null}

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Leaf className="h-3.5 w-3.5 text-emerald-600" />1 Nature Coin ≈ ₹0.50
          internal value · shipping is always cash
        </p>
      </CardContent>
    </Card>
  );
}

export function PaymentSelector(props: HybridPriceSelectorProps) {
  return <HybridPriceSelector {...props} />;
}
