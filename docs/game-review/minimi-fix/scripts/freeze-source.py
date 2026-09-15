from pathlib import Path
import datetime, difflib, hashlib, json, shutil, subprocess

root=Path(__file__).resolve().parents[4]
e=root/'docs/game-review/minimi-fix'
base=json.loads((e/'baseline.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
changed=[p for p,h in base['hashes'].items() if not (root/p).is_file() or sha(root/p)!=h]
assert sorted(changed)==sorted(['game/src/ui/classicMinimi.ts','game/src/ui/minimiParts.ts','game/src/ui/minimi.ts']),changed
protected=[p for p,h in base['protectedD'].items() if not (root/p).is_file() or sha(root/p)!=h]
assert not protected,protected
added=sorted(str(p.relative_to(root)) for pattern in ['game/playwright.minimi*.ts','game/e2e/review-minimi-*.ts'] for p in root.glob(pattern))
diff=''
for name in changed+added:
    p=root/name
    old=(Path(base['snapshot'])/name).read_text() if name in changed else ''
    now=p.read_text()
    diff+=''.join(difflib.unified_diff(old.splitlines(True),now.splitlines(True),fromfile='before/'+name if old else '/dev/null',tofile='after/'+name))
    target=e/'sources'/'after'/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
    if old:
        target=e/'sources'/'before'/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(Path(base['snapshot'])/name,target)
(e/'changes.patch').write_text(diff)
hashes={p:sha(root/p) for p in sorted(set(base['hashes'])|set(added))}
fingerprint=hashlib.sha256(''.join(f'{p}\0{h}\n' for p,h in hashes.items()).encode()).hexdigest()
app={p:h for p,h in hashes.items() if not p.startswith('game/e2e/') and not p.startswith('game/playwright.')}
data={'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'gitHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'baselineFingerprint':base['fingerprint'],'fingerprintAlgorithm':'sha256 of sorted path + NUL + sha256 + newline','fingerprint':fingerprint,'applicationFingerprint':hashlib.sha256(''.join(f'{p}\0{h}\n' for p,h in app.items()).encode()).hexdigest(),'hashes':hashes,'changedExistingFiles':changed,'addedVerificationFiles':added,'protectedDCount':len(base['protectedD']),'protectedDMismatches':protected,'allOriginalPublicAndArtworkUnchanged':True}
(e/'source-fingerprint.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(e/'changed-files.json').write_text(json.dumps({'comparedAgainst':'Completed D working tree frozen at task start, not git HEAD','implementation':changed,'verification':added},ensure_ascii=False,indent=2)+'\n')
assetMap=[]
for name in ['minimi-hair','outfits-male','outfits-female','extra-outfits-male','extra-outfits-female']:
    paths=[f'game/artwork/sources/assets/lacitta/characters/{name}.png',f'game/public/assets/optimized/lacitta-characters-{name}.webp']
    for name2 in paths:
        p=root/name2;target=e/'sources'/name2;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
    assetMap.append({'key':name,'master':paths[0],'runtime':paths[1],'hashes':{p:sha(root/p) for p in paths},'bitmapEdited':False,'correction':'Shared runtime compositor; cache is scoped to the game instance and keyed by retained profile IDs.'})
(e/'sources/asset-map.json').write_text(json.dumps(assetMap,indent=2)+'\n')
for p in (root/'minimi-blocker-fix').rglob('*'):
    if p.is_file():
        t=e/'sources/input'/p.relative_to(root/'minimi-blocker-fix');t.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,t)
print(json.dumps({k:v for k,v in data.items() if k!='hashes'},ensure_ascii=False))
