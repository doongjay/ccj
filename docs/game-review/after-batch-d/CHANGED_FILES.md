# 정확한 변경 파일 — Batch D 직전 스냅샷 기준

이전 A/A1/B/C 미커밋 변경을 포함하는 HEAD diff가 아니다. 증빙 문서·자료는 ZIP manifest로 구분한다.

| 상태 | 파일 | 목적 |
|---|---|---|
| modified | `GAME_REVIEW.md` | 검수 완료 상태와 남은 검증 기록 |
| modified | `GAME_REVIEW_FINAL.md` | 검수 완료 상태와 남은 검증 기록 |
| added | `game/artwork/README.md` | D-A01 제작용 원본 보존 위치와 생성 도구 안내 |
| modified | `game/e2e/avatar-alpha.spec.ts` | D-A01 실제 optimized URL 및 보관된 bride 원본의 알파 검사; Node JSON import 계약 |
| modified | `game/e2e/lobby-required.spec.ts` | F20 제거된 자동 단계명 대신 실제 3장 카드·직접 식사 종료 표시를 검사 |
| modified | `game/e2e/review-batch-b-access.spec.ts` | 기존 B/C 검증 assertion 유지, AFTER 출력 경로만 D로 분리 |
| modified | `game/e2e/review-batch-b-floor.spec.ts` | 기존 B/C 검증 assertion 유지, AFTER 출력 경로만 D로 분리 |
| modified | `game/e2e/review-batch-b-guidance.spec.ts` | 기존 B/C 검증 assertion 유지, AFTER 출력 경로만 D로 분리 |
| modified | `game/e2e/review-batch-b-performance.spec.ts` | 증빙 출력만 D로 분리하고 C baseline으로 실제 전송량 비교 |
| modified | `game/e2e/review-batch-c-ceremony.spec.ts` | 기존 B/C 검증 assertion 유지, AFTER 출력 경로만 D로 분리 |
| modified | `game/e2e/review-batch-c-photos.spec.ts` | 기존 B/C 검증 assertion 유지, AFTER 출력 경로만 D로 분리 |
| modified | `game/e2e/review-batch-c-reception.spec.ts` | 기존 B/C 검증 assertion 유지, AFTER 출력 경로만 D로 분리 |
| added | `game/e2e/review-batch-d-animation.spec.ts` | F23/C-P01 90조합 아트·실제 이동·정상 박수/환호와 생성 주차 아이콘 계약 검사 |
| added | `game/e2e/review-batch-d-assets.spec.ts` | D-A01 실제 shipping 사본에서 손상 이미지/잘못된 시트의 실패 확인 |
| added | `game/e2e/review-batch-d-checkpoint.spec.ts` | F18 실제 촬영·재개·식사/예식/메시지와 저장 실패 검증 |
| added | `game/e2e/review-batch-d-frame.spec.ts` | F21/F22 실제 로비 명패/viewport/overflow 관찰 |
| added | `game/e2e/review-batch-d-input-motion.spec.ts` | F16/F17 실제 취소 입력·키보드·3사진 정상/감소 모드와 live 변경 |
| added | `game/e2e/review-batch-d-production.spec.ts` | F21/F22 production 화면 검증; dev source hook 없음 |
| added | `game/e2e/review-batch-d-resources.spec.ts` | 두 실제 방문/재시작의 텍스처·사진·리스너 수명 대조 |
| added | `game/e2e/review-batch-d-venue.spec.ts` | F19/F20 안내도 경로와 3크기 수동 뷔페 페이지 검증 |
| added | `game/e2e/review-evidence.ts` | 기존 배치 증빙을 보존하는 공통 D 출력 루트 |
| modified | `game/e2e/tap-pacing.spec.ts` | F20 수동 사진 카드·직접 종료의 새 요구사항 검증 |
| added | `game/playwright.review-production.config.ts` | 실제 production config 진입점 |
| modified | `game/playwright.review.config.ts` | dev 전체 / production 대표 통합 실행과 D raw JSON·실패 trace 출력 |
| added | `game/scripts/import-source.mjs` | 검사기에서 pure TS 메타데이터 import |
| modified | `game/scripts/optimize-stage-assets.py` | 이동된 제작 원본 경로와 D 보고서 출력 사용; 실제 재인코딩 미실행 |
| modified | `game/scripts/verify-assets.mjs` | 기본 verify:assets를 전체 shipping 검증으로 연결; legacy fixture 경로 유지 |
| added | `game/scripts/verify-shipping-assets.mjs` | 전체 public/dist·runtime/CSS/동적URL·출처·크기/알파/시트/예산·보존 원본 검사 |
| added | `game/scripts/verify-shipping-assets.test.mjs` | 누락 URL/중복/누락 파일/미확인 출처/이미지 숨김 음성 fixture 5개 |
| modified | `game/src/data/assetManifest.ts` | legacy 계약과 전체 shipping catalog의 역할 주석 |
| added | `game/src/data/runtimeAssets.ts` | 기존 단계별 로더 key/URL 공통 순수 메타데이터 |
| added | `game/src/data/shippingAssets.json` | 98개 shipping 파일과 56개 원본, 기존 40건 처리·검사 계약·출처 |
| modified | `game/src/objects/Player.ts` | F19 안내도 차, F23 거리 기반 걷기, C-P01 박수·F17 공통 모션 |
| modified | `game/src/scenes/CarRouteScene.ts` | F19 안내도 조작/표시 및 F18 유효 경로 저장 |
| modified | `game/src/scenes/DinnerJourneyScene.ts` | F20 수동 뷔페 프리뷰; F18 식사 순서/안전 경계 저장 |
| modified | `game/src/scenes/EndingScene.ts` | F18 저장/생략 후 이어하기와 방명록 보존 재시작 |
| modified | `game/src/scenes/IntroScene.ts` | F18 이어하기/처음부터 및 손상 저장 안내 |
| modified | `game/src/scenes/InvitationScene.ts` | F18 명시적 게임 재시작 시 checkpoint 정리 |
| modified | `game/src/scenes/ReceptionScene.ts` | F18 접수 완료 경계 저장 |
| modified | `game/src/scenes/SubwayRouteScene.ts` | F18 5번 출구 유효 경로 저장 |
| modified | `game/src/scenes/VenueHallScene.ts` | C-P01 박수/말풍선, F17 플래시/REC, F18 예식/단체사진 경계 |
| modified | `game/src/scenes/VenueLobbyScene.ts` | F18 복구 사진·안전 지점; F17 공통 선호 상태 |
| modified | `game/src/scenes/VenueRoomScene.ts` | F17 사진 플래시, F18 촬영 결과 메타데이터 저장 |
| modified | `game/src/scenes/lobbyArt.ts` | F21 필수/편의시설 명패; 기존 문구·위치·접근점 보존 |
| modified | `game/src/scenes/parkingArt.ts` | F19 목적지/차량 시점을 통일한 주차 안내도 |
| added | `game/src/state/checkpoint.ts` | F18 작은 checkpoint 저장/복구/재시작과 저장 실패 표시 |
| added | `game/src/state/checkpointData.ts` | F18 schema·외형·측/경로·진행·사진/식사 모순 검증 |
| modified | `game/src/style.css` | F16 입력 상태, F19/F20 패널, F22 크림 프레임 및 margin collapse 해소 |
| modified | `game/src/systems/stageAssets.ts` | D-A01 registry 분리; 기존 지연 로딩 보존 |
| added | `game/src/ui/BuffetPreview.ts` | F20 3장씩 수동 2페이지·키보드·disabled·원본 비율 유지 |
| modified | `game/src/ui/GameAccess.ts` | F18 명시적 빠른 재시작 checkpoint 정리 |
| modified | `game/src/ui/MinimiPicker.ts` | F17 공통 모션 선호 사용 |
| modified | `game/src/ui/StoryDialog.ts` | F17 live typing 선호; F19/F20 공통 패널 배치·선택적 Escape 정책 |
| modified | `game/src/ui/WeddingCountdown.ts` | F17 공통 모션·live 반복 효과 정리 |
| added | `game/src/ui/buttonInteraction.ts` | F16 canvas release-inside·cancel/blur·disabled·수명 처리 공통 helper |
| modified | `game/src/ui/keyboardAccess.ts` | F16 native 버튼의 disabled/focus/held-key 1회 실행 |
| added | `game/src/ui/minimiMotion.ts` | F23/C-P01 기존 외형별 정수 픽셀 걷기/박수 atlas 지연 생성·재사용 |
| added | `game/src/ui/motionPreference.ts` | F17 단일 MQL, scene 소유 구독·live 변경·공통 사진 플래시 |
| added | `game/src/ui/parkingCar.ts` | F19 38×52 nearest 공통 top-down 아이콘 |
| modified | `game/src/ui/pixelFeedback.ts` | F17 기존 하트의 공통 선호 및 live 정적 전환 |
| modified | `game/src/ui/sceneUi.ts` | F16 공통 canvas 버튼/장소 입력 바인딩 |
| modified | `game/src/ui/sessionMemories.ts` | F18 촬영 시점 외형/구도 메타데이터로 사진 지연 재구성 |
| added | `game/src/ui/speechBubble.ts` | C-P01 원래 문구에 작은 꼬리로 반응 주체 표시 |
| modified | `game/src/ui/waitForTap.ts` | F16 공통 취소 가능한 release 입력 |

