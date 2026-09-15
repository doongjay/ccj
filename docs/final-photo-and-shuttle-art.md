# 최종 촬영 배경과 셔틀 그림 (2026-09-11)

사용 도구: 내장 image_gen. 최종 저장 경로와 생성·편집 프롬프트입니다.

추가 기록: [미니미 원형 복원·의상 5종](minimi-customization.md), [공유 썸네일과 교통 안내](invitation-sharing-and-directions.md), [정면 단상·갈림길·주차 배경](group-stage-and-route-prompts.md).

검증: 프로덕션 빌드 통과. 최종 모바일/여정 검증 22개 통과(320·393px, 신랑·신부 자차 여정, 지하철 출구 재선택, 선택지 너비, 미니미 유지, 갤러리·교통·방명록). 별도 스프라이트 검증에서 남녀 5벌×3헤어×9포즈의 목 연결과 깜박임을 확인했고, 100명 페이지 탐색 및 촬영 대사와 하객이 겹치지 않는 것도 통과했습니다.

- `game/public/assets/lacitta/pixel-venue/group-photo-portrait-v3.png`: 게임 원판 촬영 전용. 샹들리에·스크린·꽃 단상·계단·통로가 이어진 한 장으로 다른 사진을 덧붙이지 않습니다. 말풍선과 촬영 버튼은 스크린 쪽에 있어 하객 얼굴을 가리지 않습니다. 메인 첫 화면과 일반 예식 배경은 유지합니다.
- 청첩장 원판은 `group-photo-stage-v4.png`의 실제 정면 단상 구도를 유지하고 위 4%만 잘라 스크린 가장자리를 숨깁니다.
- `game/public/assets/invitation/shuttle-pixel-matte.png`: 큰 5번 출구 표지와 노란 버스. `shuttleDecoration.ts`가 녹색을 알파로 처리하고 여백을 잘라 112px Canvas로 그립니다. 불투명도 .85·채도 .72입니다.
- 모든 이야기 선택지의 너비는 게임 화면의 80%로 같으며, 5개 출구 버튼도 간격을 줄여 표지 아래에 세로로 놓습니다.

## 세로 촬영 배경
```text
Use case: stylized-concept. Draw one seamless portrait pixel-art wedding hall game background at 9:16, 960x1706 approximately. Reference 1 is the real architecture and perspective, reference 2 the existing pixel art style and chandeliers / filmstrip cinema screen. Rebuild as ONE coherent image from a centered camera looking straight toward the altar; no collage seams or pasted horizontal panels. Warm ivory walls, high ceiling crystal chandeliers above, centered large cinema screen with dark filmstrip border and pale sage empty interior for game dialogue, realistic horizontal beam directly below screen, floor-to-ceiling curtains behind a gold concentric arch surrounded by asymmetric lush white floral pillars and trees. Wide gray stone altar steps with a narrow white central stair runner, then reflective white aisle bordered by long flower/candle tables and gold chairs. Composition target: chandeliers at y0-19%; screen y20-39%; wall beam y39-43%; floral altar y43-65%; gray stage and four generously spaced steps y65-80% spanning almost full image width for a group of tiny sprites; short aisle bottom20%. Keep perspective coherent, side walls taper smoothly toward altar with normal architectural joints; avoid huge empty wall margins, floating architecture or abrupt texture changes. Pixel art matches second reference but slightly simpler clean deliberate pixels. The screen has ONLY pale sage and subtle corner flowers, NO text. Empty hall: no people, avatars, speakers, microphone, HUD, dialog, UI, watermarks. This is only a game group-photo backdrop.
```

## 셔틀 픽셀화
```text
Use case: style-transfer.
Edit target/reference: the supplied detailed yellow shuttle bus and Exit 5 pylon cutout.
Redraw this as a VERY SMALL, SIMPLE CHIBI 16-bit RPG PROP SPRITE, matching the visual granularity of tiny wedding minimi characters. It must look like native 96x64 pixel art enlarged with NEAREST NEIGHBOR scaling: large obvious square pixels, solid color clusters, only around 12 flat colors, single stepped dark outline. No texture, dithering, tiny photoreal details, gradients, small letters or thin smooth lines.
A squat bright mustard-YELLOW SHUTTLE BUS on the right with two dark wheels, 3 large blue-gray window rectangles, simple black door, and a tiny roof unit. On the LEFT, a short charcoal/ivory subway exit post with one VERY LARGE clearly readable gold pixel numeral "5". Pylon and bus side by side, feet/wheels aligned. Only the numeral "5" is text, remove every other letter. Keep the bus and exit post recognizable but turn the detailed source into toy-like cute low-resolution pixel shapes. Compact landscape 3:2 composition, tight transparent margins no more than 3% on any side. Genuine transparent alpha background, not a painted checkerboard. This will display about 105px wide in an ivory/sage wedding invitation. Do not reduce opacity in the bitmap; solid readable colors.
```

## 셔틀 최종 매트
```text
Use case: precise-object-edit. Edit target supplied image. Replace ONLY every gray checkerboard background pixel with a perfectly flat uniform vivid chroma green #00ff00. No checker pattern, noise, grain, shadow or vignette in background. Preserve foreground art precisely including all pixel outlines, colors, geometry, positions, the giant yellow 5 on the exit sign and yellow bus. Preserve image dimensions and all existing padding. Do not add anything, do not alter clothing colors or sprite scale. Output solid green matte, not fake transparency.
```

## 주차 노란 유도선 최종 보완
저장: `game/public/assets/lacitta/routes/car-guidance-v2.png`.
```text
Use case: precise-object-edit.
Edit target: attached corrected car-route pixel artwork.
One final correction ONLY at the LEFT END of the YELLOW route: currently its arrow stops at the left curb beside the orange parked car. Make a real paved side-road opening at this position, y=62%-69% of image, and continue the yellow line all the way OUT OF THE LEFT EDGE of the image, with an arrow pointing left out of view. Remove the small portion of curb, planting and the orange parked car that blocks this new side-road mouth as necessary. The continuous yellow curve must clearly lead to an unseen parking area outside the picture. Preserve the rest of the yellow line, all pink and blue route lines, all building/tower/garage architecture, LACITTA sign, other parked cars, dimensions, framing and pixel style unchanged. Do not move the tower or make the yellow line turn into it. Leave the pink tower route and blue basement route exactly as supplied.
```
