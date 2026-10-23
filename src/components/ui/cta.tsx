import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Every call to action on the site. Keeping the variants here is what stops the
 * padding drifting (px-7 / px-8 / px-9 all existed before this).
 *
 * `block` is on by default: on phones a CTA fills the container, and only
 * shrinks to its content from `sm` up.
 */
export const ctaVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-bold uppercase tracking-wider transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-cyan-400 to-violet-500 text-ink hover:scale-[1.03] hover:shadow-glow-cyan",
        secondary:
          "border border-white/15 text-slate-200 hover:border-cyan-300/60 hover:text-white hover:shadow-glow-cyan",
        subtle:
          "border border-white/10 text-slate-300 hover:border-white/25 hover:text-white",
        ghost:
          "group font-mono normal-case tracking-[0.22em] text-slate-300 hover:text-cyan-300",
      },
      size: {
        sm: "px-5 py-2.5 text-[11px]",
        md: "px-7 py-3.5 text-xs",
        lg: "px-8 py-4 text-sm",
      },
      block: {
        true: "w-full sm:w-auto",
        false: "w-auto",
      },
    },
    compoundVariants: [
      // The text-only variant has no pill, so padding and block width
      // would both read as mistakes.
      { variant: "ghost", class: "w-auto rounded-none px-0 py-0" },
    ],
    defaultVariants: { variant: "primary", size: "lg", block: true },
  },
);

type CtaBaseProps = VariantProps<typeof ctaVariants> & {
  children: ReactNode;
  className?: string;
};

type CtaLinkProps = CtaBaseProps &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

export function Cta({
  children,
  className,
  variant,
  size,
  block,
  ...rest
}: CtaLinkProps) {
  return (
    <Link className={cn(ctaVariants({ variant, size, block }), className)} {...rest}>
      {children}
    </Link>
  );
}

type CtaButtonProps = CtaBaseProps &
  Omit<ComponentProps<"button">, "className" | "children">;

export function CtaButton({
  children,
  className,
  variant,
  size,
  block,
  ...rest
}: CtaButtonProps) {
  return (
    <button className={cn(ctaVariants({ variant, size, block }), className)} {...rest}>
      {children}
    </button>
  );
}
