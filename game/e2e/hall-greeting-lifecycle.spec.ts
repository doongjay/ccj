import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { installPlayerObservation } from "./corridor-observables";
import { startPreparedScene } from "./stage-fixtures";
import { chooseStory, fillProfile } from "./story-helpers";

test("guest greetings pause with the invitation, respect live reduced motion, and clear on photo/exit", async ({ page }, info) => {
  test.setTimeout(45000);
  await page.setViewportSize({ width: 393, height: 852 });
  await installPlayerObservation(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", entry => { if (entry.type() === "error") errors.push(entry.text()); });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await startPreparedScene(page, "HomeSelectScene");
  await fillProfile(page);
  await chooseStory(page, "신랑측");
  const group = async () => {
    await startPreparedScene(page, "VenueHallScene");
    await chooseStory(page, "환호를 한다");
    await expect(page.locator("canvas")).toHaveAttribute("data-ceremony-stage", "group-photo");
  };
  const greetings = () => page.evaluate(() => {
    const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueHallScene");
    return scene.children.list.filter(child => child.getData("groupGreeting")).map(child => (child as Phaser.GameObjects.Text).text);
  });
  await group();
  await page.getByRole("button", { name: "청첩장", exact: true }).click();
  const paused = await greetings();
  expect(paused).toHaveLength(1);
  await page.waitForTimeout(1900);
  expect(await greetings()).toEqual(paused);
  await page.keyboard.press("Escape");
  await expect.poll(greetings).not.toEqual(paused);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced = await greetings();
  expect(reduced).toHaveLength(1);
  await page.waitForTimeout(1900);
  expect(await greetings()).toEqual(reduced);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(greetings).not.toEqual(reduced);
  await chooseStory(page, "사진 찍기");
  expect(await greetings()).toEqual([]);
  await page.waitForTimeout(1900);
  expect(await greetings()).toEqual([]);
  await startPreparedScene(page, "VenueLobbyScene");
  await group();
  expect(await greetings()).toHaveLength(1);
  // Leaving while the cycle is still active must also remove its timer and graphics.
  await startPreparedScene(page, "VenueLobbyScene");
  await page.waitForTimeout(1900);
  expect(await greetings()).toEqual([]);
  await group();
  expect(await greetings()).toHaveLength(1);
  expect(errors).toEqual([]);
  await info.attach("lifecycle-observations", { body: JSON.stringify({ paused, reduced, restartCount: 2, errors }), contentType: "application/json" });
});
