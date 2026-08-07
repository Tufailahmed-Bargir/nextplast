"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Leaf, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CoinIcon } from "@/components/shared/brand";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

interface PreviewProduct {
  id: string;
  name: string;
  category: string;
  priceCoins: number;
  priceRs: number;
  ecoScore: number;
  image: string;
  rating: number;
  reviews: number;
}

const previewProducts: PreviewProduct[] = [
  {
    id: "eco-bottle",
    name: "Eco Bottle 750ml",
    category: "Drinkware",
    priceCoins: 40,
    priceRs: 20,
    ecoScore: 92,
    image:
      "https://images.pexels.com/photos/13871766/pexels-photo-13871766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    rating: 4.8,
    reviews: 1240,
  },
  {
    id: "flower-pot",
    name: "Recycled Flower Pot",
    category: "Garden",
    priceCoins: 100,
    priceRs: 50,
    ecoScore: 88,
    image:
      "https://images.pexels.com/photos/3101767/pexels-photo-3101767.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    rating: 4.6,
    reviews: 856,
  },
  {
    id: "dustbin",
    name: "Smart Dustbin 30L",
    category: "Home",
    priceCoins: 300,
    priceRs: 150,
    ecoScore: 85,
    image:
      "https://images.pexels.com/photos/31587977/pexels-photo-31587977.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    rating: 4.4,
    reviews: 432,
  },
  {
    id: "chair",
    name: "Eco Garden Chair",
    category: "Furniture",
    priceCoins: 600,
    priceRs: 300,
    ecoScore: 90,
    image:
      "https://images.pexels.com/photos/17488642/pexels-photo-17488642.png?auto=compress&cs=tinysrgb&h=650&w=940",
    rating: 4.7,
    reviews: 318,
  },
];

export function MarketplacePreview() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="marketplace" className="bg-muted/40 py-24">
      <div
        ref={ref}
        className={cn(
          "reveal-on-scroll mx-auto max-w-7xl px-5 sm:px-8",
          visible && "is-visible",
        )}
      >
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Marketplace
            </Badge>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Spend coins on real eco products
            </h2>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              From bamboo toothbrushes to recycled furniture — every product is
              made from or supports recycled materials.
            </p>
          </div>
          <Link
            href="/marketplace"
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {previewProducts.map((p, i) => (
            <Link key={p.id} href="/marketplace">
              <Card
                className={cn(
                  "group cursor-pointer gap-0 overflow-hidden py-0 transition-all hover:-translate-y-1 hover:shadow-float reveal-on-scroll",
                  visible && "is-visible",
                  `reveal-delay-${i + 1}`,
                )}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="glass flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-foreground">
                      <Leaf className="h-3 w-3 text-emerald-500" /> {p.ecoScore}
                    </span>
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {p.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-coin-400 text-coin-400" />
                    <span className="text-xs text-muted-foreground">
                      {p.rating} ({p.reviews})
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CoinIcon size={18} />
                      <span className="font-display font-bold text-foreground">
                        {p.priceCoins}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ₹{p.priceRs}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
