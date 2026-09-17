import { expect, test, type Page } from "@playwright/test";
import type Phaser from "phaser";
import { mkdir, writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";
import { chooseStory, clickGame, receiveEnvelope } from "./story-helpers";

const phase = process.env.MINIMI_PHASE ?? "after";
const evidence = `${process.env.MINIMI_EVIDENCE ?? "../docs/game-review/touch-face-refinement"}/${phase}`;
async function png(name: string, data: string) { await writeFile(`${evidence}/${name}.png`, Buffer.from(data.split(",")[1]!, "base64")); }
async function centered(page: Page) {
  const panel = (await page.locator(".story-info .story-narration").boundingBox())!;
  const canvas = (await page.locator("#app canvas").boundingBox())!;
  expect(Math.abs(panel.y + panel.height / 2 - canvas.y - canvas.height / 2)).toBeLessThanOrEqual(2);
  expect(panel.y).toBeGreaterThanOrEqual(canvas.y);
  expect(panel.y + panel.height).toBeLessThanOrEqual(canvas.y + canvas.height);
}
async function avatarClearOfSigns(page: Page, facility: string, width: number) {
  const result = await page.evaluate(() => {
    const scene = (window.__venueQaGame as Phaser.Game).scene.getScene("VenueLobbyScene");
    const player = scene.children.list.find(child => "isMoving" in child) as Phaser.GameObjects.Container & { isMoving(): boolean };
    const avatar = (player.list[0] as Phaser.GameObjects.Sprite).getBounds();
    const signs = scene.children.list.filter(child => child.name.startsWith("lobby-sign-"))
      .map(child => ({ name: child.name, bounds: (child as Phaser.GameObjects.Rectangle).getBounds() }));
    return { player: { x: player.x, y: player.y }, avatar, signs };
  });
  for (const sign of result.signs) {
    const a = result.avatar, b = sign.bounds;
    const overlap = Math.max(0, Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))
      * Math.max(0, Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
    expect(overlap, `${facility}: ${sign.name} covers the returned avatar`).toBe(0);
  }
  await writeFile(`${evidence}/return-clearance-${facility}-${width}.json`, JSON.stringify(result, null, 2));
}
test.use({ hasTouch: true });
test.beforeEach(async ({ page }) => { await mkdir(evidence, { recursive: true }); await installPlayerObservation(page); });

test("Gender-specific face thumbnails survive female-male-female selection", async ({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","IntroScene");
  await clickGame(page,360,1180);
  const faces: Record<string,string[]> = {};
  for(const [key, label] of [["female","여자"],["male","남자"],["female-again","여자"]]) {
    await page.getByRole("button",{name:label,exact:true}).click();
    await expect(page.locator(".minimi-picker")).toHaveAttribute("data-gender",key!.startsWith("female")?"female":"male");
    faces[key!] = await page.locator(".face-card canvas").evaluateAll(nodes=>nodes.map(n=>(n as HTMLCanvasElement).toDataURL()));
  }
  expect(faces["female-again"]).toEqual(faces.female);
  expect(faces.female![0]).not.toBe(faces.male![0]);
  expect(faces.female![1]).not.toBe(faces.male![1]);
  expect(faces.female![2]).toBe(faces.male![2]);
  await writeFile(`${evidence}/gender-face-cache.json`,JSON.stringify({distinctFirstTwo:true,thirdPreserved:true,femaleMaleFemaleStable:true},null,2));
});

for (const [width, height] of [[320,568],[393,852],[430,932]]) test(`Station reference and centered tap-only lobby at ${width}`, async ({page}) => {
  test.setTimeout(75000);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", e => { if(e.type() === "error") errors.push(e.text()); });
  await page.setViewportSize({width: width!, height: height!});
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
  await clickGame(page,360,1180);
  await page.getByRole("textbox",{name:"내 이름은",exact:true}).fill("동동");
  for(const gender of ["male","female"] as const) {
    await page.getByRole("button",{name:gender === "male" ? "남자" : "여자",exact:true}).tap();
    await page.locator('.face-card[data-index="1"]').tap();
    if(gender === "female") { await page.getByRole("button",{name:"다음 의상 보기",exact:true}).tap(); await page.locator('.outfit-card[data-index="5"]').tap(); }
    await page.screenshot({path:`${evidence}/${gender}-face2-setup-${width}.png`});
    for(const [id, selector] of [["preview",".minimi-preview"],["face2-thumbnail",'.face-card[data-index="1"] canvas']]) {
      await png(`${gender}-${id}-${width}`, await page.locator(selector!).evaluate(c => (c as HTMLCanvasElement).toDataURL()));
    }
    if(gender === "female") {
      await page.locator('.face-card[data-index="0"]').tap();
      await page.screenshot({path:`${evidence}/female-face1-setup-${width}.png`});
      await png(`female-face1-preview-${width}`,await page.locator(".minimi-preview").evaluate(c=>(c as HTMLCanvasElement).toDataURL()));
      await png(`female-face1-thumbnail-${width}`,await page.locator('.face-card[data-index="0"] canvas').evaluate(c=>(c as HTMLCanvasElement).toDataURL()));
      await page.locator('.face-card[data-index="1"]').tap();
    }
  }
  if(width === 393) {
    const frames = await page.evaluate(async () => {
      const path="/src/ui/minimi.ts";
      const {drawMinimi}=await import(path) as typeof import("../src/ui/minimi");
      const scene=(window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");
      return ["down","left","right","up","posing","clapping"].map(pose=>{
        const c=document.createElement("canvas"); drawMinimi(scene,c,{gender:"female",face:1,hair:0,outfit:5},pose);
        return {pose,data:c.toDataURL()};
      });
    });
    for(const frame of frames) await png(`female-sixth-${frame.pose}`,frame.data);
  }
  await page.getByRole("button",{name:"시작하기",exact:true}).tap();
  await chooseStory(page,"신랑측");await chooseStory(page,"지하철을 탄다");
  await page.locator(".story-narration").tap();
  await expect(page.getByRole("button",{name:"5번 출구",exact:true})).toBeEnabled();
  await page.screenshot({path:`${evidence}/station-${width}.png`});
  const station = await page.locator(".story-choice").evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,box:n.getBoundingClientRect().toJSON(),font:getComputedStyle(n).fontSize})));
  if(phase === "after") {
    expect(station).toHaveLength(5);
    for(const item of station) { expect(item.box.y).toBe(station[0]!.box.y); expect(item.box.height).toBeGreaterThan(item.box.width); expect(item.box.width).toBeGreaterThanOrEqual(44); }
  }
  await page.getByRole("button",{name:"1번 출구",exact:true}).tap();
  await expect(page.locator(".story-copy")).toHaveText("셔틀버스는\n5번 출구 앞 이었던것 같은데...");
  await expect(page.getByRole("button",{name:"5번 출구",exact:true})).toBeEnabled({timeout:15000});
  await page.getByRole("button",{name:"5번 출구",exact:true}).tap();
  const canvas = page.locator("#app canvas");
  await expect(canvas).toHaveAttribute("data-lobby-info","arrival-guide",{timeout:20000});
  await page.screenshot({path:`${evidence}/lobby-arrival-${width}.png`});
  if(phase === "after") {
    await expect(page.locator(".story-copy")).toHaveText("도착! 로비가 넓군.\n어디부터 갈까?");
    await centered(page);
    await expect(page.locator(".story-info-tutorial")).toHaveCSS("background-color","rgba(0, 0, 0, 0.45)");
  }
  const before=await page.evaluate(()=>window.__venuePlayerSnapshot());
  await clickGame(page,130,590);
  await expect(page.locator(".story-info-tutorial")).toHaveCount(0);
  await page.waitForTimeout(250);
  expect(await page.evaluate(()=>window.__venuePlayerSnapshot())).toMatchObject({x:before!.x,y:before!.y,moving:false});
  await expect(canvas).toHaveAttribute("data-active-scene","VenueLobbyScene");
  for(const [index, item] of [{x:667,y:560,id:"atm"},{x:590,y:870,id:"drink"},{x:590,y:990,id:"restriction"}].entries()) {
    await clickGame(page,item.x,item.y);
    const panel=page.locator(".story-info-compact .story-narration");
    await expect(panel).toBeVisible();
    await page.screenshot({path:`${evidence}/lobby-${item.id}-${width}.png`});
    if(phase === "after") {
      await centered(page); await expect(page.locator(".info-actions")).toHaveCount(0);
      await expect(panel).toBeFocused();
      const position=await page.evaluate(()=>window.__venuePlayerSnapshot());
      if(index === 0) await page.keyboard.press("Escape");
      else if(index === 1) await clickGame(page,130,590);
      else { await page.keyboard.press("Tab");await page.keyboard.press("Shift+Tab");await expect(panel).toHaveCSS("outline-style","solid");await page.keyboard.press("Space"); }
      await expect(panel).toHaveCount(0);
      await page.waitForTimeout(250);
      const returned = index === 0 ? {x:470,y:590} : index === 1 ? {x:456,y:970} : {x:position!.x,y:position!.y};
      expect(await page.evaluate(()=>window.__venuePlayerSnapshot())).toMatchObject({...returned,moving:false});
      await expect(canvas).toHaveAttribute("data-active-scene","VenueLobbyScene");
      await avatarClearOfSigns(page, item.id, width!);
      await page.screenshot({path:`${evidence}/returned-${item.id}-${width}.png`});
    } else await page.keyboard.press("Escape");
  }
  await clickGame(page,128,60);
  await expect(page.locator(".story-info-notebook")).toBeVisible();
  await expect(page.locator(".story-copy")).toContainText("포토부스에서 사진 찍기");
  if(phase === "after") await centered(page);
  await page.screenshot({path:`${evidence}/notebook-${width}.png`});await page.keyboard.press("Escape");
  const hallStart = await page.evaluate(()=>window.__venuePlayerSnapshot());
  await clickGame(page,590,150);
  await expect(page.locator(".story-info-reminder")).toBeVisible();
  if (phase === "after") expect(await page.evaluate(()=>window.__venuePlayerSnapshot())).toMatchObject({x:hallStart!.x,y:hallStart!.y,moving:false});
  if(phase === "after") await centered(page);
  await page.screenshot({path:`${evidence}/hall-reminder-${width}.png`});
  await expect(page.locator(".hall-requirements .story-choice")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await clickGame(page,128,60);
  await expect(page.locator(".story-info-notebook")).toBeVisible();await page.keyboard.press("Escape");
  if(phase === "after") {
    // Sample actual Player movement throughout facility input and scene entry.
    await page.evaluate(()=>{
      const audit = {walking:0};(window as unknown as {facilityAudit: typeof audit}).facilityAudit = audit;
      (window.__venueQaGame as Phaser.Game).events.on("poststep",()=>{
        const player=window.__venuePlayerSnapshot();if(player?.scene === "VenueLobbyScene" && player.moving) audit.walking++;
      });
    });
    await clickGame(page,550,450);
    await expect(canvas).toHaveAttribute("data-photo-gallery-open","true",{timeout:1000});
    await page.keyboard.press("Escape");
    expect(await page.evaluate(()=>window.__venuePlayerSnapshot())).toMatchObject({x:474,y:360,moving:false});
    await page.waitForTimeout(300);await expect(canvas).toHaveAttribute("data-photo-gallery-open","false");
    await avatarClearOfSigns(page, "photo-table", width!);
    await page.screenshot({path:`${evidence}/returned-photo-table-${width}.png`});
    await clickGame(page,130,590);
    await expect(canvas).toHaveAttribute("data-active-scene","PhotoBoothScene",{timeout:2000});
    await expect(canvas).toHaveAttribute("data-room-ready","true");
    await clickGame(page,360,1180);
    await expect(canvas).toHaveAttribute("data-active-scene","VenueLobbyScene");
    await expect(canvas).toHaveAttribute("data-lobby-ready","true");
    expect(await page.evaluate(()=>window.__venuePlayerSnapshot())).toMatchObject({x:236,y:610,moving:false});
    await avatarClearOfSigns(page, "photo-booth", width!);
    await page.screenshot({path:`${evidence}/returned-booth-${width}.png`});
    await clickGame(page,360,420);
    await expect(canvas).toHaveAttribute("data-active-scene","ReceptionScene",{timeout:2000});
    await receiveEnvelope(page);
    expect(await page.evaluate(()=>window.__venuePlayerSnapshot())).toMatchObject({x:474,y:360,moving:false});
    await avatarClearOfSigns(page, "reception", width!);
    await page.screenshot({path:`${evidence}/returned-reception-${width}.png`});
    expect(await page.evaluate(()=>(window as unknown as {facilityAudit:{walking:number}}).facilityAudit.walking)).toBe(0);
    // Normal floor taps still walk after the immediate facilities.
    await clickGame(page,230,1000);
    await expect.poll(async()=>Boolean((await page.evaluate(()=>window.__venuePlayerSnapshot()))?.moving)).toBe(true);
  }
  expect(errors).toEqual([]);
  await writeFile(`${evidence}/checks-${width}.json`,JSON.stringify({phase,viewport:{width,height},station,errors},null,2));
});
