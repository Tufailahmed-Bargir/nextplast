import { sniffImageMime } from "@/utils/image-mime";

function readUInt16BE(buf: Buffer, offset: number): number {
  return buf.readUInt16BE(offset);
}

/** Best-effort JPEG/PNG/WEBP dimension parse without extra native deps. */
export function readImageDimensions(
  buffer: Buffer,
  mimeType: string,
): { width: number; height: number } | null {
  try {
    const kind = sniffImageMime(buffer) ?? mimeType;

    if (kind === "image/png" && buffer.length > 24) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }
    if (
      (kind === "image/jpeg" || kind === "image/jpg") &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8
    ) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        const length = readUInt16BE(buffer, offset + 2);
        if (
          marker >= 0xc0 &&
          marker <= 0xcf &&
          marker !== 0xc4 &&
          marker !== 0xc8 &&
          marker !== 0xcc
        ) {
          return {
            height: readUInt16BE(buffer, offset + 5),
            width: readUInt16BE(buffer, offset + 7),
          };
        }
        offset += 2 + length;
      }
    }
    if (kind === "image/webp" && buffer.length >= 30) {
      const chunk = buffer.toString("ascii", 12, 16);
      if (chunk === "VP8X" && buffer.length >= 30) {
        const width =
          1 + buffer[24]! + (buffer[25]! << 8) + (buffer[26]! << 16);
        const height =
          1 + buffer[27]! + (buffer[28]! << 8) + (buffer[29]! << 16);
        return { width, height };
      }
      if (chunk === "VP8 " && buffer.length >= 30) {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
        };
      }
      if (chunk === "VP8L" && buffer.length >= 25) {
        const bits = buffer.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}
