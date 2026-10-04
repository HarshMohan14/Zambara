# 02 — Design system

Machine-readable values live in `../design-tokens.json`. This page explains the intent.

## Mood

The site feels like a dark, cinematic arena at night: deep near-black space, warm gold light, elemental colour only where a tribe or power is speaking. Gold is the brand. Tribe colours are accents, never backgrounds for UI.

## Colour

| Role | Value | Use |
|---|---|---|
| Base background | `#05060B` | Page, sky fallback |
| Gold 500 | `#C9A063` | Borders, eyebrows, filled buttons |
| Gold 300 | `#E8C989` | Headlines, links, outline-button text |
| Gold 200 | `#F3D594` | Hero statements, price |
| Cream | `#FFF5DE` | Biggest display words over photos (GALLERY) |
| Text primary | `#EDE6DA` | Body on dark |
| Text body | `#D9CFC0` | Paragraphs |
| Muted | `#A89A86` | Secondary copy, captions |
| Host red | `#E07A5F` + red tint | Only in Beat the Host |

Tribe accents: Lava `#D83A2A`, Rain `#2F8FD8`, Wind `#D8D8D8` (opal), Mountain `#8A8178` (onyx). Power glows: Freeze ice-blue, Lightning orange, Reverse violet, Meteor gold.

Contrast: body text `#D9CFC0` on `#05060B` is about 13:1. Muted `#A89A86` is about 7:1. Never put muted text on photos without the dark gradient scrim used in the prototypes.

## Typography

- **Cinzel** (500/700/900) for the wordmark, headlines, numbers, eyebrows and card labels. Uppercase with generous tracking (.06–.22em).
- **Saira** (300–600) for body, buttons and labels. Buttons and labels are uppercase with .14–.2em tracking.
- Load both from Google Fonts (URL in the tokens) with `display=swap`, or self-host the TTFs in `assets/fonts`. Convert to woff2 for production.
- The hero wordmark animates letter by letter (blur + rise), and its tagline tracking tightens from 1.3em to .6em (see 04-sections, Hero).

## Surfaces

- **Glass panel:** `linear-gradient(135deg, rgba(14,10,8,.95), rgba(14,10,8,.72))`, 1px border `rgba(201,160,99,.35)`, radius 14–18px, shadow `0 30px 60px rgba(0,0,0,.5)`. Used for the how-to captions, rewards box and modals.
- **Gold plaque:** a gradient gold strip with chevron ends, used for mat zone labels (ATTACK PILE, PUNISH PILE). `clip-path: polygon(4% 0,96% 0,100% 50%,96% 100%,4% 100%,0 50%)`.
- **Photo tiles:** radius 14px, inner 1px gold ring (`box-shadow: inset 0 0 0 1px rgba(232,201,137,.55)`).

## Buttons

| Type | Spec |
|---|---|
| Outline (default CTA) | 52px tall, 6px radius, 1.5px gold border, gold text, translucent dark fill |
| Filled (primary action) | Gold fill, near-black text: PRE-BOOK NOW, FIND AN EVENT, TUTORIAL |
| Ghost pill | SKIP INTRO, REPLAY |
| Toggle (edition) | Outline that becomes filled gold when selected (`aria-pressed`) |

Hover styles apply **only** inside `@media (hover:hover)`, so phones never get "stuck" hover states. Every button and link uses `touch-action: manipulation` and no tap highlight.

## Iconography and imagery

- Element icons: `assets/icons/*.png` (round, coloured).
- Card art: `assets/cards/*.webp`, aspect 190:278 (≈ 0.684). Always show cards with a 12px radius and a deep shadow.
- Photos: real event photography only (`assets/gallery`). Keep them warm and natural. Do not over-grade.

## Motion principles

1. **Scroll is the timeline.** Nearly everything animates from scroll progress, not timers. The exceptions are the hero intro (video + CSS keyframes), hover and modal entrances.
2. **Every section hands off to the next with a shared object:** cards, the deck, the bracelet ring, the photo. See 05-shared-transitions.
3. **Use smoothstep, always.** Each tween is `ss(a,b)` = smoothstep of progress between two marks. Never linear.
4. **Use transform and opacity only.** Clip-path is used sparingly (gallery tiles, product image reveal).
5. **Reduced motion:** with `prefers-reduced-motion: reduce`, skip the intro, show each section's final state, and use simple fades instead of scrubbing.
