"use client";

import { useActionState, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import { CtaButton } from "@/components/ui/cta";
import { submitEnquiry } from "@/server/actions/leads-public";
import { leadSubmissionSchema } from "@/lib/schemas/leads";
import type { LeadSubmitResult } from "@/lib/schemas/leads";
import { DIRECT_SOURCE, readLeadSource } from "@/lib/lead-source";
import type { HomeContent } from "@/server/content";
import { EASE } from "@/utils/motion";

type Props = {
  contact: HomeContent["contact"];
  /** Which block this form instance belongs to, stored on the lead. */
  source?: string;
};

const initialState: LeadSubmitResult = { ok: false, message: "" };

/** UTM keys worth keeping. Anything else on the URL is noise. */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

export function ContactForm({ contact, source = DIRECT_SOURCE }: Props) {
  const steps = contact.steps;
  const total = steps.length;

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const reduced = useReducedMotion();

  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);

  /**
   * Attribution comes off the URL, which is the only place it exists. Read at
   * submit time rather than copied into state on mount: hidden inputs that
   * only exist after hydration are a mismatch, and reading late also catches
   * a URL that changed through client-side navigation.
   */
  function withUtm(formData: FormData) {
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) formData.set(key, value.slice(0, 200));
    }
    // Which CTA sent them here, falling back to the form's own name when
    // they scrolled to it directly.
    formData.set("source", readLeadSource(source));
    formAction(formData);
  }

  const currentFields = useMemo(
    () => steps[step]?.fields ?? [],
    [steps, step],
  );

  // Server errors are the base layer; a client entry (including an empty
  // string, meaning "the user fixed this") takes precedence over it.
  const errors: Record<string, string> = {
    ...(state.fieldErrors ?? {}),
    ...clientErrors,
  };

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    setClientErrors((e) => ({ ...e, [name]: "" }));
  }

  /** Validate only this step's fields, so Next can gate progress. */
  function validateStep(index: number) {
    const fields = steps[index]?.fields ?? [];
    const result = leadSubmissionSchema.safeParse({ ...values, source });
    if (result.success) return true;

    const names = fields.map((f) => f.name);
    const next: Record<string, string> = { ...clientErrors };
    for (const name of names) next[name] = "";

    let failed = 0;

    // An empty required field is reported against the label the visitor can
    // actually see. The schema names the Lead column it writes to, which is
    // not what the form calls it: "goal" is labelled "Service" on the page.
    for (const field of fields) {
      if (field.required && !(values[field.name] ?? "").trim()) {
        next[field.name] = `${field.label} is required.`;
        failed += 1;
      }
    }

    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (names.includes(key) && !next[key]) {
        next[key] = issue.message;
        failed += 1;
      }
    }

    setClientErrors(next);
    return failed === 0;
  }

  if (state.ok) {
    return (
      <div
        data-testid="contact-success"
        className="glass-strong flex min-h-[420px] flex-col items-center justify-center rounded-3xl p-8 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
          <Check size={24} />
        </span>
        <h3 className="mt-6 font-display text-xl font-bold text-white">
          {contact.successTitle}
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
          {contact.successMessage}
        </p>
      </div>
    );
  }

  const isLast = step === total - 1;
  const currentNames = currentFields.map((f) => f.name);
  // Values from other steps still have to reach the server action.
  const hidden = Object.entries(values).filter(([name]) => !currentNames.includes(name));

  return (
    <form
      action={withUtm}
      // Pressing Enter in any field implicitly submits the form, which on an
      // intermediate step would post a half-filled enquiry. Only the last
      // step is allowed to submit.
      onSubmit={(event) => {
        if (!isLast) event.preventDefault();
      }}
      noValidate
      data-testid="contact-form"
      className="glass-strong rounded-3xl p-6 sm:p-8"
    >
      <input type="hidden" name="source" value={source} />
      {hidden.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {/* Honeypot. Hidden from sight and from assistive tech, so only a bot
          that fills every input it finds will populate it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
          Step {step + 1} of {total}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">
          {Math.round(((step + 1) / total) * 100)}%
        </span>
      </div>

      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        aria-label="Form progress"
      >
        <motion.div
          animate={{ width: `${((step + 1) / total) * 100}%` }}
          transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
        />
      </div>

      <h3 className="mt-7 font-display text-lg font-bold tracking-tight text-white sm:text-xl">
        {steps[step]?.question}
      </h3>

      <div className="relative mt-6 min-h-[150px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
            className={
              currentFields.length > 1 ? "grid gap-4 sm:grid-cols-2" : "flex flex-col gap-4"
            }
          >
            {currentFields.map((field) => (
              <Field
                key={field.name}
                id={`lead-${field.name}`}
                label={field.label}
                error={errors[field.name]}
              >
                {field.type === "textarea" ? (
                  <textarea
                    id={`lead-${field.name}`}
                    className="input-glass resize-none"
                    name={field.name}
                    rows={5}
                    value={values[field.name] ?? ""}
                    onChange={(e) => set(field.name, e.target.value)}
                    aria-invalid={Boolean(errors[field.name])}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={`lead-${field.name}`}
                    className="input-glass"
                    name={field.name}
                    value={values[field.name] ?? ""}
                    onChange={(e) => set(field.name, e.target.value)}
                    aria-invalid={Boolean(errors[field.name])}
                  >
                    <option value="">Select an option...</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`lead-${field.name}`}
                    className="input-glass"
                    name={field.name}
                    type={field.type}
                    inputMode={
                      field.type === "email" ? "email" : field.type === "tel" ? "tel" : undefined
                    }
                    autoComplete={AUTOCOMPLETE[field.name] ?? "on"}
                    placeholder={field.label}
                    value={values[field.name] ?? ""}
                    onChange={(e) => set(field.name, e.target.value)}
                    aria-invalid={Boolean(errors[field.name])}
                  />
                )}
              </Field>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <p aria-live="polite" className="min-h-5 text-xs text-rose-300">
        {state.ok ? "" : state.message}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        {step > 0 ? (
          <CtaButton
            type="button"
            variant="subtle"
            size="md"
            onClick={() => setStep((s) => s - 1)}
            data-testid="form-back"
          >
            <ArrowLeft size={14} /> Back
          </CtaButton>
        ) : null}

        {/* The keys matter. Without them React sees the same component in
            the same slot and reuses the <button> node, flipping its `type`
            from "button" to "submit" during the very click that advanced the
            step. The browser then submits the form on that same click, which
            posted the enquiry a step early. Distinct keys force a new node. */}
        {isLast ? (
          <CtaButton
            key="form-submit"
            type="submit"
            size="md"
            disabled={pending}
            data-testid="form-submit"
          >
            {pending ? "Sending..." : "Send enquiry"} <Send size={14} />
          </CtaButton>
        ) : (
          <CtaButton
            key="form-next"
            type="button"
            size="md"
            onClick={() => {
              if (validateStep(step)) setStep((s) => Math.min(s + 1, total - 1));
            }}
            data-testid="form-next"
          >
            Next <ArrowRight size={14} />
          </CtaButton>
        )}
      </div>
    </form>
  );
}

/** Browser autofill hints, by Lead column name. */
const AUTOCOMPLETE: Record<string, string> = {
  firstName: "given-name",
  lastName: "family-name",
  email: "email",
  phone: "tel",
  company: "organization",
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400"
      >
        {label}
      </label>
      {children}
      <span aria-live="polite" className="mt-1.5 block min-h-4 text-xs text-rose-300">
        {error}
      </span>
    </div>
  );
}
