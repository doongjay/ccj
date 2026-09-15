# 이번 요청의 아트 변경

도구: built-in `image_gen` (CLI/API 별도 사용 없음). 사용자가 요청한 유도선, 여성 5번 재킷 회색, 남녀 6번 의상만 반영했다. 기존 D 마스터 PNG는 그대로 보존했다. 출력 PNG는 프로젝트 `game/artwork/sources/assets/lacitta/`에 복사했다. WebP는 lossless/exact/method=6이며 원본과 디코딩 RGBA가 동일함을 검사했다.

| 결과 | 마스터 | 실제 사용 |
|---|---|---|
| 교차 없는 3색 유도선 | `routes/car-guidance-separated.png` | 기존 URL `optimized/lacitta-routes-car-guidance-v2.webp`의 새 내용, 실제 차량 좌표도 변경 |
| 여성 5번 회색 트위드 | `characters/extra-outfits-female-gray.png` | `optimized/lacitta-characters-extra-outfits-female-gray.webp`의 오른쪽 열만 사용. 여성 4번은 원본 `extra-outfits-female`을 계속 사용 |
| 남녀 6번 | `characters/sixth-outfits.png` | `optimized/lacitta-characters-sixth-outfits.webp`, 왼쪽 남성/오른쪽 여성 |

기존 `car-guidance-v2.png`, `extra-outfits-female.png`, 남성 원본 의상, 얼굴/머리 원본은 수정하지 않았다. 이전 shipping WebP도 `before/assets/`에 보존했다. 원본 목의 문제가 없는 기준이라고 가정하지 않았으며 공통 목과 옷의 합성 경계는 별도로 검사·수정했다.

생성 원본 폴더: `/Users/user/.codex/generated_images/01a09129-9bc6-7cf0-b317-4ba15101dbfd/`.

## 프롬프트 — 유도선

Use case: precise-object-edit. Edit this exact vertical pixel-wedding game background, preserving every building, LACITTA sign, tree, pavement, car, road geometry, composition and pixel-art color/texture. Change ONLY the three painted colored road guidance lines. Remove all existing yellow/pink/blue line marks including detached arrow fragments first, restore asphalt in their old locations, then draw exactly THREE single continuous separated paths with one arrow at each end. Bottom starting positions left-to-right MUST be yellow at x=28% width, pink at x=47% width, blue at x=66% width. Yellow goes up the LEFT lane and bends left at y=62% image height to exit the left edge at y=61%, yellow arrow points left. Pink goes up the CENTER lane, gently bending toward x=40% width y=58%, then ends with left-pointing arrow at x=34% width,y=55%, leading toward the tower parking on the left. Yellow and pink NEVER CROSS or overlap anywhere, including arrowheads. Blue is a SINGLE UNBROKEN line from bottom-right start (66%,100%), going up (63%,72%), then (60%,62%), smoothly bending RIGHT through (65%,57%), ending at (79%,53%) with an arrow pointing upper-right INTO THE RIGHT driveway. Absolutely no second disconnected blue segment. Keep at least 5% of image width clear between different color paths including arrowheads. Lines should be same simple flat pixel-painted thickness as original, no new glow/shadow/labels/objects. Output same portrait aspect ratio and preserve the original detailed background exactly, no overall redesign.

출력: `exec-9de96c41-a0e4-4115-8860-12e96dca6187.png`.

## 프롬프트 — 여성 회색 재킷

Use case precise-object-edit. This is a production pixel game sprite atlas 1024x1536. Change ONLY the lavender/purple tweed JACKET fabric in the RIGHT COLUMN in ALL SIX POSES to neutral GRAY tweed. Keep highlights light gray, midtones medium gray, outlines charcoal; no lavender/purple tint left. Keep every position, outline, pixel texture, hands, skirt, shoes, gold buttons, skin, and ALL LEFT COLUMN pink dress poses EXACTLY unchanged. Keep solid chroma green background, exact dimensions and atlas layout, no extra elements. Do not alter any neckline geometry, garment silhouettes or collar/stitch details. Color replacement only.

출력: `exec-8e2434b4-946c-4638-aa30-9a0dbd13b66d.png`. 생성 도구가 왼쪽 열에도 미세한 차이를 만들 수 있으므로, 실제 합성기는 오른쪽 회색 재킷만 사용한다. 왼쪽 분홍 원피스는 기존 아틀라스로 유지했다.

## 프롬프트 — 6번 의상

Create one additional clothing sprite sheet for this exact pixel wedding game matching the provided source sheets. These are style/layout references. Output 1024x1536, TWO columns, SIX rows. Left column ONE consistent new male outfit: charcoal checked single-breasted blazer, cream open-neck shirt, warm tan trousers, dark brown loafers. Right column ONE consistent new female outfit: dark navy belted wrap dress with long sleeves, modest V neck and below-knee skirt, dark shoes. Headless figures, NO head, NO hair, NO neck above collar, only garment with hands and legs. Solid bright chroma green #00ff00 background, no shadows or text. Crisp pixel art matching size/detail of references. EXACT positions/poses: column centers x=304 and720. Row1 front still collar y80 feet260; Row2 left walk collar310 feet485; Row3 right walk collar545 feet738; Row4 back still collar790 feet995; Row5 front peace sign with arm raised on character's right / viewer's LEFT, collar1055 feet1246 (left male) and viewer's RIGHT for right female; Row6 seated hands in lap collar1300 feet1480. Maintain matching neck opening centered on each body, clean symmetric collar and no stray isolated pixels. Preserve same body proportions/foot anchors as reference and do not include any heads.

출력: `exec-69ad01be-bf0b-489f-a5ef-4cf2dda84aab.png`. 새 원피스의 목 내부 상단 chroma 잔여 경계는 합성 시 피부 개구부 안에서만 지웠다. V자 원단 테두리는 보존했다.
