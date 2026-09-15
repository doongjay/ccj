# D-A01 에셋 대조

현재 실제 배포 자산 98개(PNG/WebP/JPEG/폰트), 단계 로더 32개 key를 등록했다. 기본 `npm run verify:assets`는 public의 **모든 파일**, production 출력, 단계 registry, CSS/HTML의 실제 URL, 청첩장의 picture/22장 gallery 동적 경로, 제작용 원본과 파생본을 대조한다. normal shipping에 확장자/폴더 제외 옵션을 쓰지 않는다. 기존 ASSET_MANIFEST 35개는 이전 시트/UI 계약과 호환 테스트를 위해 유지하며 eager preload에 쓰지 않는다. 전체 shipping 기준은 `shippingAssets.json`이다.

## 출처와 범위

기존 출처 ledger의 기록과 실제 저장소 제작 문서, 제공 청첩장 데이터 및 사용자 보존 지시를 근거로 삼았다. `provided`는 기존 제공 청첩장/사진을 이 웨딩 앱에 유지하라는 지시를 나타내며, 제3자에게 자유 재배포할 수 있는 새 라이선스를 주장하지 않는다. 과거 .omo 생성 원본은 현재 저장소에 없지만, 기존 docs/asset-provenance.md의 제작자 기록 자체는 있다. 이를 새로운 제작 증명으로 꾸미지 않았다. 미등록 40개를 무해하다고 일괄 화이트리스트 처리하지 않았다.

## 예산 계약

구형 360×640 UI/배경은 512,000 bytes, 구형 OG 1,000,000, 폰트 합계 500,000을 유지한다. 승인된 B/C의 실제 940~941×1672 배경·음식 스트립은 무손실 WebP이므로 단계 이미지 3,000,000 bytes, 합성 캐릭터 원본 atlas 1,500,000, 실제 제공 사진 3,000,000의 유한한 종류별 제한을 둔다. 기존 최대 파일에 몇 bytes씩 맞춘 한도가 아니다. 전체 shipping 파일 110,000,000 bytes, 초기 에셋 부분합 4,000,000 bytes도 별도 제한한다. **실제 첫 화면 전체 전송 5,000,000 bytes 한도는 별도 CDP production 테스트로 확인한다.** 파일 부분합을 실제 전체 네트워크 값으로 보고하지 않는다.

## 계약 검사

98개 모두 SHA-256/존재/production 동일 복사/출처/예산/중복을 검사한다. 모든 이미지 브라우저 decode·크기·투명도·비어 있는 frame을 확인한다. legacy 32×48 시트와 실제 원본의 비균등 행 atlas/의상/두 인물/음식 스트립을 구분한다. 알파가 254까지인 기존 UI와 흰 단색 국화의 계조 알파도 원래 계약대로 검사한다(visible RGBA 다양성 + 투명 padding). 그 둘을 잘못 RGB/255 불변식으로 검사했던 assets-unit-02 실패 기록도 보존한다.

WebP 24개는 원본 PNG와 **ffmpeg canonical RGBA가 완전히 같은지** 검사한다. 반투명 parents/white-car의 browser canvas readback은 premultiply/색상 처리의 rounding 때문에 다른 RGB를 반환하므로, lossless 비교는 원시 RGBA에서 하고 실제 브라우저 decode/alpha/프레임 검사는 계속 수행한다. 두 파일의 Pillow 비교도 원시 픽셀 동일했다. 실제 이미지를 보정하거나 오차 임계값을 열어 통과시키지 않았다. 검사 실행에는 기존 개발 도구인 Chromium과 ffmpeg가 필요하다.

## 제작용 원본 보존

56개 원본/이전 시안은 `game/artwork/sources/`로 이동해 Vite public 복사에서 제외했다. 원본 내용은 바꾸지 않았다. 40개 PNG 중 23개는 단계 로더, 추가 단상 v4는 청첩장 CSS의 최적화 WebP와 연결된다. 이전 시안/사용 중단 minimi/사진 참고 원본은 직접·간접 URL과 생성 도구를 검색한 뒤 비배포로 분류했다. 활성 신부대기실 원본 JPEG 및 수정된 시설 안내 사진은 계속 배포한다. 최적화 생산 스크립트는 보관된 master 경로를 읽고 보고서를 D에 쓰므로 승인된 B 자료를 덮어쓰지 않는다.

