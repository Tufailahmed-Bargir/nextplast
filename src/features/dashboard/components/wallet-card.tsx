import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinIcon } from "@/components/shared/brand";
import { buttonVariants } from "@/components/ui/button";
import { coinsToInternalInr, formatCoin, formatInr } from "@/utils/coin";
import { cn } from "@/lib/utils";
import type { WalletSummary } from "@/features/dashboard/types";

interface WalletCardProps {
  wallet: WalletSummary;
  compact?: boolean;
}

/**
 * Nature Coin wallet summary — available, pending, earned, spent.
 */
export function WalletCard({ wallet, compact = false }: WalletCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CoinIcon size={22} />
          <CardTitle className="text-white">Nature Wallet</CardTitle>
        </div>
        {!compact ? (
          <Link
            href="/wallet"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-white/40 bg-transparent text-white hover:bg-white/10",
            )}
          >
            Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div>
          <p className="text-sm text-amber-100">Available balance</p>
          <p className="font-display text-3xl font-bold">
            {formatCoin(wallet.availableBalance)}
          </p>
          <p className="text-sm text-amber-100">
            ≈ {formatInr(coinsToInternalInr(wallet.availableBalance))} internal value
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-amber-100">Pending</p>
            <p className="font-semibold">{formatCoin(wallet.pendingBalance)}</p>
          </div>
          <div>
            <p className="text-amber-100">Earned</p>
            <p className="font-semibold">{formatCoin(wallet.earnedTotal)}</p>
          </div>
          <div>
            <p className="text-amber-100">Spent</p>
            <p className="font-semibold">{formatCoin(wallet.spentTotal)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
