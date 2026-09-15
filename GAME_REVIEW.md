# Executive Summary

Audit of the running game at **http://127.0.0.1:5174/** on **2026-09-11**. This is an audit of the current working tree, including its existing uncommitted work. **No implementation files were changed.**

| Dimension | Rating |
| --- | ---: |
| Overall visual quality | **7.5 / 10** |
| Pixel-art consistency | **6 / 10** |
| Readability | **6 / 10** |
| Game feel | **5 / 10** |
| Onboarding | **4.5 / 10** |
| Core loop | **5.5 / 10** |
| Polish | **5.5 / 10** |

This is a warm, personalized **wedding-invitation adventure**, not a combat or platform game. Its strongest assets are the recognizable venue, consistent floral/cream/green atmosphere, customizable minimi, and the moment of joining the couple in a group photograph. Two complete journeys reached the ending without an uncaught browser error.

The main gap is between the quality of the illustrations and the clarity of the interaction. The lobby changes control schemes without teaching the player, mandatory activities look optional, information panels have invisible dismissal rules, and most actions resolve into a short automatic sequence followed by another prompt. The game needs clearer interaction rules and more satisfying acknowledgment of a few important actions. It does not need an economy, combat, a score HUD, or effects throughout every scene.

**Findings: 0 P0, 8 P1, 12 P2, 1 P3 — 21 total.** P1 findings concern tangible quality/access problems; no tested route was irrecoverably broken.

### Top 5 changes with the highest ROI

1. **[G01] Explain the lobby controls and required itinerary on arrival.** Make the existing notebook the visible guide to progress.
2. **[G02] Restrict walking to the actual lobby floor.** The player can currently walk onto the left wall.
3. **[G03] Reduce and stage the startup assets.** The initial load transferred approximately **56.2 MB of assets**, excluding application/development JavaScript.
4. **[G04] Give information and narration explicit close/continue controls.** Reuse the existing pixel frames and button language.
5. **[G14] Deliver the selected applause or cheer before the group photo.** A short, distinct response would give the ceremony an emotional payoff at low implementation cost.

# Audit Method and Coverage

The repository was inspected first: package/configuration, scene registration, rendering settings, and the documented journey. Subsequent source inspection located the systems responsible for observed behavior. Comprehension findings concern what the screens actually communicate; facts available only in source code were not treated as instructions a new player would know.

The supplied server initially refused connections. The existing Vite app was started on port 5174 using its normal development command. Playwright Chromium was used with real button clicks, canvas pointer input, keyboard input, viewport changes, and screenshots. No progression flags were injected, scenes teleported, or game timers accelerated. Normal in-game tap-to-advance controls were used during repeated visits.

| Playthrough / check | Coverage |
| --- | --- |
| Car, bride's guest, female avatar | Yellow wrong turn, blue B3 parking, notebook, hall gate, photo booth, photo table, reception/envelope, garden, bridal photo, applause, group countdown/photo, dinner, parking departure information, message save, invitation |
| Subway, groom's guest, customized male avatar | Glasses/wave hair/navy suit, wrong exit 1, correct exit 5, shuttle boarding, ATM/drinks, bridal restriction, reception, meal before ceremony, remaining photo activities, cheer, group photo, meal correctly skipped afterward, ending/replay |
| Additional branch / resilience checks | Pink tower parking, repeated photo booth, reduced-motion setting, refresh from a partially completed lobby visit, invitation replay and ending replay |
| Invitation reached through gameplay | Top, gallery/lightbox, arrow/Escape navigation, guestbook, saved avatar/message postcard, return to game; external sending/sharing was not performed |
| Portrait viewport sizes | 320×568, 393×852, 430×932, 720×1280 |
| Desktop / landscape | 1440×900 and 852×393; a separate actual desktop browser context at DPR 1 also checked the intro, keyboard access, button states, lobby and dinner |
| Rendering / runtime | Main mobile context used DPR 3; canvas backing size and CSS rendering inspected; browser errors, warnings and failed requests recorded; `tsc --noEmit` passed |

Screenshots and runtime measurements are in [docs/game-review](docs/game-review/). Most mobile screenshots are full-page captures: at 393×852, the document's extra hidden overflow produces a 393×928 PNG. The tested viewport was still 393×852; the extra cream strip in those images is not an additional visible game area. Desktop captures also include the intentional side margins.

**Limits:** this was Chromium emulation, not physical iOS/Android Safari or a production hosting/network test. Audio output was not auditioned; source inspection found no gameplay audio loading/playback implementation. Network-byte observations are from the local development server. No complete existing E2E suite or production build was run; those are not implied by the successful playthroughs or TypeScript check.

# What the Actual Loop Does

**Choose an appearance/route → watch travel → select or walk to a venue activity → receive a scene, photo or dialogue → complete an internal visit flag → choose the next activity → ceremony/group photo → meal/departure → write a message.**

- The opening clearly establishes whose wedding this is, its date/time, and the broad goal of attending. It does not explain how much interaction or how many required stops lie ahead.
- Avatar appearance and guest side have visible consequences. Car/subway produce different travel and departure information. Eating before the ceremony genuinely changes the sequence and correctly prevents a second meal.
- There are no enemies, health, jump mechanics, attacks, damage, collectibles, resource management or game-over screen. Their absence suits the invitation. Hit stop, damage particles, combat feedback and escalating mechanical difficulty are **not applicable**.
- Failure consists of a wrong travel choice and a return trip. It is forgiving, but currently tests guessing rather than learned information. There is no real countdown to missing the wedding despite the narrative reference to 2 p.m.
- Most rewards are short visual vignettes. The notebook records progress, but the player must reopen it to discover that progress. Photo-table credit is awarded on opening the gallery, rather than for viewing all three photographs; the fastest completion strategy is to close it immediately.
- Once the correct route is known, the efficient strategy is to skip narration, complete the required visits and choose either ceremony reaction. There is no further optimization challenge. For this audience, improving warmth and clarity is more valuable than manufacturing difficulty.
- Pacing is strongest at setup, reception and the group photograph. Repeated return-to-lobby/gate interactions and automatic photo departures weaken the middle. The three photography activities—booth, bridal visit and group photo—need clearer distinctions in their rewards.
- Replay currently offers another route, side, appearance and meal order, with the same broad conclusion. That is acceptable for an invitation intended to be experienced once; durable progression or an endless replay loop is unnecessary.

# Findings

### [G01] The lobby introduces unexplained controls and disguises required visits as sightseeing

- [x] fixed — Batch A, 2026-09-12

**Severity:** P1  
**Category:** UX  
**Kind:** Onboarding and progression communication

