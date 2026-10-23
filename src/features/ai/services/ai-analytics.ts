import "server-only";

import { AiDecision, Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { getAiServiceStatus } from "@/features/ai/services/ai-client";
import { getAiServiceConfig } from "@/features/ai/services/ai-config";

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Live AI analytics from Prisma AiDetectionResult (+ audit errors).
 */
export async function getAiAnalytics() {
  const now = new Date();
  const days: { key: string; start: Date; end: Date }[] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    days.push({ key: dayKey(start), start, end });
  }

  const [
    total,
    acceptCount,
    reviewCount,
    rejectCount,
    avgConfidence,
    byClass,
    recent,
    failedAudits,
    dailyCounts,
  ] = await Promise.all([
    prisma.aiDetectionResult.count(),
    prisma.aiDetectionResult.count({ where: { decision: AiDecision.ACCEPT } }),
    prisma.aiDetectionResult.count({
      where: { decision: AiDecision.MANUAL_REVIEW },
    }),
    prisma.aiDetectionResult.count({ where: { decision: AiDecision.REJECT } }),
    prisma.aiDetectionResult.aggregate({ _avg: { confidence: true } }),
    prisma.aiDetectionResult.groupBy({
      by: ["detectedClass"],
      _count: { _all: true },
      _avg: { confidence: true },
    }),
    prisma.aiDetectionResult.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        detectedClass: true,
        detectedCount: true,
        confidence: true,
        decision: true,
        createdAt: true,
        rawPayload: true,
        listingId: true,
      },
    }),
    prisma.auditLog.findMany({
      where: {
        action: { in: ["AI_INFERENCE", "AI_INFERENCE_ERROR"] },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    Promise.all(
      days.map(async (d) => ({
        day: d.key,
        count: await prisma.aiDetectionResult.count({
          where: { createdAt: { gte: d.start, lt: d.end } },
        }),
      })),
    ),
  ]);

  let processingTimes: number[] = [];
  let fraudFlagCount = 0;
  for (const row of recent) {
    const payload = row.rawPayload as {
      processingTimeMs?: number;
      fraudAlerts?: unknown[];
    } | null;
    if (typeof payload?.processingTimeMs === "number") {
      processingTimes.push(payload.processingTimeMs);
    }
    if (Array.isArray(payload?.fraudAlerts) && payload.fraudAlerts.length > 0) {
      fraudFlagCount += 1;
    }
  }

  // Broader fraud scan on last 200 rows for dashboard KPI.
  const recentForFraud = await prisma.aiDetectionResult.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    select: { rawPayload: true },
  });
  fraudFlagCount = recentForFraud.filter((row) => {
    const payload = row.rawPayload as { fraudAlerts?: unknown[] } | null;
    return (
      Array.isArray(payload?.fraudAlerts) && payload.fraudAlerts.length > 0
    );
  }).length;

  processingTimes = [];
  for (const row of recentForFraud) {
    const payload = row.rawPayload as { processingTimeMs?: number } | null;
    if (typeof payload?.processingTimeMs === "number") {
      processingTimes.push(payload.processingTimeMs);
    }
  }

  const avgProcessingMs =
    processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

  const accuracyDenom = acceptCount + reviewCount + rejectCount;
  const detectionAccuracy = accuracyDenom > 0 ? acceptCount / accuracyDenom : 0;

  const service = await getAiServiceStatus();
  const config = getAiServiceConfig();

  const recentErrors = failedAudits
    .filter((a) => a.action === "AI_INFERENCE_ERROR")
    .map((a) => ({
      id: a.id,
      createdAt: a.createdAt,
      metadata: a.metadata as Prisma.JsonValue,
    }));

  return {
    totals: {
      requests: total,
      accept: acceptCount,
      manualReview: reviewCount,
      reject: rejectCount,
      failedDetections: rejectCount,
      fraudFlags: fraudFlagCount,
    },
    detectionAccuracy,
    averageConfidence: Number(avgConfidence._avg.confidence ?? 0),
    averageProcessingMs: avgProcessingMs,
    mostCommonTypes: byClass
      .map((c) => ({
        type: c.detectedClass,
        count: c._count._all,
        avgConfidence: Number(c._avg.confidence ?? 0),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    dailyRequests: dailyCounts,
    recentDetections: recent.map((r) => ({
      id: r.id,
      listingId: r.listingId,
      detectedClass: r.detectedClass,
      detectedCount: r.detectedCount,
      confidence: Number(r.confidence),
      decision: r.decision,
      createdAt: r.createdAt,
      processingTimeMs:
        typeof (r.rawPayload as { processingTimeMs?: number } | null)
          ?.processingTimeMs === "number"
          ? (r.rawPayload as { processingTimeMs: number }).processingTimeMs
          : null,
    })),
    recentErrors,
    service: {
      configured: config.configured,
      ...service,
    },
  };
}

export const AiAnalyticsService = {
  get: getAiAnalytics,
};
