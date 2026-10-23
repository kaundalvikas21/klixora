import { expect, test } from "@playwright/test";
import { gotoReady } from "./ready";

/**
 * Every public route's head comes from the seo_meta row for its slug. These
 * assert the wiring, not the copy: that each page has a complete, unique,
 * in-range head and a share card, whatever an operator later types into it.
 */
const PAGES = [
  { path: "/", slug: "home" },
  { path: "/agri-marketing", slug: "agri-marketing" },
  { path: "/event-management", slug: "event-management" },
] as const;

type Head = {
  title: string;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  twCard: string | null;
  twImage: string | null;
  jsonLd: { "@type"?: string }[];
  h1Count: number;
  imgsMissingAlt: number;
};

async function readHead(page: import("@playwright/test").Page): Promise<Head> {
  return page.evaluate(() => {
    const meta = (sel: string) =>
      document.querySelector<HTMLMetaElement>(sel)?.content ?? null;
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical:
        document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
      robots: meta('meta[name="robots"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogImage: meta('meta[property="og:image"]'),
      ogUrl: meta('meta[property="og:url"]'),
      twCard: meta('meta[name="twitter:card"]'),
      twImage: meta('meta[name="twitter:image"]'),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (n) => JSON.parse(n.textContent || "{}"),
      ),
      h1Count: document.querySelectorAll("h1").length,
      // A missing attribute is a bug; alt="" is a deliberate "decorative".
      imgsMissingAlt: [...document.querySelectorAll("img")].filter(
        (i) => i.getAttribute("alt") === null,
      ).length,
    };
  });
}

for (const { path, slug } of PAGES) {
  test(`${path} has a complete head`, async ({ page }) => {
    await gotoReady(page, path);
    const head = await readHead(page);

    expect(head.title.length, "title length").toBeGreaterThanOrEqual(45);
    expect(head.title.length, "title length").toBeLessThanOrEqual(60);

    expect(head.description, "description").toBeTruthy();
    expect(head.description!.length).toBeGreaterThanOrEqual(140);
    expect(head.description!.length).toBeLessThanOrEqual(160);

    expect(head.canonical, "canonical").toBeTruthy();
    expect(head.robots).toContain("index");

    expect(head.ogTitle, "og:title").toBeTruthy();
    expect(head.ogDescription, "og:description").toBeTruthy();
    expect(head.ogUrl, "og:url").toBeTruthy();
    expect(head.twCard).toBe("summary_large_image");

    // Exactly one H1, and no image without an alt attribute.
    expect(head.h1Count, "h1 count").toBe(1);
    expect(head.imgsMissingAlt, "images with no alt attribute").toBe(0);

    // Structured data is read from the rendered DOM, never from curl: a
    // fetch of the HTML cannot be trusted to show JSON-LD.
    expect(head.jsonLd.length, "JSON-LD blocks").toBeGreaterThan(0);
    expect(head.jsonLd[0]!["@type"], "JSON-LD @type").toBeTruthy();
  });

  test(`${path} always has a share card`, async ({ page, request }) => {
    await gotoReady(page, path);
    const head = await readHead(page);

    expect(head.ogImage, "og:image").toBeTruthy();
    expect(head.twImage, "twitter:image").toBe(head.ogImage);

    // Whether uploaded or generated, it has to be a real image.
    const url = head.ogImage!.includes("/api/og")
      ? `/api/og?slug=${slug}`
      : head.ogImage!;
    const response = await request.get(url);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  });
}

test("titles and descriptions are unique across pages", async ({ page }) => {
  const seen: { title: string; description: string }[] = [];
  for (const { path } of PAGES) {
    await gotoReady(page, path);
    const head = await readHead(page);
    seen.push({ title: head.title, description: head.description ?? "" });
  }
  expect(new Set(seen.map((s) => s.title)).size).toBe(seen.length);
  expect(new Set(seen.map((s) => s.description)).size).toBe(seen.length);
});

test("the sitemap lists only real, indexable URLs", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);

  expect(locs.length).toBeGreaterThan(0);
  // Anchors are not separate URLs and must not be listed.
  expect(locs.some((l) => l.includes("#"))).toBe(false);
  expect(new Set(locs).size).toBe(locs.length);
});

test("the share card is built on the page's own hero image", async ({ request }) => {
  // Satori silently renders nothing for a format it cannot decode, so the
  // card shipped once as a bare gradient. A card carrying a real photograph
  // is substantially heavier than one that is only type on a flat colour,
  // which is the cheapest reliable signal that the backdrop made it in.
  const withHero = (await request.get("/api/og?slug=event-management")).body();
  expect((await withHero).length).toBeGreaterThan(150_000);
});

test("share cards stay small enough for a link preview", async ({ request }) => {
  // Some clients give up fetching a preview well before a megabyte.
  for (const slug of ["home", "agri-marketing", "event-management"]) {
    const body = await (await request.get(`/api/og?slug=${slug}`)).body();
    expect(body.length, `${slug} card size`).toBeLessThan(750_000);
  }
});

test("the lead source records which CTA sent the visitor", async ({ page }) => {
  await gotoReady(page, "/");
  await page.getByTestId("hero-cta-primary").click();

  const stored = await page.evaluate(() =>
    sessionStorage.getItem("klixora:lead-source"),
  );
  // Without this the stored source could only ever be one value, and the
  // "where leads come from" chart compared a column against itself.
  expect(stored).toMatch(/^Hero - /);
});