**Observed**  
After menu-driven travel, the [first lobby screen](docs/game-review/11-lobby-arrival.png) presents a small avatar and facility labels without a tap-to-walk instruction or stated next task. The [notebook](docs/game-review/14-memory-book.png) lists activities, but calls them memories rather than entry requirements. Attempting the hall produces “흠.. 로비 구경을 좀 더 해볼까” (“Shall I look around a little more?”), followed by compulsory photo-booth, photo-table and reception choices. The bride's photo requirement appears as a further gate after those three are complete.

**Why it matters**  
A new guest can reasonably think the hall is the objective and the other rooms are optional. Discovering hidden prerequisites through repeated rejection makes an otherwise welcoming visit feel like completing chores.

**Recommended change**  
Give one concise arrival instruction explaining floor taps and facility taps. Show the complete side-specific itinerary immediately, identify required stops explicitly, and keep a compact progress indicator on the notebook button. Let its entries select the corresponding destination. If photos are intended as optional exploration, remove their hall gates instead; do not retain optional wording with compulsory behavior.

**Implementation hint**  
[VenueLobbyScene.ts](game/src/scenes/VenueLobbyScene.ts): `create`, notebook callback and `tryEnterHall`; [gameState.ts](game/src/state/gameState.ts): progression flags.

**Acceptance criteria**  
Before their first hall attempt, a guest can see all required activities for their side and an instruction for moving/interacting. Completing a visit updates visible progress immediately. The hall gate introduces no previously undisclosed requirement.

### [G02] The player can walk onto the lobby wall

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**Severity:** P1  
**Category:** Level Design  
**Kind:** Collision/navigation bug

**Observed**  
From the normal lobby spawn, clicking the visible left wall at game coordinate `(30, 250)` sent the avatar there. The [result](docs/game-review/58-player-in-wall.png) shows the character standing on the wall near the left screen edge. The central escalator is avoided, but the whole 720×1280 image is otherwise used as the movement bounds, with only seven rectangular obstacles.

**Why it matters**  
The background communicates a solid wall while navigation treats it as floor. This breaks the spatial illusion and makes accepted/rejected destinations inconsistent.

**Recommended change**  
Define a walkable floor region that follows the lobby's actual architecture, with explicit interaction approach points. Clamp/project invalid clicks to a nearby valid floor point or reject them with a small visible cue. Give the character's feet a footprint when calculating clearance, rather than relying solely on a center point.

**Implementation hint**  
[layout.ts](game/src/data/layout.ts): lobby `worldBounds`; [lobbyArt.ts](game/src/scenes/lobbyArt.ts): `LOBBY_OBSTACLES`; [TapToMove.ts](game/src/systems/TapToMove.ts) and [walkPath.ts](game/src/systems/walkPath.ts).

**Acceptance criteria**  
Wall, furniture and escalator clicks cannot place the avatar on those surfaces or beyond the visible floor. All required destinations remain reachable from both the entrance and hall-return spawn. Corner routes preserve a defined foot clearance.

### [G03] Startup downloads the entire experience before the guest can begin

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**Severity:** P1  
**Category:** Technical  
**Kind:** Loading/performance problem

**Observed**  
The initial resource capture recorded **60 asset requests totaling 56,205,761 transferred bytes (53.60 MiB)**. This excludes Vite modules and the approximately 22 MB development Phaser module. Food pictures, bridal/garden scenes, group-photo scenes, both travel routes, multiple character sheets and three full-resolution invitation photos were fetched before gameplay. The two food PNGs alone total approximately 6.2 MB. [Recorded measurements](docs/game-review/startup-metrics.json).

**Why it matters**  
Localhost concealed the download cost: those asset responses completed in about 2.5 seconds locally. At 8 Mbit/s, 56.2 MB represents roughly 56 seconds of transfer alone—an estimate, not a measured production result. A mobile invitation should reach its opening quickly, including for people who will use “건너뛰기”. Eager generation of all avatar combinations also increases work and texture memory before a selection is made.

**Recommended change**  
Load the opening and its essential UI first; warm the setup assets next, then load/prefetch the selected route and nearby scenes. Optimize large images at their intended display density, and prebuild reusable avatar atlases where practical. Remove obsolete assets from the initial preload after checking actual references. Keep a readable loading label and recovery action.

**Implementation hint**  
[BootScene.ts](game/src/scenes/BootScene.ts): `preload` and `create`; [assetManifest.ts](game/src/data/assetManifest.ts); [minimi.ts](game/src/ui/minimi.ts): `buildMinimiTextures`; `public/assets/lacitta/food` and `pixel-venue`.

**Acceptance criteria**  
Measure a production build with a cold cache and an agreed initial asset budget, for example ≤5 MB before the opening becomes interactive. Food, unselected route and late ceremony assets are absent from the critical startup path. Later scenes have no missing-texture flashes, and failed loads expose a retry action.

### [G04] Information panels hide their close rule, and narration hides its advance rule

- [x] fixed — Batch A, 2026-09-12

**Severity:** P1  
**Category:** UI  
**Kind:** Modal/navigation UX problem

**Observed**  
The [notebook](docs/game-review/14-memory-book.png), [ATM](docs/game-review/55-atm-information.png), [drinks](docs/game-review/56-drinks-information.png) and bridal-restriction panels show no close button or “tap to continue” hint. Clicking their text closes them, but Escape did not close the ATM panel. Other story panels auto-advance, reveal their full text on a tap, or require a separate choice. The photo gallery, by contrast, has a visible × and working Escape behavior.

**Why it matters**  
The same-looking panel has several different interaction rules. A guest may wait on an information panel indefinitely or dismiss it accidentally while attempting to interact with the scene behind it. Hidden tap shortcuts also fail to solve waiting for people who never discover them.

**Recommended change**  
Use explicit modes: information gets “닫기”; narration gets a consistent “다음” or visible tap hint; choices retain their buttons. Support Escape for dismissible information. Keep input blocking behind open panels. Allow important travel information to remain until acknowledged instead of relying only on an automatic hold timer.

**Implementation hint**  
[StoryDialog.ts](game/src/ui/StoryDialog.ts): `showInfo`, `show`, `narrate`; [waitForTap.ts](game/src/ui/waitForTap.ts); [style.css](game/src/style.css).

**Acceptance criteria**  
Every waiting panel visibly communicates how to proceed. Information closes using its button and Escape and restores scene input. Rapid taps cannot select a newly appeared choice unintentionally. All text remains available long enough to read without knowing a hidden shortcut.

### [G05] Canvas labels and targets shrink below a useful mobile size

- [x] fixed — Batch A, 2026-09-12

**Severity:** P1  
**Category:** UI  
**Kind:** Responsive readability problem

