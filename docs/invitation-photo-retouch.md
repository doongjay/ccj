# 안내 사진과 신랑신부 미니미 편집

모든 이미지 생성·편집은 내장 `image_gen` 도구를 사용했습니다. 안내 사진의 원본은 `game/public/assets/lacitta/photos/`에 보존하고, 사람 제거본은 아래 경로에서 청첩장 메뉴에 사용합니다. JPEG 변환과 1,200px 축소만 `sips`로 처리했습니다.

## welcome

- 원본: `game/public/assets/lacitta/photos/welcome.jpeg`
- 적용 파일: `game/public/assets/invitation/notice-welcome.jpg`

```text
Use case: precise-object-edit. Asset type: real venue photograph in a mobile wedding invitation facilities menu. Input image is the edit target. Primary request: remove all people naturally from this exact photograph. Remove every person: standing guests in the foreground, person at the left entrance, and all seated guests in the lounge. Reconstruct the empty grey lounge chairs, entrance glazing and stone floor behind them. Preserve the three colored drink dispensers on the left and the drink table. Keep the identical original camera position, aspect ratio, framing, architecture, furniture placement, lighting and colors. Reconstruct only occluded background. Photorealistic seamless object removal, no blurred remnants, ghosts or new people; no added text, objects or redesign. Return one edited photograph.
```

## photo-booth

- 원본: `game/public/assets/lacitta/photos/photo-booth.jpeg`
- 적용 파일: `game/public/assets/invitation/notice-photo-booth.jpg`

```text
Use case: precise-object-edit. Asset type: real venue photograph in a mobile wedding invitation facilities menu. Input image is the edit target. Primary request: remove all people naturally from this exact photograph. Remove the standing photo booth attendant at the left table and every person seated or partly visible in the far left background. Preserve the actual tall cream photo booth kiosk, its wooden tripod legs, table, hanging greenery, white flowers, wall logo LACITTA and patterned stone floor. Keep the identical original camera position, aspect ratio, framing, architecture, furniture placement, lighting and colors. Reconstruct only occluded background. Photorealistic seamless object removal, no blurred remnants, ghosts or new people; no added text, objects or redesign. Return one edited photograph.
```

## atm

- 원본: `game/public/assets/lacitta/photos/atm.jpeg`
- 적용 파일: `game/public/assets/invitation/notice-atm.jpg`

```text
Use case: precise-object-edit. Asset type: real venue photograph in a mobile wedding invitation facilities menu. Input image is the edit target. Primary request: remove all people naturally from this exact photograph. Remove the person standing in front of the two ATM machines and the cropped seated person in the bottom-right foreground. Reconstruct the ATM facade and empty chairs/floor behind them. Preserve both actual ATM machines and all visible existing signage, escalator, round cafe tables, chairs, marble walls, plants and flowers. Remove personal belongings attached to or carried by removed people. Keep the identical original camera position, aspect ratio, framing, architecture, furniture placement, lighting and colors. Reconstruct only occluded background. Photorealistic seamless object removal, no blurred remnants, ghosts or new people; no added text, objects or redesign. Return one edited photograph.
```

## banquet

- 원본: `game/public/assets/lacitta/photos/banquet.jpeg`
- 적용 파일: `game/public/assets/invitation/notice-banquet.jpg`

```text
Use case: precise-object-edit. Asset type: real venue photograph in a mobile wedding invitation facilities menu. Input image is the edit target. Primary request: remove all people naturally from this exact photograph. Remove every person, staff member, chef and guest, including small distant figures along buffet counters and at the back dining tables. Preserve all food and serving stations, buffet islands, dining chairs and tables with flowers and place settings, pendant lamps, ceiling structure and floor design. Keep the identical original camera position, aspect ratio, framing, architecture, furniture placement, lighting and colors. Reconstruct only occluded background. Photorealistic seamless object removal, no blurred remnants, ghosts or new people; no added text, objects or redesign. Return one edited photograph.
```

신부대기실은 사람이 없는 원본 사진을 그대로 사용합니다.

## 연회장 톤 맞추기

최종 적용 파일: `game/public/assets/invitation/notice-banquet.jpg`. 사람 제거본의 밝기·하이라이트·색온도를 다른 안내 사진과 맞췄습니다.

```text
Use case: lighting-weather / photographic tone matching. Image 1 is the EDIT TARGET: the empty wedding banquet hall photograph. Images 2 and 3 are COLOR AND EXPOSURE REFERENCES ONLY: the venue's ATM lounge and welcome drink lounge. Adjust ONLY the banquet photograph's exposure, highlights, contrast and white balance so it fits naturally alongside the reference photos in the same mobile invitation. Reduce the overly bright near-white highlights on ceiling, counters and floor by roughly 0.6 to 0.9 stops, recover gentle realistic ceiling and counter detail, soften the orange/yellow cast toward a neutral warm beige. Keep the airy wedding interior but achieve calm, natural midtones closer to references. Do not make it dark or moody. Preserve exactly the target's architecture, furniture, food, table settings, camera framing, aspect ratio and every object. No new people or objects, no redesign, no cropping, no text or watermark. Return only the color-corrected banquet photo.
```

## 신랑신부

