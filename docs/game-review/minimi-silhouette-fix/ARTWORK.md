# 여성 6번 검정 미니 원피스와 롱부츠

Built-in image_gen으로 기존 sixth-outfits.png의 여성 오른쪽 열을 편집했다. 원본 여성 outfits-female의 2번 의상 검정 이너를 숏 기장 기준으로 사용했다. 남성은 새 생성물의 왼쪽 열을 사용하지 않고 기존 sixth-outfits.png/WebP를 그대로 사용한다.

원본: `game/artwork/sources/assets/lacitta/characters/sixth-outfits-female-black.png`
실사용: `game/public/assets/optimized/lacitta-characters-sixth-outfits-female-black.webp`
생성 출력: `/Users/user/.codex/generated_images/01a09129-9bc6-7cf0-b317-4ba15101dbfd/exec-7df84c81-08a0-4252-8fb2-6e12266da87d.png`

PNG에서 lossless/exact/method=6 WebP로 변환하고 decoded RGBA byte equality를 확인했다. 기존 여성 6번 네이비 원본도 보존했다. 새 atlas는 여성 선택 이후에만 로드하며 boot에는 추가하지 않았다.

## Prompt

Use case: precise-object-edit. Edit target Image 1: production pixel wedding game clothing atlas 1024x1536, 2 columns and 6 rows. Reference Image 2: original female wardrobe; CENTER COLUMN black inner mini-dress under the tan coat is the hem-length reference. Change ONLY Image 1 RIGHT COLUMN female outfit in ALL SIX POSES from navy below-knee wrap dress to a BLACK short long-sleeved mini dress with BLACK knee-high LONG BOOTS. Hem at mid-thigh, same relative hem height as the black inner mini dress in reference Image 2, above knees; a small visible thigh gap above the boots. Keep a modest V neckline, subtle waist seam, fitted bodice and slightly A-line short skirt; no coat. Black/charcoal pixel palette with readable restrained cloth folds, charcoal boot highlights, low block heels. Preserve the right column exact body centers, pose directions, arm/hand gestures, top neck-opening position and floor/foot anchors in every row. No head or neck column above garment: clean skin opening at the neckline. Headless 6 poses: front idle, left walk, right walk, back idle, front peace sign, seated hands in lap. Preserve ALL LEFT COLUMN male artwork unchanged. Preserve original solid bright chroma green #00ff00 background, no shadows/text, same crisp pixel-art style, exact original atlas dimensions 1024x1536. Do not redesign the male clothing or change the 2-column/6-row layout.
