import { apiSuccess, apiServerError } from "@/utils/api-response";
import { checkDatabaseConnection } from "@/prisma";

/**
 * Health check endpoint — verifies app + database connectivity.
 */
export async function GET() {
  try {
    const dbOk = await checkDatabaseConnection();

    return apiSuccess({
      status: dbOk ? "healthy" : "degraded",
      app: "nexplast",
      database: dbOk ? "connected" : "unreachable",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return apiServerError("Health check failed");
  }
}
