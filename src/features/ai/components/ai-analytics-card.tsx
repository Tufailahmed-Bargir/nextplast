import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/utils/coin";

interface AIAnalyticsCardProps {
  title: string;
  description?: string;
  value: string | number;
  hint?: string;
}

export function AIAnalyticsCard({
  title,
  description,
  value,
  hint,
}: AIAnalyticsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-bold">
          {typeof value === "number" ? formatNumber(value) : value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
