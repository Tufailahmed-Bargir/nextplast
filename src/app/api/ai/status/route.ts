import {
  AuthHttpError,
  requireAuth,
} from "@/features/auth/services/guards";
import { isAdmin } from "@/utils/roles";
import { getAiServiceStatus } from "@/features/ai/services/ai-client";
import { getAiServiceConfig } from "@/features/ai/services/ai-config";
import { getAiAnalytics } from "@/features/ai/services/ai-analytics";
import {
  apiForbidden,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
} from "@/utils/api-response";

/**
 * AI platform status for authenticated users.
 * Admins also receive live Prisma analytics summary.
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const config = getAiServiceConfig();
    const service = await getAiServiceStatus();

    if (!isAdmin(user.role)) {
      return apiSuccess({
        configured: config.configured,
        service,
      });
    }

    const analytics = await getAiAnalytics();
    return apiSuccess({
      configured: config.configured,
      service,
      analytics: {
        totals: analytics.totals,
        detectionAccuracy: analytics.detectionAccuracy,
        averageConfidence: analytics.averageConfidence,
        averageProcessingMs: analytics.averageProcessingMs,
        model: {
          name: service.modelName,
          version: service.modelVersion,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthHttpError) {
      if (error.code === "UNAUTHORIZED") return apiUnauthorized();
      return apiForbidden(error.message);
    }
    return apiServerError("AI status check failed.");
  }
}
