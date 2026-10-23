import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import {
  getPageHeroImage,
  getSeoMeta,
  getSiteSettings,
} from "@/server/content";

/**
 * The share card every page falls back to.
 *
 * Without this, five pages shipped with no `og:image` at all and shared as a
 * bare grey link, which measurably costs clicks. Generating the card from
 * the same row the page's title comes from means a page can never drift into
 * having no image again, and an operator who wants bespoke art can still
 * upload one in the SEO screen, which takes precedence.
 *
 * 1200x630 is what every platform crops to.
 */
export const alt = "Klixora";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The backdrop, ready for Satori.
 *
 * Two things have to happen here.
 *
 * Satori will not fetch an image from localhost at all (SSRF protection),
 * and fetching your own asset over HTTP costs a round trip per render in
 * production, so a site-relative path is read straight off disk.
 *
 * Satori also cannot decode WebP, and every hero on this site is WebP. It
 * does not error on one, it silently renders nothing, which is how the
 * first version of this card shipped looking like a plain gradient. So the
 * bytes are transcoded to JPEG first, at the card's own size.
 */
async function backdrop(src: string | null, origin: string): Promise<string | null> {
  if (!src) return null;

  try {
    const bytes = /^https?:\/\//.test(src)
      ? Buffer.from(await (await fetch(new URL(src, origin))).arrayBuffer())
      : await readFile(path.join(process.cwd(), "public", src));

    const jpeg = await sharp(bytes)
      .resize(size.width, size.height, { fit: "cover", position: "centre" })
      // A soft backdrop, for two reasons. It keeps the headline legible over
      // a busy photograph, and ImageResponse only emits PNG, which encodes
      // sharp photographic detail terribly: unblurred, these cards came out
      // near a megabyte, and some clients give up fetching a link preview
      // well before that.
      .blur(6)
      .jpeg({ quality: 72 })
      .toBuffer();

    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch (error) {
    // A missing or unreadable hero must not take the whole card down; it
    // falls back to the brand gradient underneath.
    console.error("[og] could not prepare the backdrop", src, error);
    return null;
  }
}

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") ?? "home";

  const url = new URL(request.url);
  const [seo, settings, hero] = await Promise.all([
    getSeoMeta(slug),
    getSiteSettings(),
    getPageHeroImage(slug),
  ]);

  const heroUrl = await backdrop(hero, url.origin);

  const title = seo?.ogTitle || seo?.metaTitle || settings.brandName;
  const description = seo?.ogDescription || seo?.metaDescription || settings.tagline;
  const eyebrow = slug === "home" ? settings.tagline : slug.replace(/-/g, " ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#07090e",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* The page's own hero image, so the card advertises the page it
            belongs to rather than a generic brand panel. */}
        {heroUrl ? (
          /* Satori renders this, not a browser: next/image does not exist
             inside an ImageResponse, so a plain img is the only option. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
            }}
          />
        ) : null}

        {/* Scrim. The hero images are busy and bright in places, and white
            type on an unmasked photograph is unreadable at thumbnail size. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            // Heavy enough on the left to carry white type, light enough on
            // the right that the photograph is actually visible. The first
            // version was opaque all the way across and the image may as
            // well not have been there.
            backgroundImage:
              "linear-gradient(90deg, rgba(7,9,14,0.94) 0%, rgba(7,9,14,0.82) 40%, rgba(7,9,14,0.46) 74%, rgba(7,9,14,0.30) 100%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundImage: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
            }}
          />
          <div
            style={{
              color: "#f1f5f9",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            {settings.brandName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              color: "#22d3ee",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            {`// ${eyebrow}`}
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: title.length > 60 ? 58 : 70,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              // Two lines at most; the platform crop is unforgiving.
              display: "block",
              maxWidth: 880,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: 26,
              lineHeight: 1.4,
              maxWidth: 820,
            }}
          >
            {/* Meta descriptions are capped at 160, so they fit whole. The
                guard is only for a hand-edited row that ran long. */}
            {description.length > 180
              ? `${description.slice(0, 179).trimEnd()}...`
              : description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#64748b",
            fontSize: 22,
          }}
        >
          <div>{settings.domain}</div>
          <div>{`${settings.addressLine1}, ${settings.addressLine2}`}</div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        // The card only changes when the row does, and a crawler refetching
        // it on every share would be wasteful.
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
