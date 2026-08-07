import { CoinIcon } from "@/components/shared/brand";
import { formatCoin, formatInr } from "@/utils/coin";
import { estimateInternalInr } from "@/features/plastic/services/coin-estimate";
import { cn } from "@/lib/utils";

interface CoinPreviewCardProps {
  estimatedCoins: number;
  className?: string;
  compact?: boolean;
}

/**
 * Provisional Nature Coin estimate — final amount after collector verification.
 */
export function CoinPreviewCard({
  estimatedCoins,
  className,
  compact = false,
}: CoinPreviewCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-900 dark:from-amber-950 dark:to-slate-900",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <CoinIcon size={22} />
        <p className="text-sm font-medium text-foreground">Estimated reward</p>
      </div>
      <p className="font-display mt-2 text-3xl font-bold coin-text">
        {formatCoin(estimatedCoins)}
      </p>
      {!compact ? (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal value ≈ {formatInr(estimateInternalInr(estimatedCoins))}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Provisional only. Final Nature Coins are calculated after collector
            verification of weight and quality.
          </p>
        </>
      ) : null}
    </div>
  );
}