**Observed**  
Lobby facility labels use 20 game pixels: approximately **10.9 CSS px** at 393-wide and **8.9 CSS px** at 320-wide. The [320×568 lobby](docs/game-review/60-lobby-320x568.png) is navigable but labels are thin and tiny. At [852×393 landscape](docs/game-review/64-lobby-landscape.png), the portrait canvas is only about 221 px wide, reducing those labels to approximately **6.1 CSS px**. An 88-unit canvas button becomes 39 px high at 320-wide and 27 px in landscape. The [landscape customizer](docs/game-review/49-avatar-landscape.png) scrolls to reach its lower controls; its part grid also exceeds its allocated width. DOM story buttons maintain a much larger minimum size than canvas UI.

**Why it matters**  
The game cannot assume that a 44-unit minimum inside a 720-wide coordinate system is a 44-pixel touch target. Important labels become harder to read than the decorative scene, particularly for older wedding guests.

**Recommended change**  
Set minimum sizes in displayed CSS pixels for navigation and essential text. Move small HUD labels/targets to an aligned overlay or scale them inversely to the scene fit. For short landscape viewports, provide a clear portrait recommendation with an accessible route to the invitation, or a dedicated larger control layout. Keep portrait setup's existing scroll fallback.

**Implementation hint**  
[main.ts](game/src/main.ts): `Phaser.Scale.FIT`; [sceneUi.ts](game/src/ui/sceneUi.ts): `MIN_TOUCH_TARGET`, text and button helpers; [lobbyArt.ts](game/src/scenes/lobbyArt.ts): labels; [style.css](game/src/style.css): setup/grid rules.

**Acceptance criteria**  
At the tested portrait sizes, essential labels remain at least 14 CSS px and primary touch targets at least 44×44 CSS px without overlap. Landscape either supplies readable controls or explicitly guides the guest to a usable alternative. The customizer has no horizontal control overlap and its submit action remains reachable.

### [G06] The travel quiz asks for information it has not taught

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**Severity:** P1  
**Category:** Game Design  
**Kind:** Choice/difficulty design problem

