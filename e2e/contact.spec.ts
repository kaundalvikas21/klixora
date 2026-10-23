import { expect, test } from "@playwright/test";
import { gotoReady } from "./ready";

test.describe("4-step enquiry form", () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, "/");
    await page.getByTestId("contact-section").scrollIntoViewIfNeeded();
  });

  test("blocks an empty first step", async ({ page }) => {
    await expect(page.getByTestId("contact-form")).toContainText("Step 1 of 4");
    await page.getByTestId("form-next").click();

    await expect(page.getByText("First name is required.")).toBeVisible();
    await expect(page.getByTestId("contact-form")).toContainText("Step 1 of 4");
  });

  test("rejects a malformed email and phone number", async ({ page }) => {
    await page.fill('input[name="firstName"]', "Asha");
    await page.fill('input[name="lastName"]', "Verma");
    await page.getByTestId("form-next").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 2 of 4");

    await page.fill('input[name="email"]', "not-an-email");
    await page.fill('input[name="phone"]', "123");
    await page.getByTestId("form-next").click();

    await expect(page.getByText("That email address does not look right.")).toBeVisible();
    await expect(
      page.getByText("Enter a phone number between 7 and 20 digits."),
    ).toBeVisible();
    await expect(page.getByTestId("contact-form")).toContainText("Step 2 of 4");
  });

  test("requires a goal before the final step", async ({ page }) => {
    await page.fill('input[name="firstName"]', "Asha");
    await page.fill('input[name="lastName"]', "Verma");
    await page.getByTestId("form-next").click();

    await page.fill('input[name="email"]', "asha@example.com");
    await page.fill('input[name="phone"]', "9876543210");
    await page.getByTestId("form-next").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 3 of 4");

    await page.getByTestId("form-next").click();
    await expect(page.getByText("Service is required.")).toBeVisible();

    await page.selectOption('select[name="goal"]', "SEO Optimization");
    await page.getByTestId("form-next").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 4 of 4");
    await expect(page.getByTestId("form-submit")).toBeVisible();
  });

  test("advancing to the last step does not submit the form", async ({ page }) => {
    // Regression: Next and Send occupy the same slot, so React reused one
    // <button> node and flipped its type to "submit" during the click that
    // advanced the step. The browser then submitted on that same click and
    // the enquiry went in a step early, without the message.
    await page.fill('input[name="firstName"]', "Asha");
    await page.fill('input[name="lastName"]', "Verma");
    await page.getByTestId("form-next").click();
    await page.fill('input[name="email"]', "asha@example.com");
    await page.fill('input[name="phone"]', "9876543210");
    await page.getByTestId("form-next").click();
    await page.selectOption('select[name="goal"]', "SEO Optimization");
    await page.getByTestId("form-next").click();

    // The form is still a form, and the last step is showing.
    await expect(page.getByTestId("contact-form")).toContainText("Step 4 of 4");
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.getByTestId("contact-success")).toHaveCount(0);
  });

  test("Enter on an intermediate step does not submit the form", async ({ page }) => {
    await page.fill('input[name="firstName"]', "Asha");
    await page.locator('input[name="lastName"]').fill("Verma");
    await page.locator('input[name="lastName"]').press("Enter");

    await expect(page.getByTestId("contact-form")).toContainText("Step 1 of 4");
    await expect(page.getByTestId("contact-success")).toHaveCount(0);
  });

  test("Back returns to the previous step with values intact", async ({ page }) => {
    await page.fill('input[name="firstName"]', "Asha");
    await page.fill('input[name="lastName"]', "Verma");
    await page.getByTestId("form-next").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 2 of 4");

    await page.getByTestId("form-back").click();
    await expect(page.getByTestId("contact-form")).toContainText("Step 1 of 4");
    await expect(page.locator('input[name="firstName"]')).toHaveValue("Asha");
  });

  test("a complete submission resolves without crashing the page", async ({ page }) => {
    await page.fill('input[name="firstName"]', "Asha");
    await page.fill('input[name="lastName"]', "Verma");
    await page.getByTestId("form-next").click();
    await page.fill('input[name="email"]', "asha@example.com");
    await page.fill('input[name="phone"]', "9876543210");
    await page.getByTestId("form-next").click();
    await page.selectOption('select[name="goal"]', "SEO Optimization");
    await page.getByTestId("form-next").click();
    await page.fill('textarea[name="message"]', "Testing the enquiry pipeline.");
    await page.getByTestId("form-submit").click();

    // With no DATABASE_URL the action returns a handled message rather than
    // throwing; with one it stores the lead and shows the success panel.
    // Either outcome proves the round trip.
    const success = page.getByTestId("contact-success");
    const failure = page.getByText(/not live yet|could not save your enquiry/i);
    await expect(success.or(failure)).toBeVisible({ timeout: 15_000 });
  });
});
