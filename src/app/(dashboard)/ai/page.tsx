import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { generateRecommendations } from "@/features/ai/services/recommendation-service";
import { getAiServiceStatus } from "@/features/ai/services/ai-client";
import { getAiServiceConfig } from "@/features/ai/services/ai-config";
import { RecommendationCarousel } from "@/features/ai/components/recommendation-carousel";
import { ProcessingTimeline } from "@/features/ai/components/processing-timeline";
import { DetectionResultCard } from "@/features/ai/components/detection-result-card";
import { BoundingBoxViewer } from "@/features/ai/components/bounding-box-viewer";
import { FraudAlert } from "@/features/ai/components/fraud-alert";
import { riskLevelFromAlerts } from "@/features/ai/services/fraud-detection-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { mapListingDetections } from "@/features/plastic/lib/map-detections";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Detection" };

async function UserAiContent({ userId }: { userId: string }) {
  const [recs, status, latestListing] = await Promise.all([
    generateRecommendations(userId, { persist: false }),
    getAiServiceStatus(),
    prisma.plasticListing.findFirst({
      where: { userId, deletedAt: null, aiResults: { some: {} } },
      orderBy: { updatedAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        aiResults: { orderBy: { createdAt: "desc" }, take: 6 },
      },
    }),
  ]);

  const config = getAiServiceConfig();
  const detections = latestListing
    ? mapListingDetections(latestListing.aiResults, latestListing.images)
    : [];

  const timeline = [
    { id: "upload", label: "Image uploaded", done: detections.length > 0 },
    { id: "preprocess", label: "Preprocessing", done: detections.length > 0 },
    { id: "detect", label: "Object detection", done: detections.length > 0 },
    { id: "classify", label: "Classification", done: detections.length > 0 },
    {
      id: "fraud",
      label: "Fraud check",
      done: detections.length > 0,
    },
    { id: "ready", label: "Results ready", done: detections.length > 0 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI service</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          <span>
            {config.configured
              ? status.reachable
                ? `Online · ${status.modelName ?? "model"} ${status.modelVersion ?? ""}`
                : "Configured but unreachable — using local fallback"
              : "AI_SERVICE_URL not set — local image-analysis fallback"}
          </span>
          <Link
            href="/sell"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Run detection on a listing
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessingTimeline steps={timeline} />
          </CardContent>
        </Card>
        <RecommendationCarousel items={recs.items} />
      </div>

      {detections.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No AI results yet. Start from{" "}
            <Link href="/sell" className="font-medium text-emerald-700 underline">
              Sell Plastic
            </Link>{" "}
            to upload photos and run detection.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {detections.map((d) => {
            const risk = riskLevelFromAlerts(
              (d.fraudAlerts ?? []).map((a) => ({
                code: a.code,
                message: a.message,
                severity: a.severity as "low" | "medium" | "high",
              })),
            );
            return (
              <div key={d.id} className="grid gap-4 lg:grid-cols-2">
                {d.imageUrl ? (
                  <BoundingBoxViewer
                    imageUrl={d.imageUrl}
                    boxes={d.boxes ?? []}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
                    Image unavailable
                  </div>
                )}
                <div className="space-y-3">
                  <DetectionResultCard
                    detectedClass={d.detectedClass}
                    detectedCount={d.detectedCount}
                    confidence={d.confidence}
                    decision={d.decision}
                    estimatedWeightGrams={d.estimatedWeightGrams}
                    processingTimeMs={d.processingTimeMs}
                    plasticTypes={d.plasticTypes}
                    risk={risk}
                  />
                  <FraudAlert alerts={d.fraudAlerts ?? []} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function UserAiPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Detection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review plastic detections, confidence, and personalized recommendations.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        }
      >
        <UserAiContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
