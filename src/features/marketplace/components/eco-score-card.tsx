import { Leaf, Recycle, Trees } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EcoScoreCardProps {
  ecoScore: number | null;
  materials: string[];
}

function sustainabilityRating(score: number | null) {
  if (score == null) return "Not rated";
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Developing";
}

/**
 * Eco metrics from persisted product fields only — no invented impact numbers.
 */
export function EcoScoreCard({ ecoScore, materials }: EcoScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="h-5 w-5 text-emerald-600" />
          Eco profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Eco score</span>
          <span className="font-semibold">
            {ecoScore != null ? `${ecoScore}/100` : "Not specified"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Sustainability rating</span>
          <span className="font-semibold">{sustainabilityRating(ecoScore)}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-muted-foreground">Materials / recyclability</span>
          <span className="max-w-[60%] text-right font-medium">
            {materials.length > 0 ? materials.join(", ") : "Not specified"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
          <div className="rounded-lg bg-muted/40 p-2">
            <Recycle className="mx-auto mb-1 h-4 w-4 text-emerald-600" />
            <p className="text-[10px] text-muted-foreground">Plastic recycled</p>
            <p className="text-xs font-medium">Catalog field</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <Leaf className="mx-auto mb-1 h-4 w-4 text-sky-600" />
            <p className="text-[10px] text-muted-foreground">CO₂ saved</p>
            <p className="text-xs font-medium">Future-ready</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <Trees className="mx-auto mb-1 h-4 w-4 text-teal-600" />
            <p className="text-[10px] text-muted-foreground">Trees saved</p>
            <p className="text-xs font-medium">Future-ready</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
