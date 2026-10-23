import { expect, test } from "@playwright/test";

const PAGES = [
  {
    path: "/agri-marketing",
    title: /Agri Marketing/,
    services: 3,
    extra: "page-problems",
    extraCount: { selector: '[data-testid^="page-problem-"]', n: 6 },
  },
  {
    path: "/event-management",
    title: /Event Management/,
    services: 9,
    extra: "page-expertise",
    extraCount: { selector: '[data-testid^="expertise-"]', n: 9 },
  },
] as const;

for (const spec of PAGES) {
  test.describe(spec.path, () => {
    test("renders the shared template sections", async ({ page }) => {
      const response = await page.goto(spec.path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(spec.title);

      for (const id of [
        "page-hero",
        "spec-ribbon",
        "page-services",
        spec.extra,
        "page-why",
        "page-blueprint",
        "page-cta",
        "site-footer",
      ]) {
        await expect(page.getByTestId(id)).toBeAttached();
      }
    });

    test("renders the right number of cards", async ({ page }) => {
      await page.goto(spec.path);
      await expect(page.locator('[data-testid^="page-service-"]')).toHaveCount(spec.services);
      await expect(page.locator('[data-testid^="blueprint-"]')).toHaveCount(4);
      await expect(page.locator(spec.extraCount.selector)).toHaveCount(spec.extraCount.n);
    });
  });
}

test("event hero shows both stat chips", async ({ page }) => {
  await page.goto("/event-management");
  await expect(page.getByTestId("hero-stat-400+")).toContainText("Events Managed");
  await expect(page.getByTestId("hero-stat-95%")).toContainText("Client Satisfaction");
});
