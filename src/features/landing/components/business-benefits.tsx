"use client";

import Image from "next/image";
import {
  Truck,
  Factory,
  Users,
  PackageCheck,
  Leaf,
  IndianRupee,
  ShoppingBag,
  Handshake,
  Percent,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const forestImg =
  "https://images.pexels.com/photos/12421351/pexels-photo-12421351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

const roles = [
  {
    icon: Users,
    title: "Users",
    desc: "Everyday people who collect and sell household plastic waste. They earn Nature Coins for every pickup.",
    points: [
      "Snap & list plastic",
      "Schedule free pickup",
      "Earn Nature Coins",
      "Shop in marketplace",
    ],
    iconBg: "bg-emerald-50 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Truck,
    title: "Collectors",
    desc: "Verified local agents who pick up plastic from users, verify weight with OTP, and deliver to recyclers.",
    points: [
      "Receive pickup assignments",
      "OTP weight verification",
      "Route optimization",
      "Earn per kg delivered",
    ],
    iconBg: "bg-sky-50 dark:bg-sky-950",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: Factory,
    title: "Recyclers",
    desc: "Processing partners who buy sorted plastic by weight and type, turning waste into raw material.",
    points: [
      "Browse sorted inventory",
      "Reserve & purchase batches",
      "Quality grading (A/B/C)",
      "Track shipments",
    ],
    iconBg: "bg-teal-50 dark:bg-teal-950",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
] as const;

const revenueStreams = [
  {
    icon: ShoppingBag,
    title: "Marketplace sales",
    desc: "Commission on eco-product purchases paid with coins, cash, or hybrid checkout.",
  },
  {
    icon: Factory,
    title: "Recycler purchases",
    desc: "Margin on sorted plastic batches sold to verified recycler partners by type and grade.",
  },
  {
    icon: Percent,
    title: "Platform fees",
    desc: "Lightweight service fees on premium listings, priority pickups, and enterprise accounts.",
  },
  {
    icon: Handshake,
    title: "Partnerships",
    desc: "Corporate CSR programs, municipal contracts, and brand sponsorships for circular campaigns.",
  },
] as const;

export function BusinessBenefits() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="business" className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-5">
        <Image
          src={forestImg}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll relative mx-auto max-w-7xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge className="mb-4 gap-1.5 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <Leaf className="h-3 w-3" /> For Business
          </Badge>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Stakeholders & sustainable revenue
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Users, collectors, and recyclers power the loop — while clear revenue
            streams keep the circular economy growing.
          </p>
        </div>

        <div className="mb-12 grid gap-5 md:grid-cols-3">
          {roles.map((role, i) => (
            <Card
              key={role.title}
              className={cn(
                "group p-6 transition-all hover:-translate-y-1 hover:shadow-float reveal-on-scroll",
                visible && "is-visible",
                `reveal-delay-${i + 1}`,
              )}
            >
              <div
                className={cn(
                  "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                  role.iconBg,
                )}
              >
                <role.icon className={cn("h-7 w-7", role.iconColor)} />
              </div>
              <h3 className="font-display mb-2 text-xl font-bold text-foreground">
                {role.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {role.desc}
              </p>
              <ul className="space-y-2">
                {role.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <PackageCheck className="h-4 w-4 shrink-0 text-emerald-500" />{" "}
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div
          className={cn(
            "reveal-on-scroll rounded-3xl border border-border bg-muted/40 p-8 sm:p-10",
            visible && "is-visible",
          )}
        >
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-600">
                <IndianRupee className="h-5 w-5" />
                <span className="text-sm font-semibold">Revenue streams</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                How NexPlast sustains the circular economy
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Free pickups for users are funded by recycler demand and
                marketplace activity — not by selling Nature Coins for cash.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {revenueStreams.map((stream, i) => (
              <div
                key={stream.title}
                className={cn(
                  "rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:shadow-card reveal-on-scroll",
                  visible && "is-visible",
                  `reveal-delay-${(i % 4) + 1}`,
                )}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                  <stream.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-display mb-1.5 font-semibold text-foreground">
                  {stream.title}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {stream.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
