"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import { CtaButton } from "@/components/ui/cta";
import { initialSubmitState, submitEnquiry } from "@/services/leads";
import { formSteps } from "@/content/home";
import { serviceOptions } from "@/content/site";
import { EASE } from "@/utils/motion";
import { STEP_FIELDS, enquirySchema, type EnquiryInput } from "@/utils/validation";

const EMPTY: EnquiryInput = {
  first_name: "",
  last_name: "",
  email: "",
  mobile: "",
  service: "" as EnquiryInput["service"],
  message: "",
};

const TOTAL = formSteps.length;
const ALL_FIELDS = Object.keys(EMPTY) as (keyof EnquiryInput)[];

export function ContactForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<EnquiryInput>(EMPTY);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const reduced = useReducedMotion();

  const [state, formAction, pending] = useActionState(
    submitEnquiry,
    initialSubmitState,
  );

  // Server errors are the base layer; a client entry (including an empty
  // string, meaning "the user fixed this") takes precedence over it.
  const errors: Record<string, string> = {
    ...(state.fieldErrors ?? {}),
    ...clientErrors,
  };

  const set =
    (field: keyof EnquiryInput) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setValues((v) => ({ ...v, [field]: event.target.value }));
      setClientErrors((e) => ({ ...e, [field]: "" }));
    };

  /** Validate only the fields on the current step, so Next can gate progress. */
  function validateStep(index: number) {
    const fields = STEP_FIELDS[index];
    const result = enquirySchema.safeParse(values);
    if (result.success) return true;

    // Start from what the client already knows, then clear and re-evaluate
    // just this step's fields, so a server error on an untouched field is not
    // silently dropped.
    const next: Record<string, string> = { ...clientErrors };
    for (const field of fields) next[field] = "";

    let failed = 0;
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");
      if ((fields as readonly string[]).includes(key) && !next[key]) {
        next[key] = issue.message;
        failed += 1;
      }
    }
    setClientErrors(next);
    return failed === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, TOTAL - 1));
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
          Thanks, that&apos;s everything we need.
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
          A real person will reply within 24 hours. No autoresponder, no pitch
          deck.
        </p>
      </div>
    );
  }

  const isLast = step === TOTAL - 1;
  const currentFields = STEP_FIELDS[step] as readonly string[];
  // Values from other steps still have to reach the server action.
  const hiddenFields = ALL_FIELDS.filter((f) => !currentFields.includes(f));

  return (
    <form
      action={formAction}
      noValidate
      data-testid="contact-form"
      className="glass-strong rounded-3xl p-6 sm:p-8"
    >
      {hiddenFields.map((field) => (
        <input key={field} type="hidden" name={field} value={values[field] ?? ""} />
      ))}

      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
          Step {step + 1} of {TOTAL}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">
          {Math.round(((step + 1) / TOTAL) * 100)}%
        </span>
      </div>

      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL}
        aria-valuenow={step + 1}
        aria-label="Form progress"
      >
        <motion.div
          animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
        />
      </div>

      <h3 className="mt-7 font-display text-lg font-bold tracking-tight text-white sm:text-xl">
        {formSteps[step]}
      </h3>

      <div className="relative mt-6 min-h-[150px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
            className="flex flex-col gap-4"
          >
            {step === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" error={errors.first_name}>
                  <input
                    className="input-glass"
                    name="first_name"
                    autoComplete="given-name"
                    placeholder="First name"
                    value={values.first_name}
                    onChange={set("first_name")}
                    aria-invalid={Boolean(errors.first_name)}
                  />
                </Field>
                <Field label="Last name" error={errors.last_name}>
                  <input
                    className="input-glass"
                    name="last_name"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={values.last_name}
                    onChange={set("last_name")}
                    aria-invalid={Boolean(errors.last_name)}
                  />
                </Field>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" error={errors.email}>
                  <input
                    className="input-glass"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={values.email}
                    onChange={set("email")}
                    aria-invalid={Boolean(errors.email)}
                  />
                </Field>
                <Field label="Mobile" error={errors.mobile}>
                  <input
                    className="input-glass"
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91 00000 00000"
                    value={values.mobile}
                    onChange={set("mobile")}
                    aria-invalid={Boolean(errors.mobile)}
                  />
                </Field>
              </div>
            ) : null}

            {step === 2 ? (
              <Field label="Service" error={errors.service}>
                <select
                  className="input-glass"
                  name="service"
                  value={values.service}
                  onChange={set("service")}
                  aria-invalid={Boolean(errors.service)}
                >
                  <option value="">Select a service...</option>
                  {serviceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            {step === 3 ? (
              <Field label="Message (optional)" error={errors.message}>
                <textarea
                  className="input-glass resize-none"
                  name="message"
                  rows={5}
                  placeholder="Budget, timeline, what you have tried so far"
                  value={values.message}
                  onChange={set("message")}
                />
              </Field>
            ) : null}
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

        {isLast ? (
          <CtaButton type="submit" size="md" disabled={pending} data-testid="form-submit">
            {pending ? "Sending..." : "Send enquiry"} <Send size={14} />
          </CtaButton>
        ) : (
          <CtaButton type="button" size="md" onClick={handleNext} data-testid="form-next">
            Next <ArrowRight size={14} />
          </CtaButton>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      {children}
      <span aria-live="polite" className="mt-1.5 block min-h-4 text-xs text-rose-300">
        {error}
      </span>
    </label>
  );
}
