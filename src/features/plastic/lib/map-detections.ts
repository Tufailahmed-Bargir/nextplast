/**
 * Shared mapping from Prisma AI rows + images to DetectionSummary view models.
 */

export interface DetectionImageRef {
  id: string;
  url: string;
}

export interface DetectionResultRef {
  id: string;
  listingImageId: string | null;
  detectedClass: string;
  detectedCount: number;
  userConfirmedCount: number | null;
  userConfirmedClass: string | null;
  confidence: { toString(): string } | number;
  decision: string;
  matchedClaimed: boolean | null;
  rawPayload: unknown;
}

export function mapListingDetections(
  aiResults: DetectionResultRef[],
  images: DetectionImageRef[],
) {
  return aiResults.map((result) => {
    const image = images.find((img) => img.id === result.listingImageId);
    const payload = result.rawPayload as {
      boxes?: {
        x: number;
        y: number;
        w: number;
        h: number;
        label: string;
        confidence: number;
        resin?: string;
      }[];
      fraudAlerts?: { code: string; message: string; severity: string }[];
      estimatedWeightGrams?: number;
      processingTimeMs?: number;
      plasticTypes?: string[];
      summary?: string | null;
    } | null;

    return {
      id: result.id,
      listingImageId: result.listingImageId,
      detectedClass: result.detectedClass,
      detectedCount: result.detectedCount,
      userConfirmedCount: result.userConfirmedCount,
      userConfirmedClass: result.userConfirmedClass,
      confidence: Number(result.confidence),
      decision: result.decision,
      matchedClaimed: result.matchedClaimed,
      imageUrl: image?.url ?? null,
      boxes: payload?.boxes,
      fraudAlerts: payload?.fraudAlerts,
      estimatedWeightGrams: payload?.estimatedWeightGrams ?? null,
      processingTimeMs: payload?.processingTimeMs ?? null,
      plasticTypes: payload?.plasticTypes ?? [],
      summary: payload?.summary ?? null,
    };
  });
}
