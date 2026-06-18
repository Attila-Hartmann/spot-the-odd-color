/**
 * Colour helpers for the game grid.
 *
 * `generateBoxColor()` is the provided utility — kept verbatim, only `export`ed
 * so the rest of the app reuses it instead of reinventing colour generation.
 * `parseHsl` / `brighten` build the "odd" colour from that base.
 */

/** A parsed HSL triple. `h` in degrees, `s`/`l` in percent. */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** Provided utility: a pleasant, mid-lightness random HSL colour string. */
export function generateBoxColor(): string {
  const h = Math.floor(Math.random() * 354)
  const s = Math.floor(Math.random() * (60 - 40) + 40)
  const l = Math.floor(Math.random() * (60 - 40) + 40)

  return `hsl(${h}deg ${s}% ${l}%)`
}

/**
 * Parse the modern space-separated HSL string produced by `generateBoxColor`,
 * e.g. `"hsl(120deg 50% 45%)"`. Units (`deg`, `%`) are optional/ignored.
 */
export function parseHsl(color: string): Hsl {
  const match = color.match(
    /hsl\(\s*([\d.]+)\s*(?:deg)?\s+([\d.]+)%?\s+([\d.]+)%?\s*\)/i,
  );
  if (!match) {
    throw new Error(`Unsupported HSL colour: "${color}"`);
  }
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Make a colour "X% brighter" by *adding* X percentage points to the HSL
 * lightness channel (clamped to a valid 0–100 range).
 *
 * Additive (rather than relative `l * (1 + x/100)`) is deliberate: it keeps the
 * absolute brightness gap independent of the random base lightness, so the
 * challenge is equally fair on every generated colour and the per-level
 * difficulty curve stays strictly monotonic.
 */
export function brighten(color: string, deltaPercentPoints: number): string {
  const { h, s, l } = parseHsl(color);
  const brighterL = clamp(l + deltaPercentPoints, 0, 100);
  return `hsl(${h}deg ${s}% ${brighterL}%)`;
}
