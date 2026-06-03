/**
 * Sky Vase — date + latitude → anodised gradient.
 *
 * Implements VASE_GRADIENT_SPEC.md Part A (date/lat → voltage profile) verbatim,
 * and renders it (Part B) by crossfading 6 stacked vase photos with vertical
 * alpha masks.
 *
 * Deviation from the spec's *recommended* CSS: the spec's `maskForImage` gives
 * each image a triangular "bump" mask (opaque at its own anchor, transparent at
 * both neighbours). Stacked with `over` compositing those bumps don't sum to
 * full opacity at crossfade midpoints (αᵢ + αᵢ₊₁·(1−αᵢ) < 1), so the page would
 * show through the vase. We instead use *cumulative-reveal* masks: the lowest
 * image is a solid base and each image above is opaque from its own anchor
 * downward, ramping in over the gap from the previous anchor. With a solid layer
 * always beneath the fading top layer, `over` compositing yields an exact
 * lerp(Cᵢ, Cᵢ₊₁, f) with no transparency. Same anchors, same maths.
 */

// vase_1 … vase_6 anodisation voltages (top → bottom).
export const IMAGE_VOLTAGES = [20, 30, 37, 47, 58, 64];

const V_TOP = 20;
const V_BOTTOM = 64;

const Z1_BASE = 0.25;
const Z1_RANGE = 0.5; // top solid-blue band
const Z3_MIN = 0.015;
const Z3_MAX = 0.075; // bottom solid-pink band

export const DEFAULT_LAT = 51.5;

// Vase body band within the source images (1066 × 2267): rows 761 … 2081.
// Everything outside this band is identical across all 6 photos.
export const VASE_BAND_TOP = 761 / 2267;
export const VASE_BAND_BOTTOM = 2081 / 2267;

/** Hours of daylight for `date` at latitude `lat` (degrees). Longitude unused. */
export function daylightHours(date: Date, lat: number): number {
  const doy = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const decRad =
    ((23.45 * Math.PI) / 180) * Math.sin(((2 * Math.PI) / 365) * (doy - 81));
  const latRad = (lat * Math.PI) / 180;
  const cosHA =
    (-Math.sin((-0.83 * Math.PI) / 180) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));
  const ha = Math.acos(Math.max(-1, Math.min(1, cosHA))); // clamp = polar day/night
  return (2 * ha * 180) / (Math.PI * 15);
}

/**
 * Seasonal position. `t = 0` is the shortest day of the year at this latitude,
 * `t = 1` the longest. Equator and southern hemisphere fall back to 0.5 (matches
 * the live site — see spec's known-limitations note).
 */
export function seasonalT(date: Date, lat: number): number {
  const yr = date.getFullYear();
  const summerDl = daylightHours(new Date(yr, 5, 21), lat); // Jun 21
  const winterDl = daylightHours(new Date(yr, 11, 21), lat); // Dec 21
  const dl = daylightHours(date, lat);
  const range = summerDl - winterDl;
  return range > 0 ? (dl - winterDl) / range : 0.5;
}

/** Three vertical zone heights (renormalised to sum to 1) for a seasonal `t`. */
function computeZones(t: number) {
  const zone1 = Z1_BASE + Z1_RANGE * (1 - t); // 0.25 (long day) … 0.75 (short day)
  const zone3 = Z3_MIN + Z3_MAX * t; // 0.015 … 0.09
  const zone2 = Math.max(0.05, 1 - zone1 - zone3);
  const total = zone1 + zone2 + zone3;
  return { zone1: zone1 / total, zone2: zone2 / total, zone3: zone3 / total };
}

/** Vertical anchor (0 = top of vase body, 1 = bottom) for each of the 6 images. */
export function imageAnchors(t: number): number[] {
  const { zone1, zone2 } = computeZones(t);
  const z1End = zone1;
  const span = V_BOTTOM - V_TOP; // 44
  return IMAGE_VOLTAGES.map((v) => z1End + ((v - V_TOP) / span) * zone2);
}

// Map a vase-body offset (0 = body top, 1 = body bottom) to a fraction of the
// full image height, so masks line up with the cylinder inside the photo.
const toImageOffset = (o: number) =>
  VASE_BAND_TOP + o * (VASE_BAND_BOTTOM - VASE_BAND_TOP);

// --- Blend-line curvature -------------------------------------------------
// The blends are radial (concentric ellipses centred far above the vase) rather
// than straight horizontal lines, so each transition bows slightly downward at
// the centre to match the cylinder's curved surface.
//   CURVE_ABOVE : how far the centre sits above the image top (% of height) —
//                 larger = flatter blend lines.
//   CURVE_RX    : horizontal radius (% of width) — smaller = more curvature.
const CURVE_ABOVE = 300;
const CURVE_RX = 300;
const CURVE_RY = 100 + CURVE_ABOVE; // bottom of the image maps to ~100% radial

// Map a vertical fraction (0 = image top, 1 = bottom) to its position along the
// radial gradient's downward ray.
const rstop = (frac: number) =>
  `${(((frac * 100 + CURVE_ABOVE) / CURVE_RY) * 100).toFixed(3)}%`;

/**
 * CSS mask-image for each of the 6 stacked images (index 0 = vase_1 at the back,
 * index 5 = vase_6 on top), for a seasonal `t`. Index 0 is `"none"` (solid base).
 */
export function vaseMasks(t: number): string[] {
  const a = imageAnchors(t).map(toImageOffset); // image-space anchors, ascending
  const band = rstop(VASE_BAND_BOTTOM);
  const head = `radial-gradient(${CURVE_RX}% ${CURVE_RY}% at 50% -${CURVE_ABOVE}%`;
  return a.map((_, i) => {
    if (i === 0) return "none"; // solid base — the only layer shown below the band
    // Transparent above the previous anchor, ramp to opaque at our own anchor,
    // opaque down to the bottom of the vase body, then hard-cut to transparent.
    // Below the band every photo is identical (base + shadow), so clipping the
    // upper layers there leaves a single shadow instead of 6 stacked ones.
    return `${head}, transparent 0%, transparent ${rstop(a[i - 1])}, #000 ${rstop(
      a[i],
    )}, #000 ${band}, transparent ${band})`;
  });
}
