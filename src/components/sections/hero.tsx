"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { PointerEvent } from "react";
import { Cta } from "@/components/ui/cta";
import { CTA_VARIANT_MAP, ctaIcon } from "@/components/ui/cta-icon";
import { Container } from "@/components/ui/section";
import { GradientText } from "@/lib/rich-text";
import { rememberLeadSource } from "@/lib/lead-source";
import type { HomeContent } from "@/server/content";
import { EASE } from "@/utils/motion";

/** Bar heights (%) for the live-tracking card, from the reference. */
const BARS = [38, 62, 46, 78, 58, 92, 70, 100];

/** Fire-and-forget click count. Never blocks the navigation. */
function countClick(id: string) {
  if (id.startsWith("default-")) return;
  const body = JSON.stringify({ id });
  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon("/api/cta-click", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/cta-click", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
  }).catch(() => {});
}

export function Hero({ hero }: { hero: HomeContent["hero"] }) {
  const reduced = useReducedMotion();
  // Pointer parallax for the ambient glows, desktop pointers only.
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
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-16 pt-28 md:pt-32 lg:pb-14"
    >
      {/* Parallax is a CSS scroll timeline now, so it runs off the main
          thread instead of a rAF loop reacting to scroll events. */}
      <div aria-hidden="true" className="scroll-parallax absolute inset-0 -z-10">
        {hero.backgroundImageUrl ? (
          <Image
            src={hero.backgroundImageUrl}
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
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink" />
      </div>

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

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* min-w-0: grid items default to min-width:auto, so a long unbreakable
              word would otherwise force the track wider than the container. */}
          <div className="min-w-0 lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="eyebrow"
            >
              {hero.eyebrow}
            </motion.p>

            <h1 className="mt-6 font-display text-[clamp(1.5rem,9vw,2.6rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {hero.headlineLines.map((line, lineIndex) => (
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
                  <GradientText value={line} />
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
              className="mt-7 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base"
            >
              {hero.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
              className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              {/* Outlined CTAs are the twin of the primary: same pill, same
                  weight, so a pair reads as a pair rather than a button and a
                  link. */}
              {hero.ctas.map((cta) => {
                const CtaGlyph = ctaIcon(cta.label, cta.href);
                return (
                  <Cta
                    key={cta.id}
                    href={cta.href}
                    variant={CTA_VARIANT_MAP[cta.variant]}
                    target={cta.openNewTab ? "_blank" : undefined}
                    rel={cta.openNewTab ? "noopener noreferrer" : undefined}
                    onClick={() => {
                      countClick(cta.id);
                      // Every CTA lands on the same form, so the form has to
                      // be told which one sent them.
                      rememberLeadSource(`Hero - ${cta.label}`);
                    }}
                    data-testid={`hero-cta-${cta.variant.toLowerCase()}`}
                  >
                    {cta.label} <CtaGlyph size={cta.variant === "PRIMARY" ? 16 : 14} />
                  </Cta>
                );
              })}
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
              {/* Both labels are wide mono caps; below ~330px they have to be
                  allowed to wrap rather than bleed out of the card. */}
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 sm:tracking-[0.24em]">
                  {hero.dashboardTitle}
                </p>
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300 sm:tracking-[0.2em]">
                  <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
                  {hero.dashboardStatus}
                </span>
              </div>

              <div
                className="mt-7 flex h-40 items-end gap-2.5"
                aria-hidden="true"
              >
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

              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/5 pt-4">
                {hero.dashboardMetrics.map((label) => (
                  <span
                    key={label}
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 sm:tracking-[0.18em]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {hero.chips.length ? (
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                {hero.chips.map((chip) => (
                  <span
                    key={chip}
                    className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </Container>

      {hero.scrollCue ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
            {hero.scrollCue}
          </span>
          <div className="h-9 w-px overflow-hidden bg-white/10">
            <motion.div
              animate={reduced ? undefined : { y: [-36, 36] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-1/2 w-px bg-gradient-to-b from-transparent via-cyan-300 to-transparent"
            />
          </div>
        </motion.div>
      ) : null}
    </section>
  );
}
