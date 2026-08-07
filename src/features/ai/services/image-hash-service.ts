import "server-only";

import { createHash } from "crypto";

/**
 * SHA-256 content hashing for duplicate-image fraud checks.
 */
export function hashImageBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function hashImageBase64(base64: string): string {
  return createHash("sha256").update(Buffer.from(base64, "base64")).digest("hex");
}

export const ImageHashService = {
  hashBuffer: hashImageBuffer,
  hashBase64: hashImageBase64,
};
