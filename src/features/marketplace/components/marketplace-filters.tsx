"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MarketplaceFiltersProps {
  categories: { slug: string; name: string }[];
}

const SORTS = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "coins", label: "Best coin value" },
  { id: "price_asc", label: "Price ↑" },
  { id: "price_desc", label: "Price ↓" },
  { id: "eco", label: "Eco score" },
  { id: "rating", label: "Rating" },
];

export function MarketplaceFilters({ categories }: MarketplaceFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const category = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "popular";

  function push(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all") sp.delete(k);
      else sp.set(k, v);
    }
    startTransition(() => {
      router.push(`/marketplace?${sp.toString()}`);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") push({ q: q.trim() || undefined });
            }}
            placeholder="Search eco products..."
            className="h-11 pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={pending}
              onClick={() => push({ sort: s.id })}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                sort === s.id
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "border-border hover:bg-muted/50",
              )}
            >
              {s.label}
            </button>
          ))}
          {pending ? (
            <Loader2
              className="text-muted-foreground h-4 w-4 animate-spin self-center"
              aria-label="Updating results"
            />
          ) : null}
        </div>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => push({ category: "all" })}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap",
            category === "all"
              ? "bg-emerald-600 text-white"
              : "border-border bg-background text-muted-foreground border",
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => push({ category: c.slug })}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap",
              category === c.slug
                ? "bg-emerald-600 text-white"
                : "border-border bg-background text-muted-foreground border",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
