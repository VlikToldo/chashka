/**
 * Ensures a Cloudinary URL delivers the optimal format (WebP/AVIF) and quality.
 * - Adds f_auto,q_auto if not already present.
 * - Non-Cloudinary URLs (local blobs, etc.) are returned unchanged.
 */
export function getOptimizedUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("f_auto")) return url; // already optimized

  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}
