"use client";

import { ArrowRight } from "lucide-react";
import { Cta } from "@/components/ui/cta";
import { rememberLeadSource } from "@/lib/lead-source";

/**
 * The section's call to action. A client component only so it can record
 * itself as the thing that sent the visitor to the contact form; the
 * section around it stays a server component.
 */
export function ServicesCta({ href, label }: { href: string; label: string }) {
  return (
    <Cta
      href={href}
      variant="ghost"
      data-testid="services-cta"
      className="shrink-0 text-xs uppercase"
      onClick={() => rememberLeadSource(`Core Services - ${label}`)}
    >
      {label}
      <ArrowRight
        size={14}
        className="transition-transform duration-300 group-hover:translate-x-1.5"
      />
    </Cta>
  );
}
