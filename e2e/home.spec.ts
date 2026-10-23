import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders every section in reference order", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    for (const id of [
      "hero-section",
      "clients-marquee",
      "services-section",
      "results-section",
      "why-us-section",
      "process-section",
      "testimonials-section",
      "contact-section",
      "site-footer",
    ]) {
      await expect(page.getByTestId(id)).toBeAttached();
    }
  });

  test("renders the full card inventory", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid^="service-card-"]')).toHaveCount(6);
    await expect(page.locator('[data-testid^="why-card-"]')).toHaveCount(6);
    await expect(page.locator('[data-testid^="contact-info-"]')).toHaveCount(4);
    await expect(page.locator('[data-testid^="process-step-"]')).toHaveCount(5);
    await expect(page.locator('[data-testid^="brand-logo-"]')).toHaveCount(9);
  });

  test("stat counters animate up to their final values", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("results-section").scrollIntoViewIfNeeded();

    await expect(page.getByTestId("stat-industries")).toContainText("7+", { timeout: 5000 });
    await expect(page.getByTestId("stat-businesses")).toContainText("30+");
    await expect(page.getByTestId("stat-revenue")).toContainText("10M+");
  });

  test("header anchors jump to their sections", async ({ page }) => {
    await page.goto("/");

    for (const [label, id] of [
      ["Services", "services"],
      ["Results", "results"],
      ["Why Us", "why-us"],
      ["Process", "process"],
      ["Contact", "contact"],
    ] as const) {
      await page.getByTestId("site-header").getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
    }
  });

  test("testimonial carousel advances on the next control", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("testimonials-section").scrollIntoViewIfNeeded();

    const second = page.getByTestId("testimonial-prospirafinreal");
    await expect(second).toHaveAttribute("aria-hidden", "true");

    await page.getByTestId("testimonial-next").click();
    await expect(second).not.toHaveAttribute("aria-hidden", "true");
  });
});