- 최종 원본: `game/public/assets/lacitta/characters/wedding-couple.png`
- `game/src/ui/weddingCouple.ts`에서 초록 매트를 제외하고 각 인물을 128×192 해상도, 같은 발 높이로 렌더링합니다. 32×48로 줄였다가 확대하던 과정을 제거했습니다.
- 게임에서는 80×120으로 표시하며 하객 64×96보다 크게 보입니다. 청첩장 원판사진에서도 하객보다 크게 표시합니다.

생성 프롬프트:

```text
Use case: precise-object-edit / style-transfer. Create the updated wedding couple sprite asset for an existing Korean pixel-art wedding game. Reference image 1 is the bride edit target: preserve her rich full white floor-length ball gown, hidden shoes, white flower bouquet, bridal updo and veil. Reference 2 is the groom edit target: preserve his elegant black tuxedo with white shirt and bow tie. References 3 and 4 show the game's guest sprites, and are STYLE/DETAIL/PROPORTION REFERENCES ONLY: match their crisp, readable pixel faces and pleasantly large heads, but make this wedding couple extra polished, beautiful, and charming. Output exactly TWO standalone full-body front-facing sprites side by side, groom centered in the left half and bride centered in the right half, both at the same scale and on the same baseline; no extra figures, no grid, no captions. Both heads should be approximately 40 percent of their total height as in the guest references. Groom: handsome soft dark-brown parted hair, warm clear symmetrical dark eyes, small gentle smile, tailored dark tuxedo, ivory boutonniere. Bride: lovely rich dark-brown elegant updo with small pearl hair ornament, clear expressive symmetrical eyes with subtle eyelashes, soft blush and small gentle smile; long white veil, luminous white layered full ball gown with tasteful pixel fold shading, small ivory bouquet. Fine clean pixel art, hard crisp coherent pixel clusters, delicate yet readable facial features like the guests. No blur, no anti-aliased illustration, no oversized sparkles, no exaggerated cartoon eyes. Transparent background with genuine alpha, no background color, no checkerboard, no shadows or glow outside the figures. Keep figures fully separated with ample transparent space and no touching edges, heads fully inside canvas, feet or dress hem inside canvas. Wide canvas, each figure fills roughly 85 percent of canvas height. The final sprites will be displayed at about 128 by 192 pixels each, so face features must remain legible at that size.
```

최종 매트 편집 프롬프트:

```text
Edit only the BACKGROUND of this exact two-character wedding sprite image. Replace every gray/white checkerboard square outside the groom and bride with perfectly flat solid pure chroma-key GREEN #00FF00 (RGB 0,255,0). No texture, no grid, no shading, no gradient. Keep the two characters' faces, hair, eyes, tuxedo, hands, bouquet, white dress and white veil absolutely identical, at the exact same positions and sizes. Keep the original 1536x1024 dimensions and framing. The white dress, ivory flowers, and white veil must stay intact and keep their current white/pale fabric colors. Keep the bouquet leaves their original muted olive green; only the background is neon #00FF00. Include pure green in the open gap between the groom's legs and the gap between the two figures. Do not antialias silhouettes into the green. This is a game-engine chroma-key sprite master; output RGB PNG on pure green, not transparent and not checkerboard. Do not change any character pixels or add anything.
```

## 원판사진 홀

- 최종 파일: `game/public/assets/lacitta/pixel-venue/group-photo-hall.png`
- 사용자가 첨부한 `신랑.신부.지인.jpg`의 초록 천장, 우드 커튼, 꽃 장식을 참고했습니다. 등장인물은 배경에서 제외했습니다.
- 모바일 `함께 사진 찍기`와 게임 본식 후 단체사진에서 같은 홀 분위기를 사용합니다.
- 모바일은 한 화면 최대 20명, 진입 시 무작위 순서, 순서를 유지한 페이지 넘기기로 전체 하객을 빠짐없이 보여줍니다. 저장 인원이 100명이면 5장, 101명이면 6장입니다. 새로 추가한 미니미는 첫 페이지에 나타납니다.

```text
Use case: style-transfer / precise-object-edit. Asset: background for a miniature wedding group-photo guestbook in a mobile pixel-art wedding invitation. Input 1 is the actual group-photo venue and composition reference; input 2 is a reference for the existing game's elegant pixel-art rendering ONLY. Recreate the empty venue from input 1 as charming, detailed, crisp pixel art: warm dark wooden curtains on the rear wall, lush green vine-covered ceiling, round warm gold geometric pendant lights near the top corners, subtle stage lights, white flowers and greenery to the far sides. REMOVE ALL PEOPLE, including the couple and every guest. Preserve the cozy green and wood wedding-hall atmosphere of input 1; do not turn it into the grand long cathedral hall of input 2. Straight-on group-portrait camera, modest shallow depth, wide empty stage filling the lower half so small separately-rendered guest avatars can be tightly gathered there. Elegant low ivory stage risers with subtle warm shadows, only two shallow steps; avoid bulky rectangular pedestal blocks or repetitive hard horizontal stripes. A centered dark brown aisle leading a short distance into the foreground; restrained white floral arrangements at extreme lower corners, central and lower-middle areas unobstructed for sprites. Calm inviting sage, ivory and wood-brown palette, clean pixel clusters and soft pixel lighting matching input 2. No people, characters, silhouettes, chairs, text, watermark, giant projection screen or UI. Landscape image, roughly 4:3 aspect ratio. It will be shown as a 360px-wide photo frame.
```

