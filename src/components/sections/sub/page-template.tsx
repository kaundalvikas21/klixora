import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { staggerDelay } from "@/utils/motion";
import type { PageContent, SplitHeading } from "@/content/pages";

function Heading({ lead, accent }: SplitHeading) {
  return (
    <>
      {lead}
      <span className="text-gradient">{accent}</span>
    </>
  );
}

export function SubPage({ content }: { content: PageContent }) {
  return (
    <>
        {/* ---------------------------------------------------------- hero */}
        <section
          id="top"
          data-testid="page-hero"
          className="relative overflow-hidden pb-20 pt-36 lg:pb-28 lg:pt-44"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
          />
          <div
            aria-hidden="true"
            className="absolute -left-40 top-10 -z-10 h-[460px] w-[460px] rounded-full bg-violet-600/20 blur-[140px]"
          />

          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Reveal y={20}>
                  <p className="eyebrow">{content.eyebrow}</p>
                </Reveal>

                <h1 className="mt-5 font-display text-[2.4rem] font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {content.titleLines.map((line, lineIndex) => (
                    <Reveal key={lineIndex} y={28} delay={lineIndex * 0.1}>
                      <span className="block">
                        {line.map((seg, i) => (
                          <span key={i} className={seg.gradient ? "text-gradient" : undefined}>
                            {seg.t}
                          </span>
                        ))}
                      </span>
                    </Reveal>
                  ))}
                </h1>

                <Reveal y={24} delay={0.25}>
                  <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                    {content.sub}
                  </p>
                </Reveal>

                <Reveal y={24} delay={0.35}>
                  <Link
                    href="/#contact"
                    data-testid="page-hero-cta"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:scale-[1.03] hover:shadow-glow-cyan"
                  >
                    {content.ctaPrimary} <ArrowRight size={16} />
                  </Link>
                </Reveal>

                {content.stats ? (
                  <Reveal y={24} delay={0.45}>
                    <div className="mt-9 flex flex-wrap gap-4">
                      {content.stats.map((stat) => (
                        <div
                          key={stat.label}
                          data-testid={`hero-stat-${stat.value}`}
                          className="glass rounded-2xl px-6 py-4"
                        >
                          <p className="font-display text-2xl font-extrabold text-gradient">
                            {stat.value}
                          </p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                ) : null}
              </div>

              <Reveal y={36} delay={0.2} className="lg:col-span-5">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-3xl bg-violet-600/25 blur-[90px]"
                  />
                  <Image
                    src={content.heroImg}
                    alt={content.heroAlt}
                    width={900}
                    height={620}
                    priority
                    className="w-full rounded-3xl border border-white/10 object-cover"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- ribbon */}
        <div
          data-testid="spec-ribbon"
          className="marquee-paused overflow-hidden border-y border-white/5 bg-white/[0.02] py-4"
        >
          <div className="flex w-max animate-marquee">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex items-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="flex items-center">
                    <span className="px-6 font-mono text-[11px] uppercase tracking-[0.28em] text-slate-400">
                      {content.ribbon}
                    </span>
                    <span className="text-cyan-300/60" aria-hidden="true">
                      ✦
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------- services */}
        <section id="services" className="relative py-24 lg:py-32" data-testid="page-services">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <Reveal>
              <p className="eyebrow">{content.introEyebrow}</p>
              <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                <Heading {...content.introTitle} />
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
                {content.introText}
              </p>
            </Reveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((service, i) => (
                <TiltCard
                  key={service.title}
                  delay={staggerDelay(i, 0.1)}
                  data-testid={`page-service-${i + 1}`}
                  className="p-7 transition-colors duration-500 hover:border-violet-400/35"
                >
                  <span className="font-mono text-[11px] tracking-[0.24em] text-cyan-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-white">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {service.desc}
                  </p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- problems */}
        {content.problems ? (
          <section className="relative py-24 lg:py-32" data-testid="page-problems">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
              <Reveal>
                <p className="eyebrow">{content.problemsEyebrow}</p>
                <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {content.problemsTitle ? <Heading {...content.problemsTitle} /> : null}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
                  {content.problemsSub}
                </p>
              </Reveal>

              <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {content.problems.map((problem, i) => (
                  <TiltCard
                    key={problem.title}
                    delay={staggerDelay(i)}
                    data-testid={`page-problem-${i + 1}`}
                    className="p-7 transition-colors duration-500 hover:border-rose-400/30"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/25 bg-rose-500/10 text-rose-300">
                      <AlertTriangle size={15} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-display text-base font-bold tracking-tight text-white">
                      {problem.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {problem.desc}
                    </p>
                  </TiltCard>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------- expertise */}
        {content.expertise ? (
          <section className="relative py-24 lg:py-32" data-testid="page-expertise">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
              <Reveal>
                <p className="eyebrow">{content.expertiseEyebrow}</p>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {content.expertiseTitle ? <Heading {...content.expertiseTitle} /> : null}
                </h2>
              </Reveal>

              <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {content.expertise.map((item, i) => (
                  <Reveal key={item.label} y={36} delay={staggerDelay(i)}>
                    <figure
                      data-testid={`expertise-${i + 1}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10"
                    >
                      <Image
                        src={item.src}
                        alt={item.label}
                        width={640}
                        height={480}
                        className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent"
                      />
                      <figcaption className="glass absolute bottom-4 left-4 rounded-full px-4 py-2 font-display text-xs font-bold text-white">
                        {item.label}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------- why */}
        <section id="why-us" className="relative py-24 lg:py-32" data-testid="page-why">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/4 -z-10 h-[380px] w-[640px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[150px]"
          />
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <Reveal>
              <p className="eyebrow">{content.whyEyebrow}</p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                <Heading {...content.whyTitle} />
              </h2>
            </Reveal>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2">
              {content.why.map((item, i) => (
                <Reveal as="li" key={item} y={24} delay={staggerDelay(i, 0.07)}>
                  <span className="glass flex items-center gap-3 rounded-2xl px-5 py-4 text-sm text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                      <Check size={12} aria-hidden="true" />
                    </span>
                    {item}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------- blueprint */}
        <section id="process" className="relative py-24 lg:py-32" data-testid="page-blueprint">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <Reveal>
              <p className="eyebrow">{content.blueprintEyebrow}</p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {content.blueprintTitle}
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {content.blueprint.map((step, i) => (
                <TiltCard
                  key={step.title}
                  delay={staggerDelay(i)}
                  data-testid={`blueprint-${i + 1}`}
                  className="p-7 transition-colors duration-500 hover:border-cyan-300/35"
                >
                  <span
                    aria-hidden="true"
                    className="block h-0.5 w-8 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                  />
                  <span className="mt-5 block font-display text-3xl font-extrabold text-gradient">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {step.desc}
                  </p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- cta band */}
        <section id="contact" className="relative pb-28 pt-6" data-testid="page-cta">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <Reveal y={32}>
              <div className="glass relative overflow-hidden rounded-3xl px-8 py-16 text-center">
                <div
                  aria-hidden="true"
                  className="absolute -right-20 -top-20 h-[320px] w-[320px] rounded-full bg-violet-600/20 blur-[110px]"
                />
                <p className="eyebrow">{content.ctaEyebrow}</p>
                <h2 className="mx-auto mt-4 max-w-2xl font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {content.ctaTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                  {content.ctaSub}
                </p>
                <Link
                  href="/#contact"
                  data-testid="page-cta-button"
                  className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-9 py-4 font-display text-sm font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:scale-[1.03] hover:shadow-glow-cyan"
                >
                  {content.ctaLabel} <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
    </>
  );
}
