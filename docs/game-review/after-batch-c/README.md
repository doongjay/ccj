# Batch C 검증 기록

범위: F11/F12/F13/F14/F15, B-E01, B-V01. 승인된 A/A1/B를 기준으로 작업했다. Batch D(F16–F23), F24/F25는 구현하지 않았다.

## 결과

최종 소스의 전체 회귀, production 실행과 실제 렌더링/시간 흐름 검토를 완료했다.

| 항목 | 결과 | 변경 및 근거 |
|---|---|---|
| F11 | PASS | 박수 `짝짝!`와 환호 `축하해!`/V 포즈, 커플 응답. 장면 소유 1.25초 타이머, 입력으로 건너뛰지 않음. |
| F12 | PASS | 촬영 전 취소 → 이동/포즈 → 촬영 완료 → 명시적 복귀. 결과와 수첩에 같은 세션 사진. |
| F13 | PASS | 기존 배경의 안정된 인물 중심 크롭. 기존 이동/발 앵커/넓은 접근 장면 유지. |
| F14 | PASS | 기존 42 후보를 시드 20261121로 섞어 29명 선택; 선택한 플레이어 1명. `나` 표시는 촬영 시작 때 제거. |
| F15 | PASS | 최초 접수 완료만 약 2.2초 알림. 이동 비차단, 수첩에는 지속 기록. |
| B-E01 | PASS | 과거 40 요약/24 상세의 16개 누락은 복원하지 않음. 현재 전체 개별 JSON 결과로 별도 증명. |
| B-V01 | PASS | 촬영 중 숨긴 버튼은 포인터와 Tab 모두 비활성. 한 안내만 표시하고 결과에는 복귀 버튼만 제공. |

## 보존과 변경 범위

`protection-checks.json`은 작업 전 스냅샷과 159개 에셋, 89개 승인 증빙 파일을 해시로 비교한다. 배경, 미니미 아트, 실제 예식 정보, 저장 의미, 경로, 발 앵커, 단계별 로더는 변경하지 않았다. 기존 미커밋 변경을 reset/clean/stash하지 않았다.

공유 코드의 필요한 변경은 StoryDialog의 사진 콘텐츠 슬롯/결과 스타일/Enter-repeat 보호, GameAccess의 작은 장면 알림 숨김·복원, 로비 수첩의 읽기 전용 썸네일이다. 기존 validation, 정보 패널 닫기, 키보드 포커스 및 가로 대안은 회귀 테스트로 검증한다.

사진은 기존 배경에서 240×200 논리 영역을 480×400 작은 canvas로 구성하고, 현재 얼굴·안경·헤어·옷의 미니미를 원래 타일 픽셀로 합성한다. imageSmoothingEnabled=false와 pixelated 샘플링을 유지한다. DOM UI나 포커스를 화면에서 캡처하지 않으므로 사진에 섞이지 않는다. 세션당 원본은 최대 두 장이며 수첩 썸네일은 읽기 전용이다. localStorage 앨범·서버 업로드·사진 다운로드/공유 기능을 추가하지 않았다. 재시작 때 원본 canvas를 해제한다.

## B-E01: 과거 자료와 현재 검증을 구분

`b-e01/original-b-regression-results.json`은 기존 B 파일의 사본이다. summary expected=40, 상세 tests=24로 16개 상세가 누락됐다. 당시 전체 raw reporter는 검색한 위치에서 찾지 못했다(`b-e01/audit.json`). 당시 성공했다고 추정해 누락된 16개를 만들어 넣지 않았다. 축약/도구 출력 수집 과정의 누락으로 판단되나, 완전한 당시 원본이 없어 생략 지점을 확정할 수 없다.

현재 실행은 Playwright JSON reporter의 outputFile로 디스크에 직접 기록한다. `game/scripts/reconcile-review-tests.mjs`는 suite 전체를 재귀 순회해 모든 프로젝트 테스트와 모든 시도, 실패, 재시도, skipped/flaky, 오류 및 첨부 경로를 보존한다. 요약의 expected/unexpected/skipped/flaky를 동일한 프로젝트 테스트 단위로 대조한다. 이미지/영상 base64만 별도 축약할 수 있고 원본 JSON은 logs/에 보존한다.

