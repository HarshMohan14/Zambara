# 01 — Site map, section order and navigation

## Routes

| Route | Source prototype | Notes |
|---|---|---|
| `/` | `desktop-universe.dc.html` (≥ 861 px) and `mobile.dc.html` (≤ 860 px) | One long scroll story, 8 sections + footer |
| `/tournaments` | `tournaments.dc.html` | Replaces/extends the current tournaments page |
| `/tribe-reveal` | `tribe-reveal.dc.html` | Shareable "Summon your tribe" experience |
| `/how-to-play`, `/beat-the-host`, `/beach-battle` | existing zambaara.com pages | Keep live (linked from the new site). Restyle later with the same tokens. |

## Home page — section order

All "stage" sections are **pinned**: a tall outer `<section>` with a `position: sticky; top: 0; height: 100vh` stage inside. Scrolling through the outer height plays the animation (see `03-scroll-engine.md`).

| # | Anchor id | Section | Outer height (desktop / mobile) | Type |
|---|---|---|---|---|
| 1 | `#top` | Hero — cinematic intro video + 4 tribe cards | `min(100vh, 1000px)`, min 600 / `100dvh` | Normal (scroll-linked fade) |
| 2 | `#deck` | Game Cards — shuffle → draw → reveal grid | 3600px / 3600px | Pinned |
| 3 | `#howto` | How to Play — "Enter the Arena" mat walkthrough | 5600px / 5600px | Pinned |
| 4 | `#host` | Beat the Host → Win the Bracelets | 3800px / 3800px | Pinned |
| 5 | `#chronicles` | Gallery — "Witness the Elements in Action" | 3400px / 3400px | Pinned |
| 6 | `#voices` | Hear From the Zampions (3 review cards) | auto | Normal (scroll-linked) |
| 7 | `#next` | Battle Pack — product / e-commerce | auto | Normal (scroll-linked reveal) |
| 8 | `footer` | Horizon footer, ZAMBAARA letters fill with gold | auto | Normal (scroll-linked) |

Section numbers shown on the page as eyebrows: 02 · GAME CARDS, 04 · HOW TO PLAY, 05 · BEAT THE HOST, 06 · WITNESS THE ELEMENTS IN ACTION, 07 · VOICES OF THE ARENA, 08 · THE BATTLE PACK. The eyebrows are kept from the prototype; renumber them 01–07 if you prefer consecutive numbers.

## Fixed / overlay layers (always on top of the scrolling content)

1. **Sky layer** (z 0): background image + hero loop video + twinkling stars (2 parallax layers) + 2 drifting smoke layers + vignette + dim layer + red "host" tint.
2. **Navigation bar** (z 30): logo left, links centre (desktop), PRE-BOOK right. Transparent gradient over the hero; solid `rgba(5,6,11,.82)` desktop / `.95` mobile after 60% of the hero.
3. **Hero cards overlay** (z 25): the 4 tribe cards, which travel into the deck.
4. **Transit overlay** (z 16): 8 card backs flying from the deck to the mat.
5. **Deal-and-flip overlay** (z 16): card-back mosaic, Bracelets → Gallery.
6. **Progress spine** (z 18, desktop only, hidden ≤ 860 px): vertical dots at left, one per section.
7. **Modals** (z 70): card details and gallery lightbox.

## Navigation

Desktop nav: THE DECK `#deck` · CARDS `#deck` · HOW TO PLAY `#howto` · BEAT THE HOST `#host` · GALLERY `#chronicles` · [PRE-BOOK] `#next`.
Mobile nav: ZAMBAARA (to `#top`) · [PRE-BOOK] `#next`. There is no hamburger in the prototype. Add one only if needed, with the same links.

Smooth anchor scrolling: native `scrollIntoView({behavior:'smooth'})`. The engine's smoothing follows automatically.

## External links used

| Label | URL |
|---|---|
| Rulebook / Full rulebook & video guide | https://www.zambaara.com/how-to-play |
| Video tutorial | https://www.youtube.com/embed/nxtyDh9SD-Q |
| Find an event (Beat the Host) | https://www.zambaara.com/beat-the-host (mobile) or `#next` (desktop prototype). Point both to the events page. |
| Tournaments | https://www.zambaara.com/tournaments, which becomes the new `/tournaments` |
| Beach Battle | https://www.zambaara.com/beach-battle |
| Event Rankings | https://www.zambaara.com/#rankings |
| Contact / Bulk & café orders | https://www.zambaara.com/#contact |
| Pre-book now (product) | https://www.zambaara.com/#battle-pack, which becomes the real checkout (docs/07) |

## Footer link columns

- **THE GAME:** The Cards · How to Play · Rulebook · Battle Pack
- **THE ARENA:** Beat the Host · Tournaments · Beach Battle · Event Rankings
- **COMMUNITY:** Gallery · Zampion Voices · Contact · Video Tutorial
- **Bottom row:** © 2026 ZAMBAARA · MASTER THE ELEMENTS, BECOME THE ZAMPION · RETURN TO THE BEGINNING ↑
