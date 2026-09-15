# 포토테이블 하단 멘트 제거

신랑/신부 6장 모두 caption 데이터와 Text 생성/갱신을 제거했다. 사진 원본·순서·좌표·카운터·이전/다음/닫기 기능은 그대로다.

수정: `game/src/data/photoGallery.ts`, `game/src/systems/PhotoGalleryModal.ts`.

`npm run build` 성공. 기존 `photo-table-personalized.spec.ts`의 신랑/신부 393×852 케이스 2개 PASS; 6장 이동과 닫기/진행도/로비복귀/원본 표시/콘솔 확인. `after/`의 실제 6장 화면에서 하단 멘트 제거를 확인했다. 기존 증빙은 보존.
