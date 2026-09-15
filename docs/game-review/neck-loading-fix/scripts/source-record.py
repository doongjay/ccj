"""Record the actual dirty working tree against the preserved start, not git HEAD."""
from pathlib import Path
from datetime import datetime, timezone
import difflib, hashlib, json, subprocess, shutil
repo=Path(__file__).resolve().parents[4]
root=repo/'docs/game-review/neck-loading-fix'
base=json.loads((root/'baseline.json').read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
paths=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','game'],cwd=repo,text=True).splitlines()
paths=sorted(set(base['hashes'])|{p for p in paths if not any(x in Path(p).parts for x in ['node_modules','dist','test-results','test-results-production','playwright-report'])})
hashes={p:sha(repo/p) for p in paths if (repo/p).is_file()}
# .env.example was listed by the original git status but omitted by its snapshot.
# Do not misrepresent it as a file created by this task.
unhashed_existing=['game/.env.example']
changed=[p for p in paths if base['hashes'].get(p)!=hashes.get(p) and p not in unhashed_existing]
binary={'.png','.webp','.jpg','.jpeg','.woff','.woff2','.ttf','.otf','.zip'}
patch=[];records=[]
for p in changed:
    before=root/'sources/before'/p; after=repo/p
    status='added' if p not in base['hashes'] else 'deleted' if not after.exists() else 'modified'
    records.append({'path':p,'status':status,'beforeSHA256':base['hashes'].get(p),'afterSHA256':hashes.get(p),'bytes':after.stat().st_size if after.exists() else 0})
    if Path(p).suffix not in binary:
        a=before.read_text().splitlines(keepends=True) if before.exists() else []
        b=after.read_text().splitlines(keepends=True) if after.exists() else []
        patch.extend(difflib.unified_diff(a,b,fromfile='a/'+p if before.exists() else '/dev/null',tofile='b/'+p if after.exists() else '/dev/null'))
    if after.exists():
        dest=root/'sources/after'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(after,dest)
# Include the rest of the source/config/test files so new references are reviewable.
for p in hashes:
    if Path(p).suffix in binary or '/public/assets/' in p or '/artwork/sources/' in p: continue
    dest=root/'sources/after'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(repo/p,dest)
protected={p:{'expected':r,'actual':{'sha256':sha(repo/p),'bytes':(repo/p).stat().st_size},'unchanged':sha(repo/p)==r['sha256']} for p,r in base['protectedPackages'].items()}
old=json.loads((repo/'docs/game-review/minimi-fix/baseline.json').read_text())['protectedD']
mismatches=[p for p,h in old.items() if not (repo/p).is_file() or sha(repo/p)!=h]
def fingerprint(h): return hashlib.sha256(''.join(p+'\0'+s+'\n' for p,s in sorted(h.items())).encode()).hexdigest()
record={'timeUTC':datetime.now(timezone.utc).isoformat(),'gitHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'baselineFingerprint':base['priorFingerprint'],'algorithm':'SHA256(sorted path + NUL + file SHA256 + newline)','fingerprint':fingerprint(hashes),'applicationFingerprint':fingerprint({p:h for p,h in hashes.items() if p.startswith(('game/src/','game/public/','game/artwork/'))}),'hashes':hashes,'changedFiles':records,'protectedPackages':protected,'protectedDFiles':len(old),'protectedDMismatches':mismatches}
record['baselineUnhashedExisting']={'paths':unhashed_existing,'evidence':'Listed in docs/game-review/minimi-fix/baseline.json gitStatus before this task; original snapshot omitted .env files. Not changed by this task; no before content hash available.'}
(root/'source-fingerprint.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
(root/'source-diff.patch').write_text(''.join(patch))
(root/'CHANGED_FILES.md').write_text('# Exact changes since this task started\n\nBaseline: `'+base['priorFingerprint']+'`. Existing A/A1/B/C/D uncommitted work is included in the baseline; this is not a diff against remote HEAD.\n\n| Status | Path | Bytes |\n|---|---|---:|\n'+''.join(f'| {r["status"]} | `{r["path"]}` | {r["bytes"]} |\n' for r in records)+'\nText changes: `source-diff.patch`. Changed artwork: `sources/after/` and `asset-edits.json`.\n')
print(json.dumps({'files':len(hashes),'changed':len(records),'fingerprint':record['fingerprint'],'Dfiles':len(old),'Dmismatches':mismatches,'packagesUnchanged':all(x['unchanged'] for x in protected.values())},indent=2))
