# Latest scene assets

Generated using the built-in image_gen tool. Pixel art and existing game UI are retained.

## reception-family.png

Saved under game/public/assets/lacitta/pixel-venue/reception-family.png.

Create one pixel-art game background sprite sheet with TWO equal portrait panels side by side, each panel 720:1280 aspect ratio. Reference 1 defines parent character identities and pixel sprite style; reference 2 defines reception desk marble, dark green and brass decor ONLY. Eye-level FRONT CLOSE-UP at a wedding reception desk, NOT overhead map. In left panel exactly TWO large friendly chibi pixel characters standing in FRONT of the reception desk: mother in sky-blue hanbok and father in charcoal suit. In right panel same composition with exactly THREE: mother in pink hanbok, father in charcoal suit, plus bride’s adult older brother in a dark navy suit (younger black hair, no boutonniere). Characters face visitor/camera, occupy central upper-middle of each panel, heads at 25% and feet at 72%, large enough to greet close-up. Marble wedding reception counter BEHIND them, cream stone wall, discreet flowers, warm lights. Lower 25% quiet marble floor for game dialogue overlay. Preserve crisp square pixel art; no realism, no text, no labels, no UI, no transparency. Two panels separated exactly at halfway with no margin, each self-contained portrait background.

## shuttle.png

Saved under game/public/assets/lacitta/pixel-venue/shuttle.png.

Use case: text-localization. Edit target is existing pixel-art yellow shuttle bus game background. Preserve every composition, bus, pixel-art style and color. Change ONLY Korean lettering on green bus sign to exact joined venue/station names. Large first line: "라시따시어터 셔틀버스". Small second line: "양재시민의숲역 ↔ 라시따시어터". NO spaces inside 라시따시어터 or 양재시민의숲역. The station pillar should read vertically "양재시민의숲역" with the existing yellow 5 retained. Do not add other words.

## outfits-male.png

Saved under game/public/assets/lacitta/characters/outfits-male.png.

Create a crisp small-scale 16-bit pixel RPG character atlas matching reference character proportions and outlined pixels. EXACT GRID 3 columns by 6 rows, 18 characters, all equal cells, aligned centered full body with 15% empty padding each cell. Columns are three OUTFITS of same person. Rows: 1 front standing, 2 walking LEFT profile, 3 walking RIGHT profile, 4 walking AWAY back view, 5 front smiling with V-sign hand for photos, 6 seated upright knees bent hands on lap WITHOUT any chair or sofa. Keep outfit and hair identical in each column across all rows. No labels, text, gridlines, shadows or scenery. Genuine transparent background alpha=0, NEVER checkerboard. If transparency cannot be rendered use uniform pure magenta #FF00FF outside characters, no shading or checkerboard. Young adult male guest with short brown hair. Column1 sky-blue long sleeve button-up shirt and navy trousers; column2 camel coat and dark trousers; column3 cream long-sleeve T-shirt and charcoal trousers.

## outfits-female.png

Saved under game/public/assets/lacitta/characters/outfits-female.png.

Create a crisp small-scale 16-bit pixel RPG character atlas matching reference character proportions and outlined pixels. EXACT GRID 3 columns by 6 rows, 18 characters, all equal cells, aligned centered full body with 15% empty padding each cell. Columns are three OUTFITS of same person. Rows: 1 front standing, 2 walking LEFT profile, 3 walking RIGHT profile, 4 walking AWAY back view, 5 front smiling with V-sign hand for photos, 6 seated upright knees bent hands on lap WITHOUT any chair or sofa. Keep outfit and hair identical in each column across all rows. No labels, text, gridlines, shadows or scenery. Genuine transparent background alpha=0, NEVER checkerboard. If transparency cannot be rendered use uniform pure magenta #FF00FF outside characters, no shading or checkerboard. Young adult female guest with shoulder-length brown hair. Column1 white shirt and navy trousers; column2 camel coat over black mini skirt with dark tights; column3 pale lilac blouse and long dark teal skirt.

## Rendering

- Reception uses separate groom/bride atlas frames, cropped to a front close-up. Bride frame includes her older brother.
- Envelope lettering interval is 320ms and completed-name hold is 1300ms, both twice the previous duration.
- Outfit sheets have three outfit columns and six pose rows. The same selection is used for cards, movement, seated photos and group photos.
- Camera viewfinder is code-native Phaser graphics, with corner brackets, focus marks, recording indicator and timecode, without a battery indicator. The supplied camera picture is a layout reference, not a copied watermarked asset.
- Generated checkerboard backgrounds are removed with `scripts/prepare-minimi.mjs`. Outfit, hair, formal-guest and car alpha checks are covered by `e2e/avatar-alpha.spec.ts`.
- Heads are aligned by their visible neck anchor to pose-specific clothing collars, with a skin bridge under the collar and stray-pixel cleanup. Clothing cards show only clothing. The runtime atlas includes front, left, right, back, V pose, seated and three blink poses. `e2e/minimi-visual.spec.ts` captures all combinations for review.
- Group-photo guests use twelve additional formal outfits mixed with the eighteen custom minimi combinations. Code-native steps and floor shadows align their feet; the selected guest is larger and immediately beside the chosen bride/groom.

## formal-guests.png

Saved under `game/public/assets/lacitta/characters/formal-guests.png`.
Generated using the built-in image generation tool with the existing minimi atlas as a style reference. Output: `/Users/user/.codex/generated_images/01a08207-6614-7342-8561-5ed8620d0c13/exec-af5e8d7d-d72a-4278-9396-e93314c6e303.png`. The returned 1182×1330 image uses four columns and three rows; runtime frame bounds match the actual output, not the requested dimensions.

Use case: stylized-concept. Asset type: wedding game group-photo guest sprite atlas. Input images are STYLE REFERENCES ONLY, not edit targets: match their warm detailed 16-bit pixel-art chibi heads, tiny full bodies, dark pixel outlines, Korean wedding guest aesthetic. Create a NEW atlas of 12 distinct adult wedding guests in EXACTLY 4 columns by 3 rows, on a genuinely transparent alpha background, no checkerboard or solid background. Equal 256x384 cells on a 1024x1152 sheet. Each full-body character centered in its cell, head near y=40 and shoes near y=344, with generous transparent gutters and no touching other cells. All face straight toward the camera, relaxed standing formal group-photo poses, hands together or arms at sides. Unique hair and appropriate neat clothing, no bride or groom: row 1: man navy suit with tie and side-part hair; woman muted rose midi dress with shoulder-length hair; man charcoal suit open white collar with black fringe hair and thin glasses; woman sage blouse and ivory trousers with tied-back hair. Row 2: woman navy jacket and matching midi skirt with short bob; man taupe blazer and dark trousers with wavy hair; woman burgundy modest long dress with long dark hair; man black knit sweater over white shirt and gray trousers with cropped hair. Row 3: man deep-brown suit and ivory shirt with swept hair; woman cream jacket and dark pleated skirt with ponytail; man pale blue shirt, navy vest and trousers with round glasses and tidy hair; woman dusty lavender blouse and charcoal long skirt with soft waved hair. Modest formal and smart casual wedding attire, each silhouette and color distinguishable at a small size, consistent head/body proportions across all cells. Precise hard clean pixel edges, NO painterly gradients or blurry halos. No scenery, no shadows outside the sprites, no lettering, no watermark.
