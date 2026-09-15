from pathlib import Path
import json

root=Path(__file__).resolve().parents[1]
registry=json.loads((root/'after/registry.json').read_text())
observations=json.loads((root/'after/actual-ui.json').read_text())['observations']
before=json.loads((root/'before/actual-ui.json').read_text())['observations']
assert all(a['viewport']==b['viewport'] and a['dpr']==b['dpr'] and a['previewCSS']==b['previewCSS'] and a['profile']==b['profile'] for a,b in zip(observations,before))
lines=['# 실제 ID 및 BEFORE/AFTER 인덱스','','이미지는 픽셀 원본 PNG다. 4×는 nearest-neighbor 검수 확대이며 제품 표시 크기를 바꾸지 않았다. 각 PNG 링크는 새 창에서 원본 크기로 확인할 수 있다. 생성 수만 보고 시각 합격으로 세지 않았다. 실제 확인 범위는 VISUAL_CHECKS.md에 있다.','','## 사용자 3조합 / 동일 조건','','| 선택 | 실제 저장 ID (0부터) |','|---|---|']
profiles=list(dict((x['profile']['id'],x['profile']) for x in observations).values())
for p in profiles:lines.append(f"| {p['id']} | male / face={p['face']} / hair={p['hair']} / outfit={p['outfit']} |")
lines+=['','| 선택 / viewport | 전체 BEFORE → AFTER | 얼굴·목·카라 4× BEFORE → AFTER | 실제 preview CSS |','|---|---|---|---|']
for x in observations:
    ident=x['profile']['id'];v=x['viewport'];stem=f"{ident}-{v['width']}x{v['height']}";b=x['previewCSS']
    lines.append(f"| {ident[:2]} / {v['width']}×{v['height']} | [BEFORE](before/{stem}.png) → [AFTER](after/{stem}.png) | [BEFORE](before/{stem}-face-neck-4x.png) → [AFTER](after/{stem}-face-neck-4x.png) | {b['width']}×{b['height']} / DPR{x['dpr']} |")
lines+=['','전체 조건 Chromium151.0.7922.34 / 열린 눈·reduced-motion / 마우스(1,1). 각 stem의 `-native.png`는128×192 production preview canvas, `-display.png`는 실제 CSS 표시 캡처다. 원 사용자 참고 캡처의 viewport/DPR은 미확인이다.','','첫 얼굴: [실제 BEFORE](before/first-face-thumbnail-393.png) → [실제 AFTER](after/first-face-thumbnail-393.png), [원본4× BEFORE](before/atlas/part-male-face0-4x.png) → [원본4× AFTER](after/atlas/part-male-face0-4x.png).','','## 페이지와 부품 ID','','현재 UI의 3칸 페이지는 얼굴 `[0,1,2]`, 헤어 `[0,1,2]`, 의상 슬라이딩 창 `[0,1,2]` → `[1,2,3]` → `[2,3,4]`으로 순환한다. 번호와 reference의 1부터 세는 열 번호를 혼용하지 않는다.','','| 성별/부품 | ID | 라벨 | native | nearest4× |','|---|---:|---|---|---|']
for p in registry['parts']:
    g,kind,n=p['gender'],p['part'],p['id'];sample=next(x for x in registry['profiles'] if x['gender']==g and x[kind]==n)
    stem=f'part-{g}-{kind}{n}'
    lines.append(f"| {g}/{kind} | {n} | {sample[kind+'Label']} | [1×](after/atlas/{stem}-1x.png) | [4×](after/atlas/{stem}-4x.png) |")
lines+=['','## 정면 idle 전체90조합','','실제 registry: 2성별×3얼굴×3헤어×5의상=90. 아래90개를 생성하고 모두 시각 확인했다. 검수 시 1배6페이지(각15명)와4배30페이지(각3헤어)를 원본 크기로 봤다.','', '| 실제 조합 ID | native128×192 | nearest4×512×768 | 3헤어4×페이지 |','|---|---|---|---|']
for p in registry['profiles']:
    ident=p['id'];page=f"page-{p['gender']}-face{p['face']}-outfit{p['outfit']}"
    lines.append(f'| {ident} | [1×](after/atlas/{ident}-1x.png) | [4×](after/atlas/{ident}-4x.png) | [page](after/atlas/{page}-4x.png) |')
lines+=['','## 실제 플레이와 동작 대표','','| 실제 사용자 조합 | 로비 | 개인 사진 | 신부 사진 | 이어하기 | 반응 | 단체사진 | 영상 |','|---|---|---|---|---|---|---|---|']
for p in profiles:
    ident=p['id'];base=f'after/flows/{ident}'
    lines.append('| '+ident+' | '+' | '.join(f'[{name}]({base}/{file}.png)' for name,file in [('로비','lobby'),('개인','booth-result'),('신부','bridal-result'),('이어하기','restored-notebook'),('반응','reaction'),('단체','group-photo')])+f' | [원속도](videos/{ident}.webm) |')
motion=json.loads((root/'after/motion/index.json').read_text())['index']
lines+=['','11대표×19프레임(정면90 전수와 별도). 페이지는 좌→우, 위→아래: down,left,right,up,posing,seated,down-blink,posing-blink,seated-blink,walk-down0/1,left0/1,right0/1,up0/1,clap0/1.','', '| 대표 | 전체 native | 머리–목 4× | 전체4× |','|---|---|---|---|']
for p in motion:
    ident=p['id'];lines.append(f'| {ident} | [1×](after/motion/{ident}-pose-page-1x.png) | [접합4×](after/motion/{ident}-junction-page-4x.png) | [4×](after/motion/{ident}-pose-page-4x.png) |')
(root/'VISUAL_INDEX.md').write_text('\n'.join(lines)+'\n')
manifest={'generatedIdleCount':90,'visuallyInspectedIdleCount':90,'generatedPartsCount':22,'visuallyInspectedPartsCount':22,'motionRepresentativeCount':len(motion),'motionFramesPerRepresentative':19,'actualPlayProfileCount':3,'actualCustomizerViews':12,'automaticArtQualityOracle':False,'actualPreviewHarnessPixelEquality':12,'beforeAfterSelectionDprCssViewportEqual':True,'idleInspectedPages':[f"after/atlas/page-{g}-face{f}-outfit{o}-4x.png" for g in ['male','female'] for f in range(3) for o in range(5)],'nativeIdlePages':[f"after/inspection-pages/native-{g}-face{f}.png" for g in ['male','female'] for f in range(3)],'motionInspected':[{'native':f"after/motion/{p['id']}-pose-page-1x.png",'junction4x':f"after/motion/{p['id']}-junction-page-4x.png"} for p in motion],'manualAssessment':'Viewed PNG pixels via image viewer, independent from test assertions. 30 final idle pages byte-identical to visually reviewed iteration02 (diagnosis/body-preservation.json). Motion pages rechecked after final source changes; four corrected extra posing frames also viewed individually at4x. Actual screens across12customizer views and3playing routes were viewed. No claim of90complete motion/play journeys.'}
(root/'VISUAL_CHECKS.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('VISUAL_INDEX.md and VISUAL_CHECKS.json written')
