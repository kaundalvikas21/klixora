import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { brands } from "@/content/site";
import { cn } from "@/utils/cn";

export function BrandMarquee() {
  return (
    <Reveal y={24} className="relative border-y border-white/5 bg-white/[0.02] py-9">
      <p className="mb-7 px-5 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-slate-400 sm:px-8">
        Trusted by forward-thinking brands
      </p>

      <div className="marquee-paused overflow-hidden" data-testid="clients-marquee">
        <div className="flex w-max animate-marquee">
          {/* Track is duplicated so the -50% keyframe loops without a visible jump. */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex items-center gap-20 pr-20"
            >
              {brands.map((brand) => (
                <Image
                  key={brand.slug}
                  src={brand.src}
                  alt={copy === 0 ? brand.name : ""}
                  title={brand.name}
                  width={180}
                  height={brand.h}
                  data-testid={copy === 0 ? `brand-logo-${brand.slug}` : undefined}
                  style={{ height: brand.h, width: "auto" }}
                  className={cn(
                    "max-w-[180px] object-contain transition-all duration-500 hover:scale-110 hover:opacity-100 hover:grayscale-0",
                    "soft" in brand && brand.soft
                      ? "opacity-45 grayscale"
                      : "opacity-40 brightness-0 grayscale invert hover:brightness-110 hover:invert-0",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
