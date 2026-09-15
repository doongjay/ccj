import { expect, test } from "@playwright/test";
import type Phaser from "phaser";
import { mkdir, writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";
import { clickGame } from "./story-helpers";

const phase = process.env.MINIMI_PHASE ?? "after";
const evidence = `${process.env.MINIMI_EVIDENCE ?? "../docs/game-review/minimi-fix"}/${phase}`;
const profiles = [
  { id: "01-face3-hair3-blue-shirt", gender: "male", face: 2, hair: 2, outfit: 0 },
  { id: "02-face3-hair1-blue-shirt", gender: "male", face: 2, hair: 0, outfit: 0 },
  { id: "03-face2-glasses-hair1-ivory-top", gender: "male", face: 1, hair: 0, outfit: 2 },
] as const;
async function png(path: string, data: string) { await writeFile(path, Buffer.from(data.split(",")[1]!, "base64")); }
test.beforeEach(async ({ page }) => installPlayerObservation(page));

test("M01-M05 actual customizer: three user profiles at four viewports and A-B-A equality", async ({ page, browser }) => {
  test.setTimeout(120000); await mkdir(evidence, { recursive: true });
  const observations: unknown[] = [], errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message)); page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
  for (const [width, height] of [[320,568],[393,852],[430,932],[1440,900]]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/"); await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene", "IntroScene");
    await clickGame(page,360,1180); await page.getByRole("textbox", { name: "내 이름은", exact: true }).fill("동동");
    await page.getByRole("button", { name: "남자", exact: true }).click(); await expect(page.locator(".minimi-preview")).toBeVisible();
    for (const profile of profiles) {
      await page.locator(`.face-card[data-index="${profile.face}"]`).click();
      await page.locator(`.hair-card[data-index="${profile.hair}"]`).click();
      await page.locator(`.outfit-card[data-index="${profile.outfit}"]`).click();
      // Mouse leaves the selected card, identical open-eye/reduced state in BEFORE and AFTER.
      await page.mouse.move(1,1); await page.waitForTimeout(50);
      const name = `${profile.id}-${width}x${height}`;
      await page.screenshot({ path: `${evidence}/${name}.png` });
      await page.locator(".minimi-preview").screenshot({ path: `${evidence}/${name}-display.png` });
      const capture = await page.locator(".minimi-preview").evaluate(node => {
        const c=node as HTMLCanvasElement, region=document.createElement("canvas");region.width=256;region.height=244;
        const ctx=region.getContext("2d")!;ctx.imageSmoothingEnabled=false;ctx.drawImage(c,32,40,64,61,0,0,256,244);
        return { native:c.toDataURL(), neck4x:region.toDataURL(), box:c.getBoundingClientRect().toJSON(), dpr:devicePixelRatio };
      });
      await png(`${evidence}/${name}-native.png`,capture.native);await png(`${evidence}/${name}-face-neck-4x.png`,capture.neck4x);
      const before=capture.native;
      await page.locator(`.face-card[data-index="${(profile.face+1)%3}"]`).click();await page.locator(`.hair-card[data-index="${(profile.hair+1)%3}"]`).click();await page.locator(`.outfit-card[data-index="${(profile.outfit+1)%3}"]`).click();
      await page.locator(`.face-card[data-index="${profile.face}"]`).click();await page.locator(`.hair-card[data-index="${profile.hair}"]`).click();await page.locator(`.outfit-card[data-index="${profile.outfit}"]`).click();
      expect(await page.locator(".minimi-preview").evaluate(c=>(c as HTMLCanvasElement).toDataURL())).toBe(before);
      // Same production rendering function and actual UI preview must yield identical pixels.
      const same=await page.evaluate(async profile=>{
        const path="/src/ui/minimi.ts";const {drawMinimi}=await import(path) as typeof import("../src/ui/minimi");
        const c=document.createElement("canvas");drawMinimi((window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene"),c,profile);
        return c.toDataURL()===(document.querySelector(".minimi-preview") as HTMLCanvasElement).toDataURL();
      },profile); expect(same).toBe(true);
      observations.push({profile,viewport:{width,height},browser:browser.version(),dpr:capture.dpr,previewCSS:capture.box,phase,openEyes:true,ABAidentical:true,harnessMatchesActualPreview:same});
    }
    await page.locator('.face-card[data-index="0"] canvas').screenshot({ path:`${evidence}/first-face-thumbnail-${width}.png` });
  }
  expect(errors).toEqual([]); await writeFile(`${evidence}/actual-ui.json`,JSON.stringify({observations,errors},null,2));
});

