# Batch C 검수 참고사항

이번 작업은 기존 Batch C 증빙의 검수용 패키징이다. 게임 코드·테스트·검사 기준을 수정하지 않았고, 빌드·브라우저 테스트·에셋 검사를 다시 실행하지 않았다. 아래 PASS/FAIL/SKIP은 원본에 보존된 당시 실행 결과다. 이번에 새로 수행한 검증은 원본/사본 SHA-256 비교, JSON 개별 결과 재집계 및 패키지 무결성 검사다. Batch D/F24/F25는 시작하지 않았다.

`BATCH_C_REPORT_ORIGINAL.md`는 원래 README의 수정 없는 사본이다. 그 문서가 말하는 “ZIP에 전체 trace 포함”, `runs/regression-final/`의 전체 캡처, “기존 에셋 불일치”는 원본 패키지를 가리킨다. 검수용 ZIP의 보유 범위와 기존 여부 판단의 정확한 근거는 이 문서를 따른다.

## 1. 102 PASS / 3 SKIP과 별도 에셋 검사

| 실행 | 프로젝트 | 개별 프로젝트 테스트 | PASS | FAIL | SKIP | FLAKY | 자동 retry |
|---|---|---:|---:|---:|---:|---:|---:|
| 최종 dev 전체 | chromium | 91 | 88 | 0 | 3 | 0 | 0 |
| 최종 production | chromium-production | 14 | 14 | 0 | 0 | 0 | 0 |
| 최종 두 실행 합계 | 두 프로젝트 | 105 | 102 | 0 | 3 | 0 | 0 |

이는 105개 서로 다른 논리 테스트가 아니다. 프로젝트를 합친 105개 결과/105시도이며, 파일+테스트명 기준 논리 테스트는 91개다. 적용 가능한 프로젝트에서 91개 모두 통과한 기록이 있다. production에서 다시 통과한 항목도 dev의 SKIP 행을 삭제하지 않았다. 이전 실패 실행은 이 최종 집계에 더하지 않았다.

원본 raw reporter `logs/regression-final.json`, `logs/production-final.json`은 이미지 base64를 포함해 바이트 그대로 보존했다. 전체 suite/spec/test/result 트리, 프로젝트, 모든 시도, 오류, stdout/stderr, 첨부 메타데이터 및 stats를 포함한다. 별도 간편 파일은 `*-reporter.json`, `*-reconciliation.json`, `final-verification.json`이다. `reporter-recheck.json`은 이번 패키징에서 모든 보유 raw reporter를 재귀 순회해 요약=상세를 다시 대조한 기록이며 새 테스트 실행 결과가 아니다.

**`npm run verify:assets`는 위 102 PASS에 포함되지 않는다. 이 별도 에셋 목록 검사는 종료 코드 1 / FAIL / 미등록 40건으로 남아 있다.** 오류를 숨기거나 manifest/검사를 완화·수정하지 않았다.

### SKIP 3건의 정확한 이름과 미검증 범위

공통 파일: `game/e2e/review-batch-b-performance.spec.ts`. 공통 dev 프로젝트: `chromium`.
`test.skip(!baseURL?.includes(":5199"), ...)`로 production preview가 아닌 실행에서 건너뛴다. 선언 줄 번호와 skip annotation 위치는 raw reporter와 `reporter-recheck.json`에 보존했다.

| 테스트명 | 프로젝트 | 원본 skip 사유 | 해당 dev 실행에서 미검증인 범위 | 별도 검증 |
|---|---|---|---|---|
| `F09 production cold cache: opening and first car lobby transfer` | `chromium` | `Transfer evidence requires the production preview config.` | 자차 production cold-cache 첫 화면 및 첫 로비 전환의 전송량 | 동일 테스트 `chromium-production` PASS, `logs/production-final.json` |
| `F09 production cold cache: opening and first subway lobby transfer` | `chromium` | `Transfer evidence requires the production preview config.` | 지하철 production cold-cache 첫 화면 및 첫 로비 전환의 전송량 | 동일 테스트 `chromium-production` PASS, `logs/production-final.json` |
| `F09 production: branded opening and retry after one deliberately failed later asset` | `chromium` | `Recovery evidence uses the production build.` | production 브랜드 로딩 첫 화면 및 나중 에셋 1회 의도적 실패 후 재시도 복구 | 동일 테스트 `chromium-production` PASS, `logs/production-final.json` |

