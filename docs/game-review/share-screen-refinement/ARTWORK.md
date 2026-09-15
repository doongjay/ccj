# 공유 썸네일 픽셀 스타일 편집 — 2026-09-16

- 도구: built-in `image_gen.imagegen` (imagegen skill). CLI/API fallback 미사용.
- 요청: 기존 신랑신부 공유 그림 구도는 유지하고 더 또렷한 도트 스타일로 변경.
- 입력: 기존 share-pixel-{wide,square}-v2.png. 기존 파일은 `game/artwork/sources/share-pixel-v2/`에 바이트 그대로 보존.
- 출력: `game/artwork/sources/share-pixel-v3/`와 `game/public/assets/invitation/share-pixel-{wide,square}-v3.png`. 원본 생성 결과를 재압축/리사이즈 없이 복사.
- 실제 생성 크기는 참조와 같은 1774×887 / 1254×1254. 프롬프트의 정확한 논리 해상도는 출력에 그대로 적용되지 않았으므로 정수 확대된 256px 원본이라고 주장하지 않는다.
- 시각 확인: 두 사람의 위치·복장·계단·이름 유지, 눈/머리/옷의 더 굵은 픽셀 외곽, 두 공유 비율. 게임 미니미/원본 웨딩 사진은 이 편집의 대상이 아님.

## 최종 프롬프트

### wide

Use case: style-transfer. Edit the supplied wedding illustration into unmistakably crisp, coarse 16-bit pixel art for a wedding-game link thumbnail. Preserve the same Korean bride on the left and groom on the right seated together on the stairs, their loving pose, black suit, white wedding dress, cream architecture, muted green foliage, flowers, small pink hearts, and the exact top text '재준 ♥ 현서'. Preserve the layout and subject identity from this illustration. Every contour and detail should use a visibly consistent square pixel grid, flat limited-palette colour clusters, hard stair-step edges. Eliminate soft airbrushed gradients, blur, glossy eyes, painterly textures and anti-aliasing. No new objects, decorations or captions. Do not include the date or location inside the art; those are HTML below the thumbnail. Keep the pink hearts flat and solid. Retain the wide 2:1 composition. Target a 256×128 logical pixel grid enlarged exactly 6× with nearest-neighbour pixels to 1536×768. The couple and top text must be legible at small share-card size.

### square

Use case: style-transfer. Edit the supplied wedding illustration into unmistakably crisp, coarse 16-bit pixel art for a wedding-game link thumbnail. Preserve the same Korean bride on the left and groom on the right seated together on the stairs, their loving pose, black suit, white wedding dress, cream architecture, muted green foliage, flowers, small pink hearts, and the exact top text '재준 ♥ 현서'. Preserve the layout and subject identity from this illustration. Every contour and detail should use a visibly consistent square pixel grid, flat limited-palette colour clusters, hard stair-step edges. Eliminate soft airbrushed gradients, blur, glossy eyes, painterly textures and anti-aliasing. No new objects, decorations or captions. Do not include the date or location inside the art; those are HTML below the thumbnail. Keep the pink hearts flat and solid. Retain the square 1:1 composition. Target a 256×256 logical pixel grid enlarged exactly 4× with nearest-neighbour pixels to 1024×1024. The couple and top text must be legible at small share-card size.