## 실행 환경과 한계

macOS 15.7.3 arm64, Node v23.11.0, Playwright 1.62.1 Chromium, Phaser 4.2.1, Vite 8.2.1, TypeScript 6.0.3. 실제 Chromium 렌더링, 포인터/키보드 입력과 실시간 장면 타이머를 사용했다. 모바일 크기와 DPR은 데스크톱 Chromium의 에뮬레이션이며 실제 iOS/Android 하드웨어, Safari/Firefox는 실행하지 않았다. 신체 기기 성능이나 네트워크 지연을 측정했다고 주장하지 않는다.

Production cold-cache는 CDP Network cache disabled / encodedDataLength, 로컬 preview, 네트워크·CPU throttling 없음. 전체 응답에는 HTML/CSS/JS/응답 헤더가 포함되고 게임 에셋은 별도 집계한다. B baseline 전체 3,507,312 bytes, 에셋 3,094,744 bytes. 신규 에셋 요청은 없으며 증가분은 새 코드와 스타일이다.

## 명령과 원본 로그

- `npm run build`: TypeScript, e2e 타입 검사, production Vite 빌드. 기존 큰 번들 경고는 유지했다.
- `npm run test:e2e -- --config=playwright.review.config.ts`: 전체 테스트. production 전용 3개는 dev에서 명시적으로 skipped하고 production에서 실행한다.
- `REVIEW_PRODUCTION=1 npm run test:e2e -- --config=playwright.review.config.ts`: production의 로딩/경로/키보드 완주/C 사진·예식 검증.
- `npm run verify:assets`: 기존 35개 manifest 검사. 첫 시도는 sandbox의 Chromium 시작 권한으로 실패했다. 같은 명령을 권한을 받아 재실행한 결과, 35개 decode 검사 외 기존 아트 40개의 `Unlisted shipping asset` 때문에 exit 1이다. 에셋과 이 검사/manifest는 작업 전과 동일하다. 이 별도 검사를 PASS로 기재하지 않는다. 전역 에셋 목록 정비는 이번 C 범위가 아니므로 수정하지 않았다.

`logs/assets-01.log`/`assets-02.log`, `logs/build-01.log`, 전체 reporter JSON, runs/의 실패 trace/error-context를 보존했다. 실패 후 별도 재실행은 Playwright retry와 구별해서 보고한다.

## 테스트 갱신 이유

- 포토부스/신부대기실 fixture는 자동 로비 복귀를 기다리는 대신, 실제 결과를 확인하고 명시적인 복귀 버튼을 누른다. 활동 완료·측별 요구·로비 복귀 위치 assertion은 유지한다.
- 사진/수첩에 canvas가 추가됐으므로 관련 게임 캔버스 locator를 `#app canvas`로 한정한다. 테스트 대상을 정확히 지정한 것이며 상태를 주입하지 않는다.
- 사진 크기 검사에서는 viewport resize가 반영될 때까지 기다린다. 44px 최소 타깃, 겹침 금지, 화면 내 복귀 버튼 조건을 낮추지 않았다.
- 기존 접수의 영구 검은 배너 기대값은 승인된 F15의 일회 알림/사라짐/지속 진행도 검증으로 대체한다.
- 전체 포인터 여정은 신부측 자차·식사 먼저·박수·저장, 신랑측 지하철·예식 먼저·환호·건너뛰기로 강화한다. 양쪽 모두 청첩장과 재시작까지 간다. 키보드 여정은 반대 반응도 실행한다.
- 키보드-only는 실제 Tab/Shift+Tab/Enter/Space/Escape를 사용하며 강제 focus나 진행도 주입을 사용하지 않는다. pointerdown이 0인지 확인한다.
- B 테스트의 출력만 C/regressions/로 옮겨 승인된 B 증빙을 덮어쓰지 않는다.
- 일부 기존 독립 장면/아트 검사는 준비된 장면 fixture를 사용한다. 이것을 실제 완주나 동작 영상으로 제시하지 않는다. C의 영상은 정상 로비 이동과 실시간 진행만 기록한다. 공유 회귀는 navigator.share/Kakao를 로컬 stub으로 대체하며 외부 전송은 하지 않았다.

