# 하객 측별 포토테이블 — 2026-09-16

신랑측은 **재준1 → 재준2 → 재준3**, 신부측은 **현서1 → 현서2 → 현서3** 순서로 표시한다. 로비의 기존 세 액자도 왼쪽부터 같은 순서다. 하객 측은 아바타 성별과 독립적으로 적용된다.

사진의 전체 구도와 비율을 유지했으며, 배경·프레임·캡션·이전/다음·닫기·수첩 완료 처리·복귀 위치는 유지했다. 모바일 청첩장 사진/갤러리는 변경하지 않았다. 전달된 원본 여섯 장은 바이트 그대로 저장했고, 게임용 파일은 별도로 준비했다.

## 파일

- `game/src/data/photoGallery.ts` — 양측의 사진 순서와 공통 선택 함수.
- `game/src/data/runtimeAssets.ts` — 양측 사진의 별도 로딩 단계.
- `game/src/systems/stageAssets.ts` — 선택한 하객 측의 세 사진만 로비 진입에 준비.
- `game/src/scenes/CarRouteScene.ts`, `game/src/scenes/SubwayRouteScene.ts` — 이동 중 로비와 선택 측 사진을 미리 준비.
- `game/src/scenes/lobbyPhotoWall.ts` — 같은 목록으로 기존 액자 내부를 채움.
- `game/src/systems/PhotoGalleryModal.ts` — 같은 목록을 실제 포토테이블 순서에 적용.
- `game/src/data/shippingAssets.json` — 여섯 사진의 출처·해시·크기·로딩 단계 등록. 이전 게임 사진도 보존된 비활성 에셋으로 유지.
- `game/artwork/sources/photo-table/{groom,bride}-{01,02,03}.jpeg` — 원본 보관 6개.
- `game/public/assets/optimized/photo-table-{groom,bride}-{01,02,03}.jpg` — 게임용 6개.
- `game/e2e/photo-gallery.spec.ts` — 기존 갤러리/프레임 검사를 새 사진 키에 맞춤.
- `game/e2e/photo-table-personalized.spec.ts` — 양측 순서·화면 크기·선택 로딩·재입장·측 변경 검증.

자세한 원본과 변환 기록은 `ARTWORK.md`, `asset-import.json`, `asset-import-final.json`에 있다. `source-before/`, `change.diff`, `source-fingerprint.json`에는 이번 변경만의 원본·diff·검증 소스/에셋 해시를 보존했다.

## 검증 결과

관련 게임 검증 **17개 모두 최종 PASS**: 첫 실행 13 PASS / 1 FAIL, 실패한 새 테스트의 장면 대기 수정 후 해당 1개 PASS, production 3 PASS. 별도 사진 준비 1 PASS. 전체 프로젝트 테스트 실행으로 보고하지 않는다. 실패·재시도 기록과 명령은 `logs/commands.md`에 구분했다.

- 실제 Chromium에서 신랑측/신부측 × 320×568·393×852·430×932의 세 사진 순서와 로비 액자 확인.
- 여섯 사진의 실제 표시, 구도 유지, 버튼 겹침 없음, 첫 사진 재시작, 끝→첫 사진 순환, 키보드·포인터·Escape, 복귀 위치와 수첩 진행도 확인.
- 기존 갤러리 회귀: 390×844, 430×932, 720×1280, 1440×1000. 모달 뒤 이동/접수 입력 차단, 닫은 후 이동, 양측 로비 시설 이용 확인.
- 신랑측→신부측→신랑측으로 바꾸었을 때 세 액자 목록과 첫 사진을 검사하고, 돌아온 신랑측 액자 텍스처의 픽셀이 처음과 정확히 같은지 확인.
- 정상 경로에서 console/page/request 오류 없음. 생산 빌드의 의도적인 요청 실패 및 복구는 별도 기록.
- `npm run build`, e2e 타입 검사 성공.
- 독립 실행한 정상 `verify:assets`: **107 registered / 107 checked / 106 decoded / errors 0**, 종료 코드 0. 전체 public 및 dist 파일·출처·해시·예산 검사 유지.
- 생산 빌드의 첫 화면 cold-cache 전체 전송량: 자동차/지하철 모두 **3,517,339 bytes**, 5,000,000 이하. 첫 화면에서 새 사진 요청 0건. 첫 로비까지 선택한 측 3장만 요청, 반대 측과 이전 포토테이블 JPEG 요청 없음.
- 게임용 사진 총 1,259,790 bytes. 한 여정은 신랑측 674,713 bytes 또는 신부측 585,077 bytes만 사진으로 추가 로딩한다.

## 화면과 영상

- `after/lobby-{groom,bride}-{320,393,430}.png`
- `after/photo-table-{groom,bride}-{1,2,3}-{320,393,430}.png`
- `after/lobby-frames-{groom,bride}-4x.png` — 실제 로비 사진 텍스처 부분을 nearest 4배로 확대한 확인용 이미지.
- `runs/after/` — 실제 속도 WebM, 추가 화면, 개별 상태 기록, 최초 실패 증빙.
- `runs/side-switch/` — 하객 측 변경 최종 검증 영상.
- `production/regressions/performance-{car,subway}.json` — 첫 화면/로비 전체 요청과 전송량.
- `assets-final.json`, `logs/{after,side-switch,production,prepare}.json` — 에셋 검사와 개별 테스트 결과.

재준1 사진의 첫 sips 변환에서 나온 검은 출력은 시각 검사에서 발견해 교체했다. 해당 출력과 실행 기록을 `first-conversion/`, `asset-import.json`에 보존했다. 최종 파일은 정상 사진을 표시하는 Chromium 디코드와 sRGB Canvas를 사용해 생성했고 여섯 사진 모두 실제 포토테이블에서 확인했다. 원본 사진이나 얼굴을 수정하지 않았다.

기존 검수 폴더와 ZIP은 덮어쓰지 않았다. 로컬 개발 서버: http://127.0.0.1:5174/
