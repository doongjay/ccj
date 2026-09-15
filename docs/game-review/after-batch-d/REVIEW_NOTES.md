# Batch D 검증 해석과 한계

최종 판정과 집계는 README 및 최종 dev/production reporter를 따른다. 이전 소단위 PASS는 최종 PASS 수에 합산하지 않는다. 모든 브라우저 실행은 로컬 Chromium 자동화이며 실제 iPhone/Android 사용자 검증이 아니다.

## 보존 및 검사 범위

- 작업 전 commit/dirty/312개 파일 스냅샷은 `baseline.json`. 이번 변경 patch는 그 스냅샷 기준이며 HEAD 기준의 이전 A/B/C 변경을 섞지 않는다.
- 기존 A/B/C 증빙 962개와 이미지/폰트 154개를 SHA-256으로 대조한다. 제작 원본 56개는 삭제하지 않고 `game/artwork/sources/`에 그대로 보존한다. `preservation.json`, `asset-bytes-preserved.json` 참고.
- shipping 검사는 테스트 PASS와 별도다. 실제 public 전체, production 복사, 32개 단계 key, CSS/청첩장 동적 URL, 98개 이미지/폰트의 계약을 검사한다. 기존 미등록 40개의 각각의 근거는 `asset-audit.md/json`에 있다.
- 공개 파일 전체를 스캔하며 확장자/폴더 제외로 오류를 숨기지 않는다. 제작 원본 이전은 무손실 파생본의 실제 URL과 제작 도구 참조를 확인한 뒤 이루어졌다.
- 출처는 저장소의 제작 기록과 사용자 제공 자료에 한정한다. 기존 제공 자료를 이 앱에서 유지하는 근거를 자유 재배포 라이선스로 확대하지 않는다. 과거 .omo 생성 원본은 현재 저장소에 없어 제작 ledger 이상의 새 생성 증명은 주장하지 않는다.

## 실패와 테스트 수정 이유

