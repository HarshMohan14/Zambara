# 04 — Sections: layout and scroll timelines

Notation:
- `q` = section progress 0→1 (03-scroll-engine).
- `ss(a,b)` = smoothstep window.
- Coordinates are design-canvas px: desktop 1600 x 900, mobile 390 x 844 unless stated.
- `D:` = desktop, `M:` = mobile.

The prototype function is named for each section. When in doubt, the function wins.

---

## 0. Global sky (fixed layer, whole page)

- Background image: D/M `assets/backgrounds/universe-bg.jpg` (Prototype A: `constellation-bg.jpg`), covering a 1600x900 box scaled to cover the viewport. Parallax: `translateY(-sy * 0.05)`.
- Hero videos sit in the same box:
  - intro (`hero-b-intro.mp4`): opacity 1 → 0 over the first 75% of the hero scroll;
  - loop (`hero-b-loop.mp4`): same fade.
- Twinkling stars: 70 + 30 dots, two layers moving at `sy*0.22` and `sy*0.4` (wrap modulo viewport). Fade in from 30% → 100% of the hero height, to 0.85.
- Smoke (`smoke.webp`, `mix-blend-mode: screen`): two layers, 60s / 80s CSS drift, plus scroll drift `sy*0.12` and `sy*0.25`. Opacity 0.12 → 0.25.
- Dim layer `#03040A`: 0 → 0.32 as the hero leaves.
- Red host tint (radial red gradient): fades in during the 0.8 viewport before `#host`, fades out over the last viewport of `#host`.

## 1. Hero `#top` — `heroCards()`, CSS `.on` keyframes

**Layout:** wordmark ZAMBAARA centred (D 112px / M 44px, gold 300). Below it, gold rules plus the tagline **MASTER THE ELEMENTS**, then the subline **THE ULTIMATE ELEMENTAL CARD GAME · 2–8 PLAYERS** (mobile: no player count), then [PRE-BOOK NOW]. "SCROLL TO ENTER THE ARENA" sits at the bottom with a falling gold line. SKIP INTRO / REPLAY is top-right. Narration text is bottom-centre during the intro.

**Four tribe cards** (Lava, Rain, Wind, Mountain) float around the orb:
- Desktop rest positions on the 1600 canvas: (300,330,−14°), (490,300,−6°), (1110,300,6°), (1300,330,14°), at scale = hero scale.
- Mobile rest positions on the 390 canvas: (62,332,−14°), (118,274,−6°), (272,274,6°), (328,332,14°), at scale 0.46.
- Entrance (CSS, after `.on`): each card flies from the centre, scale 0.15 → 1, 1.5s, staggered 0.12s from 2.3s. Then a gentle 5s bob loop.

**Scroll timeline** (hh = hero height):

| Scroll | What happens |
|---|---|
| 0.03hh → 0.32hh | Cards flip to their backs (rotateY 0 → 180°, with a ±6° wobble). Glow fades. |
| 0.18hh → 0.50hh | Cards gather into a tight fan above centre. |
| 0.42hh → deck.top | Cards fly into the deck's stack position, arcing out and up, and scale to the deck card size. Staggered per card (+18px start, −10px end). |
| deck.top −24 → +4 | Cards fade out; the deck's own identical stack takes over (the hand-off is invisible). |

Hero copy fades out between 0.05hh and 0.6hh and drifts up (`sy * 0.3`). The nav turns solid after 0.6hh. On desktop the hero cards can be clicked to open card details. On mobile they are **not interactive** (they would block the swipe; see 06).

## 2. Game Cards `#deck` (3600px) — `deckCards(q)`

Eight cards share one centre (D: 800,500; M: canvas-scaled equivalent). All start as a face-down stack (each card offset 0.5px x / −0.9px y, alternating ±1.6°).

