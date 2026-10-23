import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROUTES = ["/", "/agri-marketing", "/event-management"] as const;
const VIEWPORTS = [
  { name: "galaxy-s8", width: 360, height: 740 },
  { name: "mi-11i", width: 393, height: 873 },
  { name: "iphone", width: 375, height: 760 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

/** Column count a CSS grid actually resolved to. */
async function columnCount(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return 0;
    return getComputedStyle(el)
      .gridTemplateColumns.split(" ")
      .filter(Boolean).length;
  }, selector);
}

test.describe("responsive layout", () => {
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route} has no horizontal overflow at ${vp.width}px (${vp.name})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);

        // html carries overflow-x:clip, so scrollWidth can never report
        // overflow. Content that bleeds is simply cut off and invisible, so
        // element boxes are the only honest signal.
        const contentOverflow = await page.evaluate(() => {
          const out: string[] = [];
          for (const el of document.querySelectorAll("body *")) {
            const cs = getComputedStyle(el);
            if (cs.position === "fixed") continue;
            if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX === "visible") {
              const sec =
                (el.closest("[data-testid]") as HTMLElement | null)?.dataset
                  .testid ?? "?";
              // The testimonial stack deliberately peeks past its container.
              if (sec.startsWith("testimonial")) continue;
              out.push(`${sec}:${el.tagName}`);
            }
          }
          return out;
        });
        expect(contentOverflow).toEqual([]);

        // Deliberately clipped tracks (the brand and ribbon marquees) are wider
        // than the viewport by design, so only unclipped elements are checked.
        const bleeding = await page.evaluate((vw) => {
          const clipped = (el: Element | null): boolean => {
            while (el && el !== document.body) {
              const o = getComputedStyle(el).overflowX;
              if (o === "hidden" || o === "clip" || o === "auto") return true;
              el = el.parentElement;
            }
            return false;
          };
          return [...document.querySelectorAll("body *")]
            .filter((el) => el.getBoundingClientRect().width > vw + 1)
            .filter((el) => !clipped(el.parentElement))
            .map((el) => el.tagName + "." + (el.className || "").toString().slice(0, 40));
        }, vp.width);
        expect(bleeding).toEqual([]);

        await expect(page.getByTestId("site-header")).toBeVisible();
        await expect(page.getByTestId("site-footer")).toBeAttached();
      });
    }
  }

  test("tablet gets its own grid step rather than falling back to one column", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    const services = await columnCount(
      page,
      '[data-testid="services-section"] .grid',
    );
    expect(services).toBe(2);

    const bento = await columnCount(page, '[data-testid="why-us-section"] .grid');
    expect(bento).toBe(2);
  });

  test("desktop restores the full grids", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    expect(
      await columnCount(page, '[data-testid="services-section"] .grid'),
    ).toBe(3);
    expect(await columnCount(page, '[data-testid="why-us-section"] .grid')).toBe(6);
  });

  test("primary CTAs fill the container on mobile and shrink from sm up", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 760 });
    await page.goto("/");

    const cta = page.getByTestId("hero-cta-enquire");
    const ctaBox = await cta.boundingBox();
    const containerWidth = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="hero-section"] .max-w-7xl');
      if (!el) return 0;
      const styles = getComputedStyle(el);
      return (
        el.clientWidth -
        parseFloat(styles.paddingLeft) -
        parseFloat(styles.paddingRight)
      );
    });

    expect(ctaBox).not.toBeNull();
    expect(Math.abs(ctaBox!.width - containerWidth)).toBeLessThanOrEqual(2);

    await page.setViewportSize({ width: 1440, height: 900 });
    const wideBox = await cta.boundingBox();
    expect(wideBox!.width).toBeLessThan(400);
  });
});

