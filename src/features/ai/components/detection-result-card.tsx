import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "@/features/ai/components/confidence-badge";
import { RiskBadge } from "@/features/ai/components/risk-badge";

interface DetectionResultCardProps {
  detectedClass: string;
  detectedCount: number;
  confidence: number;
  decision: string;
  estimatedWeightGrams?: number | null;
  processingTimeMs?: number | null;
  plasticTypes?: string[];
  risk?: "none" | "low" | "medium" | "high";
}

export function DetectionResultCard({
  detectedClass,
  detectedCount,
  confidence,
  decision,
  estimatedWeightGrams,
  processingTimeMs,
  plasticTypes,
  risk = "none",
}: DetectionResultCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">{detectedClass}</CardTitle>
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={confidence} />
            <RiskBadge risk={risk} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Count {detectedCount}</Badge>
          <Badge variant="outline">{decision.toLowerCase().replaceAll("_", " ")}</Badge>
          {estimatedWeightGrams != null ? (
            <Badge variant="outline">~{estimatedWeightGrams} g preview</Badge>
          ) : null}
          {processingTimeMs != null ? (
            <Badge variant="outline">{Math.round(processingTimeMs)} ms</Badge>
          ) : null}
        </div>
        {plasticTypes && plasticTypes.length > 0 ? (
          <p className="text-muted-foreground">
            Types: {plasticTypes.join(", ")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