별도 production 통과는 로컬 macOS Chromium에서 확인한 범위다. 실제 iOS/Android 하드웨어, Safari/Firefox, 실제 모바일 통신망에서의 동작/성능은 미검증이다. 이는 위 3개 환경 조건 SKIP과 구분한다.

### 실행 명령과 원본 경로

작업 디렉터리는 모두 `/Users/user/wedding/ccj/game`이다.

```sh
npm run test:e2e -- --config=playwright.review.config.ts --workers=3
REVIEW_PRODUCTION=1 npm run test:e2e -- --config=playwright.review.config.ts --workers=1
npm run verify:assets
```

- dev 원본: `docs/game-review/after-batch-c/logs/regression-final.json`, `.log` — 최종 성공.
- production 원본: `docs/game-review/after-batch-c/logs/production-final.json`, `.log` — 최종 성공.
- 에셋 첫 실행 원본: `docs/game-review/after-batch-c/logs/assets-01.log` — Chromium 시작 시 `bootstrap_check_in ... Permission denied (1100)` / SIGTRAP. 브라우저 decode 검사까지 완료하지 못한 실패다.
- 에셋 권한 확보 후 재실행 원본: **`docs/game-review/after-batch-c/logs/assets-02.log`**, **종료 코드 1**. 실제 출력 저장 명령은 `npm run verify:assets > ../docs/game-review/after-batch-c/logs/assets-02.log 2>&1`이다. `--contract-only`나 검사 대상 축소 옵션을 쓰지 않았다.

에셋 종료 코드 1은 당시 실행 기록과 보존된 검사 코드의 `if (errors.length) ... process.exitCode = 1` 분기에 근거한다. stdout/stderr 로그 자체에는 별도의 exit-code 필드가 없다. 이번 패키징을 새 검사 실행인 것처럼 기재하지 않았다. `asset-inventory-review.json`에 명령·종료 코드·근거·원본 경로를 함께 기록했다.

두 번째 에셋 로그는 `Checked 35 entries; initial=2225011; fonts=155300; mode=shipping` 다음에 정확히 40개 `Unlisted shipping asset`를 출력한다. 기존 manifest 35개는 이미지 decode/크기/alpha 등의 실패를 보고하지 않았지만, 40개 누락은 그 35개 계약 검사로 검증되지 않는다. `initial=2225011`은 이 manifest 부분집합의 계산값이다. 실제 첫 화면 production 측정 3,509,311 bytes와 혼동하지 않는다.

## 2. 미등록 40건: 파일, 키, 확인 가능한 영향

아래 파일은 모두 `game/public/assets/lacitta/` 아래에 있다. **검사 대상 `ASSET_MANIFEST`에는 해당 파일 URL의 등록 키가 없다.** “단계 로더 키”는 별도 `stageAssets.ts`의 `image(key, source)`에서 직접 확인한 런타임 키이며, manifest에 등록됐다는 뜻이 아니다.

- 영향 A: 별도 단계 로더에서 최적화 WebP 경로로 매핑된다. 원본 PNG의 manifest 계약 검사는 누락됐지만, 이 목록 오류만으로 런타임 파일이 없거나 화면이 깨진다고 판단할 수 없다.
- 영향 B: `stageAssets.ts`의 직접 image 등록을 찾지 못했다. 이것만으로 미사용 파일이라고 단정하지 않는다. 실제 사용 여부·화면 영향은 이 검사만으로 확정할 수 없으며 해당 파일의 manifest 계약 검사는 누락됐다.
- 공통: 40건으로 에셋 목록 검사 전체는 실패한다. 최종 브라우저 통과는 검사 manifest의 누락을 해소하지 않는다. 로컬 production에서 측정한 정상 경로/의도적 복구는 별도 증빙이며 모든 미등록 파일의 정확성을 전부 검증한 것은 아니다.

