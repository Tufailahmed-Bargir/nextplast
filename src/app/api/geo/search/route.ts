import { NextRequest } from "next/server";
import { AuthHttpError, requireAuth } from "@/features/auth/services/guards";
import { checkRateLimit } from "@/features/ai/services/rate-limit";
import { searchPlaces } from "@/features/geo/services/geo-service";
import { placeSearchQuerySchema } from "@/validations/geo";
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
      key: `geo:search:${user.id}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!limited.allowed) {
      return apiError("RATE_LIMITED", "Too many searches. Slow down a little.", 429);
    }

    const params = request.nextUrl.searchParams;
    const parsed = placeSearchQuerySchema.safeParse({
      q: params.get("q") ?? "",
      lat: params.get("lat") ?? undefined,
      lng: params.get("lng") ?? undefined,
    });
    if (!parsed.success) return apiValidationError(parsed.error.flatten());

    const suggestions = await searchPlaces({
      query: parsed.data.q,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
    });
    return apiSuccess({ suggestions });
  } catch (error) {
    if (error instanceof AuthHttpError) return apiUnauthorized();
    return apiServerError("Address search failed.");
  }
}
