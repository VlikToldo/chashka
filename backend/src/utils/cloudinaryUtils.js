import cloudinary from "../config/cloudinary.js";

/**
 * Extracts the Cloudinary public_id from a Cloudinary URL.
 * Handles both versioned and non-versioned URLs.
 * Example: https://res.cloudinary.com/cloud/image/upload/v123/chashka/menu-items/abc.jpg
 *          → "chashka/menu-items/abc"
 */
export function extractPublicId(url) {
  if (!url || typeof url !== "string") return null;
  // Match everything after /upload/ (skip optional v\d+/)
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
}

/**
 * Deletes an image from Cloudinary by its URL.
 * Logs a warning on failure but does not throw — deletion is best-effort.
 */
export async function deleteCloudinaryImage(url) {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("[cloudinary] Failed to delete image:", publicId, err.message);
  }
}