| q | Phase | Motion |
|---|---|---|
| 0 → 0.10 | Enter | Stack fades in (deck receives the hero cards) |
| 0.12 → 0.20 | Split | Riffle split: halves move ±240px, ±14° |
| 0.20 → ~0.33 | Riffle | Each card returns to a new stack order with a 80px hop; small "bounce" scale at 0.34–0.40 |
| 0.42 → ~0.60 | Draw / fan | Cards fan along a 1050px-radius arc (−30° … +30°), flipping face-up (`fs = 0.42 + i*0.013`, flip over the next 0.03–0.10) |
| 0.64 → ~0.80 | Reveal grid | Two rows of four: tribes at y 330, powers at y 638, column spacing 236, scale 0.86. Elemental glow fades in (0.62 → 0.80) |
| 0.86 → 0.97 | Close | Cards flip face-down and gather back into one stack; the transit overlay takes the stack to the mat (05) |

Headline cross-fades: SHUFFLE THE ELEMENTS (until 0.38–0.43) → DRAW YOUR HAND (0.40–0.65) → FOUR TRIBES · FOUR POWERS (from 0.62). Row labels THE TRIBES / THE POWERS and "✦ TAP ANY CARD TO REVEAL ITS DETAILS ✦" show at 0.76–0.92. A bottom-left HUD shows the phase name (THE DECK / SHUFFLE / DRAW / REVEAL) and a progress bar.

**Cards are clickable only while the grid is fully settled** (`dp > 0.98 && ex < 0.1`). Clicking opens the **Card Details modal**: the card flips in (rotateY 90 → 0, 0.8s), with info staggered in: kind · index/8, name, tagline, lore, and a table (CARD TYPE / GOES TO / RULES link). It has PREV / NEXT and close (✕, scrim click, Esc). Content per card is in `content.json → cards`.

## 3. How to Play `#howto` (5600px) — `howTo(q)`

**Backdrop:** the Host conjuring cards (`host-throw.webp`), feathered with a mask. It fades in, then dims as the mat zooms in.

**Header:** "04 · HOW TO PLAY" / **ENTER THE ARENA**, plus a rail of Roman numerals I–V that light up per step.

**The mat** (1600 x 800, `mat-bg.jpg`, gold frame, two orbit rings, centre line, ZAMBAARA wordmark) has five zones, left to right:

| Zone | Position (mat px) | Contents |
|---|---|---|
| Bracelet Chamber | circle 220, at (36,288) | the 4 generated bracelets drop in band by band |
| Attack Pile | 280x396 at (278,202) | gold plaques top (rotated) and bottom |
| Draw Deck | circle 400 at (600,198) | 5-card face-down stack (`back-hd.webp`) |
| Punish Pile | 280x396 at (1042,202) | plaques |
| Sand Clock | circle 220 at (1344,288) | hourglass sprite + seconds counter |

**Camera keyframes** `[q, focusX, focusY, scale, tilt°]`:

```
[0,800,400,.46,72] [.08,800,400,.6,50] [.12,800,400,.6,50]
[.16,150,400,1.02,40] [.25,150,400,1.02,40]          ← Bracelet Chamber
[.29,800,470,.86,44]  [.41,800,470,.86,44]           ← Draw Deck
[.45,418,400,1.0,40]  [.57,418,400,1.0,40]           ← Attack Pile
[.61,1182,400,1.0,40] [.73,1182,400,1.0,40]          ← Punish Pile
[.77,1454,400,1.08,38][.88,1454,400,1.08,38]         ← Sand Clock
[.93,800,400,.6,48]   [1,800,400,.6,48]              ← overview, all zones lit
```

Mobile uses the same keys with mat start scale 0.18 (`GEO.ms0`) and mat centre (800,440).

**Choreography:**

