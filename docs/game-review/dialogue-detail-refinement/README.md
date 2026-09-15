# 안내 문구·원판 사진 말풍선 수정 — 2026-09-16

## 적용

- 접수 후 `접수 완료 ♥ 수첩에 남겼어요` 안내와 이를 위한 큐·타이머를 제거했다. 접수 완료 플래그, 수첩 진행도, 복귀 위치는 유지했다.
- 신부대기실 가는 길의 `입구 →` 텍스트를 제거했다. 장면 제목과 자동 이동·입장은 유지했다.
- 원판 촬영 대기와 결과의 나레이션을 모두 화면 너비 90%, 좌우 여백 5%로 복원했다. 기존 세로 중심 y=364는 유지했다. 393 너비에서 패널 너비 251.52 → 353.69 CSS px, 측정 세로 중심은 전후 모두 363.984 world px였다. `layout-comparison.json` 참조.
- 원판 촬영 대기 중 하객 말풍선의 글자·패딩·테두리·꼬리를 50% 크기로 다시 그린다. 완성된 비트맵을 축소하는 방식은 사용하지 않았다. `행복해!`를 추가해 다섯 인사말이 순환한다. 사진 버튼을 누르거나 장면을 나가면 정리되며 청첩장 일시정지와 동작 줄이기 설정을 유지한다.
- 공통 나레이션과 정보 패널은 일반 문장의 마침표 다음에 줄바꿈한다. `어라.`, `아하.` 같은 짧은 감탄사, 말줄임표, 숫자/URL 내부 점은 보존한다. 기존 명시적 줄바꿈은 중복하지 않는다. 타이핑 공간을 미리 계산할 때도 동일한 서식을 적용한다. 캔버스로 표시하는 봉투 작성 나레이션에도 문장 뒤 줄바꿈을 적용했다.

## 정확한 변경 파일

게임 코드:

- `game/src/scenes/VenueLobbyScene.ts` — 접수 완료 안내 생성 제거.
- `game/src/scenes/ReceptionScene.ts` — 안내 예약 제거, 봉투 작성 나레이션 줄바꿈.
- `game/src/ui/sessionMemories.ts` — 제거된 접수 안내의 임시 큐 정리.
- `game/src/scenes/GreeneryCorridorScene.ts` — 입구 화살표 텍스트 제거.
- `game/src/scenes/VenueHallScene.ts` — 작은 하객 말풍선 사용 및 `행복해!` 추가.
- `game/src/ui/speechBubble.ts` — 글자·테두리·꼬리를 함께 줄이는 선택 옵션. 기본 크기의 박수/환호 말풍선은 유지.
- `game/src/style.css` — 두 원판 나레이션의 공통 너비 및 줄바꿈 표시.
- `game/src/ui/StoryDialog.ts` — 공통 문장 줄바꿈, 예약 공간과 타이핑에 같은 서식 적용.

테스트:

- `game/e2e/hall-overlay-layout.spec.ts` — 너비·중심·다섯 인사말·축소 크기 및 두 입구 표기 부재 확인.
- `game/e2e/reception-only.spec.ts` — 사용자 요청에 따라 접수 안내의 부재를 확인하고 기존 접수/이동 검사를 유지.
- `game/e2e/review-batch-c-reception.spec.ts` — 제거된 안내 타이머 검사 대신 실제 접수부터 복귀·수첩·청첩장·재방문까지 안내가 한 번도 삽입되지 않는지 MutationObserver로 확인.
- `game/e2e/story-sentence-lines.spec.ts` — 일반 문장·짧은 감탄사·말줄임표·숫자/URL·기존 줄바꿈, 표시 전후 위치 검사.
- `game/e2e/envelope-copy-lines.spec.ts` — 봉투 작성 안내 줄바꿈·겹침 없음·터치 완료 검사.

## 실제 브라우저 검증

**관련 테스트 37 PASS / 0 FAIL / 0 SKIP. 전체 프로젝트 테스트 실행은 아니다.**

작업 디렉터리: `/Users/user/wedding/ccj/game`

```sh
npm run test:e2e -- --config=../docs/game-review/dialogue-detail-refinement/scripts/after.config.ts
npm run test:e2e -- --config=../docs/game-review/dialogue-detail-refinement/scripts/envelope.config.ts
npm run build
npm run typecheck:e2e
```

- 첫 명령 34 PASS, 두 번째 명령 3 PASS. 모든 명령 종료 코드 0.
- 실제 Chromium, 320×568 / 393×852 / 430×932. 기존 접수 전용 회귀는 390×844도 포함한다.
- 원판: 신랑측/신부측 × 박수/환호 × 세 화면 크기, 동작 줄이기, 청첩장 일시정지, 촬영/결과/다음 이동. 공통 배경의 메인 화면 스크린 픽셀 재사용 검사도 통과.
- 접수: 양측 접수와 수첩 반영, 걷기, 포토부스/포토테이블 재방문, 청첩장 열기·닫기. DOM 감시에서 접수 안내 생성 기록 0건.
- 신부대기실: 통로에서 제목만 남고 입구 표기는 없으며, 걷기 후 실제 신부대기실로 진입.
- 줄바꿈: 8개 문구 사례 × 세 화면 크기, 9개 공통 배치와 실제 10개 선택 장면의 타이핑 전후 위치 안정성. 자동차/지하철 오답→재선택→로비, 뷔페 터치 진행도 통과.
- 오류를 수집한 각 테스트의 console error / pageerror 목록은 비어 있다. 개별 기록은 JSON reporter와 첨부 파일에 보존했다.
- PNG를 직접 열어 원판 대기/결과, 작은 말풍선과 `행복해!`, 접수 후 로비, 신부대기실 통로, 유도선 안내, 감탄사 예외, 뷔페와 봉투 안내를 확인했다.
- 빌드의 500 kB 초과 청크 경고는 `logs/build.log`에 보존했다. 이번에는 에셋 검사나 첫 화면 bytes를 재측정하지 않았다.

## 증빙 위치

- `after/group-photo-ready-*.png`, `after/group-photo-result-*.png` — 넓어진 원판 나레이션.
- `after/guest-greeting-*.png` — 다섯 인사말과 작은 말풍선.
- `after/reception-complete-no-banner-393.png` — 접수 안내 없이 수첩 1/3.
- `after/greenery-corridor-393.png` — 입구 화살표 삭제.
- `after/sentence-lines-*.png`, `after/regressions/` — 줄바꿈 및 자동차/지하철 실제 경로.
- `after-envelope/envelope-lines-{320,393,430}.png` — 봉투 작성 나레이션.
- `runs/after/` — 실제 속도 WebM, 추가 화면, 개별 위치/상태 측정 기록.
- `logs/after.json`, `logs/envelope.json` — 개별 결과와 집계.
- `source-before/`, `change.diff`, `source-fingerprint.json` — 수정 직전 소스, 정확한 변경 diff, HEAD와 253개 파일 해시.

이전 검수 화면(`../group-screen-match/after-final/`, `../hall-overlay-refinement/after-final-02/`)과 원본 ZIP은 그대로 보존했다. 얼굴·미니미 아트, 배경 에셋, 자동차 경로는 이번 수정 대상에 포함되지 않는다. 로컬 개발 서버는 http://127.0.0.1:5174/ 에서 유지한다.
