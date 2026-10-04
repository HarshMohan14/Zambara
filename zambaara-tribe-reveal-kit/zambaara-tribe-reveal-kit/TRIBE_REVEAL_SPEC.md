# Tribe Reveal — Mobile (with player search) · Design spec

**Scope: design and UI only.** Keep all existing logic exactly as it is:
- the registered-player search and data source;
- the reveal API that assigns the tribe;
- registration and the database;
- sounds;
- the thumb-scanner step, if you keep it.

This spec describes what the page looks like and how it animates, and the small set of props the UI needs from your logic.

The reference prototype is `reference/pages/tribe-reveal-mobile.dc.html`. Run it with `npx serve .` and open `/reference/`. Screens for every state are in `screens/`. **The prototype's script is the source of truth for every number below.**

---

## 1. Flow

```
[A] SEARCH ──tap a player──► [B] CONFIRM ("Is this you?") ──hold sigil 1.6s──► [C] REVEAL animation (≈6.2s) ──► [D] RESULT
     ▲                         │  "Not you? Search again"                          │ API still busy → keep orbiting
     │                         └─────────────── back ◄─────────────────────────────┘ API error → back to [B] + toast
     └──────────────── "NEXT ZAMPION" (clears the search, focuses the field) ◄──── [D]
A player who is already revealed → straight to [D] in "already revealed" mode (no burst/flash; REPLAY plays [C]).
```

## 2. Assets (all in `assets/`)

Copy them to `public/tribe-reveal/` and keep the same sub-folders. If the cinematic home branch is merged, the same files already exist under `public/cinematic/`.

| File | Used for |
|---|---|
| `cards/reveal/reveal-{lava,rain,wind,mountain}.webp` (≈634x840) | Front of the chosen card |
| `cards/back.webp` (480x702) | Back of the 4 orbiting cards (shown 230px wide inside a 254px card box, centred) |
| `bracelets/bracelet-{tribe}.webp` (544x344, transparent) | Result screen |
| `icons/{tribe}.png` (160x160) | Ring icons and the sigil for revealed players in the list |
| `brand/logo.png` | Header and the hold sigil |
| `backgrounds/universe-bg.jpg` | Background |
| `backgrounds/smoke.webp` | Smoke overlay (screen blend) |
| `fonts/Cinzel.ttf`, `fonts/Saira.ttf` | Or load from Google Fonts: `Cinzel:wght@500;700;900` and `Saira:wght@300;400;500;600` |

## 3. Tokens

| Token | Value |
|---|---|
| bg | `#04050A` |
| gold-500 / 300 / 200 | `#C9A063` / `#E8C989` / `#F3D594` |
| text / body / muted / subtle | `#EDE6DA` / `#D9CFC0` / `#A89A86` / `#8F8372` |
| error | text `#F2B8AE`, border `rgba(224,90,70,.5)`, bg `rgba(60,14,10,.5)` |
| radius | pill 999px · row 14px · card 14px · button 6px |
| display font | Cinzel 700/900, uppercase, letter-spacing .08–.12em |
| body font | Saira 400–600; labels uppercase .14–.36em |

**Tribes** (API values are `lava | rain | wind | mountain`):

| Tribe | Glow `c` | Text `fg` | Background tint | Traits line |
|---|---|---|---|---|
| LAVA | `rgba(224,65,47,.9)` | `#F59A6E` | `rgba(170,40,20,.6)` | FIERCE · RELENTLESS · UNSTOPPABLE |
| RAIN | `rgba(47,143,216,.9)` | `#8EC3EC` | `rgba(20,80,170,.6)` | CALM · CLEVER · UNSHAKEN |
| WIND | `rgba(230,235,245,.85)` | `#EDEDED` | `rgba(140,150,180,.5)` | FAST · FEARLESS · UNBOUND |
| MOUNTAIN | `rgba(190,180,170,.8)` | `#C9BFB4` | `rgba(110,100,90,.55)` | STRONG · STEADY · UNBREAKABLE |

Result line: "Your {Tribe} bracelet waits for you in the arena." The tribe name is in title case.

## 4. Layout system