**Observed**  
The [car prompt](docs/game-review/07-car-route-choice.png) asks for yellow, pink or blue without identifying their destinations. The [subway prompt](docs/game-review/51-subway-choices.png) offers five numbered exits with no visible instruction that the shuttle is at exit 5. Choosing exit 1 produced “여기가 아닌가...” (“Maybe this isn't it...”), a return walk, and the same five choices. The correct parking/exit information is much clearer in the later invitation page than in these quiz screens.

**Why it matters**  
A first-time player has no informed decision to make. Wrong answers spend time without providing a useful new clue or marking what has been tried. This is artificial friction in a game whose practical purpose includes teaching guests how to arrive.

**Recommended change**  
Put readable destination information into the scene/signage before asking. For example, identify the blue B3 route and the exit-5 shuttle on an in-world sign or small invitation note. Retain the humorous wrong-turn vignette if desired, but then reveal the useful clue and mark the attempted option. The choice can rehearse real directions without being a memory test of information never shown.

**Implementation hint**  
[CarRouteScene.ts](game/src/scenes/CarRouteScene.ts): `prompt`, `drive`; [SubwayRouteScene.ts](game/src/scenes/SubwayRouteScene.ts): `prompt`, `chooseExit`.

**Acceptance criteria**  
A player can identify the correct destination using only information visible before the first choice. After a mistake, the next choice contains additional useful feedback. Repeating the same wrong option is unnecessary to progress.

### [G07] Starting the game removes the direct invitation exit, and the ending requires a message

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**Severity:** P1  
**Category:** UX  
**Kind:** Exit/completion-flow problem

**Observed**  
The intro's “건너뛰기” opens the actual invitation. No equivalent persistent action appears during travel, the lobby or ceremony. At the [ending](docs/game-review/38-ending-message.png), the only action is “메시지 남기기”; submitting an empty message is rejected. “청첩장 보기” and “처음부터 다시” appear only after saving a message locally.

**Why it matters**  
A guest who starts playing and then just wants the address/time must complete the journey or discover a browser-level escape. A guest who finishes but does not want to write a message cannot use the visible completion/replay controls. The invitation's useful information should not depend on optional creative input.

**Recommended change**  
Provide a persistent, discreet “청첩장” action in the game menu. At the ending, offer “메시지는 나중에” alongside saving; both lead to the same invitation/replay choices. Preserve the clear local-only storage explanation. Saving must remain optional, not silently simulated.

**Implementation hint**  
[IntroScene.ts](game/src/scenes/IntroScene.ts): existing skip action; shared [sceneUi.ts](game/src/ui/sceneUi.ts); [EndingScene.ts](game/src/scenes/EndingScene.ts); [TextEntryDialog.ts](game/src/ui/TextEntryDialog.ts).

**Acceptance criteria**  
The invitation is reachable from every major game stage in at most two actions. Completing the game without writing a message is possible and creates no guestbook entry. Saving a real message still preserves its selected avatar and side.

### [G08] Keyboard support stops at the canvas controls

- [x] fixed — Batch B, 2026-09-13; [검증 기록](docs/game-review/after-batch-b/README.md)

**Severity:** P1  
**Category:** UX  
**Kind:** Input accessibility problem

**Observed**  
In a separate desktop/DPR-1 context, Tab and Enter could not activate either intro action: focus remained on the body, the game canvas had `tabIndex = -1`, and the document contained no buttons. [Desktop evidence](docs/game-review/76-desktop-dpr1-keyboard.png). DOM setup/story choices can be keyboard-focused, and the photo gallery handles arrows/Escape, but canvas “사진 찍기”, lobby facilities and other canvas buttons do not offer an equivalent keyboard path.

**Why it matters**  
A guest cannot complete the game with a keyboard or a keyboard-based assistive input device. Mixed support is particularly confusing because some parts work normally and the next screen has no reachable action.

**Recommended change**  
Expose semantic, focusable controls aligned with the canvas controls, or provide an equivalent destination/action list. Set sensible focus when opening a scene/dialog and return it on close. Supporting a destination list is sufficient; this game does not need WASD movement merely for convention.

**Implementation hint**  
[sceneUi.ts](game/src/ui/sceneUi.ts): `createTouchButton`; [StoryDialog.ts](game/src/ui/StoryDialog.ts); [VenueLobbyScene.ts](game/src/scenes/VenueLobbyScene.ts): room navigation; compare the existing DOM controls in [InvitationView.ts](game/src/ui/InvitationView.ts).

**Acceptance criteria**  
Starting, choosing a route, completing required activities, taking photos, dismissing information and reaching the ending are possible with Tab/Enter/Space/Escape alone. Focus is visible and never disappears into a destroyed control after a transition.

### [G09] Refresh discards the entire in-progress visit

- [ ] remaining

**Severity:** P2  
**Category:** Technical  
**Kind:** Session recovery limitation

**Observed**  
After pink parking and a completed photo-booth visit, the [lobby before refresh](docs/game-review/74-before-refresh.png) had `photoBoothVisited=true`. A normal browser reload returned to the [intro](docs/game-review/75-after-refresh.png), with no resume option. Appearance and progression live in the Phaser registry; saved guestbook messages survive separately in localStorage.

**Why it matters**  
An accidental refresh costs the guest their setup and completed activities. A browser tab being reloaded by a mobile OS could have the same consequence, although that physical-device behavior was not tested here.

**Recommended change**  
Save a small, versioned checkpoint at stable scene/activity boundaries and offer “이어하기 / 처음부터”. Restore at a safe lobby/scene entry rather than inside a running tween. Clear the checkpoint when the user intentionally restarts.

**Implementation hint**  
[gameState.ts](game/src/state/gameState.ts); [BootScene.ts](game/src/scenes/BootScene.ts); [EndingScene.ts](game/src/scenes/EndingScene.ts) and [InvitationScene.ts](game/src/scenes/InvitationScene.ts): the two replay paths.

**Acceptance criteria**  
Refreshing after a required visit restores the chosen avatar, side, route and completed visits on Continue. Start Over clears visit progress. Old/incompatible checkpoints recover to a usable opening, and no mid-animation callback runs twice.

### [G10] Nearest-neighbor is enabled, but the artwork has no shared pixel density

- [ ] remaining

**Severity:** P2  
**Category:** Pixel Art  
**Kind:** Art/scaling consistency issue

**Observed**  
`pixelArt: true`, `roundPixels: true` and `image-rendering: pixelated` are already present. Nevertheless, the hall is **941×1672**, lobby **941×1671**, group backdrop **940×1672**, and the car sprite **1448×1086**; these are rescaled into a 720×1280 world and then fitted again to the viewport. Generated minimi frames are 128×192, typically displayed at 64×96. Group guests use sizes such as 86.4×129.6. In the [mobile intro](docs/game-review/01-intro-393x852.png), tiny screen lettering and architectural detail have uneven/thinned strokes compared with the [larger view](docs/game-review/47-desktop-intro-keyboard.png). Fine venue/food texture, coarse character outlines and small UI pixels have visibly different densities.

**Why it matters**  
Nearest sampling prevents bilinear blur but cannot make arbitrary resampling preserve a consistent pixel grid. Fine details get dropped or vary in apparent thickness. This reads as a mixture of pixel illustration and reduced high-resolution art rather than one deliberately authored game resolution.

**Recommended change**  
Choose a shared logical art density and prepare scene/sprite exports for it, with manual cleanup of lettering and important silhouettes. Use integer-aligned positions/sizes where feasible and check physical-pixel scaling at target DPRs. Preserve the full scene on phones; forcing integer enlargement of the existing 720-wide canvas is not a workable mobile fix. Do not simply add another nearest-neighbor flag.

**Implementation hint**  
[main.ts](game/src/main.ts), [photoArt.ts](game/src/scenes/photoArt.ts), [sceneArt.ts](game/src/scenes/sceneArt.ts), [minimi.ts](game/src/ui/minimi.ts), [VenueHallScene.ts](game/src/scenes/VenueHallScene.ts), image exports under `public/assets/lacitta`.

**Acceptance criteria**  
Document the intended pixel grid for backgrounds, characters and UI. Key text/outlines remain stable at 320/393/430-wide and desktop DPR 1. Slow movement does not visibly change outline thickness. Any intentional density difference is limited to a defined layer such as actual photographs.

### [G11] Parking abruptly switches to a much flatter art style and perspective

- [ ] remaining

**Severity:** P2  
**Category:** Pixel Art  
**Kind:** Art-direction polish opportunity

**Observed**  
The detailed [car approach](docs/game-review/07-car-route-choice.png) cuts to a [flat parking layout](docs/game-review/10-blue-parking.png): repeated rectangles, schematic parked cars, flat lighting and a central stripe. The player's car retains a detailed rear-view sprite while the parked cars are drawn from above. Yellow and pink use the same basic arrangement with a different sign/color.

**Why it matters**  
This is the clearest place where the environment looks like an implementation diagram amid much richer illustrated scenes. The player's car and parking floor disagree about the camera angle.

**Recommended change**  
Bring the parking scene to the same viewing angle and restrained material/shadow treatment as the route art, or explicitly present it as a stylized parking-map vignette and use a matching overhead car icon. A small, coherent scene is enough; it does not need the flower density of the wedding hall.

**Implementation hint**  
[parkingArt.ts](game/src/scenes/parkingArt.ts); [CarRouteScene.ts](game/src/scenes/CarRouteScene.ts): `renderParking`; [Player.ts](game/src/objects/Player.ts): car appearance.

**Acceptance criteria**  
Moving and parked cars share a camera angle and comparable pixel density. Wall/floor depth and shadows follow that angle. The transition reads as an intentional change of location or a clearly framed map, rather than an unfinished background.

### [G12] Walking is a sliding pose with a bob, and speed changes sharply between scenes

- [ ] remaining

**Severity:** P2  
**Category:** Game Feel  
**Kind:** Movement/animation polish opportunity

**Observed**  
The avatar slides through the lobby and automatic corridor walks while retaining one directional pose. `updateMovement` changes its facing frame and adds a small sine bob; it does not play a footstep cycle. Speeds range from 240 units/s at home/garden to 640 in the lobby, 300 in the photo rooms and 420 in the subway approach. The [garden](docs/game-review/25-garden-walking.png) and [lobby movement](docs/game-review/59-escalator-clearance.png) make the static-foot pose particularly apparent.

**Why it matters**  
Watching the personalized character travel is the game's most repeated physical action. Skating weakens its personality, while the fast lobby crossing and slower scripted travel feel like different movement systems.

**Recommended change**  
Add a restrained two- or four-frame walk cycle to the composited avatar and tie its cadence to distance traveled. Tune relative scene speeds deliberately and settle into the idle frame promptly on arrival. Keep immediate tap responsiveness; inertia or platformer-style acceleration is unnecessary here.

**Implementation hint**  
[Player.ts](game/src/objects/Player.ts): `updateMovement`, `setDirection`; [minimi.ts](game/src/ui/minimi.ts): generated pose atlas; per-scene speed configuration. Existing legacy walk animation registration in [assetHelpers.ts](game/src/ui/assetHelpers.ts) is not used by the current composed avatar movement.

**Acceptance criteria**  
Feet alternate during sustained movement, cadence follows distance at different frame rates, and arrival returns to a stable idle pose without a pivot jump. The same outfit/hair/face remains aligned in each walking frame. Fast lobby travel still reads as walking rather than gliding.

### [G13] Avatars are weakly grounded in the perspective scenes

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md) (사진 결과 범위; 기존 로비/이동 장면의 배율·발 앵커 유지)

