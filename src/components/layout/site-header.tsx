"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navLinks, site } from "@/content/site";
import { useLockBody } from "@/hooks/use-lock-body";
import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/utils/cn";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  useLockBody(open);

  return (
    <header
      data-testid="site-header"
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5"
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-full px-5 transition-all duration-300 sm:px-6",
          scrolled ? "glass-strong py-2.5" : "glass py-3.5",
        )}
      >
        {/* Hash-only hrefs resolve against the current route, so the same links
            work on the home page and on both vertical pages. */}
        <Link href="#top" className="shrink-0" aria-label={`${site.name} home`}>
          <Image
            src={site.logo}
            alt={site.name}
            width={132}
            height={32}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300 transition-colors duration-300 hover:text-cyan-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="#contact"
            data-testid="nav-cta"
            className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-ink transition-shadow duration-300 hover:shadow-glow-cyan sm:inline-flex"
          >
            Enquire Now <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            data-testid="menu-toggle"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-200 lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="mobile-menu"
          data-testid="mobile-menu"
          className="glass-strong mx-auto mt-3 max-w-7xl overflow-hidden rounded-3xl p-5 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 font-mono text-xs uppercase tracking-[0.18em] text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-ink"
          >
            Enquire Now <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : null}
    </header>
  );
}
