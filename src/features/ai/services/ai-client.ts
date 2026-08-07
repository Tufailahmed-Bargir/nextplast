import "server-only";

import { getAiServiceConfig } from "@/features/ai/services/ai-config";
import { logger } from "@/utils/logger";

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

async function aiFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const config = getAiServiceConfig();
  if (!config.url) {
    throw new Error("AI_SERVICE_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init?.timeoutMs ?? config.timeoutMs,
  );

  try {
    return await fetch(`${config.url}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(init?.headers ?? {}),
        ...(config.apiKey ? { "X-AI-API-Key": config.apiKey } : {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function callAiDetect(
  buffer: Buffer,
  mimeType: string,
  filename = "plastic.jpg",
): Promise<AiServiceDetectResult> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  form.append("image", blob, filename);

  const response = await aiFetch("/detect", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    logger.error("AI detect failed", { status: response.status, detail }, "ai-client");
    throw new Error("AI_SERVICE_DETECT_FAILED");
  }

  const data = (await response.json()) as {
    detected_class: string;
    detected_count: number;
    confidence: number;
    decision: "ACCEPT" | "MANUAL_REVIEW" | "REJECT";
    boxes: AiServiceDetectResult["boxes"];
    plastic_types: string[];
    estimated_weight_grams: number;
    processing_time_ms: number;
    model_name: string;
    model_version: string;
    image: {
      width: number;
      height: number;
      bytes: number;
      content_hash: string;
      mime_type: string;
      megapixels: number;
    };
    raw_output: Record<string, unknown>;
    parsed_output: Record<string, unknown>;
  };

  return {
    detectedClass: data.detected_class,
    detectedCount: data.detected_count,
    confidence: data.confidence,
    decision: data.decision,
    boxes: data.boxes ?? [],
    plasticTypes: data.plastic_types ?? [],
    estimatedWeightGrams: data.estimated_weight_grams,
    processingTimeMs: data.processing_time_ms,
    modelName: data.model_name,
    modelVersion: data.model_version,
    image: {
      width: data.image.width,
      height: data.image.height,
      bytes: data.image.bytes,
      contentHash: data.image.content_hash,
      mimeType: data.image.mime_type,
      megapixels: data.image.megapixels,
    },
    rawOutput: data.raw_output ?? {},
    parsedOutput: data.parsed_output ?? {},
  };
}

export async function getAiServiceStatus(): Promise<AiServiceStatus> {
  const config = getAiServiceConfig();
  if (!config.url) {
    return { reachable: false, error: "AI_SERVICE_NOT_CONFIGURED" };
  }

  try {
    const [healthRes, versionRes] = await Promise.all([
      aiFetch("/health", { method: "GET", timeoutMs: 8_000 }),
      aiFetch("/version", { method: "GET", timeoutMs: 8_000 }),
    ]);

    if (!healthRes.ok) {
      return { reachable: false, error: `HEALTH_${healthRes.status}` };
    }

    const health = (await healthRes.json()) as {
      status: string;
      model_loaded: boolean;
      model_name: string;
      model_version: string;
    };

    let apiVersion: string | undefined;
    if (versionRes.ok) {
      const version = (await versionRes.json()) as { api_version?: string };
      apiVersion = version.api_version;
    }

    return {
      reachable: true,
      status: health.status,
      modelLoaded: health.model_loaded,
      modelName: health.model_name,
      modelVersion: health.model_version,
      apiVersion,
    };
  } catch (error) {
    logger.warn(
      "AI service unreachable",
      { error: error instanceof Error ? error.message : "unknown" },
      "ai-client",
    );
    return {
      reachable: false,
      error: error instanceof Error ? error.message : "UNREACHABLE",
    };
  }
}
