# 05 — Shared transitions (how each section hands off to the next)

The brief: **every section is connected by a shared animation.** One physical object (cards, the deck, the bracelet ring, a photo) carries the eye from one section into the next. All of these run in fixed overlay layers (03 §5) and are driven by `sy`.

Shared symbols:
- `vw, vh` = viewport size.
- `sec.top / sec.h / sec.sh` = measured section geometry.
- `S` = that section's canvas scale.
- `GEO` = per-device constants:

```js
// desktop
GEO = { cy: 50, k: 1,  matX: 1000, matY: 500, ms0: 0.46, bcx: 470, bcy: 450,
        ds:  (w,h) => Math.min(w/1600, h/900),            // deck canvas scale
        hsc: (w,h) => Math.min(w/1600, h/900),            // how-to canvas scale
        bsc: (w,h) => Math.max(Math.min(w/1600, h/900), 0.4) }  // host canvas scale
// mobile
GEO = { cy: 8,  k: 0.5, matX: 800, matY: 440, ms0: 0.18, bcx: 800, bcy: 360,
        ds:  (w,h) => Math.min(w/390, h/844),
        hsc: (w,h) => h/900,
        bsc: (w,h) => h/900 }
```

---

## T1. Hero → Deck: "the four tribes become the deck"  (`heroCards`)

Covered in 04 §1. The key to an invisible hand-off: the hero cards finish **exactly** where the deck's stack sits (`x = vw/2 + i*0.5`, `y = deckTopOnScreen + deck.sh/2 + 50*S - i*0.9`, rotation ±1.6°, scale = deck card scale, face-down). They then cross-fade (24px window) into the deck's own stack, which has the same pose.

## T2. Deck → How to Play: "the deck is carried to the mat"  (`transit`)

Active from `dEnd - 20` to `how.top + 0.1*(how.h - how.sh)`, where `dEnd = deck.top + deck.h - deck.sh` (the moment the deck unpins).

```js
x0 = vw/2;                               y0 = min(0, dEnd - sy) + deck.sh/2 + GEO.cy*ds   // deck stack on screen
x1 = vw/2 + (GEO.matX - 800)*hsc;        y1 = max(0, how.top - sy) + how.sh/2 + (GEO.matY - 450)*hsc  // mat Draw Deck
t  = sst(dEnd, how.top, sy)
for card i in 0..7:
  e  = smoothstep(clamp(t*1.15 - i*0.02))                  // slight stagger
  x  = lerp(x0 + i*.5, x1 + i*.4, e) + sin(πe)*(i-3.5)*14  // fans out mid-flight
  y  = lerp(y0 - i*.9, y1 - i*1.2*hsc, e) - sin(πe)*90*ds  // arcs upward
  rotateX = 72 * e^1.4                                     // tilts to lie flat on the tilted mat
  scale   = lerp(ds*GEO.k, 150*GEO.ms0*hsc/190, e)          // shrinks to the mat's card size
  opacity = fadeIn(dEnd-6 → dEnd) * fadeOut(how 4.5% → 7.5%)
```

Card face: `cards/back.webp`. Transform order: `translate3d(x,y,0) perspective(900px) rotateX() rotate() scale()`. The deck's own cards fade out at the same moment (`deckOut`), and the mat's Draw Deck stack is already there underneath.

## T3. How to Play → Beat the Host: "the Host steps forward"

No overlay. The How-to backdrop is the same Host character (`host-throw.webp`). As How-to ends, the red tint fades in (0.8 viewport before `#host`) and the Host portrait slides in from the right, while the tribe cards from the mat begin orbiting him.

## T4. Win the Bracelets → Gallery: "deal and flip"  (`mosaicV`)

The bracelet ring bursts into a wall of Zambaara card backs. The cards flip over one by one and their faces form the first gallery photo, which then simply *is* the gallery.

**Windows** (span = host.h − host.sh, hEnd = host.top + span, P = host.sh, gspan = gal.h − gal.sh):

```
A0 = hEnd - 0.16*span   A1 = hEnd - 0.015*span   // DEAL   (host still pinned)
B0 = hEnd + 0.06*P      B1 = gal.top - 0.08*P    // FLIP   (host scrolls away beneath)
FE = B1 - 0.14*P                                 // flips finish here, then gaps close
C0 = gal.top + 0.004*gspan   C1 = gal.top + 0.05*gspan   // HAND-OFF fade (gallery pinned at q≈0)
```

