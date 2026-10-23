import { expect, test, type Page } from "@playwright/test";

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "vikas@fanaticcoders.com";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "klixora@321#";

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin", { timeout: 20_000 });
}

/**
 * Arrive through the public endpoint, so this exercises the real path.
 *
 * Each call claims its own x-forwarded-for. The form is rate limited to five
 * enquiries per IP per ten minutes, which is correct for the public site and
 * would otherwise make this suite fail on whichever test happened to run
 * sixth.
 */
async function submitLead(page: Page, firstName: string) {
  const response = await page.request.post("/api/leads", {
    headers: { "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 254) + 1}` },
    data: {
      firstName,
      lastName: "Bell",
      email: `${firstName.toLowerCase()}@example.com`,
      phone: "9876543210",
      goal: "SEO Optimization",
      message: "Raised by the notification spec.",
      source: "Scrolled to the form",
    },
  });
  expect(response.status()).toBe(201);
}

const bell = (page: Page) => page.getByRole("button", { name: /^Notifications,/ });
const panel = (page: Page) => page.getByRole("dialog", { name: "Notifications" });

// Serial: these share one operator's unread count, so a lead submitted by a
// parallel test would land in the middle of another one's assertion.
test.describe.configure({ mode: "serial" });

test.describe("lead notifications", () => {
  test("the endpoint refuses anyone without a session", async ({ request }) => {
    const response = await request.get("/api/admin/notifications");
    expect(response.status()).toBe(401);
  });

  test("a new lead raises the badge, and reading it clears it", async ({ page }) => {
    await signIn(page);

    // Start from a known state rather than whatever earlier specs left.
    await bell(page).click();
    const markRead = panel(page).getByRole("button", { name: "Mark read" });
    if (await markRead.isVisible()) await markRead.click();
    await expect(bell(page)).toHaveAccessibleName("Notifications, none unread");

    const name = `Bell${Date.now().toString().slice(-6)}`;
    await submitLead(page, name);

    // The bell polls on a timer; a reload is the deterministic way to ask.
    await page.reload();
    // At least one, not exactly one: the count belongs to the operator, not
    // to this test, and pinning it exactly makes the suite order-dependent.
    await expect(bell(page)).toHaveAccessibleName(/Notifications, [1-9]\d* unread/);

    await bell(page).click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByText(`${name} Bell`)).toBeVisible();

    await panel(page).getByRole("button", { name: "Mark read" }).click();
    await expect(bell(page)).toHaveAccessibleName("Notifications, none unread");

    // Cleared on the server, not just in the component.
    await page.reload();
    await expect(bell(page)).toHaveAccessibleName("Notifications, none unread");
  });

  test("closes on Escape and hands focus back to the bell", async ({ page }) => {
    await signIn(page);

    await bell(page).click();
    await expect(panel(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(bell(page)).toBeFocused();
  });

  test("an entry opens that lead", async ({ page }) => {
    await signIn(page);
    await submitLead(page, `Open${Date.now().toString().slice(-6)}`);
    await page.reload();

    await bell(page).click();
    await panel(page).getByRole("link").first().click();

    await page.waitForURL(/\/admin\/leads\?lead=/, { timeout: 15_000 });
    expect(new URL(page.url()).searchParams.get("lead")).toBeTruthy();
  });
});
