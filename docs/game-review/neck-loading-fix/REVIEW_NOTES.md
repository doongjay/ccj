# 검수 기록과 한계

## 기준과 보존

- 완료된 D 위에서 수정했다. D와 이전 minimi-fix 폴더/ZIP을 수정하거나 덮어쓰지 않았다.
- 이전 검수의 목선 시각 PASS는 사용자가 반려했으므로 이번 기준으로 재검수했다. 이전 idle과 같다는 결과를 정상 외형의 근거로 쓰지 않는다.
- 시작 소스는 `baseline.json`의 313파일 fingerprint `be97b486050067692d366db12e3be305c9167df34694353bc0f6ab3c281afaed`이다. 이전 AFTER와 byte-identical임을 확인한 뒤 이번 BEFORE로 복사했다. 원래 사용자 3조합의 동일 조건 4x/실제 화면 BEFORE는 이 복사본이다.
- 사용자의 후속 의상 추가로 정면 조합은 남성 54 + 여성 54 = 108이다. 원래 90개에 각 성별 6번 의상 9개씩 추가했다. 새 의상에는 존재하지 않는 BEFORE를 만들지 않았다.
- 실제 화면/비디오와 아틀라스 전수 렌더링은 구분한다. 아틀라스는 108정면/26개 파츠/13대표×19동작이다. 실제 여정은 사용자 남성3 + 여성3 + 새 남성6번의 7조합이며 108조합 전체를 각각 게임 끝까지 플레이했다는 의미가 아니다.

## 확인한 코드 원인

1. `neckPart()`의 `#dea073` 12×2px 채움이 모든 조합 y80–81에 동일한 횡단 띠를 만들었다. 이를 제거하고 기존 턱 가장자리까지 올라오는 양쪽 목 외곽과 동일한 폭의 양쪽 피부 음영으로 연결했다. 목 피부 자체를 지우지 않았다.
2. 의상 파츠에 원래 피부가 남아 있어 공유 목 위에 다시 칠해졌다. 특히 긴팔티셔츠 posing의 밝은 주황색 픽셀은 기존 `r-g <85` 판정 밖이어서 남았다. 목 안의 밝은 peach 피부 범위를 바로잡았다. 어두운 봉제 테두리와 밝은 아이보리 원단은 유지한다.
3. 새 랩 원피스의 목 내부 잘린 가장자리에는 chroma 배경과 섞인 어두운 픽셀이 있었다. 정면/posing/seated의 피부 개구부 안에서만 원본 경계를 비워 공유 피부가 보이도록 했다. V자 원단 테두리는 보존했다.
4. 기존 첫 얼굴 썸네일의 괄호 제거/눈 흰자 잔여 픽셀 수정은 유지했다. 안경만 사용자 요청에 따라 정수 픽셀로 그리는 둥근 테로 변경했다.

## 시각 검수와 재시도

