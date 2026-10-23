"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Cta } from "@/components/ui/cta";
import { navLinks, sectionIds, site } from "@/content/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { useLockBody } from "@/hooks/use-lock-body";
import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/utils/cn";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const pathname = usePathname();
  const activeSection = useActiveSection(sectionIds);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLockBody(open);

  // Escape closes, and focus returns to the control that opened the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /** A link is active when its section is in view, or its route is current. */
  function isActive(href: string) {
    if (href.startsWith("#")) {
      return pathname === "/" && `#${activeSection}` === href;
    }
    return pathname === href;
  }

  function close() {
    setOpen(false);
  }

  return (
    <header
      data-testid="site-header"
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5"
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-full px-4 transition-all duration-300 sm:px-6",
          scrolled ? "glass-strong py-2.5" : "glass py-3.5",
        )}
      >
        {/* Hash-only hrefs resolve against the current route, so the same links
            work on the home page and on both vertical pages. */}
        <Link href="/#top" className="shrink-0" aria-label={`${site.name} home`}>
          <Image
            src={site.logo}
            alt={site.name}
            width={428}
            height={113}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  data-active={active || undefined}
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/ /g, "-")}`}
                  className={cn(
                    "group relative font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 hover:text-white",
                    active ? "text-cyan-300" : "text-slate-300",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-px bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <Cta
            href="#contact"
            size="sm"
            block={false}
            data-testid="nav-cta"
            className="hidden gap-1.5 hover:scale-100 hover:shadow-glow-cyan sm:inline-flex"
          >
            Enquire Now <ArrowUpRight size={14} />
          </Cta>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            data-testid="menu-toggle"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-200 transition-colors hover:border-cyan-300/40 hover:text-white lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Backdrop: dismisses the panel and stops the page showing through it. */}
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          data-testid="menu-backdrop"
          onClick={close}
          className="fixed inset-0 -z-10 cursor-default bg-ink/80 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          id="mobile-menu"
          data-testid="mobile-menu"
          className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-surface/98 p-4 shadow-2xl shadow-black/60 lg:hidden"
        >
          <ul className="flex flex-col divide-y divide-white/5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[44px] items-center rounded-xl px-3 py-3.5 font-mono text-xs uppercase tracking-[0.18em] transition-colors",
                      active
                        ? "text-cyan-300"
                        : "text-slate-200 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Cta href="#contact" size="md" onClick={close} className="mt-4 w-full">
            Enquire Now <ArrowUpRight size={14} />
          </Cta>
        </div>
      ) : null}
    </header>
  );
}
