/**
 * Design tokens — outline weight, motion timing, safe area, layout rhythm.
 * Keeps the flat-vector "hand-drawn" feel consistent across every composition.
 */

export const CANVAS = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

/** Wobbly uniform dark outline — thicker on foreground subjects. */
export const OUTLINE = {
  subject: 11, // foreground titles / hero subjects (px at 1080p)
  object: 5, // icons, badges, mid subjects
  detail: 3, // background detail
} as const;

/**
 * Safe area — nothing critical in the lower ~12% (YouTube UI) or hard edges.
 * The scene planner and text layers clamp to this band.
 */
export const SAFE_AREA = {
  top: 90,
  bottom: Math.round(CANVAS.height * 0.12), // ~130px
  side: 96,
} as const;

/** Motion timing, in frames at 30fps. */
export const MOTION = {
  popIn: 12, // additive pop-in settle
  slideIn: 14, // card / panel slide
  crossfade: 18, // scene/bg crossfade
  tickFlash: 8, // radiating tick life
} as const;

/** Spring configs — one "pop" personality, tuned for a small scale-overshoot. */
export const SPRING = {
  pop: {damping: 12, mass: 0.6, stiffness: 140},
  softPop: {damping: 16, mass: 0.8, stiffness: 120},
} as const;

/** Beat pacing target from style_analysis §6: a state change every ~2.5–4s. */
export const BEAT_SECONDS = {min: 2.5, max: 4} as const;
