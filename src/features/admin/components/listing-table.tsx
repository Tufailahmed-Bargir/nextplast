"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/features/admin/components/search-bar";
import { FilterPanel } from "@/features/admin/components/filter-panel";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatRelative } from "@/utils/date";
import { reviewListingAction } from "@/features/admin/actions/admin-actions";
import { Button } from "@/components/ui/button";

export interface ListingTableRow {
  id: string;
  status: string;
  quality: string | null;
  claimedWeightGrams: number | null;
  actualWeightGrams: number | null;
  estimatedCoins: number;
  finalCoins: number | null;
  createdAt: Date;
  user: { id: string; name: string | null; email: string };
  pickupStatus: string | null;
  pickupId: string | null;
  imageCount: number;
  itemCount: number;
}

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING_REVIEW", label: "Pending review" },
  { id: "AWAITING_COLLECTOR", label: "Awaiting collector" },
  { id: "SUBMITTED", label: "Submitted" },
  { id: "COMPLETED", label: "Completed" },
  { id: "AI_REJECTED", label: "Rejected" },
  { id: "DRAFT", label: "Draft" },
  { id: "CANCELLED", label: "Cancelled" },
];

interface ListingTableProps {
  listings: ListingTableRow[];
}

export function ListingTable({ listings }: ListingTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return listings.filter((l) => {
      if (status !== "ALL" && l.status !== status) return false;
      if (!term) return true;
      return (
        l.id.toLowerCase().includes(term) ||
        (l.user.name?.toLowerCase().includes(term) ?? false) ||
        l.user.email.toLowerCase().includes(term)
      );
    });
  }, [listings, q, status]);

  function quickApprove(listingId: string) {
    startTransition(async () => {
      const result = await reviewListingAction({
        listingId,
        decision: "APPROVE",
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plastic listings</CardTitle>
        <p className="text-sm text-muted-foreground">
          All listings from Prisma — filter by status or search seller.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Search listing id, seller…"
          />
          <FilterPanel
            options={STATUS_FILTERS}
            value={status}
            onChange={setStatus}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No listings match.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => (
              <div
                key={l.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {l.status.toLowerCase().replaceAll("_", " ")}
                    </Badge>
                    {l.quality ? (
                      <Badge variant="outline">{l.quality}</Badge>
                    ) : null}
                    <span className="text-sm font-semibold">
                      #{l.id.slice(0, 8)}
                    </span>
                  </div>
                  <p className="text-sm">
                    {l.user.name ?? l.user.email} · {l.itemCount} item(s) ·{" "}
                    {l.imageCount} image(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Claimed{" "}
                    {l.claimedWeightGrams != null
                      ? formatWeight(l.claimedWeightGrams)
                      : "—"}
                    {l.actualWeightGrams != null
                      ? ` · Actual ${formatWeight(l.actualWeightGrams)}`
                      : ""}{" "}
                    · Est. {formatCoin(l.estimatedCoins)}
                    {l.finalCoins != null
                      ? ` · Final ${formatCoin(l.finalCoins)}`
                      : ""}{" "}
                    · {formatRelative(l.createdAt)}
                  </p>
                  {l.pickupId ? (
                    <Link
                      href="/admin/pickup-requests"
                      className="text-xs text-emerald-700 underline dark:text-emerald-300"
                    >
                      Pickup {l.pickupStatus?.toLowerCase().replaceAll("_", " ")}
                    </Link>
                  ) : null}
                </div>
                {l.status === "PENDING_REVIEW" ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    onClick={() => quickApprove(l.id)}
                  >
                    Approve
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
