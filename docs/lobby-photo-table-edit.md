# 로비 포토월에 등록 사진 표시

- 현재 배경은 원본 `lobby.png`이며 세 프레임의 위치·크기·테두리를 유지합니다.
- `src/data/photoGallery.ts`의 `PHOTO_GALLERY`에서 사진을 로드하고 `src/scenes/lobbyPhotoWall.ts`가 각 화면 안에 첫 세 사진을 그립니다. 팝업도 같은 목록을 사용합니다.
- 등록 파일/경로가 바뀌면 다음 로드부터 새 사진이 두 곳에 함께 반영됩니다. 가로·세로 사진 전체가 들어가며 남는 공간은 크림색으로 채웁니다.
- 사진 업로드 서버는 추가하지 않았습니다. 프로젝트에 등록된 목록/파일을 교체하는 방식입니다.
- 아래 하트 시안과 `lobby-no-posters.png`는 현재 사용하지 않습니다.

## 이전 하트 시안 기록

- 도구: 내장 `image_gen` 편집
- 편집 원본: `game/public/assets/lacitta/pixel-venue/lobby.png`
- 저장 결과: `game/public/assets/lacitta/pixel-venue/lobby-heart-panels.png`
- 적용: 기존 포토월 세 개의 프레임·화면·크기·위치를 유지하고, 각 파란 화면 속 인물 그림만 픽셀 하트 하나로 교체합니다. 하트는 각 화면 안에 그려지며, 포토테이블 팝업에는 기존 커플 사진 세 장이 표시됩니다.

## 최종 프롬프트

Use case: precise-object-edit. Asset type: existing wedding RPG lobby background. Image 1 is the ORIGINAL EDIT TARGET with three upright portrait display panels. Preserve this entire 941x1671 portrait image and all architecture, furniture and pixel-art texture exactly. EDIT ONLY THE PICTURE CONTENTS INSIDE THE THREE TALL BEIGE/GOLD FRAMED PHOTO-WALL SCREENS at upper right (approximately x650..784, y305..488). ALL THREE PHYSICAL FRAMES / UPRIGHT DISPLAY STRUCTURES MUST STAY: identical count, outer silhouette, beige/gold borders, rectangular panels, position, dimensions, angle, perspective, feet, and floral bases as the original. Inside EACH of those THREE frames, erase the dark person silhouette and the blue round balloon/head entirely, retaining the same pale-to-medium blue picture background. Replace the erased subject with ONE simple centered dusty-pink PIXEL HEART with stepped square edges and subtle dark rose pixel outline, matching the existing retro game pixel-art style. Exactly three hearts total, ONE HEART PRINTED INSIDE EACH SCREEN, fitted within each inner blue panel with generous blue margin, perspective-aligned to its panel. The hearts are flat picture content, NOT floating outside the screens and NOT replacing the physical screens. Preserve the three framed photo-wall panels in full. Do not erase or move a single frame. Keep small tabletop frames, the photo-table cabinet, flowers, reception desk, escalator, ATM, shelves, doors, photobooth, seats, drinks, flooring, bottom entrance and every other element unchanged. No additional text, people, panels, props, floating hearts or UI. Return the complete original lobby background with only the three inner illustrations changed from people to pixel hearts.
