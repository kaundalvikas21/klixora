import { expect, test } from "@playwright/test";
import { gotoReady } from "./ready";

test.describe("scroll behaviour", () => {
  test("nothing intercepts the wheel", async ({ page }) => {
    await gotoReady(page, "/");

    // A hijacking library attaches a non-passive wheel listener so it can call
    // preventDefault. If one ever gets added back, this catches it.
    const nonPassiveWheel = await page.evaluate(() => {
      let nonPassive = 0;
      const original = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (type, fn, opts) {
        if (type === "wheel" || type === "touchmove") {
          const passive =
            typeof opts === "object" && opts !== null ? opts.passive : undefined;
          if (passive === false) nonPassive += 1;
        }
        return original.call(this, type, fn, opts);
      };
      window.dispatchEvent(new Event("resize"));
      return nonPassive;
    });
    expect(nonPassiveWheel).toBe(0);
  });

  test("scroll-linked motion runs on scroll timelines, not a rAF loop", async ({
    page,
  }) => {
    await gotoReady(page, "/");

    const supported = await page.evaluate(() =>
      CSS.supports("animation-timeline: scroll()"),
    );
    test.skip(!supported, "browser has no scroll-timeline support");

    const timelines = await page.evaluate(() =>
      document
        .getAnimations()
        .map((a) => a.timeline?.constructor.name)
        .filter((n): n is string => n !== undefined && n !== "DocumentTimeline"),
    );
    expect(timelines).toContain("ScrollTimeline");
    expect(timelines).toContain("ViewTimeline");
  });

  test("hero backdrop parallax tracks the scroll position", async ({ page }) => {
    await gotoReady(page, "/");
    const supported = await page.evaluate(() =>
      CSS.supports("animation-timeline: scroll()"),
    );
    test.skip(!supported, "browser has no scroll-timeline support");

    const shift = await page.evaluate(async () => {
      const el = document.querySelector(".scroll-parallax") as HTMLElement;
      const y = () => {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return m.m42;
      };
      window.scrollTo({ top: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 200));
      const start = y();
      window.scrollTo({ top: 600, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 200));
      return y() - start;
    });

    // 600 of a 900px range across a 150px travel.
    expect(shift).toBeGreaterThan(80);
    expect(shift).toBeLessThan(120);
  });

  test("anchor targets clear the fixed header", async ({ page }) => {
    await gotoReady(page, "/");
    await page
      .getByTestId("site-header")
      .getByRole("link", { name: "Services", exact: true })
      .click();
    await expect(page).toHaveURL(/#services$/);

    const top = await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 900));
      const el = document.getElementById("services");
      return el ? el.getBoundingClientRect().top : -1;
    });
    expect(top).toBeGreaterThanOrEqual(0);
  });
});
