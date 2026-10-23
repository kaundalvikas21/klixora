"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Section } from "@/components/ui/section";
import { testimonials } from "@/content/home";
import { EASE } from "@/utils/motion";

const COUNT = testimonials.length;
const AUTOPLAY_MS = 5500;

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + COUNT) % COUNT),
    [],
  );

  useEffect(() => {
    // Autoplay stops on hover, on focus within, and for reduced-motion users.
    if (paused || reduced) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % COUNT),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, [paused, reduced]);

  return (
    <Section
      id="testimonials"
      testId="testimonials-section"
      className="overflow-hidden"
      glow={
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-10 -z-10 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[150px]"
        />
      }
    >
      <SectionHeading
        align="center"
        eyebrow="// Testimonials"
        title={
          <>
            What our clients <span className="text-gradient">say.</span>
          </>
        }
      />

      <div
        className="relative mx-auto mt-12 h-[480px] max-w-4xl sm:h-[400px] lg:mt-14 lg:h-[360px]"
        style={{ perspective: "1200px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        data-testid="testimonial-stage"
      >
        {testimonials.map((item, i) => {
          // Shortest signed distance from the active card, so the stack wraps.
          let offset = i - active;
          if (offset > COUNT / 2) offset -= COUNT;
          if (offset < -COUNT / 2) offset += COUNT;
          const isActive = offset === 0;

          return (
            <motion.figure
              key={item.id}
              data-testid={`testimonial-${item.id}`}
              aria-hidden={!isActive}
              inert={!isActive}
              animate={{
                x: `${offset * 58}%`,
                scale: isActive ? 1 : 0.82,
                opacity: isActive ? 1 : 0.3,
                rotateY: offset * -14,
                zIndex: isActive ? 10 : 1,
                filter: isActive ? "blur(0px)" : "blur(2px)",
              }}
              transition={{ duration: reduced ? 0 : 0.7, ease: EASE }}
              className="glass absolute inset-x-0 mx-auto h-full w-full max-w-xl rounded-3xl p-6 sm:p-8 lg:p-10"
              style={{
                borderColor: isActive
                  ? "rgba(139,92,246,0.35)"
                  : "rgba(255,255,255,0.08)",
                boxShadow: isActive
                  ? "0 30px 80px -30px rgba(139,92,246,0.45)"
                  : "none",
              }}
            >
              <Quote
                size={26}
                className="text-violet-400/70"
                aria-hidden="true"
              />
              <blockquote className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base">
                {item.quote}
              </blockquote>

              <figcaption className="mt-7 flex items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${item.from}, ${item.to})`,
                  }}
                >
                  {item.initials}
                </span>
                <span>
                  <span className="block font-display text-sm font-bold text-white">
                    {item.name}
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {item.role}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous testimonial"
          data-testid="testimonial-prev"
          className="glass flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors duration-300 hover:text-cyan-300"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          {testimonials.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show testimonial from ${item.name}`}
              aria-current={i === active}
              className={
                i === active
                  ? "h-1.5 w-7 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300"
                  : "h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300 hover:bg-white/40"
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next testimonial"
          data-testid="testimonial-next"
          className="glass flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors duration-300 hover:text-cyan-300"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </Section>
  );
}
