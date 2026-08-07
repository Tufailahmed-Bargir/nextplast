"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What are Nature Coins?",
    a: "Nature Coins are NexPlast's reward currency. They represent your environmental contribution — 1 Coin = 100 g of standard recyclable plastic. Each coin has an internal reward value of Rs 0.50. Coins cannot be exchanged for cash but can be spent in the NexPlast Marketplace.",
  },
  {
    q: "How do I earn Nature Coins?",
    a: "List your plastic waste through the app, schedule a free pickup, and a verified collector will weigh and collect it. Coins are credited to your wallet instantly after OTP-verified weight confirmation.",
  },
  {
    q: "Does plastic type affect rewards?",
    a: "Yes. Different plastic types (PET, HDPE, PP, LDPE) have different coin rates per kg. Clean, sorted, and high-quality plastic earns bonus coins. Contaminated or mixed plastic may earn fewer coins.",
  },
  {
    q: "Is pickup really free?",
    a: "Yes. Pickup is completely free for users. NexPlast covers the operational cost through the recycler purchase price — the same mechanism that makes the platform financially sustainable.",
  },
  {
    q: "How does AI detection work?",
    a: "When you upload a photo, our computer vision model identifies the plastic type, draws bounding boxes around detected items, estimates weight, and assigns a confidence score. It also flags duplicate or suspicious images to prevent fraud.",
  },
  {
    q: "Can I use coins and cash together?",
    a: "Yes. The marketplace supports three payment modes: 100% Nature Coins, 100% cash, or a hybrid split. You choose at checkout. 1 Coin = Rs 0.50 in value.",
  },
  {
    q: "How are collectors and recyclers verified?",
    a: "All collectors and recyclers undergo identity verification, background checks, and community rating. Users can rate their pickup experience, and low-rated collectors are reviewed by our team.",
  },
] as const;

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="faq" className="bg-muted/40 py-24">
      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll mx-auto max-w-3xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="mb-14 text-center">
          <Badge className="mb-4 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            FAQ
          </Badge>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Questions, answered
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Card
              key={faq.q}
              className={cn(
                "gap-0 overflow-hidden py-0 reveal-on-scroll",
                visible && "is-visible",
                `reveal-delay-${(i % 3) + 1}`,
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-foreground">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                    open === i && "rotate-180",
                  )}
                />
              </button>
              {open === i && (
                <div className="animate-fade-in px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
