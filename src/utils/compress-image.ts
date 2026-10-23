interface CompressOptions {
  /** Longest side in pixels after resizing. */
  maxSide?: number;
  /** JPEG quality, 0-1. */
  quality?: number;
  /** Files at or under this size that already fit are left untouched. */
  skipUnderBytes?: number;
}

/**
 * Resize and re-encode photos in the browser before uploading.
 * Phone photos (3-8 MB) usually come out at 150-400 KB, which is plenty for
 * AI detection and makes uploads several times faster on mobile data.
 */
export async function compressImage(
  file: File,
  {
    maxSide = 1280,
    quality = 0.8,
    skipUnderBytes = 300 * 1024,
  }: CompressOptions = {},
): Promise<File> {
  if (!file.type.startsWith("image/") && file.type !== "") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Formats the browser can't decode (e.g. some HEIC) go up unchanged.
    return file;
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= maxSide && file.size <= skipUnderBytes) {
    bitmap.close();
    return file;
  }

  const scale = Math.min(1, maxSide / longest);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
  );
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}