## 변경 없이 이동한 원본56개

전후 SHA-256이 같다. 삭제가 아닌 보존 위치 변경이다.

| 이전 | 보존 위치 | SHA-256 |
|---|---|---|
| `game/public/assets/invitation/share.jpg` | `game/artwork/sources/assets/invitation/share.jpg` | `89b1ac13ca4f5254a744dcb97209d66a34c4c07d54244757b43c67044a0081ca` |
| `game/public/assets/invitation/shuttle-exit-5.png` | `game/artwork/sources/assets/invitation/shuttle-exit-5.png` | `e510d4395ed984b1ae91c569f3b3227228e92219a78763b120c656720eac257a` |
| `game/public/assets/lacitta/characters/extra-outfits-female.png` | `game/artwork/sources/assets/lacitta/characters/extra-outfits-female.png` | `5cb153627ad8746bc4026b1f71f4da50de35bd3c1deb50dbda8171e8234a2f6c` |
| `game/public/assets/lacitta/characters/extra-outfits-male.png` | `game/artwork/sources/assets/lacitta/characters/extra-outfits-male.png` | `6967e4ca06ab030e95ed3a596acafe9665c700ff928d507088c4b47c7190ba54` |
| `game/public/assets/lacitta/characters/formal-guests.png` | `game/artwork/sources/assets/lacitta/characters/formal-guests.png` | `5ab7a3f1e70cc28570eb5a916cea6b600ac1fd682e106870c42b306a1065adb5` |
| `game/public/assets/lacitta/characters/guest-poses.png` | `game/artwork/sources/assets/lacitta/characters/guest-poses.png` | `f586ffe6590b1bd2de850ece28dec865478c1c2665a8a13f89d98e9b7f6feda8` |
| `game/public/assets/lacitta/characters/minimi-faces-v2.png` | `game/artwork/sources/assets/lacitta/characters/minimi-faces-v2.png` | `9e27c7efdbbbf48331dc5088727bd1cd98573f1e376f7374c7a084c3115161a4` |
| `game/public/assets/lacitta/characters/minimi-hair.png` | `game/artwork/sources/assets/lacitta/characters/minimi-hair.png` | `b0c9e826c83376802cdb62129d1ad23b30feded0d86ac0d6eeb6a39b38b517ce` |
| `game/public/assets/lacitta/characters/minimi-hairstyles-v2.png` | `game/artwork/sources/assets/lacitta/characters/minimi-hairstyles-v2.png` | `5eb0df5fe5af7459956952ebf219fe75f627d67157b0804c22d8e82eb51fe7ff` |
| `game/public/assets/lacitta/characters/npc-bride-white.png` | `game/artwork/sources/assets/lacitta/characters/npc-bride-white.png` | `e3f88b89aabb23c090475df5782a307c1b3b1847fd1415deb0c453703a87b08a` |
| `game/public/assets/lacitta/characters/outfits-female.png` | `game/artwork/sources/assets/lacitta/characters/outfits-female.png` | `2e5f5609188424b458b8dcba7442a6cab8e0ce6ee959823b66a4d0a7d97a540a` |
| `game/public/assets/lacitta/characters/outfits-male.png` | `game/artwork/sources/assets/lacitta/characters/outfits-male.png` | `0256a87dc584b87157ebc7e4a83ee8ebd16e37b14b98d880bd4f15a5cac87b21` |
| `game/public/assets/lacitta/characters/parents.png` | `game/artwork/sources/assets/lacitta/characters/parents.png` | `c82d4d6a260deb2e4957e9fcc608ad85af85f80555d5589c40bd0fdc03ac68e3` |
| `game/public/assets/lacitta/characters/player-guest-female.png` | `game/artwork/sources/assets/lacitta/characters/player-guest-female.png` | `4dc22b81bcdda46f9790e5f0030ec6a33573a97fc099c28d888fabe57204e319` |
| `game/public/assets/lacitta/characters/seated-guest.png` | `game/artwork/sources/assets/lacitta/characters/seated-guest.png` | `1e6268337f77525af1a9aafc493eee9774ce6991373c4555fb3daf995f9ea343` |
| `game/public/assets/lacitta/characters/wedding-couple.png` | `game/artwork/sources/assets/lacitta/characters/wedding-couple.png` | `84b330dbe6e23ddf231e25c0fba430c6dc486df4c8a50e7158f729984ae83826` |
| `game/public/assets/lacitta/characters/white-car.png` | `game/artwork/sources/assets/lacitta/characters/white-car.png` | `68f61287cca3648c23607fd4e259738268ce0e4599cc4e8b0f5bb1586b2a20a8` |
| `game/public/assets/lacitta/food/buffet-left.png` | `game/artwork/sources/assets/lacitta/food/buffet-left.png` | `9ace171232c3052f889df9b8ad2ab3bccac5553bd9440a8b041d02e8033b77a0` |
| `game/public/assets/lacitta/food/buffet-right.png` | `game/artwork/sources/assets/lacitta/food/buffet-right.png` | `f64c1cbf363ca5dbec884c368d58f01eeae7fcc1df19f16da49121715081ecd8` |
| `game/public/assets/lacitta/photos/atm.jpeg` | `game/artwork/sources/assets/lacitta/photos/atm.jpeg` | `d15fe8db121e3dc79812dd4436d8f2d6a34bffc41d457a6e7a5ae25430bb56ad` |
| `game/public/assets/lacitta/photos/banquet-corridor.jpeg` | `game/artwork/sources/assets/lacitta/photos/banquet-corridor.jpeg` | `61bb3f7efb3116bbbdce6fa070319a72213d11398a45270a973c9ba90d02a5e6` |
| `game/public/assets/lacitta/photos/banquet.jpeg` | `game/artwork/sources/assets/lacitta/photos/banquet.jpeg` | `5194be1fbf160859ea3b037e79352ac0ec2b6590d72a3da2743b67e24abb502e` |
| `game/public/assets/lacitta/photos/bridal-curtains.jpeg` | `game/artwork/sources/assets/lacitta/photos/bridal-curtains.jpeg` | `6af1a7a143f85667577b72630fefe1091ad7cab7ef2933d8838bda3f7df5d90c` |
| `game/public/assets/lacitta/photos/bridal-entry.jpeg` | `game/artwork/sources/assets/lacitta/photos/bridal-entry.jpeg` | `423df0e872c4e95b6fca4f08e2077cceb1d8ce676c3eceaebecb7faabc06e217` |
| `game/public/assets/lacitta/photos/exterior.jpeg` | `game/artwork/sources/assets/lacitta/photos/exterior.jpeg` | `fba38dc1d59d3ec679d7d84d1d8084abc41d0842c52498a33322db8d4207be3c` |
| `game/public/assets/lacitta/photos/garden.png` | `game/artwork/sources/assets/lacitta/photos/garden.png` | `9851789d6ebee7016c2e7d9778bf2efb2bd233177b02c5207da9961bb03c87ca` |
| `game/public/assets/lacitta/photos/hall.jpeg` | `game/artwork/sources/assets/lacitta/photos/hall.jpeg` | `3995b1bc415ce23e00d40f40c428b3ea98947e28867590ae7de23c15803e07c6` |
| `game/public/assets/lacitta/photos/junction.jpeg` | `game/artwork/sources/assets/lacitta/photos/junction.jpeg` | `1ba7bc37bc8cdd24870b3cc4ba0294b41933fd354759a78e3c46b77bcfb5a636` |
| `game/public/assets/lacitta/photos/lounge.jpeg` | `game/artwork/sources/assets/lacitta/photos/lounge.jpeg` | `391a90d93bebdddf4821609ced32cc8f5005c5ce76d4b0342591a5f4407d621f` |
| `game/public/assets/lacitta/photos/photo-booth.jpeg` | `game/artwork/sources/assets/lacitta/photos/photo-booth.jpeg` | `6f429e229080060424ff3163a407b73a41542fc4b446c53043bc86db7c401684` |
| `game/public/assets/lacitta/photos/photo-zone.jpeg` | `game/artwork/sources/assets/lacitta/photos/photo-zone.jpeg` | `1502a4ff69bc6d2eaa12246395cee09255cf3ed950a0dfd703c646a42913fd5b` |
| `game/public/assets/lacitta/photos/shuttle.jpeg` | `game/artwork/sources/assets/lacitta/photos/shuttle.jpeg` | `d335facdf49f0e67b5cd2cb6915027649b133f87089fd53847f63580f308e4e2` |
| `game/public/assets/lacitta/photos/welcome.jpeg` | `game/artwork/sources/assets/lacitta/photos/welcome.jpeg` | `97cfa649d5642535517f453efcf98082fad134468fea76fe6000b9ab1fbe709d` |
| `game/public/assets/lacitta/pixel-venue/banquet-corridor.png` | `game/artwork/sources/assets/lacitta/pixel-venue/banquet-corridor.png` | `a3d386b254ea4300e40e5c19c5a7f629b8c4be3dd7c1a04913a71c056a0f580b` |
| `game/public/assets/lacitta/pixel-venue/banquet.png` | `game/artwork/sources/assets/lacitta/pixel-venue/banquet.png` | `4ebe86561e8ed63def42feba97054ff767db7e33d41f20c2da08be4cb96d7332` |
| `game/public/assets/lacitta/pixel-venue/bridal-room-white.png` | `game/artwork/sources/assets/lacitta/pixel-venue/bridal-room-white.png` | `38bf5c6f4ca765edee01414f633f779929e051deb395823b967d7349bb3dc5dd` |
| `game/public/assets/lacitta/pixel-venue/bridal-room.png` | `game/artwork/sources/assets/lacitta/pixel-venue/bridal-room.png` | `7e0da709ad2d96d2f5b22f5977715d8788409c168c5fb96fb49a34f2d07eea57` |
| `game/public/assets/lacitta/pixel-venue/garden.png` | `game/artwork/sources/assets/lacitta/pixel-venue/garden.png` | `7642506691bf98d0fe41c319fe53a0e4a11fd785a5adcfc15e7e34c40480c1d9` |
| `game/public/assets/lacitta/pixel-venue/group-photo-hall.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-hall.png` | `ca1f5ff97003e0625632032fcb0b445a29cc30249f442f0cfc9d5007453f5718` |
| `game/public/assets/lacitta/pixel-venue/group-photo-portrait-v3.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-portrait-v3.png` | `a2779430320a6f5a3bfce69d1cc4af2e89d6efc4c2411755a6b2e810ed0e2b52` |
| `game/public/assets/lacitta/pixel-venue/group-photo-stage-v2.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-stage-v2.png` | `1d04a67a112ddbad3caf45d10f625ce2f144db5a5f24045f7a2e75cfb6976eca` |
| `game/public/assets/lacitta/pixel-venue/group-photo-stage-v3.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-stage-v3.png` | `f3795fe3ace1cf417743ee7563cdd4a50326b4206f507d959720137305c3af53` |
| `game/public/assets/lacitta/pixel-venue/group-photo-stage-v4.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-stage-v4.png` | `88c593e5d7919efdb1ce7b25faf57723828c6c818336cf0a3b393af509e488b3` |
| `game/public/assets/lacitta/pixel-venue/hall-v2.png` | `game/artwork/sources/assets/lacitta/pixel-venue/hall-v2.png` | `564901450febd022a1a2ce776ba83b32639c1386fd5ea0709a5f9cc0702dda66` |
| `game/public/assets/lacitta/pixel-venue/hall.png` | `game/artwork/sources/assets/lacitta/pixel-venue/hall.png` | `b8f14ea2af1c0e2c78425354af87def7848a8a5614ab5f2f175a446726c5764f` |
| `game/public/assets/lacitta/pixel-venue/lobby-heart-panels.png` | `game/artwork/sources/assets/lacitta/pixel-venue/lobby-heart-panels.png` | `7671cae0a9d789b8d5da808036203996ceba54195a82524b3c8fcc1a84bc8c13` |
| `game/public/assets/lacitta/pixel-venue/lobby-no-posters.png` | `game/artwork/sources/assets/lacitta/pixel-venue/lobby-no-posters.png` | `fc256ccc0c91806b4bcffa3cf680fc3d71a48c8cf6b1e9840018017abc67e584` |
| `game/public/assets/lacitta/pixel-venue/lobby.png` | `game/artwork/sources/assets/lacitta/pixel-venue/lobby.png` | `89a5175ec68d04885730d5e3bf534f9459328add15e7877d1782814c663bc3b7` |
| `game/public/assets/lacitta/pixel-venue/photo-booth.png` | `game/artwork/sources/assets/lacitta/pixel-venue/photo-booth.png` | `b1bcca45bce98884c9c89b2b5e2af17e715a7c6e3b265e86a5beca29bb1afbc0` |
| `game/public/assets/lacitta/pixel-venue/reception-family.png` | `game/artwork/sources/assets/lacitta/pixel-venue/reception-family.png` | `0d770d77c3163341db0c73b6521cb9dec0e357a1c85917892f534bcc02388f7c` |
| `game/public/assets/lacitta/pixel-venue/shuttle.png` | `game/artwork/sources/assets/lacitta/pixel-venue/shuttle.png` | `e8363cd0b5ba6de169183eb5c4083680f7371246f4a3a99ed186fe25ca60eb3a` |
| `game/public/assets/lacitta/routes/car-background-pink.png` | `game/artwork/sources/assets/lacitta/routes/car-background-pink.png` | `3da44158d370ec99e29f674e7c53753363cc620bd552f8a39f79a91ac5968ce4` |
| `game/public/assets/lacitta/routes/car-guidance-v2.png` | `game/artwork/sources/assets/lacitta/routes/car-guidance-v2.png` | `7b66d596d1b86823d8cd2e1f6549f670388bdd09d234fc7eb3c2e5c559d0b965` |
| `game/public/assets/lacitta/routes/home-ground-v2.png` | `game/artwork/sources/assets/lacitta/routes/home-ground-v2.png` | `fee9f4b9121a8761e0cc7066599eb41f04499068c2971d1506efb0ff85f89d58` |
| `game/public/assets/lacitta/routes/home-sky.png` | `game/artwork/sources/assets/lacitta/routes/home-sky.png` | `0df5c3ba2d22bf1129a7f54c485873ea9efab994ca072ee5148f78728501c07f` |
| `game/public/og-placeholder.png` | `game/artwork/sources/og-placeholder.png` | `e94cf8fd4d28e9e396b916b6046a824f42f9fc430c551f9b5b24be7c4ff27e03` |
