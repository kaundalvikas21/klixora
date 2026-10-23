import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/agri-marketing", "/event-management"];

for (const route of ROUTES) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route);

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
    await page.goto(route);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("reduced motion still reveals content", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  // Sections below the fold must be readable without scrolling them into view.
  const heading = page.getByRole("heading", { name: /we say it out loud/i });
  await expect(heading).toBeVisible();

  const opacity = await heading.evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeGreaterThan(0.9);

  await context.close();
});

test("mobile nav opens the menu sheet", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto("/");

  await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
  await page.getByTestId("menu-toggle").click();
  await expect(page.getByTestId("mobile-menu")).toBeVisible();
});
