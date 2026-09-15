# game

이재준 ♥ 김현서 결혼식 게임형 청첩장 — Vite + TypeScript + Phaser 4.

## 설치

```bash
npm ci
```

## 로컬 실행

```bash
npm run dev -- --host 127.0.0.1
```

같은 네트워크의 스마트폰에서 확인할 때는 PC의 LAN IP로 host를 열어 실행합니다.

```bash
npm run dev -- --host 0.0.0.0
```

## 빌드

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

## QA

```bash
npm run test:e2e
```

수동 QA는 production preview에서 다음을 확인합니다.

- `393x852` / DPR 3 (iPhone 15 Pro 에뮬레이션), `390x844`, `430x932`, `720x1280`, desktop viewport에서 글자/버튼이 잘리지 않는지 확인
- 출발 후 나레이션이 순차 표시되고 말풍선 선택지가 나타나는지, 선택 후 창이 사라지고 이동하는지 확인. 나레이션을 탭하면 전체 문장을 즉시 표시합니다.
- 자차: 노란색은 이마트에서 돌아와 재선택, 분홍색은 타워주차장, 파란색은 지하 3층을 거쳐 로비로 진입
- 지하철: 1~4번 출구는 재선택, 5번 출구는 픽셀 셔틀 배경에서 탑승 후 로비로 진입
- 지하철 배경의 원형 간판에 왼쪽부터 1~5번을 표시합니다. 선택지는 다른 장면과 같은 너비로 아래쪽에 세로 배치하고, 간격을 줄여 간판을 가리지 않습니다. 이동 목적지도 같은 간판 좌표를 사용합니다.
- 시작할 때 신랑측/신부측을 선택합니다. 음식과 주류 소개는 연회장 도착 후에만 표시합니다.
- 이름·성별·헤어·옷을 먼저 고릅니다. 큰 미니미 옆에 헤어/옷 이미지 카드가 있고, 같은 선택이 걷기·브이·앉기·원판·방명록에 유지됩니다. 남녀 모두 투명 배경이며 정면 대기 중 눈을 깜빡입니다.
- 원본 픽셀 스프라이트·폰트·패널·버튼을 유지합니다. 제공 사진은 픽셀 배경의 구조 참고용이며 실사 배경으로 표시하지 않습니다.
- 공용 축의대 하나에서 시작 시 선택한 신랑/신부측으로 접수, 시설 방문과 복귀, 본식 선택, ending, replay 확인
- 로비 휴게공간은 장식만 표시합니다. 신랑측은 신부대기실 통로에서 안내 팝업으로 진입을 제한합니다.
- 신부측은 신부대기실 미방문 시 안내 팝업을 거쳐 잔디 통로로 이동하며, 방문 후 웨딩홀 입장이 가능한지 확인
- ATM·웰컴드링크는 터치로 정보를 표시하고 팝업 재터치로 닫기. 팝업이 열린 동안 이동과 다른 시설 선택은 중지됩니다.
- 로비 약도는 중앙 에스컬레이터 기준 직진 연회장, 오른쪽 웨딩홀, 하단 입구 오른편 신부대기실 통로로 구성합니다. 잔디 통로에는 포토존을 두지 않습니다.
- 양쪽 하객 모두 포토부스의 `사진 찍기`와 포토테이블 관람을 마쳐야 입장할 수 있습니다. 입장 시도 시 미완료 활동만 선택지로 표시됩니다. 신부측의 대기실 방문 조건도 유지합니다.
- 웨딩홀 입장 안내에서 선택한 포토부스·포토테이블·축의대 활동과 신부대기실 촬영 후에는 웨딩홀 문 앞에 복귀합니다. 이 복귀 위치는 해당 방문에만 적용하며, 문 앞에 돌아오자마자 안내를 강제로 다시 열지 않습니다.
- 본식의 박수·환호 → 계단 위 단체 원판 → 복도 바닥을 따라 연회장 이동 → 연회장 전경 → 음식 일러스트 2×3 순차 표시 → 식사·귀가 멘트 → 직접 쓰는 축하 메시지 순서로 진행됩니다. 귀가 안내를 위해 로비/복도 화면으로 되돌아가지 않습니다.
- 원판은 `사진 찍기` → 3초 카운트다운 → `찰칵! 결혼 축하해!` → `다음으로`로 직접 넘깁니다. 카메라 프레임에는 초점·REC·타임코드를 표시하며 배터리는 표시하지 않습니다. 본인 미니미는 선택한 신랑/신부 바로 옆에 섭니다.
- 연회장을 먼저 선택했을 때만 식사 순서를 묻습니다. 먼저 식사한 하객은 본식·원판 이후 다시 식사하지 않고 귀가합니다.
- 로비 이동은 에스컬레이터와 시설을 피해 경로를 찾고, 집·유도선·셔틀·신부대기실 통로·연회장 복도는 배경에 맞춘 경유점을 사용합니다. 로비의 `수첩`에서 필수 활동을 확인하고, 대기 중인 자신의 미니미를 누르면 작은 하트가 뜹니다.
- 자차는 술을 마시지 않는 식사 멘트와 자동 3시간 주차 안내, 지하철은 주류 소개와 셔틀 귀가 안내로 분기합니다. `식사를 마친다`로 귀가를 시작하며 `처음부터 다시`는 방문 조건까지 초기화합니다.
- 음식 일러스트는 내장 이미지 생성 도구로 제작했습니다. 저장 경로와 최종 프롬프트는 [buffet-image-prompts.md](../docs/buffet-image-prompts.md)에 기록합니다.
- 빠른 double-tap, modal 뒤쪽 탭, replay가 crash 없이 처리되는지 확인

