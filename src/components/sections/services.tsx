import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { GradientText } from "@/lib/rich-text";
import { ServicesCta } from "@/components/sections/services-cta";
import type { HomeContent } from "@/server/content";
import { staggerDelay } from "@/utils/motion";

/** Desktop column count is editable, so the class has to be looked up. */
const COLUMN_CLASS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function Services({ services }: { services: HomeContent["services"] }) {
  return (
    <Section
      id="services"
      testId="services-section"
      glow={
        <div
          aria-hidden="true"
          className="absolute -right-40 top-20 -z-10 h-[420px] w-[520px] rounded-full bg-violet-600/10 blur-[150px]"
        />
      }
    >
      <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow" data-testid="section-eyebrow">
            {services.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <GradientText value={services.heading} />
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            {services.intro}
          </p>
        </div>

        {services.ctaLabel && services.ctaHref ? (
          <ServicesCta href={services.ctaHref} label={services.ctaLabel} />
        ) : null}
      </Reveal>

      <div
        className={`mt-12 grid gap-5 lg:mt-14 lg:gap-6 ${COLUMN_CLASS[services.columns] ?? COLUMN_CLASS[3]}`}
      >
        {services.items.map((service, i) => (
          <TiltCard
            key={service.id}
            delay={staggerDelay(i, 0.1)}
            data-testid={`service-card-${service.id}`}
            className="p-6 transition-colors duration-500 hover:border-violet-400/35 sm:p-7"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
                <Icon name={service.icon} size={20} />
              </span>
              {/* Derived from sort order, never stored. */}
              <span className="font-mono text-[11px] tracking-[0.2em] text-slate-400">
                /{String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <Pill className="mt-6">{service.kicker}</Pill>
            <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-white">
              {service.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {service.description}
            </p>
          </TiltCard>
        ))}
      </div>
    </Section>
  );
}
