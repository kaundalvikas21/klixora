import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * The site's vertical rhythm and horizontal gutters live here and nowhere else.
 * Change these two strings and every section follows.
 */
const SECTION_Y = "py-20 md:py-24 lg:py-32";
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
      className={cn("relative", padded && SECTION_Y, className)}
    >
      {glow}
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}
