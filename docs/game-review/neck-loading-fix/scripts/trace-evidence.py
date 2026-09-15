"""Keep full event/network/stack records and time-labelled sampled trace stills.

Original trace ZIPs remain untouched. These extracts are not replacement videos
or standalone replayable Playwright traces. Normal/failure videos stay intact.
"""
from pathlib import Path
import json, zipfile, hashlib
root=Path(__file__).resolve().parents[1];out=root/'trace-evidence';out.mkdir(exist_ok=True)
records=[]
for src in sorted(root.rglob('trace.zip')):
    if '.playwright-artifacts' in str(src): continue
    rel=src.relative_to(root);name=hashlib.sha256(str(rel).encode()).hexdigest()[:12]
    dest=out/name;dest.mkdir(exist_ok=True)
    with zipfile.ZipFile(src) as z:
        frames=[];full=[]
        for item in z.infolist():
            p=Path(item.filename)
            if p.suffix in ['.trace','.network','.stacks'] or p.name.startswith('src@'):
                path=dest/p;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(z.read(item));full.append(item.filename)
            if p.suffix=='.trace':
                for line in z.read(item).decode().splitlines():
                    try: event=json.loads(line)
                    except json.JSONDecodeError: continue
                    if event.get('type')=='screencast-frame':frames.append(event)
        frames.sort(key=lambda r:r.get('timestamp',0))
        selected=[];last=-100000
        for i,frame in enumerate(frames):
            stamp=frame.get('timestamp',0)
            if stamp-last>=1000 or i>=len(frames)-8:
                path='resources/'+frame['sha1']
                if path not in z.namelist():continue
                target=dest/path;target.parent.mkdir(exist_ok=True);target.write_bytes(z.read(path));selected.append(frame);last=stamp
        (dest/'frames.json').write_text(json.dumps({'sampling':'one still per second plus final eight frames; timestamps unchanged; no video made','allFrameCount':len(frames),'frames':selected},indent=2)+'\n')
    records.append({'original':str(rel),'originalBytes':src.stat().st_size,'originalSHA256':hashlib.sha256(src.read_bytes()).hexdigest(),'extract':str(dest.relative_to(root)),'completeRecords':full,'screencastOriginal':len(frames),'screencastSelected':len(selected),'reason':'Large embedded duplicate HTTP image bodies and continuous screencast frames omitted from review ZIP; full API events/network metadata/stacks/source/error-context and original failure videos are retained. Original ZIP remains on disk.'})
(out/'index.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'traces':len(records),'originalBytes':sum(r['originalBytes'] for r in records),'extractBytes':sum(p.stat().st_size for p in out.rglob('*') if p.is_file())},indent=2))
