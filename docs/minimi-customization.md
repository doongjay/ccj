# 미니미 원형 복원과 의상 5종 (2026-09-11)

사용 도구: 내장 image_gen. 기존 원본 머리 그림으로 복원하고 새 의상만 생성했습니다.

- 원형: `game/public/assets/lacitta/characters/minimi-hair.png`. 메이플식 새 얼굴·헤어 아틀라스는 로드하지 않습니다.
- 첨부한 이전 화면의 분홍 패널·큰 미리보기·격자 카드를 사용합니다. 얼굴과 헤어는 **각각 분리된 3개 썸네일**을 직접 터치합니다. 의상은 5종 중 **항상 3벌만 표시**하며 좌우 화살표로 한 칸씩 넘깁니다. 다른 의상을 살펴보는 동안 현재 선택은 유지합니다.
- 남성·여성 버튼 높이는 52px로 맞췄고, 시작하기는 설정 패널 바깥의 독립된 칸에 배치했습니다. 이름 라벨은 “내 이름은”입니다. 같은 form 안에 있어 이름 검증과 제출 동작은 유지합니다.
- `classicMinimi.ts`는 **완성본의 원래 얼굴 윤곽선을 보존**하고 턱을 공통 목 위치에 맞춥니다. 얼굴 선택 썸네일에만 별도 얼굴 윤곽·목이 들어가지 않도록 눈·입 부분만 사용합니다. 헤어 썸네일에는 얼굴·목을 넣지 않습니다. 의상은 공통 목을 가로지르지 않게 어깨의 외곽선을 보강합니다.
- `minimiParts.ts`는 코디별 옷깃과 여섯 포즈를 같은 목·발 위치에 맞춥니다. 눈 깜박임은 의상을 바꾸지 않습니다.
- 의상 인덱스 0~2는 기존 의상, 3~4는 새 의상입니다. 저장된 4·5번째 코디도 게임·청첩장·방명록에서 유지됩니다.
- 남자 추가: 네이비 수트, 버건디 니트 조끼. 여자 추가: 핑크 원피스, 라벤더 트위드.
- 최종 저장: `game/public/assets/lacitta/characters/extra-outfits-male.png`, `game/public/assets/lacitta/characters/extra-outfits-female.png`. 녹색 매트를 Canvas 합성 과정에서 알파로 제거하고 실제 2열×6행의 경계·옷깃 중심으로 등록합니다.

## 남자 추가 의상
```text
Use case: stylized-concept. Asset type: modular clothing-only sprite atlas for our existing pixel wedding guests.
Use the supplied full character sheet ONLY as a reference for the clothing/body pixel style and proportions. Generate TWO NEW outfits as independent BODY/CLOTHING parts, with arms/hands, legs and shoes, but ABSOLUTELY NO HEAD, HAIR, FACE or NECK extending above the neckline. Neck opening is transparent and will be filled by the shared game neck.
Exactly TWO COLUMNS and SIX ROWS on a 1024x1536 canvas. Each 512x256 cell contains one headless outfit; all 12 cells equal sized, no grid lines. In each cell, the neckline is at x=256, y=25; feet end at y=235. Clothes body has the same small slim chibi proportions as the supplied body from collar to shoes, about 95-130 pixels wide and 210 pixels tall. Neckline anchor x=256 stays identical in EVERY CELL and every pose. Large transparent margin between cells; no touching neighboring cells.
Rows, top to bottom: 1 front standing with arms down; 2 walking facing LEFT; 3 walking facing RIGHT; 4 back view walking away; 5 front posing with a small peace-sign hand beside shoulder, hand NOT above neckline; 6 front SEATED with knees together and hands in lap, no chair.
Crisp coherent visible pixel clusters and stepped dark outlines, no blurry render, not photorealistic. Warm skin #ffcea2 on hands. Every outfit must have a shallow neckline that connects cleanly with a separate 12px-wide neck when rendered at 128x192. Do not invent head-shaped skin patches or floating anatomy. Genuine transparent alpha background, not checkerboard or solid black. No labels, text, numbers or ground shadows.
Column 1: elegant NAVY SUIT with white shirt, muted sky-blue tie, matching navy trousers, black shoes. Column 2: BURGUNDY KNIT VEST over a pale-blue long-sleeve shirt, charcoal trousers and dark brown loafers. Keep these two outfit identities consistent in all six poses.
```

## 여자 추가 의상
```text
Use case: stylized-concept. Asset type: modular clothing-only sprite atlas for our existing pixel wedding guests.
Use the supplied full character sheet ONLY as a reference for the clothing/body pixel style and proportions. Generate TWO NEW outfits as independent BODY/CLOTHING parts, with arms/hands, legs and shoes, but ABSOLUTELY NO HEAD, HAIR, FACE or NECK extending above the neckline. Neck opening is transparent and will be filled by the shared game neck.
Exactly TWO COLUMNS and SIX ROWS on a 1024x1536 canvas. Each 512x256 cell contains one headless outfit; all 12 cells equal sized, no grid lines. In each cell, the neckline is at x=256, y=25; feet end at y=235. Clothes body has the same small slim chibi proportions as the supplied body from collar to shoes, about 95-130 pixels wide and 210 pixels tall. Neckline anchor x=256 stays identical in EVERY CELL and every pose. Large transparent margin between cells; no touching neighboring cells.
Rows, top to bottom: 1 front standing with arms down; 2 walking facing LEFT; 3 walking facing RIGHT; 4 back view walking away; 5 front posing with a small peace-sign hand beside shoulder, hand NOT above neckline; 6 front SEATED with knees together and hands in lap, no chair.
Crisp coherent visible pixel clusters and stepped dark outlines, no blurry render, not photorealistic. Warm skin #ffcea2 on hands. Every outfit must have a shallow neckline that connects cleanly with a separate 12px-wide neck when rendered at 128x192. Do not invent head-shaped skin patches or floating anatomy. Genuine transparent alpha background, not checkerboard or solid black. No labels, text, numbers or ground shadows.
Column 1: DUSTY PINK MIDI DRESS with modest round neckline, long sleeves and a flowing softly pleated skirt, dark rose low shoes. Column 2: SOFT LAVENDER TWEED SHORT JACKET over a dark navy top and NAVY PLEATED SKIRT, dark shoes. These are guest outfits, no bridal white gown. Keep these two outfit identities consistent in all six poses.
```

## 최종 매트 편집 (남녀 동일 지시)
```text
Use case: precise-object-edit. Edit target supplied image. Replace ONLY every gray checkerboard background pixel with a perfectly flat uniform vivid chroma green #00ff00. No checker pattern, noise, grain, shadow or vignette in background. Preserve foreground art precisely including all pixel outlines, colors, geometry, positions, all twelve headless outfits in the identical two-column six-row sprite atlas layout and identical poses. Preserve image dimensions and all existing padding. Do not add anything, do not alter clothing colors or sprite scale. Output solid green matte, not fake transparency.
```
