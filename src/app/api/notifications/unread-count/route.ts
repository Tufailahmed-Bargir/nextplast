import { prisma } from "@/prisma";
import { AuthHttpError, requireAuth } from "@/features/auth/services/guards";
import { checkRateLimit } from "@/features/ai/services/rate-limit";
import {
  apiError,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
} from "@/utils/api-response";

export async function GET() {
  try {
    const user = await requireAuth();
    const limited = checkRateLimit({
      key: `notifications:unread:${user.id}`,
      limit: 120,
      windowMs: 60_000,
    });
    if (!limited.allowed) {
      return apiError("RATE_LIMITED", "Too many requests. Try again shortly.", 429);
    }

    const count = await prisma.notification.count({
      where: { userId: user.id, readAt: null },
    });
    return apiSuccess({ count });
  } catch (error) {
    if (error instanceof AuthHttpError) return apiUnauthorized();
    return apiServerError("Could not load notifications.");
  }
}
