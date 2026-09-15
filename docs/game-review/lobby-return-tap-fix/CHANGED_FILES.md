# 변경 파일

- `game/e2e/current-journey.spec.ts`
- `game/e2e/dinner-pacing.spec.ts`
- `game/e2e/lobby-return.spec.ts`
- `game/e2e/review-batch-b-access.spec.ts`
- `game/e2e/review-batch-d-checkpoint.spec.ts`
- `game/e2e/review-batch-d-venue.spec.ts`
- `game/e2e/review-touch-refinement.spec.ts`
- `game/e2e/story-helpers.ts`
- `game/src/scenes/DinnerJourneyScene.ts`
- `game/src/scenes/VenueLobbyScene.ts`

앱 변경은 VenueLobbyScene.ts(복귀 위치·미완료 홀 이동 방지)와 DinnerJourneyScene.ts(식사 종료 버튼 제거) 두 파일입니다. 나머지는 새 위치와 터치 진행을 반영하는 테스트 및 공통 테스트 헬퍼입니다. 유도선 아트/경로, 얼굴/의상/선택 UI 파일은 이번 작업에서 변경하지 않았습니다.