| # | 파일 (위 공통 경로 기준) | manifest 키 | 단계 로더 키 | 영향 |
|---|---|---|---|---|
| 1 | `routes/car-background-pink.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 2 | `routes/car-guidance-v2.png` | 미등록 | `car-background` | A |
| 3 | `routes/home-ground-v2.png` | 미등록 | `home-background` | A |
| 4 | `routes/home-sky.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 5 | `pixel-venue/banquet-corridor.png` | 미등록 | `venue-banquet-corridor` | A |
| 6 | `pixel-venue/banquet.png` | 미등록 | `venue-banquet` | A |
| 7 | `pixel-venue/bridal-room-white.png` | 미등록 | `venue-bridal-room` | A |
| 8 | `pixel-venue/bridal-room.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 9 | `pixel-venue/garden.png` | 미등록 | `venue-garden` | A |
| 10 | `pixel-venue/group-photo-hall.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 11 | `pixel-venue/group-photo-portrait-v3.png` | 미등록 | `wedding-group-portrait` | A |
| 12 | `pixel-venue/group-photo-stage-v2.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 13 | `pixel-venue/group-photo-stage-v3.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 14 | `pixel-venue/group-photo-stage-v4.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 15 | `pixel-venue/hall-v2.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 16 | `pixel-venue/hall.png` | 미등록 | `venue-hall` | A |
| 17 | `pixel-venue/lobby-heart-panels.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 18 | `pixel-venue/lobby-no-posters.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 19 | `pixel-venue/lobby.png` | 미등록 | `venue-lobby` | A |
| 20 | `pixel-venue/photo-booth.png` | 미등록 | `venue-photo-booth` | A |
| 21 | `pixel-venue/reception-family.png` | 미등록 | `reception-family` | A |
| 22 | `pixel-venue/shuttle.png` | 미등록 | `venue-shuttle` | A |
| 23 | `photos/garden.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 24 | `food/buffet-left.png` | 미등록 | `buffet-left` | A |
| 25 | `food/buffet-right.png` | 미등록 | `buffet-right` | A |
| 26 | `characters/extra-outfits-female.png` | 미등록 | `extra-outfits-female` | A |
| 27 | `characters/extra-outfits-male.png` | 미등록 | `extra-outfits-male` | A |
| 28 | `characters/formal-guests.png` | 미등록 | `formal-guests` | A |
| 29 | `characters/guest-poses.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 30 | `characters/minimi-faces-v2.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 31 | `characters/minimi-hair.png` | 미등록 | `minimi-hair` | A |
| 32 | `characters/minimi-hairstyles-v2.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 33 | `characters/npc-bride-white.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 34 | `characters/outfits-female.png` | 미등록 | `outfits-female` | A |
| 35 | `characters/outfits-male.png` | 미등록 | `outfits-male` | A |
| 36 | `characters/parents.png` | 미등록 | `parents` | A |
| 37 | `characters/player-guest-female.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 38 | `characters/seated-guest.png` | 미등록 | 직접 등록 확인 안 됨 | B |
| 39 | `characters/wedding-couple.png` | 미등록 | `wedding-couple-sheet` | A |
| 40 | `characters/white-car.png` | 미등록 | `white-car` | A |

40개 파일의 정확한 크기·전후 SHA-256·확인된 WebP URL은 `asset-inventory-review.json`에 있다. 검사 코드, manifest 및 단계 로더는 `source-evidence/reference/`에 읽기용 사본으로 포함했다.

### “기존부터 있었다” 판단의 근거와 한계

여기서 **기존**은 “기록된 Batch C 시작 전 로컬 스냅샷에 구조적 불일치가 이미 존재했다”는 범위만 뜻한다.