**Severity:** P2  
**Category:** Pixel Art  
**Kind:** Character/environment hierarchy polish

**Observed**  
In the [photo booth](docs/game-review/16-photo-booth-choice.png), [bridal room](docs/game-review/26-bridal-room-ready.png) and [shuttle scene](docs/game-review/53-shuttle-boarding.png), the avatar stays at roughly the same small display size despite strong foreground-to-background perspective. It lacks the contact shadow/reflection suggested by the surrounding floor. In the bridal photo, the two figures occupy a small corner of a large empty room. The group photo already adds subtle ground shadows to background guests, showing a more grounded treatment.

**Why it matters**  
The player's chosen character can look pasted onto the illustration, and the most personal interactions happen at a scale where expression and pose are hard to appreciate.

**Recommended change**  
Establish feet anchors and a small scene-appropriate contact shadow. Use discrete, pixel-grid-compatible depth scales or a closer authored composition for the photo payoff. Reserve foreground space for the walking approach, then frame the actual interaction more closely. Keep the useful lobby overview intact.

**Implementation hint**  
[Player.ts](game/src/objects/Player.ts), [VenueRoomScene.ts](game/src/scenes/VenueRoomScene.ts), [GreeneryCorridorScene.ts](game/src/scenes/GreeneryCorridorScene.ts), [SubwayRouteScene.ts](game/src/scenes/SubwayRouteScene.ts).

**Acceptance criteria**  
Feet visibly meet their intended floor/seat position without overlap jumps. Character scale is plausible relative to nearby objects at the interaction point. The selected avatar and bride remain recognizable at phone size during their photograph.

### [G14] Applause and cheer produce no distinct ceremony response

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**Severity:** P2  
**Category:** Game Feel  
**Kind:** Action-feedback problem

**Observed**  
Both “박수를 친다” and “환호를 한다” immediately replace the ceremony with the same group-photo setup. The two full playthroughs exercised both. The selected reaction is stored in `dataset.ceremonyReaction`, but `celebrate` does not use it to change the visible sequence. There is no clap/cheer pose, speech response or audience acknowledgment before the scene changes.

**Why it matters**  
These are expressive choices at the emotional peak of a wedding game. A choice that produces no recognizable action makes the guest feel like they selected a generic Continue button.

**Recommended change**  
Give each choice a brief distinct response: a clap pose/audience beat for applause, and a small “축하해!” speech response for cheering. Let the couple acknowledge it, then transition to the existing group photo. Optional short sounds should be user-enabled and have equivalent visual feedback; source currently contains no gameplay audio system.

**Implementation hint**  
[VenueHallScene.ts](game/src/scenes/VenueHallScene.ts): `celebrate`; [pixelFeedback.ts](game/src/ui/pixelFeedback.ts); avatar pose generation if a clap frame is added.

**Acceptance criteria**  
Each choice starts visibly different feedback promptly, remains on the ceremony long enough for that feedback to register, and reaches the same valid group-photo flow exactly once. The distinction works with sound off and reduced motion enabled.

### [G15] Required photos do not leave a visible keepsake or a consistent completion beat

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**Severity:** P2  
**Category:** Game Design  
**Kind:** Reward/closure problem

**Observed**  
The booth approaches, poses, flashes and returns to the lobby automatically after a short hold. The bridal visit does the same. There is no resulting photo card or on-screen “memory added” acknowledgment. In contrast, the group photograph has a countdown, congratulatory text and a manual Next button. Compare the [booth pose](docs/game-review/17-photo-booth-pose.png), [bridal photograph](docs/game-review/27-bridal-photo.png) and [group result](docs/game-review/31-group-photo-complete.png).

**Why it matters**  
Two mandatory activities feel like invisible checklist toggles. The guest cannot pause to enjoy the result, and may be unsure whether the booth counted if they miss the flash.

**Recommended change**  
End each required photo with a small framed result and a clear “수첩에 추억을 남겼어요” acknowledgment, followed by an explicit return action. Reuse that result in the notebook. Differentiate a booth keepsake, a personal bride greeting and the group portrait without adding another task to each.

**Implementation hint**  
[VenueRoomScene.ts](game/src/scenes/VenueRoomScene.ts): `beginPhotoVisit`, `beginBridalVisit`, completion timers; [VenueLobbyScene.ts](game/src/scenes/VenueLobbyScene.ts): notebook; existing group completion pattern in [VenueHallScene.ts](game/src/scenes/VenueHallScene.ts).

**Acceptance criteria**  
The player sees an unambiguous completed photo and can leave it on screen until choosing to return. Notebook progress updates once. Returning early without taking the booth photo still does not award it.

### [G16] The group portrait repeats only six guest variants and weakly identifies the player

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**Severity:** P2  
**Category:** Pixel Art  
**Kind:** Crowd composition/generation defect

**Observed**  
The [group portrait](docs/game-review/29-group-photo-ready.png) repeats recognizable hairstyles/outfits across rows. Source constructs 42 available guest entries but selects `(index * 7) % guests.length`, which cycles through only **six** entries because 7 divides 42. The player stands beside the correct member of the couple, but the only extra marker consists of two tiny gold squares; a similar-looking preset guest can compete with that avatar.

**Why it matters**  
The crowd looks cloned despite an existing larger wardrobe. The key reward—seeing yourself beside the couple—takes unnecessary visual searching, especially at mobile scale.

**Recommended change**  
Choose guest variants without replacement using a deterministic shuffle, or an indexing step coprime to the available count. Avoid placing an exact copy of the player's appearance near them. Add a brief, tasteful “나”/name cue or distinct frame around the player's spot when the composition first appears.

**Implementation hint**  
[VenueHallScene.ts](game/src/scenes/VenueHallScene.ts): `celebrate`, `drawGuest`; [guestPhotoLayout.ts](game/src/ui/guestPhotoLayout.ts).

**Acceptance criteria**  
The crowd uses the intended range of variants rather than a six-entry cycle. The player's appearance matches setup and is identifiable immediately at 393-wide. The cue does not obscure faces or disturb the couple's visual priority.

### [G17] The reception-complete banner becomes permanent scenery

- [x] fixed — Batch C, 2026-09-14; [검증 기록](docs/game-review/after-batch-c/README.md)

**Severity:** P2  
**Category:** UI  
**Kind:** HUD hierarchy/occlusion issue

**Observed**  
After reception, returning to the lobby shows a persistent black “접수 완료! 로비를 둘러보고 식장으로 가요” banner near the bottom. In the [320-wide view](docs/game-review/60-lobby-320x568.png), it intersects the avatar's lower body at the normal entrance spawn and covers part of the floor route. It repeats on later lobby visits while other activities are still incomplete.

