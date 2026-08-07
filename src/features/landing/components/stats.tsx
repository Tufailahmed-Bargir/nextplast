"use client";

import { Users, Recycle, Coins, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CoinIcon } from "@/components/shared/brand";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const stats = [
  {
    icon: Recycle,
    value: "12,400",
    label: "kg plastic recycled",
    gradient: "from-emerald-500 to-teal-500",
    isCoin: false,
  },
  {
    icon: Users,
    value: "3,800",
    label: "active users",
    gradient: "from-sky-500 to-blue-500",
    isCoin: false,
  },
  {
    icon: Coins,
    value: "124,000",
    label: "Nature Coins earned",
    gradient: "from-coin-400 to-coin-600",
    isCoin: true,
  },
  {
    icon: Truck,
    value: "2,100",
    label: "pickups completed",
    gradient: "from-teal-500 to-emerald-500",
    isCoin: false,
  },
] as const;

export function Stats() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden bg-background py-16">
      <div className="bg-hero-mesh absolute inset-0 opacity-50" />
      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll relative mx-auto max-w-7xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Card
              key={s.label}
              className={cn(
                "group p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-float reveal-on-scroll",
                visible && "is-visible",
                `reveal-delay-${i + 1}`,
              )}
            >
              <div
                className={cn(
                  "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-soft transition-transform group-hover:scale-110",
                  s.gradient,
                )}
              >
                {s.isCoin ? (
                  <CoinIcon size={28} />
                ) : (
                  <s.icon className="h-7 w-7 text-white" />
                )}
              </div>
              <p className="font-display gradient-text text-3xl font-bold">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
