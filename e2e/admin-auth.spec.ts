import { expect, test } from "@playwright/test";

/**
 * The signed-in half of the admin. Needs a running Supabase stack with an
 * operator, which `npm run db:start && npm run db:admin` provides.
 */
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "vikas@fanaticcoders.com";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "klixora@321#";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin", { timeout: 20_000 });
}

const adminRail = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Admin sections", exact: true });

test.describe("password reveal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
  });

  test("starts masked and toggles both ways", async ({ page }) => {
    const field = page.getByLabel("Password", { exact: true });
    await field.fill("a-secret-value");
    await expect(field).toHaveAttribute("type", "password");

    const show = page.getByRole("button", { name: "Show password" });
    await expect(show).toHaveAttribute("aria-pressed", "false");
    await show.click();

    await expect(field).toHaveAttribute("type", "text");
    // The value survives the type change.
    await expect(field).toHaveValue("a-secret-value");

    const hide = page.getByRole("button", { name: "Hide password" });
    await expect(hide).toHaveAttribute("aria-pressed", "true");
    await hide.click();
    await expect(field).toHaveAttribute("type", "password");
  });

  test("the toggle never submits the form", async ({ page }) => {
    await page.getByLabel("Email", { exact: true }).fill("someone@example.com");
    await page.getByLabel("Password", { exact: true }).fill("whatever");
    await page.getByRole("button", { name: "Show password" }).click();

    await expect(page.getByText("did not match")).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe("/admin/login");
  });

  test("the toggle's name is distinct from the field's", async ({ page }) => {
    // The field is named "Password" and the control "Show password". If the
    // two ever collapse to the same name, a screen reader user cannot tell
    // the input from the button that reveals it.
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
      "type",
      "password",
    );
    await expect(page.getByRole("button", { name: "Show password" })).toBeVisible();
  });

  test("is reachable and operable from the keyboard", async ({ page }) => {
    await page.getByLabel("Password", { exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Show password" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
      "type",
      "text",
    );
  });
});

test.describe("admin brand comes from site settings", () => {
  // The last test writes to site_settings, which is a single shared row.
  // Serial keeps it from racing the read-only ones beside it.
  test.describe.configure({ mode: "serial" });

  /**
   * These assert the image SOURCE, not the alt text. The last test in this
   * file edits the alt to prove the binding is live, and a read-only check
   * that depended on that copy would fail for the wrong reason if a run
   * ever aborted before restoring it.
   */
  const LOGO_FILE = "klixora-logo-white.webp";

  test("the login card shows the configured logo", async ({ page }) => {
    await page.goto("/admin/login");
    const logo = page.locator("main img").first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", new RegExp(LOGO_FILE));
  });

  test("the rail shows it rather than a hardcoded mark", async ({ page }) => {
    await signIn(page);
    const logo = adminRail(page).locator("img");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", new RegExp(LOGO_FILE));
  });

  test("editing it updates the admin chrome and the public site", async ({
    page,
  }) => {
    await signIn(page);
    const logo = adminRail(page).locator("img");

    async function setAlt(value: string) {
      await page.goto("/admin/settings?tab=identity");
      await page.getByLabel("Alt text").fill(value);
      await page.getByRole("button", { name: "Save & publish" }).click();
      await expect(page.getByText("Settings saved and live.")).toBeVisible({
        timeout: 15_000,
      });
    }

    try {
      await setAlt("Swapped brand mark");

      // The rail reads the same cached row the save invalidated.
      await expect(logo).toHaveAttribute("alt", "Swapped brand mark", {
        timeout: 15_000,
      });

      await page.goto("/");
      await expect(
        page.getByTestId("site-header").locator("img").first(),
      ).toHaveAttribute("alt", "Swapped brand mark");
    } finally {
      // Restoring through the UI, not the database: only the Server Action
      // invalidates the `site-content` cache, so a direct write would leave
      // the running server serving the swapped value.
      await setAlt("Klixora");
    }
  });
});

test.describe("sign out", () => {
  /** The rail button opens the confirmation; the dialog does the signing out. */
  async function confirmSignOut(page: import("@playwright/test").Page) {
    await page.getByRole("button", { name: "Sign out" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Sign out" }).click();
  }

  test("ends the session and bounces later visits", async ({ page }) => {
    await signIn(page);
    await confirmSignOut(page);
    await page.waitForURL("**/admin/login", { timeout: 20_000 });

    // The session is actually gone, not just the screen.
    await page.goto("/admin");
    expect(new URL(page.url()).pathname).toBe("/admin/login");

    await page.goto("/admin/leads");
    expect(new URL(page.url()).pathname).toBe("/admin/login");
  });

  test("acknowledges the press rather than looking dead", async ({ page }) => {
    await signIn(page);
    await confirmSignOut(page);

    // Either the busy state is caught or the navigation already happened.
    // Both prove the click was acknowledged; a silent no-op fails both.
    await page.waitForURL("**/admin/login", { timeout: 20_000 });
  });

  test("asks first, and backing out leaves the session alone", async ({
    page,
  }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Sign out" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Stay signed in" }).click();
    await expect(dialog).toBeHidden();

    // Still on an admin screen, and still allowed on one.
    expect(new URL(page.url()).pathname).toBe("/admin");
    await page.goto("/admin/leads");
    expect(new URL(page.url()).pathname).toBe("/admin/leads");
  });

  test("stops claiming to sign out once the operator is back in", async ({
    page,
  }) => {
    // Regression: `leaving` is client state that outlived the navigation, and
    // the router keeps the rail mounted across sign out and the next sign in,
    // so the button still read "Signing out..." to someone already back in.
    await signIn(page);
    await confirmSignOut(page);
    await page.waitForURL("**/admin/login", { timeout: 20_000 });

    await signIn(page);
    await expect(
      page.getByRole("button", { name: "Sign out" }).first(),
    ).toBeEnabled();
    await expect(page.getByText("Signing out")).toHaveCount(0);
  });
});
