# 원판 촬영 배경과 집/주차 진입 배경 (2026-09-11)

사용 도구: 내장 image_gen. 원래 파일은 보관하고 새 버전 파일을 사용합니다.

## 최종 적용 범위
- **메인 첫 화면과 일반 예식 장면의 배경은 변경하지 않습니다.** `IntroScene` 배경은 그대로이며 `venue-hall`은 기존 `hall.png`를 사용합니다.
- `game/public/assets/lacitta/pixel-venue/group-photo-stage-v4.png`: 사용자 제공 `다운로드 (21).jpeg`의 건축을 따른 정면 단상. 중앙 흰 계단, 양옆 회색 계단, 금색 아치와 흰 꽃 기둥을 유지했습니다. 청첩장 단체사진에 사용합니다. 게임은 같은 건축을 세로로 그린 전경을 사용합니다.
- 맨 위에 조금 보이는 스크린 가장자리 4%는 CSS 배경 뷰포트에서 잘라냅니다.
- `hall-v2.png`는 이전 시안입니다. 최종 게임 촬영은 `group-photo-portrait-v3.png` 한 장을 사용합니다. [최종 세로 촬영 프롬프트](final-photo-and-shuttle-art.md)를 참고하세요.
- 이전 일반 갈색 단상 시안(v2), 첫 금색 아치 시안(v3)은 원본 기록으로 보관합니다.
- 등록 순서대로 30명씩 네 줄로 표시하며, 실제 계단의 낮은 높이에 맞춰 미니미를 아래쪽에 밀집 배치합니다. 하객보다 신랑신부를 크게 표시하고 두 사람을 붙입니다.
- `game/public/assets/lacitta/routes/home-ground-v2.png`: 하늘은 위쪽 수평선 너머에만 있고, 차/지하철 사이의 지면은 벽돌 바닥으로 연결합니다. 집과 갈림길의 위치는 보존합니다.

## 내장 image_gen 프롬프트
### 최종 정면 단상
```text
Use case: style-transfer.
Edit target: the supplied frontal photograph of the actual wedding stage.
Reproduce THIS EXACT ARCHITECTURE, CAMERA FRAMING AND STEP GEOMETRY as a clean, cute, polished 16-bit pixel-art game background, landscape 4:3. Preserve the real photo's positions and proportions: beige stone upper wall beam; ivory pleated curtains; three nested delicate gold round arch frames in the center; very tall asymmetric white flower and green foliage pillars on both sides; smaller white flowers along the back of the platform; gray carpeted steps spanning the entire width in the lower quarter; the distinct narrow white central staircase in front aligned to the straight white aisle, with exactly the same perspective, number of visible stair treads and placement as the supplied photo. The white staircase is NOT a full-width white stage: gray steps remain visible on each side. Do not turn the gray steps into generic brown bleachers. Show the floor/stair edges clearly and keep the top flower arches unobscured. Preserve the frontal symmetric perspective. No people, avatars, microphone stands, text, signs, UI or logos. Render the photo itself in crisp rectangular pixel blocks with restrained sage greenery, warm ivory, gold and neutral gray; no watercolor blur or photoreal patches. This asset will be shared by a 4:3 invitation group-photo and the center of a portrait game's group-photo screen.
```
### 이전 세로 전경 시안 (최종 버전은 위 링크)
```text
Use case: style-transfer.
Input 1 is the reference for the tall wedding hall: its very high ceiling, layered crystal chandeliers, a giant filmstrip-border cinema screen above the stage, warm beige stone walls, tall ivory curtains, floral banquet tables and gold chairs.
Input 2 is the EXACT frontal stage architecture that must appear at the far end: lush tall white-flower/greenery pillars, nested thin gold arches over the ivory curtain, gray carpeted full-width steps and the distinct narrow white central staircase continuing into a white aisle.
Create a polished crisp 16-bit PIXEL-ART portrait wedding-game background in a tall 9:16 format, 720x1280 target composition. Use a centered frontal camera from the aisle rather than the side camera of input 1, so the stage and its real central stairs are clearly recognizable and align symmetrically with the aisle. Top 0-18%: high ceiling and hanging chandeliers. At x15%-85%, y18%-39%: large cinema screen with a filmstrip frame, screen content plain softly lit sage/ivory with a small heart, no photos and NO TEXT. Middle y40%-66%: the exact white-flower arches and gray/white stage stairs of input 2, with unobstructed center staircase. Bottom y66%-100%: the white aisle leading toward the stage, gold chairs and flower-filled banquet tables flanking both sides; leave the center aisle clear for characters/UI. Calm romantic ivory, warm gold, sage greenery, gray-carpet palette. Remove every real person and silhouette from input 1. No people, avatars, microphones, branding, lettering, UI or watermark. Do not invent generic bleachers or replace the white central steps with brown platforms.
```
### 갈림길 바닥
```text
Use case: precise-object-edit.
Edit target: the supplied pixel-art home/route-choice background.
Fix ONLY the physically impossible sky extending down into the ground between the forked paths. Preserve the house, car, subway entrance, trees, flowers, Y-shaped cream paving paths and their positions exactly, and preserve the original 9:16 portrait framing and pixel style.
The sky should occupy ONLY the upper distance, above a natural low horizon at around y=27% of the image (behind the car and subway entrance). Below that horizon, the open area between the two paths must be a continuous light warm brick-paved plaza, using the same cream/tan bricks as the lower paths, with perspective: small compressed brick rows near the horizon and progressively larger bricks toward the Y-junction. The large triangle that is currently blue sky with clouds below the car/subway must become solid walkable BRICK GROUND, not water, grass, a wall, a hole or sky. Blend the new brick plaza seamlessly into both branch paths and central Y-junction. Keep blue sky and fluffy clouds ONLY above the distant low shrubs/horizon, where a real sky belongs. No new text, UI or people. Do not change the house, car, subway structure or route geometry.
```
### 주차 유도선
```text
Use case: precise-object-edit.
Edit target: attached LACITTA car-route pixel illustration.
Correct the three painted guidance routes while preserving the building, readable LACITTA sign, left multistory parking tower with cars, right underground entrance, road dimensions, parked cars, greenery, exact camera framing and all unaffected details.
PINK ROUTE: The existing yellow line on the LEFT, which goes from the bottom toward the parking tower on the left, MUST become PINK along its whole length and arrowhead. Pink clearly turns into the visible LEFT PARKING TOWER entrance.
BLUE ROUTE: preserve the existing blue line heading toward the RIGHT underground garage, unchanged.
YELLOW ROUTE: the existing straight PINK CENTER line MUST be removed from that position and replaced by a new YELLOW route. Start this yellow route near the bottom center (same general middle lane), then turn/peel off to the LEFT edge of the picture BEFORE reaching the tower, at around y=65%-70%. It should continue visibly OUT OF THE FRAME toward an unseen different parking area. Create a modest paved side-road opening to the left at that height as needed; the yellow arrow points left out of frame. Do NOT let yellow point at the visible parking tower or central front door. No arrows pointing into walls or parked cars. Exactly three routes, pink to left tower, blue to right basement, yellow out of view to the left. Make the line intersections readable. Pixel-art stepping on painted curves, no gradients on lines. Keep all other original art unchanged.
```
### 최종 주차 진입 배경
`game/public/assets/lacitta/routes/car-guidance-v2.png`: 분홍색은 왼쪽 주차타워, 파란색은 오른쪽 지하 주차장, 노란색은 왼쪽 화면 밖으로 이어집니다. [마지막 도로 진출부 보완 프롬프트](final-photo-and-shuttle-art.md).

