"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SearchBar } from "@/features/admin/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { globalAdminSearchAction } from "@/features/admin/actions/admin-actions";

type SearchResults = {
  users: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  }[];
  listings: {
    id: string;
    status: string;
    claimedWeightGrams: number | null;
  }[];
  pickups: { id: string; status: string; address: string }[];
  products: {
    id: string;
    name: string;
    isActive: boolean;
    stock: number;
  }[];
  orders: { id: string; status: string; createdAt: Date }[];
};

export function AdminGlobalSearch() {
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<SearchResults | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults(null);
      return;
    }

    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const res = await globalAdminSearchAction(term);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        setResults(res.data);
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [q]);

  const hasHits =
    results &&
    (results.users.length > 0 ||
      results.listings.length > 0 ||
      results.pickups.length > 0 ||
      results.products.length > 0 ||
      results.orders.length > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Global search</CardTitle>
        <p className="text-sm text-muted-foreground">
          Find users, listings, pickups, products, and orders.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder="Search by name, email, id, address…"
        />
        {pending ? (
          <p className="text-xs text-muted-foreground">Searching…</p>
        ) : null}
        {results && !hasHits ? (
          <p className="text-sm text-muted-foreground">No matches.</p>
        ) : null}
        {hasHits ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {results.users.map((u) => (
              <Link
                key={u.id}
                href="/admin/users"
                className="rounded-xl bg-muted/40 px-3 py-2 text-sm hover:bg-muted"
              >
                <p className="font-medium">{u.name ?? u.email}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {u.role.toLowerCase()}
                </Badge>
              </Link>
            ))}
            {results.listings.map((l) => (
              <Link
                key={l.id}
                href="/admin/listings"
                className="rounded-xl bg-muted/40 px-3 py-2 text-sm hover:bg-muted"
              >
                <p className="font-medium">Listing #{l.id.slice(0, 8)}</p>
                <Badge variant="secondary" className="mt-1">
                  {l.status.toLowerCase().replaceAll("_", " ")}
                </Badge>
              </Link>
            ))}
            {results.pickups.map((p) => (
              <Link
                key={p.id}
                href="/admin/pickup-requests"
                className="rounded-xl bg-muted/40 px-3 py-2 text-sm hover:bg-muted"
              >
                <p className="font-medium">Pickup #{p.id.slice(0, 8)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.address}
                </p>
              </Link>
            ))}
            {results.products.map((p) => (
              <Link
                key={p.id}
                href="/admin/products"
                className="rounded-xl bg-muted/40 px-3 py-2 text-sm hover:bg-muted"
              >
                <p className="font-medium">{p.name}</p>
                <Badge variant="secondary" className="mt-1">
                  {p.isActive ? "active" : "inactive"}
                </Badge>
              </Link>
            ))}
            {results.orders.map((o) => (
              <Link
                key={o.id}
                href="/admin/orders"
                className="rounded-xl bg-muted/40 px-3 py-2 text-sm hover:bg-muted"
              >
                <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                <Badge variant="secondary" className="mt-1">
                  {o.status.toLowerCase().replaceAll("_", " ")}
                </Badge>
              </Link>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