test("M01-M05 source layers and exhaustive native idle registry", async ({page})=>{
  test.setTimeout(120000);await mkdir(`${evidence}/atlas`,{recursive:true});await page.goto("/");await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","IntroScene");
  const audit=await page.evaluate(async()=>{
    const minimiPath="/src/ui/minimi.ts",partsPath="/src/ui/minimiParts.ts",artPath="/src/ui/minimiArt.ts",classicPath="/src/ui/classicMinimi.ts",loaderPath="/src/systems/stageAssets.ts",outfitPath="/src/data/guestOutfits.ts";
    const {drawMinimi,drawMinimiPart,HAIR_LABELS,FACE_LABELS}=await import(minimiPath) as typeof import("../src/ui/minimi");
    const {partCanvas,clothingPart,neckPart,extraClothingPart,addWhiteCamisole}=await import(partsPath) as typeof import("../src/ui/minimiParts");
    const {transparentAtlas}=await import(artPath) as typeof import("../src/ui/minimiArt");
    const {classicHead,classicExpression}=await import(classicPath) as typeof import("../src/ui/classicMinimi");
    const {ensureAvatarAssets}=await import(loaderPath) as typeof import("../src/systems/stageAssets");
    const {OUTFIT_LABELS,OUTFIT_POSES,outfitFrameBounds}=await import(outfitPath) as typeof import("../src/data/guestOutfits");
    const scene=(window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene");const images:{name:string,data:string}[]=[],profiles:unknown[]=[],parts:unknown[]=[];
    const save=(name:string,c:HTMLCanvasElement)=>{images.push({name:name+"-1x.png",data:c.toDataURL()});const big=partCanvas(c.width*4,c.height*4);big.getContext("2d")!.drawImage(c,0,0,big.width,big.height);images.push({name:name+"-4x.png",data:big.toDataURL()});};
    for(const gender of ["male","female"] as const){
      await ensureAvatarAssets(scene,gender);const raw=scene.textures.get("minimi-hair").getSourceImage() as HTMLImageElement,hair=transparentAtlas(raw);
      const source=scene.textures.get(`outfits-${gender}`).getSourceImage() as HTMLImageElement;
      for(let face=0;face<FACE_LABELS.length;face++)for(let outfit=0;outfit<OUTFIT_LABELS[gender].length;outfit++){
        const page=partCanvas(HAIR_LABELS[gender].length*128,192);
        for(let h=0;h<HAIR_LABELS[gender].length;h++){
          const profile={gender,face,hair:h,outfit},c=partCanvas();drawMinimi(scene,c,profile);const id=`${gender}-face${face}-hair${h}-outfit${outfit}`;
          save(id,c);page.getContext("2d")!.drawImage(c,h*128,0);profiles.push({id,...profile,faceLabel:FACE_LABELS[face],hairLabel:HAIR_LABELS[gender][h],outfitLabel:OUTFIT_LABELS[gender][outfit]});
        }save(`page-${gender}-face${face}-outfit${outfit}`,page);
      }
      for(const part of ["face","hair","outfit"] as const){const count=part==="face"?FACE_LABELS.length:part==="hair"?HAIR_LABELS[gender].length:OUTFIT_LABELS[gender].length;
        for(let i=0;i<count;i++){const c=partCanvas();drawMinimiPart(scene,c,{gender,face:0,hair:0,outfit:0,[part]:i},part);save(`part-${gender}-${part}${i}`,c);parts.push({gender,part,id:i});}}
      for(let h=0;h<3;h++)for(let row=0;row<4;row++){
        const head=classicHead(hair,gender,h,row);save(`layer-${gender}-head${h}-row${row}`,head);
        if(row!==3)for(let face=0;face<3;face++){const suffix=row===0?"":`-row${row}`;save(`layer-${gender}-head${h}-face${face}${suffix}`,classicExpression(head,face,row));save(`layer-${gender}-head${h}-face${face}${suffix}-blink`,classicExpression(head,face,row,true));}
      }
      for(let outfit=0;outfit<OUTFIT_LABELS[gender].length;outfit++){
        for(let row=0;row<OUTFIT_POSES.length;row++){
          const c=outfit<3?clothingPart(source,gender,outfit,row):outfit===5?extraClothingPart(transparentAtlas(scene.textures.get(gender==="female"?"sixth-outfits-female":"sixth-outfits").getSourceImage() as HTMLImageElement),gender==="male"?0:1,row,gender,gender==="male"?302:207,gender==="male"?9:8):extraClothingPart(transparentAtlas(scene.textures.get(gender==="female"&&outfit===4?"gray-tweed":`extra-outfits-${gender}`).getSourceImage() as HTMLImageElement),outfit-3,row,gender);if(gender==="female"&&outfit===5)addWhiteCamisole(c);save(`layer-${gender}-outfit${outfit}-row${row}`,c);
          if(outfit<3&&row===0){const b=outfitFrameBounds(source.width,source.height,gender,outfit,row),rawCell=partCanvas();rawCell.getContext("2d")!.drawImage(source,b.x,b.y,b.width,b.height,0,0,128,192);save(`source-${gender}-outfit${outfit}-row0`,rawCell);}
        }
      }
    }
    save("layer-neck",neckPart());return{images,profiles,parts,poses:OUTFIT_POSES};
  });
  for(const item of audit.images)await png(`${evidence}/atlas/${item.name}`,item.data);
  await writeFile(`${evidence}/registry.json`,JSON.stringify({count:audit.profiles.length,profiles:audit.profiles,parts:audit.parts,poses:audit.poses,rendering:"Actual drawMinimi / drawMinimiPart and shared source layers; no alternative compositor. 1x native128x192,4x nearest. Each page contains3 complete sprites without reduction."},null,2));
  expect(audit.profiles).toHaveLength(108);
});
