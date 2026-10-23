"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Reveal } from "@/components/motion/reveal";
import { processSteps } from "@/content/home";
import { EASE, VIEWPORT } from "@/utils/motion";

export function Process() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 75%", "end 70%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  return (
    <section id="process" className="relative py-24 lg:py-32" data-testid="process-section">
      <div
        aria-hidden="true"
        className="absolute right-0 top-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[150px]"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="eyebrow" data-testid="section-eyebrow">
                  {"// How We Work"}
                </p>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Five moves.{" "}
                  <span className="text-gradient">One obsession.</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
                  A process engineered to take your brand from audit to scale —
                  with full transparency at every step.
                </p>
                <span className="glass mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-300">
                  <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-300" />
                  Always optimizing
                </span>
              </Reveal>
            </div>
          </div>

          <div ref={trackRef} className="relative lg:col-span-8">
            {/* Rail, with a progress line that fills as the section scrolls past. */}
            <div
              aria-hidden="true"
              className="absolute left-[7px] top-2 h-full w-px bg-white/8"
            >
              <motion.div
                style={reduced ? { scaleY: 1 } : { scaleY: progress }}
                className="h-full w-px origin-top bg-gradient-to-b from-cyan-300 to-violet-500"
              />
            </div>

            <ol className="flex flex-col gap-5">
              {processSteps.map((item, i) => (
                <motion.li
                  key={item.step}
                  initial={reduced ? undefined : { opacity: 0, y: 36 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
                  data-testid={`process-step-${item.step}`}
                  className="relative pl-10"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-cyan-300/40 bg-ink"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  </span>

                  <div className="glass rounded-2xl p-6 transition-colors duration-500 hover:border-cyan-300/30">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-xl font-bold tracking-tight text-white">
                        {item.title}
                      </h3>
                      <span className="font-mono text-[11px] tracking-[0.24em] text-slate-500">
                        {item.step}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                      {item.subtitle}
                    </p>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