- `before/neck-diagnosis.png`: 원래 공통 띠와 좌우 음영 불균형을 실제 합성 출력에서 확인.
- `iterations/neck-01-before-round-glasses/`: 최초 목 수정, 사용자 후속 의상/안경 요청 이전. 최종 증빙이 아니다.
- `iterations/neck-02-before-aperture-and-final-sizing/`: 108조합 생성 후 새 원피스의 내부 잔여 경계 발견. 최종 증빙이 아니다.
- `iterations/ux-01/`: 최초 통합 UX 검증. 320×568 시작 버튼 하단 잘림을 시각 검수에서 발견하여 글자/터치 크기 대신 여백을 줄였다.
- `runs/capture-1789391206107/`: 17개 검증 중 원본 티셔츠 포즈 피부 경계를 추가 발견해 코드 수정. 진행 중인 여성 네이비 랩 여정은 Vite HMR로 CarRouteScene에서 IntroScene으로 재시작되어 실패했다. 해당 실패의 trace/video/error-context/JSON을 보존한다. 이 실행 전체를 고정된 최종 소스 검증으로 사용하지 않는다. 최종 소스로 다시 실행한다.
- `logs/capture-02-interrupted.log`: 동작 확대에서 추가 의상의 잘린 피부 경계가 남아 있음을 발견하여 직접 중단했다. 4 PASS / 1 interrupted / 12 not run이다. 해당 기록은 최종 검증으로 집계하지 않는다.
- `iterations/aperture-01/`: 3 PASS였으나 확대에서 새 원피스 포즈의 1px 잔여물과 뒷목의 녹색 chroma 잔여물을 발견해 추가 정리했다. 기존 핑크 원피스/회색 재킷의 U자 목둘레와 새 셔츠의 실제 카라보다 위에 있는 원본 피부 절단 경계만 제거했다.
- `logs/capture-03-interrupted.log`: 베이지 재킷 포즈의 밝고 채도 높은 피부 경계 픽셀을 발견해 직접 중단했다. 4 PASS / 1 interrupted / 12 not run을 보존한다. 실제 어두운 옷깃과 구분되는 피부 픽셀 범위만 추가했다.
- `logs/regression-01-interrupted.log`: 기존 아틀라스 시각 검사의 고정 15열/90타일/45blink가 새 의상6을 누락하므로 직접 중단했다. 29 PASS / 2 interrupted / 84 not run. 실제 source.width에서 열 수를 구해 18열/108타일/54blink로 확대하고 기존 투명도/눈 깜빡임 몸통 불변 검사를 그대로 유지했다.
- 회귀 2차의 성별 버튼 검사 2건은 사용자 요청 전 `52px`를 기대하여 실패했다. 이를 정확히 `78px`로 바꿨다. 로비 검사와 뷔페 터치 검사의 옛 `.buffet-preview`/음식 화살표 요구도 새 수용 기준인 6장 표시와 별도 진행 입력으로 바꿨다. 관련 실패 trace는 보존한다.
- 아틀라스/썸네일 검사 1건은 별도 플레이 녹화와 병행 중 30초 제한을 초과했다. 시간 제한을 늘리지 않고 녹화가 끝난 뒤 같은 조건으로 재검사한다.
- 타입 검사 실패: `logs/build-01.log`(선택적 keepsake 반환값 미처리), `logs/build-03.log`(새 테스트의 미사용 import). 수정 후 재검사한다. 검사 기준/timeout을 완화하지 않았다.
- 에셋 1차 검사 stdout은 도구 출력 상한으로 일부 생략되었으나 `assets-01.json`은 전체 개별 결과를 보존한다. 최종 검사는 충분한 출력 상한으로 별도 로그에 보존한다.

## 수첩 보고의 범위

첫 수첩 클릭이 포토부스 장면으로 이동한다는 현상은 320/393/430의 새 방문에서 재현되지 않았다. 기존 코드는 클릭 후 사진 복원을 기다린 다음 수첩을 열었다. 이제 같은 입력 이벤트에서 수첩을 즉시 열고, 완료된 사진 복원 결과만 아직 열려 있는 해당 패널에 추가한다. 터치 첫 클릭, 재방문 및 저장 사진을 가진 이어하기를 검사한다. 재현되지 않은 원인을 확정했다고 보고하지 않는다.

## 뷔페의 기존 연출 출처

`git ls-remote origin HEAD`로 확인한 원격 HEAD는 `a2a31405940560e169c819ee0f2677f073ccba40`이다. 이 트리에는 `DinnerJourneyScene.ts`/현재 실사 음식6장 연출이 없다. 보존된 `/private/tmp/ccj-batch-d-baseline/game/src/scenes/DinnerJourneyScene.ts`의 실제 기존 연출을 확인해 복원했다. 음식 등장 중 터치로 6장을 완성하고, 다음 터치로 문장/다음 단계로 진행한다. 음식 페이지 화살표를 요구하지 않는다.

## 테스트 변경의 이유

기존 애니메이션 머리/발/포즈 비교를 삭제하거나 약화하지 않았다. 의상 수가 5→6이므로 전수 범위 90→108, 프레임 열 15→18, 동작 대표 11→13으로 확대했다. 체크포인트의 유효 인덱스는 0–5이며 손상 입력 검사의 범위 밖 값은 5→6으로 옮겼다. 사용자 요청으로 바뀐 의상 페이지/뷔페 조작/안내문/메시지 문구의 검사만 새 수용 기준으로 변경했다. asset decoder 비교는 실제 카탈로그 전체 미디어 개수에 맞추며 손상 이미지/잘못된 시트의 거부 조건은 유지한다.

## 환경 한계

Chromium 실제 브라우저의 CSS viewport 및 touch emulation 검증이다. 실제 iOS/Android 기기의 주소창·safe area·OS 키보드 검증을 완료했다고 주장하지 않는다. F24 전체 아트 재가공/F25는 시작하지 않았다. 추가 의상과 유도선은 이번 사용자 명시 요청 범위다.

## 최종 개발 회귀와 별도 재검사