- **Root:** `position: relative; height: 100dvh` (fallback `100vh`); `overflow: hidden`; background `#04050A`.
- **Background stack** (absolute, full screen, pointer-events none, in this order):
  1. `universe-bg.jpg` cover, `inset: -4%`, `transform: scale(bgS)`, brightness 0.7 on search and 0.85 on the stage. `bgS` = 1.04 → 1.08 over the first 3s of the reveal.
  2. `smoke.webp` cover, `mix-blend-mode: screen`, opacity .14.
  3. 46 twinkling stars, 2px, `#FFF5DE`, opacity .15 ↔ 1 over 3s alternate, random positions with a fixed seed.
  4. Tribe tint: `radial-gradient(circle at 50% 38%, tint, transparent 58%)`, opacity animated (§7).
  5. Vignette: `radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,.78) 100%)`.
  6. Flash: `#FFF3D6` full screen, opacity animated, z above the stage.
- **Header** (all screens): 56px plus safe-area top; gradient `rgba(4,5,10,.95)` → transparent. Left: logo 28px + "ZAMBAARA" (Cinzel 700 15px, .22em, gold-300). Right: event chip (10px, .16em, gold-500, 1px gold border at 40%, pill, max-width 46vw, ellipsis).
- **Search screen:** native scrolling layout. Column max-width 480px, centred, 16px side padding, top padding 70px.
- **Stage screens (confirm / reveal / result):** a **390 x 844 design canvas** centred and scaled by `min(vw/390, vh/844)`. All stage coordinates below are canvas px. The "‹ SEARCH" back button stays in screen space (left 12, top 64, 44px tall pill).

## 5. Screen A — Search

Top to bottom:

1. **Intro:**
   - "THE ELEMENTS ARE WAITING" (11px, .38em, gold-500);
   - **SUMMON / YOUR TRIBE** (Cinzel 700 32px/1.05, .1em, gold-200, text-shadow `0 0 40px rgba(232,190,110,.35)`);
   - "Find your name, then hold the sigil to reveal your tribe." (14px, muted).
2. **Sticky search bar.** It sticks to the top of the scroll area, with a background fade from `#04050A` (70%) to transparent.
   - **Field:** 56px tall, pill, 1px border `rgba(201,160,99,.55)`, bg `rgba(10,8,6,.88)`, shadow `0 10px 30px rgba(0,0,0,.5)`. Focus: border gold-300 plus a 3px ring at `rgba(201,160,99,.25)`.
   - **Magnifier:** CSS-drawn, gold-500.
   - **Input:** Saira 500 17px, gold-200; placeholder "Search name or last 4 digits" in subtle. Attributes: `type=search`, `enterkeyhint=search`, `autocomplete=off`, `autocapitalize=words`.
   - **Clear (✕):** a 44px round button, shown only when there is text.
3. **Filter chips** (tablist): `ALL · n`, `TO REVEAL · n`, `REVEALED · n`. 38px tall, pill, 12px, .1em. Selected chip is filled gold with near-black text. The chips stretch to share the row and scroll sideways if needed.
4. **Count line** (11px, .18em, subtle, `aria-live=polite`): left "14 REGISTERED", or "3 MATCHES" while searching; right "6 REVEALED".
5. **Player rows** (role=list; each row is a `<button>`, min-height 72px, 10px gap):
   - **Container:** 14px radius, 1px border (gold at 32% for to-reveal, 18% for revealed), bg `linear-gradient(135deg, rgba(16,12,9,.92), rgba(10,8,6,.78))`. Pressed: `scale(.985)`. Hover border at 60% on hover devices only.
   - **Sigil (46px circle):**
     - to-reveal: initials in Cinzel 18px gold-300 on a dark radial background, with a 1.5px gold ring;
     - revealed: the tribe icon (30px) with a ring and glow in the tribe colour.
   - **Name:** Saira 500 17px, one line, ellipsis. **The matched part of the query is highlighted** in `#FFE7A8` with a soft gold glow (a `<mark>` with no background).
   - **Masked mobile:** `•••••• 4821` (last 4 only; 12px, .12em, subtle). Never show the full number.
   - **Status chip** (11px 600, .16em):
     - to-reveal: **REVEAL**, filled gold;
     - revealed: the tribe name in its `fg` colour, with a border in the tribe glow at 60%.
   - Accessible name: "{Name}, ready to reveal" or "{Name}, revealed: {TRIBE}".
