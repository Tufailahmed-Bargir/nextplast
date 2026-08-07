import Link from "next/link";
import { ConfidenceBadge } from "@/features/ai/components/confidence-badge";

export interface DetectionHistoryItem {
  id: string;
  listingId: string;
  detectedClass: string;
  detectedCount: number;
  confidence: number;
  decision: string;
  createdAt: Date | string;
  processingTimeMs?: number | null;
}

interface DetectionHistoryProps {
  items: DetectionHistoryItem[];
}

export function DetectionHistory({ items }: DetectionHistoryProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No detection history yet. Run AI on a sell listing to populate this feed.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
        >
          <div>
            <p className="font-medium">
              {item.detectedClass} × {item.detectedCount}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()} ·{" "}
              {item.decision.toLowerCase().replaceAll("_", " ")}
              {item.processingTimeMs != null
                ? ` · ${Math.round(item.processingTimeMs)} ms`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={item.confidence} />
            <Link
              href={`/admin/listings?q=${item.listingId}`}
              className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Listing
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
