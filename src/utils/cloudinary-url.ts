const UPLOAD_MARKER = "/image/upload/";

/**
 * Asks Cloudinary for a resized, auto-format (WebP/AVIF) copy instead of the
 * original upload. Non-Cloudinary URLs are returned unchanged.
 */
export function optimizedImageUrl(url: string, width: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes(UPLOAD_MARKER)) {
    return url;
  }
  return url.replace(
    UPLOAD_MARKER,
    `${UPLOAD_MARKER}f_auto,q_auto,c_limit,w_${width}/`,
  );
}
