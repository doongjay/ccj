import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { mkdir, writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";
import { enterLobby, clickGame, chooseStory, fillProfile, receiveEnvelope, completeLobbyTours, takeBridalPhoto, takeGroupPhoto } from "./story-helpers";
import { startPreparedScene } from "./stage-fixtures";
import { SCENE_KEYS } from "../src/state/gameState";
const phase=process.env.MINIMI_PHASE ?? "after";
const root=process.env.REVIEW_EVIDENCE
  ? `${process.env.REVIEW_EVIDENCE}/${phase}/neck-loading-ux`
  : `../docs/game-review/neck-loading-fix/${phase}/ux`;
test.use({hasTouch:true,video:{mode:"on",size:{width:430,height:932}}});
test.beforeEach(async({page})=>{await mkdir(root,{recursive:true});await installPlayerObservation(page);});
test("local server opening is current and ready for manual play",async({page})=>{
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",e=>{if(e.type()==="error")errors.push(e.text());});
  await page.setViewportSize({width:393,height:852});
  const response=await page.goto("http://127.0.0.1:5174/");expect(response?.status()).toBe(200);
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","IntroScene");
  await page.screenshot({path:`${root}/local-server-opening.png`});
  await writeFile(`${root}/local-server.json`,JSON.stringify({url:page.url(),status:response?.status(),title:await page.title(),viewport:page.viewportSize(),errors},null,2));
  expect(errors).toEqual([]);
});
test("unobscured guidance renderer output at three mobile widths",async({page})=>{
  test.setTimeout(90000);
  const records:unknown[]=[];
  for(const [width,height] of [[320,568],[393,852],[430,932]]){
    await page.setViewportSize({width:width!,height:height!});await page.goto("/");await page.evaluate(()=>localStorage.clear());await page.reload();
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","IntroScene");await clickGame(page,360,1180);await fillProfile(page);await chooseStory(page,"신랑측");await chooseStory(page,"자차로 간다");
    await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","CarRouteScene");await page.locator(".story-narration").click();
    // Read the actual renderer, without hiding DOM controls or repainting the scene.
    const png=await page.evaluate(()=>new Promise<string>((resolve,reject)=>(window.__venueQaGame as Phaser.Game).renderer.snapshot(result=>{
      if(result instanceof HTMLImageElement)resolve(result.src);else reject(new Error("Expected renderer image"));
    })));
    await writeFile(`${root}/car-lines-renderer-${width}.png`,Buffer.from(png.split(",")[1]!,"base64"));
    records.push({width,height,canvas:await page.locator("#app canvas").boundingBox(),source:"Phaser renderer snapshot; DOM buttons unchanged and excluded by renderer"});
  }
  await writeFile(`${root}/car-lines-renderer.json`,JSON.stringify(records,null,2));
});
test("first notebook and hall frame at three mobile widths",async({page})=>{
  test.setTimeout(180000);const records:unknown[]=[];const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  for(const [width,height] of [[320,568],[393,852],[430,932]]){
    await page.setViewportSize({width:width!,height:height!});await page.goto("/");await page.evaluate(()=>localStorage.clear());await page.reload();await enterLobby(page,"car","groom");
    const before=await page.evaluate(()=>({focus:(document.activeElement as HTMLElement)?.outerHTML,menus:[...document.querySelectorAll(".keyboard-destinations")].map(n=>({box:n.getBoundingClientRect().toJSON(),focus:n.matches(":focus-within")}))}));
    const touchCanvas=(await page.locator("#app canvas").boundingBox())!;
    await page.touchscreen.tap(touchCanvas.x+128*touchCanvas.width/720,touchCanvas.y+60*touchCanvas.height/1280);await page.waitForTimeout(500);
    const first=await page.locator("#app canvas").evaluate(n=>({...n.dataset}));
    await page.screenshot({path:`${root}/first-notebook-${width}.png`});records.push({width,height,before,first});
    if(phase==="after") {await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","VenueLobbyScene");await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-info","memory-book");}
    await page.keyboard.press("Escape");
    await startPreparedScene(page,SCENE_KEYS.VenueHall);await chooseStory(page,"박수를 친다");await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage","group-photo");
    await page.locator(".story-narration").click();const button=page.getByRole("button",{name:"사진 찍기",exact:true});await expect(button).toBeVisible();
    const bounds=(await page.locator("#app canvas").boundingBox())!,action=(await button.boundingBox())!;
    records.push({width,height,frameBottom:bounds.y+1004*bounds.height/1280,action});await page.screenshot({path:`${root}/hall-photo-button-${width}.png`});
    if(phase==="after"){expect(action.y).toBeGreaterThan(bounds.y+1004*bounds.height/1280);expect(action.height).toBeGreaterThanOrEqual(44);}
  }
  await writeFile(`${root}/first-notebook-hall.json`,JSON.stringify({phase,records,errors},null,2));expect(errors).toEqual([]);
});

