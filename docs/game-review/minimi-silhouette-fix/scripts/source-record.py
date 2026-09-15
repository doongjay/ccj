from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,subprocess,difflib,shutil,zipfile
root=Path(__file__).resolve().parents[1];repo=root.parents[2]
base=json.loads((root/'baseline.json').read_text())['hashes']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def fingerprint(h):return hashlib.sha256(''.join(p+'\0'+s+'\n' for p,s in sorted(h.items())).encode()).hexdigest()
paths=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','game'],cwd=repo,text=True).splitlines()
paths=sorted(set(base)|{p for p in paths if not any(x in Path(p).parts for x in ['node_modules','dist','test-results','test-results-production','playwright-report'])})
hashes={p:sha(repo/p) for p in paths if (repo/p).is_file()}
binary={'.png','.webp','.jpg','.jpeg','.woff','.woff2','.ttf','.otf','.zip'}
changed=[];patch=[]
for p in paths:
 if base.get(p)==hashes.get(p):continue
 after=repo/p;before=root/'sources/before'/p
 changed.append({'path':p,'status':'added' if p not in base else 'deleted' if not after.exists() else 'modified','beforeSHA256':base.get(p),'afterSHA256':hashes.get(p),'bytes':after.stat().st_size if after.exists() else 0})
 if Path(p).suffix not in binary:
  a=before.read_text().splitlines(keepends=True) if before.exists() else []
  b=after.read_text().splitlines(keepends=True) if after.exists() else []
  patch.extend(difflib.unified_diff(a,b,fromfile='a/'+p if before.exists() else '/dev/null',tofile='b/'+p if after.exists() else '/dev/null'))
for p in hashes:
 if Path(p).suffix in binary and not any(c['path']==p for c in changed):continue
 dest=root/'sources/after'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(repo/p,dest)
expected={
 'docs/game-review/after-batch-d-review.zip':'92567f440ea23b430f85ec3025a23e41aa4af60b45f4275d6975e73c0fa1e5e6',
 'docs/game-review/minimi-fix-review.zip':'94b726c222136f5d5d2f3e76073eacf447ffdb84500713ce23b57ec10b832b27',
 'docs/game-review/neck-loading-fix-review.zip':'69ae8592af465d59f270bc698ff73c0560459c6507492dc5f2815517f1ea3377'}
packages={p:{'expectedSHA256':h,'sha256':sha(repo/p),'bytes':(repo/p).stat().st_size,'unchanged':sha(repo/p)==h} for p,h in expected.items()}
old=json.loads((repo/'docs/game-review/minimi-fix/baseline.json').read_text())['protectedD']
bad=[p for p,h in old.items() if not (repo/p).is_file() or sha(repo/p)!=h]
oldUX=[]
with zipfile.ZipFile(repo/'docs/game-review/neck-loading-fix-review.zip') as z:
 for n in z.namelist():
  if not n.startswith('neck-loading-fix/after/ux/') or n.endswith('/'):continue
  p=repo/'docs/game-review'/n
  oldUX.append({'path':str(p.relative_to(repo)),'unchanged':p.read_bytes()==z.read(n)})
assert not bad and all(p['unchanged'] for p in packages.values()) and all(p['unchanged'] for p in oldUX)
data={'timeUTC':datetime.now(timezone.utc).isoformat(),'gitHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'algorithm':'SHA256(sorted path + NUL + file SHA256 + newline)','baselineFingerprint':fingerprint(base),'fingerprint':fingerprint(hashes),'applicationFingerprint':fingerprint({p:h for p,h in hashes.items() if p.startswith(('game/src/','game/public/','game/artwork/'))}),'hashes':hashes,'changedFiles':changed,'protectedPackages':packages,'protectedDFiles':len(old),'protectedDMismatches':bad,'oldUXComparedToOriginalZIP':oldUX,'restorationDisclosure':'old-evidence-restoration.json'}
(root/'source-fingerprint.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(root/'source-diff.patch').write_text(''.join(patch))
(root/'CHANGED_FILES.md').write_text('# 이번 작업의 정확한 변경 파일\n\n기준은 기존 A/A1/B/C/D를 포함한 시작 working tree다. remote/HEAD 전체 diff가 아니다.\n\nBaseline: `'+data['baselineFingerprint']+'`\n\n| 상태 | 파일 | bytes |\n|---|---|---:|\n'+''.join(f'| {c["status"]} | `{c["path"]}` | {c["bytes"]} |\n' for c in changed)+'\n검수 문서·실행 스크립트·이미지·영상은 `docs/game-review/minimi-silhouette-fix/`에 새로 저장한다. 코드 diff는 `source-diff.patch`, 변경 원본/실사용 이미지와 최종 소스는 `sources/after/`에 있다.\n')
print(json.dumps({'changed':len(changed),'fingerprint':data['fingerprint'],'protectedD':len(old),'preservedPackages':all(p['unchanged'] for p in packages.values()),'oldUXIntact':len(oldUX)},indent=2))
