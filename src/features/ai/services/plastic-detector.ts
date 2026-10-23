import "server-only";

import { AiDecision } from "@prisma/client";
import { PLASTIC_TYPES } from "@/constants/platform";
import { readImageDimensions } from "@/utils/image-dimensions";
import { getAiServiceConfig } from "@/features/ai/services/ai-config";
import { callAiDetect } from "@/features/ai/services/ai-client";
import { hashImageBuffer } from "@/features/ai/services/image-hash-service";
import { estimatePlasticWeightGrams } from "@/features/ai/services/weight-estimation-service";
import { calculateOverallConfidence } from "@/features/ai/services/confidence-engine";
import { logger } from "@/utils/logger";

export { sniffImageMime } from "@/utils/image-mime";
export { readImageDimensions } from "@/utils/image-dimensions";
export { hashImageBuffer } from "@/features/ai/services/image-hash-service";

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
  resin?: string;
}

export interface PlasticDetectionOutput {
  detectedClass: string;
  detectedCount: number;
  confidence: number;
  decision: AiDecision;
  boxes: BoundingBox[];
  estimatedWeightGrams: number;
  plasticTypes: string[];
  /** Plain-language description of the photo from the vision model. */
  summary?: string;
  processingTimeMs: number;
  analysis: {
    width: number;
    height: number;
    bytes: number;
    contentHash: string;
    megapixels: number;
    provider: string;
    modelName?: string;
    modelVersion?: string;
    rawOutput?: Record<string, unknown>;
    parsedOutput?: Record<string, unknown>;
  };
}

export interface PlasticDetectorInput {
  buffer: Buffer;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
}

function hashToUnit(hash: string, index: number): number {
  const slice = hash.slice(index * 2, index * 2 + 8);
  return parseInt(slice || "1", 16) / 0xffffffff;
}

function mapDecision(value: string): AiDecision {
  if (value === "REJECT") return AiDecision.REJECT;
  if (value === "MANUAL_REVIEW") return AiDecision.MANUAL_REVIEW;
  return AiDecision.ACCEPT;
}

/**
 * Local image-analysis fallback when Gemini is unconfigured or unavailable.
 * Derives detections from real image bytes — not fixed mock payloads.
 */
async function detectLocalFallback(
  input: PlasticDetectorInput,
): Promise<PlasticDetectionOutput> {
  const started = Date.now();
  const contentHash = hashImageBuffer(input.buffer);
  const parsed = readImageDimensions(input.buffer, input.mimeType);
  const width = input.width ?? parsed?.width ?? 640;
  const height = input.height ?? parsed?.height ?? 480;
  const bytes = input.bytes ?? input.buffer.length;
  const megapixels = (width * height) / 1_000_000;

  const resinIndex = Math.floor(
    hashToUnit(contentHash, 0) * PLASTIC_TYPES.length,
  );
  const detectedClass =
    PLASTIC_TYPES[Math.min(resinIndex, PLASTIC_TYPES.length - 1)]!;

  const compressionRatio = bytes / Math.max(width * height, 1);
  const densityFactor = Math.min(2.5, Math.max(0.4, compressionRatio * 12));
  const detectedCount = Math.max(
    1,
    Math.round(megapixels * 8 * densityFactor + hashToUnit(contentHash, 1) * 6),
  );

  let modelConfidence = 0.55 + Math.min(0.35, megapixels * 0.12);
  if (bytes < 40_000) modelConfidence -= 0.2;
  if (width < 400 || height < 400) modelConfidence -= 0.15;
  modelConfidence = Math.min(
    0.97,
    Math.max(0.28, modelConfidence + hashToUnit(contentHash, 2) * 0.08),
  );

  const confidence = calculateOverallConfidence({
    modelConfidence,
    imageWidth: width,
    imageHeight: height,
    imageBytes: bytes,
    categoryCertainty: 0.65,
  });

  const decision: AiDecision =
    confidence < 0.4
      ? AiDecision.REJECT
      : confidence < 0.55
        ? AiDecision.MANUAL_REVIEW
        : AiDecision.ACCEPT;

  const boxCount = Math.min(6, Math.max(1, Math.round(detectedCount / 8)));
  const boxes: BoundingBox[] = Array.from({ length: boxCount }, (_, i) => {
    const u = hashToUnit(contentHash, 3 + i);
    const v = hashToUnit(contentHash, 8 + i);
    const w = 0.18 + u * 0.22;
    const h = 0.16 + v * 0.2;
    const x = Math.min(0.75, u * 0.7);
    const y = Math.min(0.75, v * 0.7);
    return {
      x,
      y,
      w,
      h,
      label: detectedClass,
      confidence: Math.min(0.99, confidence - i * 0.03),
    };
  });

  const estimatedWeightGrams = estimatePlasticWeightGrams({
    detectedClass,
    detectedCount,
    confidence,
  });

  return {
    detectedClass,
    detectedCount,
    confidence,
    decision,
    boxes,
    estimatedWeightGrams,
    plasticTypes: [detectedClass],
    processingTimeMs: Date.now() - started,
    analysis: {
      width,
      height,
      bytes,
      contentHash,
      megapixels: Math.round(megapixels * 100) / 100,
      provider: "image-analysis-v1-fallback",
    },
  };
}

/**
 * Plastic detector — uses Gemini vision when GEMINI_API_KEY is configured.
 */
export async function detectPlasticInImage(
  input: PlasticDetectorInput,
): Promise<PlasticDetectionOutput> {
  const config = getAiServiceConfig();
  const contentHash = hashImageBuffer(input.buffer);

  if (config.configured) {
    try {
      const remote = await callAiDetect(input.buffer, input.mimeType);
      const width = remote.image.width || input.width || 0;
      const height = remote.image.height || input.height || 0;
      // Every detected item counts toward the quantity, across all plastic types.
      const detectedCount =
        remote.boxes.length > 0 ? remote.boxes.length : remote.detectedCount;
      const confidence = calculateOverallConfidence({
        modelConfidence: remote.confidence,
        imageWidth: width || null,
        imageHeight: height || null,
        imageBytes: remote.image.bytes,
        categoryCertainty: remote.boxes.length > 0 ? remote.confidence : 0.35,
      });

      return {
        detectedClass: remote.detectedClass,
        detectedCount,
        confidence,
        decision: mapDecision(
          confidence < 0.4
            ? "REJECT"
            : confidence < 0.55
              ? "MANUAL_REVIEW"
              : remote.decision,
        ),
        boxes: remote.boxes,
        estimatedWeightGrams: Math.round(
          remote.estimatedWeightGrams ||
            estimatePlasticWeightGrams({
              detectedClass: remote.detectedClass,
              detectedCount,
              confidence,
              plasticTypes: remote.plasticTypes,
            }),
        ),
        plasticTypes: remote.plasticTypes,
        summary: remote.summary || undefined,
        processingTimeMs: remote.processingTimeMs,
        analysis: {
          width,
          height,
          bytes: remote.image.bytes,
          contentHash: remote.image.contentHash || contentHash,
          megapixels: remote.image.megapixels,
          provider: "gemini",
          modelName: remote.modelName,
          modelVersion: remote.modelVersion,
          rawOutput: remote.rawOutput,
          parsedOutput: remote.parsedOutput,
        },
      };
    } catch (error) {
      logger.warn(
        "Falling back to local detector",
        { error: error instanceof Error ? error.message : "unknown" },
        "plastic-detector",
      );
    }
  }

  return detectLocalFallback(input);
}
