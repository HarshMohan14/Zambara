# 03 — The scroll engine (read this first)

The whole site is driven by **one animation loop** that turns scroll position into numbers, and **pure functions** that turn those numbers into positions, scales, rotations and opacities. A framework-free copy is in `../starter/scroll-engine.js`. The prototype version is the `Component` class at the bottom of every `reference/pages/*.dc.html`.

## 1. The loop

```js
// every animation frame
raw = window.scrollY;                       // mobile prototype: scroller.scrollTop
k   = 1 - Math.pow(1 - F, dt / 16.67);      // frame-rate independent smoothing
cur = |raw - cur| < 0.3 ? raw : cur + (raw - cur) * k;
render(cur);                                // only if cur changed by > 0.25px
```

- `F = 0.11` on desktop (silky, slightly trailing) and `F = 0.2` on mobile (follows the thumb closely).
- `cur` (smoothed scroll, "sy" in the code) is the **only** input to every scroll animation. The page itself scrolls natively; only the animated values are smoothed. Do **not** hijack scrolling or use a fake scroll container on desktop.
- Track the last time `raw` changed (`lastMove`). The tap guard uses it (06-mobile-and-touch).

## 2. Layout measurement

On mount, on resize and again 300 ms and 1500 ms later (after fonts and images settle), measure every section:

```js
L.deck = { top, h, sh, sw }   // top = offset from page top; h = outer height;
                              // sh/sw = sticky stage height/width (= viewport)
L.vh, L.fw                    // viewport height/width
```

Measure with `getBoundingClientRect().top - root.getBoundingClientRect().top`. Never measure in the frame loop.

## 3. Pinned sections and progress

```html
<section id="deck" style="height:3600px; position:relative">
  <div class="stage" style="position:sticky; top:0; height:100vh; overflow:hidden">
    <div class="canvas" style="width:1600px; height:900px; transform: translate(-50%,-50%) scale(S)">…</div>
  </div>
</section>
```

```js
q = clamp((sy - sec.top) / (sec.h - sec.sh), 0, 1);   // 0 at pin start, 1 at pin end
```

Each section function takes `q` and returns a plain object of styles (`deckCards(q)`, `howTo(q)`, `beatHost(q)`, `gallery(q)`).

**Design canvas scaling.** Everything inside a stage is laid out on a fixed design canvas and scaled to fit:

- Desktop canvas: **1600 x 900**, `S = min(vw/1600, vh/900)`, centred.
- Mobile canvas: **390 x 844**, `S = min(vw/390, vh/844)` (deck, gallery).
- Mobile reuses the 1600 x 900 canvas for How to Play, Beat the Host and Win the Bracelets, scaled by `vh/900`. The centre 390 px of that canvas is what's visible, and mobile copy is placed in that centre band (x 606–994).

So all coordinates in the docs and code are **design-canvas pixels**, not screen pixels.

## 4. The two helpers everything uses

```js
const clamp = (x) => Math.min(1, Math.max(0, x));
// smoothstep of q between marks a and b → 0..1
const ss  = (a, b) => { const x = clamp((q - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
// for page-level (non-pinned) timings: same smoothstep, with explicit x
const sst = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
```

A timeline is just a list of `ss(start, end)` windows. For example, in the deck: `sp = ss(0.12, 0.2)` (split), `fin = ss(0.62, 0.8)` (reveal glow). Positions are chained with `mix(p, target, t)`, so later stages override earlier ones.

**Camera keyframes** (How to Play): an array of `[q, focusX, focusY, scale, tiltDeg]`. Find the segment around `q`, smoothstep inside it and lerp each value. The mat is then transformed with `rotateX(tilt) scale(s) translate(800-fx, 400-fy)`. See 04-sections.

## 5. Overlays for cross-section transitions

Objects that travel **between** sections (hero cards → deck, deck → mat, bracelet ring → gallery mosaic) live in **fixed full-viewport overlay layers** (`position: fixed; inset: 0; pointer-events: none`). They compute their screen position from:

- the section's measured `top`, and
- the current `sy`.

For example, the deck centre on screen is `(dk.top - sy) + dk.sh/2 + 50*S` until pinned. Each overlay only renders inside its scroll window (`display:none` otherwise), so it costs nothing elsewhere. Formulas are in 05-shared-transitions.

## 6. Performance rules (keep these)

- Only recompute a section's styles when it is near the viewport (`sy` within its range ± 1.2 viewports). Otherwise reuse the last result.
- Bind results to `transform`, `opacity` and, sparingly, `clip-path`. Add `will-change: transform` only to elements that actually move.
- Round values (`toFixed(1)` for px, `toFixed(3)` for opacity) to avoid needless style writes.
- In React: keep `sy` in a ref plus a tiny store, and update DOM styles directly (or with `useSyncExternalStore` per section) so the whole tree does not re-render each frame. Alternatively, set CSS custom properties (`--q`) on each stage and do the math in JS once per frame.
- Pause videos that are off-screen. The gallery film plays only while its tile is visible and `q > 0.6`.
- Never use `background` shorthand on an element whose `background-clip: text` must survive updates. Use `background-image` (the footer letters bug).

## 7. Hero intro (time-based, not scroll-based)

1. The intro video plays muted and inline on load. Narration lines are timed to the video:
   - 0.3–1.15s "FROM STONE…"
   - 1.4–3.9s "…FIRE IS BORN"
   - 4.15–5.5s "RAIN TAMES THE FLAME"
   - 5.75–7.1s "WIND BINDS THEM AS ONE"
2. At 8.3s (`TITLE_AT`) the root gets class `.on`. CSS keyframes then run:
   - letterbox bars slide away (1.6s)
   - ZAMBAARA letters rise from blur, staggered 0.09s
   - a light sweep crosses the wordmark at 1.7s
   - the tagline tracking tightens
   - gold rules grow
   - CTA, nav and scroll cue fade up at 1.9s, 2.3s and 2.9s
3. When the video ends, the loop video plays forever behind the hero. SKIP INTRO jumps to the end. REPLAY appears at the top of the page after the intro.
4. If autoplay is blocked, or the user prefers reduced motion, call `finish()` immediately.

## 8. Where to look in the prototype

| Concept | Function / field in the page script |
|---|---|
| loop + smoothing | `this.tick` |
| measuring | `layout()` |
| progress | `prog(section, sy)` |
| per-section timelines | `deckCards`, `howTo`, `beatHost`, `gallery`, `voicesV`, `ctaV`, `footV` |
| overlays | `heroCards`, `transit`, `mosaicV` |
| per-device geometry | `this.GEO` |
| tap guard | `tapOK`, `onPD/onPM/onPU/onPC` |
| template binding | `renderVals()` returns everything the HTML uses |