6. **States:**
   - **Loading:** 4 skeleton rows (72px, shimmer 1.4s, fading opacity 1 → .4).
   - **No results:** dashed card with "No Zampion found" (Cinzel 20px gold-300), then "Nothing matches “{query}”. Check the spelling or search by the last 4 digits of your mobile number.", then "Not registered yet? Ask at the registration desk.", then [CLEAR SEARCH].
   - **Load error:** red card with "The elements are restless", then "We couldn’t load the player list. Check the connection and try again.", then [TRY AGAIN].

Search UI behaviour. The matching itself is your logic; these are the UI expectations:
- match the name case-insensitively anywhere in it, or 3+ digits against the mobile number;
- list results alphabetically;
- if your search is server-side, debounce by about 150ms and keep the previous results visible while loading (no flashing skeletons on every keystroke);
- pressing Enter with exactly one result opens that player.

## 6. Screen B — Confirm ("Is this you?")

| Element | Canvas spec |
|---|---|
| Eyebrow "IS THIS YOU?" | top 100, centred, 11px .36em gold-500 |
| Name plate | below the eyebrow (10px gap). Box padding 10/22, radius 10, border `rgba(232,201,137,.55)`, gradient gold at 18–22%. Name: Cinzel 700 24px .08em gold-200, single line, max-width 330, ellipsis. Masked mobile below (12px .16em muted) |
| Ring | centre (195, 370), 300px diameter. Outer solid 1px gold at 40% (spins 40s, with gold dots at top and bottom). Inner dashed ring inset 34px (spins 26s in reverse). 4 tribe icons, 40px, at 12 / 3 / 6 / 9 o'clock: Lava, Rain, Wind, Mountain |
| Hold sigil | 170px circle at left 110, top 285 (centre 195, 370). Fill `radial-gradient(circle at 50% 40%, #1A140C, #07060A 70%)`, ring `0 0 0 2px rgba(201,160,99,.5)`, glow `0 0 60px rgba(232,190,110,.25)`, inner shadow. Logo 74px in the centre |
| Progress ring | 12px outside the sigil: `conic-gradient(#E8C989 {360·p}deg, rgba(201,160,99,.12) 0)` masked to a thin ring |
| Pill | top 556, centred: "HOLD TO REVEAL" (13px 600 .3em gold-300) over "YOUR TRIBE" (10px .26em muted). While holding the label reads "CHANNELLING…". The pill pulses a gold glow every 2.4s |
| Hint | top 628: "Press and hold the sigil for two breaths." (14px, subtle) |
| Link | top 676: "NOT YOU? SEARCH AGAIN" (13px .14em, underlined, one line) → back to A |

**Hold interaction:**
- Duration 1600ms; `p` goes 0 → 1.
- Driven by pointerdown on the sigil. pointerup, pointerleave and pointercancel reset `p` to 0.
- Keyboard: Space or Enter keydown starts, keyup cancels.
- While holding:
  - the logo scales `1 + .12p`;
  - the logo drop-shadow grows `10 + 30p` px;
  - the ring scales `1 + .04p`;
  - the tribe tint opacity is `.3p`. Use a neutral warm tint until the tribe is known.
- Block the context menu, text selection and the iOS long-press callout on the sigil (`touch-action: none`, `user-select: none`, `-webkit-touch-callout: none`).
- Optional haptics: `navigator.vibrate(15)` on start and `40` on completion.
- **Hook for your logic:** call your reveal function when `p` reaches 1. Your existing hold sound (start / update(p) / stop) maps directly to these moments.

## 7. Screen C — Reveal timeline (t = seconds since the hold completed)

Helpers:
- `ss(a,b)` = smoothstep of t between a and b.
- `L(a,b,k)` = linear interpolation.
- Card box 254x336 (the back image is 230 wide and centred). Orbit centre `CX=195, CY=250`.

**Orbit angle** (degrees, accelerating then easing):

