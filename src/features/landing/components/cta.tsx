"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const mountainImg =
  "https://images.pexels.com/photos/34030925/pexels-photo-34030925.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920";

export function CTA() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div
          ref={ref}
          className={cn(
            "reveal-on-scroll relative overflow-hidden rounded-3xl p-12 text-center sm:p-20",
            visible && "is-visible",
          )}
        >
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={mountainImg}
              alt="Mountain sunrise"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/90 via-teal-800/85 to-sky-900/90" />
          </div>
          <div className="grid-pattern pointer-events-none absolute inset-0 opacity-15" />
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 animate-drift rounded-full bg-white/10 blur-3xl" />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 animate-drift rounded-full bg-white/10 blur-3xl"
            style={{ animationDelay: "3s" }}
          />

          <div className="relative z-10">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              <Sparkles className="h-4 w-4" /> Join the Green Movement
            </span>
            <h2 className="font-display text-3xl leading-tight font-bold text-white sm:text-5xl">
              Your plastic waste is worth
              <br />
              more than you think
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-emerald-50">
              Join 3,800+ users who have recycled over 12,400 kg of plastic and
              earned Nature Coins. Get started in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-1.5 border border-white/30 bg-white/15 text-white backdrop-blur hover:bg-white/25 hover:text-white",
                )}
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/marketplace"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white",
                )}
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
