import { expect, test } from "@playwright/test";

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "vikas@fanaticcoders.com";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "klixora@321#";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin", { timeout: 20_000 });
  await settled(page);
}

/**
 * Wait for an admin screen to have real content rather than its skeleton.
 *
 * Every admin route reads the operator's session, so none of it can be
 * prerendered: the shell paints with a placeholder and the data streams in
 * behind a Suspense boundary. A locator-based assertion waits for that by
 * itself, but a raw page.evaluate() measures whatever is in the DOM at that
 * instant, which is the skeleton.
 *
 * Resolves immediately when nothing is loading, since waiting for a selector
 * to be detached passes when it never matched in the first place.
 */
async function settled(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => !document.querySelector('[aria-busy="true"]'),
    undefined,
    { timeout: 20_000 },
  );
}

test.describe("KPI tiles", () => {
  /**
   * Regression: the tiles sat 2x2 at every width because Tailwind v4 emits
   * arbitrary `min-[1180px]:` variants BEFORE the named scale, so
   * `sm:grid-cols-2` came later in the stylesheet and won. Named breakpoints
   * sort by value and cascade correctly.
   */
  test("sit in one row of four, equally sized, from the wide breakpoint", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await signIn(page);

    const grid = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="kpi-grid"]');
      if (!el) return null;
      const widths = [...el.children].map((child) =>
        Math.round(child.getBoundingClientRect().width),
      );
      const tops = [...el.children].map((child) =>
        Math.round(child.getBoundingClientRect().top),
      );
      return { widths, tops, gap: getComputedStyle(el).gap };
    });

    expect(grid).not.toBeNull();
    expect(grid!.widths).toHaveLength(4);
    // All four on the same row.
    expect(new Set(grid!.tops).size).toBe(1);
    // And equally wide, within a rounding pixel.
    expect(Math.max(...grid!.widths) - Math.min(...grid!.widths)).toBeLessThanOrEqual(1);
    expect(grid!.gap).not.toBe("normal");
  });

  test("stack on a phone rather than overflowing", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await signIn(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("status is never carried by colour alone", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await signIn(page);

    // Each tile states its status in words as well as in hue, and the whole
    // tile's accessible name carries it too.
    const tiles = page.getByTestId("kpi-grid").locator("> a");
    await expect(tiles).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
      const name = await tiles.nth(i).getAttribute("aria-label");
      expect(name).toMatch(
        /On track|Needs attention|Off track|In progress|No signal/,
      );
      // And an icon beside the label, not just the colour.
      await expect(tiles.nth(i).locator("svg").first()).toBeVisible();
    }
  });
});

test.describe("lead status chips", () => {
  test("pair their colour with a dot and the state name", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/leads");

    const group = page.getByRole("group", { name: "Filter by status" });
    await expect(group).toBeVisible();

    for (const label of ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]) {
      const chip = group.getByRole("button", { name: new RegExp(`^${label}`) });
      await expect(chip).toBeVisible();
      // The written state, so the chip survives greyscale.
      await expect(chip).toContainText(label);
      // The dot that pairs with it.
      expect(await chip.locator("span.rounded-full").count()).toBeGreaterThan(0);
    }
  });
});

test.describe("CMS live preview", () => {
  /**
   * Regression: the preview used to be a scaled <div>, so CSS media queries,
   * `vw` and `dvh` all resolved against the real browser window. A 390px
   * "mobile" frame still matched `lg:` and still computed `9vw` against a
   * 1600px window, so the hero rendered 72px type in a 390px column and
   * spilled out of the frame. An iframe is a real viewport.
   */
  const FRAME = 'iframe[title="Live preview of the public section"]';

  for (const [device, width] of [
    ["Desktop", 1280],
    ["Tablet", 834],
    ["Mobile", 390],
  ] as const) {
    test(`${device} renders at its own viewport, with nothing clipped`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1600, height: 1000 });
      await signIn(page);
      await page.goto("/admin/content?tab=hero");
      await page.getByRole("button", { name: device }).click();

      const frame = page.frameLocator(FRAME);
      await expect(frame.locator("h1")).toBeVisible();

      const measured = await frame.locator("body").evaluate(() => ({
        innerWidth: window.innerWidth,
        overflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        heading: Math.round(
          parseFloat(getComputedStyle(document.querySelector("h1")!).fontSize),
        ),
      }));

      expect(measured.innerWidth).toBe(width);
      // Nothing spills sideways out of the device.
      expect(measured.overflow).toBeLessThanOrEqual(1);
      // And the type actually responds to the simulated width.
      expect(measured.heading).toBeGreaterThan(20);
      expect(measured.heading).toBeLessThan(width / 4);
    });
  }

  test("type gets smaller as the device does", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await signIn(page);
    await page.goto("/admin/content?tab=hero");

    const headingSize = async () =>
      page
        .frameLocator(FRAME)
        .locator("h1")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    await page.getByRole("button", { name: "Desktop" }).click();
    const desktop = await headingSize();
    await page.getByRole("button", { name: "Mobile" }).click();
    const mobile = await headingSize();

    expect(mobile).toBeLessThan(desktop);
  });

  test("the preview is not interactive", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await signIn(page);
    await page.goto("/admin/content?tab=hero");

    const pointer = await page
      .frameLocator(FRAME)
      .locator("a")
      .first()
      .evaluate((el) => getComputedStyle(el).pointerEvents);

    expect(pointer).toBe("none");
  });
});

