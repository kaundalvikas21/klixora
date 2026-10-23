"use client";

import {
  forwardRef,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { STATUS } from "@/lib/status";
import { cn } from "@/utils/cn";

/**
 * The admin's form and surface primitives.
 *
 * Built on the tokens already defined in app/globals.css rather than adding a
 * second UI kit: the same --card, --border, --radius and the same three type
 * roles (Syne for headings, Plus Jakarta for body, JetBrains Mono for
 * counters, ids, timestamps and uppercase micro-labels).
 */

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-cyan-400 to-violet-500 text-ink hover:brightness-110",
        secondary:
          "border border-white/12 bg-white/[0.04] text-slate-200 hover:border-cyan-300/40 hover:text-white",
        ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
        danger:
          "border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:border-rose-400/60 hover:text-rose-100",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        // 44px: the minimum comfortable touch target on a phone.
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, type = "button", ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...rest}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Panel({
  children,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/8 bg-card/70 p-4 sm:p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

export function PanelHeading({
  title,
  hint,
  actions,
}: {
  title: string;
  hint?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-sm font-bold tracking-tight text-white">
          {title}
        </h2>
        {hint ? (
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{hint}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Mono, uppercase, wide-tracked. Used for every column and field label. */
export function MicroLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

type FieldProps = {
  id?: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Rendered to the right of the label, e.g. a character counter. */
  aside?: ReactNode;
  children: (id: string) => ReactNode;
  className?: string;
};

/**
 * Every input in the admin goes through this, which is what guarantees the
 * label is tied to the control by id and that the error is announced.
 */
export function Field({
  id,
  label,
  hint,
  error,
  aside,
  children,
  className,
}: FieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <label htmlFor={fieldId} className="block">
          <MicroLabel>{label}</MicroLabel>
        </label>
        {aside}
      </div>
      {children(fieldId)}
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{hint}</p>
      ) : null}
      <span
        aria-live="polite"
        className="mt-1 block min-h-4 text-xs text-rose-300"
      >
        {error}
      </span>
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 transition-colors placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/[0.06] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 aria-[invalid=true]:border-rose-400/60";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(controlClass, className)} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  function Textarea({ className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(controlClass, "resize-y leading-relaxed", className)}
        {...rest}
      />
    );
  },
);

/**
 * Password field with a reveal toggle.
 *
 * Details that matter here:
 *
 * - The control is a real <button type="button">, so it is keyboard
 *   reachable and never submits the form it sits in.
 * - Its accessible name says what pressing it will DO ("Show password"),
 *   and `aria-pressed` carries the current state, so a screen reader user
 *   is not left guessing whether the value is currently exposed.
 * - Revealing is per-field and resets on unmount. Nothing is persisted: a
 *   password left visible after a reload is a shoulder-surfing gift.
 * - Feedback is on press rather than release, and the only animated
 *   property is transform, so it stays on the compositor.
 */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<ComponentProps<"input">, "type">
>(function PasswordInput({ className, id, ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  const Glyph = visible ? EyeOff : Eye;

  return (
    <span className="relative block">
      <input
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        // Room for the toggle, so a long value never slides under it.
        className={cn(controlClass, "pr-11", className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((shown) => !shown)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
        // The input already announces itself; this is a secondary control
        // and should not steal the field's own description.
        title={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-[color,transform] duration-150 ease-out hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <Glyph size={16} aria-hidden="true" />
      </button>
    </span>
  );
});

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(controlClass, "[&>option]:bg-surface", className)}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

// ---------------------------------------------------------------------------
// Switch
// ---------------------------------------------------------------------------

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Always required: a bare switch is unusable with a screen reader. */
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:opacity-50",
        checked
          ? "border-cyan-300/50 bg-cyan-400/25"
          : "border-white/12 bg-white/[0.06]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "ml-0.5 h-5 w-5 rounded-full transition-transform duration-200 motion-reduce:transition-none",
          checked ? "translate-x-5 bg-cyan-300" : "translate-x-0 bg-slate-400",
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
  {
    variants: {
      // Drawn from lib/status.ts so a colour means the same thing on every
      // screen. `live` and `draft` are the content-state aliases of good and
      // warning; they exist because "LIVE" reads better than "good" on a
      // publishing badge.
      tone: {
        neutral: STATUS.neutral.chip,
        live: STATUS.good.chip,
        good: STATUS.good.chip,
        draft: STATUS.warning.chip,
        warning: STATUS.warning.chip,
        danger: STATUS.critical.chip,
        critical: STATUS.critical.chip,
        info: STATUS.info.chip,
        accent: "border-violet-400/30 bg-violet-500/10 text-violet-200",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  children,
  tone,
  className,
}: VariantProps<typeof badgeVariants> & {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Counters and meters
// ---------------------------------------------------------------------------

/**
 * Character counter with an ideal range. The number is mono, and goes amber
 * outside the range rather than red: a long description is a judgement call,
 * not an error.
 */
export function Counter({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}) {
  const inRange = value >= min && value <= max;
  return (
    <span
      className={cn(
        "font-mono text-[10px] tabular-nums tracking-[0.12em]",
        value === 0
          ? "text-slate-500"
          : inRange
            ? "text-emerald-300"
            : "text-amber-300",
      )}
    >
      {value}
      <span className="text-slate-500">
        {" / "}
        {min}-{max}
      </span>
    </span>
  );
}

export function Meter({
  value,
  min,
  max,
  label,
}: {
  value: number;
  min: number;
  max: number;
  label: string;
}) {
  // The bar is scaled against a bit past the ideal maximum, so overshooting
  // is visible rather than pinned at 100%.
  const ceiling = Math.round(max * 1.4);
  const pct = Math.min(100, Math.round((value / ceiling) * 100));
  const inRange = value >= min && value <= max;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={ceiling}
      aria-valuenow={value}
      aria-label={label}
      className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]"
    >
      {/* The ideal band, so the target is visible, not just the current value. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 border-x border-white/20 bg-white/[0.05]"
        style={{
          left: `${(min / ceiling) * 100}%`,
          width: `${((max - min) / ceiling) * 100}%`,
        }}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 motion-reduce:transition-none",
          inRange ? "bg-emerald-400" : "bg-amber-400",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------

export function EmptyState({
  title,
  detail,
  action,
  icon,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-slate-500">{icon}</div> : null}
      <h3 className="font-display text-sm font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
        {detail}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
