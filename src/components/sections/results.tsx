import { Reveal } from "@/components/motion/reveal";
import { StatCounter } from "@/components/motion/stat-counter";
import { Section } from "@/components/ui/section";
import { stats } from "@/content/home";

export function Results() {
  return (
    <Section id="results" testId="results-section">
      <Reveal>
        <p className="eyebrow" data-testid="section-eyebrow">
          {"// Results That Speak"}
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          We don&apos;t just say it.{" "}
          <span className="text-gradient">we say it out loud.</span>
        </h2>
      </Reveal>

      <Reveal y={32} className="mt-12 lg:mt-14">
        <div className="glass grid gap-10 rounded-3xl px-6 py-10 sm:grid-cols-3 sm:gap-6 sm:px-8 sm:py-12 lg:py-14">
          {stats.map((stat) => (
            <StatCounter key={stat.id} {...stat} />
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
