# 오답 안내 문구 변경 — 2026-09-16

## 적용 내용

- 지하철 1·2·3·4번 출구 오답: `셔틀 버스는 5번 출구 앞 이었던것 같은데...`
- 노란 유도선 → 이마트: `여긴 이마트 주차장이네.` 다음에 명시적 줄바꿈, `주차 정산이 안될테니 다른 유도선을 타야겠군.`
- 게임 코드 변경은 위 두 문자열뿐이다. 선택지, 회색 비활성화, 이동 경로, 타이핑/대기 시간, 배경과 미니미는 유지했다.

## 변경 파일

- `game/src/scenes/SubwayRouteScene.ts` — 지하철 오답 문구.
- `game/src/scenes/CarRouteScene.ts` — 이마트 안내 문구 및 줄바꿈.
- `game/e2e/review-batch-b-guidance.spec.ts` — 정확한 문구 검사와 캡처.
- `game/e2e/route-tried-disabled.spec.ts` — 세 화면 크기의 실제 오답 문구/접근성 레이블 검사와 캡처.
- `game/e2e/review-batch-d-venue.spec.ts` — 변경된 문구 기대값.
- `game/e2e/review-touch-refinement.spec.ts` — 변경된 문구 기대값.
- `game/e2e/review-silhouette-ux.spec.ts` — 변경된 문구 기대값.

마지막 세 테스트 파일은 기대 문구만 갱신했다. 이번 실행 대상 8건은 아래 두 spec이며, 전체 테스트 실행으로 보고하지 않는다.

## 검증

작업 디렉터리: `/Users/user/wedding/ccj/game`

```sh
npm run test:e2e -- --config=../docs/game-review/route-wrong-copy/scripts/final.config.ts
npm run build
```

- Playwright 실제 Chromium: **8 PASS / 0 FAIL / 0 SKIP**, 종료 코드 0.
- `review-batch-b-guidance.spec.ts`: 첫 화면 → 설정 → 자동차/지하철 → 오답 → 재선택 → 로비, 393×852에서 각 경로 1건.
- `route-tried-disabled.spec.ts`: 320×568, 393×852, 430×932 × 자동차/지하철, 총 6건. 이마트와 지하철 오답 출구 4개를 실제 선택하고 새 문구, 비활성화 상태, 터치·Tab 동작, 복귀 위치, 정답 경로의 로비 도착, 새 여정 초기화를 검사했다.
- 실행된 테스트의 console error / pageerror 없음. 첫 화면부터 진행한 두 경로에서 requestfailed 없음.
- 두 장면의 세 화면 크기 PNG를 실제로 열어 확인했다. 문구 잘림 없음. 이마트 첫 문장 뒤 줄바꿈 적용, 긴 두 번째 문장은 화면 너비에 맞춰 자연 줄바꿈된다.
- `npm run build`: TypeScript, e2e 타입 검사, Vite 빌드 종료 코드 0. Vite의 500 kB 초과 청크 경고는 `logs/build-final.log`에 보존했다.
- 첫 화면 성능/에셋 검사는 이번 문구 변경에서 재실행하지 않았다.

## 증빙

- `after-final/car-wrong-copy-{320,393,430}.png`
- `after-final/subway-wrong-copy-{320,393,430}.png`
- `after-final/regressions/` — 첫 화면부터 진행한 두 경로의 선택/오답/재선택 화면.
- `after-final/*-tried-*.png` — 재선택 상태.
- `logs/final.json` — 최종 개별 결과·요약 및 테스트별 첨부 검사 기록.
- `logs/build-final.log` — 빌드 결과.
- `source-before/`, `change.diff` — 이번 수정 직전 원본과 정확한 변경 diff.
- `source-fingerprint.json` — HEAD와 251개 소스 파일 해시, 직전 검증본과 달라진 7개 파일 목록.

## 최초 실행과 재검증

최초 실행(`scripts/after.config.ts`)은 5 PASS / 3 FAIL이었다. 새로 추가한 자동차 안내의 접근성 레이블 검사가 선택 화면용 `.story-car`에 한정되어 있었다. 실제 이마트 안내는 기존 동작에 따라 `.story-parking`으로 바뀌므로 잘못된 locator가 재선택 화면을 기다렸다. 해당 검사 대상을 현재 `.story-narration`으로 바로잡고 정확한 기대 문자열을 유지했다. 게임 로직과 대기 시간을 변경하거나 검사 조건을 완화하지 않았다.

최초 `logs/after.json`, `runs/after/`의 실패 trace와 기록, `after/`의 스크린샷은 보존하고, 최종 실행은 별도 경로에 저장했다. 이전 검수 폴더/ZIP도 덮어쓰지 않았다.

로컬 서버: http://127.0.0.1:5174/
