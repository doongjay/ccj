# 기존 신부 미니미 재사용

- `npc-bride` (첫 화면/예식장 공통 texture)를 신부대기실에 배치. 기존 미니미 얼굴/파츠와 weddingCouple 생성 코드 변경 없음.
- 배경에 그려져 있던 이전 신부만 빈 소파로 교체. 원본 941×1672의 (648,498),128×126 patch 밖 픽셀 변경 0. built-in imagegen prompt/파일/기록: `ARTWORK.md`, `artwork/patch-proof.json`.
- 장면과 촬영 결과가 같은 좌표·크기 helper를 사용. 기존 손님 포즈/수동 복귀/수첩/저장 progression 유지.

## 파일

`CHANGED_FILES.md`: 제품 코드 5개, 신규 배경 master/사용 파일, 신규 실제 브라우저 테스트. `source-after.json`은 전후 SHA-256, `change.diff`는 텍스트 diff. `weddingCouple.ts`는 비교 대상으로 백업했으며 **변경하지 않음**. `preservation.json`에서 minimi/classicMinimi/minimiParts/MinimiPicker 원래 hash 유지 확인.

## 브라우저 검증

모든 npm 명령의 cwd는 `game`.

- `npm run test:e2e -- --config=../docs/game-review/bridal-minimi-reuse/scripts/prepare.config.ts`: 1 PASS. 실제 canvas에서 patch 밖 픽셀 동일성/치수 확인.
- `.../scripts/before.config.ts`: 1 FAIL (화면 캡처는 성공, 로비 복귀 직후 notebook 클릭 대기조건 부족). `before/` ready/together/result/keepsake 원본 PNG와 `logs/before.json`, failure video/trace 보존.
- `.../scripts/after.config.ts`: 기존 F12/F13/B-V01 사진 흐름 1 PASS, 새 width별 테스트 3 FAIL (같은 notebook 대기조건). `logs/after.json`, `runs/after/` 보존.
- `.../scripts/after-retry.config.ts`: 4 PASS. 테스트가 실제 VenueLobbyScene 복귀를 기다리도록 보완. 제품 코드/수첩 조건을 우회하지 않았다. 320×568 / 393×852 / 430×932 신부 scene, 함께 촬영, 결과 5.1초 이상 유지, 수동 복귀, 수첩 canvas 완전 동일성 검증. 추가 기존 F18은 새로고침/이어하기 후 두 사진과 profile/progression 복원 검증.
- 시각 확인: `before/bridal-keepsake-393.png`과 `after-retry/bridal-keepsake-393.png`, 실제 ready/result/notebook 캡처. 기존 배경 신부 잔상 없음. 동일 npc-bride의 픽셀 얼굴과 dress, 손님과 나란한 구성 확인.
- 정상 전체 사진 동작은 `runs/after` 및 `runs/after-retry`의 실제 시간 영상으로 보존. 사진 결과 유지 시간/직접 복귀 포함.

## 에셋 검사 (게임 테스트와 별도)

`npm run verify:assets -- --report ../docs/game-review/bridal-minimi-reuse/assets-final.json` 독립 실행, cwd `game`, exit **1**. native 전체 JSON과 `logs/assets-final.log` 보존.

115개 등록/검사. 새 배경 2,914,085 bytes, stage-image 3 MB 이내. Shipping 총량 260,173,242 bytes. 오류는 23개 원본 사진의 기존 개별 3MB 초과와 총량 110MB 초과, 총 **24건**. 이전 `../original-photo-quality/assets-final.json`과 개별 오류 목록이 완전히 같음을 `preservation.json`에 기록. 총량은 신부 배경 무손실 PNG 보존으로 2,914,085 bytes 증가. 어떤 한도도 바꾸지 않았다. checker는 오류가 있으면 decode 단계로 가지 않으므로 decoded=0이며, PNG decode/실제 렌더링은 위 실제 브라우저 검사에서 수행했다.

원본 배경/기존 ZIP/검수 기록은 삭제하거나 덮어쓰지 않았다.
