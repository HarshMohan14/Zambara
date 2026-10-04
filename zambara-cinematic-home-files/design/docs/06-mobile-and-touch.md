# 06 — Mobile and touch (mobile is the main customer)

Reference: `reference/pages/mobile.dc.html`, designed at **390 x 844**.

## 1. Viewport and layout

- The prototype frame is a fixed 390 x 844 box (for the design canvas). **In production use the real viewport:** stages are `height: 100dvh` (fallback `100vh`), width `100vw`, with scale computed from the live size. Never hard-code 844.
- Use `env(safe-area-inset-*)`: pad the nav top and the footer bottom.
- No horizontal scroll: `overflow-x: clip` on `body` and on every stage.
- Breakpoint: `max-width: 860px` gets the mobile layout and geometry. Above that, the desktop layout.
- In production let the **window** scroll on mobile too. The prototype used an inner scroller only because it lives inside a design canvas; window scroll gives native momentum, the browser address-bar collapse and better performance. If you keep an inner scroller, overlays must be its siblings and must never catch touches (see 3).

## 2. What changes on mobile

| Area | Desktop | Mobile |
|---|---|---|
| Hero wordmark | 112px | 44px; subline without player count |
| Hero cards | clickable, around the orb | **not interactive** (pass-through), positions pulled inside the screen edges |
| Deck canvas | 1600x900 | 390x844; two rows of four smaller cards |
| How to Play mat | starts at scale .46 | starts at .18; captions in the centre band (380px wide) |
| Beat the Host | ring at left, copy at right | ring centred above the copy; copy blocks stacked |
| Gallery | 4-col grid, 6 tiles + film | 2-col grid, 5 tiles + film |
| Voices | 3 columns | stacked cards, 250px wide |
| Product | 2 columns (gallery, info) | 1 column; tiles labels 10px / .06em tracking; category tags 10px |
| Footer | brand + 3 columns | brand block spans full width, then 2 columns |
| Nav | full links | logo + PRE-BOOK |
| Progress spine | shown | hidden |
| Scroll smoothing | 0.11 | 0.2 (follows the thumb) |
| Deal-and-flip grid | ~10x6 | 4x6 (24 tiles) |

## 3. Touch rules (these fix the "stuck" and "opens by itself" problems)

1. **No interactive element may sit above the scrolling content** unless it is a modal. Fixed overlays always get `pointer-events: none`. The hero cards are pass-through on mobile because a swipe that started on them did not scroll the page, and lifting the thumb opened the card modal.
2. **Tap guard.** Modals (card details, gallery lightbox) open only on a deliberate tap:

```js
// pointer tracking (capture phase on window)
onPointerDown(e) { ptr = { x, y, t: now, moved: false, raw: scrollY,
                   wasMoving: now - lastMove < 140 || |scrollY - smoothedY| > 8 }; }
onPointerMove(e) { if (dist(e, ptr) > 10) ptr.moved = true; }
onPointerUp()    { ptr.up = now; }
onPointerCancel(){ ptr.moved = true; ptr.up = now; }     // browser took over for scrolling
tapOK() {        // call at the top of every "open modal" handler
  if (!ptr || now - ptr.up > 900) return true;           // keyboard / programmatic click
  return !ptr.moved && (ptr.up - ptr.t) < 550 && !ptr.wasMoving && |scrollY - ptr.raw| < 6;
}
```

   So a swipe, a resting thumb (long press), or a tap during momentum scroll never opens anything. A quick still tap does. Keyboard activation (Enter/Space) always works.
3. **Hover only for hover devices.** Wrap all `:hover` rules in `@media (hover:hover)`, so tapped cards and buttons don't stay lifted.
4. **Product zoom is mouse-only.** Ignore `mousemove` when the last pointer type was not `mouse`, and reset zoom on any touch.
5. `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` on buttons and links. Minimum target 44 x 44px.
6. Modals:
   - lock background scroll while open (`overflow:hidden` on `html`, preserve the scroll position);
   - close on ✕, scrim tap and Esc;
   - trap focus;
   - return focus to the card that opened the modal.

## 4. Mobile performance budget

- LCP element: the hero poster (`video/hero-b-poster.jpg`). Preload it. Start the intro video only after first paint.
- Videos: `muted playsinline preload="metadata"` (loop: `preload="auto"` only on Wi-Fi or when `navigator.connection.saveData` is false). Pause all off-screen video.
- Ship mobile image sizes: generate 1x/2x widths for cards (≈ 200/400px wide) and photos (≈ 800/1200px).
- Deal-and-flip uses one image for all tiles (24 `<img>` with the same `src`, decoded once). Keep it that way.
- Test on a mid-range Android (Chrome) and an iPhone (Safari). Target 60 fps on the pinned sections and Lighthouse mobile ≥ 85.

## 5. QA script for mobile (run on a real phone)

1. Swipe starting on each hero card: the page scrolls and no modal opens.
2. Fling through the deck: no modal opens. Stop, then tap a card: the modal opens. Long-press a card: nothing happens.
3. Same for gallery tiles.
4. Tap and drag on the product image: no zoom gets stuck.
5. Rotate the device: layout re-measures and nothing jumps.
6. iOS address bar collapse and expand: stages keep their height (`dvh`) and nothing shifts.
7. Reduced motion on: final states, no scrubbing.
