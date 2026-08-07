"use client";

import Image from "next/image";
import {
  Scan,
  Camera,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Camera,
    title: "Snap & upload",
    desc: "Take a photo of your plastic waste from any angle.",
  },
  {
    icon: Cpu,
    title: "Real-time inference",
    desc: "Bounding boxes, type classification, and confidence scores in under 2 seconds.",
  },
  {
    icon: CheckCircle2,
    title: "Quality grading",
    desc: "Clean, sorted plastic earns bonus coins. Contaminated plastic is flagged.",
  },
  {
    icon: AlertTriangle,
    title: "Fraud detection",
    desc: "Duplicate images, fake weights, and suspicious patterns are caught automatically.",
  },
] as const;

export function AIDetection() {
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
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className={cn("reveal-on-scroll", visible && "is-visible")}>
            <Badge className="mb-4 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              AI Detection
            </Badge>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              AI that sees plastic like an expert
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Our computer vision model identifies plastic types (PET, HDPE, PP,
              LDPE, and more), estimates weight and quality, and flags suspicious
              submissions — all from a single photo.
            </p>
            <div className="mt-8 space-y-4">
              {features.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                    <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="group relative overflow-hidden p-6">
            <div
              className="relative overflow-hidden rounded-xl bg-muted"
              style={{ aspectRatio: "4/3" }}
            >
              <Image
                src="https://images.pexels.com/photos/5719818/pexels-photo-5719818.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="AI detection"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div
                className="absolute top-[20%] left-[15%] h-[50%] w-[40%] animate-pulse rounded-lg border-2 border-emerald-400"
                style={{ boxShadow: "0 0 0 4px rgba(16,185,129,0.2)" }}
              />
              <div
                className="absolute top-[55%] left-[60%] h-[30%] w-[25%] rounded-lg border-2 border-sky-400"
                style={{ boxShadow: "0 0 0 4px rgba(14,165,233,0.2)" }}
              />
              <div className="absolute top-[20%] left-[15%] mt-[-4px] -translate-y-full">
                <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow-soft">
                  PET 98%
                </span>
              </div>
              <div className="absolute top-[55%] left-[60%] mt-[-4px] -translate-y-full">
                <span className="rounded-md bg-sky-500 px-2 py-0.5 text-xs font-semibold text-white shadow-soft">
                  HDPE 94%
                </span>
              </div>
              <div className="glass absolute top-3 right-3 flex items-center gap-2 rounded-lg px-3 py-1.5">
                <Scan className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-foreground">
                  Analyzing…
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-display font-bold text-foreground">PET</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-xs text-muted-foreground">Est. Weight</p>
                <p className="font-display font-bold text-foreground">20.4 kg</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-display font-bold text-emerald-600">98%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
