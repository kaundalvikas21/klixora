import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gotoReady } from "./ready";

const ROUTES = ["/", "/agri-marketing", "/event-management"];

for (const route of ROUTES) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await gotoReady(page, route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(
      blocking.map((v) => `${v.id}: ${v.nodes.length} node(s)`),
    ).toEqual([]);
  });

  test(`${route} has no horizontal scroll at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 760 });
    await gotoReady(page, route);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("reduced motion still reveals content", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await gotoReady(page, "/");

  // Sections below the fold must be readable without scrolling them into view.
  await expect(
    page.getByRole("heading", { name: /we say it out loud/i }),
  ).toBeVisible();

  // The assertion belongs on the reveal wrapper, not the heading: the wrapper
  // is what server-renders with an inline `opacity: 0` from Framer's initial
  // state, and what the reduced-motion rule in globals.css overrides. The
  // heading itself never carries an opacity.
  //
  // toHaveCSS rather than a one-shot getComputedStyle: that returns an empty
  // string until the element's style has resolved, and `Number("")` is 0, so
  // a plain read fails whenever the page is still painting.
  const revealed = page
    .locator("[data-reveal]")
    .filter({ hasText: /we say it out loud/i })
    .first();

  await expect(revealed).toHaveCSS("opacity", "1");
  await expect(revealed).toHaveCSS("transform", "none");

  await context.close();
});

test("mobile nav opens the menu sheet", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 760 });
  await gotoReady(page, "/");

  await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
  await page.getByTestId("menu-toggle").click();
  await expect(page.getByTestId("mobile-menu")).toBeVisible();
});