- 시작 전 스냅샷: UTC `2026-09-13T15:16:11.546637+00:00`, commit `a2a31405940560e169c819ee0f2677f073ccba40` + 당시 dirty working tree, 443개 파일 해시.
- 스냅샷 기록 fingerprint: `b194a519e908e426b5489dddb8dae7f5613644d8699499a4401fffc9afa3665a`.
- `source-evidence/baseline-metadata.json`, `baseline-hashes.json`은 보존된 `/private/tmp/ccj-batch-c-baseline/`의 사본이다. 메타데이터는 로컬 기록이며 외부 타임스탬프 인증이나 깨끗한 commit을 의미하지 않는다.
- 미등록 40개 모두 이 시작 전 해시 목록에 있고, 패키징 시 현재 파일 SHA-256과 40/40 일치한다.
- 검사 코드 SHA-256(전후 동일): `415ca36acaad0c3d89318b3c51c44db19ea64569a4048805fba227b987ac0b26`.
- manifest SHA-256(전후 동일): `563ee2725e8d37f135271d5927bd1f81f92cb7c80ea275bd6ce1ba9956f243f8`.
- 두 파일은 스냅샷 실제 사본도 `source-evidence/before/`에 포함했다. 최종 사본은 `reference/`에 있다. `legacy-asset-check.json`의 기록과 이번 `asset-inventory-review.json`의 해시 재대조가 일치한다.

따라서 동일 검사·동일 manifest에 없는 동일 40개 PNG가 C 시작 전에 존재했다는 **구조적 근거**는 있다. 그러나 **C 이전에 `npm run verify:assets`를 실행한 원본 로그는 확보하지 못했다. 과거 실행 여부·당시 종료 코드·최초 도입 시점·어느 이전 배치에서 생겼는지는 미확인**이다. 근거 없이 “이전 테스트에서도 실패했다”, “이미 승인된 오류다”, “40개 모두 무해하다”라고 주장하지 않는다.

## 3. B-E01 / B-V01 해결 증빙

**B-E01**: `b-e01/original-b-regression-results.json`은 과거 B summary=40 / 상세=24의 수정 없는 사본이다. `b-e01/audit.json`은 당시 raw 전체를 찾지 못한 검색 위치와 한계를 기록한다. 누락된 16개의 과거 결과는 여전히 복원 불가이며 새로 만들어 채우지 않았다. 현재 버전은 최종 dev 91/production 14개를 디스크 raw reporter로 직접 저장했고, 원본 요약과 모든 개별 상태/시도를 `*-reconciliation.json`, `final-verification.json`, 이번 `reporter-recheck.json`에서 대조했다. 과거 증빙 복원과 현재 소스 재검증은 구분한다.

**B-V01**: 같은 393×852의 `before/b-booth-controls-overlap-393.png`와 `f12-booth-controls-no-overlap-393.png`를 비교한다. 촬영 중 사용 불가 버튼은 hidden/Tab 비활성 상태이며 한 안내만 남고, 결과는 `f12-booth-result-393.png`의 명시적 복귀로 이어진다. `f12-booth.webm`의 입력→포즈→결과→직접 복귀와 `video-inputs/photo-events.json`이 시간 흐름을 보강한다. 최종 raw의 `F12/F13/B-V01: actual photos persist, explicit returns, finite notebook keepsakes and clean controls`가 dev/production 모두 PASS다. `source-evidence/reference/game/e2e/review-batch-c-photos.spec.ts`에서 hidden 버튼 0개, 자동 진행 안내 0개, 결과 유지, 44px CTA/사진 비겹침/화면 내부 조건을 확인할 수 있다. `acceptance-checks.json`은 당시 실제 PNG/동작 검토 결과다. 패키징 단계에서 새 브라우저 검수로 바꾸어 적지 않았다.

## 4. 실패·별도 재실행 기록을 보존한 방식

모든 보유 실행 로그 21개와 raw JSON을 수정 없이 포함했다. 13개 error-context.md와 실패 디렉터리에 실제 존재하는 전체 영상 11개도 그대로 포함했다. 존재하지 않는 실패 영상/로그를 새로 만들지 않았다. 자동 retry와 실패 후 별도 실행은 서로 다르다.

