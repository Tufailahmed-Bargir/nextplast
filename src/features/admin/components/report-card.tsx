import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportCardProps {
  title: string;
  count: number;
  description: string;
  children?: React.ReactNode;
}

export function ReportCard({
  title,
  count,
  description,
  children,
}: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {count} rows · {description}
        </p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