test.describe("nav active state", () => {
  test("marks the section in view as active", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const services = page.getByTestId("nav-link-services");
    await expect(services).not.toHaveAttribute("data-active", "true");

    await page.getByTestId("services-section").scrollIntoViewIfNeeded();
    await expect(services).toHaveAttribute("data-active", "true");
    await expect(services).toHaveAttribute("aria-current", "page");

    // Moving on hands the active state to the next section.
    await page.getByTestId("why-us-section").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("nav-link-why-us")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(services).not.toHaveAttribute("data-active", "true");
  });

  test("marks the current route as active on a vertical page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/agri-marketing");
    await expect(page.getByTestId("nav-link-agri-marketing")).toHaveAttribute(
      "data-active",
      "true",
    );
  });
});

test.describe("mobile off-canvas", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 760 });
    await page.goto("/");
    await page.getByTestId("menu-toggle").click();
    await expect(page.getByTestId("mobile-menu")).toBeVisible();
  });

  test("closes on backdrop click", async ({ page }) => {
    await page.getByTestId("menu-backdrop").click({ position: { x: 10, y: 600 } });
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
  });

  test("closes on Escape and returns focus to the toggle", async ({ page }) => {
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
    await expect(page.getByTestId("menu-toggle")).toBeFocused();
  });

  test("panel is opaque enough to read against the page behind it", async ({
    page,
  }) => {
    const alpha = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="mobile-menu"]');
      if (!el) return 0;
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg.match(/rgba?\(([^)]+)\)/);
      if (!m) return 1;
      const parts = m[1].split(",").map((p) => parseFloat(p));
      return parts.length === 4 ? parts[3] : 1;
    });
    expect(alpha).toBeGreaterThanOrEqual(0.9);
  });
});

test.describe("footer", () => {
  test("renders every column and the legal row", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByTestId("site-footer");

    for (const heading of ["Services", "Company", "Get in touch"]) {
      await expect(footer.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(page.locator('[data-testid^="social-"]')).toHaveCount(4);
    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
    await expect(footer.getByText(/All rights reserved/)).toBeVisible();
  });

  test("link columns sit two-up on phones and expand on desktop", async ({
    page,
  }) => {
    // Narrowest realistic phone first; two columns must still fit.
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    expect(await columnCount(page, '[data-testid="site-footer"] .grid')).toBe(2);

    await page.setViewportSize({ width: 1440, height: 900 });
    expect(await columnCount(page, '[data-testid="site-footer"] .grid')).toBe(12);
  });

  test("no footer link overflows its column on a 320px screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");

    const tight = await page.evaluate(() => {
      const footer = document.querySelector('[data-testid="site-footer"]')!;
      return [...footer.querySelectorAll("a")]
        .filter((a) => a.scrollWidth > a.clientWidth + 1)
        .map((a) => a.textContent?.trim().slice(0, 30) ?? "");
    });
    expect(tight).toEqual([]);
  });

  for (const vp of VIEWPORTS) {
    test(`footer has no contrast violations at ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      const results = await new AxeBuilder({ page })
        .include('[data-testid="site-footer"]')
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(blocking.map((v) => v.id)).toEqual([]);
    });
  }
});

test.describe("site logo", () => {
  for (const from of ["/agri-marketing", "/event-management"] as const) {
    test(`returns to the home hero from ${from}`, async ({ page }) => {
      await page.goto(from);

      // Both heroes carry id="top", so a bare "#top" used to stay on the
      // current page instead of going home.
      await page.getByTestId("site-header").getByRole("link").first().click();

      await expect(page).toHaveURL(/\/#top$/);
      await expect(page.getByTestId("hero-section")).toBeVisible();
    });
  }
});

test("the process column actually pins while scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const delta = await page.evaluate(async () => {
    const sticky = document.querySelector(
      '[data-testid="process-section"] .lg\\:sticky',
    ) as HTMLElement;
    document
      .querySelector('[data-testid="process-section"]')!
      .scrollIntoView({ block: "start", behavior: "instant" });
    await new Promise((r) => setTimeout(r, 300));
    const before = sticky.getBoundingClientRect().top;
    window.scrollBy({ top: 400, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 300));
    return sticky.getBoundingClientRect().top - before;
  });

  // Not sticking at all would move it the full -400. Pinning holds it near 0.
  expect(delta).toBeGreaterThan(-200);
});
