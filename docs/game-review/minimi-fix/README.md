# MINIMI BLOCKER FIX — 완료된 D 위의 M01–M05 수정

검수 기준은 원본 [MINIMI_BLOCKER_FIX.md](sources/input/MINIMI_BLOCKER_FIX.md)와 참고 이미지 3장, 그리고 사용자가 보충한 idle 자체의 시각 품질 기준이다. D를 되돌리지 않고 공통 미니미 합성 코드 3개 파일만 수정했다. 배경, UI/CSS, 선택지와 저장 ID, 진행 플래그, 이동 경로, 사진의 의미, 애니메이션 검사 조건은 변경하지 않았다.

**자동 PASS는 시각 PASS의 근거가 아니다.** 깨진 D idle과 동작 머리가 같다는 사실로 얼굴 품질을 승인하지 않았다. 정면 idle 자체를 수정하고 원본/중간 레이어/합성/실제 화면을 따로 확인했다. 기존 `review-batch-d-animation.spec.ts`를 포함한 기존 테스트·threshold·snapshot은 그대로다.

빠른 비교(왼쪽 BEFORE / 오른쪽 AFTER, 원 픽셀 그대로): [웨이브·파란 셔츠](after/inspection-pages/01-face3-hair3-blue-shirt-BEFORE-left-AFTER-right.png), [가르마·파란 셔츠](after/inspection-pages/02-face3-hair1-blue-shirt-BEFORE-left-AFTER-right.png), [안경·아이보리 상의](after/inspection-pages/03-face2-glasses-hair1-ivory-top-BEFORE-left-AFTER-right.png), [첫 얼굴 썸네일](after/inspection-pages/first-face-BEFORE-left-AFTER-right.png).

## 결과

| 항목 | 구현 | 자동 검증 | 시각 판정과 근거 |
|---|---|---|---|
| [x] M01 머리–턱–목–카라 접합 | 원본의 목 접합점을 기준으로 웨이브/포니테일 머리 기준점과 추가 의상 4종의 손든 포즈 기준점 수정 | 실제 UI와 공통 합성 픽셀 일치 12/12, 90 idle의 y≥100 몸 픽셀 D와 동일, 기존 발/걷기 검사 유지 | PASS: 전체 정면 90조합과 대표 동작 11조합에서 연결 확인. CSS 이동/머리 bounding box 중심 보정 없음 |
| [x] M02 얼굴/괄호/잔여 눈 픽셀 | 얼굴 썸네일이 옆머리·턱 외곽을 눈으로 복사하던 영역 분리. 실제 원본 눈의 전체 영역을 지운 뒤 표정/깜빡임 생성. 방향별 눈 위치와 마스크 적용 | 얼굴·안경 선택 보존, 실제 A→B→A, 실제 눈뜸→감음→뜸 확인 | PASS: 첫 얼굴 썸네일 BEFORE/AFTER, 사용자 3조합과 모든 얼굴/헤어, 좌우 12개 원본 머리 및 동작 페이지. 안경은 유지 |
| [x] M03 목 윤곽/음영 | 공유 목에 짧은 턱밑 음영과 한 픽셀 측면 윤곽 추가. 카라 테두리는 의상 소유로 유지 | 공통 레이어/preview/atlas/사진/복구 경로 검사 | PASS: 파란 셔츠와 아이보리 라운드 상의의 턱밑/양옆/카라 연결, 다른 8종 의상도 확인. 검은 사각 목 테두리 없음 |
| [x] M04 뜬 의상 조각 | 목 피부 정규화가 인접한 따뜻한 카라·봉제선까지 피부색으로 덮던 조건 제거 | A→B→A 동일, 복구 후 사진 픽셀 동일 | PASS: 아이보리 경계의 고립되어 보이던 흰 조각이 연속된 원래 카라로 복구. 단추·봉제선·하이라이트 유지. 작은 성분 삭제 필터 변경 없음 |
| [x] M05 모든 사용 경로 일치 | 기존 공통 합성 경로에 적용, 새 렌더러/저장 시스템/전체조합 preload 없음 | 실제 3조합 플레이, 12개 preview 동등성, 정상 동작/사진/이어하기, 전체 회귀·production·shipping 결과는 TEST_SUMMARY 참조 | PASS: 썸네일/preview/로비/개인·신부·단체사진/4방향·걷기·박수·환호·깜빡임을 아래 범위에서 실제 확인 |

