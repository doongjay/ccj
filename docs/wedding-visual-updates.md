# 화면 수정 이미지 기록

## 선택 화면 하늘

- 방식: 내장 `image_gen` 편집
- 원본: `game/public/assets/lacitta/routes/home-background.png`
- 결과: `game/public/assets/lacitta/routes/home-sky.png`

Use case: precise-object-edit. Image 1 is the existing 360 x 640 portrait pixel-art home/transport-selection game background, the edit target. Change ONLY the large blank pale-ivory negative-space backdrop in the upper half, above and behind the car parking platform and subway entrance, including the empty space between their branching paths. Fill that previously blank backdrop with a gentle pale powder-blue sky and a few soft ivory pixel clouds, matching the exact crisp tiny square pixel clusters, delicate muted colors and cozy 16-bit game style. Preserve EVERY foreground object's exact pixel position, size and silhouette: car at upper left, glass subway entrance at upper right, side trees, bushes, flowers, cream branching paths, small teal-roof cottage, fence, gate, lamps and bottom sidewalk. Keep the branch routes and their paving exactly where they are. No new buildings, extra paths, text, people, buttons or UI. Do not recolor the foreground paved paths as sky. Preserve the full portrait aspect and original camera/composition with the complete home and both transport choices visible. Output the full same scene, with only the previously blank upper backdrop changed to pixel blue sky/clouds.

## 신부 대기실 드레스

- 방식: 내장 `image_gen` 편집
- 원본: `game/public/assets/lacitta/pixel-venue/bridal-room.png`
- 결과: `game/public/assets/lacitta/pixel-venue/bridal-room-white.png`

Make a narrowly localized edit to the tiny bride seated on the sofa at the upper right in this exact pixel-art wedding waiting room. Change ONLY her pale peach dress to a visibly fuller PURE WHITE wedding ballgown with soft cool pale-grey folds, a rounded voluminous skirt and a long hem fully covering her feet. Keep her original head, hair, face, pose, bouquet, body location and pixel-art scale. Keep the entire room and architecture, sofa, flowers, floor, perspective, lighting and composition identical. Keep sufficient space on the sofa to the bride's left for a guest. No other people or changes. Exact same portrait aspect ratio, image dimensions 941x1671 preferred. No text.

## 신부 캐릭터 드레스

- 방식: 내장 `image_gen` 편집
- 원본: `game/public/assets/lacitta/characters/npc-bride.png`
- 결과: `game/public/assets/lacitta/characters/npc-bride-white.png`

Edit this exact pixel-art game spritesheet. Only change the bride's dress in all sixteen frames to a fuller, wide bell-shaped PURE WHITE wedding ballgown with delicate pale cool-grey folds, a broad fluffy skirt and a floor-length hem completely covering all feet and shoes. Preserve her exact brown hair, face, skin, veil, bouquet, body position, character size, and original small-pixel aesthetic. CRITICAL spritesheet invariants: exact same 4 columns by 4 rows, same evenly spaced 32x48 cells on a 128x192 transparent canvas, with all 16 separate sprites each centered within its original cell. Preserve directions by row and walk phases by column. Do not move any head or change cell boundaries. The skirt may extend sideways within each cell, and must end where the old feet ended; never cross the cell. Transparent background, no checkerboard, no labels, no new props, no cropping. Output exact 128x192 if possible, otherwise a precise integer multiple with the same grid.

신부 스프라이트 투명 배경 편집:

Remove ALL background pixels from this exact 4x4 bride sprite sheet. Return TRUE ALPHA transparency, not a color, gradient, shadows, or checkerboard. Precisely preserve every one of the sixteen bride sprites and the exact 4-column by 4-row grid positions, white full skirts, faces, hair, bouquets and direction poses. Entire area outside each bride silhouette must be completely transparent. No cast shadows behind or beneath them. Keep all white dress pixels opaque. Keep total canvas 1024x1536 and each cell 256x384 unchanged. This is a production spritesheet, not an illustration displayed on a background.

## 코드 기반 요소

- 주차장: `parkingArt.ts`의 픽셀 그래픽. 기존 180×140 주차 칸과 중앙 이동 경로를 유지합니다.
- 청첩장: 원본 `https://www.heumcard.com/cards/now-2026-11-21`의 공개 페이지/스크립트에서 사진 배경, 세로 DAYS/HOURS/MINUTES/SECONDS, 등장 애니메이션을 확인했습니다. `timer.jpg`와 Galmuri11 글꼴을 사용합니다. 숫자는 실제 예식 시각(2026-11-21 14:00 KST)을 기준으로 매초 갱신합니다.
- 국화: 원본의 `/_next/static/media/attachment_icon.84671ad7.png`를 `game/public/assets/invitation/chrysanthemum.png`에 저장했습니다. 텍스트 왼쪽에 배치해 두 행의 정렬을 유지합니다.
- 배경 하트/반짝임: CSS 도형/애니메이션. 터치를 받지 않으며 동작 줄이기 설정에서는 움직임을 끕니다.

