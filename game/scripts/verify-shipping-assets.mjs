import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import { sourceModule } from './import-source.mjs';

const game = fileURLToPath(new URL('../', import.meta.url)), repo = resolve(game, '..');
const { values } = parseArgs({ options: { catalog: { type: 'string' }, report: { type: 'string' }, 'public-root': { type: 'string' }, 'production-root': { type: 'string' }, 'base-url': { type: 'string' } } });
const catalog = JSON.parse(await readFile(values.catalog ?? resolve(game, 'src/data/shippingAssets.json'), 'utf8'));
const publicRoot = resolve(values['public-root'] ?? resolve(game, 'public'));
const productionRoot = resolve(values['production-root'] ?? resolve(game, 'dist'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const errors = [], checked = [], keys = new Set(), urls = new Set();
const runtime = await import(await sourceModule(resolve(game, 'src/data/runtimeAssets.ts')));
const limits = { 'legacy-image': 512_000, 'legacy-share': 1_000_000, font: 500_000, 'stage-image': 3_000_000, 'character-atlas': 1_500_000, photograph: 3_000_000 };
const fail = (key, message) => errors.push(`${key}: ${message}`);
const safeURL = url => typeof url === 'string' && /^\/assets\/[a-zA-Z0-9/_-]+\.(png|webp|jpe?g|woff2)$/.test(url) && !url.includes('..');
if (catalog.version !== 1 || !Array.isArray(catalog.assets)) throw new Error('Unsupported shipping catalog');
for (const [name, limit] of Object.entries(limits)) if (catalog.budgets[name] !== limit) fail('budgets', `unexpected ${name} contract`);
if (catalog.budgets.initialAssetBytes !== 4_000_000 || catalog.budgets.shippingTotalBytes !== 110_000_000) fail('budgets', 'unexpected shipping budget');
for (const a of catalog.assets) {
  if (typeof a.key !== 'string' || keys.has(a.key)) fail(a.key, 'invalid/duplicate key');
  keys.add(a.key);
  if (!safeURL(a.url)) { fail(a.key, 'URL must be a local asset path without traversal'); continue; }
  if (urls.has(a.url)) fail(a.key, 'duplicate shipping URL');
  urls.add(a.url);
  if (!Array.isArray(a.stages) || !a.stages.length) fail(a.key, 'missing loading stages/consumers');
  if (!Number.isInteger(a.byteLimit) || a.byteLimit <= 0 || !limits[a.budgetClass] || a.byteLimit > limits[a.budgetClass]) fail(a.key, 'invalid byte budget');
  const records = catalog.provenance.filter(p => p.id === a.provenanceId);
  if (records.length !== 1) fail(a.key, 'missing/duplicate provenance');
  else {
    const p = records[0];
    for (const field of ['sourceUrl', 'license', 'transformationNotes']) if (typeof p[field] !== 'string' || !p[field].trim() || p[field].startsWith('pending:')) fail(a.key, `missing provenance ${field}`);
    if (p.rejectionStatus !== 'accepted' || !['generated', 'reused', 'provided'].includes(p.mode)) fail(a.key, 'provenance not accepted for shipping');
    if (!Array.isArray(p.evidence) || !p.evidence.length) fail(a.key, 'missing local origin/usage evidence');
    for (const file of p.evidence ?? []) {
      try { if (file.includes('..') || !(await stat(resolve(repo, file))).size) fail(a.key, 'invalid origin evidence'); }
      catch { fail(a.key, `origin evidence missing: ${file}`); }
    }
    if (p.mode === 'reused') {
      try { if (!p.licenseFile?.startsWith('game/public/assets/lacitta/licenses/') || !(await stat(resolve(repo, p.licenseFile))).size) fail(a.key, 'missing license file'); }
      catch { fail(a.key, 'missing license file'); }
    }
  }
  try {
    const bytes = await readFile(resolve(publicRoot, `.${a.url}`));
    if (!bytes.length || bytes.length > a.byteLimit) fail(a.key, `byte budget exceeded/empty (${bytes.length})`);
    if (hash(bytes) !== a.sha256) fail(a.key, 'shipping bytes differ from reviewed asset');
    if (hash(await readFile(resolve(repo, a.source))) !== a.sourceSHA256) fail(a.key, 'source/master hash differs');
    if (!(await readFile(resolve(productionRoot, `.${a.url}`))).equals(bytes)) fail(a.key, 'production copy differs from public asset');
    if (values['base-url']) { const response = await fetch(new URL(a.url, values['base-url'])); if (!response.ok || !Buffer.from(await response.arrayBuffer()).equals(bytes)) fail(a.key, 'live URL status/payload differs'); }
    checked.push({ key: a.key, url: a.url, bytes: bytes.length, stages: a.stages, sha256: hash(bytes) });
    if (a.kind === 'font' && bytes.subarray(0, 4).toString() !== 'wOF2') fail(a.key, 'invalid WOFF2 signature');
  } catch (e) { fail(a.key, String(e)); }
}
// Inventory ALL public files and production files, not only selected extensions/folders.
for (const [name, root] of [['public', publicRoot], ['production', productionRoot]]) {
  try {
    for (const file of await readdir(root, { recursive: true })) {
      if (!(await stat(resolve(root, file))).isFile()) continue;
      const url = `/${file.replaceAll('\\', '/')}`;
      const generated = name === 'production' && (file === 'index.html' || /^assets\/[^/]+\.(js|css)$/.test(file));
      if (!urls.has(url) && !catalog.nonMediaFiles.includes(file) && !generated) fail(name, `Unlisted shipping file: ${file}`);
    }
  } catch (e) { fail(name, `production build required: ${e}`); }
}
for (const a of Object.values(runtime.assets)) {
  const entries = catalog.assets.filter(c => c.runtimeKey === a.key);
  if (entries.length !== 1 || entries[0]?.url !== a.url) fail(a.key, `runtime optimized URL missing/mismatched: ${a.url}`);
  for (const [stage, members] of Object.entries(runtime.ASSET_STAGES)) if (members.includes(a.key) && !entries[0]?.stages.includes(stage)) fail(a.key, `unregistered stage ${stage}`);
}
for (const file of catalog.nonMediaFiles) if (!['assets/lacitta/licenses/Galmuri-OFL.txt','assets/ui/.gitkeep','assets/tiles/.gitkeep','assets/sprites/.gitkeep','share-preview.html'].includes(file)) fail(file,'unknown non-media shipping exception');
const sourceFiles = [resolve(game, 'index.html'), resolve(publicRoot, 'share-preview.html'), ...(await readdir(resolve(game, 'src'), { recursive: true })).filter(f => /\.(ts|css)$/.test(f)).map(f => resolve(game, 'src', f))];
for (const file of sourceFiles) {
  const content = await readFile(file, 'utf8');
  for (const m of content.matchAll(/["'`]((?:\/assets\/)[^"'`\s)]+\.(?:png|webp|jpe?g|woff2))["'`]/g)) if (!m[1].includes('${') && !urls.has(m[1])) fail(relative(game, file), `unregistered referenced URL ${m[1]}`);
  if (file.endsWith('InvitationView.ts')) for (const m of content.matchAll(/picture\("([^"$]+\.(?:png|jpe?g))"/g)) if (!urls.has(`/assets/invitation/${m[1]}`)) fail('invitation', `unregistered picture ${m[1]}`);
}
const invitation = JSON.parse(await readFile(resolve(game, 'src/data/invitationSource.json'), 'utf8'));
const galleryURLs = new Set();
for (const [i, photo] of invitation.galleryFiles.entries()) {
  const url = `/assets/invitation/${photo.localFile}`;
  if (!safeURL(url) || !urls.has(url)) fail('gallery', `missing/invalid dynamic gallery image ${i + 1}: ${url}`);
  if (galleryURLs.has(url)) fail('gallery', `duplicate dynamic gallery image ${url}`);
  galleryURLs.add(url);
}
for (const a of catalog.preservedSources) {
  try {
    if (hash(await readFile(resolve(repo, a.preservedPath))) !== a.sha256) fail(a.previousPath, 'preserved source changed');
    if (a.runtimeVariant && !urls.has(a.runtimeVariant)) fail(a.previousPath, 'derivative URL missing from shipping catalog');
  } catch (e) { fail(a.previousPath, `preserved original missing: ${e}`); }
}
const total = checked.reduce((s,a)=>s+a.bytes,0), initial = checked.filter(a=>a.stages.includes('opening')).reduce((s,a)=>s+a.bytes,0);
if (total>110_000_000) fail('shipping', `total byte budget ${total}`);
if (initial>4_000_000) fail('opening', `asset byte budget ${initial}`);
if (checked.filter(a=>a.url.endsWith('.woff2')).reduce((s,a)=>s+a.bytes,0)>limits.font) fail('fonts','font total exceeds budget');
let decoded = 0;
// Metadata failures are already a shipping rejection. Do not launch a browser for a known-invalid inventory.
if (!errors.length) {
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const a of catalog.assets.filter(a=>a.kind!=='font' && safeURL(a.url))) {
    try {
      const data = (await readFile(resolve(publicRoot,`.${a.url}`))).toString('base64');
      // Compare canonical decoded RGBA, before browser alpha premultiplication/color management.
      // PNG and WebP canvas readback can round translucent edge RGB differently.
      if (a.derivation === 'lossless-webp') {
        const decode = file => {
          const result = spawnSync('ffmpeg', ['-v','error','-i',file,'-f','rawvideo','-pix_fmt','rgba','pipe:1'], { maxBuffer: a.width*a.height*8 });
          if (result.status !== 0) throw new Error(`canonical decode failed: ${result.stderr}`);
          return result.stdout;
        };
        if (!decode(resolve(repo,a.source)).equals(decode(resolve(publicRoot,`.${a.url}`)))) fail(a.key,'lossless derivative decoded pixels differ from master');
      }
      const problems = await page.evaluate(async ({a,data})=>{
        const problems=[], image=new Image(); image.src=`data:image/${a.url.endsWith('.webp')?'webp':/jpe?g$/.test(a.url)?'jpeg':'png'};base64,${data}`;
        try { await image.decode(); } catch { return ['image decode failed']; }
        if(image.width!==a.width || image.height!==a.height) return [`dimensions ${image.width}x${image.height} do not match ${a.width}x${a.height}`];
        const canvas=document.createElement('canvas'); canvas.width=image.width;canvas.height=image.height;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
        const pixels=ctx.getImageData(0,0,image.width,image.height).data;
        let clear=0,opaque=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)clear++;if(pixels[i]===255)opaque++;}
        if(a.alpha==='opaque' && opaque!==image.width*image.height)problems.push('background must be opaque');
        if(a.alpha==='mixed' && !clear)problems.push('missing mixed alpha silhouette');
        if(a.matte) for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2];if(a.matte==='minimi-green'&&g-r>12&&g-b>12 || a.matte==='couple-green'&&g>160&&g-r>70&&g-b>70)pixels[i+3]=0;}
        let regions=[[0,0,image.width,image.height]];
        if(a.contract==='legacy-32x48'){
          if(a.width!==128||a.height!==192||a.frameWidth!==32||a.frameHeight!==48||a.columns!==4||JSON.stringify(a.rows)!=='["down","left","right","up"]')problems.push('invalid legacy sheet contract');
          regions=Array.from({length:16},(_,i)=>[i%4*32,Math.floor(i/4)*48,32,48]);
        }else if(a.contract==='region-atlas'||a.contract==='food-strip'){
          const xs=a.columnEdges??Array.from({length:(a.columns??1)+1},(_,i)=>i/(a.columns??1)),ys=a.rowEdges;
          if(!Array.isArray(ys)||ys[0]!==0||ys.at(-1)!==1||xs[0]!==0||xs.at(-1)!==1)return [...problems,'invalid sheet region contract'];
          regions=[];for(let y=0;y<ys.length-1;y++)for(let x=0;x<xs.length-1;x++)regions.push([Math.round(xs[x]*image.width),Math.round(ys[y]*image.height),Math.round(xs[x+1]*image.width)-Math.round(xs[x]*image.width),Math.round(ys[y+1]*image.height)-Math.round(ys[y]*image.height)]);
        }else if(a.contract==='outfit-atlas'){
          const centers=a.gender==='male'?[.26,.5,.735]:[.275,.5,.718],ys=a.gender==='male'?[0,.195,.36,.524,.692,.858,1]:[0,.181,.348,.51,.672,.836,1];
          regions=centers.flatMap(c=>ys.slice(0,-1).map((y,i)=>[Math.floor((c-.095)*image.width),Math.floor(y*image.height),Math.floor(.19*image.width),Math.floor((ys[i+1]-y)*image.height)]));
        }else if(a.contract!=='image')problems.push('unknown image/sheet contract');
        for(const [x,y,w,h]of regions){
          if(w<=0||h<=0||x<0||y<0||x+w>image.width||y+h>image.height){problems.push('invalid sheet bounds');continue;}
          let visible=0,transparent=0;const colors=new Set();
          for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const i=(yy*image.width+xx)*4;if(pixels[i+3]===0)transparent++;else{visible++;if(colors.size<3)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]},${pixels[i+3]}`);}}
          if(!visible||colors.size<2)problems.push(`blank/flat frame at ${x},${y}`);
          if((a.effectiveAlpha==='mixed'||a.contract==='legacy-32x48')&&!transparent)problems.push(`missing transparent frame padding at ${x},${y}`);
        }
        return problems;
      },{a,data});
      decoded++;
      problems.forEach(p=>fail(a.key,p));
    }catch(e){fail(a.key,`decode/source failure: ${e}`);}
  }
}finally{await browser.close();}
}
const result={mode:'shipping',timeUTC:new Date().toISOString(),catalogVersion:catalog.version,decoded,registered:catalog.assets.length,checked:checked.length,runtimeKeys:Object.keys(runtime.assets).length,publicRoot,productionRoot,totalBytes:total,openingAssetBytes:initial,networkTotalMustBeMeasuredSeparately:true,preservedSources:catalog.preservedSources.length,old40Tracked:catalog.preservedSources.filter(a=>a.old40Item).length,errors,assets:checked,exitCode:errors.length?1:0};
if(values.report)await writeFile(values.report,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('PASS — full public + production shipping inventory');
