"use client";

import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Homemaker, Mumbai",
    rating: 5,
    text: "NexPlast changed how my family sees waste. My kids now sort plastic eagerly because they can see the coins add up. We have recycled over 1,200 kg this year!",
    avatar:
      "https://images.pexels.com/photos/14950779/pexels-photo-14950779.jpeg?auto=compress&cs=tinysrgb&h=200&w=200",
  },
  {
    name: "Arjun Mehta",
    role: "College Student, Delhi",
    rating: 5,
    text: "The AI detection is mind-blowing. I just snap a photo and it knows the plastic type instantly. I earned enough coins for a new eco bottle in two weeks.",
    avatar:
      "https://images.pexels.com/photos/35490803/pexels-photo-35490803.jpeg?auto=compress&cs=tinysrgb&h=200&w=200",
  },
  {
    name: "Rajesh Kumar",
    role: "Collector, Pune",
    rating: 5,
    text: "As a collector, NexPlast gives me a steady stream of pickups with optimized routes. The OTP verification makes everything transparent. My income has doubled.",
    avatar:
      "https://images.pexels.com/photos/37159572/pexels-photo-37159572.jpeg?auto=compress&cs=tinysrgb&h=200&w=200",
  },
] as const;

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="bg-background py-24">
      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll mx-auto max-w-7xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Testimonials
          </Badge>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Loved by people who care about the planet
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Card
              key={t.name}
              className={cn(
                "relative p-6 transition-all hover:-translate-y-1 hover:shadow-float reveal-on-scroll",
                visible && "is-visible",
                `reveal-delay-${i + 1}`,
              )}
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/20" />
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-coin-400 text-coin-400"
                  />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-foreground">
                {t.text}
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="ring-2 ring-emerald-500/20">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback>{initials(t.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
