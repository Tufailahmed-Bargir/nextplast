"use client";

import Image from "next/image";
import {
  Leaf,
  Wind,
  TreePine,
  Droplets,
  Zap,
  Factory,
  Recycle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const earthImg =
  "https://images.pexels.com/photos/30596225/pexels-photo-30596225.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
const oceanImg =
  "https://images.pexels.com/photos/20023182/pexels-photo-20023182.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

const stats = [
  {
    icon: Factory,
    label: "Plastic Recycled",
    value: "12,400",
    unit: "kg",
    iconColor: "text-emerald-500",
  },
  {
    icon: Wind,
    label: "CO₂ Saved",
    value: "24,800",
    unit: "kg",
    iconColor: "text-sky-500",
  },
  {
    icon: TreePine,
    label: "Trees Saved",
    value: "186",
    unit: "trees",
    iconColor: "text-green-600",
  },
  {
    icon: Droplets,
    label: "Water Saved",
    value: "62K",
    unit: "litres",
    iconColor: "text-teal-500",
  },
  {
    icon: Zap,
    label: "Energy Saved",
    value: "84K",
    unit: "kWh",
    iconColor: "text-amber-500",
  },
  {
    icon: Leaf,
    label: "Oil Saved",
    value: "3,100",
    unit: "litres",
    iconColor: "text-emerald-500",
  },
] as const;

function ImpactRing({
  value,
  size = 180,
  stroke = 14,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, value) / 100) * circ;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="url(#ecoGradLanding)"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ecoGradLanding" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="font-display text-2xl font-bold text-foreground">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>
    </div>
  );
}

export function Impact() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="impact" className="relative overflow-hidden bg-background py-24">
      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll mx-auto max-w-7xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className={cn("reveal-on-scroll", visible && "is-visible")}>
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Environmental Impact
            </Badge>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Every gram you recycle makes a measurable difference
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              NexPlast tracks your personal and community impact in real time.
              See exactly how much CO₂, water, oil, and energy your recycling has
              saved.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={cn(
                    "rounded-xl border border-border bg-muted/40 p-4 transition-all hover:-translate-y-0.5 hover:shadow-card reveal-on-scroll",
                    visible && "is-visible",
                    `reveal-delay-${(i % 3) + 1}`,
                  )}
                >
                  <s.icon className={cn("mb-2 h-5 w-5", s.iconColor)} />
                  <p className="font-display text-2xl font-bold text-foreground">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.label} · {s.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "reveal-on-scroll relative",
              visible && "is-visible",
              "reveal-delay-2",
            )}
          >
            <div className="animate-drift absolute -top-8 -right-8 h-48 w-48 overflow-hidden rounded-full opacity-90">
              <Image
                src={earthImg}
                alt="Earth"
                fill
                className="rounded-full object-cover"
                sizes="192px"
              />
            </div>

            <Card className="relative z-10 flex flex-col items-center p-8">
              <h3 className="font-display mb-1 text-lg font-semibold text-foreground">
                Your Impact This Month
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Based on 142 kg recycled in July
              </p>
              <ImpactRing
                value={71}
                size={180}
                stroke={14}
                label="71%"
                sublabel="of monthly goal"
              />
              <div className="mt-8 grid w-full grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-emerald-600">
                    284 kg
                  </p>
                  <p className="text-xs text-muted-foreground">CO₂ saved</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-sky-600">7</p>
                  <p className="text-xs text-muted-foreground">trees saved</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-teal-600">
                    35 L
                  </p>
                  <p className="text-xs text-muted-foreground">oil saved</p>
                </div>
              </div>
            </Card>

            <div className="group relative mt-4 h-28 overflow-hidden rounded-2xl">
              <Image
                src={oceanImg}
                alt="Clean ocean"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-900/60 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <Recycle className="mb-1 h-4 w-4" />
                <p className="text-sm font-semibold">
                  Cleaner oceans, one pickup at a time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