1. `assets-unit-01`은 sandbox Chromium 실행 권한 실패. 정상 실행은 승인된 로컬 브라우저 권한으로 수행했다.
2. `assets-unit-02`의 10개 오류는 검사기 구현 문제도 포함했다. 기존 alpha 최대254 UI와 흰 꽃의 alpha 계조는 원래 계약을 적용했다. Canvas premultiply 반올림 때문에 손실 없는 WebP 비교를 원시 ffmpeg RGBA로 수행한다. 브라우저 decode/alpha/frame 검사는 유지한다. 이미지 재가공이나 임계값 확대는 하지 않았다.
3. `input-motion-01/02/03`: QA observer 설치 누락, 촬영 준비 전 입력 경쟁, 실행하지 않는 Phaser flash의 초기 alpha=1을 플래시로 오해한 측정 오류를 각각 보존했다. 실제 준비 상태를 기다리고 `isRunning`과 alpha를 함께 기록한다. 실제 입력·5.5초 사진 유지·직접 복귀 조건은 유지했다.
4. `frame-01/02`: 실제 #app 첫 canvas margin이 부모 밖으로 합쳐져 body가 viewport보다76px 커졌다. `display: flow-root`로 부모 안에 포함했다. screenshot 높이를 늘리거나 overflow를 가려 통과시키지 않았다. `frame-02-collapsed-margin.json`은 수정 전 실측이다.
5. `animation-01`의 실제 tap 좌표는 CSS 픽셀 양자화로229.007/998.488에 도착했다. 기존 B floor 검증과 같은 3 logical px 미만 도착 조건을 사용한다. 실제 바닥 전 경로/발 앵커/다른 목적지 탭, 10/50/250ms 프레임에서 같은 이동 거리·cadence 조건은 그대로 검사한다.
6. 박수 합성의 초기 두 버전은 숫자 검사 통과 뒤에도 의상 허리의 잘림을 시각적으로 발견해 채택하지 않았다. 두 버전 PNG는 `runs/animation-01/02/`에 남아 있다. 최종은 기존 의상의 전체 bent-arm/seated 포즈를 사용한다. 서 있는 다리가 그대로라는 주장을 하지 않으며, 같은 머리·발끝·native pivot과 작은 손 움직임을 검사한다.
7. `resources-01`: Phaser Text는 매 scene에서 새 UUID texture를 만든다. UUID 문자열 자체를 동일 비교하던 검사를 고쳤다. 최종 검사는 정적 key, 임시 texture 개수, 총 decoded pixel bytes, listener/photo/overlay 수가 같고 이전 Text UUID는 실제 해제됐음을 요구한다. 전체 브라우저 메모리 안전성 인증은 아니다.
8. 타입 검사 실패들은 원본 build 로그에 보존한다. MediaQueryList 관찰 wrapper의 null listener/배열 타입을 바로잡았으며 런타임 기준을 완화하지 않았다.
9. 통합 수집 시 Node23의 JSON import attribute 누락이 발생했다. `avatar-alpha.spec.ts`에 `with { type: "json" }`를 명시했다. `regression-launch-02/03.json` 및 launch-03.log 보존. 앞선 두 direct 실행은 도구 직렬화 오류로 완전한 stdout을 회수하지 못했다. 파일 출력 실행은 실제 원인과 종료1을 기록했다. 이는 게임 플레이 FAIL이나 PASS로 집계하지 않는다.
10. F20에서 6장 자동 표시 단계를 없앴으므로 `tap-pacing.spec.ts`는 3장 수동 넘김/원본 픽셀 변화/자동 종료 없음/직접 종료를 검증한다. 과거 자동 단계명을 기다리는 검사도 현재 표시와 조작으로 대조한다. 식사 조건이나 종료 접근성을 제거하지 않는다.
11. 첫 전체 실행 `regression-01.json/log`는109 PASS /3 FAIL /3 SKIP, exit1이었다. `Player.updateBlink`가 Dinner 내부 redraw에서 이미 제거된 자식 Sprite를 같은 프레임의 queued UPDATE에서 참조한 실제 오류로 신부측 pointer/keyboard meal-first 두 경로가 멈췄다. 제거된 child에는 갱신하지 않는 수명 guard를 추가했다. listener 해제 자체는 유지한다. 세 번째 실패인 `lobby-required.spec.ts`는 제거된 자동 `buffet` 단계명 대신 실제3장 카드와 직접 완료 버튼 표시를 검사하며 나머지 필수 조건·완주·재시작 assertions는 보존한다. 이 실패 실행 전체를 최종 재실행과 별도로 보존한다.
12. 두 번째 전체 실행 `regression-02.json/log`는112 PASS /3 SKIP, exit0이었다. 그러나 추가320px 재개 화면 검사에서 두44.375px 버튼의 영역이1.78125px 겹쳐 이 상태를 최종본으로 확정하지 않았다. 중복 안내 문구를 빼고 이어하기 버튼만16 logical px 위로 옮겼다. 최소 터치 크기는 그대로이며 수정 후 간격5.328125px, 실제 Continue 입력 PASS. 기존 사진1장/2장 복구 테스트에320/393/430 각각의44px·간격4px 이상·화면 내 위치 검사를 추가했다. 전후 PNG와 `resume-layout-01.json`, `resume-layout-after.json`을 보존한다.
13. 추가 화면 검사 첫 실행은 전체 테스트가 자신의 서버를 종료한 순간과 겹쳐 reload가 `ERR_CONNECTION_REFUSED`로 끝났다(`logs/resume-layout-01.*`). 이는 orchestration 실패이며 앱 손상으로 집계하지 않는다. 자체 서버를 사용한 다음 실행은 실제 겹침 FAIL(`resume-layout-02`), 수정 후에는 실제 입력까지 PASS(`resume-layout-03`)이다. 세 결과를 모두 보존한다.

초기 일부 소단위의 CLI stdout 전체는 별도 파일로 회수되지 않았다. 해당 원본 reporter의 모든 테스트/시도/오류 및 실패 context/trace는 남아 있다. 최종 실행은 stdout/stderr 전체 로그를 보존한다. `retries: 0`의 별도 재실행을 자동 retry로 부르지 않는다.

## Checkpoint 계약

`ccj.wedding.checkpoint.v1`, schema1/asset-composition1. 촬영 시점 외형과 구도 버전만 저장하며 고해상도 base64를 localStorage에 넣지 않는다. 같은 현재 자산에서 수첩 사진을 지연 재구성하고 완료 수를 늘리지 않는다. 호환되지 않는 버전/외형 범위/모순 진행은 새 방문 안내로 처리한다. 구버전 사진 파일을 복원했다고 표시하지 않는다.

`처음부터`는 방문 checkpoint/세션 사진만 정리하며 `wedding.guestMessages`는 보존한다. quota/접근 거부/손상 JSON fixture와 실제 사진·식사 순서·예식 중 reload·메시지 저장/생략 경로는 구분해 기록한다.

## 플랫폼과 증빙 한계