test.describe("the save bar", () => {
  test("closes once the work is stored", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await signIn(page);
    await page.goto("/admin/seo?page=event-management");

    const bar = page.getByRole("region", { name: "Unsaved changes" });
    await expect(bar).toHaveCount(0);

    const title = page.getByLabel("Meta title", { exact: true });
    const original = await title.inputValue();

    try {
      await title.fill(`${original} x`);
      await expect(bar).toBeVisible();

      await page.getByRole("button", { name: "Save & publish" }).click();
      await expect(page.getByText(/generateMetadata on that route/)).toBeVisible({
        timeout: 15_000,
      });
      await expect(bar).toHaveCount(0, { timeout: 15_000 });
    } finally {
      await title.fill(original);
      if (await bar.count()) {
        await page.getByRole("button", { name: "Save & publish" }).click();
        await expect(bar).toHaveCount(0, { timeout: 15_000 });
      }
    }
  });

  test("ignores fields the operator cannot edit", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await signIn(page);
    await page.goto("/admin/seo?page=home");

    // `score` and `updatedAt` ride on the same object as the copy. Neither
    // is editable, and the server restamps updatedAt on every save, so
    // counting them meant the bar could never be cleared.
    const bar = page.getByRole("region", { name: "Unsaved changes" });
    await page.getByLabel("Meta title", { exact: true }).fill("A new meta title here");
    await expect(bar).toBeVisible();
    await expect(bar).not.toContainText("updatedAt");
    await expect(bar).not.toContainText("score");
    await page.getByRole("button", { name: "Discard" }).click();
  });
});

test("the data model page is gone from the admin", async ({ page }) => {
  await signIn(page);
  await expect(
    page.getByRole("navigation", { name: "Admin sections", exact: true }),
  ).not.toContainText("Data model");
});

test.describe("admin home links", () => {
  test("the rail brand and the breadcrumb root both return to /admin", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await signIn(page);
    await page.goto("/admin/seo");

    await page
      .getByRole("navigation", { name: "Admin sections", exact: true })
      .getByRole("link", { name: /admin home/i })
      .click();
    await page.waitForURL("**/admin", { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe("/admin");

    await page.goto("/admin/settings");
    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Klixora Admin" })
      .click();
    await page.waitForURL("**/admin", { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe("/admin");
  });

  test("the drawer brand is a link too, on a phone", async ({ page }) => {
    // It used to be a bare <span>, so the logo was clickable on a desktop
    // and inert in the drawer.
    await page.setViewportSize({ width: 390, height: 840 });
    await signIn(page);
    await page.goto("/admin/settings");

    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .locator("#admin-mobile-nav")
      .getByRole("link", { name: /admin home/i })
      .click();

    await page.waitForURL("**/admin", { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe("/admin");
  });
});

test.describe("the OG image field", () => {
  test("shows the generated card when it is left empty", async ({ page }) => {
    // An empty frame beside a field that says the card is made for you reads
    // as something broken, which is what sent the operator looking for a bug.
    await page.setViewportSize({ width: 1600, height: 1200 });
    await signIn(page);
    await page.goto("/admin/seo");

    const field = page.getByRole("textbox", { name: "OG image", exact: true });
    await expect(field).toBeVisible();
    await expect(field).toHaveValue("");

    const preview = page.locator('img[src*="/api/og"]').first();
    await expect(preview).toBeVisible();
    await expect(page.getByText(/Generated from this page/i).first()).toBeVisible();
  });
});

test.describe("lead sources", () => {
  test("a single source is stated, not drawn as one lone bar", async ({ page }) => {
    // A bar chart with one category invites a comparison that is not there.
    await page.setViewportSize({ width: 1600, height: 1000 });
    await signIn(page);
    await expect(page.getByText("How leads reach the form")).toBeVisible();
  });
});