| q | Event |
|---|---|
| 0.14–0.27 | Bracelets slide in from the top-left with rotation; at 0.21–0.24 **Lava is chosen**: it scales up 28%, glows red, the others dim, and the plaque "LAVA CHOSEN" shows |
| 0.34–0.41 | Four cards deal from the Draw Deck into a hand along the bottom (Lava, Rain, Freeze, Lightning) |
| 0.46–0.53 | Lava card arcs onto the Attack Pile; orange flash at 0.52–0.54 |
| 0.62–0.71 | Freeze, then Lightning, arc onto the Punish Pile; gold flashes. **Only Freeze and Lightning go to the Punish Pile.** |
| 0.765–0.79 | Hourglass turns upright; 0.79–0.88 the sprite plays 24 frames and the counter runs 0 → 347s |
| 0.91–0.96 | All five zones glow (gold ring) |

Zone glow windows: `bump(.13,.17,.26,.29)`, `bump(.27,.31,.42,.45)`, `bump(.44,.48,.58,.61)`, `bump(.6,.64,.74,.77)`, `bump(.76,.8,.89,.92)`.

**Caption cards** (glass panel, bottom-centre), one at a time:

| Window | Number | Title | Text |
|---|---|---|---|
| 0–0.12 | — | Take your seat | The Zambaara mat has five zones. Scroll to play through a round with the Host. |
| 0.14–0.27 | I | Choose your tribe | Lava, Rain, Wind or Mountain. The four tribe bracelets wait in the Bracelet Chamber — claim yours. |
| 0.29–0.43 | II | Draw from the deck | The Draw Deck sits at the heart of the arena. Every hand begins here. |
| 0.46–0.59 | III | Attack | Play a tribe card onto the Attack Pile to strike your opponent. |
| 0.62–0.75 | IV | Punish | Only two powers belong on the Punish Pile — Freeze and Lightning. Play them to turn the fight against your rival. |
| 0.78–0.90 | V | Beat the Sand Clock | The sand clock turns and every battle is timed. The fastest Zampion claims the bracelet. |
| 0.93–1 | ✦ | You're ready | Watch the full tutorial, gather your tribe and take the table. [▶ TUTORIAL] [PRE-BOOK] |

**Sand clock sprite:** `sprites/hourglass-sprite.webp` is 2880 x 200 = 24 frames of 120 x 200. Set `background-position-x = -120 * frame`.

## 4. Beat the Host → Win the Bracelets `#host` (3800px) — `beatHost(q)`

Background turns red (global red tint).

| q | Event |
|---|---|
| 0 → 0.14 | Host portrait (`host-portrait.webp`, left-feathered mask) slides in from +160px, scale 1.12 → 1 |
| 0.06 → 0.54 | The 4 tribe cards orbit the Host's head in an ellipse (rx 360, ry 110, 600° over the section). They are split into a back layer and a front layer by `sin(θ)` so they pass behind and in front of him. Depth-scaled 0.72–1 |
| 0.06–0.18 in, 0.46–0.54 out | Copy block: "05 · BEAT THE HOST" / **BEAT THE HOST** / "Sit across the table from the Zambaara Host at our live events. Read his tells, out-draw his deck — and walk away a Zampion." / [FIND AN EVENT] [PRE-BOOK] |
| 0.50 → 0.62 | Host slides right and dims to 45%; orbit fades to 30% |
| 0.54 → 0.72 | **Bracelet ring** rises in: the real bracelets photo (`bracelets-stack-photo.webp`) in a 600px circle with a gold ring, a rotating dashed outer ring (`q*120°`) and a soft glow. Ring centre in canvas px: D (470,450), at the left of the stage with copy on the right; M (800,360), centred above the copy. These are `GEO.bcx/bcy`, used by the overlay to find the ring |
| 0.62–0.72 in, 0.82–0.90 out | Copy: "THE REWARD" / **WIN THE BRACELETS** / "One for every tribe — red Lava, blue Rain, opal Wind and onyx Mountain. Collect your tribe, or claim all four." Then tribe chips, plus the box "WIN AT BEAT THE HOST: Earth Bracelet · 10% off / Ice Bracelet · 20% off / A free game / Buy 2 at ₹850" |
| 0.84 → end | **Deal-and-flip** begins from the bracelet ring (05) |