- 설치된 Playwright 1.62.1의 Chromium/Headless Shell 사용. WebKit/Firefox는 설치되어 있지 않아 실행하지 않았다.
- 320×568, 393×852, 430×932, 852×393, 1440×900 DPR1과 기존 C의 DPR3 대표 자동 캡처. 실제 폰 safe area, 주소창 동작, OS 소프트 키보드는 미검증이다. viewport 높이 변경은 실제 브라우저 toolbar 검증과 다르다.
- 공유/방명록 QA는 로컬 데이터와 전송 stub만 사용했다. 외부 배포·공유·전송을 수행하지 않는다.
- Vite의 단일 bundle 500kB 경고는 로그에 유지한다. 실제 첫 화면 전체5,000,000 bytes 검사는 별도 CDP 측정이며 경고를 숨기거나 한도를 올리지 않는다.
- 동작 영상은 원래 속도이다. 정상 박수/환호 클립과 pause/resume 검증을 분리한다. photo 결과의5.5초 유지와 직접 복귀를 보존한다. 원본 영상은 로컬 runs에 남으며 큰 trace에서 추출한 event/network/stack만으로는 완전한 Trace Viewer 재생이 되지 않는다. 제외 파일은 경로/크기/해시/사유 목록으로 남긴다.
- F24는 후보 선별 문서만 작성했다. F24 실제 아트 재수출/필터링 및 F25 신규 음식 선택은 시작하지 않았다.


## 최종 집계 및 SKIP3건

최종 dev `npm run test:e2e -- --config=playwright.review.config.ts --workers=3 --output=../docs/game-review/after-batch-d/runs/regression-03`는112 PASS/3 SKIP, exit0(15.2분). production `npm run test:e2e -- --config=playwright.review-production.config.ts --workers=2`는32 PASS, exit0(8.4분). 둘 다retry0, FAIL0. 서로 다른 논리 테스트116개, 총147 project cases=144 PASS/3 SKIP. 별도 local-server2 PASS,320 resume-layout1 PASS 및 Node음성 fixture5 PASS는 main과 구분한다.

| dev에서 SKIP한 정확한 테스트명 | 프로젝트 | 사유 및 dev 미검증 범위 | 대응 검증 |
|---|---|---|---|
| F09 production cold cache: opening and first car lobby transfer | chromium | Transfer evidence requires the production preview config. dev 모듈 응답으로 production 자차 전송량을 판정하지 않음 | chromium-production PASS |
| F09 production cold cache: opening and first subway lobby transfer | chromium | Transfer evidence requires the production preview config. dev 모듈 응답으로 production 지하철 전송량을 판정하지 않음 | chromium-production PASS |
| F09 production: branded opening and retry after one deliberately failed later asset | chromium | Recovery evidence uses the production build. dev 실행에서 production 초기 표시·retry 동작은 미검증 | chromium-production PASS |

별도 정상 shipping 명령은 `npm run verify:assets -- --report ../docs/game-review/after-batch-d/assets-final.json`, exit0, 원본 로그 `docs/game-review/after-batch-d/logs/assets-final.log`. 전체98개/97image decode/old40 추적40/errors0. 음성 fixture 명령은 `node --test scripts/verify-shipping-assets.test.mjs`, fixture5개 PASS(exit0), 의도한 내부 shipping checker는각exit1. 원본 `logs/assets-negative-final.log`와 `assets-negative-final.json` 참고. public/dist의 실제 PNG손상 및 sheet 계약 오류2건도 대표 브라우저 검사로 실패를 확인했다. 이 결과를112/32 집계 뒤에 숨기거나 대체하지 않는다.

정상 5174 서버의 첫 화면과 freeze 소스 해시 비교, 실제 결과5.504초 유지→직접 복귀→reload→Continue→동일 사진 수첩은별도2 PASS였다. 이 개발 서버는 `package.json`의`dev: vite`로실행했으며 다른 프로세스를 종료하지 않았다. UI 연결 브라우저 도구는 `No browser is available`이므로 기존 사용자 탭을 열었다고 주장하지 않으며, 실제 첫 화면은 Playwright Chromium으로 확인했다.

원본 PNG와 영상은 원래 속도/내용을 유지한다. ffmpeg 프레임 추출 중9.8초 pause clip의13초 요청은파일을 만들지 않았으며 INDEX에미생성으로표시했다. 실제47프레임만 시각 증빙이다. 01/02/10stream-copy의원본연속packet hash와상대timestamp 일치를검증했다.

추가 서버 수명 실패의 원본 reporter는 처음 config 상대 경로 때문에 `docs/game-review/after-batch-d/logs/resume-layout-01.json`(이 증빙 폴더 기준)에 생성됐다. 원본을 보존하고 검수용 접근 경로 `logs/resume-layout-01.json`에 바이트 동일 복사했다. 최종 unit-run-history는 이 결과를 포함한27개 별도 실행이다.
