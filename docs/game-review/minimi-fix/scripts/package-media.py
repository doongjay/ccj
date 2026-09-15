"""Copy complete Playwright recordings and extract evidence; never retime or edit footage."""
from pathlib import Path
import hashlib, json, shutil, subprocess

root = Path(__file__).resolve().parents[1]
out = root / 'videos'
out.mkdir(exist_ok=True)
report = json.loads((root / 'logs/flows-final.json').read_text())
tests = []
def walk(suite):
    for spec in suite.get('specs', []):
        tests.append(spec)
    for child in suite.get('suites', []):
        walk(child)
walk(report)
index = []
for obs in sorted((root / 'after/flows').glob('*/observations.json')):
    data = json.loads(obs.read_text())
    ident = data['profile']['id']
    test = next(t for t in tests if ident in t['title'])
    source = Path(next(a['path'] for a in test['tests'][0]['results'][0]['attachments'] if a['name'] == 'video'))
    target = out / (ident + '.webm')
    shutil.copyfile(source, target)
    sha = hashlib.sha256(source.read_bytes()).hexdigest()
    assert hashlib.sha256(target.read_bytes()).hexdigest() == sha
    probe = json.loads(subprocess.check_output(['/opt/homebrew/bin/ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(target)]))
    reaction = next(e for e in data['events'] if e['event'] in ['applause', 'cheer'])
    frames = out / (ident + '-frames')
    frames.mkdir(exist_ok=True)
    samples = []
    for offset in [-.30, .10, .35, .60, .85, 1.10]:
        second = round(reaction['ms'] / 1000 + offset, 3)
        dest = frames / (f'video-{second:.3f}s.png')
        command = ['/opt/homebrew/bin/ffmpeg', '-y', '-v', 'error', '-ss', str(second), '-i', str(target), '-frames:v', '1', str(dest)]
        subprocess.run(command, check=True)
        samples.append({'videoSecond':second, 'png':str(dest.relative_to(root)), 'command':command})
    blink = []
    for i, state in enumerate(data['blink']['states']):
        ms = round(state['at'] - data['blink']['start'])
        source_frame = obs.parent / f'blink-{i}-{ms}ms.png'
        assert source_frame.exists()
        enlarged = frames / f'actual-blink-{i}-{ms}ms-4x.png'
        subprocess.run(['/opt/homebrew/bin/ffmpeg','-y','-v','error','-i',str(source_frame),'-vf','scale=iw*4:ih*4:flags=neighbor',str(enlarged)],check=True)
        blink.append({'state':i, 'elapsedMs':ms, 'native':str(source_frame.relative_to(root)), 'nearest4x':str(enlarged.relative_to(root))})
    index.append({'id':ident,'video':str(target.relative_to(root)),'sourceFinalReporterAttachment':str(source.relative_to(root)), 'originalTemporaryVideoPath':data['video'], 'bytes':target.stat().st_size, 'sha256':sha, 'copyOnly':True,'probe':probe,'eventsTestRelative':data['events'],'sampleFrames':samples,'blinkFrames':blink,'note':'Video PTS samples are independent from test-relative event times; small recording-start offset is possible. Complete recordings preserve every frame, input, wait and transition. No speed, trim, interpolation, re-encoding or failed-section removal.'})
(out/'index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{'id':x['id'],'bytes':x['bytes'],'duration':x['probe']['format']['duration']} for x in index]))
