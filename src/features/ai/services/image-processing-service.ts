import "server-only";

import { sniffImageMime } from "@/utils/image-mime";
import { readImageDimensions } from "@/utils/image-dimensions";

export class ImageProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Server-side image validation before proxying to the AI service.
 * Heavy resize/normalize runs in FastAPI; this layer rejects bad inputs early.
 */
export function validateImageBuffer(buffer: Buffer, declaredMime?: string) {
  if (!buffer.length) {
    throw new ImageProcessingError("Image is empty.", "EMPTY_IMAGE");
  }
  if (buffer.length > MAX_BYTES) {
    throw new ImageProcessingError("Image exceeds 10 MB.", "IMAGE_TOO_LARGE");
  }

  const sniffed = sniffImageMime(buffer);
  if (!sniffed) {
    throw new ImageProcessingError("Corrupted or unsupported image.", "CORRUPT_IMAGE");
  }
  if (!ALLOWED.has(sniffed)) {
    throw new ImageProcessingError("Only JPEG, PNG, and WEBP are allowed.", "INVALID_FORMAT");
  }
  if (declaredMime && !ALLOWED.has(declaredMime) && declaredMime !== "application/octet-stream") {
    throw new ImageProcessingError("Declared MIME type is not allowed.", "INVALID_FORMAT");
  }

  const dims = readImageDimensions(buffer, sniffed);
  return {
    mimeType: sniffed === "image/jpg" ? "image/jpeg" : sniffed,
    width: dims?.width ?? null,
    height: dims?.height ?? null,
    bytes: buffer.length,
  };
}

export const ImageProcessingService = {
  validate: validateImageBuffer,
};
