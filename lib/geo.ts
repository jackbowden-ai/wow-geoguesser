/** A point on the map in normalised coordinates: (0,0) = top-left, (1,1) = bottom-right. */
export type Point = { x: number; y: number };

/**
 * Width / height of the map image in /public/maps/azeroth.png (1002 x 668).
 * If you swap in a different map, set this to match its aspect ratio.
 */
export const MAP_ASPECT = 1002 / 668;

/** Rough in-game scale used only to turn map distance into friendly "yards". */
export const YARDS_PER_MAP_WIDTH = 15000;

export const ROUNDS = 5;
export const MAX_SCORE_PER_ROUND = 5000;

/** Distance between two points, measured in map-widths. */
export function mapDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, (a.y - b.y) / MAP_ASPECT);
}

export function toYards(d: number): number {
  return Math.round(d * YARDS_PER_MAP_WIDTH);
}

/** GeoGuessr-style exponential falloff: perfect inside a tiny radius, decaying with distance. */
export function scoreFor(d: number): number {
  if (d < 0.006) return MAX_SCORE_PER_ROUND;
  return Math.round(MAX_SCORE_PER_ROUND * Math.exp(-d / 0.12));
}

export function formatYards(yards: number): string {
  return `${yards.toLocaleString("en-GB")} yards`;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
