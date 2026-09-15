# Lobby parents and signage update

Mode: built-in image_gen reference edits.

Final assets:
- game/public/assets/lacitta/pixel-venue/lobby.png
- game/public/assets/lacitta/characters/parents.png (true alpha; left half groom parents, right half bride parents)

## Lobby

Precise-object-edit of this existing pixel-art game lobby. Preserve original pixel style, portrait camera, all architecture, bottom entrance glass, centered reception, photo table, photo wall, small escalator, chairs and floral details. ONLY TWO localized furniture placement fixes: (1) ATM and black plant shelving in upper right nook: SWAP their left/right order. Black open square plant shelving LEFT, grey ATM to its RIGHT against the right-side wall. ATM centered at logical x660,y545, shelves x565,y525 on a720x1280 logical canvas. Keep the round tables and cane chairs in FRONT of both, not between ATM and shelf. (2) MOVE the SINGLE white marble welcome-drink counter AND its lemon WELCOME DRINK black frame poster away from in front of the lounge seats. Place counter against LOWER RIGHT wall, at logical x590,y850, facing across the open central walkway toward the charcoal lounge chairs on lower LEFT. Right side alcove x550..715 y760..950, below ATM nook and above bridal corridor. Poster beside counter at x530,y905 not blocking walkway. Preserve orange/red glass beverage dispensers and exact text WELCOME DRINK on poster, everything entirely crisp pixel art. Remove original counter/poster from lower LEFT and restore clear marble floor there, leave its lounge chairs untouched. No second drinks station. No people, no menu labels, no other changes.

## Parents atlas

Create a transparent pixel-art character atlas matching the two supplied ORIGINAL RPG spritesheet references' crisp pixel clusters and chibi proportions. One image, TWO equal square panels side by side, total 2:1 aspect ratio, genuine transparent alpha background, no panel borders, no text, no scenery, no shadows beyond tiny foot shadows. Each panel contains TWO standing Korean wedding parents, mother left and father right, fully visible head to feet at identical size and baseline. LEFT PANEL: mother with dark neat updo, ivory jeogori hanbok top and soft SKY BLUE long chima skirt; father in formal charcoal suit, white shirt, dark tie, small boutonniere. RIGHT PANEL: same pair, same pose, mother has soft PINK long chima skirt instead of blue. Both are mature middle-aged parents welcoming guests, modest warm expression, hands clasped in front, facing slightly toward camera. Do not draw bride/groom outfits: no veil, no wedding gown, no bridal bouquet. Keep body proportions and fine dark pixel outlines close to provided existing game characters, not vector, not painted/photoreal. Center each pair in its own exact half, with small even transparent margins and no overlap across panel boundary. The deliverable is one paired-state character sprite atlas.

## Alpha correction

Background extraction only. Remove the BAKED grey-white CHECKERBOARD BACKGROUND from this two-panel pixel character sprite atlas. Return a PNG with REAL TRANSPARENT ALPHA pixels outside characters, not a painted checkerboard, no white matte, no replacement background. Preserve all four characters, blue skirt pair left and pink skirt pair right, their exact pixel colors, pose, dimensions and locations. Keep canvas aspect 2:1 and exact panel alignment. This image is composited over a game map so genuine alpha transparency is REQUIRED. No other edits.
