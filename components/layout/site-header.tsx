"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks, site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Anchor links point at the current page on the sub-pages, so `basePath`
 * keeps "#services" resolving to the right document.
 */
export function SiteHeader({ basePath = "" }: { basePath?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Stop the page scrolling behind the open mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const href = (h: string) => (h.startsWith("#") ? `${basePath}${h}` : h);

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
        <Link
          href={`${basePath}#top`}
          className="shrink-0"
          aria-label={`${site.name} home`}
        >
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
                href={href(link.href)}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300 transition-colors duration-300 hover:text-cyan-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href={`${basePath}#contact`}
            data-testid="nav-cta"
            className="hidden rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 font-display text-[11px] font-bold uppercase tracking-wider text-ink transition-transform duration-300 hover:scale-[1.04] sm:inline-flex"
          >
            Enquire Now
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
                  href={href(link.href)}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 font-mono text-xs uppercase tracking-[0.18em] text-slate-300 transition-colors hover:bg-white/5 hover:text-cyan-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`${basePath}#contact`}
            onClick={() => setOpen(false)}
            className="mt-4 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-ink"
          >
            Enquire Now
          </Link>
        </div>
      ) : null}
    </header>
  );
}