**Why it matters**  
An already completed task gets the most prominent HUD treatment while the next task is less clear. The opaque strip also competes with navigation and the player character.

**Recommended change**  
Show reception completion briefly as a toast in a reserved HUD area, then retire it. Put durable completion in the notebook/progress treatment from G01. Keep the walking floor and player spawn unobscured.

**Implementation hint**  
[VenueLobbyScene.ts](game/src/scenes/VenueLobbyScene.ts): `statusText` creation and `if (this.receptionComplete)` block.

**Acceptance criteria**  
Reception acknowledgment is visible once at completion, does not cover the avatar or paths, and does not reappear indefinitely after unrelated room visits. Progress remains discoverable after the toast disappears.

### [G18] Canvas button colors do not return to their initial state after a canceled press

- [ ] remaining

**Severity:** P2  
**Category:** UI  
**Kind:** Button-state bug/polish

**Observed**  
On desktop, the intro Start button was cream initially, changed during a press, and remained gold after dragging outside and releasing without activation. [Canceled-press result](docs/game-review/79-desktop-button-after-cancel.png). `createTouchButton` restores a gold tint on pointer-out/up rather than the original appearance. Some room buttons also remain visually available while their handler rejects input during the photo approach; the booth's Return button is one example.

**Why it matters**  
A canceled action leaves a selection-like state, and an unavailable action still looks actionable. DOM choices use a different pressed-state treatment, increasing inconsistency across otherwise similar frames.

**Recommended change**  
Define shared idle/hover/pressed/disabled tokens for DOM and canvas buttons. Clear or restore the original tint on cancel and release. Hide or visibly disable room actions while they cannot run, and synchronize that appearance with interactivity.

**Implementation hint**  
[sceneUi.ts](game/src/ui/sceneUi.ts): `createTouchButton`; [PixelPanel.ts](game/src/ui/PixelPanel.ts); [VenueRoomScene.ts](game/src/scenes/VenueRoomScene.ts): photo-stage guards; [style.css](game/src/style.css): `.story-choice` states.

**Acceptance criteria**  
Press-drag-out-release restores the exact idle appearance and triggers no action. Completed presses trigger once. Disabled controls look different and cannot receive input. The same semantics are recognizable across canvas and DOM choices.

### [G19] Reduced-motion behavior is inconsistent across the photo scenes

- [ ] remaining

**Severity:** P2  
**Category:** Technical  
**Kind:** Preference-handling bug

**Observed**  
With Chromium's `prefers-reduced-motion: reduce` emulation enabled, the booth still produced a full white camera flash. The [captured frame](docs/game-review/73-reduced-motion-photo-flash.png) shows it directly. The group-photo flash is guarded by that preference, but booth and bridal flashes call `camera.flash` unconditionally. The group viewfinder's repeating REC tween also has no reduced-motion branch.

**Why it matters**  
The application already honors the preference for narration typing, avatar blinking and ambient decoration, so the remaining flash/tween behavior is an inconsistent implementation of an existing feature.

**Recommended change**  
Use one shared effects-preference check for photo flashes and decorative repeating animation. Under reduced motion, replace the flash with a static shutter/completion indicator and keep REC static. Preserve clear success feedback.

**Implementation hint**  
[VenueRoomScene.ts](game/src/scenes/VenueRoomScene.ts): both completion flashes; [VenueHallScene.ts](game/src/scenes/VenueHallScene.ts): `renderCameraFrame`; existing patterns in [pixelFeedback.ts](game/src/ui/pixelFeedback.ts).

**Acceptance criteria**  
With reduced motion enabled, all three photo activities complete with a visible acknowledgment and no full-frame flash or repeating REC blink. Normal mode retains the intended effects. Changing the preference does not alter progression.

### [G20] Large default choice panels cover the scene's main subject

- [x] fixed — Batch A, 2026-09-12

**Severity:** P2  
**Category:** UI  
**Kind:** Composition/visual hierarchy issue

**Observed**  
In the [ceremony choice screen](docs/game-review/28-ceremony-choice.png), narration covers the big screen and the applause/cheer buttons cover most of the couple. In the [car choice](docs/game-review/07-car-route-choice.png), the three large choices conceal much of the road's branching/signage area. The same generic panel stack is positioned near the center despite those scenes having different visual focal points. The later group-photo panel is more deliberately positioned above the guests.

**Why it matters**  
The guest must choose before they can appreciate what they are responding to. This is the strongest instance of a form-like overlay dominating the game art; using a pixel font and border alone does not solve its composition.

**Recommended change**  
Assign scene-specific dialogue safe areas. Preserve the couple, route decision area and player as visible subjects while choices are active. Use a compact bottom panel or appropriately sized alternative arrangement rather than applying the same large center stack everywhere. Keep the readable DOM text and useful touch target sizes.

**Implementation hint**  
[StoryDialog.ts](game/src/ui/StoryDialog.ts): placement options; [style.css](game/src/style.css): `.story-overlay`, `.story-narration`, `.story-choices`; constructors in [CarRouteScene.ts](game/src/scenes/CarRouteScene.ts) and [VenueHallScene.ts](game/src/scenes/VenueHallScene.ts).

**Acceptance criteria**  
At 320/393/430-wide, both members of the couple remain visible while the ceremony choices are shown, and route signage remains visible during the car choice. No important text or control is clipped or reduced below the minimum size established in G05.

### [G21] Dinner could offer one optional personal choice

- [ ] remaining

**Severity:** P3  
**Category:** Game Design  
**Kind:** Optional personality addition

**Observed**  
The [food reveal](docs/game-review/34-buffet-food.png) presents six detailed food/drink images automatically. Narration says the guest will pick appealing food, but the only actual dining decision is “식사를 마친다”. The car/subway text changes appropriately, while the images and meal interaction remain the same.

**Why it matters**  
This sequence mainly operates as a venue brochure after several other watch-and-continue activities. A small personal choice could distinguish dinner without introducing difficulty. It is not necessary for a successful invitation, so this is lower priority than every clarity fix above.

**Recommended change**  
If a slightly more interactive dinner is desired, allow one optional favorite dish or dessert selection and acknowledge it with the avatar/a tiny plate illustration. Keep a direct Finish Meal action and preserve the driver's non-drinking branch. Do not add hunger meters, repeated serving clicks or a mandatory food minigame.

**Implementation hint**  
[DinnerJourneyScene.ts](game/src/scenes/DinnerJourneyScene.ts): `revealFood` and the meal choice.

**Acceptance criteria**  
A guest can still finish the meal directly. An optional selection receives a distinct acknowledgment without affecting required progression or creating a second meal after the ceremony.

# Coverage of Checks Without Additional Findings

