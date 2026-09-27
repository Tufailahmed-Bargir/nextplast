import { NextRequest } from "next/server";
import { AuthHttpError, requireAuth } from "@/features/auth/services/guards";
import { checkRateLimit } from "@/features/ai/services/rate-limit";
import { lookupPincode } from "@/features/geo/services/geo-service";
import { pincodeQuerySchema } from "@/validations/geo";
import {
  apiError,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
  apiValidationError,
} from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const limited = checkRateLimit({
      key: `geo:pincode:${user.id}`,
      limit: 30,
      windowMs: 60_000,
    });
    if (!limited.allowed) {
      return apiError("RATE_LIMITED", "Too many PIN lookups. Try again shortly.", 429);
    }

    const parsed = pincodeQuerySchema.safeParse({
      pin: request.nextUrl.searchParams.get("pin") ?? "",
    });
    if (!parsed.success) return apiValidationError(parsed.error.flatten());

    return apiSuccess(await lookupPincode(parsed.data.pin));
  } catch (error) {
    if (error instanceof AuthHttpError) return apiUnauthorized();
    return apiServerError("PIN lookup failed.");
  }
}
