# 원판 사진 스크린 통일 / 포즈 준비 문구 삭제

## 반영

- `game/src/scenes/VenueHallScene.ts`: 첫 화면에서 이미 사용하는 `venue-hall` 이미지의 스크린 부분을 원판 사진에서도 그대로 표시한다. 원본 478×270 픽셀을 게임 좌표에서 1:1로 재사용하며, 새 이미지 다운로드나 스무딩을 추가하지 않는다. 스크린 중심은 기존 안내와 같은 y=364이다. 원판의 필름 모양 테두리는 모두 가려지고, 다른 배경·인물·촬영 프레임·버튼은 유지된다.
- `game/src/scenes/VenueRoomScene.ts`: 포토부스·신부대기실 공통 코드에서 ‘잠시 포즈를 준비하고 있어요’ 표시와 해당 표시의 정리 코드 삭제. 이동, 포즈, 촬영, 결과 표시와 직접 복귀는 유지한다.
- `game/e2e/group-screen-reuse.spec.ts`: 실제 원판 장면의 스크린 픽셀을 첫 화면 원본과 비교하고, 촬영 후 첫 화면에 돌아와도 전체 배경이 유지되는지 검사한다.

직전 완료본 대비 기존 소스 변경은 위 제품 코드 두 파일뿐이다. 정확한 diff는 `this-change.diff`, 변경 파일과 보존 파일의 SHA-256은 `source-fingerprint.json`에 있다. 에셋 파일 자체와 승인된 얼굴·의상은 변경하지 않았다.

## 검증

최종 **6 PASS / 0 FAIL / 0 SKIP**:

- 포토부스·신부대기실 실제 촬영과 사진 결과 유지, 수첩 보관, 명시적 복귀: 기존 `review-batch-c-photos.spec.ts` 1건. 로그·사진·영상은 [pose-notice-removal](../pose-notice-removal/)에 별도 보존했다.
- 320×568 / 393×852 / 430×932 예식·원판 배치, 촬영과 다음 버튼, 축하 인사 및 393×852 모션 줄이기: 기존 `hall-overlay-layout.spec.ts`에서 해당 4건.
- 원본과 화면의 스크린 129,060 픽셀 비교: 차이 0. 촬영 뒤 Intro 복귀 시 기본 텍스처와 전체 배경 유지: 새 검사 1건.
- 브라우저 콘솔·런타임 오류 0. `npm run build` 통과(소스 및 E2E 타입 검사 포함). 기존 Vite 청크 크기 경고 유지.
- `game/src`와 최종 `game/dist`를 검색해 포즈 준비 문구 및 제거한 표시 핸들러가 남아 있지 않음을 확인했다.

초기 스크린 재사용 구현에서는 텍스처에 프레임을 추가하는 방식이 Phaser의 기본 프레임에도 영향을 주는 점을 코드 검토에서 발견했다. 최종본은 개별 이미지에 crop을 적용하므로 공유 텍스처를 바꾸지 않는다. 초기 소스와 4건의 중간 검사 결과도 삭제하지 않고 보존했다. 최종 결과는 `logs/final.json`이다.

검사 명령(`game/`에서 실행):

```sh
npm run test:e2e -- --config=../docs/game-review/pose-notice-removal/scripts/after.config.ts
npm run test:e2e -- --config=../docs/game-review/group-screen-match/scripts/final.config.ts
npm run build
```

## 화면

- [스크린 전체가 보이는 촬영 화면](runs/final/group-screen-reuse-group-s-b094e-e-full-background-on-return/group-screen-uncovered-393.png)
- [촬영 후 돌아온 첫 화면](runs/final/group-screen-reuse-group-s-b094e-e-full-background-on-return/opening-after-group-393.png)
- [원판 대기 320](after-final/group-photo-ready-320-applause-groom.png)
- [원판 대기 393](after-final/group-photo-ready-393-applause-groom.png)
- [원판 대기 430](after-final/group-photo-ready-430-applause-groom.png)
- [준비 문구가 삭제된 포토부스](../pose-notice-removal/after/f12-booth-controls-no-overlap-393.png)

실제 속도 영상은 `runs/final/*/video.webm` 및 `../pose-notice-removal/runs/after/`에 보존했다. 이전 검수 폴더와 ZIP을 덮어쓰지 않았다.

로컬 플레이: <http://127.0.0.1:5174/>