기능 실행 수는 [TEST_SUMMARY.json](TEST_SUMMARY.json), 시각 검수 수는 [VISUAL_CHECKS.md](VISUAL_CHECKS.md)로 분리했다. **90조합을 계산·생성했고, 그 정면 idle 90조합을 실제로 모두 눈으로 확인했다. 동작은 90조합 전수가 아니라 11대표×19프레임이다. 실제 전체 플레이는 사용자 3조합이다.**

| 최종 실행 | PASS | SKIP | FAIL | 기록 |
|---|---:|---:|---:|---|
| 기존 dev 전체 / chromium | 112 | 3 | 0 | `regressions/logs/regression-final-02.json`, `logs/regression-final-02.log` /20.3분/exit0 |
| 기존 production / chromium-production | 32 | 0 | 0 | `regressions/logs/production-final-02.json`, `logs/production-final-02.log` /8.5분/exit0 |
| 별도 미니미 최종 캡처 | 2 | 0 | 0 | `logs/final-capture.json/log` |
| 별도 실제 미니미 플레이 | 3 | 0 | 0 | `logs/flows-final.json/log` |
| 별도 미니미 동작 생성 | 1 | 0 | 0 | `logs/motion-03.json/log` |

main dev+production은147 project cases 중144PASS/3SKIP이며 자동 retry는0이다. 별도 미니미6PASS와 과거 중간 시도는 main 집계에 합치지 않았다. dev SKIP3건은 동일 이름의 production에서 모두 PASS했다. 자동 검사와 별개로 시각 판정은 위 표 및 VISUAL_CHECKS에 기록했다.

## 실제 원인과 수정 파일

완료된 D의 작업 시작 시점 복사본과 비교한 정확한 코드 diff는 [changes.patch](changes.patch), 파일 목록은 [changed-files.json](changed-files.json)이다. dirty working tree를 git HEAD와 비교해 과거 A–D까지 이번 변경으로 세지 않았다.

| 파일 | 수정 내용/현재 라인 |
|---|---|
| `game/src/ui/classicMinimi.ts` | L7 방향별 원본 눈 영역, L37 목 접합 anchor, L59 표정 마스크/안경 위치, L115 얼굴 썸네일 crop |
| `game/src/ui/minimiParts.ts` | L68 실제 피부만 정규화해 카라 보존, L132 목 윤곽/음영, L148/L171 손든 추가 의상 4종의 실제 카라 X 기준점 |
| `game/src/ui/minimi.ts` | L40 공통 추가 의상 합성에 gender 전달 |

원본 `minimi-hair.png`는 눈이 이미 그려진 머리다. 기존 얼굴 3/깜빡임의 좁은 지우기 영역 밖에 원래 흰자/회색 윤곽이 남았다. 옆얼굴은 원본 6열마다 위치/높이/헤어와 겹치는 영역이 달라 정면 마스크로 처리할 수 없었다. 첫 얼굴 썸네일은 원래 머리의 옆머리/턱 가장자리를 눈과 함께 잘라 붙여 독립 얼굴 안에 두 번째 꺾인 선을 만들었다. CSS가 원인이 아니다.

`outfits-male.png`의 아이보리 목 주변에는 정상 크림색 카라가 있다. 기존 정규화가 피부 이웃의 따뜻한 카라 픽셀도 덮어 밝은 부분만 사각 잔재처럼 남겼다. 현재는 실제 피부만 정규화하며 카라의 원래 연결을 보존한다. shared neck은 원래 단색이라 턱 아래/측면 대비가 부족했고, 짧은 국소 음영/윤곽으로 고쳤다.

웨이브/포니테일 anchor는 비대칭 헤어 외곽이 아니라 source의 턱/목 연결을 기준으로 보정했다. `extra-outfits-{male,female}.png` 손든 포즈는 손끝이 카라 상단 8행에 같이 들어와 기존 자동 카라 범위 계산을 오염시켰다. 해당 원본 512px 셀의 실제 neckline X만 명시했다. 몸/발의 논리 원점과 세로 배율·발바닥선은 유지하며, 이 4개 손든 의상 프레임의 수평 등록 픽셀은 의도적으로 바뀐다. 모든 포즈의 몸 픽셀이 D와 동일하다고 주장하지 않는다.