| Requested area | Result and boundary |
| --- | --- |
| Nearest-neighbor / blurry scaling | Correct Phaser pixel-art/rounding and CSS pixelated settings are present. Remaining density/resampling issues are G10; this is not a missing `image-rendering` fix. |
| Fractional positioning / canvas scaling | The canvas is 720×1280 and FIT scales it fractionally. Player motion and bob use fractional coordinates; renderer rounding helps. No sustained movement-jitter or frame-pivot-jump defect was established beyond the visible scaling/animation concerns in G10/G12. |
| Sprite atlas bleeding / transparency | No neighboring-frame bleed, colored matte rectangles, or broken transparency was observed in the sampled male/female avatars, customization previews, poses or group shots. Not every wardrobe combination was exhaustively tested. |
| Palette / outlines / contrast | Warm ivory, green, gold and dark outlines mostly belong together. Rich flower/marble variation is intentional rather than inherently wrong for pixel art. Density and the parking style are the notable inconsistencies. Dark information panels provide useful text contrast. |
| Tiles / repeated patterns / seams | Scenes are mostly flattened illustrations, not a runtime tilemap. Repeated floor/flower patterns do not create an observed tile seam defect. The crowd repetition and schematic parking repetition are addressed specifically. |
| Lighting / silhouettes / foreground separation | Backgrounds generally maintain convincing daylight/interior lighting. Dark-outlined avatars are recognizable. Missing grounding and focal-point occlusion are G13/G20; no blanket recoloring or relighting pass is justified. |
| HUD / score / resources | No unnecessary score, health or currency HUD is present. The notebook is the appropriate progress metaphor; its discoverability and the permanent reception status need work. |
| Typography / normal-web-UI intrusion | Galmuri and square framed buttons mostly fit the game. The avatar's image choices work well on small portrait screens. The problematic intrusion is the oversized scene-covering panel stack, not the existence of DOM controls. The separate, scrollable invitation legitimately uses readable prose and real photographs. |
| Controls / danger / collectibles | There are no dangerous objects or pickups to misread. Travel mistakes are reversible. Interactive scenery is labeled, but the lobby does not teach its interaction model or show destination/rejection feedback. |
| Input response / collision | Valid taps begin movement promptly and can redirect a lobby walk. Clicking the escalator itself is rejected silently; traversing across it finds an alternate path. Wall navigation is the reproduced collision defect. |
| Delta time / frame dependency | `Player.updateMovement` uses `speed * deltaMs / 1000` and clamps arrival. No evidence supports calling movement frame-rate-dependent. Movement has no inertia/jump timing to tune. |
| Camera / transitions | The fixed portrait camera suits overview and mobile touch targeting. Most scene fades are short and coherent. G13 concerns composition at reward moments; G14 concerns the abrupt missing ceremony reaction. No screen shake is needed. |
| Damage / hits / combat effects | Not applicable. Do not add hit stop, damage flashes, attack particles or shake to an invitation to satisfy an action-game checklist. |
| State races / repeated taps | Normal transitions, repeated visits, tap-skipping, two complete journeys and both replay entry points completed without an uncaught exception or observed duplicate progression. That is sampled behavior, not proof against all races. |
| Rerenders / allocations / maintainability | This is Phaser plus DOM overlays, not a React render loop. The significant observed cost is broad preload/runtime asset preparation (G03), not an established expensive per-frame rerender. Scene-local UI/input/timer cleanup is generally present. |
| Resize / focus | Portrait fit and overlay repositioning work at sampled sizes. Small canvas labels/landscape and missing keyboard paths are G05/G08. A physical software-keyboard/Safari test is still unverified. |
| Failure / restart | Wrong routes recover. Intentional ending replay resets route/visit data and returns to the intro; invitation replay also resets actual visit requirements, confirmed by the second run. Refresh recovery and the mandatory ending form remain G09/G07. |
| Console / asset failures | **0 uncaught page errors and 0 failed requests** in the recorded primary session. Warnings concern WebGL ReadPixels stalls and Canvas2D readback hints. These alone do not establish a user-visible GPU performance bug. [Browser log](docs/game-review/browser-log.json). |

# Evidence Guide

The full capture set is under [docs/game-review](docs/game-review/). These are the key states for reviewing the conclusions:

| States | Representative screenshots |
| --- | --- |
| Opening, naming, avatar choices | [Intro](docs/game-review/01-intro-393x852.png), [female setup](docs/game-review/04-avatar-gender.png), [320-wide setup](docs/game-review/48-avatar-320x568.png), [custom male](docs/game-review/50-custom-avatar.png) |
| Car route and all parking outcomes | [Choice](docs/game-review/07-car-route-choice.png), [yellow error](docs/game-review/09-wrong-parking.png), [blue B3](docs/game-review/10-blue-parking.png), [pink tower](docs/game-review/71-pink-tower-parking.png) |
| Subway and shuttle | [Five exits](docs/game-review/51-subway-choices.png), [wrong-exit travel](docs/game-review/52-subway-wrong-exit.png), [boarding](docs/game-review/53-shuttle-boarding.png) |
| Lobby and modal states | [Arrival](docs/game-review/11-lobby-arrival.png), [notebook](docs/game-review/14-memory-book.png), [hall requirements](docs/game-review/15-hall-requirements.png), [ATM](docs/game-review/55-atm-information.png), [drinks](docs/game-review/56-drinks-information.png), [groom restriction](docs/game-review/57-groom-bridal-restriction.png) |
| Navigation and portrait/landscape sizes | [Wall bug](docs/game-review/58-player-in-wall.png), [escalator route](docs/game-review/59-escalator-clearance.png), [320](docs/game-review/60-lobby-320x568.png), [430](docs/game-review/61-lobby-430x932.png), [720](docs/game-review/62-lobby-720x1280.png), [landscape](docs/game-review/64-lobby-landscape.png), [desktop DPR 1](docs/game-review/80-lobby-desktop-dpr1.png) |
| Photo booth and gallery | [Ready](docs/game-review/16-photo-booth-choice.png), [pose](docs/game-review/17-photo-booth-pose.png), [gallery](docs/game-review/19-photo-gallery.png), [next photo](docs/game-review/20-photo-gallery-next.png) |
| Reception, corridor and bride | [Greeting](docs/game-review/21-reception-greeting.png), [envelope](docs/game-review/22-envelope-writing.png), [garden](docs/game-review/25-garden-walking.png), [bridal room](docs/game-review/26-bridal-room-ready.png), [photo](docs/game-review/27-bridal-photo.png) |
| Ceremony and both reactions | [Choices](docs/game-review/28-ceremony-choice.png), [applause path](docs/game-review/29-group-photo-ready.png), [countdown](docs/game-review/30-countdown.png), [result](docs/game-review/31-group-photo-complete.png), [cheer path](docs/game-review/68-groom-group-cheer.png) |
| Dinner and meal ordering | [Corridor](docs/game-review/32-banquet-corridor.png), [stable banquet panorama](docs/game-review/81-banquet-stable-desktop.png), [food reveal](docs/game-review/34-buffet-food.png), [car meal](docs/game-review/35-car-meal-choice.png), [meal-order choice](docs/game-review/65-meal-order-choice.png), [subway meal](docs/game-review/66-subway-meal-first.png), [already eaten](docs/game-review/69-meal-already-done.png) |
| Ending, invitation and replay | [Message form](docs/game-review/38-ending-message.png), [saved](docs/game-review/40-ending-saved.png), [invitation](docs/game-review/41-invitation-top.png), [lightbox](docs/game-review/43-invitation-lightbox.png), [guest postcard](docs/game-review/45-guest-postcard.png), [replay reset](docs/game-review/70-ending-replay-reset.png) |
| Preferences, refresh and keyboard/button states | [Reduced-motion flash](docs/game-review/73-reduced-motion-photo-flash.png), [before refresh](docs/game-review/74-before-refresh.png), [after](docs/game-review/75-after-refresh.png), [desktop keyboard](docs/game-review/76-desktop-dpr1-keyboard.png), [hover](docs/game-review/77-desktop-button-hover.png), [pressed](docs/game-review/78-desktop-button-pressed.png), [canceled](docs/game-review/79-desktop-button-after-cancel.png) |