## 시각 및 동작 증빙

동일한 여성·안경(face 1)·포니테일(hair 2)·핑크 원피스(outfit 3)로 수정 전 포토부스/신부대기실 촬영 후 상태를 320/393/430 폭에서 별도로 캡처했다(`before/`). 이전에는 결과 카드가 없으므로 BEFORE는 flash가 끝난 동일한 촬영 완료 시점의 넓은 장면이다. AFTER는 새 결과 감상 상태이며 다른 단계의 접근 화면을 결과 비교인 것처럼 제시하지 않는다.

정지 이미지는 인물 구도, 헤어/옷, 얼굴 가림, CTA 배치, 읽기 크기를 시각적으로 확인하는 근거다. 5.5초 유지, 일회 완료, 초대장 pause/resume, 입력 반복, 복귀, 진행도 및 리소스 제한은 실제 입력/대기와 이벤트 로그로 확인한다.

`photo-events.json`, `ceremony-*-events.json`, `reception-events.json`, `reception-pause-events.json`의 performance.now 값은 각 페이지 navigation 기준 ms다. 영상 메타데이터와 테스트의 Date.now 값은 해당 실행의 UTC epoch ms다. 영상은 실제 녹화에서 앞뒤 여유만 두고 자른 1× 속도다. 사진 결과는 입력 없이 5.5초 이상 유지한다. 초대장 중 멈춘 구간을 편집으로 제거하거나 연출 타이머를 가속하지 않았다.

## 남긴 작업

Batch D(F16 버튼 상태, F17 전역 reduced-motion, F18 복구, F19 주차 방향, F20 뷔페 표현, F21 로비 라벨, F22 바깥 화면, F23 걷기), F24/F25는 미착수다. 이 작업은 새/변경 C 연출에만 기존 reduced-motion을 적용했다. 기존 전체 에셋 manifest 불일치도 따로 남겼다.

## 정확한 소스/검증 파일 변경

