import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * The site's vertical rhythm and horizontal gutters live here and nowhere
 * else. Change these two strings and every section follows.
 *
 * The padding is symmetric, and each side is HALF a gap. Two stacked
 * sections therefore meet at one full gap, not two, which is what made the
 * old `py-32` read as a dead band against a shared background. Keeping both
 * sides also means every section owns visible space below its own content,
 * so a section that ends on something short (a carousel's dots, a short
 * column) still closes properly, and a section with its own surface (the
 * CTA band on the vertical pages) is never flush against the one above it.
 */
const SECTION_Y = "py-12 md:py-14 lg:py-16";
const CONTAINER_X = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return <div className={cn(CONTAINER_X, className)}>{children}</div>;
}

type SectionProps = {
  children: ReactNode;
  id?: string;
  testId?: string;
  className?: string;
  /** Decorative blurred radial rendered behind the content. */
  glow?: ReactNode;
  /** Set false when the section needs to own its own padding (e.g. the hero). */
  padded?: boolean;
  /** Set false to opt out of the default Container wrapper. */
  contained?: boolean;
};

export function Section({
  children,
  id,
  testId,
  className,
  glow,
  padded = true,
  contained = true,
}: SectionProps) {
  return (
    <section
      id={id}
      data-testid={testId}
      className={cn("relative overflow-x-clip", padded && SECTION_Y, className)}
    >
      {glow}
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}
