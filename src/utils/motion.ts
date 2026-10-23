import type { Transition, Variants } from "motion/react";

/**
 * Shared easing curve, ported verbatim from the reference build.
 * Every reveal, hover and step transition uses it so the whole site
 * decelerates on the same curve.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Viewport trigger used by every scroll reveal on the site. */
export const VIEWPORT = { once: true, amount: 0.15 } as const;

export const REVEAL_DURATION = 0.7;

/** Cards reveal in rows of three, each column offset slightly. */
export function staggerDelay(index: number, step = 0.09) {
  return (index % 3) * step;
}

export function revealTransition(index = 0, step = 0.09): Transition {
  return {
    duration: REVEAL_DURATION,
    delay: staggerDelay(index, step),
    ease: EASE,
  };
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

/** Spring used by the 3-D card tilt. */
export const TILT_SPRING = { stiffness: 170, damping: 18 } as const;

/** Tilt extents, in degrees. */
export const TILT_ROTATE_X = 9;
export const TILT_ROTATE_Y = 11;
export const TILT_PERSPECTIVE = 950;

export const CARD_HOVER_SHADOW =
  "0 24px 60px -20px rgba(139,92,246,0.35), 0 0 0 1px rgba(139,92,246,0.3)";
