"""Create a review ZIP without deleting or changing original evidence."""
from pathlib import Path
import hashlib, json, zipfile

root=Path(__file__).resolve().parents[1]
destination=root.parent/'minimi-fix-review.zip'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
summary=json.loads((root/'TEST_SUMMARY.json').read_text())
assert summary['finalComplete'], 'Wait for both final suites before packaging'
assert summary['main']['counts']=={'passed':144,'skipped':3}
assert (root/'PERFORMANCE_COMPARISON.json').exists()
assert (root/'logs/production-final-02.log').exists(), 'Preserve complete final command output first'

# Preserve essential text events/network/stacks from interrupted large traces.
# The full timeout trace remains included; other original full traces stay on disk.
trace_map=[]
for source in sorted((root/'regressions/runs').rglob('trace.zip')):
    if 'minimi-visual-' in str(source):continue
    target=root/'failure-trace-core'/source.parent.parent.name/source.parent.name/'trace-core.zip'
    target.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(source) as inp,zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as out:
        names=[n for n in inp.namelist() if n.endswith(('.trace','.network','.stacks'))]
        for name in names:out.writestr(name,inp.read(name))
    trace_map.append({'source':str(source.relative_to(root)),'sourceBytes':source.stat().st_size,'sourceSha256':digest(source),'core':str(target.relative_to(root)),'includedEntries':names,'limitation':'Binary resources/snapshots excluded only from review copy; original full trace retained on disk. Core may not support complete Trace Viewer playback.'})
(root/'failure-trace-core/index.json').write_text(json.dumps(trace_map,ensure_ascii=False,indent=2)+'\n')

active_blinks=set()
for obs in (root/'after/flows').glob('*/observations.json'):
    d=json.loads(obs.read_text())
    for i,state in enumerate(d['blink']['states']):active_blinks.add(obs.parent/f"blink-{i}-{round(state['at']-d['blink']['start'])}ms.png")

def exclusion(p):
    rel=p.relative_to(root);s=str(rel)
    if p.name=='.DS_Store' or '__pycache__' in p.parts:return 'OS/Python cache; no evidence'
    if p.name in ['ZIP_MANIFEST.json','EXCLUDED_FILES.json','package-verification.json']:return 'Generated package metadata handled separately'
    if s.startswith('runs/'):
        if p.name=='error-context.md' or p.name.startswith('test-failed') or p.suffix=='.json':return None
        return 'Duplicate Playwright capture output; canonical final PNGs in after/, complete final original videos byte-copied to videos/; original retained'
    if s.startswith('regressions/runs/'):
        if 'minimi-visual-' in s and '/regression-final/' in s:return None
        if p.name=='error-context.md' or p.name.startswith('test-failed') or p.suffix=='.json':return None
        if p.name=='trace.zip':return 'Large interrupted full trace: full JSON reporter/error context plus trace core included; full original retained'
        return 'Duplicate older-batch regression image/full recording; individual JSON results and required minimi/failed evidence retained'
    if s.startswith('regressions/'):
        if p.suffix in ['.json','.log','.md']:return None
        return 'Unrelated older-batch regression screenshot/video; final minimi required actual screenshots/videos retained'
    if s.startswith('iterations/'):
        if rel.parts[1]=='03' and len(rel.parts)==3 and p.suffix=='.ts':return 'Source copy was saved after the archived pre-anchor PNGs; not an exact source-image version pair (REVIEW_NOTES); final exact source is in sources/after'
        if p.suffix in ['.json','.log','.ts']:return None
        if 'motion' in rel.parts and p.suffix=='.png':
            if any(suffix in p.name for suffix in ['-pose-page-1x.png','-junction-page-4x.png','-posing-4x.png','-posing-blink-4x.png','-left-4x.png','-right-4x.png']):return None
            return 'Intermediate motion duplicate: native complete pose pages, enlarged junction/side/posing failure evidence retained; final all209native/4x frames included; original unchanged'
        if '-393x852' in p.name or p.name.startswith('first-face-thumbnail-393'):return None
        if p.name in ['layer-neck-1x.png','layer-neck-4x.png','layer-male-outfit2-row0-4x.png']:return None
        return 'Duplicate intermediate exhaustive atlas/full-view/play capture; intermediate failures and motion pages plus final full evidence retained'
    if s.startswith('after/flows/') and p.name.startswith('blink-') and p not in active_blinks:
        return 'Previous-run blink timestamp file; final observed native states referenced by observations and videos/index are included; previous original retained'
    return None

included=[];excluded=[]
for p in sorted(root.rglob('*')):
    if not p.is_file():continue
    reason=exclusion(p)
    if p.name in ['ZIP_MANIFEST.json','EXCLUDED_FILES.json','package-verification.json']:continue
    if reason:excluded.append({'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':digest(p),'reason':reason,'originalPreserved':True})
    else:included.append(p)
(root/'EXCLUDED_FILES.json').write_text(json.dumps({'excludedCount':len(excluded),'excludedBytes':sum(x['bytes'] for x in excluded),'originalsDeleted':False,'files':excluded},ensure_ascii=False,indent=2)+'\n')
included.append(root/'EXCLUDED_FILES.json')
manifest={'root':'minimi-fix','fileCountExcludingManifest':len(included),'files':[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':digest(p)} for p in sorted(included)]}
(root/'ZIP_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
included.append(root/'ZIP_MANIFEST.json')
if destination.exists():raise RuntimeError('Review ZIP already exists; preserve it and choose a distinct new package path instead of overwriting')
with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as out:
    for p in sorted(included):out.write(p,Path('minimi-fix')/p.relative_to(root))
with zipfile.ZipFile(destination) as archive:
    bad=archive.testzip();assert bad is None
    for entry in manifest['files']:
        data=archive.read('minimi-fix/'+entry['path']);assert len(data)==entry['bytes'];assert hashlib.sha256(data).hexdigest()==entry['sha256']
result={'zip':str(destination),'bytes':destination.stat().st_size,'MiB':round(destination.stat().st_size/1024**2,2),'sha256':digest(destination),'crcBadEntry':bad,'manifestFilesVerified':len(manifest['files']),'excludedFilesPreserved':len(excluded),'originalsDeleted':False}
(root/'package-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
