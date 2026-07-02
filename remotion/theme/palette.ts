/**
 * Palette — single source of truth for the "Urban Animal" flat-vector style.
 * Values transcribed from style_analysis.md §2 (targets, not exact).
 *
 * The background-field rotation IS the transition system: each section picks a
 * new field key, and hard cuts on colour change read as chapter breaks.
 * Saturated colour is reserved for semantics (red = danger/emphasis, gauge fills).
 */

/** Background fields — rotate one per scene/topic. */
export const BACKGROUND_FIELDS = {
  sage: '#C2CFA5', // animal facts, mirror test, polluted water
  lavender: '#D2C6EA', // research/lab, anatomy, mascot scenes
  butter: '#F6E9C6', // icon rosters, candidate map, diagrams
  powder: '#BCD0E8', // daytime sky, city scenes
  pink: '#EFC9CD', // reproduction/soft topics
  navy: '#1D2F52', // night rooftop scenes
  storm: '#8E8E8C', // rain/London scenes (whole scene darkens)
} as const;

export type BackgroundFieldKey = keyof typeof BACKGROUND_FIELDS;

/** Ordered rotation the scene planner walks through on each section change. */
export const BACKGROUND_ROTATION: BackgroundFieldKey[] = [
  'sage',
  'butter',
  'powder',
  'lavender',
  'pink',
  'storm',
  'navy',
];

/** Structural (non-semantic) colours. */
export const INK = {
  line: '#211E1A', // warm near-black outline on every subject
  lineSoft: '#3A352E', // thinner background detail
  fillMuted: '#B9AE9C', // desaturated mid-tone object fills
} as const;

/** Semantic accents — the ONLY saturated colours allowed. */
export const SEMANTIC = {
  danger: '#DA382F', // DIE/CHAOS titles, red X, emphasis arrows, threat bars
  gaugeGood: '#3BC93B', // oxygen/positive gauge fill
  gaugeBad: '#E02020', // stress/negative gauge fill
} as const;

/** Fields whose luminance is low → title/label ink must flip to light. */
export const DARK_FIELDS: BackgroundFieldKey[] = ['navy', 'storm'];

export const resolveField = (key: BackgroundFieldKey | string): string =>
  (BACKGROUND_FIELDS as Record<string, string>)[key] ?? String(key);

export const isDarkField = (key: BackgroundFieldKey | string): boolean =>
  (DARK_FIELDS as string[]).includes(String(key));
