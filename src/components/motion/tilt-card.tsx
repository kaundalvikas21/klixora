"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import {
  CARD_HOVER_SHADOW,
  EASE,
  REVEAL_DURATION,
  TILT_PERSPECTIVE,
  TILT_ROTATE_X,
  TILT_ROTATE_Y,
  TILT_SPRING,
  VIEWPORT,
} from "@/utils/motion";
import { cn } from "@/utils/cn";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Travel distance for the entrance reveal. */
  y?: number;
  "data-testid"?: string;
};

/**
 * Glass card that tilts toward the pointer and tracks it with a spotlight.
 * Pointer position is published as --mx/--my so the highlight can be pure CSS.
 */
export function TiltCard({
  children,
  className,
  delay = 0,
  y = 44,
  ...rest
}: TiltCardProps) {
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    rotateX.set(-(py - 0.5) * TILT_ROTATE_X);
    rotateY.set((px - 0.5) * TILT_ROTATE_Y);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      {...rest}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        reduced
          ? undefined
          : { rotateX, rotateY, transformPerspective: TILT_PERSPECTIVE }
      }
      initial={reduced ? undefined : { opacity: 0, y }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: REVEAL_DURATION, delay, ease: EASE }}
      whileHover={reduced ? undefined : { boxShadow: CARD_HOVER_SHADOW }}
      className={cn(
        "glass group relative overflow-hidden rounded-2xl",
        // Spotlight follows the pointer via the custom properties set above.
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0",
        "before:transition-opacity before:duration-500 hover:before:opacity-100",
        "before:bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),rgba(34,211,238,0.10),transparent_65%)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
