import { Leaf, TreePine, Wind, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatWeight } from "@/utils/coin";
import type { ImpactSummary } from "@/features/dashboard/types";

interface ImpactCardProps {
  impact: ImpactSummary;
}

/**
 * Environmental impact summary widgets.
 */
export function ImpactCard({ impact }: ImpactCardProps) {
  const items = [
    {
      icon: Leaf,
      label: "Plastic recycled",
      value: formatWeight(impact.plasticRecycledGrams),
    },
    {
      icon: Wind,
      label: "CO₂ reduced",
      value: `${formatNumber(impact.co2SavedKg)} kg`,
    },
    {
      icon: TreePine,
      label: "Trees saved",
      value: formatNumber(impact.treesSaved),
    },
    {
      icon: Droplets,
      label: "Water saved",
      value: `${formatNumber(impact.waterSavedLiters)} L`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
