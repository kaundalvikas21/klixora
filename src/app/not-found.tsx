import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">{"// 404"}</p>
      <h1 className="mt-5 font-display text-4xl font-extrabold uppercase tracking-tight text-white sm:text-6xl">
        Page <span className="text-gradient">not found</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
        That link does not lead anywhere. Let&apos;s get you back to something
        useful.
      </p>
      <Link
        href="/"
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-ink transition-transform duration-300 hover:scale-[1.03]"
      >
        <ArrowLeft size={16} /> Back home
      </Link>
    </main>
  );
}
