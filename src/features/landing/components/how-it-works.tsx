"use client";

import {
  Recycle,
  Scan,
  Coins,
  Truck,
  Factory,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Scan,
    title: "AI Plastic Detection",
    desc: "Snap a photo of your plastic. Our AI identifies the type, quality, and estimated weight in seconds.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Recycle,
    title: "List Your Plastic",
    desc: "Create a listing with the AI-verified details. Set your preferred pickup window.",
    color: "from-teal-500 to-sky-500",
  },
  {
    icon: Truck,
    title: "Collector Pickup",
    desc: "A verified collector is assigned. They arrive, verify weight with OTP, and collect your plastic.",
    color: "from-sky-500 to-blue-500",
  },
  {
    icon: Factory,
    title: "Recycler Processing",
    desc: "Plastic reaches our recycler partners who process it into raw material for new eco products.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Coins,
    title: "Earn Nature Coins",
    desc: "Get rewarded instantly. 1 Coin per 100 g of plastic. Quality bonuses apply.",
    color: "from-coin-400 to-coin-600",
  },
  {
    icon: ShoppingBag,
    title: "Spend in Marketplace",
    desc: "Redeem coins for eco products — bottles, pots, furniture, and more.",
    color: "from-emerald-500 to-green-500",
  },
] as const;

export function HowItWorks() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="how" className="bg-muted/40 py-24">
      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll mx-auto max-w-7xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            How It Works
          </Badge>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            From waste to worth in six steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A seamless journey powered by AI — from detecting plastic at home to
            earning rewards and buying eco products.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Card
              key={step.title}
              className={cn(
                "group relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-float reveal-on-scroll",
                visible && "is-visible",
                `reveal-delay-${(i % 3) + 1}`,
              )}
            >
              <div
                className={cn(
                  "absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 transition-all duration-500 group-hover:scale-125 group-hover:opacity-20",
                  step.color,
                )}
              />
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-soft transition-transform group-hover:scale-110",
                    step.color,
                  )}
                >
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <span className="font-display text-3xl font-bold text-muted-foreground/30">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-display mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
