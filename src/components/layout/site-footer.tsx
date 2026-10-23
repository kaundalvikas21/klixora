import Image from "next/image";
import Link from "next/link";
import { navLinks, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer
      data-testid="site-footer"
      className="border-t border-white/5 bg-white/[0.02] py-12"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Image
              src={site.logo}
              alt={site.name}
              width={428}
              height={113}
              className="h-8 w-auto"
            />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400">
              {site.tagline}
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400 transition-colors duration-300 hover:text-cyan-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            © {site.founded} {site.name} · {site.address} ·{" "}
            <a href={`mailto:${site.email}`} className="hover:text-cyan-300">
              {site.email}
            </a>{" "}
            ·{" "}
            <a href={`tel:${site.phone}`} className="hover:text-cyan-300">
              {site.phone}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
