import "server-only";

/**
 * Optional AI service configuration.
 * Reads process.env directly so existing .env files remain valid without new required keys.
 */
export function getAiServiceConfig() {
  const url = (process.env.AI_SERVICE_URL ?? "").trim().replace(/\/$/, "");
  const apiKey = (process.env.AI_SERVICE_API_KEY ?? "").trim();
  return {
    url: url || null,
    apiKey: apiKey || null,
    configured: Boolean(url),
    timeoutMs: Number(process.env.AI_SERVICE_TIMEOUT_MS ?? 60_000) || 60_000,
  };
}