전체 115건 실행은 `regressions/logs/regression-1789392785505.json`에 106 PASS / 6 FAIL / 3 SKIP으로 남아 있다. 사용자 요청으로 바뀐 성별 높이 2건, 뷔페 관련 2건, 촬영 배치 1건의 기존 기대값을 수정했고, 병행 녹화 중 30초를 초과한 아틀라스 1건은 같은 30초 제한으로 다시 실행했다. 촬영 배치의 옛 `.story-photo` 선택자를 실제 `.story-group-photo`로 바꾸고 버튼이 카메라 프레임의 1004/1280 아래에 있는지 검사했다. 신랑·신부 얼굴의 원본 픽셀 검사는 그대로 유지했다.

6건 재검사는 `regressions/logs/regression-1789394353050.json`에서 6 PASS(1.6분)다. 아틀라스는 12.1초로 통과했다. 이는 동일한 애플리케이션 소스에서 전체 실행과 실패 사례 재검사를 합친 112 PASS / 개발 전용 3 SKIP 범위이며, 단일 전체 실행이 모두 초록이었다고 보고하지 않는다. 전체 실행 뒤 게임 코드·에셋은 바뀌지 않았고 테스트의 기대값만 수정되었다. 이전/현재 `applicationFingerprint`는 모두 `66283a3bcfb6ae55488a3fcb531ea2336e081db09a8d2602cf90353a13c1f08b`다. 대응표는 `TEST_RESULTS.json`의 `failureResolution`에 있다.

최종 시각·실제 여정 캡처는 17 PASS, 별도 세 폭의 가림 없는 renderer 출력은 1 PASS, 개발 서버 첫 화면은 1 PASS다. 테스트 기준이나 timeout을 낮추거나 실패 이미지를 정상 baseline으로 등록하지 않았다. 기존 저장 사진 PNG는 과거의 결과물이므로 임의 재합성하지 않는다. 수정 후 새로 촬영한 결과와 저장·복원된 픽셀의 동일성을 검사했다.

## 의도적 SKIP 3건

| 테스트명 | 개발 프로젝트 | 사유 | 개발 실행에서 미검증인 범위 |
|---|---|---|---|
| F09 production cold cache: opening and first car lobby transfer | chromium | Transfer evidence requires the production preview config. | 배포 빌드의 자동차 첫 화면·첫 로비 전송량 |
| F09 production cold cache: opening and first subway lobby transfer | chromium | Transfer evidence requires the production preview config. | 배포 빌드의 지하철 첫 화면·첫 로비 전송량 |
| F09 production: branded opening and retry after one deliberately failed later asset | chromium | Recovery evidence uses the production build. | 배포 빌드의 초기 로딩·후속 에셋 실패 재시도 |

모두 `review-batch-b-performance.spec.ts`다. 별도 `chromium-production` 실행에서 같은 3건은 실제 수행하여 통과했다. 중단된 실행의 `stats.skipped`에는 interrupted/not-run이 섞여 있으므로 이 3건과 합산하지 않는다. 원본 reporter와 각 마지막 시도 상태를 함께 제공한다.

최종 production 실행은 `npm run test:e2e -- --config=playwright.neck-production.config.ts --workers=2`, 종료0, 32 PASS / 0 FAIL / 0 SKIP(9.7분)이다. 전체 출력은 `logs/production-final.log`, 개별 결과는 `regressions/logs/production-1789394473585.json`에 보존한다. 자동차/지하철, 신랑/신부, 식사 순서, 메시지 저장/건너뛰기, 사진 보존, 정상 박수/환호, 오류 저장소, 세 모바일 폭의 뷔페를 실제 production 브라우저에서 확인했다.

## shipping 검사와 성능

`game/`에서 `npm run verify:assets -- --report ../docs/game-review/neck-loading-fix/assets-final.json`을 셸 리디렉션이나 다른 명령 없이 독립 실행했다. 종료 코드 0. 전체 stdout은 `logs/assets-final.log`, 개별 결과는 `assets-final.json`이다. 등록100 / 검사100 / 디코딩99 / runtime34 / 보존원본56 / 이전40건 추적40 / 오류0이다. 정상 shipping 검사 결과이며 이전 40건을 임의로 숨기거나 검사 조건을 완화하지 않았다. 이 결과는 Playwright PASS/SKIP 수에 포함하지 않는다.

첫 화면 전송은 3,514,909 bytes, 에셋 전송은 3,094,744 bytes로 5 MB 목표를 통과했다. 직전 빌드 전체 전송보다 916 bytes 증가했고 에셋은 동일하다. 시간 측정은 로컬 단일 관찰이므로 성능 개선을 주장하지 않는다. 세부 기준과 원본 경로는 `LOADING.md`에 있다.
