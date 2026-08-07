import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatWeight } from "@/utils/coin";
import { formatNumber } from "@/utils/coin";
import { cn } from "@/lib/utils";

interface WelcomeBannerProps {
  name: string | null;
  plasticRecycledGrams: number;
  co2SavedKg: number;
}

/**
 * Premium welcome hero for the user dashboard.
 */
export function WelcomeBanner({
  name,
  plasticRecycledGrams,
  co2SavedKg,
}: WelcomeBannerProps) {
  const hasImpact = plasticRecycledGrams > 0 || co2SavedKg > 0;

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white sm:p-8">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="text-sm text-emerald-100">Welcome back</span>
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {name?.trim() || "Recycler"}
          </h2>
          <p className="mt-1 max-w-xl text-emerald-100">
            {hasImpact
              ? `You've recycled ${formatWeight(plasticRecycledGrams)} of plastic and saved ${formatNumber(co2SavedKg)} kg of CO₂.`
              : "Convert plastic into Nature Coins. Sell waste, track impact, and shop eco products."}
          </p>
        </div>
        <Link
          href="/sell"
          className={cn(
            buttonVariants({ size: "lg" }),
            "border-white/30 bg-white/15 text-white hover:bg-white/25",
          )}
        >
          <Plus className="h-4 w-4" /> Sell Plastic
        </Link>
      </div>
    </Card>
  );
}
