"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartPoint } from "@/features/dashboard/types";

interface ChartCardProps {
  title: string;
  description?: string;
  data: ChartPoint[];
  valueLabel?: string;
  emptyMessage?: string;
  color?: string;
}

/**
 * Compact bar chart for dashboard analytics (Recharts).
 */
export function ChartCard({
  title,
  description,
  data,
  valueLabel = "Value",
  emptyMessage = "No data for this period yet.",
  color = "#10b981",
}: ChartCardProps) {
  const hasValues = data.some((d) => d.value > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        {!hasValues ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={36}
                />
                <Tooltip
                  formatter={(value) => [
                    typeof value === "number" ? value : String(value ?? ""),
                    valueLabel,
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
