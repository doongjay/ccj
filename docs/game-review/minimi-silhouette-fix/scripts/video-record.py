from pathlib import Path
import json,hashlib,shutil,subprocess
root=Path(__file__).resolve().parents[1];out=root/'videos';out.mkdir(exist_ok=True)
def specs(suites):
 for suite in suites:
  yield from suite.get('specs',[])
  yield from specs(suite.get('suites',[]))
records=[]
for report in ['logs/before-flows.json','logs/capture-final-02.json','logs/preserved-ux-rerun-01.json']:
 j=json.loads((root/report).read_text())
 for spec in specs(j['suites']):
  title=spec['title'];name=None
  if title.startswith('M05 actual '):name=('before-' if 'before-flows' in report else 'after-')+title.split(':')[0].removeprefix('M05 actual ')
  elif title.startswith('separated route '):name='car-'+title.rsplit(' ',1)[-1]
  elif title.startswith('loading policy actual '):name='journey-'+title.split(' ')[3]
  elif title.startswith('first notebook'):name='notebook-hall-three-widths'
  elif title.startswith('Restored station'):name='station-touch-'+title.rsplit(' ',1)[-1]
  if not name:continue
  for test in spec['tests']:
   for result in test['results']:
    for a in result.get('attachments',[]):
     if a.get('contentType')!='video/webm':continue
     src=Path(a['path']);dest=out/(name+'.webm');assert src.is_file(),src
     shutil.copy2(src,dest);h=hashlib.sha256(src.read_bytes()).hexdigest();assert hashlib.sha256(dest.read_bytes()).hexdigest()==h
     probe=json.loads(subprocess.check_output(['/opt/homebrew/bin/ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,avg_frame_rate:format=duration,size','-of','json',str(dest)],text=True))
     records.append({'test':title,'reporter':report,'source':str(src.relative_to(root)),'reviewFile':str(dest.relative_to(root)),'sha256':h,'bytes':src.stat().st_size,'probe':probe,'editing':'none; byte-identical original real-time recording','testResult':result['status']})
(root/'VIDEO_INDEX.json').write_text(json.dumps({'note':'Temporary video paths in observations.json are relocated by Playwright. Final reporter attachment paths and byte-identical readable copies are recorded here. No acceleration, cuts, interpolation or re-encoding.','videos':records},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'videos':len(records),'MiB':round(sum(r['bytes'] for r in records)/1048576,2)},indent=2))
