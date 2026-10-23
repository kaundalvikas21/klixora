import { ArrowUpRight, ExternalLink, Mail, PhoneCall } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * CTAs are rows in the database now, so their icon has to be derived rather
 * than written next to each button. The icon follows the action: a call gets
 * a handset, an email gets an envelope, a link off-site says so, and
 * everything else gets the arrow.
 */
export function ctaIcon(label: string, href: string): LucideIcon {
  if (href.startsWith("tel:") || /\b(call|phone)\b/i.test(label)) return PhoneCall;
  if (href.startsWith("mailto:") || /\bemail\b/i.test(label)) return Mail;
  if (/^https?:\/\//.test(href)) return ExternalLink;
  return ArrowUpRight;
}

/** CtaVariant maps onto the pill variants defined in components/ui/cta.tsx. */
export const CTA_VARIANT_MAP = {
  PRIMARY: "primary",
  OUTLINE: "secondary",
  TEXT: "ghost",
} as const;