```js
ang(u) = 140·min(u,2.4)² + (u>2.4 ? 672·(u−2.4) − 120·(u−2.4)² : 0)
```

Card `i` (0 Lava, 1 Rain, 2 Wind, 3 Mountain) sits at angle `ang(min(t,3)) + wait·528 + i·90`. `wait` is the extra seconds spent waiting for the API (below).

| t (s) | What happens | Values |
|---|---|---|
| 0 → 0.35 | Flash | full-screen flash peak .55 (`.55·sin(π·ss(0,.35))`) |
| 0 → 0.5 | Confirm UI leaves | the stage switches to reveal mode; the ring drops to 25% opacity over 0.1–0.8 and grows `1 + .25·ss(0,1)` |
| 0.2 → 0.9 | Cards emerge | `emerge = ss(.2,.9)`. Radius `L(0,140,emerge)·(1+.1·sin(6t))`. Position `x = CX+cos(a)·rad`, `y = CY+70+sin(a)·rad·.42`. Scale `L(.16,.4,emerge)·(.85+.15·sin a)`. Rotation `cos(a)·14°`. z-index from `sin a` (front cards on top) |
| 0 → 3.0 | Orbit | cards face-down, spinning faster then easing |
| **3.0 → 3.7** | **Pick** | Chosen card: to centre (195,250), lifts in an arc `−50·sin(π·pick)`, scale → .62, rotation → 0, z on top. Other cards: fly outward ×3.2 from centre and 120px down, fading out, scale ×(1 − .3·pick) |
| 3.6 → 4.6 | Tribe tint | tint opacity `ss(3.6,4.6)` |
| 3.7 → 4.4 | **Flip** | chosen card rotateY 180° → 0° (perspective 1300px); drop-shadow glow in the tribe colour grows to 60px |
| 4.05 → 4.45 | Second flash | peak .55 |
| 4.15 → 5.15 | Shockwave | ring centred (195,250), 2px border in the tribe glow, diameter 160 → 680px, opacity .9 → 0 |
| 4.2 → 5.4 | Particle burst | 18 dots (4/6/8px, tribe colour with 12px glow), evenly spaced angles, distance `50 + 190·easeOutCubic(u)`, fading |
| 4.4 → 5.2 | Ring | fades a further 25% |
| 4.6 → 5.1 | Name plaque | gold bar under the card (left/right 6%, height 50, `linear-gradient(90deg,#A97A34,#F3D594,#A97A34)`) with the player name (Cinzel 700 22px .1em, `#1A1208`), rising 14px |
| 4.8 → 6.2 | Result text | see §8 (staggered) |
| 6.2 | Done | state = result |

**Waiting for the API.** Fire the reveal request at t = 0.
- If it hasn't answered by **t = 2.9**: freeze t at 2.9, keep the cards orbiting at 528°/s (add to `wait`), and show "CONSULTING THE ELEMENTS…" (12px .32em gold-500, centred at canvas y 560).
- When it answers: continue from 2.9. The pick uses the tribe the API returned.
- **On error:** at about 2.6s fade back to Confirm (p = 0) and show a toast for about 3.8s: "The elements are restless — the reveal didn’t go through. Hold the sigil to try again." The toast is red, bottom-centred, 340px max, and slides up 12px.

## 8. Screen D — Result

All inside the canvas, centred, left/right 18px, starting at top 408 (the card and plaque sit above).

| t | Element | Spec |
|---|---|---|
| 4.8–5.3 | Eyebrow | "THE ELEMENTS HAVE SPOKEN" (or "YOUR TRIBE" when already revealed), 11px .34em, tribe `fg`, rising 16px |
| 4.95–5.5 | Title | "WELCOME," line break, then the NAME in caps. Cinzel 900 26px/1.12, .08em, gold-200, text-shadow `0 0 40px glow`, rising 20px |
| 5.2–5.7 | Traits + line | traits 12px .22em tribe `fg`; then the result line (14px/1.5 body, max 320px) |
| 5.35–6.0 | Bracelet | 150px wide, rises 40px, scale .8 → 1, drop-shadow 20px in the tribe glow |
| 5.7–6.2 | Buttons | **NEXT ZAMPION** (filled gold, flex 1, max 200px, 50px tall), then **REPLAY** (outline) |
| — | Already revealed | small note under the buttons: "Revealed today · 11:13" (12px, subtle), formatted from your `revealedAt` |