원본 및 런타임 대응은 [sources/asset-map.json](sources/asset-map.json)에 파일별 SHA-256과 함께 있다. 제작 PNG 5개와 실제 lossless WebP 5개를 포함했다. 원본/최적화 bitmap은 수정하지 않았고 합성된 texture 픽셀을 수정했다. old bitmap을 교체하지 않아 파일명 cache-buster도 불필요하다. 기존 lazy atlas 생성/캐시 키를 유지했다.

## BEFORE/AFTER 및 검수 방법

[VISUAL_INDEX.md](VISUAL_INDEX.md)에서 사용자 3조합의 320×568/393×852/430×932/1440×900 전체 화면, 실제 표시 preview, native128×192, 얼굴·목·카라 nearest4×를 동일 조건으로 비교할 수 있다. 최초 D BEFORE와 최종 AFTER는 같은 선택 ID, Chromium151.0.7922.34, DPR1, 같은 viewport/표시 크기, reduced-motion의 열린 눈 상태다. 참고 이미지의 원 viewport/DPR은 알 수 없으므로 추정하지 않았다. 제품 FIT 배율/CSS는 그대로이며 검수 확대만 정수 nearest4배다.

정면 전체 조합은 `after/atlas/`의 native/4× 개별 PNG와 3헤어씩 묶은 30페이지로 제출한다. 단품 22종도 native/4×가 있다. 원본 크기 6페이지와 단품 페이지는 `after/inspection-pages/`에 별도로 배치했다. 축소하거나 픽셀을 다시 그리지 않았다. 모든 실제 선택 ID/라벨/페이지는 VISUAL_INDEX와 `after/registry.json`에 있다.

중간 실패도 보존했다. 첫 수정은 자동 테스트가 통과해도 아이보리 카라 구멍/헤어 침범 때문에 시각 탈락시켰다. 다음에는 정면 통과 후 옆눈 잔재와 추가 의상 손든 포즈의 틈을 발견해 다시 수정했다. [REVIEW_NOTES.md](REVIEW_NOTES.md)에 자동·시각 실패와 재실행을 구분했다. 새 snapshot baseline 등록은 하지 않았다.

## 실제 플레이/시간 증빙

`videos/`의 영상 3개는 실제 Playwright Chromium 393×852 viewport에서 기록한 전체 녹화의 **바이트 동일 복사**다. 길이 59.00/58.24/58.20초, 원 녹화 포맷 VP8/25fps/392×852를 유지했다. 재인코딩·배속·보간·구간 삭제를 하지 않았다. 실제 저장 해상도와 viewport의 1px 차이는 원 녹화에 이미 있는 것으로 PNG viewport는393px이다. [videos/index.json](videos/index.json)에 원본 경로/해시/ffprobe/타임라인/추출 명령이 있다.

세 영상 모두 선택 A→B→A, 실시간 깜빡임, 이동/목적지 재지정, 개인 사진과 신부 사진을 각각 5.5초 이상 본 후 명시적 복귀, reload 후 이어하기, 예식/단체사진까지 포함한다. 01/03은 자차·박수,02는 지하철·환호다. 이벤트 시간과 console errors, 저장 ID/사진 동일성은 `after/flows/<profile>/observations.json`에 있다. `observations.video`는 Playwright가 종료 때 이동하기 전 임시 이름이므로 최종 reporter attachment→영상 경로 연결은 videos/index.json을 사용한다.

실제 requestAnimationFrame에서 추출한 열린 눈→닫힘→열린 눈 native PNG와 상대 timestamp를 제출했다. 무대 반응도 원 영상 PTS에서 뽑은 프레임으로 확인했다. 영상 자체는 전 구간 보존했고, 시각 검수는 실제 화면 PNG·연속 blink 프레임·반응 PTS 프레임과 atlas 동작 페이지를 보고 판단했다. 이 문서가 사람처럼 영상 3개를 플레이어에서 전부 재생 시청했다는 의미는 아니다.

## 검증 명령·보존·범위

모든 npm 명령의 작업 디렉터리는 `/Users/user/wedding/ccj/game`이다.

```sh
npm run build
npm run test:e2e -- --config=playwright.minimi.config.ts --workers=1
npm run test:e2e -- --config=playwright.minimi-flow.config.ts --workers=1
npm run test:e2e -- --config=playwright.minimi-motion.config.ts --workers=1
npm run test:e2e -- --config=playwright.minimi-regression.config.ts --workers=2
npm run test:e2e -- --config=playwright.minimi-production.config.ts --workers=2
npm run verify:assets -- --report ../docs/game-review/minimi-fix/assets-final-03.json
```

