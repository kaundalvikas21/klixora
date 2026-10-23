import type { Page } from "@playwright/test";

/**
 * Navigate, then wait until the page is actually measurable.
 *
 * The home page's three CMS-driven sections sit behind Suspense boundaries,
 * so on a cold cache the shell flushes with skeletons and the real sections
 * are swapped in later in the same response. Everything has arrived by the
 * time `load` fires, but it was inserted mid-stream, so layout and
 * scroll-driven animations have not necessarily settled at that instant.
 *
 * Locator assertions retry and ride this out by themselves. A raw
 * `page.evaluate()` does not: it reads whatever the DOM holds right then,
 * which can be a skeleton, or a hero that has not had a frame yet.
 *
 * Waiting for a selector to be detached passes immediately when it never
 * matched, so this costs nothing on a warm cache or on a page with no
 * boundaries at all.
 */
export async function gotoReady(page: Page, url: string) {
  await page.goto(url);
  // waitForFunction, not a locator: a page can hold several skeletons at
  // once, and a locator matching more than one element is a strict-mode
  // violation rather than a wait.
  await page.waitForFunction(
    () => !document.querySelector('[aria-busy="true"]'),
    undefined,
    { timeout: 20_000 },
  );
  // One frame, so a just-inserted element has been through style and layout.
  await page.evaluate(() => new Promise(requestAnimationFrame));
}
