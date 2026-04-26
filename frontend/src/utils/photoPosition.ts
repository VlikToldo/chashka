import type { CSSProperties } from "react";

// ar = naturalWidth / naturalHeight of the original image
export type PhotoPosition = {
  x: number;
  y: number;
  scale: number;
  ar?: number;
};

export const DEFAULT_POSITION: PhotoPosition = { x: 0, y: 0, scale: 1 };

/** Parse JSON position string. Falls back to default if invalid. */
export function parsePosition(raw: string): PhotoPosition {
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.x === "number" &&
      typeof parsed.y === "number" &&
      typeof parsed.scale === "number"
    ) {
      return parsed;
    }
  } catch {}
  return DEFAULT_POSITION;
}

/** Serialize position to compact JSON string for backend storage. */
export function positionToString(pos: PhotoPosition): string {
  return JSON.stringify({
    x: +pos.x.toFixed(3),
    y: +pos.y.toFixed(3),
    scale: +pos.scale.toFixed(3),
    ...(pos.ar !== undefined ? { ar: +pos.ar.toFixed(4) } : {}),
  });
}

/**
 * Style for the wrapper div that sizes and positions the image inside a
 * `position: relative; overflow: hidden` container.
 *
 * At scale=1 the image covers the container with no empty edges (CSS cover logic).
 * x, y are pan offset in % of container (0 = centered).
 *
 * @param pos      - photo position/scale/ar data
 * @param frameAr  - aspect ratio (width/height) of the container; defaults to 1 (square)
 */
export function getWrapperStyle(pos: PhotoPosition, frameAr = 1): CSSProperties {
  const ar = pos.ar ?? 1;
  const s = pos.scale;
  // Cover logic: compare image ar vs frame ar to decide which side fills 100%
  const wPct = (ar >= frameAr ? (ar / frameAr) * s : s) * 100;
  const hPct = (ar >= frameAr ? s : (frameAr / ar) * s) * 100;

  return {
    position: "absolute",
    width: `${wPct}%`,
    height: `${hPct}%`,
    left: `${50 + pos.x}%`,
    top: `${50 + pos.y}%`,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    userSelect: "none",
    flexShrink: 0,
  };
}

/** Style for the img element inside the wrapper div. */
export const imgStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  pointerEvents: "none",
  userSelect: "none",
};

/**
 * Clamp x/y so the image always covers the container (no empty edges visible).
 *
 * @param pos      - photo position data
 * @param frameAr  - aspect ratio (width/height) of the container; defaults to 1 (square)
 */
export function clampPosition(pos: PhotoPosition, frameAr = 1): PhotoPosition {
  const ar = pos.ar ?? 1;
  const s = pos.scale;
  const wPct = (ar >= frameAr ? (ar / frameAr) * s : s) * 100;
  const hPct = (ar >= frameAr ? s : (frameAr / ar) * s) * 100;

  const maxX = Math.max(0, (wPct - 100) / 2);
  const maxY = Math.max(0, (hPct - 100) / 2);

  return {
    ...pos,
    x: Math.max(-maxX, Math.min(maxX, pos.x)),
    y: Math.max(-maxY, Math.min(maxY, pos.y)),
  };
}

/** @deprecated Use getWrapperStyle + imgStyle with a wrapper div instead. */
export function getPhotoStyle(pos: PhotoPosition): CSSProperties {
  return getWrapperStyle(pos);
}
