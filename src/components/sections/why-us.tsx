import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { whyCards, whyPills } from "@/content/home";
import { staggerDelay } from "@/utils/motion";
import { cn } from "@/utils/cn";

const MINI_CHART = [34, 52, 44, 68, 60, 86];

export function WhyUs() {
  return (
    <section id="why-us" className="relative py-24 lg:py-32" data-testid="why-us-section">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p className="eyebrow" data-testid="section-eyebrow">
            {"// Why Klixora"}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your growth partner,{" "}
            <span className="text-gradient">built to win.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            All the solutions under one roof — managed end-to-end by a team
            obsessed with measurable impact.
          </p>
        </Reveal>

        <Reveal y={24} className="mt-8">
          <ul className="flex flex-wrap gap-3">
            {whyPills.map((pill) => (
              <li
                key={pill}
                data-testid="check-pill"
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-slate-300"
              >
                <Check size={13} className="text-emerald-400" aria-hidden="true" />
                {pill}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-6">
          {whyCards.map((card, i) => (
            <TiltCard
              key={card.id}
              y={40}
              delay={staggerDelay(i)}
              data-testid={`why-card-${card.id}`}
              className={cn(
                "p-7 transition-colors duration-500 hover:border-cyan-300/35",
                card.span,
              )}
            >
              <span className="font-mono text-[11px] tracking-[0.24em] text-slate-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-white">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {card.desc}
              </p>

              {"chart" in card && card.chart ? (
                <div className="mt-6 flex h-16 max-w-[240px] items-end gap-1.5" aria-hidden="true">
                  {MINI_CHART.map((h, barIndex) => (
                    <div
                      key={barIndex}
                      style={{ height: `${h}%` }}
                      className="flex-1 rounded-t bg-gradient-to-t from-violet-500/50 to-cyan-300/80"
                    />
                  ))}
                </div>
              ) : null}
            </TiltCard>
          ))}
        </div>

        <Reveal y={32} className="mt-5">
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="/why-team.jpg"
              alt="Klixora team crafting growth campaigns"
              width={940}
              height={650}
              className="h-56 w-full object-cover sm:h-64"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(500px circle at 20% 30%, rgba(34,211,238,0.14), transparent 60%)",
              }}
            />
            <p className="absolute bottom-5 left-6 max-w-md font-display text-lg font-bold text-white sm:text-xl">
              Makes you stand out like a winner, with proven digital marketing
              strategies.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