## 배포 전 체크

```bash
npm ci
npm run build
npm run test:e2e
npm run preview -- --host 127.0.0.1
```

`dist/`를 정적 호스팅에 배포합니다. 공유 미리보기는 `index.html`의 OG/Twitter 메타 태그와 `public/assets/invitation/share-pixel-wide-v2.png`를 사용합니다. 카카오 전달은 정사각형 `share-pixel-square-v2.png`를 사용합니다. `.env.example`의 `SITE_URL`, `VITE_KAKAO_JAVASCRIPT_KEY`를 설정하고 카카오 앱에 서비스 도메인을 등록합니다. `/share-preview.html`에서 두 비율을 확인할 수 있습니다. 실제 카카오톡 링크 미리보기는 배포된 공개 URL에서 다시 확인해야 합니다.

## 청첩장과 로컬 방명록

- 메인 우측 `건너뛰기`, 게임 엔딩, `/#invitation`에서 실제 청첩장을 엽니다.
- [원본 청첩장](https://www.heumcard.com/cards/now-2026-11-21)의 문구·가족·날짜·시간·위치·교통·계좌 안내와 실제 사진을 사용합니다. 원본 데이터는 `src/data/invitationSource.json`, 사진은 `public/assets/invitation/`에 보관합니다. 로비 포토월 세 개는 원래 프레임·크기·위치를 유지하면서 `src/data/photoGallery.ts`에 등록된 사진을 내부에 표시합니다. 포토테이블 팝업도 같은 목록을 사용하므로 등록 사진을 교체하면 함께 바뀝니다.
- 게임 배경은 픽셀 아트, 청첩장 사진은 원본 실사입니다. 청첩장은 크림/세이지 배경에 픽셀 창틀·하트·달력·미니미 포인트를 적용합니다.
- 격자 갤러리를 누르면 이전·다음 사진이 살짝 보이는 액자형 확대창이 열립니다. 좌우 버튼·스와이프·키보드 탐색, 지도 링크, 주소/계좌 복사를 지원합니다. 단체사진은 하객 30명과 신랑신부를 네 줄로 배치하고 등록 순서대로 넘겨 100명도 빠짐없이 볼 수 있습니다. 새 미니미는 마지막 장의 자기 자리에 나타나며, 미니미와 방명록 글 모두 작성자의 캐릭터와 메시지를 함께 보여주는 카드로 연결됩니다.
- 하객 안내는 웰컴 드링크·포토부스·ATM·연회장·신부대기실 가로 메뉴로 구성합니다. 메뉴 선택, 사진/설명 좌우 스와이프, 이전/다음 버튼으로 각 시설 사진과 원본 안내 문구를 확인합니다.
- 안내 사진 속 사람들을 제거하고 연회장의 밝은 톤을 맞췄습니다. 신랑신부는 128×192 해상도로 얼굴을 보존해 하객보다 크게 표시합니다. 청첩장 원판은 실제 정면 꽃 단상과 계단을 따릅니다. 게임 촬영은 같은 홀의 샹들리에·스크린·단상·통로가 이어지는 세로 배경이며, 말풍선은 하객을 가리지 않는 위쪽에 표시합니다. [최종 촬영 배경 기록](../docs/final-photo-and-shuttle-art.md).
- 게임에서 미니미를 선택한 하객은 청첩장에서 같은 미니미를 사용하며 다시 설정하지 않습니다. 바로 청첩장에 들어온 하객에게는 미니미 선택 화면을 제공합니다.
- 미니미는 기존 원본 그림으로 복원했습니다. 이전 분홍 패널에서 얼굴 3종·헤어 3종을 분리해 직접 터치로 선택합니다. 의상은 5종 중 3벌씩 표시하고 화살표로 넘깁니다. 남성·여성 버튼은 낮추고 시작하기는 설정 패널 밖에 별도 배치합니다. 공통 목과 발 위치를 유지하고, 헤어 썸네일에는 얼굴과 목이 없습니다. 선택한 얼굴·헤어·의상을 게임과 청첩장·방명록에 유지합니다. [구현과 새 의상 프롬프트](../docs/minimi-customization.md).
- 사진 배경의 실시간 카운트다운, 왼쪽 국화와 정렬한 가족 소개, 작은 픽셀 하트/반짝임을 적용합니다. 이미지 편집 내용은 [화면 수정 기록](../docs/wedding-visual-updates.md)에 남깁니다.
- 문구 타이핑 중 한 번 탭하면 전체가 보이고, 자동 진행 문구는 다시 탭하면 다음으로 넘어갑니다. 선택지가 있는 문구는 선택지를 직접 눌러야 합니다. 음식·촬영·봉투 작성 연출도 탭으로 기다림을 줄일 수 있습니다.
- `localStorage["wedding.guestMessages"]`에 이름·측·메시지·미니미를 저장합니다. 처음에는 신랑신부만 있고 저장한 친구들이 늘어납니다. 현재 브라우저에만 저장되며 다른 기기와 공유되지 않습니다. DB·RSVP·결제 처리는 없습니다.
- 공개 배포 전에는 공유 URL/OG 메타, 모바일 Safari 실기기, 지도 연결, 백엔드 및 개인정보 처리 방식을 별도로 확인해야 합니다.

사진별 방향·구조 대조는 [venue-reference-map.md](../docs/venue-reference-map.md), 수정 배경의 생성 방식·저장 경로·프롬프트는 [venue-correction-prompts.md](../docs/venue-correction-prompts.md)에 기록합니다.

기획/시나리오/맵/구현 계획은 저장소 루트의 `docs/`를 참고하세요.

## LACITTA asset release

The asset pass adds eleven 360x640 backgrounds, five 128x192 character sheets (32x48 frames), route/venue props, pixel UI, a Korean-title 1200x630 share image, and a local Galmuri11 Korean font. The 720x1280 game coordinates and existing journeys are preserved. Boot preloads required textures before Intro, reports missing assets, and allows readable system-font fallback.

`src/data/assetManifest.ts` is the original illustrated-asset inventory. Public URLs use `/assets/lacitta/`. User-supplied venue photographs in `public/assets/lacitta/photos/` are references; game scenes use the matching illustrations in `pixel-venue/` through `src/scenes/photoArt.ts`. Real invitation photographs are kept separately in `public/assets/invitation/`. The screen lettering, camera viewfinder, steps and minimi composition are code-native. Galmuri11 is a 155,300-byte subset distributed with its upstream SIL OFL license in `public/assets/lacitta/licenses/Galmuri-OFL.txt`. See [provenance](../docs/asset-provenance.md), [latest sprite prompts](../docs/latest-scene-asset-prompts.md) and [review notes](../docs/pixel-game-review.md).

```bash
npm run build
npm run test:e2e
npm run verify:assets
node --test scripts/verify-assets.test.mjs
# With a running dev/preview server:
npm run verify:assets -- --base-url http://127.0.0.1:5197
LACITTA_QA_URL=http://127.0.0.1:5197 node scripts/qa-asset-loading.mjs
```

The verifier uses the same installed Playwright Chromium as e2e. It checks decoded dimensions, frame layout, alpha, provenance, file existence and byte budgets for the original manifest; the live-server option also verifies HTTP 200 and exact served bytes. Its 2,500,000-byte cap applies to the original illustrated preload inventory and excludes the newly supplied JPEG photos. The story-route e2e tests cover photo loading and capture iPhone-sized intro and choice screens. Browser screenshots remain outside the release bundle. Physical-device visual acceptance is separate from browser emulation.

독립 얼굴·헤어 에셋과 청첩장 액자 개편의 생성 프롬프트 및 파일 위치는 [작업 기록](../docs/invitation-modular-art.md)에 있습니다.
