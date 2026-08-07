import { formatCoin, formatInr } from "@/utils/coin";
import { CoinIcon } from "@/components/shared/brand";

interface PriceDisplayProps {
  priceInr: number;
  priceCoins: number;
  hybridCashInr?: number | null;
  hybridCoins?: number | null;
  size?: "sm" | "lg";
}

export function PriceDisplay({
  priceInr,
  priceCoins,
  hybridCashInr,
  hybridCoins,
  size = "sm",
}: PriceDisplayProps) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <CoinIcon className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
          <span
            className={
              size === "lg"
                ? "font-display text-3xl font-bold"
                : "font-display text-lg font-bold"
            }
          >
            {formatCoin(priceCoins)}
          </span>
          <span className="text-sm text-muted-foreground">coins</span>
        </div>
        <span className="text-muted-foreground">or</span>
        <span className={size === "lg" ? "text-xl font-semibold" : "font-semibold"}>
          {formatInr(priceInr)}
        </span>
      </div>
      {hybridCashInr != null && hybridCoins != null ? (
        <p className="text-xs text-muted-foreground">
          Suggested hybrid: {formatCoin(hybridCoins)} coins +{" "}
          {formatInr(hybridCashInr)}
        </p>
      ) : null}
    </div>
  );
}
