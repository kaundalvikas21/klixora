"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches render errors inside the multi-step form so a fault there degrades
 * to a usable fallback instead of blanking the whole contact section. The
 * route-level error.tsx is too coarse for that.
 *
 * This is a plain React error boundary rather than Next's catchError helper.
 * next/error.js attaches catchError to the shared dist/pages/_error exports
 * object with configurable:false, so the second time Turbopack evaluates that
 * module in dev it throws "Cannot redefine property: catchError". The React
 * primitive has no such problem and is what error.tsx uses underneath.
 */
/** `email` comes from Site Settings, so the fallback never hardcodes it. */
type Props = { children: ReactNode; email: string };
type State = { hasError: boolean };

export class ContactFormBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[ContactForm] render failed:", error);
  }

  private retry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

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
          <a
            href={`mailto:${this.props.email}`}
            className="text-cyan-300 hover:underline"
          >
            {this.props.email}
          </a>{" "}
          and we will pick it up from there.
        </p>
        <button
          type="button"
          onClick={this.retry}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-7 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-ink transition-transform duration-300 hover:scale-[1.03]"
        >
          Reload the form
        </button>
      </div>
    );
  }
}
