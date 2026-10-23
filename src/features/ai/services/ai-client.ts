import "server-only";

import { getAiServiceConfig } from "@/features/ai/services/ai-config";
import { hashImageBuffer } from "@/features/ai/services/image-hash-service";
import { estimatePlasticWeightGrams } from "@/features/ai/services/weight-estimation-service";
import { readImageDimensions } from "@/utils/image-dimensions";
import { logger } from "@/utils/logger";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** NexPlast detection labels — same taxonomy the old YOLO service mapped to. */
export const PLASTIC_CLASSES = [
  "PET Bottle",
  "HDPE Bottle",
  "Plastic Bag",
  "Milk Packet",
  "Container",
  "Cup",
  "Bottle Cap",
  "Bucket",
  "PVC",
  "Can",
  "Other",
] as const;

const PRIMARY_TIMEOUT_MS = 15_000;

/** Resin codes — same vocabulary as PLASTIC_TYPES / plastic categories. */
const RESIN_TYPES = [
  "PET",
  "HDPE",
  "PVC",
  "LDPE",
  "PP",
  "PS",
  "OTHER",
] as const;

export interface AiServiceDetectResult {
  detectedClass: string;
  detectedCount: number;
  confidence: number;
  decision: "ACCEPT" | "MANUAL_REVIEW" | "REJECT";
  boxes: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    confidence: number;
    resin?: string;
  }[];
  plasticTypes: string[];
  estimatedWeightGrams: number;
  summary: string;
  processingTimeMs: number;
  modelName: string;
  modelVersion: string;
  image: {
    width: number;
    height: number;
    bytes: number;
    contentHash: string;
    mimeType: string;
    megapixels: number;
  };
  rawOutput: Record<string, unknown>;
  parsedOutput: Record<string, unknown>;
}

export interface AiServiceStatus {
  reachable: boolean;
  status?: string;
  modelLoaded?: boolean;
  modelName?: string;
  modelVersion?: string;
  apiVersion?: string;
  error?: string;
}

interface GeminiItem {
  label: string;
  resin?: string;
  box_2d: number[];
  confidence: number;
}

interface GeminiDetection {
  isPlasticWaste: boolean;
  imageQuality: "good" | "fair" | "poor";
  summary: string;
  items: GeminiItem[];
}

