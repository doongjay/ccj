# 신랑 포토테이블 미세한 선 재검사 — 2026-09-16

## 결과

신랑 사진 1·2·3의 shipping 파일은 artwork 사본 및 사용자가 제공한 `/Users/user/wedding/재준1.jpeg`~`재준3.jpeg`와 바이트/SHA-256이 모두 일치한다. `original-integrity-with-upload.json` 참고.

포토테이블은 원본 JPEG를 브라우저 IMG로 직접 표시한다. 게임 캔버스 안의 저해상도 사진은 숨겨져 있고 CSS image-rendering은 auto이며 사진 위에 선/필터를 추가하는 코드가 없다. 사진 원본이나 표시 코드는 이번 검사에서 변경하지 않았다.

Chromium, DPR 3, 320×568 / 393×852 / 430×932에서 각 3장, 총 9개 실제 포토테이블 PNG를 시각 확인했다. 추가로 그어진 미세한 선은 재현하지 못했다. **사용자가 본 선이 해결되었다고 판정하지 않는다.** iPhone 실기기/Safari에서의 재현은 미검증이다.

## 실행

`cd game` 후 `npm run test:e2e -- --config=../docs/game-review/groom-photo-lines-recheck/scripts/verify-02.config.ts`

3 PASS, 콘솔 및 요청 실패 0. 1→2→3 순서, 양방향 탐색, 마지막→처음, 닫기/Escape, 로비 복귀 위치, 재진입 검증.

첫 `verify.config.ts` 실행은 grep의 시작 앵커 때문에 테스트를 찾지 못해 종료 코드 1. 앵커만 수정한 `verify-02.config.ts` 실행은 종료 코드 0. 원래 설정과 reporter 파일은 보존했다.

`before/photo-table-groom-{1,2,3}-{320,393,430}.png`: 원본 그대로인 현재 화면. 수정하지 않았으므로 AFTER 또는 화질 개선 증빙으로 표기하지 않는다.
