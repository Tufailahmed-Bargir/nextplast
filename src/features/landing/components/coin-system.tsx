"use client";

import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CoinIcon } from "@/components/shared/brand";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const rateRows = [
  {
    label: "Base rate",
    value: "1 Coin = 100 g of standard recyclable plastic",
    highlight: true,
  },
  { label: "1 g", value: "0.01 Coin", highlight: false },
  { label: "100 g", value: "1 Coin", highlight: false },
  { label: "1 kg", value: "10 Coins", highlight: false },
  { label: "10 kg", value: "100 Coins", highlight: false },
  { label: "20 kg (clean PET)", value: "200 Coins", highlight: true },
] as const;

const marketplaceExamples = [
  { name: "Eco Bottle", coins: 40, rs: 20 },
  { name: "Flower Pot", coins: 100, rs: 50 },
  { name: "Dustbin", coins: 300, rs: 150 },
  { name: "Chair", coins: 600, rs: 300 },
] as const;

export function CoinSystem() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="coins" className="bg-background py-24">
      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll mx-auto max-w-7xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge className="mb-4 gap-1.5 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <CoinIcon size={14} /> Nature Coin Economy
          </Badge>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Earn coins. Spend coins. Save the planet.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Nature Coins represent real environmental contribution — not cash.
            Earn them by recycling, spend them in the marketplace.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-display mb-4 text-lg font-semibold text-foreground">
              How coins are calculated
            </h3>
            <div className="space-y-3">
              {rateRows.map((row) => (
                <div
                  key={row.label}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3",
                    row.highlight
                      ? "border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
                      : "bg-muted/60",
                  )}
                >
                  <span className="text-sm font-medium text-foreground">
                    {row.label}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      row.highlight ? "coin-text" : "text-foreground",
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Plastic type and quality may increase or decrease coin rewards.
              Clean, sorted plastic earns bonuses.
            </p>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-900 dark:from-amber-950/40 dark:to-slate-900">
            <div className="mb-4 flex items-center justify-center">
              <CoinIcon size={64} className="animate-float" />
            </div>
            <h3 className="font-display text-center text-lg font-semibold text-foreground">
              Internal Reward Value
            </h3>
            <p className="font-display coin-text mt-2 text-center text-3xl font-bold">
              Rs 0.50
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / coin
              </span>
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowRight className="h-4 w-4 text-emerald-500" /> Coins cannot
                be exchanged for cash
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowRight className="h-4 w-4 text-emerald-500" /> Redeem only
                in NexPlast Marketplace
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowRight className="h-4 w-4 text-emerald-500" /> Quality
                bonuses apply
              </div>
            </div>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 w-full gap-1.5 bg-coin-gradient text-amber-950 shadow-coin hover:brightness-105",
              )}
            >
              Start Earning Coins <TrendingUp className="h-4 w-4" />
            </Link>
          </Card>
        </div>

        <Card className="mt-6 p-6">
          <h3 className="font-display mb-1 text-lg font-semibold text-foreground">
            Marketplace price examples
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Every product price follows 1 Coin = Rs 0.50. Pay with coins, cash,
            or a mix.
          </p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {marketplaceExamples.map((item) => (
              <div key={item.name} className="rounded-xl bg-muted/60 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {item.name}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <CoinIcon size={18} />
                  <span className="font-display text-lg font-bold text-foreground">
                    {item.coins}
                  </span>
                  <span className="text-xs text-muted-foreground">coins</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  or ₹{item.rs} cash
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
