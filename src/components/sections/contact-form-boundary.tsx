"use client";

import { catchError, type ErrorInfo } from "next/error";
import { site } from "@/content/site";

/**
 * Component-level boundary so a client render fault inside the multi-step form
 * degrades to a usable fallback instead of blanking the whole contact section.
 * Route-level error.tsx is too coarse for this.
 */
function FormErrorFallback(_props: object, { retry }: ErrorInfo) {
  return (
    <div
      data-testid="contact-form-error"
      className="glass-strong flex min-h-[420px] flex-col items-center justify-center rounded-3xl p-8 text-center"
    >
      <h3 className="font-display text-xl font-bold text-white">
        The form stopped responding
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
        Reload it below, or email{" "}
        <a href={`mailto:${site.email}`} className="text-cyan-300 hover:underline">
          {site.email}
        </a>{" "}
        and we will pick it up from there.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-7 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-ink transition-transform duration-300 hover:scale-[1.03]"
      >
        Reload the form
      </button>
    </div>
  );
}

export const ContactFormBoundary = catchError(FormErrorFallback);