| 파일 | 목적 |
|---|---|
| `game/src/scenes/IntroScene.ts` | 새 플레이 시작 때 사진/접수 알림 세션 해제 |
| `game/src/scenes/ReceptionScene.ts` | 실제 첫 완료에만 알림 예약 |
| `game/src/scenes/VenueHallScene.ts` | F11 구별되는 응답·일회 타이머, F14 군중 선택·나 표시·캐릭터 리소스 진단 |
| `game/src/scenes/VenueLobbyScene.ts` | F12 수첩 사진, F15 영구 배너 제거·일회 알림 |
| `game/src/scenes/VenueRoomScene.ts` | F12/F13/B-V01 사진 상태·컨트롤 수명·결과·명시적 복귀·완료 횟수 |
| `game/src/ui/sessionMemories.ts` (신규) | 두 개 한도의 세션 사진, 정확한 미니미 크롭, 수첩 썸네일, 접수 알림 일회 큐 |
| `game/src/ui/SceneFeedback.ts` (신규) | 접근 가능한 작은 장면 안내와 종료 시 정리 |
| `game/src/ui/ceremonyGuests.ts` (신규) | 기존 군중 후보, 재현 가능한 중복 없는 선택과 후보 부족 시 순환 |
| `game/src/ui/StoryDialog.ts` | 기존 정보 패널에 사진 콘텐츠를 삽입; 결과 CTA의 키 반복 방지 |
| `game/src/ui/GameAccess.ts` | 청첩장 중 장면 안내도 숨기고 정확히 복원 |
| `game/src/style.css` | 기존 픽셀 프레임을 이용한 결과/수첩 사진/작은 장면 알림 스타일 |
| `game/e2e/story-helpers.ts` | 결과 확인 후 실제 복귀, 게임 canvas 한정 |
| `game/e2e/current-journey.spec.ts` | 양측 전체 포인터 경로/식사 순서/박수·환호/저장·건너뛰기/청첩장·재시작 |
| `game/e2e/lobby-required.spec.ts` | 촬영 결과 명시적 복귀 후 필수 일정과 재시작 검증 유지 |
| `game/e2e/lobby-return.spec.ts` | 결과 복귀 뒤 기존 로비 위치 검증 유지 |
| `game/e2e/reception-only.spec.ts` | 제거된 영구 배너 대신 일회 알림/사라짐/측별 완료 불변식 |
| `game/e2e/review-batch-a.spec.ts` | 새 결과 복귀 동작으로 기존 A acceptance 유지 |
| `game/e2e/review-batch-a1.spec.ts` | 새 결과 복귀 동작으로 기존 A1 acceptance 유지 |
| `game/e2e/review-batch-b-access.spec.ts` | 키보드 사진 결과·포커스·청첩장 복귀 및 양측 반응, C로 증빙 경로 이동 |
| `game/e2e/review-batch-b-floor.spec.ts` | B 증빙 보호를 위한 출력 경로만 C로 이동 |
| `game/e2e/review-batch-b-guidance.spec.ts` | B 증빙 보호를 위한 출력 경로만 C로 이동 |
| `game/e2e/review-batch-b-performance.spec.ts` | C 출력 경로, 기존 CDP 측정에 실제 경과 시간/기준 대비 bytes 추가 |
| `game/e2e/review-batch-c-photos.spec.ts` (신규) | F12/F13/B-V01 사진·세션·반복 입력·크기·5.5초 유지·영상 검증 |
| `game/e2e/review-batch-c-ceremony.spec.ts` (신규) | F11/F14 실제 양측 반응, 청첩장 일시정지, 군중 후보/재사용, 320 및 DPR3 |
| `game/e2e/review-batch-c-reception.spec.ts` (신규) | F15 실제 시간·이동·재방문·청첩장 타이머 일시정지 검증 |
| `game/playwright.review.config.ts` (신규) | dev 전체/production 선별 실행, 직접 파일 JSON reporter, 배치별 artifact 위치 |
| `game/scripts/reconcile-review-tests.mjs` (신규) | 전체 개별 테스트·프로젝트·시도 집계와 요약 정합성 검사 |

문서 완료 표시는 `GAME_REVIEW.md`, `GAME_REVIEW_FINAL.md`, `BATCH_C_IMPLEMENTATION.md`에 기존 발견 내용을 남긴 채 추가한다. 검증 자료/README/보조 도구는 이 폴더에만 추가하며 최종 파일 목록은 artifact manifest에 기록한다. 작업 전부터 변경돼 있던 index.html, package-lock.json, vite.config.ts 등을 이번 수정으로 주장하지 않는다.

## 실패를 남긴 이유와 수정한 검사

- `logs/ceremony-01.json`, `ceremony-02.json`: 일회 반응 중 청첩장을 닫은 뒤, 복원된 청첩장 버튼에 Enter를 다시 눌러 청첩장을 열었던 입력 fixture 오류. Phaser canvas는 pointerdown의 기본 동작을 막으므로 canvas 클릭만으로 DOM 포커스가 이동한다고 가정할 수도 없었다. Enter 반복은 예식 선택 직후에 검사하고, 초대장 복귀 뒤에는 포인터 연타를 검사하도록 분리했다. 키보드 전체 여정은 실제 Tab 경로를 그대로 유지했다. `ceremony-03.json`은 해당 집중 검사 4개 통과 기록이다.
- `logs/regression-all-01.json`: 첫 전체 실행은 90개 중 81 PASS / 6 FAIL / 3 production-only SKIP. 6개 실패는 제거된 영구 배너 기대 2개와, 사진/군중 누적 검사가 청첩장·미리 준비한 배경까지 포함했던 총 texture 수 기대 4개다. 이후 리소스 진단은 실제 생성한 minimi/heads/formal-guest atlas에 한정했다. 카운트의 대상을 정확히 한정했으며 생성 수 증가 금지와 사진 두 장 한도는 유지한다. 첫 실행의 모든 실패·trace·개별 결과는 삭제하지 않았다.
- 기존 리스트 방식의 사진 집중 실행은 `logs/exploratory-photos.md`에 성공/실패와 보유 증빙의 한계를 적었다. 완전한 raw가 없는데 있는 것처럼 만들지 않았다.


