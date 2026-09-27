import { NextRequest } from "next/server";
import { AuthHttpError, requireAuth } from "@/features/auth/services/guards";
import { checkRateLimit } from "@/features/ai/services/rate-limit";
import { reverseGeocode } from "@/features/geo/services/geo-service";
import { reverseGeocodeQuerySchema } from "@/validations/geo";
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
      key: `geo:reverse:${user.id}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!limited.allowed) {
      return apiError("RATE_LIMITED", "Too many location lookups. Try again shortly.", 429);
    }

    const params = request.nextUrl.searchParams;
    const parsed = reverseGeocodeQuerySchema.safeParse({
      lat: params.get("lat") ?? undefined,
      lng: params.get("lng") ?? undefined,
    });
    if (!parsed.success) {
      return apiValidationError(
        parsed.error.flatten(),
        "Your location seems to be outside India.",
      );
    }

    const result = await reverseGeocode(parsed.data.lat, parsed.data.lng);
    if (!result) {
      return apiError(
        "NOT_FOUND",
        "Couldn't find an address for your location. Please type it instead.",
        404,
      );
    }
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof AuthHttpError) return apiUnauthorized();
    return apiServerError("Location lookup failed.");
  }
}
