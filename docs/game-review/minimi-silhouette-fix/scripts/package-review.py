from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,zipfile,sys
root=Path(__file__).resolve().parents[1];out=root.parent/'minimi-silhouette-fix-review.zip'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
fp=json.loads((root/'source-fingerprint.json').read_text())
traces={r['original']:r for r in json.loads((root/'trace-evidence/index.json').read_text())}
failed={str(Path(p).parent) for p in traces}
videos=json.loads((root/'VIDEO_INDEX.json').read_text())['videos'];dupes={v['source']:v['reviewFile'] for v in videos}
binary={'.png','.webp','.jpg','.jpeg','.webm','.zip'}
included=[];excluded=[]
for p in sorted(root.rglob('*')):
 if not p.is_file():continue
 rel=str(p.relative_to(root));reason=None;replacement=None
 if rel in ['FILE_MANIFEST.json','ZIP_EXCLUSIONS.json','PACKAGE_VERIFICATION.json']:continue
 if '.playwright-artifacts' in rel:raise RuntimeError('Tests still active: '+rel)
 if rel in traces:
  reason='Large duplicate HTTP image bodies/screencasts. Full API/network metadata/stacks/source, error contexts, original interrupted videos and timestamped stills are included. Full replayable trace remains on disk.';replacement=traces[rel]['extract']
 elif rel in dupes:
  replacement=dupes[rel];assert sha(p)==sha(root/replacement);reason='Byte-identical original recording is included under a readable video filename.'
 elif rel.startswith('baseline-copied-flows/'):
  reason='Older copied baseline flow replaced by fresh BEFORE flows from the frozen baseline source.';replacement='before/flows/'
 elif rel.startswith('iterations/') and p.suffix in binary and not ('junction' in p.name and '16x' in p.name):
  reason='Superseded intermediate rendering. Final complete native/4x PNGs, BEFORE comparison, layer diagnostics and all iteration reporter/log results are included.';replacement='after/; before/; comparison/; logs/'
 elif rel.startswith('recovered-ux-run01/') and p.suffix in binary:
  reason='Intermediate duplicate capture preserved after restoring old evidence; complete new-path retest is included.';replacement='after/neck-loading-ux/; old-evidence-restoration.json'
 elif rel.startswith('runs/') and p.suffix=='.webm' and not any(rel.startswith(f+'/') for f in failed):
  reason='Repeated successful recording. Nineteen original review videos cover BEFORE/AFTER, normal journeys, station touch, three car routes and hall/notebook. Every individual reporter result remains included.';replacement='videos/; logs/'
 if reason:excluded.append({'path':rel,'bytes':p.stat().st_size,'sha256':sha(p),'reason':reason,'replacement':replacement,'originalPreserved':True})
 else:included.append(p)
for p in (root/'after').rglob('*.png'):assert p in included
for p in (root/'before').rglob('*.png'):assert p in included
for v in videos:assert root/v['reviewFile'] in included
for p in root.rglob('*.webm'):
 if any(str(p.relative_to(root)).startswith(f+'/') for f in failed):assert p in included
(root/'ZIP_EXCLUSIONS.json').write_text(json.dumps({'timeUTC':datetime.now(timezone.utc).isoformat(),'note':'Only archive selection. No original evidence is deleted; temporary legacy-path restoration is disclosed separately.','files':excluded},ensure_ascii=False,indent=2)+'\n');included.append(root/'ZIP_EXCLUSIONS.json')
manifest={'timeUTC':datetime.now(timezone.utc).isoformat(),'sourceFingerprint':fp['fingerprint'],'note':'Relative to minimi-silhouette-fix/ inside ZIP. Manifest excludes its own hash.','files':[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in included]}
(root/'FILE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');included.append(root/'FILE_MANIFEST.json')
print(json.dumps({'included':len(included),'MiB':round(sum(p.stat().st_size for p in included)/1048576,2),'excluded':len(excluded)},indent=2),flush=True)
if '--plan' in sys.argv:sys.exit()
assert not out.exists(),'Never overwrite an existing review ZIP'
assert (root/'TEST_RESULTS.json').exists()
with zipfile.ZipFile(out,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as z:
 for p in sorted(included):z.write(p,'minimi-silhouette-fix/'+str(p.relative_to(root)))
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for m in manifest['files']:
  b=z.read('minimi-silhouette-fix/'+m['path']);assert len(b)==m['bytes'] and hashlib.sha256(b).hexdigest()==m['sha256'],m['path']
data={'path':str(out),'bytes':out.stat().st_size,'MiB':round(out.stat().st_size/1048576,2),'sha256':sha(out),'entries':len(included),'CRC':'all passed','manifestHashes':'all passed','sourceFingerprint':fp['fingerprint'],'oldZIPsPreserved':all(r['unchanged'] for r in fp['protectedPackages'].values()),'oldEvidenceRestoration':'old-evidence-restoration.json'}
(root/'PACKAGE_VERIFICATION.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print(json.dumps(data,ensure_ascii=False,indent=2))
