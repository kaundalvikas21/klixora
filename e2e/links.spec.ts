import { expect, test } from "@playwright/test";
import { gotoReady } from "./ready";

/**
 * Every internal link on every public page has to resolve to something that
 * exists. A bare `#hash` resolves against the current route, so the nav on a
 * vertical page used to point at anchors that were not there, or at that
 * page's own sections rather than the ones the labels name.
 */
const PAGES = ["/", "/agri-marketing", "/event-management"];

test.describe("internal links resolve", () => {
  for (const path of PAGES) {
    test(`${path}: every in-page anchor has a target`, async ({ page }) => {
      await gotoReady(page, path);

      const broken = await page.evaluate(() => {
        const bad: string[] = [];
        for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
          const href = a.getAttribute("href")!;
          // Only same-page fragments; cross-route ones are checked below.
          if (!href.startsWith("#") || href === "#") continue;
          if (!document.querySelector(href)) bad.push(href);
        }
        return bad;
      });

      expect(broken, `anchors with no target on ${path}`).toEqual([]);
    });

    test(`${path}: no link points at a 404`, async ({ page, request }) => {
      await gotoReady(page, path);

      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
          .map((a) => a.getAttribute("href")!)
          .filter((h) => h.startsWith("/") && !h.startsWith("//")),
      );

      const routes = [...new Set(hrefs.map((h) => h.split("#")[0]!))].filter(Boolean);

      for (const route of routes) {
        const response = await request.get(route);
        expect(response.status(), `${route} linked from ${path}`).toBeLessThan(400);
      }
    });
  }
});

test.describe("navigation lands where the label promises", () => {
  const SECTIONS = [
    ["Services", "services"],
    ["Results", "results"],
    ["Why Us", "why-us"],
    ["Process", "process"],
    ["Contact", "contact"],
  ] as const;

  for (const from of PAGES) {
    test(`from ${from}, section links go to the home page's sections`, async ({
      page,
    }) => {
      for (const [label, id] of SECTIONS) {
        await gotoReady(page, from);
        await page
          .getByTestId("site-header")
          .getByRole("link", { name: label, exact: true })
          .click();

        await page.waitForURL(`**/#${id}`, { timeout: 10_000 });
        expect(new URL(page.url()).pathname, `${label} from ${from}`).toBe("/");

        // Scoped to what is on screen: under Cache Components the route you
        // came from stays mounted in a hidden <Activity>, so its own
        // same-named section is still in the DOM.
        await expect(page.locator(`#${id}:visible`).first()).toBeVisible();
      }
    });
  }

  for (const from of PAGES) {
    test(`from ${from}, the logo returns to the home hero`, async ({ page }) => {
      await gotoReady(page, from);
      await page.getByTestId("site-header").getByRole("link", { name: /home$/i }).click();
      await page.waitForURL("**/#top", { timeout: 10_000 });
      expect(new URL(page.url()).pathname).toBe("/");
      await expect(page.getByTestId("hero-section")).toBeVisible();
    });
  }

  test("the vertical pages are reachable from the nav", async ({ page }) => {
    for (const [label, path] of [
      ["Agri Marketing", "/agri-marketing"],
      ["Events", "/event-management"],
    ] as const) {
      await gotoReady(page, "/");
      await page
        .getByTestId("site-header")
        .getByRole("link", { name: label, exact: true })
        .click();
      await page.waitForURL(`**${path}`, { timeout: 10_000 });
      await expect(page.getByTestId("page-hero")).toBeVisible();
    }
  });
});
