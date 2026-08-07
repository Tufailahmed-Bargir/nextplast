import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatWeight } from "@/utils/coin";

interface PerformanceCardProps {
  completedCount: number;
  successRate: number;
  avgVerificationMinutes: number | null;
  totalPlasticGrams: number;
  rating?: number;
}

/**
 * Collector performance summary.
 */
export function PerformanceCard({
  completedCount,
  successRate,
  avgVerificationMinutes,
  totalPlasticGrams,
  rating,
}: PerformanceCardProps) {
  const rows = [
    { label: "Completed pickups", value: formatNumber(completedCount) },
    { label: "Success rate", value: `${successRate}%` },
    {
      label: "Avg. verification time",
      value:
        avgVerificationMinutes != null
          ? `${avgVerificationMinutes} min`
          : "—",
    },
    {
      label: "Total plastic collected",
      value: formatWeight(totalPlasticGrams),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Performance</CardTitle>
        {rating != null && rating > 0 ? (
          <p className="text-sm text-muted-foreground">
            Rating {rating.toFixed(1)} ★
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
