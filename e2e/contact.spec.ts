import { expect, test } from "@playwright/test";

test.describe("4-step enquiry form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("contact-section").scrollIntoViewIfNeeded();
  });

  test("blocks an empty first step", async ({ page }) => {
    await expect(page.getByTestId("contact-form")).toContainText("Step 1 of 4");
    await page.getByTestId("form-next").click();

    await expect(page.getByText("Please tell us your first name.")).toBeVisible();
    await expect(page.getByTestId("contact-form")).toContainText("Step 1 of 4");
  });

  test("rejects a malformed email and phone number", async ({ page }) => {
    await page.fill('input[name="first_name"]', "Asha");
    await page.fill('input[name="last_name"]', "Verma");
    await page.getByTestId("form-next").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 2 of 4");

    await page.fill('input[name="email"]', "not-an-email");
    await page.fill('input[name="mobile"]', "123");
    await page.getByTestId("form-next").click();

    await expect(page.getByText("That email address does not look right.")).toBeVisible();
    await expect(
      page.getByText("Enter a phone number between 7 and 15 digits."),
    ).toBeVisible();
    await expect(page.getByTestId("contact-form")).toContainText("Step 2 of 4");
  });

  test("requires a service before the final step", async ({ page }) => {
    await page.fill('input[name="first_name"]', "Asha");
    await page.fill('input[name="last_name"]', "Verma");
    await page.getByTestId("form-next").click();

    await page.fill('input[name="email"]', "asha@example.com");
    await page.fill('input[name="mobile"]', "9876543210");
    await page.getByTestId("form-next").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 3 of 4");

    await page.getByTestId("form-next").click();
    await expect(page.getByText("Pick the service you are interested in.")).toBeVisible();

    await page.selectOption('select[name="service"]', "SEO Optimization");
    await page.getByTestId("form-next").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 4 of 4");
    await expect(page.getByTestId("form-submit")).toBeVisible();
  });

  test("Back returns to the previous step with values intact", async ({ page }) => {
    await page.fill('input[name="first_name"]', "Asha");
    await page.fill('input[name="last_name"]', "Verma");
    await page.getByTestId("form-next").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 2 of 4");

    await page.getByTestId("form-back").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 1 of 4");
    await expect(page.locator('input[name="first_name"]')).toHaveValue("Asha");
  });

  test("a complete submission resolves without crashing the page", async ({ page }) => {
    await page.fill('input[name="first_name"]', "Asha");
    await page.fill('input[name="last_name"]', "Verma");
    await page.getByTestId("form-next").click();
    await page.fill('input[name="email"]', "asha@example.com");
    await page.fill('input[name="mobile"]', "9876543210");
    await page.getByTestId("form-next").click();
    await page.selectOption('select[name="service"]', "SEO Optimization");
    await page.getByTestId("form-next").click();
    await page.fill('textarea[name="message"]', "Testing the enquiry pipeline.");
    await page.getByTestId("form-submit").click();

    // Lead storage is intentionally not wired up yet, so the action returns a
    // handled message rather than throwing. Either outcome proves the round trip.
    const success = page.getByTestId("contact-success");
    const failure = page.getByText(/not live yet|could not save your enquiry/i);
    await expect(success.or(failure)).toBeVisible({ timeout: 15_000 });
  });
});
