"use client";

import NextImage from "next/image";
import { Globe, ImageOff } from "lucide-react";
import { MicroLabel } from "@/components/admin/ui/primitives";

/**
 * Two previews, both live. The point is to see the truncation happen as you
 * type rather than to read a character count and guess.
 */
const TITLE_CUT = 60;
const DESCRIPTION_CUT = 160;

const clip = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}...` : value;

function hostOf(url: string, fallback: string) {
  try {
    return new URL(url).host;
  } catch {
    return fallback;
  }
}

export function GooglePreview({
  title,
  description,
  canonicalUrl,
  path,
  domain,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  path: string;
  domain: string;
}) {
  const host = hostOf(canonicalUrl, domain);
  const crumb = path === "/" ? host : `${host} › ${path.replace(/^\//, "")}`;

  return (
    <div>
      <MicroLabel>Google result</MicroLabel>
      <div className="mt-2 rounded-lg border border-white/8 bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600">
            <Globe size={12} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] leading-tight text-[#202124]">
              {domain}
            </span>
            <span className="block truncate text-[12px] leading-tight text-[#4d5156]">
              {crumb}
            </span>
          </span>
        </div>
        <p className="mt-2 text-[18px] leading-snug text-[#1a0dab]">
          {clip(title, TITLE_CUT) || "Your meta title will appear here"}
        </p>
        <p className="mt-1 text-[13px] leading-[1.45] text-[#4d5156]">
          {clip(description, DESCRIPTION_CUT) ||
            "Your meta description will appear here. Without one, Google writes its own from the page copy."}
        </p>
      </div>
    </div>
  );
}

export function ShareCardPreview({
  title,
  description,
  imageUrl,
  canonicalUrl,
  domain,
  generated = false,
}: {
  title: string;
  description: string;
  imageUrl: string;
  canonicalUrl: string;
  domain: string;
  /** True when the card is the generated fallback rather than uploaded art. */
  generated?: boolean;
}) {
  const host = hostOf(canonicalUrl, domain);

  return (
    <div>
      <span className="flex items-center justify-between gap-2">
        <MicroLabel>Shared link (WhatsApp, LinkedIn, X)</MicroLabel>
        {generated ? <MicroLabel>Generated card</MicroLabel> : null}
      </span>
      <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-[#111b21]">
        <div className="relative aspect-[1200/630] w-full bg-white/[0.04]">
          {imageUrl ? (
            <NextImage
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-cover"
              // The generated card is rendered on demand, so there is
              // nothing for the image optimiser to pre-process.
              unoptimized={imageUrl.startsWith("http") || imageUrl.startsWith("/api/og")}
            />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
              <ImageOff size={22} aria-hidden="true" />
              <span className="px-6 text-center text-xs leading-relaxed">
                No Open Graph image, so this shares as a bare link
              </span>
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
            {host}
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-slate-100">
            {title || "Your title will appear here"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
