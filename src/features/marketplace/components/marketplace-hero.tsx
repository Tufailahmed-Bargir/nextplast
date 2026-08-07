import Link from "next/link";
import { Leaf, Recycle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CoinIcon } from "@/components/shared/brand";
import { cn } from "@/lib/utils";
import { formatCoin } from "@/utils/coin";

interface MarketplaceHeroProps {
  coinBalance?: number;
  authenticated: boolean;
}

export function MarketplaceHero({
  coinBalance = 0,
  authenticated,
}: MarketplaceHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-800 px-6 py-10 text-white sm:px-10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <Recycle className="h-3.5 w-3.5" />
            Circular economy marketplace
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            NexPlast Eco Marketplace
          </h1>
          <p className="max-w-xl text-sm text-emerald-50/90 sm:text-base">
            Redeem Nature Coins, pay cash, or combine both. Every purchase
            supports products made from recycled plastic.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/marketplace?sort=coins"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "bg-white text-emerald-900 hover:bg-emerald-50",
              )}
            >
              Best redeemable
            </Link>
            {authenticated ? (
              <Link
                href="/cart"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-white/40 bg-transparent text-white hover:bg-white/10",
                )}
              >
                View cart
              </Link>
            ) : (
              <Link
                href="/login?callbackUrl=/marketplace"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-white/40 bg-transparent text-white hover:bg-white/10",
                )}
              >
                Sign in to shop
              </Link>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-emerald-50">
            <Leaf className="h-4 w-4" />
            Your Nature Coin balance
          </div>
          <div className="mt-3 flex items-center gap-2">
            <CoinIcon className="h-8 w-8" />
            <span className="font-display text-4xl font-bold">
              {authenticated ? formatCoin(coinBalance) : "—"}
            </span>
          </div>
          <p className="mt-2 text-xs text-emerald-50/80">
            1 coin ≈ ₹0.50 internal value · redeemable only in this marketplace
          </p>
        </div>
      </div>
    </section>
  );
}
