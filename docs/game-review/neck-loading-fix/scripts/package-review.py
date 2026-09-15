"""Build a new review archive; never overwrite original evidence or old ZIPs."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,zipfile,sys,collections
root=Path(__file__).resolve().parents[1];repo=root.parents[2]
out=root.parent/'neck-loading-fix-review.zip'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
fp=json.loads((root/'source-fingerprint.json').read_text())
changed={x['path'] for x in fp['changedFiles']}
traces={x['original']:x for x in json.loads((root/'trace-evidence/index.json').read_text())}
videos=json.loads((root/'VIDEO_INDEX.json').read_text())['videos']
duplicates={x['source']:x['reviewFile'] for x in videos}
failedRoots={str(Path(p).parent) for p in traces}
binary={'.png','.webp','.jpg','.jpeg','.webm','.zip','.woff','.woff2','.ttf','.otf'}
included=[];excluded=[]
for p in sorted(root.rglob('*')):
    if not p.is_file():continue
    rel=str(p.relative_to(root));reason=None;replacement=None
    if rel in ['FILE_MANIFEST.json','ZIP_EXCLUSIONS.json','PACKAGE_VERIFICATION.json']:continue
    if '.playwright-artifacts' in rel:raise RuntimeError('Tests still running: '+rel)
    if rel in traces:
        reason='Large original trace remains untouched on disk; all API events/network metadata/stacks/source, error contexts, original failure videos and timestamped sampled stills are included.'
        replacement=traces[rel]['extract']
    elif rel in duplicates:
        reason='Byte-identical original final normal recording is included under a readable review filename.'
        replacement=duplicates[rel]
        assert sha(p)==sha(root/replacement)
    elif rel.startswith('sources/before/') and p.suffix in binary and str(Path(rel).relative_to('sources/before')) not in changed:
        reason='Unchanged baseline binary asset; preserved in original source snapshot and fingerprint. Final changed assets and required BEFORE renders are included.'
    elif rel.startswith('iterations/') and p.suffix in binary and not ('inspection' in p.parts and not rel.startswith('iterations/video-inspection-01/')) and not rel.startswith('iterations/ux-01/'):
        reason='Superseded intermediate visual export. Original retained on disk; final native PNG, complete final sheets, intermediate neck inspection pages, all logs and failed-run evidence are included.'
        replacement='after/; iterations/*/inspection/; trace-evidence/'
    elif p.suffix=='.webm' and rel.startswith(('runs/','regressions/runs/')):
        failure=any(rel.startswith(f+'/') for f in failedRoots)
        finalProduction=rel.startswith('regressions/runs/production-1789394473585/')
        if not failure and not finalProduction:
            reason='Repeated successful/intermediate recording; final 14 review videos plus final production recordings are included. Individual reporter results and original recording remain preserved.'
            replacement='videos/; regressions/runs/production-1789394473585/'
    if reason:
        excluded.append({'path':rel,'bytes':p.stat().st_size,'sha256':sha(p),'reason':reason,'replacement':replacement,'originalPreserved':True})
    else:included.append(p)
# Any original failure video must be present.
for p in root.rglob('*.webm'):
    rel=str(p.relative_to(root))
    if any(rel.startswith(f+'/') for f in failedRoots):assert p in included,rel
for p in (root/'after').rglob('*.png'):assert p in included
for v in videos:assert root/v['reviewFile'] in included
record={'timeUTC':datetime.now(timezone.utc).isoformat(),'note':'Only review ZIP selection; no source evidence is deleted, rewritten, accelerated or re-encoded. Large traces remain fully available at original paths; extracts are not standalone replayable traces.','files':excluded,'excludedBytes':sum(x['bytes'] for x in excluded)}
(root/'ZIP_EXCLUSIONS.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
included.append(root/'ZIP_EXCLUSIONS.json')
manifest={'generatedUTC':datetime.now(timezone.utc).isoformat(),'sourceFingerprint':fp['fingerprint'],'applicationFingerprint':fp['applicationFingerprint'],'note':'Paths relative to neck-loading-fix/ in ZIP. This manifest excludes its own hash. All original evidence remains on disk.','files':[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in included]}
(root/'FILE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
included.append(root/'FILE_MANIFEST.json')
print(json.dumps({'includeFiles':len(included),'includeMiB':round(sum(p.stat().st_size for p in included)/1048576,2),'excludedFiles':len(excluded),'excludedMiB':round(record['excludedBytes']/1048576,2)},indent=2),flush=True)
if '--plan' in sys.argv:sys.exit()
assert not out.exists(),'Refusing to overwrite existing review archive'
with zipfile.ZipFile(out,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as z:
    for p in sorted(included):z.write(p,'neck-loading-fix/'+str(p.relative_to(root)))
print('Archive written; checking every entry...',flush=True)
with zipfile.ZipFile(out) as z:
    bad=z.testzip();assert bad is None,bad
    for m in manifest['files']:
        b=z.read('neck-loading-fix/'+m['path'])
        assert len(b)==m['bytes'] and hashlib.sha256(b).hexdigest()==m['sha256'],m['path']
    entryCount=len(z.infolist())
preservation={}
for rel,v in fp['protectedPackages'].items():
    p=repo/rel
    preservation[rel]={'unchanged':sha(p)==v['expected']['sha256'],'bytes':p.stat().st_size,'sha256':sha(p)}
assert all(v['unchanged'] for v in preservation.values())
result={'path':str(out),'bytes':out.stat().st_size,'MiB':round(out.stat().st_size/1048576,2),'sha256':sha(out),'entries':entryCount,'crcCheck':'all entries passed','manifestSHA256Check':'all listed entries passed','originalPackages':preservation,'originalEvidenceDeletedOrOverwritten':False,'sourceFingerprint':fp['fingerprint']}
(root/'PACKAGE_VERIFICATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