| 보존 실행 | 당시 결과 | 근거 및 뒤이은 확인 |
|---|---|---|
| ceremony-01 | 1 PASS / 3 FAIL | 청첩장 닫기 후 복원된 청첩장 버튼에서 Enter로 다시 열었던 입력 fixture 문제. raw JSON/.log/error-context/전체 영상 보존. |
| ceremony-02 | 1 PASS / 3 FAIL | 동일 원인 재현. Phaser canvas 클릭만으로 DOM 포커스가 옮겨간다고 가정할 수 없었음. 실패 raw/영상 그대로 보존. |
| ceremony-03 | 4 PASS | Enter 반복을 반응 선택 직후 검증하고 청첩장 복귀 후 포인터 반복으로 구분한 집중 재실행. |
| photos-01 | 1 FAIL | resize 직후 옛 bounds 642.890625 > 568. error-context/전체 영상 보존. |
| photos-02 | 1 PASS | resize 반영을 기다리도록 수정한 당시 재실행. list reporter 실행이라 두 photos 탐색 실행의 역사적 raw JSON은 없음. photos-02 전체 영상도 검수 사본에 포함. `logs/exploratory-photos.md`에 한계 기재. |
| regression-all-01 | 81 PASS / 6 FAIL / 3 SKIP | 접수 영구 배너에 대한 이전 기대 2개, 전체 texture 수를 비교해 정상 lazy asset 증가까지 센 검사 4개. 모든 개별 오류·로그·실패 문맥·보유 영상·비미디어 trace 진단 유지. |
| refinement-02 | 10 PASS | 일회 접수 안내와 실제 생성 character atlas에 대한 불변식 검증. 필수 영상의 원 실행이며 최종과 같은 소스. |
| regression-final | 88 PASS / 3 SKIP | 최종 dev 전체 raw, 최종 집계에 포함. |
| production-final | 14 PASS | 최종 production raw, 최종 집계에 포함. |

`reception-01` 1 PASS도 별도 보존했다. 초기 BEFORE 캡처 5초 timeout은 `before/attempt-1-timeout.md`에, 15초 대기 조건으로 정상 이동을 기다린 재실행은 `before/capture-results.json`에 남아 있다. 영상 생성의 이전 export와 최종 export 로그도 보존했으므로 F15 구간을 16.32초로 확장하기 전 기록이 섞여 있다. 현재 전달하는 영상 사양은 `video-manifest.json` 및 `logs/video-final.log`를 기준으로 본다.

위 내용은 Batch C 작업 당시의 수정 이유를 기록한 것이며 이번에 테스트나 게임을 수정했다는 의미가 아니다. 완전한 기록이 없는 탐색 실행은 그 한계를 표시했고, 최종 PASS 수에 실패/재실행을 섞지 않았다.

## 5. 영상과 PNG의 보존

필수 AFTER PNG 15종과 추가 AFTER 5종은 원본 바이트 그대로다. DPR 때문에 PNG 픽셀 해상도는 파일명의 CSS viewport와 다를 수 있다. 크기나 PNG 형식을 변경하지 않았다.

필수 영상 5개는 총 38,111,298 bytes (36.35 MiB)로 작아 **추가 재인코딩·재포장·크롭·자르기를 하지 않았다**. 모두 원본 필수 clip의 SHA-256과 같다. 원래 clip은 실시간 녹화의 앞뒤만 자른 1× VP9 / 25fps / 392×852이며 원본 기록상 decoded frame을 lossless VP9로 담았다. 브라우저 viewport 393×852와 codec 짝수 폭 정렬 차이는 원본 그대로다. 이번에 배속, 프레임 보간, 실패 구간 삭제 또는 UI 선명도 변형을 적용하지 않았다.

포토부스 원 영상 실행 이벤트는 결과 표시 17,634.60ms → 직접 복귀 23,718.10ms(약 6.08초), 신부대기실은 43,384.40ms → 직접 복귀 49,953.20ms(약 6.57초)다. 후자는 결과 감상 뒤 청첩장 왕복도 포함한다. 양쪽 모두 테스트에서 입력 없이 5.5초를 기다린 뒤 결과가 여전히 보이는 것을 확인하고 직접 돌아간다. 상대 시각은 페이지 performance.now 기준이므로 영상 타임코드와 직접 같다고 가정하지 않는다. clip 추출 범위는 video-manifest.json, 당시 영상 이벤트는 video-inputs/에 있다.

