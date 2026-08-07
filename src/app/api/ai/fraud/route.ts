import { NextRequest } from "next/server";
import {
  AuthHttpError,
  requireAuth,
} from "@/features/auth/services/guards";
import { evaluateFraud } from "@/features/ai/services/fraud-detection-service";
import { riskLevelFromAlerts } from "@/features/ai/services/fraud-detection-service";
import { checkRateLimit } from "@/features/ai/services/rate-limit";
import { aiFraudBodySchema } from "@/validations/ai";
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
      key: `ai:fraud:${user.id}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!limited.allowed) {
      return apiError("RATE_LIMITED", "Too many fraud evaluation requests.", 429);
    }

    const json = await request.json();
    const parsed = aiFraudBodySchema.safeParse(json);
    if (!parsed.success) {
      return apiValidationError(parsed.error.flatten());
    }

    const alerts = evaluateFraud(parsed.data);
    return apiSuccess({
      alerts,
      risk: riskLevelFromAlerts(alerts),
    });
  } catch (error) {
    if (error instanceof AuthHttpError) {
      if (error.code === "UNAUTHORIZED") return apiUnauthorized();
      return apiForbidden(error.message);
    }
    return apiServerError("Fraud evaluation failed.");
  }
}
