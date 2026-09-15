import { test, expect } from "@playwright/test";
import type Phaser from "phaser";
import { mkdir, writeFile } from "node:fs/promises";
import { installPlayerObservation } from "./corridor-observables";

test("M01-M05 all garment families and user profiles: pose/step/clap native sheets",async({page})=>{
  test.setTimeout(120000);await installPlayerObservation(page);await page.goto("/");await expect(page.locator("#app canvas")).toHaveAttribute("data-active-scene","IntroScene");
  const result=await page.evaluate(async()=>{
    const a="/src/ui/minimi.ts",b="/src/ui/minimiMotion.ts",c="/src/systems/stageAssets.ts";
    const {buildMinimiTextures,minimiTextureKey}=await import(a) as typeof import("../src/ui/minimi");
    const {walkingTexture,clappingTexture}=await import(b) as typeof import("../src/ui/minimiMotion");
    const {ensureAvatarAssets}=await import(c) as typeof import("../src/systems/stageAssets");
    const scene=(window.__venueQaGame as Phaser.Game).scene.getScene("IntroScene"),images:{name:string,data:string}[]=[],index:unknown[]=[];
    const canvas=(w=128,h=192)=>{const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d")!.imageSmoothingEnabled=false;return c;};
    const save=(name:string,c:HTMLCanvasElement)=>{images.push({name:name+"-1x.png",data:c.toDataURL()});const big=canvas(c.width*4,c.height*4);big.getContext("2d")!.drawImage(c,0,0,big.width,big.height);images.push({name:name+"-4x.png",data:big.toDataURL()});};
    const profiles:{gender:"male"|"female",face:number,hair:number,outfit:number}[]=[{gender:"male",face:2,hair:2,outfit:0},{gender:"male",face:2,hair:0,outfit:0},{gender:"male",face:1,hair:0,outfit:2}];
    for(const gender of ["male","female"] as const)for(let outfit=0;outfit<6;outfit++)if(!(gender==="male"&&(outfit===0||outfit===2)))profiles.push({gender,face:outfit%3,hair:outfit%3,outfit});
    for(const profile of profiles){
      await ensureAvatarAssets(scene,profile.gender);buildMinimiTextures(scene,profile);
      const id=`${profile.gender}-face${profile.face}-hair${profile.hair}-outfit${profile.outfit}`,base=minimiTextureKey(profile),prefix=`${profile.outfit}-${profile.hair}-`;
      const frames:(readonly[string,string|number])[]=["down","left","right","up","posing","seated","down-blink","posing-blink","seated-blink"].map(p=>[base,prefix+p]);
      const walk=walkingTexture(scene,profile),clap=clappingTexture(scene,profile);
      for(const p of ["down","left","right","up"])for(let step=0;step<2;step++)frames.push([walk,`${p}-${step}`]);frames.push([clap,0],[clap,1]);
      const native=canvas(128*4,192*5),junctions=canvas(64*4,100*5);
      for(const [i,[key,name]] of frames.entries()){
        const t=scene.textures.get(key),f=t.get(name),c=canvas();c.getContext("2d")!.drawImage(t.getSourceImage() as HTMLCanvasElement,f.cutX,f.cutY,128,192,0,0,128,192);
        const label=i<9?String(name).slice(prefix.length):i<17?`walk-${name}`:`clap-${name}`;
        save(`${id}-${label}`,c);native.getContext("2d")!.drawImage(c,(i%4)*128,Math.floor(i/4)*192);
        junctions.getContext("2d")!.drawImage(c,32,20,64,100,(i%4)*64,Math.floor(i/4)*100,64,100);
      }
      save(`${id}-pose-page`,native);save(`${id}-junction-page`,junctions);index.push({id,profile,frames:frames.map(([key,name])=>({key,name}))});
    }
    return{images,index};
  });
  const folder=`${process.env.MINIMI_EVIDENCE ?? "../docs/game-review/minimi-fix"}/${process.env.MINIMI_PHASE ?? "after"}/motion`;await mkdir(folder,{recursive:true});
  for(const item of result.images)await writeFile(`${folder}/${item.name}`,Buffer.from(item.data.split(",")[1]!,"base64"));
  expect(result.index).toHaveLength(13);
  await writeFile(`${folder}/index.json`,JSON.stringify({fixture:"Shared production atlas only; actual playing evidence lives in after/flows. 13 representatives ×19frames, 108 idle separately.",index:result.index},null,2));
});
