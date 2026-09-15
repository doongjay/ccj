import { expect, test } from "@playwright/test";

for (const width of [320, 393]) {
  test(`family names align and the original-photo countdown ticks at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 852 });
    await page.clock.setFixedTime(new Date("2026-11-20T14:00:00+09:00"));
    await page.goto("/#invitation");
    const family = page.locator(".invitation-family");
    await family.scrollIntoViewIfNeeded();
    await expect(family).not.toContainText("故");
    await expect(family.locator("img")).toHaveAttribute("src", /chrysanthemum.png$/);
    const rows = await family.locator(".invitation-family-row").evaluateAll(elements => elements.map(row => {
      const spans = [...row.children].map(node => node.getBoundingClientRect());
      const flower = row.querySelector("img")?.getBoundingClientRect();
      return { tops: spans.map(rect => rect.top), lefts: spans.map(rect => rect.left), heights: spans.map(rect => rect.height), flower: flower ? { right: flower.right, left: flower.left } : null };
    }));
    for (const row of rows) {
      expect(new Set(row.tops).size).toBe(1);
      expect(new Set(row.heights).size).toBe(1);
    }
    expect(rows[0]!.lefts).toEqual(rows[1]!.lefts);
    expect(rows[1]!.flower!.right).toBeLessThan(rows[1]!.lefts[0]!);
    expect(rows[1]!.flower!.left).toBeGreaterThan(0);
    await page.screenshot({ path: testInfo.outputPath("family-chrysanthemum.png") });
    const countdown = page.locator(".invitation-countdown");
    await countdown.scrollIntoViewIfNeeded();
    await expect(countdown).toHaveClass(/is-visible/);
    await expect(countdown.locator("img")).toHaveAttribute("src", /timer.jpg$/);
    await expect(countdown.locator("[data-unit=days]")).toHaveText("01");
    await expect(countdown.locator("[data-unit=seconds]")).toHaveText("00");
    await page.clock.setFixedTime(new Date("2026-11-20T14:00:02+09:00"));
    await expect(countdown.locator("[data-unit=days]")).toHaveText("00");
    await expect(countdown.locator("[data-unit=hours]")).toHaveText("23");
    await expect(countdown.locator("[data-unit=minutes]")).toHaveText("59");
    await expect(countdown.locator("[data-unit=seconds]")).toHaveText("58");
    await expect(countdown.locator(".invitation-countdown-number").first()).toHaveCSS("font-family", /Galmuri11/);
    await page.screenshot({ path: testInfo.outputPath("original-photo-countdown.png") });
    await page.clock.setFixedTime(new Date("2026-11-21T14:00:01+09:00"));
    await expect(countdown.locator(".invitation-countdown-heading")).toHaveText("오늘, 재준 ♥ 현서 결혼합니다");
    await expect(countdown.locator("[data-unit=seconds]")).toHaveText("00");
    await page.clock.setFixedTime(new Date("2026-11-22T00:00:00+09:00"));
    await expect(countdown.locator(".invitation-countdown-heading")).toHaveText("함께해 주셔서 감사합니다");
    expect(await page.locator(".invitation-paper").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".invitation-page .wedding-heart").first()).toHaveCSS("animation-name", "none");
    await expect(page.locator(".invitation-page .wedding-ambience")).toHaveCSS("pointer-events", "none");
  });
}
