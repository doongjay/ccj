> 미니미 얼굴·헤어 v2는 사용자의 원복 요청으로 사용 중단했습니다. 현재 구현은 [원형 복원 및 의상 5종](minimi-customization.md)을 참고하세요. 아래 내용은 이전 시안 기록입니다.

# 미니미 독립 이미지와 청첩장 액자 (2026-09-11)

사용 도구: 내장 image_gen. 기존 헤어 시트는 스타일 참고, 사용자 제공 메이플스토리 선택창과 청첩장 캡처는 배치 참고로 사용했습니다.

## 프로젝트에 저장한 최종 이미지
- `game/public/assets/lacitta/characters/minimi-hairstyles-v2.png`: 남녀 각 3종 × 앞/좌/우/뒤의 헤어 전용 그림. 얼굴·눈썹·귀·목이 없습니다.
- `game/public/assets/lacitta/characters/minimi-faces-v2.png`: 기본·안경·땡글이 3종 × 앞/좌/우/눈 깜박임의 완성된 얼굴 그림.
- `game/public/assets/lacitta/pixel-venue/group-photo-stage-v2.png`: 커튼과 단상이 있는 원판 촬영 배경.

헤어/얼굴 생성 결과에 실제 알파 대신 체크무늬가 들어가서, 같은 도구로 배경만 초록색으로 바꿨습니다. `minimiArt.ts`에서 초록 배경과 가장자리 잔상을 제거해 투명 캔버스로 사용합니다. 얼굴 윤곽은 이미지의 알파로 보존하며, 선택지별 눈이나 안경을 코드로 덧그리지 않습니다. 기존 원본 에셋은 보관합니다.

## 화면 반영
- 캐릭터 설정: 큰 미리보기 + 얼굴·헤어·의상별 좌우 화살표. 이름을 눌러 직접 선택하거나 키보드로 선택할 수도 있습니다.
- 얼굴과 헤어 썸네일은 독립 에셋을 통째로 보여주고 윤곽 중심으로 정렬합니다. 헤어를 바꿔도 얼굴 배율은 고정됩니다.
- 갤러리 격자는 유지하고 확대창에 이전·현재·다음 사진, 픽셀 화살표와 순환 이동을 적용했습니다.
- 첫 화면은 신랑신부 미니미 아래에 제목과 웨딩 사진이 이어지는 세이지·아이보리 액자로 구성했습니다.
- 원판 사진은 하객 30명 + 신랑신부를 네 줄에 배치합니다. 브라우저에 저장된 등록 순서대로 30명씩 이어지고, 새 하객 등록 후 해당 하객이 있는 마지막 장을 보여줍니다.
- 미니미와 방명록 글 모두 작성자의 캐릭터·메시지·작성일이 함께 나오는 카드로 연결됩니다. 카드에서도 좌우 버튼·키보드·스와이프로 메시지와 캐릭터를 함께 넘깁니다.

## 최종 생성 프롬프트

### 헤어
```text
Use case: precise-object-edit.
Asset type: modular pixel RPG HAIR-ONLY sprite atlas, to layer over separate complete face sprites.
Input image is the existing hairstyle sheet. Preserve its six hairstyle identities, brown/black colors and crisp small pixel clusters. Rebuild the sheet as ONLY WIGS: absolutely NO skin, NO face, NO ears, NO eyebrows, NO eyes, NO mouth, NO neck, NO mannequin. The face opening between fringe and side locks must be empty genuine transparent alpha. Remove all anatomy cleanly along the hair silhouette, preserving every bang, strand, long side lock and ponytail. No rectangular face holes or straight cutoffs through locks.
Exactly 6 equal columns and 4 equal rows, uniform 256x256 cells, total 1536x1024. Each cell contains one wig centered on the SAME invisible head attachment anchor. Across columns hairstyles: men's brown side part, men's black fringe, men's brown wavy, women's chestnut bob, women's dark brown long straight hair, women's brown high ponytail. Rows: front facing viewer; side facing left; side facing right; back facing away. Do not mix directions. All wigs fit the same head: an invisible oval 140px wide, chin y220, crown y75 in each 256px cell, eye line y160. Keep fringe tips above the eye line. Front bangs cover the upper portion of the oval, side locks wrap around it with transparent central opening. Ponytail extends upward and to the side without shrinking its head opening. Pixel art, stepped edges, restricted palette, no blur, no outline around an imaginary face. Generous transparent margins between cells. Entire background truly transparent RGBA, not a painted checkerboard. No grid, text, labels, frames, numbers, shadows outside the hair.
```