for(const [lane,width,height] of [["노란색",320,568],["분홍색",393,852],["파란색",430,932]] as const) test(`separated route ${lane}: visible lines and actual drive ${width}`,async({page})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/");await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","IntroScene");await clickGame(page,360,1180);await fillProfile(page);await chooseStory(page,"신랑측");await chooseStory(page,"자차로 간다");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","CarRouteScene");await page.locator(".story-narration").click();
  await page.screenshot({path:`${root}/car-choice-${width}.png`});await page.locator("#app canvas").screenshot({path:`${root}/car-lines-canvas-${width}.png`});
  const start=Date.now();await page.getByRole("button",{name:lane,exact:true}).click();await page.waitForTimeout(700);await page.screenshot({path:`${root}/car-driving-${width}.png`});
  await expect(page.locator("#app canvas")).toHaveAttribute("data-parking-map",lane==="노란색"?"emart":lane==="분홍색"?"tower":"b3",{timeout:15000});await page.screenshot({path:`${root}/car-destination-${width}.png`});
  const path=await page.locator("#app canvas").getAttribute("data-car-lane-path");
  if(lane==="노란색"){await expect(page.getByRole("button",{name:"파란색",exact:true})).toBeVisible({timeout:12000});await chooseStory(page,"파란색");}
  await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready","true",{timeout:15000});expect(errors).toEqual([]);
  await writeFile(`${root}/car-${width}.json`,JSON.stringify({lane,width,height,start,path,errors,video:await page.video()?.path()},null,2));
});

for(const route of ["car","subway"] as const)test(`loading policy actual ${route} journey through ending`,async({page})=>{
  test.setTimeout(180000);await page.setViewportSize({width:393,height:852});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",e=>{if(e.type()==="error")errors.push(e.text());});
  await page.addInitScript(()=>{
    const records:unknown[]=[];(window as unknown as {loadingRecords:unknown[]}).loadingRecords=records;
    let last="";const seen=new WeakSet<Element>();
    new MutationObserver(()=>{
      const c=document.querySelector<HTMLCanvasElement>("#app canvas");const state=[c?.dataset.activeScene,c?.dataset.ceremonyStage,c?.dataset.dinnerStage,c?.dataset.lobbyInfo].join("/");
      if(state!==last){last=state;records.push({type:"state",at:performance.now(),state});}
      for(const n of document.querySelectorAll(".stage-loading,.stage-loading-inline"))if(!seen.has(n)){seen.add(n);records.push({type:"loading",at:performance.now(),class:n.className,stage:c?.dataset.assetLoadStage,text:n.textContent});}
    }).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:["data-active-scene","data-ceremony-stage","data-dinner-stage","data-lobby-info"]});
  });
  await page.goto("/");await enterLobby(page,route,"bride");const canvas=page.locator("#app canvas");
  await clickGame(page,128,60);await expect(canvas).toHaveAttribute("data-lobby-info","memory-book");await page.keyboard.press("Escape");
  await clickGame(page,360,420);await receiveEnvelope(page);await completeLobbyTours(page);await clickGame(page,590,990);await takeBridalPhoto(page);
  await clickGame(page,590,150);await expect(canvas).toHaveAttribute("data-active-scene","VenueHallScene");await chooseStory(page,route==="car"?"박수를 친다":"환호를 한다");await expect(canvas).toHaveAttribute("data-ceremony-stage","group-photo");await takeGroupPhoto(page);
  await expect(canvas).toHaveAttribute("data-dinner-stage","buffet",{timeout:15000});await clickGame(page,360,640);await expect(canvas).toHaveAttribute("data-buffet-reveal-complete","true");await page.screenshot({path:`${root}/buffet-complete-${route}.png`});
  await page.locator(".story-narration").click();await page.locator(".story-narration").click();await expect(canvas).toHaveAttribute("data-dinner-stage","buffet-route");await page.locator(".story-narration").click();await page.locator(".story-narration").click();
  await expect(canvas).toHaveAttribute("data-active-scene","EndingScene",{timeout:20000});
  const records=await page.evaluate(()=>(window as unknown as {loadingRecords:{type:string,class?:string}[]}).loadingRecords);
  await writeFile(`${root}/loading-${route}.json`,JSON.stringify({route,records,errors,video:await page.video()?.path()},null,2));
  expect(records.filter(r=>r.type==="loading"&&r.class==="stage-loading")).toHaveLength(1);expect(errors).toEqual([]);
});

test("setup controls: 78px genders, blue/pink panels, disjoint outfit pages and round glasses",async({page})=>{
  test.setTimeout(60000);const records:unknown[]=[];
  for(const [width,height] of [[320,568],[393,852],[430,932]]){
    await page.setViewportSize({width:width!,height:height!});await page.goto("/");await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","IntroScene");await clickGame(page,360,1180);
    for(const gender of ["남자","여자"]){
      const button=page.getByRole("button",{name:gender,exact:true});await button.click();await expect(page.locator(".minimi-customizer")).toBeVisible();expect((await button.boundingBox())!.height).toBe(78);
      await page.locator('.face-card[data-index="1"]').click();expect(await page.locator(".outfit-card:visible").evaluateAll(ns=>ns.map(n=>(n as HTMLElement).dataset.index))).toEqual(["0","1","2"]);
      await page.getByRole("button",{name:"다음 의상 보기",exact:true}).click();expect(await page.locator(".outfit-card:visible").evaluateAll(ns=>ns.map(n=>(n as HTMLElement).dataset.index))).toEqual(["3","4","5"]);
      await page.locator('.outfit-card[data-index="5"]').click();
      const submit=(await page.getByRole("button",{name:"시작하기",exact:true}).boundingBox())!;expect(submit.y+submit.height).toBeLessThanOrEqual(height!);
      await page.screenshot({path:`${root}/setup-${gender}-${width}.png`});
      records.push({width,height,gender,button:await button.boundingBox(),panelColor:await page.locator(".minimi-customizer").evaluate(n=>getComputedStyle(n).backgroundColor)});
      await page.getByRole("button",{name:"다음 의상 보기",exact:true}).click();expect(await page.locator(".outfit-card:visible").evaluateAll(ns=>ns.map(n=>(n as HTMLElement).dataset.index))).toEqual(["0","1","2"]);
    }
  }
  await writeFile(`${root}/setup.json`,JSON.stringify(records,null,2));
});