## 실제 shipping 대조표

| 원본 | 런타임 키 | 실제 URL | 장면/단계 | production | 검사 계약 | 출처 기록 | 처리 |
|---|---|---|---|---|---|---|
| `game/public/assets/invitation/calendar.jpg` | CSS/DOM/legacy | `/assets/invitation/calendar.jpg` | invitation | 포함 | image 2918×3628 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/chrysanthemum.png` | CSS/DOM/legacy | `/assets/invitation/chrysanthemum.png` | invitation | 포함 | image 1200×1200 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-01.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-01.jpg` | invitation | 포함 | image 1253×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-02.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-02.jpg` | invitation | 포함 | image 1920×1280 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-03.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-03.jpg` | invitation | 포함 | image 1920×1280 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-04.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-04.jpg` | invitation | 포함 | image 1244×1824 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-05.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-05.jpg` | invitation | 포함 | image 1496×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-06.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-06.jpg` | invitation | 포함 | image 1280×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-07.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-07.jpg` | invitation | 포함 | image 1280×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-08.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-08.jpg` | invitation | 포함 | image 1216×1824 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-09.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-09.jpg` | invitation | 포함 | image 1280×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-10.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-10.jpg` | invitation | 포함 | image 1271×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-11.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-11.jpg` | invitation | 포함 | image 1280×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-12.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-12.jpg` | invitation | 포함 | image 1280×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-13.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-13.jpg` | invitation | 포함 | image 1824×1216 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-14.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-14.jpg` | invitation | 포함 | image 1280×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-15.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-15.jpg` | invitation | 포함 | image 1824×1230 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-16.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-16.jpg` | invitation | 포함 | image 1197×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-17.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-17.jpg` | invitation | 포함 | image 1317×1824 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-18.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-18.jpg` | invitation | 포함 | image 1023×1537 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-19.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-19.jpg` | invitation | 포함 | image 1216×1824 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-20.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-20.jpg` | invitation | 포함 | image 1261×1920 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-21.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-21.jpg` | invitation | 포함 | image 1179×1824 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-22.jpg` | CSS/DOM/legacy | `/assets/invitation/gallery-22.jpg` | invitation | 포함 | image 1216×1824 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/information.png` | CSS/DOM/legacy | `/assets/invitation/information.png` | invitation | 포함 | image 794×398 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/intro.jpg` | CSS/DOM/legacy | `/assets/invitation/intro.jpg` | invitation | 포함 | image 2918×4377 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/notice-atm.jpg` | CSS/DOM/legacy | `/assets/invitation/notice-atm.jpg` | invitation | 포함 | image 1200×900 | notice-retouch | 등록·검사 |
| `game/public/assets/invitation/notice-banquet.jpg` | CSS/DOM/legacy | `/assets/invitation/notice-banquet.jpg` | invitation | 포함 | image 1200×674 | notice-retouch | 등록·검사 |
| `game/public/assets/invitation/notice-photo-booth.jpg` | CSS/DOM/legacy | `/assets/invitation/notice-photo-booth.jpg` | invitation | 포함 | image 1200×1200 | notice-retouch | 등록·검사 |
| `game/public/assets/invitation/notice-welcome.jpg` | CSS/DOM/legacy | `/assets/invitation/notice-welcome.jpg` | invitation | 포함 | image 1200×1200 | notice-retouch | 등록·검사 |
| `game/public/assets/invitation/share-pixel-square-v2.png` | CSS/DOM/legacy | `/assets/invitation/share-pixel-square-v2.png` | invitation | 포함 | image 1254×1254 | share-art | 등록·검사 |
| `game/public/assets/invitation/share-pixel-wide-v2.png` | CSS/DOM/legacy | `/assets/invitation/share-pixel-wide-v2.png` | invitation | 포함 | image 1774×887 | share-art | 등록·검사 |
| `game/public/assets/invitation/shuttle-pixel-matte.png` | CSS/DOM/legacy | `/assets/invitation/shuttle-pixel-matte.png` | invitation | 포함 | image 1536×1024 | shuttle-art | 등록·검사 |
| `game/public/assets/invitation/timer.jpg` | CSS/DOM/legacy | `/assets/invitation/timer.jpg` | invitation | 포함 | image 2772×4158 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/venue-directions.jpg` | CSS/DOM/legacy | `/assets/invitation/venue-directions.jpg` | invitation | 포함 | image 800×600 | share-art | 등록·검사 |
| `game/public/assets/lacitta/characters/npc-bride.png` | CSS/DOM/legacy | `/assets/lacitta/characters/npc-bride.png` | legacy-compatibility | 포함 | legacy-32x48 128×192 | npc-bride | 등록·검사 |
| `game/public/assets/lacitta/characters/npc-groom.png` | CSS/DOM/legacy | `/assets/lacitta/characters/npc-groom.png` | legacy-compatibility | 포함 | legacy-32x48 128×192 | npc-groom | 등록·검사 |
| `game/public/assets/lacitta/characters/npc-guide.png` | CSS/DOM/legacy | `/assets/lacitta/characters/npc-guide.png` | legacy-compatibility | 포함 | legacy-32x48 128×192 | npc-guide | 등록·검사 |
| `game/public/assets/lacitta/characters/npc-reception.png` | `npc-reception` | `/assets/lacitta/characters/npc-reception.png` | lobby | 포함 | legacy-32x48 128×192 | npc-reception | 등록·검사 |
| `game/public/assets/lacitta/characters/player-guest.png` | CSS/DOM/legacy | `/assets/lacitta/characters/player-guest.png` | legacy-compatibility | 포함 | legacy-32x48 128×192 | player-guest | 등록·검사 |
| `game/public/assets/lacitta/fonts/Galmuri11.woff2` | CSS/DOM/legacy | `/assets/lacitta/fonts/Galmuri11.woff2` | opening | 포함 | font 0×0 | galmuri11 | 등록·검사 |
| `game/public/assets/lacitta/photos/bridal-room.jpeg` | CSS/DOM/legacy | `/assets/lacitta/photos/bridal-room.jpeg` | invitation | 포함 | image 765×512 | notice-retouch | 등록·검사 |
| `game/public/assets/lacitta/routes/car-background.png` | CSS/DOM/legacy | `/assets/lacitta/routes/car-background.png` | legacy-compatibility | 포함 | image 360×640 | car-background | 등록·검사 |
| `game/public/assets/lacitta/routes/car-choice.png` | CSS/DOM/legacy | `/assets/lacitta/routes/car-choice.png` | legacy-compatibility | 포함 | image 96×64 | car-choice | 등록·검사 |
| `game/public/assets/lacitta/routes/exit-sign.png` | CSS/DOM/legacy | `/assets/lacitta/routes/exit-sign.png` | legacy-compatibility | 포함 | image 64×64 | exit-sign | 등록·검사 |
| `game/public/assets/lacitta/routes/home-background.png` | CSS/DOM/legacy | `/assets/lacitta/routes/home-background.png` | legacy-compatibility | 포함 | image 360×640 | home-background | 등록·검사 |
| `game/public/assets/lacitta/routes/shuttle-bus.png` | CSS/DOM/legacy | `/assets/lacitta/routes/shuttle-bus.png` | legacy-compatibility | 포함 | image 128×80 | shuttle-bus | 등록·검사 |
| `game/public/assets/lacitta/routes/subway-background.png` | `subway-background` | `/assets/lacitta/routes/subway-background.png` | subway | 포함 | image 360×640 | subway-background | 등록·검사 |
| `game/public/assets/lacitta/routes/subway-choice.png` | CSS/DOM/legacy | `/assets/lacitta/routes/subway-choice.png` | legacy-compatibility | 포함 | image 96×64 | subway-choice | 등록·검사 |
| `game/public/assets/lacitta/share/og-lacitta-wedding.png` | CSS/DOM/legacy | `/assets/lacitta/share/og-lacitta-wedding.png` | legacy-compatibility | 포함 | image 1200×630 | og-lacitta-wedding | 등록·검사 |
| `game/public/assets/lacitta/ui/arrow-marker.png` | CSS/DOM/legacy | `/assets/lacitta/ui/arrow-marker.png` | legacy-compatibility | 포함 | image 32×32 | arrow-marker | 등록·검사 |
| `game/public/assets/lacitta/ui/dialog-panel.png` | `dialog-panel` | `/assets/lacitta/ui/dialog-panel.png` | opening | 포함 | image 64×64 | dialog-panel | 등록·검사 |
| `game/public/assets/lacitta/ui/guide-marker.png` | CSS/DOM/legacy | `/assets/lacitta/ui/guide-marker.png` | legacy-compatibility | 포함 | image 32×32 | guide-marker | 등록·검사 |
| `game/public/assets/lacitta/ui/hint-button.png` | CSS/DOM/legacy | `/assets/lacitta/ui/hint-button.png` | legacy-compatibility | 포함 | image 32×32 | hint-button | 등록·검사 |
| `game/public/assets/lacitta/ui/loading-accent.png` | CSS/DOM/legacy | `/assets/lacitta/ui/loading-accent.png` | legacy-compatibility | 포함 | image 64×32 | loading-accent | 등록·검사 |
| `game/public/assets/lacitta/ui/quiz-frame.png` | `quiz-frame` | `/assets/lacitta/ui/quiz-frame.png` | lobby | 포함 | image 64×64 | quiz-frame | 등록·검사 |
| `game/public/assets/lacitta/ui/route-sign.png` | CSS/DOM/legacy | `/assets/lacitta/ui/route-sign.png` | legacy-compatibility | 포함 | image 64×32 | route-sign | 등록·검사 |
| `game/public/assets/lacitta/ui/touch-button.png` | `touch-button` | `/assets/lacitta/ui/touch-button.png` | opening | 포함 | image 96×32 | touch-button | 등록·검사 |
| `game/public/assets/lacitta/venue/banquet-background.png` | CSS/DOM/legacy | `/assets/lacitta/venue/banquet-background.png` | legacy-compatibility | 포함 | image 360×640 | banquet-background | 등록·검사 |
| `game/public/assets/lacitta/venue/bridal-room-background.png` | CSS/DOM/legacy | `/assets/lacitta/venue/bridal-room-background.png` | legacy-compatibility | 포함 | image 360×640 | bridal-room-background | 등록·검사 |
| `game/public/assets/lacitta/venue/buffet-island.png` | CSS/DOM/legacy | `/assets/lacitta/venue/buffet-island.png` | legacy-compatibility | 포함 | image 128×80 | buffet-island | 등록·검사 |
| `game/public/assets/lacitta/venue/drinks-station.png` | CSS/DOM/legacy | `/assets/lacitta/venue/drinks-station.png` | legacy-compatibility | 포함 | image 96×64 | drinks-station | 등록·검사 |
| `game/public/assets/lacitta/venue/ending-background.png` | CSS/DOM/legacy | `/assets/lacitta/venue/ending-background.png` | legacy-compatibility | 포함 | image 360×640 | ending-background | 등록·검사 |
| `game/public/assets/lacitta/venue/greenery-corridor-background.png` | CSS/DOM/legacy | `/assets/lacitta/venue/greenery-corridor-background.png` | legacy-compatibility | 포함 | image 360×640 | greenery-corridor-background | 등록·검사 |
| `game/public/assets/lacitta/venue/hall-background.png` | CSS/DOM/legacy | `/assets/lacitta/venue/hall-background.png` | legacy-compatibility | 포함 | image 360×640 | hall-background | 등록·검사 |
| `game/public/assets/lacitta/venue/lobby-background.png` | CSS/DOM/legacy | `/assets/lacitta/venue/lobby-background.png` | legacy-compatibility | 포함 | image 360×640 | lobby-background | 등록·검사 |
| `game/public/assets/lacitta/venue/photo-booth.png` | CSS/DOM/legacy | `/assets/lacitta/venue/photo-booth.png` | legacy-compatibility | 포함 | image 96×96 | photo-booth | 등록·검사 |
| `game/public/assets/lacitta/venue/photo-room-background.png` | CSS/DOM/legacy | `/assets/lacitta/venue/photo-room-background.png` | legacy-compatibility | 포함 | image 360×640 | photo-room-background | 등록·검사 |
| `game/public/assets/lacitta/venue/photo-table.png` | CSS/DOM/legacy | `/assets/lacitta/venue/photo-table.png` | legacy-compatibility | 포함 | image 112×64 | photo-table | 등록·검사 |
| `game/public/assets/lacitta/venue/reception-desk.png` | CSS/DOM/legacy | `/assets/lacitta/venue/reception-desk.png` | legacy-compatibility | 포함 | image 96×64 | reception-desk | 등록·검사 |
| `game/public/assets/lacitta/venue/waiting-room-background.png` | `waiting-room-background` | `/assets/lacitta/venue/waiting-room-background.png` | waiting | 포함 | image 360×640 | waiting-room-background | 등록·검사 |
| `game/public/assets/invitation/gallery-01.jpg` | `wedding-photo-1` | `/assets/optimized/gallery-01-game.jpg` | lobby | 포함 | image 1044×1600 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-02.jpg` | `wedding-photo-2` | `/assets/optimized/gallery-02-game.jpg` | lobby | 포함 | image 1200×800 | invitation-supplied | 등록·검사 |
| `game/public/assets/invitation/gallery-03.jpg` | `wedding-photo-3` | `/assets/optimized/gallery-03-game.jpg` | lobby | 포함 | image 1200×800 | invitation-supplied | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/extra-outfits-female.png` | `extra-outfits-female` | `/assets/optimized/lacitta-characters-extra-outfits-female.webp` | avatar-female | 포함 | region-atlas 1024×1536 | outfit-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/extra-outfits-male.png` | `extra-outfits-male` | `/assets/optimized/lacitta-characters-extra-outfits-male.webp` | avatar-male | 포함 | region-atlas 1024×1536 | outfit-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/formal-guests.png` | `formal-guests` | `/assets/optimized/lacitta-characters-formal-guests.webp` | hall | 포함 | region-atlas 1182×1330 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/minimi-hair.png` | `minimi-hair` | `/assets/optimized/lacitta-characters-minimi-hair.webp` | avatar-male, avatar-female | 포함 | region-atlas 1536×1024 | outfit-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/outfits-female.png` | `outfits-female` | `/assets/optimized/lacitta-characters-outfits-female.webp` | avatar-female | 포함 | outfit-atlas 1024×1536 | outfit-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/outfits-male.png` | `outfits-male` | `/assets/optimized/lacitta-characters-outfits-male.webp` | avatar-male | 포함 | outfit-atlas 1024×1536 | outfit-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/parents.png` | `parents` | `/assets/optimized/lacitta-characters-parents.webp` | lobby | 포함 | image 1774×887 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/wedding-couple.png` | `wedding-couple-sheet` | `/assets/optimized/lacitta-characters-wedding-couple.webp` | opening, hall | 포함 | region-atlas 1536×1024 | couple-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/characters/white-car.png` | `white-car` | `/assets/optimized/lacitta-characters-white-car.webp` | car | 포함 | image 1448×1086 | outfit-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/food/buffet-left.png` | `buffet-left` | `/assets/optimized/lacitta-food-buffet-left.webp` | dinner | 포함 | food-strip 724×2172 | food-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/food/buffet-right.png` | `buffet-right` | `/assets/optimized/lacitta-food-buffet-right.webp` | dinner | 포함 | food-strip 724×2172 | food-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/banquet-corridor.png` | `venue-banquet-corridor` | `/assets/optimized/lacitta-pixel-venue-banquet-corridor.webp` | dinner | 포함 | image 941×1672 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/banquet.png` | `venue-banquet` | `/assets/optimized/lacitta-pixel-venue-banquet.webp` | dinner | 포함 | image 941×1672 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/bridal-room-white.png` | `venue-bridal-room` | `/assets/optimized/lacitta-pixel-venue-bridal-room-white.webp` | bridal | 포함 | image 941×1672 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/garden.png` | `venue-garden` | `/assets/optimized/lacitta-pixel-venue-garden.webp` | garden | 포함 | image 941×1672 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-portrait-v3.png` | `wedding-group-portrait` | `/assets/optimized/lacitta-pixel-venue-group-photo-portrait-v3.webp` | hall | 포함 | image 940×1672 | group-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-stage-v4.png` | CSS/DOM/legacy | `/assets/optimized/lacitta-pixel-venue-group-photo-stage-v4.webp` | invitation | 포함 | image 1448×1086 | group-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/hall.png` | `venue-hall` | `/assets/optimized/lacitta-pixel-venue-hall.webp` | opening, hall, dinner | 포함 | image 941×1672 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/lobby.png` | `venue-lobby` | `/assets/optimized/lacitta-pixel-venue-lobby.webp` | lobby | 포함 | image 941×1671 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/photo-booth.png` | `venue-photo-booth` | `/assets/optimized/lacitta-pixel-venue-photo-booth.webp` | photo | 포함 | image 941×1672 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/reception-family.png` | `reception-family` | `/assets/optimized/lacitta-pixel-venue-reception-family.webp` | reception | 포함 | image 941×1672 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/pixel-venue/shuttle.png` | `venue-shuttle` | `/assets/optimized/lacitta-pixel-venue-shuttle.webp` | subway | 포함 | image 941×1672 | stage-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/routes/car-guidance-v2.png` | `car-background` | `/assets/optimized/lacitta-routes-car-guidance-v2.webp` | car | 포함 | image 941×1672 | group-art | 등록·검사 |
| `game/artwork/sources/assets/lacitta/routes/home-ground-v2.png` | `home-background` | `/assets/optimized/lacitta-routes-home-ground-v2.webp` | setup | 포함 | image 941×1672 | group-art | 등록·검사 |

## 미등록 40개 각각의 처리

| 이전 경로 | 보존 경로 | 실제 파생 URL | 처리 |
|---|---|---|---|
| `game/public/assets/lacitta/routes/car-background-pink.png` | `game/artwork/sources/assets/lacitta/routes/car-background-pink.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/routes/car-guidance-v2.png` | `game/artwork/sources/assets/lacitta/routes/car-guidance-v2.png` | `/assets/optimized/lacitta-routes-car-guidance-v2.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/routes/home-ground-v2.png` | `game/artwork/sources/assets/lacitta/routes/home-ground-v2.png` | `/assets/optimized/lacitta-routes-home-ground-v2.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/routes/home-sky.png` | `game/artwork/sources/assets/lacitta/routes/home-sky.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/pixel-venue/banquet-corridor.png` | `game/artwork/sources/assets/lacitta/pixel-venue/banquet-corridor.png` | `/assets/optimized/lacitta-pixel-venue-banquet-corridor.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/banquet.png` | `game/artwork/sources/assets/lacitta/pixel-venue/banquet.png` | `/assets/optimized/lacitta-pixel-venue-banquet.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/bridal-room-white.png` | `game/artwork/sources/assets/lacitta/pixel-venue/bridal-room-white.png` | `/assets/optimized/lacitta-pixel-venue-bridal-room-white.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/bridal-room.png` | `game/artwork/sources/assets/lacitta/pixel-venue/bridal-room.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/pixel-venue/garden.png` | `game/artwork/sources/assets/lacitta/pixel-venue/garden.png` | `/assets/optimized/lacitta-pixel-venue-garden.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/group-photo-hall.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-hall.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/pixel-venue/group-photo-portrait-v3.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-portrait-v3.png` | `/assets/optimized/lacitta-pixel-venue-group-photo-portrait-v3.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/group-photo-stage-v2.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-stage-v2.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/pixel-venue/group-photo-stage-v3.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-stage-v3.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/pixel-venue/group-photo-stage-v4.png` | `game/artwork/sources/assets/lacitta/pixel-venue/group-photo-stage-v4.png` | `/assets/optimized/lacitta-pixel-venue-group-photo-stage-v4.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/hall-v2.png` | `game/artwork/sources/assets/lacitta/pixel-venue/hall-v2.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/pixel-venue/hall.png` | `game/artwork/sources/assets/lacitta/pixel-venue/hall.png` | `/assets/optimized/lacitta-pixel-venue-hall.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/lobby-heart-panels.png` | `game/artwork/sources/assets/lacitta/pixel-venue/lobby-heart-panels.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/pixel-venue/lobby-no-posters.png` | `game/artwork/sources/assets/lacitta/pixel-venue/lobby-no-posters.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/pixel-venue/lobby.png` | `game/artwork/sources/assets/lacitta/pixel-venue/lobby.png` | `/assets/optimized/lacitta-pixel-venue-lobby.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/photo-booth.png` | `game/artwork/sources/assets/lacitta/pixel-venue/photo-booth.png` | `/assets/optimized/lacitta-pixel-venue-photo-booth.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/reception-family.png` | `game/artwork/sources/assets/lacitta/pixel-venue/reception-family.png` | `/assets/optimized/lacitta-pixel-venue-reception-family.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/pixel-venue/shuttle.png` | `game/artwork/sources/assets/lacitta/pixel-venue/shuttle.png` | `/assets/optimized/lacitta-pixel-venue-shuttle.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/photos/garden.png` | `game/artwork/sources/assets/lacitta/photos/garden.png` | `현재 런타임 참조 없음` | Supplied venue reference/master; active invitation uses separately documented notice retouch (bridal-room.jpeg is intentionally still shipped). |
| `game/public/assets/lacitta/food/buffet-left.png` | `game/artwork/sources/assets/lacitta/food/buffet-left.png` | `/assets/optimized/lacitta-food-buffet-left.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/food/buffet-right.png` | `game/artwork/sources/assets/lacitta/food/buffet-right.png` | `/assets/optimized/lacitta-food-buffet-right.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/extra-outfits-female.png` | `game/artwork/sources/assets/lacitta/characters/extra-outfits-female.png` | `/assets/optimized/lacitta-characters-extra-outfits-female.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/extra-outfits-male.png` | `game/artwork/sources/assets/lacitta/characters/extra-outfits-male.png` | `/assets/optimized/lacitta-characters-extra-outfits-male.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/formal-guests.png` | `game/artwork/sources/assets/lacitta/characters/formal-guests.png` | `/assets/optimized/lacitta-characters-formal-guests.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/guest-poses.png` | `game/artwork/sources/assets/lacitta/characters/guest-poses.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/characters/minimi-faces-v2.png` | `game/artwork/sources/assets/lacitta/characters/minimi-faces-v2.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/characters/minimi-hair.png` | `game/artwork/sources/assets/lacitta/characters/minimi-hair.png` | `/assets/optimized/lacitta-characters-minimi-hair.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/minimi-hairstyles-v2.png` | `game/artwork/sources/assets/lacitta/characters/minimi-hairstyles-v2.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/characters/npc-bride-white.png` | `game/artwork/sources/assets/lacitta/characters/npc-bride-white.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/characters/outfits-female.png` | `game/artwork/sources/assets/lacitta/characters/outfits-female.png` | `/assets/optimized/lacitta-characters-outfits-female.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/outfits-male.png` | `game/artwork/sources/assets/lacitta/characters/outfits-male.png` | `/assets/optimized/lacitta-characters-outfits-male.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/parents.png` | `game/artwork/sources/assets/lacitta/characters/parents.png` | `/assets/optimized/lacitta-characters-parents.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/player-guest-female.png` | `game/artwork/sources/assets/lacitta/characters/player-guest-female.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/characters/seated-guest.png` | `game/artwork/sources/assets/lacitta/characters/seated-guest.png` | `현재 런타임 참조 없음` | Previous proposal/reference without direct or indirect runtime URL in src/index/share preview/stage registry; preserved outside Vite public copy. |
| `game/public/assets/lacitta/characters/wedding-couple.png` | `game/artwork/sources/assets/lacitta/characters/wedding-couple.png` | `/assets/optimized/lacitta-characters-wedding-couple.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |
| `game/public/assets/lacitta/characters/white-car.png` | `game/artwork/sources/assets/lacitta/characters/white-car.png` | `/assets/optimized/lacitta-characters-white-car.webp` | Authored PNG master; byte-identical optimized WebP remains shipping. Production tool reads preserved source here. |