### 얼굴
```text
Use case: stylized-concept.
Asset type: production modular FACE-ONLY pixel RPG sprite atlas for a wedding guest avatar builder.
Create a new independent atlas of COMPLETE hairless face sprites. Each face is a finished illustration with its own cheeks, jaw, ears, eyes, eyebrows, nose and tiny mouth. Cute classic 2000s Korean side-scrolling RPG feeling, large clean eyes, soft peach skin #ffcea2, delicate warm brown outline. Pixel art with crisp stepped edges and small coherent pixel clusters, readable at a final face width of 56 pixels. Use the attached existing avatar art only to match its rendering detail and warm skin, but do not copy its hair or neck.
Exactly 3 equal columns by 4 equal rows in a 1024x1024 canvas, 12 separate faces. Columns: 1) gentle almond-eyed face with soft small brows, neutral tiny mouth; 2) a distinctly illustrated kind scholar face with round brown eyeglasses and its own softer eyes and brows, no doubled eyes, no accessories other than its glasses; 3) curious round-eyed face, round dark pupils and delicate eyebrows, tiny relaxed mouth. All three have exactly the same oval face silhouette and proportions so choosing a face never changes head size.
Rows: row 1 front; row 2 side profile facing LEFT; row 3 side profile facing RIGHT; row 4 front with eyes closed for a single natural blink (glasses remain on column 2).
Each cell's entire face from the rounded top of the forehead to bottom of the curved chin must be visible, no cropping. Face bounding box about 190px wide x190px tall with generous empty margins in each cell. Center in each cell. Face has skin from top to bottom, rounded forehead, ears at eye level, gently curved jaw, NO hair, NO fringe, NO scalp stubble, NO neck, NO neck stump, NO shoulders, NO body. The chin ends as a smoothly stepped rounded edge, no rectangular bottom and no flat cut across the face. No background or props, no text, no labels, no grid.
Genuine transparent RGBA background and empty cell margins. Do not paint a checkerboard.
```

### 헤어/얼굴 배경 정리
```text
Use case: background-extraction. Change ONLY the checkered background of this sprite atlas to perfectly flat saturated pure green #00ff00 for chroma key compositing. Every background pixel including the empty holes between hair and face openings must be the same pure green. Preserve all foreground sprites exactly: same geometry, count, positions, colors, expressions, direction, pixel detail, size and canvas aspect ratio. No shadows, gradients, noise, checkerboard, glow, or green tint on the sprites. Do not add any facial anatomy to hair sprites. Do not change faces or glasses. No text. Replace checkerboard only with solid #00ff00.
```

### 원판 단상
```text
Use case: stylized-concept.
Asset type: empty pixel-art group wedding portrait stage background for a mobile wedding invitation, landscape 4:3.
Use the small group portrait in the supplied invitation screenshot as a COMPOSITION reference only. Create only the empty stage, filling the entire canvas, with NO people or characters. Match its cozy formal group-photo staging: shallow stepped rows across the entire width, open front floor, ivory drapes gathered in soft arcs across the top and framing both side edges, discreet flowers in the two lower corners. Four shallow risers, shown almost straight on at a slightly elevated camera angle, with a narrow pale central aisle in the front. The scene is compact and symmetrical so 30 small avatar guests can stand shoulder to shoulder in four rows, with a bride and groom at front center. Keep most of the canvas open floor/steps so every guest face will be visible.
Adapt the colors to our existing wedding site's sage-green and warm ivory theme: muted warm taupe steps, ivory fabric, sage leaves, cream and dusty blush flowers. Delicate brown outlines, clear stepped pixel edges and restrained shading, nostalgic 2000s pixel RPG background, not photorealistic, not 3D, no blur. No hot pink frame, no UI, no arrow buttons, no text or watermark. No chairs, no pedestals, no large flowers blocking the stage. Foreground floor starts at y75%, risers fill y25%-75%, drapes confined to top25% and far sides. Render a full opaque background, no transparency.
```

