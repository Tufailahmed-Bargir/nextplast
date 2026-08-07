import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { globalUserSearch } from "@/features/search/services/user-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCoin, formatInr, formatWeight } from "@/utils/coin";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q = "" } = await searchParams;
  const results = await globalUserSearch(session.user.id, q);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Search</h2>
        <p className="text-sm text-muted-foreground">
          Find marketplace products, your listings, and your orders.
        </p>
      </div>

      <form className="flex gap-2" action="/search" method="get">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search products, listings, orders..."
          aria-label="Search query"
          className="max-w-xl"
        />
        <button type="submit" className={cn(buttonVariants())}>
          Search
        </button>
      </form>

      {q.trim().length < 2 ? (
        <p className="text-sm text-muted-foreground">
          Enter at least 2 characters to search.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {results.products.length === 0 ? (
                <p className="text-muted-foreground">No products found.</p>
              ) : (
                results.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/marketplace/${p.slug}`}
                    className="block rounded-lg border border-border p-2 hover:bg-muted/40"
                  >
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatInr(Number(p.priceInr))} · {formatCoin(Number(p.priceCoins))}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your listings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {results.listings.length === 0 ? (
                <p className="text-muted-foreground">No listings found.</p>
              ) : (
                results.listings.map((l) => (
                  <Link
                    key={l.id}
                    href={`/sell/${l.id}`}
                    className="block rounded-lg border border-border p-2 hover:bg-muted/40"
                  >
                    <p className="font-medium">{l.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatWeight(l.claimedWeightGrams ?? 0)} ·{" "}
                      {l.createdAt.toLocaleDateString()}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {results.orders.length === 0 ? (
                <p className="text-muted-foreground">No orders found.</p>
              ) : (
                results.orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="block rounded-lg border border-border p-2 hover:bg-muted/40"
                  >
                    <p className="font-medium">{o.id.slice(0, 10)}…</p>
                    <p className="text-xs text-muted-foreground">
                      {o.status} · {formatInr(Number(o.cashAmountInr))} ·{" "}
                      {formatCoin(Number(o.coinAmount))}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
