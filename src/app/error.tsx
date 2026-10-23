"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
        onClick={reset}
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-ink transition-transform duration-300 hover:scale-[1.03]"
      >
        Try again
      </button>
    </main>
  );
}
