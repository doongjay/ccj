# Batch C 정확한 변경 파일

작업 전 스냅샷(2026-09-13T15:16:11.546637+00:00)과 최종 검증 소스 비교: 소스·테스트·설정 27개, 완료 표시 문서 3개. git HEAD 대비 전체 dirty 목록은 A/A1/B 등 기존 작업을 포함하므로 Batch C 변경 목록으로 쓰지 않았다. 각 파일의 전후 SHA-256은 changed-files.json에 있다. 이번 검수 패키징에서는 아래 파일을 수정하지 않았다.

| 파일 | 목적 |
|---|---|
| `game/src/scenes/IntroScene.ts` | 새 플레이 시작 때 사진/접수 알림 세션 해제 |
| `game/src/scenes/ReceptionScene.ts` | 실제 첫 완료에만 알림 예약 |
| `game/src/scenes/VenueHallScene.ts` | F11 구별되는 응답·일회 타이머, F14 군중 선택·나 표시·캐릭터 리소스 진단 |
| `game/src/scenes/VenueLobbyScene.ts` | F12 수첩 사진, F15 영구 배너 제거·일회 알림 |
| `game/src/scenes/VenueRoomScene.ts` | F12/F13/B-V01 사진 상태·컨트롤 수명·결과·명시적 복귀·완료 횟수 |
| `game/src/ui/sessionMemories.ts` (신규) | 두 개 한도의 세션 사진, 정확한 미니미 크롭, 수첩 썸네일, 접수 알림 일회 큐 |
| `game/src/ui/SceneFeedback.ts` (신규) | 접근 가능한 작은 장면 안내와 종료 시 정리 |
| `game/src/ui/ceremonyGuests.ts` (신규) | 기존 군중 후보, 재현 가능한 중복 없는 선택과 후보 부족 시 순환 |
| `game/src/ui/StoryDialog.ts` | 기존 정보 패널에 사진 콘텐츠를 삽입; 결과 CTA의 키 반복 방지 |
| `game/src/ui/GameAccess.ts` | 청첩장 중 장면 안내도 숨기고 정확히 복원 |
| `game/src/style.css` | 기존 픽셀 프레임을 이용한 결과/수첩 사진/작은 장면 알림 스타일 |
| `game/e2e/story-helpers.ts` | 결과 확인 후 실제 복귀, 게임 canvas 한정 |
| `game/e2e/current-journey.spec.ts` | 양측 전체 포인터 경로/식사 순서/박수·환호/저장·건너뛰기/청첩장·재시작 |
| `game/e2e/lobby-required.spec.ts` | 촬영 결과 명시적 복귀 후 필수 일정과 재시작 검증 유지 |
| `game/e2e/lobby-return.spec.ts` | 결과 복귀 뒤 기존 로비 위치 검증 유지 |
| `game/e2e/reception-only.spec.ts` | 제거된 영구 배너 대신 일회 알림/사라짐/측별 완료 불변식 |
| `game/e2e/review-batch-a.spec.ts` | 새 결과 복귀 동작으로 기존 A acceptance 유지 |
| `game/e2e/review-batch-a1.spec.ts` | 새 결과 복귀 동작으로 기존 A1 acceptance 유지 |
| `game/e2e/review-batch-b-access.spec.ts` | 키보드 사진 결과·포커스·청첩장 복귀 및 양측 반응, C로 증빙 경로 이동 |
| `game/e2e/review-batch-b-floor.spec.ts` | B 증빙 보호를 위한 출력 경로만 C로 이동 |
| `game/e2e/review-batch-b-guidance.spec.ts` | B 증빙 보호를 위한 출력 경로만 C로 이동 |
| `game/e2e/review-batch-b-performance.spec.ts` | C 출력 경로, 기존 CDP 측정에 실제 경과 시간/기준 대비 bytes 추가 |
| `game/e2e/review-batch-c-photos.spec.ts` (신규) | F12/F13/B-V01 사진·세션·반복 입력·크기·5.5초 유지·영상 검증 |
| `game/e2e/review-batch-c-ceremony.spec.ts` (신규) | F11/F14 실제 양측 반응, 청첩장 일시정지, 군중 후보/재사용, 320 및 DPR3 |
| `game/e2e/review-batch-c-reception.spec.ts` (신규) | F15 실제 시간·이동·재방문·청첩장 타이머 일시정지 검증 |
| `game/playwright.review.config.ts` (신규) | dev 전체/production 선별 실행, 직접 파일 JSON reporter, 배치별 artifact 위치 |
| `game/scripts/reconcile-review-tests.mjs` (신규) | 전체 개별 테스트·프로젝트·시도 집계와 요약 정합성 검사 |

문서 완료 표시는 `GAME_REVIEW.md`, `GAME_REVIEW_FINAL.md`, `BATCH_C_IMPLEMENTATION.md`에 기존 발견 내용을 남긴 채 추가한다. 검증 자료/README/보조 도구는 이 폴더에만 추가하며 최종 파일 목록은 artifact manifest에 기록한다. 작업 전부터 변경돼 있던 index.html, package-lock.json, vite.config.ts 등을 이번 수정으로 주장하지 않는다.

## 완료 표시 문서 3개

- `GAME_REVIEW.md`: 원래 발견 내용을 유지하고 C 완료 표시 추가.
- `GAME_REVIEW_FINAL.md`: C 완료 표시 추가.
- `BATCH_C_IMPLEMENTATION.md`: 구현·검증 완료 기록 추가.

원본 검증 산출물 515개 전체 목록은 original-artifact-manifest.json 및 preservation-baseline.json, 검수용 새 문서/사본 전체 목록은 review-manifest.json에 기록한다.