기존 D 증빙으로 쓰지 않도록 QA config에서 `REVIEW_EVIDENCE`를 이 폴더로 지정했다. `before` config는 최초 D 확보용이므로 현재 수정본에서 다시 실행해 BEFORE를 덮어쓰면 안 된다. 이후 실행도 새 run/폴더명을 지정해 이전 JSON/log를 보존해야 한다.

에셋 검사 앞으로의 실행 방식은 사용자 보충대로 **별도 workdir에서 독립 실행**한다. shell redirect/다른 명령과 묶지 않고, 권한이 필요할 때만 `prefix_rule: ["npm", "run", "verify:assets"]`를 사용한다. 가변 report/log 이름을 승인 접두사에 넣지 않는다. 이번 보충 이전 실행의 redirect 로그와 sandbox 실패도 삭제하지 않았다. 추가 전역 보안 설정/허용 범위를 변경하지 않았다.

정상 shipping 검사 `assets-final-03.json`은 exit0,98등록/98검사/97이미지 decode/32runtime keys/56보존 원본/기존40건 추적, errors0이다. 이는 Playwright PASS/SKIP 집계와 별도다. 성능은 [PERFORMANCE_COMPARISON.json](PERFORMANCE_COMPARISON.json)의 실제 cold-cache 전송량이며 manifest 부분합을 첫 화면 네트워크 총량으로 오인하지 않는다.

최종 첫 화면 전송량은 자차/지하철 모두 **3,513,993 bytes (D 대비 +346)**, 게임 에셋은 **3,094,744 bytes (D 대비0)**다. 후반/전체 외형 에셋 선로딩과 첫 로비까지의 미선택 경로 요청은0, 두 정상 경로 console/요청 실패도0이다. opening 관측686/695ms는 로컬 무제한 네트워크의 수치이며 실제 모바일 통신 속도를 보증하지 않는다. recovery 검사의 의도된 white-car 요청 abort1건은 정상 경로 실패와 별도 기록이다.

원래 D fingerprint `1402719dd9a38740f9b3955698e0ca61dd028dbfb2467650529ac2f33bf1858e`의304파일을 시작 시 복사했고, 최종 diff는 앱3파일뿐이다. 새 QA는9파일이다. 현재 검증 소스/dirty-tree hash는 [source-fingerprint.json](source-fingerprint.json), D1125증빙 보존은 동일 파일의 protectedD 결과로 확인한다. 원본 D ZIP도 보존했다.

D 상태는 D-A01/C-P01/F16–F21/F23 구현·검증 완료, F22 Chromium viewport/회전/입력까지 완료하되 실제 폰 safe-area·주소창·OS키보드는 여전히 미검증이다. 그 제한을 이번 얼굴 수정으로 해결했다고 쓰지 않았다. F24는 기존 대상 선별 문서만 그대로 보존했다. F24 전역 아트 재가공 및 F25는 시작하지 않았다. WebKit/Firefox/실제 iPhone/Android는 이번에도 미검증이다.

현재 개발 서버는 `http://127.0.0.1:5174/`이며 외부 배포하지 않았다. 다시 시작할 때 `game/`에서 `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort`를 사용한다.

## 추가한 검증 파일

- `game/e2e/review-minimi-fix.spec.ts`: 실제 사용자3조합×4viewport, A→B→A/렌더 동등성, 전체90조합/22단품/레이어 PNG 생성.
- `game/e2e/review-minimi-flow.spec.ts`: 실제3조합 플레이·blink timestamp·사진5.5초·직접복귀·저장/이어하기·반응 영상.
- `game/e2e/review-minimi-motion.spec.ts`: 실제 공통 atlas의11대표×19프레임 생성.
- `game/playwright.minimi{,-before,-flow,-motion,-production,-regression}.config.ts`: 위 검증과 기존 전체 dev/production의 증빙 경로 격리. 총6개 파일.
- `docs/game-review/minimi-fix/`: 설명, 실패 포함 로그/JSON, source/hash/diff, PNG/영상과 증빙 생성·패키징 스크립트. 개별 파일은 ZIP_MANIFEST에 열거.

검수 ZIP은 `docs/game-review/minimi-fix-review.zip`이다. 과거 배치의 중복 전체 녹화와 대형 trace 등의 제외 경로·크기·이유는 `EXCLUDED_FILES.json`에 남기며 원본 폴더에서는 보존한다. 실패 원인 확인에 필요한 reporter/context와 trace를 함께 보존한다.
