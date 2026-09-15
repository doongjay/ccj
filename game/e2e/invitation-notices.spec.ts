import { expect, test, type Page } from "@playwright/test";

async function openNotices(page: Page) {
  await page.goto("/#invitation");
  await expect(page.getByRole("tablist", { name: "안내사항 메뉴" })).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".invitation-notice-menu").evaluate(menu => {
    const invitation = document.querySelector(".invitation-page")!;
    invitation.scrollTop += menu.getBoundingClientRect().top - 110;
  });
  await expect(page.getByRole("tabpanel").locator("img")).toBeVisible();
  await expect.poll(() => page.getByRole("tabpanel").locator("img").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
}

for (const width of [320, 393]) {
  test(`notice menus show each venue's photo and original copy without page jumps at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 852 });
    await openNotices(page);
    const invitation = page.locator(".invitation-page");
    const menu = page.getByRole("tablist", { name: "안내사항 메뉴" });
    await expect(menu.getByRole("tab")).toHaveCount(5);
    const scrollTop = await invitation.evaluate(node => node.scrollTop);
    const height = await page.locator(".invitation-notice-content").evaluate(node => node.clientHeight);
    const notices = [
      ["웰컴 드링크", "일찍 도착하신 하객분들을 위해", "/assets/invitation/notice-welcome.jpg"],
      ["포토부스", "로비에 포토 부스를 준비했습니다.", "/assets/invitation/notice-photo-booth.jpg"],
      ["ATM", "은행 ATM(국민, 우리, 신한, SC제일은행)은", "/assets/invitation/notice-atm.jpg"],
      ["연회장", "예식 30분 전부터 이용 가능합니다.", "/assets/invitation/notice-banquet.jpg"],
      ["신부대기실", "1층 ATM을 지나면 잔디 길이 나옵니다.", "/assets/lacitta/photos/bridal-room.jpeg"],
    ];
    for (const [label, copy, file] of notices) {
      const tab = menu.getByRole("tab", { name: label, exact: true });
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      const panel = page.getByRole("tabpanel");
      await expect(panel).toHaveCount(1);
      await expect(panel).toContainText(copy);
      await expect(panel.locator("img")).toHaveAttribute("src", file);
      await expect.poll(() => panel.locator("img").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      expect(await invitation.evaluate(node => node.scrollTop)).toBeCloseTo(scrollTop, 0);
      expect(await page.locator(".invitation-notice-content").evaluate(node => node.clientHeight)).toBe(height);
      expect(await tab.evaluate(node => {
        const bounds = node.getBoundingClientRect(), strip = node.parentElement!.getBoundingClientRect();
        return bounds.left >= strip.left - 1 && bounds.right <= strip.right + 1 && bounds.height >= 44;
      })).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${width}-${file.split("/").at(-1)}.png`) });
    }
    expect(await invitation.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await expect(page.getByRole("button", { name: "다음 안내", exact: true })).toBeDisabled();
    await page.keyboard.press("Home");
    await expect(menu.getByRole("tab").first()).toBeFocused();
    await expect(page.getByRole("button", { name: "이전 안내", exact: true })).toBeDisabled();
    await page.keyboard.press("ArrowLeft");
    await expect(menu.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(menu.getByRole("tab").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(menu.getByRole("tab").last()).toBeFocused();
    await page.getByRole("button", { name: "이전 안내", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toHaveAccessibleName("연회장");
    await page.getByRole("button", { name: "다음 안내", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toHaveAccessibleName("신부대기실");
  });
}

test.describe("touch navigation", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 393, height: 852 } });
  test("swiping photos changes notices while vertical swipes still scroll the invitation", async ({ page }) => {
    await openNotices(page);
    const cdp = await page.context().newCDPSession(page);
    const swipe = async (x: number, y: number, dx: number, dy: number) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      for (let step = 1; step <= 6; step++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + dx * step / 6, y: y + dy * step / 6 }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    const image = await page.getByRole("tabpanel").locator("img").boundingBox();
    expect(image).not.toBeNull();
    const y = image!.y + image!.height / 2;
    await swipe(290, y, -170, 0);
    await expect(page.getByRole("tabpanel")).toHaveAccessibleName("포토부스");
    await swipe(100, y, 170, 0);
    await expect(page.getByRole("tabpanel")).toHaveAccessibleName("웰컴 드링크");
    const menu = page.getByRole("tablist", { name: "안내사항 메뉴" });
    const bounds = await menu.boundingBox();
    await swipe(290, bounds!.y + 22, -170, 0);
    await expect.poll(() => menu.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
    await expect(page.getByRole("tabpanel")).toHaveAccessibleName("웰컴 드링크");
    const invitation = page.locator(".invitation-page");
    const scrollTop = await invitation.evaluate(node => node.scrollTop);
    await swipe(180, y + 40, 0, -150);
    await expect.poll(() => invitation.evaluate(node => node.scrollTop)).toBeGreaterThan(scrollTop + 50);
    await expect(page.getByRole("tabpanel")).toHaveAccessibleName("웰컴 드링크");
    await cdp.detach();
  });
});
