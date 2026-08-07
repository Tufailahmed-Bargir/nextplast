import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecommendationItem } from "@/features/ai/types";

interface RecommendationCarouselProps {
  title?: string;
  items: RecommendationItem[];
}

export function RecommendationCarousel({
  title = "Recommended for you",
  items,
}: RecommendationCarouselProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <Card key={item.id} className="min-w-[240px] max-w-[280px] shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.category}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <Link
                href={item.href}
                className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
              >
                Open
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
