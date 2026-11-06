import type { WeeklySeries } from "./types";
import { dt } from "@/lib/clock";

/** Week-starting labels for the 12-week history every trend uses. */
export const weeks = [
  dt("3 Aug"),
  dt("10 Aug"),
  dt("17 Aug"),
  dt("24 Aug"),
  dt("31 Aug"),
  dt("7 Sep"),
  dt("14 Sep"),
  dt("21 Sep"),
  dt("28 Sep"),
  dt("5 Oct"),
  dt("12 Oct"),
  dt("19 Oct"),
] as const;

/** A small fixed wobble so generated histories read as observed data rather than straight lines. */
const WOBBLE = [0, 0.4, -0.3, 0.2, 0.5, -0.4, 0.3, -0.2, 0.4, -0.3, 0.2, 0];

/**
 * Deterministic history from a starting value to the current one. The last value always
 * equals `end`, so the latest week agrees with the figures shown elsewhere.
 */
export function ramp(
  start: number,
  end: number,
  {
    decimals = 0,
    smooth = false,
    seed = 0,
  }: { decimals?: number; smooth?: boolean; seed?: number } = {},
): WeeklySeries {
  const factor = 10 ** decimals;
  const span = weeks.length - 1;
  // Offsetting the pattern per series stops the wobble lining up when histories are summed.
  const phase = Math.round(start * 7 + end * 3 + seed);
  const delta = end - start;
  // Whole-number series step up at a different week per series, so totals climb gradually.
  const offset = (((phase * 7) % 11) + 0.5) / 11;
  return weeks.map((_, i) => {
    if (i === span) return end;
    const step = i === 0 || smooth ? 0 : (WOBBLE[(i + phase) % WOBBLE.length] ?? 0);
    const wobble = step * Math.max(Math.abs(delta) / span, decimals ? 0.2 : 0.6);
    if (decimals === 0) {
      const progress = Math.floor((Math.abs(delta) * i) / span + offset);
      return Math.max(0, start + Math.sign(delta) * progress + Math.round(wobble));
    }
    return Math.max(0, Math.round((start + (delta * i) / span + wobble) * factor) / factor);
  });
}

export function sumSeries(series: WeeklySeries[]): WeeklySeries {
  return weeks.map((_, i) => series.reduce((sum, s) => sum + (s[i] ?? 0), 0));
}

/** A stable small number from a string, used to vary generated histories per clinician. */
export function seedFrom(text: string) {
  return [...text].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 997, 7);
}
