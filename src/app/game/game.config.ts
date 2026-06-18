/**
 * Difficulty tuning for the game. Kept in one place so the curve is obvious and
 * easy to justify.
 *
 * Level 1..5:
 *   grid size:        6, 7, 8, 9, 10   (`gridSizeForLevel`)
 *   brightness delta: 30, 25, 20, 15, 10  percentage points (`brightnessDeltaForLevel`)
 */
export const TOTAL_LEVELS = 5;

const FIRST_GRID_SIZE = 6;
const BASE_BRIGHTNESS_DELTA = 30;
const BRIGHTNESS_DELTA_STEP = 5;

/** Numbers shown in the 3-2-1 countdown before level 1. */
export const COUNTDOWN_FROM = 3;

/** How long each countdown number is shown (ms) — snappy, not a full second. */
export const COUNTDOWN_INTERVAL_MS = 600;

/** A correct pick faster than this (ms) earns the "⚡ Fast!" flourish. */
export const FAST_SPLIT_MS = 1500;

/** Grid is N×N where N grows by one each level: 6 → 10. */
export function gridSizeForLevel(level: number): number {
  return FIRST_GRID_SIZE + (level - 1);
}

/** Odd-box lightness boost in percentage points: 30 → 10, dropping 5 per level. */
export function brightnessDeltaForLevel(level: number): number {
  return BASE_BRIGHTNESS_DELTA - (level - 1) * BRIGHTNESS_DELTA_STEP;
}
