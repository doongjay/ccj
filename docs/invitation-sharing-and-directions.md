# 교통·색상·공유 썸네일 (2026-09-11)

사용 도구: 내장 image_gen. 이미지 선택·편집 프롬프트와 최종 저장 위치를 아래에 기록합니다.

## 교통과 색상
- 사용자 제공 `map-inner.jpg`를 `game/public/assets/invitation/venue-directions.jpg`로 그대로 저장했습니다. 약도와 네이버 지도 버튼은 모두 `https://naver.me/xAFClJVG`로 연결됩니다.
- 주차 유도선은 파랑 픽셀 하트·분홍 픽셀 세모·노랑 픽셀 X와 동일 계열의 배경/테두리/그림자로 구분합니다. 도형은 네이티브 CSS입니다.
- 신랑측 계좌 카드는 하늘색, 신부측은 분홍색이며 테두리·그림자·복사 버튼도 같은 계열입니다.
- 셔틀은 5번 출구 팻말과 노란 버스를 작은 픽셀 그림으로 다시 만들었습니다. 최종 에셋·알파 처리·여백·불투명도 및 프롬프트는 [최신 촬영/셔틀 기록](final-photo-and-shuttle-art.md)에 있습니다.

## 공유 이미지
- 선택 사진: `game/public/assets/invitation/gallery-01.jpg` (계단에 나란히 앉아 서로 바라보는 사진).
- 링크용: `game/public/assets/invitation/share-pixel-wide-v2.png`, 1774×887, 정확히 2:1.
- 카카오 전용 카드용: `game/public/assets/invitation/share-pixel-square-v2.png`, 1254×1254, 정확히 1:1.
- 얼굴·이름은 중앙에 배치했습니다. 가로 이미지의 중간 정사각형 범위는 x=443.5~1330.5이며, 얼굴과 이름이 이 범위 안에 있습니다. 카카오용은 정사각형 구도에 맞게 같은 그림으로 다시 편집했습니다.
- 시각 검토: `/share-preview.html`에서 240px 카드 폭의 두 형태를 비교합니다. 실제 카카오 앱 캡처가 아닌 비율 확인용 화면임을 명시했습니다.
- 기존 OG 에셋은 보관하고 새 파일명으로 교체해 이미지 URL 캐시를 구분합니다.

## 연결과 남은 배포 설정
- OG/Twitter 태그는 초기 HTML에 있으므로 JavaScript를 실행하지 않는 크롤러도 읽습니다.
- `SITE_URL`을 설정하면 Vite가 빌드 HTML의 canonical, og:url, OG/Twitter 이미지 주소를 절대 주소로 기록합니다. 미설정 로컬 빌드에서는 상대 경로를 보존하며, 개발 서버에서는 실제 로컬 주소를 사용합니다.
- `VITE_KAKAO_JAVASCRIPT_KEY`가 설정되면 카카오 SDK 2.8.3을 무결성 값과 함께 미리 로드한 뒤 전용 전달 버튼을 표시합니다. 초기화에 실패하면 기존 일반 공유는 유지됩니다.
- `sendDefault` 피드에 정사각형 이미지 실제 크기 1254×1254, 제목, 예식 안내, 청첩장 보기 버튼과 `/#invitation` 링크를 전달합니다.
- 키가 없을 때는 기본 공유 또는 주소 복사를 사용합니다. 카카오 채팅방에 실제 메시지를 보내는 테스트는 하지 않았습니다.
- 공개 주소와 카카오 JavaScript 앱 키/도메인 등록이 없으므로 실제 카카오 앱 전송 및 서버 스크랩 확인은 배포 설정 후 필요합니다.

공식 근거: [카카오 공유 JavaScript](https://developers.kakao.com/docs/ko/kakaotalk-share/js-link), [이미지 크기 속성](https://developers.kakao.com/sdk/reference/js/release/Kakao.Share.html), [URL 스크랩 이미지 2:1 안내](https://devtalk.kakao.com/t/topic/140526), [SDK 설치와 도메인 등록](https://developers.kakao.com/docs/ko/javascript/getting-started).

## 내장 image_gen 최종 프롬프트
### 이전 셔틀 추출 시안
```text
Use case: background-extraction.
Edit target: the supplied pixel-art shuttle scene.
Extract ONLY the black/gray subway-exit pylon marked 5 and the yellow shuttle bus, as a compact standalone decorative sticker for the lower-right of a wedding invitation information card. Preserve the recognizable original yellow bus design and pixel-art style. Show the entire bus with its wheels and the full shorter pylon standing just to its left. Keep "5" large and readable on the pylon; small Korean bus lettering may be simplified without adding new text. Remove ALL sky, trees, roads, buildings, overhead road signs, streetlights and surrounding scene. No people. Use a genuinely transparent background with an alpha channel, not a drawn checkerboard. Composition landscape 4:3, objects centered, tight margins.
```
### 가로 공유 그림
```text
Use case: style-transfer.
Edit target and pose reference: the attached wedding photograph of the couple sitting very close together on a light wooden stair, bride on the left in her white gown with translucent sleeves, groom on the right in his black suit, looking affectionately at each other.
Create a finished CUTE PIXEL-ART wedding invitation share thumbnail inspired by this specific photo, keeping their dark hair styles, affectionate eye contact, close seated pose, clothing and white stair framing recognizable. Chibi proportions with round dark eyes, charming polished 16-bit game art, crisp visible pixels, soft ivory walls, sage-green accents and warm wooden steps. A few tiny pixel hearts and white flowers are okay, very uncluttered. Not a pixelated blur filter, actually illustrated pixels.
Output a wide landscape 2:1 image, ideally 1200 x 600 pixels. This will also be CENTER-CROPPED TO A SQUARE: place all essential content (both complete heads, their touching shoulders/arms and title) inside the middle 46% of the width and middle 84% of the height. Couple's upper bodies centered in x=30%-70%, y=32%-88%; attractive background/steps extend to the wide left/right edges, with decorative foliage only on those sides. No essential content near edges.
One short centered title in crisp pixel Korean lettering, exactly "재준 ♥ 현서", in the central safe area above them at y=15%-25%. No other text, date, logo or watermark. Keep their faces large enough to read at a 240px-wide chat preview. Romantic and playful, restrained sage/ivory/peach palette matching our invitation.
```
### 정사각형 공유 그림
```text
Use case: precise-object-edit.
Edit target: attached completed wide pixel-art wedding share image.
Create the matching SQUARE thumbnail version, ideally 800x800, for a KakaoTalk sharing card. Keep EXACTLY the same pixel characters, their seated close pose, clothing, faces, hair, heart, colors and Korean title "재준 ♥ 현서". Reframe/crop the middle square of the existing image, preserving both complete heads, title and their linked arms. Only adjust edge background breathing room slightly if necessary; do not redraw their faces or change any essential art. The white stair arch should frame the couple, subtle white flowers/greenery may remain at the corners. No added words, logos, dates or border. This is a square companion to the wide existing image, not a new illustration.
```