# Things That Are Already Good

- **A specific place and occasion.** The flowers, cream stone, green glass, chandeliers and hall screen give this wedding a recognizable identity. The game's strongest quality is not interchangeable with a generic pixel template.
- **Appropriate game scope.** A calm invitation needs exploration, small expressive choices and a conclusion. Avoid adding combat, score pressure, punishment, grinding or a large progression system.
- **The minimi is worth preserving.** Face, hair and wardrobe selection offer tangible personalization. The tested choices persisted into walking, the group photo and the saved message postcard. Portrait setup remains usable at 320-wide, with clear image-based choices and generous arrow hit areas.
- **The couple remains the emotional center.** Placing the player beside the appropriate bride/groom in the group shot is a strong payoff. Improve its visibility rather than replacing it with a generic victory screen.
- **Useful route-specific writing.** B3/tower parking, exit 5/shuttle, automatic parking allowance and the driver's non-drinking dialogue connect the fiction with the real visit. Teach these details more clearly before quizzing them.
- **Meal ordering actually works.** Eating first returns to the ceremony path, retains completed activities, and avoids a duplicate dinner afterward. This is a meaningful sequencing choice already implemented correctly in the tested run.
- **The notebook metaphor fits.** Hearts and memories suit the wedding far better than XP or a quest log styled as a productivity app. Make this existing system visible and informative.
- **Obstacles and modal blocking have a good foundation.** The avatar routes around the escalator, and open information/gallery panels prevent unintended scene actions. Extend the floor model without removing those protections.
- **The group photo already has a useful interaction rhythm.** Ready → countdown → shutter → congratulation → manual Next is clearer than the automatic photo-room flow and should be the reference for it.
- **Restrained pixel feedback has personality.** The idle avatar's small heart reaction and blinking work with the theme. Keep effects selective; a few strong responses at photography and congratulations will do more than constant particles.
- **Readable, coherent core UI materials.** Galmuri, dark translucent dialogue, square cream buttons and gold frames largely fit the artwork. DOM text is an advantage for readable Korean; composition and behavior need refinement, not wholesale replacement.
- **Actual photographs have an appropriate home.** The framed photo table and separate invitation gallery appropriately show the real couple. Their photographic style should not be counted as an accidental pixel-art failure.
- **The invitation is a practical destination.** Its scrollable information, photo navigation, visible dialog close controls, message postcard and reused avatar give the game a useful conclusion. Retain the explicit statement that the guestbook is currently local-only; the audit did not find a false claim that messages were sent to the couple.
- **Basic rendering and lifecycle decisions are sound.** Pixel-art rendering is enabled, movement uses delta time, arrival is clamped, scene transitions are guarded, and many listeners/timers are cleaned up on shutdown. Both complete journeys and the read-only TypeScript check succeeded. Build on this foundation rather than rewriting the game loop without a demonstrated need.


## Batch A implementation record — 2026-09-12

Implementation follows `GAME_REVIEW_FINAL.md` Batch A (F03, F04, F05, F01, F06). The original findings above are preserved as audit evidence. Status refers to the final review’s acceptance criteria. Batch B/C/D and F24/F25 remain deferred.

See [acceptance checks, exact file list, and AFTER comparisons](docs/game-review/after-batch-a/README.md).


## Batch D 구현·검증 기록 — 2026-09-14

원래 finding은 유지한다. 이번 판정은 `BATCH_D_IMPLEMENTATION.md`의 수용 기준과 고정된 최종 소스의 실제 Chromium 검증을 따른다. 앞선 배치 기록의 deferred 표시는 해당 당시 상태다.

- [x] fixed — D-A01: 실제 shipping 98개와 runtime/production 대조, 기존40개 추적 및 원본 보존, 정상/음성 검사.
- [x] fixed — C-P01: 작은 손 박수와 주체에 연결한 말풍선, 정상 반응 후 단체사진1회.
- [x] fixed — F16: 공통 취소/pressed/disabled/키보드 focus 및 단일 입력.
- [x] fixed — F17: 세 촬영 장면의 공통 감소 모드·실행 중 변경·리스너 정리.
- [x] fixed — F18: versioned 안전 checkpoint와 사진 메타데이터 복구,320 이어하기 겹침 해소.
- [x] fixed — F19: 같은 top-down 차량의 주차 안내도, 기존 B3/타워/오답 경로 보존.
- [x] fixed — F20: 수동3장 사진 카드와 직접 식사 종료.
- [x] fixed — F21: 크림/골드/딥그린 장소 명패, 기존 접근점·이름·수첩 유지.
- [ ] remaining — F22: 프레임 구현·5 viewport 자동 검증 PASS. 실제 폰 safe area/주소창/OS 키보드 검증은 남아 PARTIAL.
- [x] fixed — F23: 거리 기준4방향×2걸음, idle/발 앵커·90외형 검증.
- [x] F24 대상 선별 문서만 완료(후보0개).
- [ ] remaining — F24 실제 아트 재가공 및 F25: 이번 범위 밖이며 미실행.

최종 dev112 PASS/3 production-only SKIP, production32 PASS, 별도 첫 화면·정상 사진 복구2 PASS와320 입력1 PASS. 정상 shipping 검사 exit0 및 별도 음성 fixture5 PASS. 상세/요약/실패 이력/화면/영상/한계는 [Batch D 검수 README](docs/game-review/after-batch-d/README.md)에 있다. 외부 배포·공유·전송 없음.
