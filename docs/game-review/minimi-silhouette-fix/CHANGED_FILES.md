# 이번 작업의 정확한 변경 파일

기준은 기존 A/A1/B/C/D를 포함한 시작 working tree다. remote/HEAD 전체 diff가 아니다.

Baseline: `5d4ac562aa022fba3b87c7465788d9e467567af427faec280e69504b2a9744ee`

| 상태 | 파일 | bytes |
|---|---|---:|
| added | `game/artwork/sources/assets/lacitta/characters/sixth-outfits-female-black.png` | 1419729 |
| modified | `game/e2e/minimi-jaw.spec.ts` | 3114 |
| modified | `game/e2e/review-batch-a1.spec.ts` | 9369 |
| modified | `game/e2e/review-batch-b-access.spec.ts` | 11393 |
| modified | `game/e2e/review-batch-b-guidance.spec.ts` | 3145 |
| modified | `game/e2e/review-batch-d-checkpoint.spec.ts` | 11909 |
| modified | `game/e2e/review-minimi-fix.spec.ts` | 9695 |
| modified | `game/e2e/review-minimi-flow.spec.ts` | 9952 |
| modified | `game/e2e/review-neck-loading.spec.ts` | 11981 |
| added | `game/e2e/review-silhouette-ux.spec.ts` | 5365 |
| modified | `game/e2e/story-helpers.ts` | 6839 |
| added | `game/public/assets/optimized/lacitta-characters-sixth-outfits-female-black.webp` | 992584 |
| modified | `game/src/data/guestOutfits.ts` | 1218 |
| modified | `game/src/data/runtimeAssets.ts` | 3156 |
| modified | `game/src/data/shippingAssets.json` | 138772 |
| modified | `game/src/scenes/IntroScene.ts` | 3617 |
| modified | `game/src/scenes/SubwayRouteScene.ts` | 3566 |
| modified | `game/src/scenes/VenueLobbyScene.ts` | 17370 |
| modified | `game/src/ui/StoryDialog.ts` | 9576 |
| modified | `game/src/ui/classicMinimi.ts` | 7739 |
| modified | `game/src/ui/minimi.ts` | 10570 |
| modified | `game/src/ui/minimiParts.ts` | 12042 |

검수 문서·실행 스크립트·이미지·영상은 `docs/game-review/minimi-silhouette-fix/`에 새로 저장한다. 코드 diff는 `source-diff.patch`, 변경 원본/실사용 이미지와 최종 소스는 `sources/after/`에 있다.

## 파일별 목적

- `src/ui/minimiParts.ts`: 짧고 균형 있는 목 실루엣/윤곽과 의상 절단면 정리.
- `src/ui/classicMinimi.ts`: 여성 원본의 이전 중앙 목 윤곽 제거. 개선된 표정/안경/눈 간격 유지.
- `src/ui/minimi.ts`: 머리 y+3 접합 등록 및 여성6 atlas 연결.
- `src/data/guestOutfits.ts`: 여성6 의상 명칭.
- `src/data/runtimeAssets.ts`, `src/data/shippingAssets.json`: 새 여성6 성별 stage 및 실사용 파일/원본 등록.
- 새 PNG 원본과 WebP: 검정 숏 미니 원피스·롱부츠의 6포즈.
- `src/scenes/SubwayRouteScene.ts`: 이전 질문/오답 문구와 동일 출구 선택 표현 복원.
- `src/ui/StoryDialog.ts`: 공통 정보 패널의 화면 터치·키보드 진행 지원.
- `src/scenes/IntroScene.ts`, `src/scenes/VenueLobbyScene.ts`: 저장 안내/첫 안내의 별도 확인 버튼 제거.
- `e2e/minimi-jaw.spec.ts`: 동일 검사 영역을 실제 등록된 턱 좌표로 이동; 임계값과 검사 면적 유지.
- `e2e/review-silhouette-ux.spec.ts`: 새 의상/지하철/터치 입력의 모바일3크기 및 키보드 회귀.
- `e2e/review-minimi-fix.spec.ts`, `e2e/review-minimi-flow.spec.ts`: 새 실사용 atlas를 동일하게 검수하고 새 의상으로 증빙 명칭 변경.
- `e2e/review-neck-loading.spec.ts`: 이전 증빙을 보존하는 독립 출력 폴더 지원.
- `e2e/review-batch-a1.spec.ts`, `e2e/review-batch-b-access.spec.ts`, `e2e/review-batch-d-checkpoint.spec.ts`, `e2e/story-helpers.ts`: 확인 버튼 대신 승인된 터치/키보드 진행 검사.
- `e2e/review-batch-b-guidance.spec.ts`: 원래 지하철 문구와 오답 복귀/정답 도착 검사.

위 상대 경로는 `game/` 기준이다.
