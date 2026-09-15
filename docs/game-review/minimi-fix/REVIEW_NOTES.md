# 실패·재실행·한계 기록

## 코드와 시각 버전

기준은 이미 완료된 D 작업 트리다. 원본 D의 304파일 SHA-256과1125증빙 경로/해시는 `baseline.json`에 보존했고 새 결과를 D 폴더에 쓰지 않았다. Git commit만으로 이번 변경 전 소스를 대표할 수 없으므로 시작 시 파일 복사본과 비교했다. 현재 검증 파일은 `source-fingerprint.json`에 기록한다.

1. **BEFORE**: D 복사본 상태에서 실제3조합×4viewport와 정면 전수/단품을 캡처했다. `logs/before.json/log`2PASS는 D 아트가 정상이라는 뜻이 아니다.
2. **Iteration01**: 넓힌 눈 영역과 의상 목 처리 후 자동2PASS였으나 헤어 침범/아이보리 목 구멍을 시각 발견해 탈락. `iterations/01/`, `logs/iteration-01.*`를 남겼다.
3. **Iteration02**: 실제 피부만 정규화해 정면/단품의 카라를 복구. 캡처2PASS,실제 flow3PASS,동작 생성1PASS였지만 옆얼굴에 오래된 눈 잔재와 일부 추가 의상 posing 접합 틈이 남아 최종 승인하지 않았다. `iterations/02/`에 해당 캡처/동작/flow와 이 시점 source2파일을 보존했다.
4. **Iteration03**: 방향별 eye bounds/위치 수정 후 캡처2PASS와 motion-02 1PASS. 4개 extra outfit의 손든 포즈 목 anchor 결함은 별도로 남아 source-specific neckline 데이터로 수정했다. `iterations/03/motion/`은 이 마지막 anchor 수정 전 이미지다. 이 폴더 최상단 .ts 복사본3개는 anchor 수정 후에 저장되어 그 PNG와 정확히 같은 버전이 아니다. 잘못된 버전쌍으로 오인하지 않도록 ZIP에서는 이3개 중복 source 복사본을 제외하며 원본 폴더에서는 보존한다.
5. **Final**: 최종 source에서 `motion-03`1PASS,`final-capture`2PASS,`flows-final`3PASS. 사용자3조합 실제 화면과 11대표 동작을 다시 확인했다. 전수 idle90조합 페이지가 실제 확인한 iteration02와 바이트 동일함도 확인했다. 마지막 app 수정 이후 전체 dev/production/build/shipping을 다시 실행했다.

## 중간 전체 회귀 실행의 실패와 중단

첫 전체 dev 실행은 최종 아트 수정 전이며 production/flow/동작 생성도 동시에 실행되어 있었다. `minimi-visual.spec.ts`의 전체 썸네일 테스트가 **30초 제한에 걸려 실패**했다(해당 result duration 약40.4초). 자원 경쟁은 가능한 원인이지만 확정 진단하지 않는다. 동작 시각 결함을 수정해야 했으므로 전체 실행을 Ctrl-C로 중단했다. 결과는 **46PASS /1FAIL /2INTERRUPTED /66 did-not-run,exit130**이며 최종 통과 수에 합치지 않는다. 당시 HMR와 중단에 걸린 F01/A1의 Intro/Reception 관찰도 interrupted 결과로 보존했다.

기록: `logs/reg-iteration02-complete.log`, `logs/regression-final-iteration02.json`, `regressions/logs/regression-final.json`, `regressions/runs/regression-final/`. timeout 테스트의 원본 trace ZIP/실패 스크린샷/error-context는 검수 ZIP에 포함한다. assertion/timeout을 변경하지 않고 수정 후 전체 실행에서 같은 테스트를 다시 돌렸다. 최종 결과는 TEST_SUMMARY에서 확인한다.

최종 전체 dev에서는 해당 `minimi-visual.spec.ts`가17.2초에 통과했고, 전체115건은112PASS/3SKIP/0FAIL/자동retry0으로 완료했다(20.3분,exit0). 이전 실패를 삭제하거나 최종 성공으로 치환하지 않았다. 빌드/캡처/회귀 동안 변경한 앱3파일의 최종 fingerprint는 동일하게 유지했다.

중간 production도 위 시각 수정 때문에 종료했다. **5PASS /2INTERRUPTED /25 did-not-run,exit130**, `logs/prod-iteration02-complete.log`, `logs/production-final-iteration02.json`과 원본 trace/context를 보존했다. 이 결과 역시 최종 결과로 합산하지 않는다. 일부 `*-iteration02.log`는 tool stdout을 회수한 중간 조각이며 `*-complete.log`가 완전한 종료 출력이다.

