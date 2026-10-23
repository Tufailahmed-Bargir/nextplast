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

const BOTTLE_CLASSES = new Set<string>(["PET Bottle", "HDPE Bottle"]);

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
  }[];
  plasticTypes: string[];
  estimatedWeightGrams: number;
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
  box_2d: number[];
  confidence: number;
}

interface GeminiDetection {
  isPlasticWaste: boolean;
  imageQuality: "good" | "fair" | "poor";
  items: GeminiItem[];
}

const DETECTION_PROMPT = `You are the plastic-waste detector for NexPlast, a recycling marketplace.
Detect every individual plastic waste item in the photo.
For each item return:
- label: exactly one of ${PLASTIC_CLASSES.join(", ")}. Use "Other" for plastic that fits no label.
- box_2d: [ymin, xmin, ymax, xmax] normalized to 0-1000.
- confidence: 0-1, how sure you are this is that plastic item.
Return one entry per physical item (never two boxes for the same item), at most 50 items.
Set isPlasticWaste to false and items to [] if the photo shows no plastic waste.
Set imageQuality to "poor" for blurry, dark or heavily cropped photos.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    isPlasticWaste: { type: "BOOLEAN" },
    imageQuality: { type: "STRING", enum: ["good", "fair", "poor"] },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING", enum: [...PLASTIC_CLASSES] },
          box_2d: { type: "ARRAY", items: { type: "INTEGER" } },
          confidence: { type: "NUMBER" },
        },
        required: ["label", "box_2d", "confidence"],
      },
    },
  },
  required: ["isPlasticWaste", "imageQuality", "items"],
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
): Promise<GeminiDetection> {
  const response = await geminiFetch(
    `/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
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
  return {
    x: xmin,
    y: ymin,
    w,
    h,
    label,
    confidence: clamp01(Number(item.confidence) || 0),
  };
}

function dominantClass(labels: string[]): string {
  if (labels.length === 0) return "Other";
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);

  const pet = counts.get("PET Bottle") ?? 0;
  const hdpe = counts.get("HDPE Bottle") ?? 0;
  const containerish =
    (counts.get("Container") ?? 0) + (counts.get("Cup") ?? 0);
  if (pet + hdpe > 0 && pet + hdpe >= containerish) {
    return pet >= hdpe ? "PET Bottle" : "HDPE Bottle";
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
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
    detection = await generateDetection(model, buffer, mimeType);
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
  const detectedClass = dominantClass(allBoxes.map((b) => b.label));
  const classBoxes = allBoxes.filter((b) => b.label === detectedClass);
  const scoredBoxes = classBoxes.length > 0 ? classBoxes : allBoxes;

  let confidence =
    scoredBoxes.length > 0
      ? scoredBoxes.reduce((sum, b) => sum + b.confidence, 0) /
        scoredBoxes.length
      : 0.2;
  if (detection.imageQuality === "poor") confidence -= 0.15;
  else if (detection.imageQuality === "fair") confidence -= 0.05;
  confidence = Math.round(clamp01(confidence) * 10000) / 10000;

  const plasticTypes = [...new Set(allBoxes.map((b) => b.label))].sort();
  const detectedCount = classBoxes.length;
  const decision =
    detectedCount === 0
      ? confidence >= 0.35 && detection.isPlasticWaste
        ? "MANUAL_REVIEW"
        : "REJECT"
      : decisionFromConfidence(confidence);

  const estimatedWeightGrams =
    detectedCount === 0
      ? 0
      : estimatePlasticWeightGrams({
          detectedClass,
          detectedCount,
          confidence,
          plasticTypes: BOTTLE_CLASSES.has(detectedClass)
            ? [detectedClass]
            : plasticTypes,
        });

  const parsedOutput = {
    detected_class: detectedCount === 0 ? "Other" : detectedClass,
    detected_count: detectedCount,
    plastic_types: plasticTypes,
    decision,
    estimated_weight_grams: estimatedWeightGrams,
  };

  return {
    detectedClass: parsedOutput.detected_class,
    detectedCount,
    confidence,
    decision,
    boxes: classBoxes,
    plasticTypes,
    estimatedWeightGrams,
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
