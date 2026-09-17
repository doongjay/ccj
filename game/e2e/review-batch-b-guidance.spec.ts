import { REVIEW_EVIDENCE } from "./review-evidence";
import { expect, test } from "@playwright/test";
import { chooseStory, clickGame, fillProfile } from "./story-helpers";

for (const route of ["car", "subway"] as const) {
  test(route === "car" ? "F07: car guidance precedes choices and wrong attempts remain recognizable" : "Subway restored copy and choices: wrong exit returns, exit five reaches lobby", async ({ page }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", entry => { if (entry.type() === "error" || /(?:Texture|Frame|Animation).*(?:missing|not found|has no frame|does not exist)/i.test(entry.text())) errors.push(entry.text()); });
    page.on("requestfailed", request => errors.push(request.url()));
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page, 360, 1180);
    await fillProfile(page);
    await chooseStory(page, "신랑측");
    await chooseStory(page, route === "car" ? "자차로 간다" : "지하철을 탄다");
    await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", route === "car" ? "CarRouteScene" : "SubwayRouteScene");
    await page.locator(".story-narration").click();
    await page.waitForTimeout(400); // Capture after the normal scene arrival fade.
    const copy = page.locator(".story-copy");
    if (route === "car") {
      await expect(copy).toHaveText("양재IC랑 가깝군. 그런데 진입구에\n유도선이 많은데?");
      await expect(copy).not.toContainText("지하 3층(추천)");
    } else {
      await expect(copy).toHaveText("양재시민의숲역에서 내리라고 했지.\n근데 셔틀이 몇번 출구더라?");
    }
    await page.screenshot({ path: `${REVIEW_EVIDENCE}/regressions/f07-${route}-guidance-393.png` });
    const wrong = route === "car" ? "노란색" : "1번 출구";
    await page.getByRole("button", { name: wrong, exact: true }).click();
    await expect(page.locator("canvas")).toHaveAttribute("data-route-quiz-wrong-count", "1");
    await expect(copy).toHaveText(route === "car" ? "여긴 이마트 주차장이네.\n주차 정산이 안될테니 다른 유도선을 타야겠군." : "셔틀버스는\n5번 출구 앞 이었던것 같은데...");
    await page.screenshot({ path: `${REVIEW_EVIDENCE}/regressions/f07-${route}-wrong-copy-393.png` });
    await expect(page.getByRole("button", { name: wrong, exact: true })).toHaveAttribute("data-tried", "true", { timeout: 15000 });
    await expect(page.getByRole("button", { name: wrong, exact: true })).toBeDisabled();
    if (route === "subway") {
      await expect(page.getByRole("button", {name:wrong,exact:true})).toBeVisible();
      await expect(page.locator(".story-choice")).toHaveText(["1번 출구","2번 출구","3번 출구","4번 출구","5번 출구"]);
      await expect(page.locator(".story-choice[data-tried]")).toHaveCount(1);
    }
    await page.screenshot({ path: `${REVIEW_EVIDENCE}/regressions/f07-${route}-wrong-retry-393.png` });
    await page.getByRole("button", { name: route === "car" ? "파란색" : "5번 출구", exact: true }).click();
    await expect(page.locator("canvas")).toHaveAttribute("data-lobby-ready", "true", { timeout: 15000 });
    expect(errors).toEqual([]);
  });
}
