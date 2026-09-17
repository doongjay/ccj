# 시어터·원판 사진·엔딩·타워주차장·청첩장 수정

2026-09-18, 기준 소스 `bce415f` 위에서 수정했다. 기존 얼굴, 원본 사진, 방명록 저장/전송 구현과 유도선 배경은 유지했다.

## 변경 파일

- `game/src/scenes/VenueHallScene.ts`: 시어터 안내를 처음부터 두 줄로 고정하고, 카메라 HUD를 촬영 시 제외할 수 있는 컨테이너로 묶었다.
- `game/src/ui/photoResult.ts`: 전체 화면 대신 실제 뷰파인더 내부 `(40, 510, 640, 485)`를 원래 픽셀 그대로 촬영한다. REC·타이머·포커스 UI는 사진에 넣지 않는다.
- `game/src/scenes/EndingScene.ts`: 메인 화면과 동일한 배경·스크린 글자·분홍 픽셀 하트를 사용한다. 보내는 사람과 공개 안내를 분리했다.
- `game/src/ui/TextEntryDialog.ts`, `game/src/style.css`: 보내는 사람은 더 큰 별도 줄, 공개 안내는 작은 한 줄. ‘나중에 남기기’는 배경·테두리 없는 텍스트 버튼이며 44px 터치 영역과 키보드 포커스를 유지한다.
- `game/src/scenes/parkingArt.ts`, `game/src/scenes/CarRouteScene.ts`: 분홍 경로는 적층 주차칸과 입고 플랫폼이 있는 타워로 진입한다. 차가 `(360,760)`에 멈춘 뒤 셔터가 닫히고 로비로 이동한다. 노랑/파랑 경로·목적지·진행 조건은 유지한다.
- `game/src/ui/weddingAmbience.ts`, `game/src/invitation.css`: 청첩장 전체에 12개였던 장식을 화면 높이마다 12개로 복구했다. 종이에 붙은 위치에서 움직이며 스크롤을 따라오지 않는다. 크기 변경과 청첩장 닫기의 정리를 포함한다.
- `game/src/ui/InvitationView.ts`, `game/src/invitation.css`: ‘게임으로’ 메뉴, `2026년 11월 21일 (토)`, 같은 도트 폰트의 더 작은 `오후 2시 라시따시어터`. 카카오맵은 `라시따시어터` 검색 링크로 변경했다. [카카오 공식 URL 문서](https://apis.map.kakao.com/web/guide/#searchurl)의 `/link/search/검색어` 형식을 사용한다.
- `game/src/data/invitationSource.json`: 주소 표시와 복사값을 `서울 서초구 양재동 215 (매헌로 16)`으로 변경했다.
- `game/e2e/ceremony-ending-parking.spec.ts`: 위 동작의 브라우저 검증과 화면/영상 기록.
- `game/e2e/invitation-photo-loading.spec.ts`, `game/e2e/review-batch-b-access.spec.ts`, `game/e2e/review-batch-d-resources.spec.ts`: 복귀 버튼의 새 이름으로 선택자만 변경했다.

## 검증

`game/`에서 실행했다.

- `npm run build`: 종료 코드 0. 소스/E2E 타입 검사와 배포 빌드 통과. 기존 500KB 번들 경고는 남아 있다.
- `npm run test:e2e -- --config=../docs/game-review/ceremony-ending-parking/playwright.config.ts ceremony-ending-parking.spec.ts`: 최초 10 PASS, 0 SKIP/FAIL (`local-01.json`).
- `npm run test:e2e -- --config=../docs/game-review/ceremony-ending-parking/playwright.config.ts`: 최종 **26 PASS, 0 SKIP/FAIL/FLAKY** (`local-02.json`).
- `npm run test:e2e -- --config=../docs/game-review/ceremony-ending-parking/production.config.ts`: **3 PASS, 0 SKIP/FAIL/FLAKY** (`production-01.json`).

실제 Chromium 320×568 / 393×852 / 430×932에서 다음을 확인했다.

1. 시어터 안내가 글자마다 표시되는 동안 각 글자의 좌표를 완성 문장 좌표와 비교했다. 세 크기 모두 이동 0.5px 이하. 촬영 결과의 모든 채널 값을 HUD 없는 실제 화면의 뷰파인더 영역과 비교해 차이 0, 결과 크기 640×485를 확인했다. 5.5초 감상 후 직접 ‘다음으로’를 눌러 식사 장면으로 이동했다.
2. 공개 안내는 한 줄에 들어오며 보내는 사람보다 작고 그 아래에 위치한다. 저장 기능을 호출하지 않고 로컬 가짜 클라이언트 설정으로 공개 안내의 실제 분기를 표시했다. ‘나중에 남기기’를 터치해 엔딩으로 이동하고 메인 화면과 스크린 글자 좌표가 같은지 확인했다.
3. 청첩장 메뉴의 화면 밖 넘침 없음, 터치 높이 44px 이상. 장식을 잠시 멈춰 220px 스크롤 시 종이와 함께 220px 이동하는지 확인했다. 상단·중간·하단에서 화면당 10–14개의 가시 장식을 확인했다. 날짜/주소/카카오맵 검색 URL 및 게임 복귀를 확인했다. 휴대폰 카카오맵 앱 자체 실행은 검증하지 않았다.
4. 노랑(320px)·분홍(393px)·파랑(430px)을 각각 실제 선택해 주행하고 도착지를 확인했다. 노랑 오답 후 파랑 재선택도 확인했다. 타워는 차가 입고칸에서 정지한 다음 셔터가 닫히고 로비에 도착했다.
5. 포토부스·신부대기실·원판 사진의 로컬 감상과 복귀, 메인/원판 스크린 재사용, 직접 청첩장 열기·갤러리·실패 후 재시도, 플레이 중 사진 준비 후 청첩장 왕복 시 로딩창 없음, 느린 후속 에셋에서 현재 화면 유지도 통과했다.
6. 배포 빌드 캐시 없는 첫 화면은 자차/지하철 검사 모두 **3,544,973 bytes**였다. 5MB 이하이며 뒤쪽 장면이나 갤러리를 첫 화면에 추가 다운로드하지 않는다. 첫 화면 준비 UI와 고의로 실패시킨 자동차 에셋의 키보드 재시도도 확인했다. 의도한 실패 외 콘솔/페이지 오류 없음. `regressions/`에 전송량과 재시도 상세 JSON을 보존했다.

## 화면·영상

- `after/`: 직접 열어 확인한 대표 원본 PNG 9개 — 시어터 문구(320), 원판 결과(393), 엔딩 입력(320), 감사 화면(393), 청첩장 메뉴(320), 날짜/주소(393), 타워 입고/셔터 닫힘.
- `runs/local-02/`: 각 테스트의 원본 PNG와 실제 속도 WebM 영상. 사진 감상 대기와 직접 복귀를 포함한다. 저장소에는 대표 PNG와 JSON을 포함하며 전체 영상은 로컬 폴더에 보존한다.
- `runs/local-01/`과 `local-01.json`: 첫 검사 기록도 덮어쓰지 않고 보존했다. 마지막 실행에서는 보내는 사람 이름을 넣고 날짜 제목이 보이도록 촬영 위치만 보완했다.

방명록 저장 테스트와 에셋 검사는 실행하지 않았다. 방명록 저장 코드·에셋 바이트·검사 기준은 변경하지 않았다.

`신부대기실 안내 멘트도 "1층 ATM을 지나면" ->` 요청은 화살표 뒤 대체 문구가 없어서 기존 안내를 유지했다. 길 안내를 임의로 만들지 않았다.
