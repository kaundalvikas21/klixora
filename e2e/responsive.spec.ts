import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROUTES = ["/", "/agri-marketing", "/event-management"] as const;
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 760 },
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

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);

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