- **NEXT ZAMPION:** back to Search, clear the query, focus the input. This is the kiosk loop.
- **REPLAY:** replays §7 from t = 0, using the known tribe and no API call.
- **Already-revealed players** open directly at t = 6.2 with no flash, burst or shockwave.
- **Kiosk suggestion:** if nothing is touched for 45s on the result screen, auto-return to Search.

## 9. UI contract (props your logic provides)

```ts
type Tribe = 'lava' | 'rain' | 'wind' | 'mountain'
interface Player { id: string; name: string; mobile: string; tribe: Tribe | null; revealedAt?: string | Date }

interface TribeRevealMobileProps {
  eventName: string                      // e.g. "ZAMBAARA TOURNAMENT"
  players: Player[]                      // full list OR your search results
  loading?: boolean                      // show skeletons
  error?: string | null                  // show the load-error card
  onRetry?: () => void
  query: string                          // controlled search box (your search logic)
  onQueryChange: (q: string) => void
  onReveal: (player: Player) => Promise<{ tribe: Tribe }>   // your existing reveal API call
  onRevealSound?: { start(): void; update(p: number): void; stop(): void; burst(t: Tribe): void } // optional, existing synth
}
```

- The UI computes the counts, filter-chip lists, highlighting and masking from `players` and `query`.
- If you pass server results, pass the counts too, or the chips show counts for the current results only.
- After `onReveal` resolves, update that player's `tribe` in your list, so the list shows it when you return.

## 10. Accessibility

- Search input has a label (visually hidden "Search registered players").
- Filter chips: `role=tablist` / `aria-selected`.
- Rows are buttons with full accessible names.
- Hold sigil: `aria-label="Press and hold to reveal your tribe"`, and it works with Space/Enter.
- Result block is `role=status`. Toasts and errors are `role=alert`.
- `prefers-reduced-motion`:
  - skip the orbit and particles;
  - cross-fade card back → tribe card over 400ms;
  - stop the spinning rings, stars and shimmer.
- 44px minimum touch targets. Never show a full mobile number.

## 11. Performance

- Animate with one `requestAnimationFrame` loop. Use only transform, opacity and filter.
- Preload the 4 reveal cards, the card back and the 4 bracelets when the Confirm screen opens, so the flip never shows a blank card.
- The background image is about 200 KB. Serve WebP/AVIF at 1x/2x if your pipeline supports it.
- Keep the stage at 60fps on a mid-range Android phone: cards 4, particles 18, no blur filters except the card drop-shadow.

## 12. Don't change

- How tribes are assigned (server-side, balanced).
- How players are registered or stored.
- Admin pages.
- The existing thumb-scanner flow. If you keep the scanner step, place it **inside the hold sigil circle** and make "scan complete" start §7 instead of the 1.6s hold.

## 13. QA against `screens/`

| # | Screen file | Check |
|---|---|---|
| 1 | 01-search | header, intro, sticky bar, chips with counts, rows with masked numbers |
| 2 | 02-query | highlight on the matched letters, "1 MATCH" |
| 3 | 03-digits | search by the last 4 digits finds the player |
| 4 | 04-confirm | name plate, ring, sigil, pill, hint, "Not you?" link |
| 5 | 05-holding | progress ring about 50%, "CHANNELLING…", logo glow |
| 6–8 | 06-orbit · 07-pick · 08-flip | orbit, pick, flip, plaque and tribe tint |
| 9 | 09-done | eyebrow, WELCOME, traits, line, bracelet, buttons |
| 10 | 10-already | "YOUR TRIBE" eyebrow, timestamp, no burst |
| 11 | 11-empty | no-results card |
| 12 | 12-loading | skeleton rows |

Also test:
- 360x740 and 430x932 viewports;
- slow API (orbit holds and the "CONSULTING" text shows);
- failed API (returns to Confirm with the toast);
- releasing the hold early (resets);
- keyboard hold.
