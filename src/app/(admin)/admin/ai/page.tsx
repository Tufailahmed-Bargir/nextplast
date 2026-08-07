import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { getAiAnalytics } from "@/features/ai/services/ai-analytics";
import { AIAnalyticsCard } from "@/features/ai/components/ai-analytics-card";
import { DetectionHistory } from "@/features/ai/components/detection-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/utils/coin";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "AI Platform" };

async function AdminAiDashboard() {
  const analytics = await getAiAnalytics();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AIAnalyticsCard
          title="Detection requests"
          value={analytics.totals.requests}
          description="Total AiDetectionResult rows"
        />
        <AIAnalyticsCard
          title="Average confidence"
          value={`${Math.round(analytics.averageConfidence * 100)}%`}
          description="Live Prisma aggregate"
        />
        <AIAnalyticsCard
          title="Fraud flags"
          value={analytics.totals.fraudFlags}
          description="Recent detections with alerts"
          hint="Last 200 inference rows"
        />
        <AIAnalyticsCard
          title="Avg processing"
          value={`${Math.round(analytics.averageProcessingMs)} ms`}
          description="From stored processingTimeMs"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Configured: </span>
              {analytics.service.configured ? "yes" : "no (local fallback)"}
            </p>
            <p>
              <span className="text-muted-foreground">Reachable: </span>
              {analytics.service.reachable ? "yes" : "no"}
            </p>
            <p>
              <span className="text-muted-foreground">Name: </span>
              {analytics.service.modelName ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Version: </span>
              {analytics.service.modelVersion ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Loaded: </span>
              {analytics.service.modelLoaded ? "yes" : "no"}
            </p>
            <p>
              <span className="text-muted-foreground">Detection accuracy: </span>
              {Math.round(analytics.detectionAccuracy * 100)}% ACCEPT share
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most common plastic types</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.mostCommonTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No detections yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {analytics.mostCommonTypes.map((t) => (
                  <li key={t.type} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{t.type}</span>
                    <span className="font-medium">
                      {formatNumber(t.count)} · {Math.round(t.avgConfidence * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily detection requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {analytics.dailyRequests.map((d) => (
              <li key={d.day} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{d.day}</span>
                <span className="font-medium">{d.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent detections</CardTitle>
          </CardHeader>
          <CardContent>
            <DetectionHistory items={analytics.recentDetections} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent errors</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentErrors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No AI_INFERENCE_ERROR audit rows in the last 7 days.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.recentErrors.map((err) => (
                  <li key={err.id} className="rounded-lg border border-border p-2">
                    <p className="text-xs text-muted-foreground">
                      {err.createdAt.toLocaleString()}
                    </p>
                    <pre className="mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(err.metadata, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function AdminAiPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">AI Platform</h2>
        <p className="text-sm text-muted-foreground">
          Live YOLOv8 service status and Prisma-backed detection analytics.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        }
      >
        <AdminAiDashboard />
      </Suspense>
    </div>
  );
}
