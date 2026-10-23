import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatWeight } from "@/utils/coin";

interface SummaryBox {
  label: string;
  confidence: number;
  resin?: string;
}

interface AiItemSummaryProps {
  summary?: string | null;
  boxes: SummaryBox[];
  totalCount: number;
  estimatedWeightGrams?: number | null;
}

interface ItemGroup {
  label: string;
  count: number;
  avgConfidence: number;
  resins: string[];
}

function groupItems(boxes: SummaryBox[]): ItemGroup[] {
  const groups = new Map<
    string,
    { count: number; confidence: number; resins: Set<string> }
  >();
  for (const box of boxes) {
    const group = groups.get(box.label) ?? {
      count: 0,
      confidence: 0,
      resins: new Set<string>(),
    };
    group.count += 1;
    group.confidence += box.confidence;
    if (box.resin) group.resins.add(box.resin);
    groups.set(box.label, group);
  }
  return [...groups.entries()]
    .map(([label, g]) => ({
      label,
      count: g.count,
      avgConfidence: g.confidence / g.count,
      resins: [...g.resins],
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Per-photo AI breakdown: written summary plus item counts by type.
 */
export function AiItemSummary({
  summary,
  boxes,
  totalCount,
  estimatedWeightGrams,
}: AiItemSummaryProps) {
  const groups = groupItems(boxes);

  return (
    <section
      aria-label="AI summary"
      className="border-border bg-muted/30 flex h-full flex-col gap-4 rounded-xl border p-4"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
          <Sparkles className="h-4 w-4" />
        </span>
        <h3 className="font-semibold">AI summary</h3>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        {summary ||
          (groups.length > 0
            ? `Detected ${groups
                .map((g) => `${g.count} ${g.label}`)
                .join(", ")}.`
            : "No plastic items were detected in this photo.")}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Total items</p>
          <p className="font-display text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-background rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Est. weight</p>
          <p className="font-display text-2xl font-bold">
            {estimatedWeightGrams ? formatWeight(estimatedWeightGrams) : "—"}
          </p>
        </div>
      </div>

      {groups.length > 0 ? (
        <ul className="divide-border bg-background divide-y rounded-lg border">
          {groups.map((group) => (
            <li
              key={group.label}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="font-medium">{group.label}</span>
                {group.resins.map((resin) => (
                  <Badge key={resin} variant="secondary" className="text-xs">
                    {resin}
                  </Badge>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-muted-foreground text-xs">
                  {Math.round(group.avgConfidence * 100)}%
                </span>
                <span className="font-semibold tabular-nums">
                  × {group.count}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-muted-foreground mt-auto text-xs">
        Estimates only — the collector weighs and verifies at pickup.
      </p>
    </section>
  );
}
