import { NextRequest } from "next/server";
import {
  AuthHttpError,
  requireAuth,
} from "@/features/auth/services/guards";
import { generateRecommendations } from "@/features/ai/services/recommendation-service";
import { checkRateLimit } from "@/features/ai/services/rate-limit";
import { aiRecommendBodySchema } from "@/validations/ai";
import {
  apiError,
  apiForbidden,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
  apiValidationError,
} from "@/utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const limited = checkRateLimit({
      key: `ai:recommend:${user.id}`,
      limit: 30,
      windowMs: 60_000,
    });
    if (!limited.allowed) {
      return apiError("RATE_LIMITED", "Too many recommendation requests.", 429);
    }

    const json = await request.json().catch(() => ({}));
    const parsed = aiRecommendBodySchema.safeParse(json);
    if (!parsed.success) {
      return apiValidationError(parsed.error.flatten());
    }

    const result = await generateRecommendations(user.id);
    const limit = parsed.data.limit ?? 6;
    return apiSuccess({
      ...result,
      items: result.items.slice(0, limit),
    });
  } catch (error) {
    if (error instanceof AuthHttpError) {
      if (error.code === "UNAUTHORIZED") return apiUnauthorized();
      return apiForbidden(error.message);
    }
    return apiServerError("Recommendation failed.");
  }
}
