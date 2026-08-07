import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);
  const tone =
    pct >= 75 ? "bg-emerald-600 text-white" : pct >= 55 ? "bg-amber-500 text-white" : "bg-rose-600 text-white";

  return (
    <Badge className={cn(tone, className)} variant="secondary">
      {pct}% confidence
    </Badge>
  );
}
