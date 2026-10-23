import { expect, test } from "@playwright/test";

/**
 * The admin is behind a login, so these cover the boundary and the login
 * screen itself. Everything past the login needs a running Supabase stack
 * and an admin user, which a CI run without one does not have.
 *
 * The redirect is asserted on the final URL rather than on who issued it:
 * with Supabase configured the proxy redirects, and without it the admin
 * layout does. Both are correct, and the test should not care which fired.
 */
const PROTECTED = [
  "/admin",
  "/admin/content",
  "/admin/leads",
  "/admin/seo",
  "/admin/settings",
];

test.describe("admin is unreachable while signed out", () => {
  for (const path of PROTECTED) {
    test(`${path} redirects to the login page`, async ({ page }) => {
      const response = await page.goto(path);

      expect(new URL(page.url()).pathname).toBe("/admin/login");
      // The intended destination survives the round trip.
      expect(new URL(page.url()).searchParams.get("from")).toBe(path);
      expect(response?.status()).toBeLessThan(400);
    });
  }

  test("the admin stays out of the index", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    const body = await response!.text();

    expect(body).toContain("Disallow: /admin");
  });
});

test.describe("login screen", () => {
  test("has labelled fields tied to their inputs", async ({ page }) => {
    await page.goto("/admin/login");

    const email = page.getByLabel("Email", { exact: true });
    const password = page.getByLabel("Password", { exact: true });

    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(email).toHaveAttribute("type", "email");
    await expect(password).toHaveAttribute("type", "password");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("rejects an unknown account without saying which half was wrong", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.getByLabel("Email", { exact: true }).fill("nobody@example.com");
    await page.getByLabel("Password", { exact: true }).fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByText("That email and password did not match."),
    ).toBeVisible({ timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe("/admin/login");
  });

  test("is usable at 375px with no horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 780 });
    await page.goto("/admin/login");

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);

    // A sign-in button has to be reachable with a thumb.
    const button = page.getByRole("button", { name: "Sign in" });
    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40);
  });
});

test.describe("public lead endpoint", () => {
  test("validates the payload and names the offending fields", async ({ request }) => {
    const response = await request.post("/api/leads", {
      data: { firstName: "", email: "not-an-email" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(Object.keys(body.fieldErrors)).toContain("firstName");
    expect(body.fieldErrors.firstName).toBe("First name is required.");
  });

  test("rejects a non-JSON body rather than throwing", async ({ request }) => {
    const response = await request.post("/api/leads", {
      headers: { "content-type": "application/json" },
      data: "not json",
    });

    expect(response.status()).toBe(400);
  });
});
