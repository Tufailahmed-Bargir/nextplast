"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reviewListingAction } from "@/features/admin/actions/admin-actions";
import { formatWeight } from "@/utils/coin";
import { usePendingAction } from "@/hooks/use-pending-action";

export interface AiReviewListing {
  id: string;
  status: string;
  claimedWeightGrams: number | null;
  user: { name: string | null; email: string };
  aiResults: {
    id: string;
    detectedClass: string;
    detectedCount: number;
    userConfirmedCount: number | null;
    confidence: number;
    decision: string;
    fraudAlerts: { code: string; message: string; severity: string }[];
  }[];
}

interface AiReviewPanelProps {
  listings: AiReviewListing[];
}

/**
 * Admin AI review — never mutates original AI prediction fields.
 */
export function AiReviewPanel({ listings }: AiReviewPanelProps) {
  const router = useRouter();
  const { pending, run, isRunning } = usePendingAction();
  const [notes, setNotes] = useState<Record<string, string>>({});

  function review(
    listingId: string,
    decision: "APPROVE" | "KEEP_REVIEW" | "REJECT",
  ) {
    run(`${listingId}:${decision}`, async () => {
      const result = await reviewListingAction({
        listingId,
        decision,
        notes: notes[listingId] || undefined,
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
        <CardTitle>AI review queue</CardTitle>
        <p className="text-muted-foreground text-sm">
          Review flagged detections and fraud alerts. Original AI values stay
          unchanged; actions are audit-logged.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {listings.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No listings pending AI/manual review.
          </p>
        ) : (
          listings.map((listing) => (
            <div
              key={listing.id}
              className="border-border space-y-3 rounded-xl border p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {listing.status.toLowerCase().replaceAll("_", " ")}
                </Badge>
                <span className="text-sm font-semibold">
                  #{listing.id.slice(0, 8)} ·{" "}
                  {listing.user.name ?? listing.user.email}
                </span>
                {listing.claimedWeightGrams != null ? (
                  <span className="text-muted-foreground text-xs">
                    Claimed {formatWeight(listing.claimedWeightGrams)}
                  </span>
                ) : null}
              </div>

              <ul className="space-y-2 text-sm">
                {listing.aiResults.map((ai) => (
                  <li key={ai.id} className="bg-muted/40 rounded-lg px-3 py-2">
                    <p>
                      {ai.detectedClass}: AI {ai.detectedCount} / user{" "}
                      {ai.userConfirmedCount ?? ai.detectedCount} ·{" "}
                      {Math.round(ai.confidence * 100)}% · {ai.decision}
                    </p>
                    {ai.fraudAlerts.length > 0 ? (
                      <ul className="mt-1 list-inside list-disc text-xs text-amber-700 dark:text-amber-300">
                        {ai.fraudAlerts.map((f) => (
                          <li key={f.code}>
                            [{f.severity}] {f.message}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>

              <Textarea
                placeholder="Admin notes (optional)"
                value={notes[listing.id] ?? ""}
                onChange={(e) =>
                  setNotes((prev) => ({
                    ...prev,
                    [listing.id]: e.target.value,
                  }))
                }
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  loading={isRunning(`${listing.id}:APPROVE`)}
                  onClick={() => review(listing.id, "APPROVE")}
                >
                  Approve for collector
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  loading={isRunning(`${listing.id}:KEEP_REVIEW`)}
                  onClick={() => review(listing.id, "KEEP_REVIEW")}
                >
                  Keep in review
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  loading={isRunning(`${listing.id}:REJECT`)}
                  onClick={() => review(listing.id, "REJECT")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
