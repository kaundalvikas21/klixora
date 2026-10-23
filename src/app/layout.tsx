import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google";
import { site } from "@/content/site";
import { getSeoDefaults, getSiteSettings } from "@/server/content";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

/**
 * Only the document-wide parts live here: the base URL and the title
 * template from SeoDefaults. Each route supplies its own title and
 * description through server/metadata.ts.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [defaults, settings] = await Promise.all([
    getSeoDefaults(),
    getSiteSettings(),
  ]);

  return {
    metadataBase: new URL(site.url),
    title: {
      default: settings.brandName,
      // SeoDefaults stores "%s | Klixora"; Next wants the same placeholder.
      template: defaults.titleTemplate,
    },
    description: settings.tagline,
    icons: { icon: "/favicon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#07090E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cyan-400 focus:px-5 focus:py-3 focus:font-display focus:text-sm focus:font-bold focus:text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
