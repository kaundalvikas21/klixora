"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { PointerEvent } from "react";
import { ArrowUpRight, PhoneCall } from "lucide-react";
import { EASE } from "@/utils/motion";

const TITLE_LINES = [
  [{ t: "GROWTH " }, { t: "DRIVEN", gradient: true }],
  [{ t: "DIGITAL ", gradient: true }, { t: "STRATEGY" }],
  [{ t: "FOR BOLD BRANDS" }],
] as const;

/** Bar heights (%) for the live-tracking card, from the reference. */
const BARS = [38, 62, 46, 78, 58, 92, 70, 100];

export function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 900], [0, 150]);

  // Pointer parallax for the ambient glows — desktop pointers only.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const glowX = useSpring(px, { stiffness: 35, damping: 18 });
  const glowY = useSpring(py, { stiffness: 35, damping: 18 });

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    px.set(46 * (event.clientX / window.innerWidth - 0.5));
    py.set(30 * (event.clientY / window.innerHeight - 0.5));
  }

  return (
    <section
      id="top"
      onPointerMove={handlePointerMove}
      data-testid="hero-section"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-20 pt-32 lg:pb-14"
    >
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { y: bgY }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/hero-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
          style={{
            maskImage:
              "radial-gradient(ellipse 90% 75% at 50% 35%, black 30%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 75% at 50% 35%, black 30%, transparent 78%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink" />
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
      />

      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { x: glowX, y: glowY }}
        className="absolute -left-40 top-1/4 -z-10 h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-[140px]"
      />
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { x: glowX, y: glowY }}
        className="absolute -right-32 top-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[140px]"
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="eyebrow"
            >
              {"// Klixora — Digital Growth Partner"}
            </motion.p>

            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {TITLE_LINES.map((line, lineIndex) => (
                <motion.span
                  key={lineIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1 + lineIndex * 0.12,
                    ease: EASE,
                  }}
                  className="block"
                >
                  {line.map((seg, i) => (
                    <span key={i} className={"gradient" in seg ? "text-gradient" : undefined}>
                      {seg.t}
                    </span>
                  ))}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
              className="mt-7 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base"
            >
              More than a digital agency — architects of growth strategies,
              engineers of digital presence, and the partner you call when
              you&apos;re serious about scaling.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                href="#contact"
                data-testid="hero-cta-enquire"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:scale-[1.03] hover:shadow-glow-cyan"
              >
                Enquire Now <ArrowUpRight size={16} />
              </Link>
              {/* Outlined twin of the primary — same pill, same weight, so the
                  two CTAs read as a pair rather than a button and a link. */}
              <Link
                href="#contact"
                data-testid="hero-cta-call"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-slate-200 transition-all duration-300 hover:border-cyan-300/60 hover:text-white hover:shadow-glow-cyan"
              >
                <PhoneCall size={14} /> Get on a Call Today
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 46 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="lg:col-span-5"
          >
            <div
              data-testid="hero-dashboard"
              className="glass-strong rounded-3xl p-6 shadow-glow-violet"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  Live Campaign Tracking
                </p>
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
                  Tracking
                </span>
              </div>

              <div className="mt-7 flex h-40 items-end gap-2.5" aria-hidden="true">
                {BARS.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{
                      duration: 0.9,
                      delay: 0.8 + i * 0.07,
                      ease: EASE,
                    }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500/70 to-cyan-300"
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                {["Reach", "Leads", "Conversions"].map((label) => (
                  <span
                    key={label}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Data-Driven Approach
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Scroll to explore
        </span>
        <div className="h-9 w-px overflow-hidden bg-white/10">
          <motion.div
            animate={reduced ? undefined : { y: [-36, 36] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1/2 w-px bg-gradient-to-b from-transparent via-cyan-300 to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}