## 최종 실행 집계

- Commit: `a2a31405940560e169c819ee0f2677f073ccba40` (기존 미커밋 작업 포함).
- 최종 source/test/assets fingerprint: `87a0fbfaf3e1c9c0e99c35a6ac132245855c494a0d58c3e653714f7bcb93d287`.
- 고정 시각 UTC: 2026-09-13T16:13:09.274317+00:00. 검증 종료 UTC: 2026-09-13T17:29:41.710150+00:00. 한국 시간은 UTC+9.
- 최종 빌드: `logs/build-final.log`. 고정 이후 코드/테스트/에셋의 해시 변화 없음.

| 실행 | 시작 UTC | 개별 프로젝트 테스트 | PASS | FAIL | SKIP | FLAKY | 시도 | 요약=상세 |
|---|---|---:|---:|---:|---:|---:|---:|---|
| 전체 dev | 2026-09-13T16:23:25.808Z | 91 | 88 | 0 | 3 | 0 | 91 | PASS |
| production cold cache/접근성/C | 2026-09-13T17:22:34.759Z | 14 | 14 | 0 | 0 | 0 | 14 | PASS |

91개 논리 테스트가 모두 적용 가능한 환경에서 통과했다. dev의 production-only 3개 SKIP은 production에서 실행해 통과했다. 두 실행을 합하면 105개 프로젝트 테스트/105시도, 102 PASS와 명시적 SKIP 3개다. 자동 재시도/FLAKY는 0. 이전 실패 실행은 별도 raw JSON/상세 기록으로 보존하며 최종 PASS 숫자에 섞지 않았다. `final-verification.json`에 모든 개별 항목이 있다.

## Production bytes

| 경로 | 첫 화면 전체 bytes | B 대비 | 게임 에셋 bytes | 에셋 증감 | 실제 로컬 경과 ms |
|---|---:|---:|---:|---:|---:|
| car | 3,509,311 | +1,999 | 3,094,744 | +0 | 580 |
| subway | 3,509,311 | +1,999 | 3,094,744 | +0 | 577 |

둘 다 5,000,000 bytes 이하. B와 같은 CDP cold-cache 집계이며 에셋 증가는 0이다. 새 코드·스타일이 전체 응답 증가의 원인이다. 경과 시간은 실제 로컬 Chromium 값이고 모바일 실기기나 지연 네트워크 수치가 아니다. 느린 네트워크 화면은 별도의 gate/failure 주입 테스트로 구별했다.

## AFTER 스크린샷 목차

- [f11-applause-response-393.png](f11-applause-response-393.png)
- [f11-cheer-response-393.png](f11-cheer-response-393.png)
- [f12-booth-result-393.png](f12-booth-result-393.png)
- [f12-bridal-result-393.png](f12-bridal-result-393.png)
- [f12-notebook-keepsakes-393.png](f12-notebook-keepsakes-393.png)
- [f12-booth-controls-no-overlap-393.png](f12-booth-controls-no-overlap-393.png)
- [f13-booth-result-320.png](f13-booth-result-320.png)
- [f13-bridal-result-320.png](f13-bridal-result-320.png)
- [f13-photo-result-430.png](f13-photo-result-430.png)
- [f14-group-bride-393.png](f14-group-bride-393.png)
- [f14-group-groom-393.png](f14-group-groom-393.png)
- [f15-reception-acknowledged-393.png](f15-reception-acknowledged-393.png)
- [f15-lobby-revisit-no-banner-393.png](f15-lobby-revisit-no-banner-393.png)
- [keyboard-photo-result-desktop.png](keyboard-photo-result-desktop.png)
- [reduced-motion-response-393.png](reduced-motion-response-393.png)