## 5. Gallery `#chronicles` (3400px) — `gallery(q)`

Grid (desktop canvas): X0 120, Y0 160, column 328, gap 16, row height 226, 4 columns x 3 rows.

| Tile | Image | col,row,span |
|---|---|---|
| 1 | friends-table (TABLES OF LAUGHTER) | c1 r0, 2x2 |
| 2 | box-waterfall (THE BOX BY THE FALLS) | c0 r0, 1x1 |
| 3 | hand (A HAND WORTH PLAYING) | c0 r1, 1x2 |
| 4 | tree (IN THE WILD) | c3 r0, 1x2 |
| 5 | face (HIDE YOUR STRATEGY) | c3 r2, 1x1 |
| 6 | cave-cards (THE TRIBES COLLIDE) | c1 r2, 1x1 |
| video | gallery-film.mp4 (THE FILM ▸) | c2 r2 |

Mobile grid (390 canvas): X0 16, column 173, gap 12, rows at y 118/340/512/684 with heights 210/160/160/140. It has 5 photo tiles plus the film.

| q | Event |
|---|---|
| 0 | Tile 1 fills the whole screen (scale `S0 = max(W/w, H/h)*1.02`, inner image scale 1.15) under a big **GALLERY** title with eyebrow "06 · WITNESS THE ELEMENTS IN ACTION" |
| 0.06 → 0.20 | Title fades up and out |
| 0.10 → 0.40 | Tile 1 shrinks into its grid slot (camera zoom-out) |
| 0.26 + i·0.045 → 0.48 + i·0.045 | Other tiles slide in from the centre outward (80–160px), clip-path opening from the middle (`inset(50% 12%)` → 0), scale 0.92 → 1 |
| 0.36 → 0.50 | Header row: "06 GALLERY · MOMENTS FROM THE ARENA · TAP TO EXPAND" |
| 0.50 → 0.72 | Film tile rises and opens; the video autoplays muted while visible |
| 0.75 → 1 | Light parallax per tile |

Tap or click a tile to open the **lightbox**: image (max 70vh), caption · n/N, PREV/NEXT, close. On touch, the tap guard applies.

## 6. Voices `#voices` — `voicesV(q)`

Progress here is page-level: `q = (sy - top + vh) / (h + vh)`. Title "07 · VOICES OF THE ARENA" / **HEAR FROM THE ZAMPIONS**. Three tall 9:16 cards (D: 3 columns; M: stacked, 250px wide). Each card has a player photo with an inner parallax, a gold frame with a dark outer ring, and a quote plus name/event at the bottom.

- Cards rise in with stagger (`ss(.12+j*.06, .38+j*.06)`), at different parallax speeds (110 / −40 / 150).
- They drift up and tilt out at the end (0.72 → 0.98).

**Quotes and names are placeholders.** Replace them with real quotes from the review videos.

## 7. Battle Pack `#next` — `ctaV()`, see 07-product-and-checkout

Page-level progress as in Voices.

- Image block: clip reveal from the centre (`inset(50% 0)` → 0) at 0.04–0.30, rising 50px.
- Info column: fades and rises at 0.12–0.36.

## 8. Footer — `footV()`

Progress: `q = (sy + vh - top) / min(h, vh)`.

| q | Event |
|---|---|
| 0 → 0.6 | A 3000px planet-horizon arc rises 220px (gold rim light + glow) |
| 0.3 → 0.6 | A sun dot rises over the horizon |
| 0.25 + i·0.04 | Letters Z-A-M-B-A-A-R-A rise 90px, outlined (1px gold stroke) |
| 0.6 + i·0.03 → 0.85 + i·0.03 | Each letter **fills with gold from the bottom** (`background-image: linear-gradient(0deg, gold f%, transparent f%)` + `background-clip:text`) |
| 0.55 → 0.85 | The 4 element icons bob in. Then link columns, brand blurb and copyright fade in |
