import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCollectorDashboardData } from "@/features/collector/services/pickup-queries";
import { PerformanceCard } from "@/features/collector/components/performance-card";
import { DutyToggle } from "@/features/collector/components/duty-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Collector Profile",
};

export default async function CollectorProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getCollectorDashboardData(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Collector profile</h2>
          <p className="text-sm text-muted-foreground">
            {session.user.name ?? session.user.email}
          </p>
        </div>
        <DutyToggle isOnDuty={data.collector.isOnDuty} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email: </span>
              {session.user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Zone: </span>
              {data.collector.zone ?? "Default"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Verification:</span>
              <Badge variant="secondary">
                {data.collector.verificationStatus.toLowerCase()}
              </Badge>
            </div>
            <p>
              <span className="text-muted-foreground">Completed pickups: </span>
              {data.collector.completedPickups}
            </p>
          </CardContent>
        </Card>

        <PerformanceCard
          completedCount={data.stats.completedCount}
          successRate={data.stats.successRate}
          avgVerificationMinutes={data.stats.avgVerificationMinutes}
          totalPlasticGrams={data.stats.totalPlasticGrams}
          rating={data.stats.rating}
        />
      </div>
    </div>
  );
}