**Grid:** `cols = clamp(round(vw/140), 4, 12)`, `rows = clamp(round(vh/140), 6, 8)` (mobile 4 x 6 = 24 tiles; 1440 x 900 gives 10 x 6 = 60). Tile size = `vw/cols x vh/rows`.

**Origin:** the bracelet ring centre on screen: `cx = vw/2 + (GEO.bcx-800)*bsc`, `cy = host.sh/2 + (GEO.bcy-450)*bsc`.

**Per tile** (`dn` = distance from origin normalised 0..1, `rnd` = deterministic pseudo-random `((c*73 + r*151 + 17) % 97)/97`):

```js
// DEAL — fly out from the ring, nearest tiles first
da = A0 + (A1-A0)*0.6*(0.7*dn + 0.3*rnd);   e = sst(da, da + (A1-A0)*0.4, sy)
x  = (cx - tileCentreX)*(1-e);   y = (cy - tileCentreY)*(1-e) - sin(πe)*50
rotate = (rnd-.5)*80*(1-e);      scale = lerp(0.16, 1, e);   opacity = min(1, e*5)

// FLIP — wave outward from the ring
fs = B0 + (FE-B0)*0.58*(0.75*dn + 0.25*rnd);   ft = sst(fs, fs + (FE-B0)*0.42, sy)
rotateY = 180*ft;  scale *= 1 + 0.07*sin(π ft);  rotate += (rnd-.5)*6*sin(π ft)

// CLOSE — gaps shrink to zero so the photo is seamless
close = sst(FE, B1, sy);  scale *= 1 - 0.07*(1-close);  corner radius 6 → 0;  gold edge fades
```

**Tile markup:** a 3D flip card. The front is the card back (`cards/back.webp`, cover, 1px gold edge). The back face is a window onto **one big image** (`gallery/friends-table.webp`) placed so that all tiles together form the gallery's opening frame:

```js
// the gallery's tile 1 at q=0 → the same box on screen
GB  = desktop { SW:1600, SH:900, rw:672, rh:468, yo:15 }  |  mobile { SW:390, SH:844, rw:358, rh:210, yo:7.5 }
gsc = min(gal.sw/GB.SW, gal.sh/GB.SH)
S0  = max(GB.SW/GB.rw, GB.SH/GB.rh) * 1.02 * 1.15
BW  = GB.rw*S0*gsc;  BH = GB.rh*S0*gsc;  BX = vw/2 - BW/2;  BY = vh/2 + GB.yo*gsc - BH/2
// inside each tile: <img style="position:absolute; left:BX-tileLeft; top:BY-tileTop; width:BW; height:BH; object-fit:cover">
```

Other layers:
- a dark backdrop `#05060B` behind the tiles fades to 0.92 during the second half of the deal, which hides the host/gallery swap through the gaps;
- a warm radial flash at the ring (`mix-blend-mode: screen`) pulses with the deal.

At `C0 → C1` the overlay fades out over the gallery, which shows the identical image, so there is no jump. If you change the gallery's first tile, its span or its zoom, update `GB` too.

## T5. Gallery → Voices: "the photos become portraits"

Gallery tiles parallax upward as the pin releases. The Voices cards rise in from below with a slight tilt, using players photographed in the same places (pouch, reader, box). There is no overlay. The continuity comes from motion direction and matching photography.

## T6. Voices → Battle Pack: "into the box"

The Voices cards drift up and tilt out (0.72 → 0.98). The product image opens from a horizontal slit (`clip-path: inset(50% 0)` → `inset(0)`) while rising 50px. The product thumbnails reuse gallery photos (fan table, bracelets, cave cards, waterfall box), so the gallery's imagery becomes the product's.

## T7. Battle Pack → Footer: "the horizon"

The footer's planet horizon rises into view under the product section. A sun dot crests it and the ZAMBAARA letters rise and fill with gold. The four element icons close the story.

## Reduced motion

With `prefers-reduced-motion: reduce`:
- skip T1, T2 and T4 overlays entirely;
- show each section's end state;
- use a 300 ms opacity fade between sections.
