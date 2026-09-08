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

- `390x844`, `430x932`, `720x1280`, desktop fallback viewport에서 글자/버튼이 잘리지 않는지 확인
- 자차 route: 오답 선택 후 힌트 확인, 파란색 정답, 신랑측 접수, hall guide, ending, replay 확인
- 지하철 route: 오답 출구 후 힌트 확인, 5번 출구 정답, 신부측 접수, hall guide, ending 확인
- 빠른 double-tap, modal 뒤쪽 탭, replay가 crash 없이 처리되는지 확인

## 배포 전 체크

```bash
npm ci
npm run build
npm run test:e2e
npm run preview -- --host 127.0.0.1
```

`dist/`를 정적 호스팅에 배포합니다. 공유 미리보기는 `index.html`의 OG/Twitter 메타 태그와 `public/assets/lacitta/share/og-lacitta-wedding.png`를 사용합니다. 실제 카카오톡 링크 미리보기는 배포된 공개 URL에서 다시 확인해야 합니다.

포토테이블 갤러리는 샘플 일러스트 두 장을 사용합니다. 실제 웨딩 사진, RSVP, 계좌/결제 정보, 백엔드 기능은 포함되어 있지 않습니다.

기획/시나리오/맵/구현 계획은 저장소 루트의 `docs/`를 참고하세요.

## LACITTA asset release

The asset pass adds eleven 360x640 backgrounds, five 128x192 character sheets (32x48 frames), route/venue props, pixel UI, a Korean-title 1200x630 share image, and a local Galmuri11 Korean font. The 720x1280 game coordinates and existing journeys are preserved. Boot preloads required textures before Intro, reports missing assets, and allows readable system-font fallback.

`src/data/assetManifest.ts` is the typed inventory. Public URLs use `/assets/lacitta/`. Artwork is original generated or code-native work; venue photographs are reference-only and are not shipped. Galmuri11 is a 155,300-byte subset distributed with its upstream SIL OFL license in `public/assets/lacitta/licenses/Galmuri-OFL.txt`. See [provenance](../docs/asset-provenance.md) and [style guide](../docs/lacitta-asset-style-guide.md) for sources, transformations and production rules.

```bash
npm run build
npm run test:e2e
npm run verify:assets
node --test scripts/verify-assets.test.mjs
# With a running dev/preview server:
npm run verify:assets -- --base-url http://127.0.0.1:5197
LACITTA_QA_URL=http://127.0.0.1:5197 node scripts/qa-asset-loading.mjs
```

The verifier uses the same installed Playwright Chromium as e2e. It checks decoded dimensions, frame layout, alpha, provenance, file existence and byte budgets; the live-server option also verifies HTTP 200 and exact served bytes. The 35-entry inventory includes separate venue rooms and the greenery corridor. Initial assets must fit a 2,500,000-byte cap; the share image is excluded from preload. Run the verifier for the current payload total. Browser screenshots and command evidence belong under `.omo/evidence/lacitta-asset-production/`, never the release bundle. Final responsive visual acceptance is tracked separately from build and asset checks.