추가 320 반응, 430 신부 사진, 양측 키보드 반응은 루트의 f11/f13 파일에 있다. 전체 기존 회귀 캡처는 `runs/regression-final/`, B 재검증 캡처는 `regressions/`에 있다. `before/`는 수정 전 동일 외형·단계·viewport 사진이다.

## 실제 시간 영상

- [f12-booth.webm](f12-booth.webm): 11.76초, 1× 속도.
- [f12-bridal.webm](f12-bridal.webm): 12.96초, 1× 속도.
- [f11-applause.webm](f11-applause.webm): 11.32초, 1× 속도.
- [f11-cheer.webm](f11-cheer.webm): 14.68초, 1× 속도.
- [f15-reception.webm](f15-reception.webm): 16.32초, 1× 속도.

영상은 최종과 동일한 소스의 `refinement-02` 실행에서 추출했다. 대응 이벤트 원본은 `video-inputs/`, 최종 파일/codec/구간 정보는 `video-manifest.json`에 있다. Playwright가 test 종료 후 임시 녹화 파일을 최종 video.webm으로 옮긴 경로도 manifest에 기록했다. 브라우저 viewport는 393×852이고 codec의 짝수 폭 정렬 때문에 영상 파일은 392×852, 25fps다. 크기나 시간 배율을 편집하지 않았고, 원 녹화의 디코딩된 프레임을 lossless VP9로 다시 담았다. F15는 청첩장 왕복/방 재방문 뒤에도 배너가 없고 수첩 1/3이 남는 구간까지 포함한다.


## 항목별 acceptance와 시간/리소스

- **F11: 모든 acceptance PASS** — 세부 조건별 결과는 `acceptance-checks.json`.
- **F12: 모든 acceptance PASS** — 세부 조건별 결과는 `acceptance-checks.json`.
- **F13: 모든 acceptance PASS** — 세부 조건별 결과는 `acceptance-checks.json`.
- **F14: 모든 acceptance PASS** — 세부 조건별 결과는 `acceptance-checks.json`.
- **F15: 모든 acceptance PASS** — 세부 조건별 결과는 `acceptance-checks.json`.
- **B-E01: 모든 acceptance PASS** — 세부 조건별 결과는 `acceptance-checks.json`.
- **B-V01: 모든 acceptance PASS** — 세부 조건별 결과는 `acceptance-checks.json`.

`timing-and-resources.json`에 실제 촬영 완료/결과/복귀 시각, 접수 알림 수명, 군중 후보/선택 인덱스/프로필 키/고유 수를 정리했다. 원본 이벤트는 루트의 *-events.json, 영상 실행의 원본은 video-inputs/에 있다. 사진 4회(재촬영 포함)에도 세션 사진은 2개, 각 진행도 갱신은 1회, 캐릭터 atlas 수는 일정했다. 군중은 후보 42개에서 29종을 선택하고 플레이어를 포함해 30슬롯을 유지했다. 예식 준비 전후 군중 관련 atlas는 5개로 동일했다. 접수 알림은 약 2.2초 뒤 사라지고 청첩장/재방문에도 1회만 생성됐다.

PNG의 인물/크롭/버튼/마커를 시각적으로 확인했고, 동작 영상의 선택/반응/결과/재방문 대표 시점을 실제 파일에서 디코딩한 프레임으로 확인했다(`video-frames/`). 실제 5.5초 대기와 pause/resume/중복 방지는 브라우저 입력 및 시간 기반 assertions로 함께 검증했다.

ZIP에는 이전 실패의 원본 trace도 포함되므로 파일이 크다. 누락된 테스트를 감추기 위한 자료 삭제나 이전 Batch A/A1/B 증빙 덮어쓰기는 하지 않았다.
