import "server-only";

/**
 * Gemini vision configuration.
 * Reads process.env directly so existing .env files remain valid without new required keys.
 */
export function getAiServiceConfig() {
  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  const model = (process.env.GEMINI_MODEL ?? "").trim() || "gemini-3.8-flash";
  const fallbackModel =
    (process.env.GEMINI_FALLBACK_MODEL ?? "").trim() || "gemini-3.5-flash-lite";
  return {
    apiKey: apiKey || null,
    model,
    fallbackModel: fallbackModel === model ? null : fallbackModel,
    configured: Boolean(apiKey),
    timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS ?? 45_000) || 45_000,
  };
}