빠른 박수·환호 말풍선·한글 UI 확인용 원본 동작 파일 및 대표 디코딩 프레임(video-frames/)을 보존했다. 실패 실행 전체 영상은 runs/에 별도 보존해 성공 clip만으로 실패를 감추지 않는다. 원본의 성공 전체 녹화/대형 trace도 원본 폴더·ZIP에서 유지한다.

## 6. 첫 화면 성능 JSON

`regressions/performance-car.json`, `regressions/performance-subway.json`, `performance-summary.json`에 개별 요청·측정 방법·시간·B 대비 비교가 있다. 각 경로 첫 화면 전체 3,509,311 bytes, 게임 에셋 3,094,744 bytes, B 대비 전체 +1,999 bytes/에셋 +0이다. 로컬 경과 시간은 자차 580ms, 지하철 577ms다. CDP Network encodedDataLength/캐시 비활성, 로컬 production preview, throttling 없음이며 HTML/JS/CSS/응답 헤더 포함 합계다. 실제 모바일 하드웨어나 모바일 통신망 성능 측정이 아니다.

`regressions/load-recovery.json`의 의도적 나중 에셋 1회 실패/재시도는 별도 실험이다. 정상 로딩 오류나 40개 manifest 누락을 통과로 바꾸는 근거가 아니다.

## 7. 검증 소스와 패키징 무수정 증명

- 검증 commit: `a2a31405940560e169c819ee0f2677f073ccba40` + 당시 미커밋 working tree. commit만으로 승인된 A/A1/B 및 C 소스를 재현한다고 주장하지 않는다.
- 검증 source/test/assets fingerprint: `87a0fbfaf3e1c9c0e99c35a6ac132245855c494a0d58c3e653714f7bcb93d287`.
- 검증 runtime fingerprint: `79e097b53690a3d7bf20b1630aafa029f57ca0c1a10cc12dfee2e1b665c74b6d`.
- 최종 고정 시각: `2026-09-13T16:13:09.274317+00:00`.
- `source-final.json`의 278개 해시가 패키징 시 실제 파일과 모두 일치했다. `source-evidence/current-source-check.json`에 현재 commit/dirty 상태/범위와 비교 결과가 있다.
- `changed-files.json`은 C 시작 전 스냅샷과 비교한 27개 소스·테스트·설정 + 3개 문서의 전후 해시다. 기존 A/A1/B dirty 파일을 C 변경이라고 주장하지 않는다.
- `protection-checks.json`은 C 당시 159개 에셋 및 승인된 A/A1/B 증빙 89개 보존 검증이다.
- `preservation-baseline.json`, `preservation-check.json`은 원본 폴더 전체 515개 파일·ZIP의 패키징 전후 해시/크기/mtime 및 게임/명세 파일의 해시 대조다. `review-manifest.json`은 검수용 파일 자체의 크기/SHA-256 목록이다.

## 8. 용량과 제외 파일

용량 원인은 `SIZE_AUDIT.md`, 각 파일/폴더/원본 ZIP 압축 기여분은 `size-audit.json`에 있다. `EXCLUDED_FILES.csv`와 `excluded-files.json`은 검수용에서 제외한 원본 339개 각각의 상대 경로·bytes·SHA-256·제외 이유를 포함한다. 경로는 `docs/game-review/after-batch-c/` 기준이다.

대형 trace 6개를 그대로 복제하는 대신 test/action/DOM/stack/network 및 비미디어 첨부를 바이트 그대로 `trace-diagnostics/`에 추출했다. 추출/제외한 각 ZIP 내부 member의 경로/크기는 `trace-diagnostics/inventory.json`에 있다. 완전한 Trace Viewer 재생에는 원본 trace.zip이 필요하다. 모든 원본은 변경 없이 보관했다. 원본 raw reporter의 절대/임시 첨부 경로는 바꾸지 않았으며 `test-attachments.json`이 검수 사본 또는 보존된 원본 위치를 연결한다.

전체 개별 JSON 결과, 실패 오류/문맥, 보유 실패 영상과 실패 원인 진단 기록은 제외하지 않았다. 원본 패키지에 별도 HTML report는 없어 HTML report 제거에 따른 용량 절감은 없다.
