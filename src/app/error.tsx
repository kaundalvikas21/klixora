"use client";

import { useEffect } from "react";

/**
 * Route-segment boundary. This does not cover the root layout;
 * global-error.tsx handles that.
 */
export default function Error({
  error,
  retry,
}: {
  // Docs: a Client Component can throw a non-Error, so this arrives as unknown.
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">{"// Something broke"}</p>
      <h1 className="mt-5 font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">
        That did not <span className="text-gradient">go to plan</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
        An unexpected error stopped this page from rendering. Trying again
        usually fixes it.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-ink transition-transform duration-300 hover:scale-[1.03]"
      >
        Try again
      </button>
      {digest ? (
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Reference {digest}
        </p>
      ) : null}
    </main>
  );
}
