import { Reveal } from "@/components/motion/reveal";
import { StatCounter } from "@/components/motion/stat-counter";
import { stats } from "@/content/home";

export function Results() {
  return (
    <section id="results" className="relative py-24 lg:py-32" data-testid="results-section">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p className="eyebrow" data-testid="section-eyebrow">
            {"// Results That Speak"}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            We don&apos;t just say it —{" "}
            <span className="text-gradient">we say it out loud.</span>
          </h2>
        </Reveal>

        <Reveal y={32} className="mt-14">
          <div className="glass grid gap-12 rounded-3xl px-8 py-14 sm:grid-cols-3 sm:gap-6">
            {stats.map((stat) => (
              <StatCounter key={stat.id} {...stat} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
