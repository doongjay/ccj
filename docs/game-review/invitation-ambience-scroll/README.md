# 모바일 청첩장 장식의 스크롤 위치

- `game/src/ui/InvitationView.ts`: 기존 장식 레이어를 청첩장 본문 안으로 옮겼다.
- `game/src/invitation.css`: 청첩장 장식만 본문 기준 absolute 배치로 바꿨다. 화면 고정 효과를 제거하고, 가로 좌표도 본문 너비를 기준으로 한다. 게임 효과·방명록 저장 로직은 변경하지 않았다.
- 기존 장식 12개, 모양·색·움직임, pointer-events none, aria-hidden, 모션 줄이기 설정을 유지했다.

## 실제 브라우저 확인

`node docs/game-review/invitation-ambience-scroll/verify.mjs`로 Chromium에서 320×568 / 393×852 / 430×932를 확인했다. 각 화면에서 장식이 1.8초 동안 약 18px 움직였고, 280px 스크롤 시 장식도 본문과 함께 약 280px 이동했다(최대 측정 오차 0.21px). 제자리 부유와 스크롤 비고정을 각각 확인했다.

- `browser-results.json`: 좌표, 스크롤 값, 모션 줄이기, 터치 통과, 콘솔 오류 0건, 가로 넘침 없음.
- `top-*.png`, `floating-*.png`, `scrolled-*.png`: 실제 화면 캡처. 393px 전후 화면과 320px 시작 화면을 직접 열어 시각 확인했다.
- `video/`: 393×852에서 실제 속도로 녹화한 스크롤·사진 열기/닫기 영상.
- 최초 샌드박스 실행은 Chromium의 macOS MachPort 권한 오류로 시작하지 못했다. 동일 검증 스크립트에 한정된 권한으로 재실행하여 통과했다.

## 관련 검사

- `game/`에서 `npm run build`: 종료 코드 0. TypeScript와 E2E 타입 검사 포함. 기존 번들 500KB 경고는 유지.
- `npm run test:e2e -- --config=../docs/game-review/invitation-ambience-scroll/playwright.config.ts`: 기존 청첩장 사진 준비/노출/갤러리 테스트 3 PASS. `regression.json`에 개별 결과 기록.
- 방명록 저장 테스트는 실행하지 않았다. 에셋 변경이 없어 에셋 검사는 재실행하지 않았다.
