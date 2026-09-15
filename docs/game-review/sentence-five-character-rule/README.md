# 마침표 기준 줄바꿈 — 2026-09-16

- 공통 StoryDialog: 마침표 앞 문장 길이가 5자 이상일 때만 자동 줄바꿈. 마침표/앞뒤 공백 제외, 문장 내부 공백 포함. 5자 미만은 원래 띄어쓰기 유지.
- 소수점, URL 내부 점, 말줄임표는 문장 마침표로 처리하지 않는다. 물음표·느낌표로 새 줄을 추가하지 않는다. 작성된 명시적 줄바꿈은 유지한다.
- 자동차 문장 중간의 명시적 줄바꿈 제거. `양재IC랑 가깝군.\n그런데 진입구에 유도선이 많은데?`로 표시한다.

## 검증

`cd game` 후 `npm run test:e2e -- --config=../docs/game-review/sentence-five-character-rule/scripts/verify-02.config.ts`

- 최종 6 PASS: 320×568 / 393×852 / 430×932에서 각각 문장 규칙과 실제 차량 주행.
- 4자/5자/6자 경계, 소수점/URL/말줄임표, 명시적 개행, 정보 패널, 타이핑 전후 높이 유지 검증.
- 실제 질문 텍스트 Range가 한 줄인지 검사. 3개 폭의 car-choice PNG를 직접 확인.
- 노란색 오답 복귀 → 파란색, 분홍색 → 타워, 파란색 → B3 → 로비 경로 및 콘솔 오류 없음.
- 첫 실행 `logs/browser.json`: 3 PASS / 3 FAIL. 소수점을 문장 경계로 잘못 세어 5자 판정이 틀렸음. 구현 수정 후 `logs/browser-02.json`: 6 PASS. 실패 trace/video 보존.
- AFTER: `after-02/`, `runs/browser-02/**/car-choice-*.png`.
