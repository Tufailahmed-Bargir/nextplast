"use client";

import Image from "next/image";
import {
  Recycle,
  Leaf,
  Wind,
  TreePine,
  Droplets,
  Sun,
  Sparkles,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const solutionImg =
  "https://images.pexels.com/photos/36713500/pexels-photo-36713500.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
const recyclingImg =
  "https://images.pexels.com/photos/14370990/pexels-photo-14370990.png?auto=compress&cs=tinysrgb&h=650&w=940";
const earthImg =
  "https://images.pexels.com/photos/30596291/pexels-photo-30596291.png?auto=compress&cs=tinysrgb&h=650&w=940";

const solutions = [
  {
    icon: Recycle,
    title: "Diverts plastic from landfills",
    desc: "Every kg recycled through NexPlast is one less kg in a landfill or ocean. We have diverted 12.4 tonnes so far.",
    iconBg: "bg-emerald-50 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Wind,
    title: "Reduces CO₂ emissions",
    desc: "Recycling plastic uses 88% less energy than producing new plastic. Each kg recycled saves 2 kg of CO₂.",
    iconBg: "bg-sky-50 dark:bg-sky-950",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: TreePine,
    title: "Saves forests and trees",
    desc: "Less plastic production means less deforestation for industrial sites. 42 trees saved this year alone.",
    iconBg: "bg-green-50 dark:bg-green-950",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: Droplets,
    title: "Protects water sources",
    desc: "Preventing plastic from reaching rivers and oceans keeps water clean. 4,200 litres of water saved.",
    iconBg: "bg-teal-50 dark:bg-teal-950",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    icon: Sun,
    title: "Conserves energy",
    desc: "Recycled plastic uses far less energy than virgin plastic. 5,880 kWh of energy saved.",
    iconBg: "bg-amber-50 dark:bg-amber-950",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Leaf,
    title: "Creates eco products",
    desc: "Recycled plastic becomes new products — bottles, pots, furniture — closing the loop.",
    iconBg: "bg-emerald-50 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
] as const;

export function Solution() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="what" className="relative overflow-hidden bg-muted/40 py-24">
      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll mx-auto max-w-7xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge className="mb-4 gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="h-3 w-3" /> What is NexPlast
          </Badge>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            How NexPlast helps nature heal
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We turn the plastic problem into a circular economy — where waste
            becomes worth, and every action creates measurable environmental
            impact.
          </p>
        </div>

        <div className="mb-14 grid gap-6 lg:grid-cols-2">
          <div
            className={cn(
              "reveal-on-scroll group relative h-80 overflow-hidden rounded-3xl",
              visible && "is-visible",
              "reveal-delay-1",
            )}
          >
            <Image
              src={recyclingImg}
              alt="Plastic waste piling up"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/20" />
            <div className="absolute bottom-6 left-6 text-white">
              <span className="mb-1 inline-block rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold backdrop-blur">
                BEFORE
              </span>
              <p className="font-display text-2xl font-bold">Plastic piling up</p>
              <p className="text-white/70">
                Waste filling up facilities with no system to process it
              </p>
            </div>
          </div>
          <div
            className={cn(
              "reveal-on-scroll group relative h-80 overflow-hidden rounded-3xl",
              visible && "is-visible",
              "reveal-delay-2",
            )}
          >
            <Image
              src={solutionImg}
              alt="Volunteers cleaning beach"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-emerald-900/20" />
            <div className="absolute bottom-6 left-6 text-white">
              <span className="mb-1 inline-block rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold backdrop-blur">
                AFTER
              </span>
              <p className="font-display text-2xl font-bold">
                Communities in action
              </p>
              <p className="text-white/70">
                NexPlast users, collectors, and recyclers cleaning up together
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => (
            <Card
              key={s.title}
              className={cn(
                "group p-6 transition-all hover:-translate-y-1 hover:shadow-float reveal-on-scroll",
                visible && "is-visible",
                `reveal-delay-${(i % 3) + 1}`,
              )}
            >
              <div
                className={cn(
                  "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                  s.iconBg,
                )}
              >
                <s.icon className={cn("h-6 w-6", s.iconColor)} />
              </div>
              <h3 className="font-display mb-2 text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </Card>
          ))}
        </div>

        <div
          className={cn(
            "reveal-on-scroll relative mt-10 overflow-hidden rounded-3xl",
            visible && "is-visible",
          )}
        >
          <Image
            src={earthImg}
            alt="Earth from space"
            width={1200}
            height={288}
            className="h-72 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-lg px-8 sm:px-12">
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">
                  One Planet, One Mission
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Every gram recycled is a win for Earth
              </h3>
              <p className="mt-3 text-white/70">
                NexPlast tracks every kg of plastic diverted, every gram of CO₂
                prevented, and every tree saved — so you can see your real
                impact on the planet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
