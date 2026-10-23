import Image from "next/image";
import { AlertTriangle, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { Cta } from "@/components/ui/cta";
import { CardIndex } from "@/components/ui/card-index";
import { Container, Section } from "@/components/ui/section";
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

/** Shared heading block, so the five content sections stay on one rhythm. */
function Intro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: SplitHeading;
  text?: string;
}) {
  return (
    <Reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        <Heading {...title} />
      </h2>
      {text ? (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {text}
        </p>
      ) : null}
    </Reveal>
  );
}

export function SubPage({ content }: { content: PageContent }) {
  const HeroIcon = content.ctaPrimaryIcon;
  const BandIcon = content.ctaBandIcon;

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section
        id="top"
        data-testid="page-hero"
        className="relative overflow-hidden pb-16 pt-28 md:pt-32 lg:pb-28 lg:pt-44"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute -left-40 top-10 -z-10 h-[460px] w-[460px] rounded-full bg-violet-600/20 blur-[140px]"
        />

        <Container>
          <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7">
              <Reveal y={20}>
                <p className="eyebrow">{content.eyebrow}</p>
              </Reveal>

              <h1 className="mt-5 font-display text-[clamp(1.35rem,7.5vw,2rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
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
                <Cta href="/#contact" data-testid="page-hero-cta" className="mt-8">
                  {content.ctaPrimary} <HeroIcon size={16} />
                </Cta>
              </Reveal>

              {content.stats ? (
                <Reveal y={24} delay={0.45}>
                  <div className="mt-9 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap">
                    {content.stats.map((stat) => (
                      <div
                        key={stat.label}
                        data-testid={`hero-stat-${stat.value}`}
                        className="glass rounded-2xl px-5 py-4 sm:px-6"
                      >
                        <p className="font-display text-2xl font-extrabold text-gradient">
                          {stat.value}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
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
                  width={1024}
                  height={683}
                  priority
                  className="w-full rounded-3xl border border-white/10 object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- ribbon */}
      <div
        data-testid="spec-ribbon"
        className="marquee-paused overflow-hidden border-y border-white/5 bg-white/[0.02] py-4"
      >
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-5 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400 sm:px-6 sm:text-[11px]">
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

      {/* -------------------------------------------------------- services */}
      <Section id="services" testId="page-services">
        <Intro
          eyebrow={content.introEyebrow}
          title={content.introTitle}
          text={content.introText}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {content.services.map((service, i) => (
            <TiltCard
              key={service.title}
              delay={staggerDelay(i, 0.1)}
              data-testid={`page-service-${i + 1}`}
              className="p-6 transition-colors duration-500 hover:border-violet-400/35 sm:p-7"
            >
              <CardIndex index={i} />
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-white">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {service.desc}
              </p>
            </TiltCard>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- problems */}
      {content.problems && content.problemsTitle ? (
        <Section testId="page-problems">
          <Intro
            eyebrow={content.problemsEyebrow ?? ""}
            title={content.problemsTitle}
            text={content.problemsSub}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
            {content.problems.map((problem, i) => (
              <TiltCard
                key={problem.title}
                delay={staggerDelay(i)}
                data-testid={`page-problem-${i + 1}`}
                className="p-6 transition-colors duration-500 hover:border-rose-400/30 sm:p-7"
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
        </Section>
      ) : null}

      {/* ------------------------------------------------------- expertise */}
      {content.expertise && content.expertiseTitle ? (
        <Section testId="page-expertise">
          <Intro
            eyebrow={content.expertiseEyebrow ?? ""}
            title={content.expertiseTitle}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
            {content.expertise.map((item, i) => (
              <Reveal key={item.label} y={36} delay={staggerDelay(i)}>
                <figure
                  data-testid={`expertise-${i + 1}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10"
                >
                  <Image
                    src={item.src}
                    alt={item.label}
                    width={1000}
                    height={667}
                    className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-56"
                  />
                  {/* The illustrations are bright, so the scrim has to carry
                      real weight at the bottom rather than fading to nothing
                      behind the label. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent"
                  />
                  {/* Solid ink, not `.glass`: a translucent pill picks up
                      whatever is behind it, and over a white illustration
                      that left white text on a near-white chip. At 92% this
                      clears 4.5:1 against white on every card. */}
                  <figcaption className="absolute inset-x-4 bottom-4 w-fit max-w-[calc(100%-2rem)] truncate rounded-full border border-white/15 bg-ink/92 px-4 py-2 font-display text-xs font-bold text-white shadow-lg shadow-black/50 backdrop-blur-sm">
                    {item.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ------------------------------------------------------------- why */}
      <Section
        id="why-us"
        testId="page-why"
        glow={
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/4 -z-10 h-[380px] w-[640px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[150px]"
          />
        }
      >
        <Intro eyebrow={content.whyEyebrow} title={content.whyTitle} />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {content.why.map((item, i) => (
            <Reveal as="li" key={item} y={24} delay={staggerDelay(i, 0.07)}>
              <span className="glass flex items-center gap-3 rounded-2xl px-4 py-4 text-sm text-slate-300 sm:px-5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                  <Check size={12} aria-hidden="true" />
                </span>
                {item}
              </span>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------------- blueprint */}
      <Section id="process" testId="page-blueprint">
        <Reveal>
          <p className="eyebrow">{content.blueprintEyebrow}</p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {content.blueprintTitle}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
          {content.blueprint.map((step, i) => (
            <TiltCard
              key={step.title}
              delay={staggerDelay(i)}
              data-testid={`blueprint-${i + 1}`}
              className="p-6 transition-colors duration-500 hover:border-cyan-300/35 sm:p-7"
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
      </Section>

      {/* -------------------------------------------------------- cta band */}
      <Section id="contact" testId="page-cta">
        <Reveal y={32}>
          <div className="glass relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-8 sm:py-14 lg:py-16">
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
            <Cta
              href="/#contact"
              data-testid="page-cta-button"
              className="mx-auto mt-9 max-w-sm"
            >
              {content.ctaLabel} <BandIcon size={16} />
            </Cta>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
