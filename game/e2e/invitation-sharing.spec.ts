import { expect, test } from "@playwright/test";
const expectedDescription = "2026년 11월 21일 오후 2시\n라시따시어터";

test("share crawlers receive the wide pixel image in the original HTML", async ({ page, request, baseURL }, testInfo) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain(`property="og:image" content="${baseURL}/assets/invitation/share-pixel-wide-v4.png"`);
  expect(html).toContain('<title>JJ ♥︎ HS</title>');
  expect(html).toContain('property="og:title" content="현서와 재준, 현재의 시작"');
  expect(html).toContain('name="twitter:title" content="현서와 재준, 현재의 시작"');
  expect(html).toContain('property="og:image:width" content="1774"');
  expect(html).toContain('property="og:image:height" content="887"');
  await page.goto("/");
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    await expect(page.locator(selector)).toHaveAttribute("content", expectedDescription);
  }
  await page.goto("/share-preview.html");
  await page.locator("img").evaluateAll(nodes => Promise.all(nodes.map(node => (node as HTMLImageElement).decode())));
  const sizes = await page.locator("img").evaluateAll(nodes => nodes.map(node => ({ width: (node as HTMLImageElement).naturalWidth, height: (node as HTMLImageElement).naturalHeight })));
  expect(sizes[0].width).toBe(sizes[0].height);
  expect(sizes[1].width / sizes[1].height).toBe(2);
  await page.screenshot({ path: testInfo.outputPath("share-card-formats.png"), fullPage: true });
});

test("native sharing and the Kakao card use matching invitation URLs and the correct image shape", async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: async (data: ShareData) => sessionStorage.setItem("shared", JSON.stringify(data)) });
  });
  await page.goto("/?tracking=discard#invitation");
  await expect(page).toHaveTitle("JJ ♥︎ HS");
  await page.getByRole("button", { name: "카카오톡으로 전달", exact: true }).click();
  const native = await page.evaluate(() => JSON.parse(sessionStorage.getItem("shared")!));
  expect(native.url).toBe(`${baseURL}/#invitation`);
  expect(native.title).toBe("현서와 재준, 현재의 시작");
  expect(native.text).toBe("현서와 재준, 현재의 시작");
  const kakao = await page.evaluate(async () => {
    Object.assign(window, { Kakao: { init() {}, isInitialized: () => true, Share: { sendDefault: (value: unknown) => sessionStorage.setItem("kakao", JSON.stringify(value)) } } });
    const modulePath = "/src/ui/invitationShare.ts";
    const share = await import(modulePath);
    share.sendKakaoInvitation();
    return JSON.parse(sessionStorage.getItem("kakao")!);
  });
  expect(kakao.content.link.webUrl).toBe(native.url);
  expect(kakao.buttons[0].link.mobileWebUrl).toBe(native.url);
  expect(kakao.content.imageUrl).toMatch(/\/share-pixel-square-v4.png$/);
  expect(kakao.content.imageWidth).toBe(kakao.content.imageHeight);
  expect(kakao.content.title).toBe(native.title);
  expect(kakao.content.description).toBe(expectedDescription);
});

for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 430, height: 932 }]) test(`explicit link copy and Kakao paste fallback preserve the invitation URL at ${viewport.width}`, async ({ page, baseURL }, info) => {
  await page.setViewportSize(viewport);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (value: string) => sessionStorage.setItem("copied", value) } });
  });
  await page.goto("/?tracking=discard#invitation");
  await expect(page.getByRole("button", { name: "게임으로 초대받기" })).toHaveCount(0);
  await expect(page.locator(".invitation-nav button")).toHaveText(["예식 안내", "사진", "방명록"]);
  await expect(page.locator(".invitation-nav")).toHaveCSS("display", "flex");
  const heart = page.locator(".invitation-nav .monogram-heart");
  await expect(heart).toHaveAttribute("fill", "#e9a0a7");
  await expect(heart).toHaveAttribute("shape-rendering", "crispEdges");
  expect(await heart.locator("rect").count()).toBeGreaterThan(20);
  expect(await page.locator(".invitation-nav .invitation-monogram").textContent()).not.toContain("♥");
  for (const action of await page.locator(".invitation-nav button").all()) {
    const box = (await action.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(await action.evaluate(el => { const range = document.createRange(); range.selectNodeContents(el); return range.getClientRects().length; })).toBe(1);
  }
  await page.screenshot({ path: info.outputPath(`invitation-navigation-${viewport.width}.png`) });
  await page.locator(".invitation-nav").getByRole("button", { name: "사진", exact: true }).click();
  await page.locator(".invitation-gallery img").evaluateAll(async images => {
    await Promise.all(images.slice(0, 3).map(image => (image as HTMLImageElement).decode()));
  });
  await page.screenshot({ path: info.outputPath(`gallery-third-left-${viewport.width}.png`) });
  await page.getByRole("button", { name: "3번째 사진 크게 보기", exact: true }).click();
  await page.locator(".invitation-gallery-slide.is-current img").evaluate(image => (image as HTMLImageElement).decode());
  await page.screenshot({ path: info.outputPath(`gallery-third-original-${viewport.width}.png`) });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "링크 복사", exact: true }).click();
  expect(await page.evaluate(() => sessionStorage.getItem("copied"))).toBe(`${baseURL}/#invitation`);
  await expect(page.locator(".invitation-toast")).toHaveText("청첩장 링크를 복사했어요.");
  await page.getByRole("button", { name: "카카오톡으로 전달", exact: true }).click();
  expect(await page.evaluate(() => sessionStorage.getItem("copied"))).toBe(`현서와 재준, 현재의 시작\n${baseURL}/#invitation`);
  await expect(page.locator(".invitation-page")).toBeVisible();
  await expect(page.locator(".invitation-toast")).toBeHidden({ timeout: 5000 });
  for (const action of await page.locator(".invitation-footer .invitation-actions button").all()) {
    const box = (await action.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  }
  await page.screenshot({ path: info.outputPath(`share-actions-${viewport.width}.png`) });
  expect(errors).toEqual([]);
});

test("Kakao button uses an initialized SDK and clipboard denial retains selectable text", async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    Object.assign(window, { Kakao: { init() {}, isInitialized: () => true, Share: { sendDefault: (value: unknown) => sessionStorage.setItem("kakao", JSON.stringify(value)) } } });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { throw new DOMException("Denied", "NotAllowedError"); } } });
  });
  await page.goto("/#invitation");
  await page.getByRole("button", { name: "카카오톡으로 전달", exact: true }).click();
  const payload = await page.evaluate(() => JSON.parse(sessionStorage.getItem("kakao")!));
  expect(payload.content.title).toBe("현서와 재준, 현재의 시작");
  expect(payload.content.link.mobileWebUrl).toBe(`${baseURL}/#invitation`);
  await page.getByRole("button", { name: "링크 복사", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("textarea")).toHaveValue(`${baseURL}/#invitation`);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
