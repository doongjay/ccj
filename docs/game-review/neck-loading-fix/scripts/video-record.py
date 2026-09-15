"""Copy original recordings byte-for-byte; probe timing without re-encoding."""
from pathlib import Path
import json, hashlib, shutil, subprocess
root=Path(__file__).resolve().parents[1]
report=root/'logs/capture-1789392554477.json'
j=json.loads(report.read_text());out=root/'videos';out.mkdir(exist_ok=True)
def specs(suites):
    for suite in suites:
        yield from suite.get('specs',[])
        yield from specs(suite.get('suites',[]))
records=[]
for spec in specs(j['suites']):
    for test in spec['tests']:
        for result in test['results']:
            for a in result.get('attachments',[]):
                if a.get('contentType')!='video/webm': continue
                src=Path(a['path']);assert src.is_file(),src
                title=spec['title']
                if title.startswith('M05 actual '): name=title.split(':')[0].removeprefix('M05 actual ')
                elif title.startswith('separated route '): name='car-'+title.rsplit(' ',1)[-1]
                elif title.startswith('loading policy actual '): name='journey-'+title.split(' ')[3]
                elif title.startswith('first notebook'): name='notebook-and-hall-three-widths'
                else: name='setup-six-outfits-three-widths'
                dest=out/(name+'.webm');shutil.copy2(src,dest)
                digest=hashlib.sha256(src.read_bytes()).hexdigest();assert hashlib.sha256(dest.read_bytes()).hexdigest()==digest
                probe=json.loads(subprocess.check_output(['/opt/homebrew/bin/ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,avg_frame_rate:format=duration,size','-of','json',str(dest)],text=True))
                records.append({'test':title,'reporter':str(report.relative_to(root)),'source':str(src.relative_to(root)),'reviewFile':str(dest.relative_to(root)),'sha256':digest,'bytes':src.stat().st_size,'probe':probe,'editing':'none; original real-time WebM copied byte-for-byte','testResult':result['status']})
(root/'VIDEO_INDEX.json').write_text(json.dumps({'note':'Playwright moves temporary page video paths after context closure. The reporter attachment paths here are the final files; observations.json retains its original temporary path. No recording is accelerated, interpolated, cut, or re-encoded.','videos':records},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'videos':len(records),'bytes':sum(r['bytes'] for r in records),'durations':[r['probe']['format']['duration'] for r in records]},indent=2))
