import { expect, test, type Page } from "@playwright/test";
import type Phaser from "phaser";
import { mkdir, writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";
import { chooseStory, clickGame, dismissLobbyArrival, receiveEnvelope } from "./story-helpers";
import { CHECKPOINT_KEY } from "../src/state/checkpointData";

const root = `${process.env.MINIMI_EVIDENCE ?? "../docs/game-review/minimi-fix"}/${process.env.MINIMI_PHASE ?? "after"}/flows`;
const profiles = [
  {id:"01-face3-hair3-blue-shirt",gender:"male",face:2,hair:2,outfit:0},
  {id:"02-face3-hair1-blue-shirt",gender:"male",face:2,hair:0,outfit:0},
  {id:"03-face2-glasses-hair1-ivory-top",gender:"male",face:1,hair:0,outfit:2},
  {id:"04-female-face1-hair1-white-shirt",gender:"female",face:0,hair:0,outfit:0},
  {id:"05-female-round-glasses-gray-tweed",gender:"female",face:1,hair:1,outfit:4},
  {id:"06-female-round-glasses-black-mini-boots",gender:"female",face:1,hair:2,outfit:5},
  {id:"07-male-round-glasses-check-jacket",gender:"male",face:1,hair:1,outfit:5},
] as const;
async function png(path:string,data:string) { await writeFile(path,Buffer.from(data.split(",")[1]!,"base64")); }
async function scene(page:Page,name:string) {
  await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene",name,{timeout:20000});
  if(name==="VenueLobbyScene") await expect(page.locator("#app canvas")).toHaveAttribute("data-lobby-ready","true");
}
test.use({ viewport:{width:393,height:852}, video:{mode:"on",size:{width:393,height:852}} });
test.beforeEach(async ({page})=>installPlayerObservation(page));

for (const [index, profile] of profiles.entries()) test(`M05 actual ${profile.id}: blink, A-B-A, walking, photos, resume and reaction`,async({page,browser})=>{
  test.setTimeout(180000);const folder=`${root}/${profile.id}`;await mkdir(folder,{recursive:true});
  const started=Date.now(), events:{event:string,ms:number}[]=[], errors:string[]=[];
  const mark=(event:string)=>events.push({event,ms:Date.now()-started});
  page.on("pageerror",e=>errors.push(e.message));page.on("console",e=>{if(e.type()==="error"||/(?:Texture|Frame).*(?:missing|not found|has no frame)/i.test(e.text()))errors.push(e.text());});
  await page.emulateMedia({reducedMotion:"no-preference"});await page.goto("/");await scene(page,"IntroScene");
  await clickGame(page,360,1180);await page.getByRole("textbox",{name:"내 이름은",exact:true}).fill("동동");await page.getByRole("button",{name:profile.gender==="male"?"남자":"여자",exact:true}).click();
  const select=async(face:number,hair:number,outfit:number)=>{for(const [part,id] of [["face",face],["hair",hair],["outfit",outfit]]){
    const card=page.locator(`.${part}-card[data-index="${id}"]`);
    if(part==="outfit" && !await card.isVisible())await page.getByRole("button",{name:"다음 의상 보기",exact:true}).click();
    await card.click();
  }};
  await select(profile.face,profile.hair,profile.outfit);mark("profile A selected");
  await page.screenshot({path:`${folder}/selection-A.png`});
  await select((profile.face+1)%3,(profile.hair+1)%3,(profile.outfit+1)%3);mark("profile B selected");await page.screenshot({path:`${folder}/selection-B.png`});
  await select(profile.face,profile.hair,profile.outfit);mark("profile A restored");await page.screenshot({path:`${folder}/selection-A-restored.png`});
  // Observe the real picker timer without changing the clock, calling its blink method or painting over it.
  const blink=await page.locator(".minimi-preview").evaluate(async node=>{
    const canvas=node as HTMLCanvasElement,start=performance.now(),samples:{at:number,state:number}[]=[],states:{at:number,data:string}[]=[];
    let prior="";
    await new Promise<void>(resolve=>{const tick=()=>{const at=performance.now(),data=canvas.toDataURL();if(data!==prior){states.push({at,data});prior=data;}samples.push({at,state:states.length-1});if(at-start>=4300)resolve();else requestAnimationFrame(tick);};tick();});
    return{start,states,samples};
  });
  expect(blink.states.length).toBeGreaterThanOrEqual(3);
  expect(blink.states[0]!.data).toBe(blink.states[2]!.data);expect(blink.states[1]!.data).not.toBe(blink.states[0]!.data);
  for(const [i,state] of blink.states.entries())await png(`${folder}/blink-${i}-${Math.round(state.at-blink.start)}ms.png`,state.data);
  mark("real open-closed-open observed");await page.getByRole("button",{name:"시작하기",exact:true}).click();
  await chooseStory(page,"신부측");await chooseStory(page,index===1?"지하철을 탄다":"자차로 간다");await chooseStory(page,index===1?"5번 출구":"파란색");
  await scene(page,"VenueLobbyScene");await dismissLobbyArrival(page);mark("first lobby");await page.screenshot({path:`${folder}/lobby.png`});
  // Read-only sampling of actual Player frames throughout movement and ceremony.
  await page.evaluate(()=>{
    const game=window.__venueQaGame as Phaser.Game;
    const audit:{samples:unknown[],frames:Record<string,string>}={samples:[],frames:{}};
    (window as unknown as {minimiAudit:typeof audit}).minimiAudit=audit;
    const tick=()=>{for(const owner of game.scene.getScenes(true)){
      const player=owner.children.list.find(c=>"isMoving" in c) as (Phaser.GameObjects.Container & {isMoving():boolean})|undefined;
      const sprite=player?.list[0] as Phaser.GameObjects.Sprite|undefined;
      if(!player||!sprite?.texture?.key?.startsWith("minimi"))continue;
      const key=`${sprite.texture.key}__${sprite.frame.name}`;
      audit.samples.push({at:performance.now(),scene:owner.scene.key,x:player.x,y:player.y,moving:player.isMoving(),key,originY:sprite.originY,localY:sprite.y});
      if(!audit.frames[key]){const c=document.createElement("canvas");c.width=128;c.height=192;const cx=c.getContext("2d")!;cx.imageSmoothingEnabled=false;cx.drawImage(sprite.texture.getSourceImage() as HTMLCanvasElement,sprite.frame.cutX,sprite.frame.cutY,128,192,0,0,128,192);audit.frames[key]=c.toDataURL();}
    }};
    game.events.on("poststep",tick);
  });
  await clickGame(page,455,410);await page.waitForTimeout(350);await page.screenshot({path:`${folder}/walking.png`});
  await clickGame(page,230,1000);await expect.poll(async()=>!(await page.evaluate(()=>window.__venuePlayerSnapshot()))?.moving,{timeout:12000}).toBe(true);
  mark("walking and changed destination finished");
  const originals:string[]=[];
  for(const kind of ["booth","bridal"]){
    await clickGame(page,kind==="booth"?130:590,kind==="booth"?590:990);await scene(page,kind==="booth"?"PhotoBoothScene":"BridalRoomScene");
    if(kind==="bridal"){await page.locator(".story-narration").click();await expect(page.locator("#app canvas")).toHaveAttribute("data-bridal-visit-stage","ready");}
    mark(`${kind} shutter input`);await clickGame(page,360,860);await expect(page.locator(".story-info-photo-result")).toBeVisible({timeout:15000});mark(`${kind} result shown`);
    originals.push(await page.locator(".keepsake canvas").evaluate(n=>(n as HTMLCanvasElement).toDataURL()));
    await png(`${folder}/${kind}-native.png`,originals.at(-1)!);await page.screenshot({path:`${folder}/${kind}-result.png`});
    await page.waitForTimeout(5500);await expect(page.locator(".story-info-photo-result")).toBeVisible();mark(`${kind} result held 5.5 seconds`);
    await page.getByRole("button",{name:"로비로 돌아가기",exact:true}).click();await scene(page,"VenueLobbyScene");mark(`${kind} explicit return`);
  }
  const beforeReload=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),CHECKPOINT_KEY);
  expect(beforeReload.profile).toEqual({gender:profile.gender,face:profile.face,hair:profile.hair,outfit:profile.outfit});
  const motion=await page.evaluate(()=>(window as unknown as {minimiAudit:{samples:unknown[],frames:Record<string,string>}}).minimiAudit);
  for(const [key,data] of Object.entries(motion.frames))await png(`${folder}/actual-${key}.png`,data);
  await page.reload();await scene(page,"IntroScene");await clickGame(page,360,1120);await scene(page,"VenueLobbyScene");
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),CHECKPOINT_KEY)).toEqual(beforeReload);
  await clickGame(page,128,60);await expect(page.locator(".notebook-keepsakes canvas")).toHaveCount(2);
  expect(await page.locator(".notebook-keepsakes canvas").evaluateAll(nodes=>nodes.map(n=>(n as HTMLCanvasElement).toDataURL()))).toEqual(originals);
  await page.screenshot({path:`${folder}/restored-notebook.png`});await page.keyboard.press("Escape");mark("resume IDs, progress and two photos identical");
  await clickGame(page,360,420);await receiveEnvelope(page);await clickGame(page,550,450);await expect(page.locator("#app canvas")).toHaveAttribute("data-photo-gallery-open","true");await page.keyboard.press("Escape");
  await clickGame(page,590,150);await scene(page,"VenueHallScene");mark("hall");
  await chooseStory(page,index===1?"환호를 한다":"박수를 친다");await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage","reaction");
  mark(index===1?"cheer":"applause");await page.screenshot({path:`${folder}/reaction.png`});await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage","group-photo");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-group-photo-entry-count","1");await chooseStory(page,"사진 찍기");
  await expect(page.locator("#app canvas")).toHaveAttribute("data-ceremony-stage","photo",{timeout:8000});await page.screenshot({path:`${folder}/group-photo.png`});mark("one group photo");
  expect(errors).toEqual([]);
  await writeFile(`${folder}/observations.json`,JSON.stringify({profile,browser:browser.version(),viewport:{width:393,height:852},DPR:1,started,events,blink:{...blink,states:blink.states.map(({at})=>({at}))},motion:{samples:motion.samples,frameKeys:Object.keys(motion.frames)},beforeReload,errors,video:await page.video()?.path()},null,2));
});
