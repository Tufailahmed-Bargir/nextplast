import { NextResponse } from "next/server";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";

/**
 * Standardized API response helpers for Route Handlers.
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  status = 200,
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message ? { message } : {}),
    },
    { status },
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status },
  );
}

export function apiUnauthorized(message = "Unauthorized") {
  return apiError("UNAUTHORIZED", message, 401);
}

export function apiForbidden(message = "Forbidden") {
  return apiError("FORBIDDEN", message, 403);
}

export function apiNotFound(message = "Resource not found") {
  return apiError("NOT_FOUND", message, 404);
}

export function apiValidationError(details: unknown, message = "Validation failed") {
  return apiError("VALIDATION_ERROR", message, 422, details);
}

export function apiServerError(message = "Internal server error") {
  return apiError("INTERNAL_ERROR", message, 500);
}