## 정상 shipping 검사와 sandbox 실패

- `assets-final.json`/`logs/assets-final.log`: 앞선 build의 정상 검사 exit0. JSON reporter는 전체이며 해당 CLI 출력 회수본에는 truncation 한계가 있다. 최종 shipping 근거로는 아래03을 사용한다.
- `logs/assets-final-02.log`: 최종 build 검사 시 Chromium 실행이 sandbox의 macOS mach-port 권한 문제로 막혀 **exit1**. 검사 기준/에셋을 변경하지 않았다. 이 실패 로그를 보존한다.
- `assets-final-03.json`/`logs/assets-final-03.log`: 같은 검사기를 허용된 실행에서 재실행. **exit0,98등록/98검사/97decode,errors0,기존40건 추적**. 로그 전체 보존. 이 shipping 결과는 Playwright PASS/SKIP 수와 별도다.

사용자의 마지막 실행 방식 보충 이후에는 검사 script 자체를 바꾸거나 보안 설정을 넓히지 않았다. 앞으로 `game` workdir에서 `npm run verify:assets -- --report <새 경로>`를 독립 실행한다. `>`/`2>&1`이나 다른 명령과 묶지 않고 가변 경로를 승인 접두사에 넣지 않는다. 권한이 필요할 때 허용 접두사는 `['npm','run','verify:assets']`로 한정한다. 로그는 실행 결과를 별도 새 파일로 보존한다. 보충 이전의 실패·성공 로그는 그대로 보존한다.

## SKIP3와 미검증 범위

dev `chromium` 프로젝트에서 다음3개는 기존 설정대로 SKIP이다.

| 테스트명 | 사유 | dev에서 미검증 범위 |
|---|---|---|
| F09 production cold cache: opening and first car lobby transfer | `Transfer evidence requires the production preview config.` | production 자차 첫 화면/첫로비 cold-cache 전송량 |
| F09 production cold cache: opening and first subway lobby transfer | `Transfer evidence requires the production preview config.` | production 지하철 첫 화면/첫로비 cold-cache 전송량 |
| F09 production: branded opening and retry after one deliberately failed later asset | `Recovery evidence uses the production build.` | production 브랜드 로딩 및 의도한 실패 후 재시도 |

동일3개를 `chromium-production`에서 별도로 실행했으며 대응 개별 결과와 요약은 TEST_SUMMARY에 기록한다. SKIP을 PASS로 바꾸거나 삭제하지 않았다. production recovery의 실패 요청1건은 의도한 white-car abort이며 정상 경로의 console/request errors와 구분한다.

실제 phone safe-area/OS키보드/주소창, 다른 브라우저 엔진,90조합의 모든 실제 플레이/모든 동작은 미검증이다. 동작 대표11조합과 실제 사용자3조합의 검증을 전체90조합 동작 전수로 확대해 쓰지 않았다. 아트 정면90개는 계산·생성뿐 아니라 실제 원본/4× 시각 확인을 완료했다.

## 패키지 제외

`EXCLUDED_FILES.json`은 원본 경로/바이트/SHA-256/사유를 기록한다. 과거 배치의 중복 전체 녹화, 반복 성공 테스트 영상, 중복 iteration bulk atlas, interrupted trace의 대형 binary resources 등을 ZIP에서만 제외한다. 실패 reporter/context와 trace core는 포함하며 timeout 원인 확인용 trace는 전체 포함한다. trace core만 제공한 중단 기록은 원본 binary snapshot/resources가 빠져 Trace Viewer 전체 재생이 불가능할 수 있다. 원본 trace와 모든 파일은 작업 폴더에 보존한다.

TEST_SUMMARY는 대형 attachment body를 반복 내장하지 않고 원본 JSON reporter 경로·body 길이·해시로 연결한다. 원본 reporter의 개별 결과/오류/attachment body는 수정하지 않고 그대로 ZIP에 포함한다. 중간 motion은 native 전체 pose 페이지와4× 접합·옆얼굴·손든 포즈의 실패 근거를 포함하고, 그와 중복인 개별 프레임만 제외한다. 최종209프레임은 native/4× 전부 포함한다. 최초308,111,271바이트 패키지 초안도 `/private/tmp/ccj-minimi-fix-review-full-intermediate.zip`에 보존했으며, 최종 ZIP은 위 중복만 줄였다.
