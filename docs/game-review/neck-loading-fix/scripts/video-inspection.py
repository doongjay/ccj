"""Extract review stills from original video timestamps; never edit a recording."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess
root=Path(__file__).resolve().parents[1];out=root/'after/video-inspection';out.mkdir(exist_ok=True)
records=[]
for item in json.loads((root/'VIDEO_INDEX.json').read_text())['videos']:
    name=Path(item['reviewFile']).stem
    observation=root/'after/flows'/name/'observations.json'
    if not observation.exists():continue
    j=json.loads(observation.read_text());events=j['events']
    marks=[e for e in events if e['event'] in ['booth shutter input','booth result shown','booth result held 5.5 seconds','booth explicit return','applause','cheer','one group photo']]
    if any(e['event']=='applause' for e in marks):
        e=next(e for e in marks if e['event']=='applause');marks.extend([{'event':'applause +160ms','ms':e['ms']+160},{'event':'applause +320ms','ms':e['ms']+320}])
    marks.sort(key=lambda e:e['ms']);panels=[]
    duration=float(item['probe']['format']['duration'])
    for i,e in enumerate(marks):
        # The recording begins just before test started; timestamps are approximate
        # within fixture setup overhead. Original full video remains the timing source.
        offset=-.3 if 'held 5.5 seconds' in e['event'] else .08
        stamp=min(duration-.12,e['ms']/1000+offset);target=out/f'{name}-{i:02}.png'
        subprocess.run(['/opt/homebrew/bin/ffmpeg','-hide_banner','-loglevel','error','-n','-ss',str(stamp),'-i',str(root/item['reviewFile']),'-frames:v','1',str(target)],check=True)
        im=Image.open(target).convert('RGB');tile=Image.new('RGB',(im.width,im.height+30),'#fff9ef');d=ImageDraw.Draw(tile);d.text((5,4),f'{stamp:.2f}s {e["event"]}',fill='black');tile.paste(im,(0,30));panels.append(tile)
        records.append({'video':item['reviewFile'],'still':str(target.relative_to(root)),'seconds':stamp,'event':e['event']})
    cols=3;w=panels[0].width;h=panels[0].height;sheet=Image.new('RGB',(w*cols,h*((len(panels)+cols-1)//cols)),'#fff9ef')
    for i,p in enumerate(panels):sheet.paste(p,((i%cols)*w,(i//cols)*h))
    sheet.save(out/f'{name}-sequence.png')
(out/'index.json').write_text(json.dumps({'note':'Timestamped stills for visual inspection, not a retimed or cut video. Inspect the intact WebM for exact input-to-response timing.','frames':records},ensure_ascii=False,indent=2)+'\n')
