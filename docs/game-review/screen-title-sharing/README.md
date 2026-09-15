# 원판 스크린 · 청첩장 제목 · 공유 동작

2026-09-16. 실제 Chromium과 production preview에서 검증. 로컬 개발 서버 http://127.0.0.1:5174/ 유지. 외부 배포/실제 메시지 발송 없음.

## 변경

- 하단 `게임으로 초대받기`와 일반 공유 버튼을 `링크 복사` / `카카오톡으로 전달`로 교체.
- 링크 복사는 현재 청첩장 canonical 주소에 `#invitation`을 붙이고 추적 query를 제거한다.
- 카카오 SDK가 준비되면 기존 카드 공유를 호출한다. 미설정/미준비 환경은 기기 공유창, 지원하지 않으면 제목과 링크 복사로 연결한다. 복사 권한이 없으면 직접 선택 가능한 읽기 전용 텍스트를 제공한다.
- 현재 로컬 프로젝트에 Kakao JavaScript key가 없어 **실제 카카오 수신 검증은 하지 않았다**. SDK 호출과 payload는 브라우저 모의 SDK로 검증했고 native share도 모의 수신값을 검사했다. 실제 링크 복사 UI/선택창/모바일 배치는 렌더링 검증했다. 카카오 직접 연동 조건은 공식 문서 https://developers.kakao.com/docs/ko/kakaotalk-share/js-link 참고.
- 게임 복귀는 상단 `게임으로 돌아가기`에 유지. 상단 메뉴는 버튼 텍스트가 세로로 쪼개지지 않도록 두 줄 grid로 배치. 터치 44px와 focus 유지.
- 브라우저 title, OG/Twitter title, 공유 title/text, 앱 이름을 `현서와 재준, 현재의 시작`으로 통일.
- 원판 스크린에 `JJ ♥ HS`와 `WE ARE GETTING MARRIED`를 공통 helper로 표시. 첫 화면의 기존 위치/폰트 유지. 원판 안내문/촬영 버튼/하객 위치 유지.

## 실행과 결과

작업 디렉터리는 `game`. 설정 파일은 이 폴더의 `scripts/`.

- `npm run build`: PASS (tsc, e2e typecheck, Vite). 기존 큰 JS chunk 안내는 보존.
- `npm run test:e2e -- --config=../docs/game-review/screen-title-sharing/scripts/verify.config.ts`: 23 PASS / 1 FAIL. 로그 `logs/browser.json`, 실패 trace/video는 `runs/browser/review-batch-d-resources-*`에 보존.
- `npm run test:e2e -- --config=../docs/game-review/screen-title-sharing/scripts/sharing-nav.config.ts`: 7 PASS. 링크/공유/clipboard 거절/Kakao payload와 로비→청첩장→기존 수첩 복귀. 초기 캡처에서 메뉴 글자 단위 줄바꿈을 발견하여 CSS 정리 후 재검증.
- `npm run test:e2e -- --config=../docs/game-review/screen-title-sharing/scripts/resources-retry.config.ts`: 1 PASS. 첫 시도는 첫 주기에서 예정된 background prefetch가 시작하기 전에 청첩장을 열어 로비 timer가 멈추고 두 번째 주기에서만 세 texture가 준비되어 비교 실패. 제품 로딩 코드를 변경하지 않고 **두 주기 모두 기존 예약 prefetch 완료를 관찰한 후** 동일한 texture/listener/decoded bytes 비교를 유지했다. 제한 완화나 texture 제외 없음. 하단 restart CTA 삭제에 맞춰 상단 복귀 후 기존 restartVisit 수명주기를 직접 호출함을 테스트에 명시했다.
- `npm run test:e2e -- --config=../docs/game-review/screen-title-sharing/scripts/production-final.config.ts`: 1 PASS. 최종 build의 cold cache 첫 화면 **3,517,300 bytes** (CDP, HTML/JS/CSS/headers 포함), 5 MB 이하. JSON `production-final/regressions/performance-car.json`. 중간 측정도 `production/`에 보존.

원판 background 비교는 요청된 두 문구의 실제 text bounds만 분리하여 문구가 실제 렌더링됨을 확인하고, 그 밖의 배경 픽셀 차이는 **0**을 유지한다. 문구 없는 idle을 새로운 visual baseline으로 등록하지 않았다.

## 실제 화면 검수

- 320×568 / 393×852 / 430×932: 링크 복사/카카오톡 전달 버튼, 상단 두 줄 메뉴를 직접 캡처 확인. `after/share-actions-*.png`, `after/invitation-navigation-*.png`.
- 같은 세 폭에서 신랑/신부측 박수·환호, 원판 준비·촬영·결과, 하객 인사와 버튼 가림 여부 검증. `after/group-photo-ready-*`, `after/group-photo-result-*`, `after/ceremony-*`.
- 393 reduced motion, 잔디 통로, 신랑 ceremony-first / 신부 meal-first 전체 여정, 결과 메시지 save/skip/복귀 검사.
- `after/group-screen-uncovered-393.png`: 실제 countdown에서 스크린 전체 문구 확인.
- 최종 관련 브라우저 검사에 미해결 실패 없음. 위 최초 실패 기록은 삭제하지 않음. 전체 저장소 모든 과거 테스트를 재실행했다는 의미는 아님.

별도 shipping 검사는 `../bridal-minimi-reuse/assets-final.json` **exit 1**: 원본 사진 23개 개별 용량 + shipping 전체 용량, 총 24건. UI 테스트 PASS와 구분한다. 기준 변경/원본 JPEG 재압축 없음.

정확한 변경 파일은 `CHANGED_FILES.md`, 이번 작업 전후 diff는 `change.diff`, 검증 소스 hash는 `source-after.json`.
이전 A/A1/B/C/D 증빙과 ZIP은 보존. F24 실제 아트 재가공/F25 작업 시작하지 않음. 신부대기실 수정은 별도 사용자 요청이며 `../bridal-minimi-reuse/README.md`에 기록.