const DETECTION_PROMPT = `You are the plastic-waste detector for NexPlast, a recycling marketplace.
Detect EVERY individual plastic waste item in the photo, of every kind — photos often mix bottles, bags, cups, containers, caps, film and cutlery, and each one must be listed.
For each item return:
- label: exactly one of ${PLASTIC_CLASSES.join(", ")}.
  Bags and loose plastic film or wrap are "Plastic Bag"; food boxes, tubs and trays are "Container"; disposable cups are "Cup"; caps and lids are "Bottle Cap"; cutlery, straws and anything else plastic are "Other".
- resin: the most likely resin code, one of ${RESIN_TYPES.join(", ")} (e.g. water bottle PET, milk jug HDPE, bag/film LDPE, cap/tub PP, cup/cutlery PS).
- box_2d: [ymin, xmin, ymax, xmax] normalized to 0-1000.
- confidence: 0-1, how sure you are about this item.
Return one entry per physical item (never two boxes for the same item), at most 50 items.
summary: 1-2 plain sentences for the seller describing what is in the photo with counts per type and the overall condition (e.g. "4 bottle caps, 1 crushed PET bottle, 1 plastic bag ... Mostly clean, recyclable plastics.").
Set isPlasticWaste to false and items to [] if the photo shows no plastic waste, and say why in summary.
Set imageQuality to "poor" for blurry, dark or heavily cropped photos.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    isPlasticWaste: { type: "BOOLEAN" },
    imageQuality: { type: "STRING", enum: ["good", "fair", "poor"] },
    summary: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING", enum: [...PLASTIC_CLASSES] },
          resin: { type: "STRING", enum: [...RESIN_TYPES] },
          box_2d: { type: "ARRAY", items: { type: "INTEGER" } },
          confidence: { type: "NUMBER" },
        },
        required: ["label", "resin", "box_2d", "confidence"],
      },
    },
  },
  required: ["isPlasticWaste", "imageQuality", "summary", "items"],
};

class GeminiHttpError extends Error {
  constructor(
    readonly status: number,
    detail: string,
  ) {
    super(`GEMINI_HTTP_${status}: ${detail.slice(0, 300)}`);
  }
}

async function geminiFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const config = getAiServiceConfig();
  if (!config.apiKey) {
    throw new Error("AI_SERVICE_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init.timeoutMs ?? config.timeoutMs,
  );

  try {
    return await fetch(`${GEMINI_API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(init.headers ?? {}),
        "x-goog-api-key": config.apiKey,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function generateDetection(
  model: string,
  buffer: Buffer,
  mimeType: string,
  timeoutMs?: number,
): Promise<GeminiDetection> {
  const response = await geminiFetch(
    `/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      timeoutMs,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: buffer.toString("base64"),
                },
              },
              { text: DETECTION_PROMPT },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new GeminiHttpError(
      response.status,
      await response.text().catch(() => ""),
    );
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("");
  if (!text) {
    throw new Error("GEMINI_EMPTY_RESPONSE");
  }

  const parsed = JSON.parse(text) as Partial<GeminiDetection>;
  return {
    isPlasticWaste: parsed.isPlasticWaste ?? false,
    imageQuality: parsed.imageQuality ?? "fair",
    summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
    items: Array.isArray(parsed.items) ? parsed.items : [],
  };
}

/** Retry on quota / overload with the fallback model, which has its own free quota. */
function shouldTryFallback(error: unknown): boolean {
  if (error instanceof GeminiHttpError) {
    return error.status === 429 || error.status >= 500 || error.status === 404;
  }
  return error instanceof Error && error.name === "AbortError";
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function toBox(
  item: GeminiItem,
): AiServiceDetectResult["boxes"][number] | null {
  if (!Array.isArray(item.box_2d) || item.box_2d.length !== 4) return null;
  const [ymin, xmin, ymax, xmax] = item.box_2d.map((v) =>
    clamp01(v / 1000),
  ) as [number, number, number, number];
  const w = xmax - xmin;
  const h = ymax - ymin;
  if (w <= 0 || h <= 0) return null;
  const label = (PLASTIC_CLASSES as readonly string[]).includes(item.label)
    ? item.label
    : "Other";
  const resin =
    item.resin && (RESIN_TYPES as readonly string[]).includes(item.resin)
      ? item.resin
      : undefined;
  return {
    x: xmin,
    y: ymin,
    w,
    h,
    label,
    confidence: clamp01(Number(item.confidence) || 0),
    ...(resin ? { resin } : {}),
  };
}

function countByLabel(labels: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
  return counts;
}

const MIXED_CLASS = "Mixed Plastic";

/**
 * Most frequent label (ties go to the label seen first), or "Mixed Plastic"
 * when several types are present and none makes up most of the items.
 */
function dominantClass(counts: Map<string, number>): string {
  let best = "Other";
  let bestCount = 0;
  let total = 0;
  for (const [label, count] of counts) {
    total += count;
    if (count > bestCount) {
      best = label;
      bestCount = count;
    }
  }
  if (counts.size > 1 && bestCount / total < 0.6) return MIXED_CLASS;
  return best;
}

function decisionFromConfidence(
  confidence: number,
): AiServiceDetectResult["decision"] {
  if (confidence < 0.4) return "REJECT";
  if (confidence < 0.55) return "MANUAL_REVIEW";
  return "ACCEPT";
}

/**
 * Runs plastic detection with Gemini vision and maps it to the detector contract.
 */
export async function callAiDetect(
  buffer: Buffer,
  mimeType: string,
): Promise<AiServiceDetectResult> {
  const started = Date.now();
  const config = getAiServiceConfig();

  let model = config.model;
  let detection: GeminiDetection;
  try {
    // Cap the primary so an overloaded model hands off to the fallback quickly.
    detection = await generateDetection(
      model,
      buffer,
      mimeType,
      config.fallbackModel
        ? Math.min(PRIMARY_TIMEOUT_MS, config.timeoutMs)
        : undefined,
    );
  } catch (error) {
    if (!config.fallbackModel || !shouldTryFallback(error)) {
      logger.error(
        "Gemini detect failed",
        { model, error: error instanceof Error ? error.message : "unknown" },
        "ai-client",
      );
      throw new Error("AI_SERVICE_DETECT_FAILED");
    }
    logger.warn(
      "Gemini primary model failed, using fallback",
      { model, error: error instanceof Error ? error.message : "unknown" },
      "ai-client",
    );
    model = config.fallbackModel;
    try {
      detection = await generateDetection(model, buffer, mimeType);
    } catch (fallbackError) {
      logger.error(
        "Gemini fallback detect failed",
        {
          model,
          error:
            fallbackError instanceof Error ? fallbackError.message : "unknown",
        },
        "ai-client",
      );
      throw new Error("AI_SERVICE_DETECT_FAILED");
    }
  }

  const dims = readImageDimensions(buffer, mimeType);
  const width = dims?.width ?? 0;
  const height = dims?.height ?? 0;
  const bytes = buffer.length;

  const allBoxes = detection.isPlasticWaste
    ? detection.items
        .map(toBox)
        .filter((b): b is NonNullable<typeof b> => b !== null)
    : [];
  const labelCounts = countByLabel(allBoxes.map((b) => b.label));
  const detectedClass = dominantClass(labelCounts);

  let confidence =
    allBoxes.length > 0
      ? allBoxes.reduce((sum, b) => sum + b.confidence, 0) / allBoxes.length
      : 0.2;
  if (detection.imageQuality === "poor") confidence -= 0.15;
  else if (detection.imageQuality === "fair") confidence -= 0.05;
  confidence = Math.round(clamp01(confidence) * 10000) / 10000;

  const plasticTypes = [...labelCounts.keys()].sort();
  // Count every item, not just the dominant type — mixed photos are common.
  const detectedCount = allBoxes.length;
  const decision =
    detectedCount === 0
      ? confidence >= 0.35 && detection.isPlasticWaste
        ? "MANUAL_REVIEW"
        : "REJECT"
      : decisionFromConfidence(confidence);

  const estimatedWeightGrams = [...labelCounts].reduce(
    (sum, [label, count]) =>
      sum +
      estimatePlasticWeightGrams({
        detectedClass: label,
        detectedCount: count,
        confidence,
      }),
    0,
  );

  const parsedOutput = {
    detected_class: detectedCount === 0 ? "Other" : detectedClass,
    detected_count: detectedCount,
    plastic_types: plasticTypes,
    label_counts: Object.fromEntries(labelCounts),
    decision,
    estimated_weight_grams: estimatedWeightGrams,
  };

  return {
    detectedClass: parsedOutput.detected_class,
    detectedCount,
    confidence,
    decision,
    boxes: allBoxes,
    plasticTypes,
    estimatedWeightGrams,
    summary: detection.summary,
    processingTimeMs: Date.now() - started,
    modelName: model,
    modelVersion: "gemini-api-v1beta",
    image: {
      width,
      height,
      bytes,
      contentHash: hashImageBuffer(buffer),
      mimeType,
      megapixels: Math.round(((width * height) / 1_000_000) * 1000) / 1000,
    },
    rawOutput: { gemini: { model, ...detection } },
    parsedOutput,
  };
}

/**
 * Checks the key and model exist without spending generation quota.
 */
export async function getAiServiceStatus(): Promise<AiServiceStatus> {
  const config = getAiServiceConfig();
  if (!config.apiKey) {
    return { reachable: false, error: "AI_SERVICE_NOT_CONFIGURED" };
  }

  try {
    const response = await geminiFetch(
      `/models/${encodeURIComponent(config.model)}`,
      { method: "GET", timeoutMs: 10_000 },
    );
    if (!response.ok) {
      return { reachable: false, error: `GEMINI_${response.status}` };
    }
    const info = (await response.json()) as { version?: string };
    return {
      reachable: true,
      status: "ok",
      modelLoaded: true,
      modelName: config.model,
      modelVersion: info.version,
      apiVersion: "v1beta",
    };
  } catch (error) {
    logger.warn(
      "Gemini unreachable",
      { error: error instanceof Error ? error.message : "unknown" },
      "ai-client",
    );
    return {
      reachable: false,
      error: error instanceof Error ? error.message : "UNREACHABLE",
    };
  }
}
