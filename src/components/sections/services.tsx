import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { services } from "@/content/home";
import { staggerDelay } from "@/utils/motion";

export function Services() {
  return (
    <section id="services" className="relative py-24 lg:py-32" data-testid="services-section">
      <div
        aria-hidden="true"
        className="absolute -right-40 top-20 -z-10 h-[420px] w-[520px] rounded-full bg-violet-600/10 blur-[150px]"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow" data-testid="section-eyebrow">
              {"// Core Services"}
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Digital solutions <span className="text-gradient">that work.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              Instead of juggling multiple agencies, you get everything under one
              roof — ads, organic presence, and everything your business needs to
              grow online.
            </p>
          </div>

          <Link
            href="#contact"
            data-testid="services-cta"
            className="group inline-flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-slate-300 transition-colors duration-300 hover:text-cyan-300"
          >
            Get a free audit
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            />
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <TiltCard
                key={service.id}
                delay={staggerDelay(i, 0.1)}
                data-testid={`service-card-${service.id}`}
                className="p-7 transition-colors duration-500 hover:border-violet-400/35"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-slate-600">
                    /{String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  {service.tag}
                </p>
                <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-white">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {service.desc}
                </p>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
