"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Recycle,
  Sparkles,
  TrendingUp,
  Star,
  MapPin,
} from "lucide-react";
import { CoinIcon } from "@/components/shared/brand";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const heroBg =
  "https://images.pexels.com/photos/540006/pexels-photo-540006.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920";
const mountainImg =
  "https://images.pexels.com/photos/34030925/pexels-photo-34030925.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={heroBg}
          alt="Lush green nature"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-background dark:to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-transparent" />
      </div>

      <div className="pointer-events-none absolute top-1/4 right-1/4 h-64 w-64 animate-drift rounded-full bg-emerald-400/20 blur-3xl" />
      <div
        className="pointer-events-none absolute bottom-1/4 left-1/3 h-72 w-72 animate-drift rounded-full bg-teal-400/15 blur-3xl"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-32 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-slide-up">
            <Badge className="mb-5 gap-1.5 border-white/20 bg-white/15 text-white backdrop-blur hover:bg-white/20">
              <Sparkles className="h-3 w-3" /> AI-Powered Circular Economy
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn plastic waste into{" "}
              <span className="gradient-animated">Nature Coins</span> & eco
              rewards
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              NexPlast connects you with AI plastic detection, local collectors,
              and recyclers. Earn Nature Coins for every gram of plastic you
              recycle — then spend them in our eco marketplace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "lg" }), "relative z-10 gap-1.5")}
              >
                Start Selling Plastic <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "relative z-10 gap-1.5 border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white",
                )}
              >
                <Recycle className="h-4 w-4" /> Explore Marketplace
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <div>
                <p className="font-display text-2xl font-bold text-white">
                  12,400+
                </p>
                <p className="text-sm text-white/60">kg recycled</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="font-display text-2xl font-bold text-white">
                  3,800+
                </p>
                <p className="text-sm text-white/60">active users</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="font-display text-2xl font-bold text-coin-400">
                  124K
                </p>
                <p className="text-sm text-white/60">coins earned</p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none relative hidden h-[500px] lg:block">
            <div
              className="animate-float absolute top-1/2 right-1/2 h-36 w-48 overflow-hidden rounded-2xl border-2 border-white/20 shadow-float"
              style={{ animationDelay: "0.8s" }}
            >
              <Image
                src={mountainImg}
                alt="Mountains"
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>

            <div
              className="glass-card animate-float absolute -top-4 left-8 rounded-2xl p-3.5 shadow-float"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center gap-2.5">
                <CoinIcon size={32} />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    200 Coins
                  </p>
                  <p className="text-xs text-muted-foreground">for 20 kg PET</p>
                </div>
              </div>
            </div>

            <div
              className="glass-card animate-float absolute right-4 bottom-12 rounded-2xl p-3.5 shadow-float"
              style={{ animationDelay: "2s" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-eco-gradient flex h-9 w-9 items-center justify-center rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    98% AI accuracy
                  </p>
                  <p className="text-xs text-muted-foreground">
                    plastic detection
                  </p>
                </div>
              </div>
            </div>

            <div
              className="glass-card animate-float absolute top-1/3 -right-2 rounded-2xl p-3 shadow-float"
              style={{ animationDelay: "2.5s" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-coin-400 text-coin-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-foreground">
                  4.9
                </span>
              </div>
            </div>

            <div
              className="glass-card animate-float absolute -bottom-2 left-1/3 rounded-2xl p-3 shadow-float"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-foreground">
                  142 collectors active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-background to-transparent dark:from-slate-950" />
    </section>
  );
}
