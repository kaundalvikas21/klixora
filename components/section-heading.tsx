import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "left",
  className,
}: Props) {
  return (
    <div
      className={cn(
        align === "center" && "mx-auto text-center",
        align === "center" ? "max-w-2xl" : "max-w-3xl",
        className,
      )}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {sub ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
          {sub}
        </p>
      ) : null}
    </div>
  );
}