각 파일 해시와 나머지 비배포 원본은 asset-audit.json에 있다. 최종 소스 고정 후 정상 shipping/음성 테스트/production 첫 화면을 다시 검사하며 최종 결과는 README 및 최종 raw log/JSON을 따른다.

## 코드 생성 자산 계약

F19의 `parkingCar.ts`는 파일 로딩을 추가하지 않고 38×52 RGBA top-down 차량을 한 번 만든다. 실제 생성 texture의 크기, NEAREST, key 재사용을 D-A01/F23 고립 아트 검사에서 확인한다. 이동·주차 차량 모두2배 논리 크기를 사용하며 실제 B3/타워/오답 영상과 대조한다.

F23/C-P01의 `minimiMotion.ts`는 기존 촬영/군중 포즈를 수정하지 않고 선택한 외형만 필요할 때 생성한다. 걷기1024×192(4방향×2frame), 박수256×192(2frame), 각 frame128×192, 정수 원본 픽셀 변위와 NEAREST이다. `animation-profile-audit.json`의90조합 검사와 원본 해상도 대표 의상 matrix PNG, 실제 이동/반응 영상이 생성 계약 증빙이다. 이 두 코드 생성물은 배포 이미지 파일인 것처럼 catalog에 가짜 URL을 만들지 않는다.
