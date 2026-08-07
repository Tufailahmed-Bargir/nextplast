/**
 * Shared image MIME sniffing / resolution (no server-only — Buffer-safe helpers).
 */
import { ACCEPTED_IMAGE_TYPES } from "@/validations/plastic";

export function sniffImageMime(buffer: Buffer): string | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function resolveImageMime(buffer: Buffer, claimed?: string): string {
  const sniffed = sniffImageMime(buffer);
  if (sniffed) return sniffed;
  if (
    claimed &&
    ACCEPTED_IMAGE_TYPES.includes(
      claimed as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return claimed === "image/jpg" ? "image/jpeg" : claimed;
  }
  throw new Error("INVALID_IMAGE_TYPE");
}
