# 10 — Assets

Every file the site needs is in `../assets/`. A machine-readable list (with the original prototype blob id for each file) is `../assets/assets-manifest.json`.

## Production notes

- **Formats:** images are WebP/JPEG/PNG and video is H.264 MP4. For production, also generate AVIF/WebP at 1x/2x sizes and a WebM version of each video. Keep the MP4 as the fallback.
- **Card art:** keep the 190:278 aspect ratio. Fronts are 480x702; the HD back is for large display on the mat.
- **Generated assets:** the four individual bracelets, the hourglass sprite, the universe and constellation backgrounds, the smoke layer, and the hero intro/loop videos were generated for this design. Everything else is the client's own photography and card art.
- **Needed before launch:** a high-resolution Battle Pack photo, a 1200x630 OG image, a favicon set (from `brand/logo.png`), and real player portraits/quotes for Voices if different.
- **Fonts:** Cinzel and Saira (both SIL Open Font License). TTFs are in `fonts/`. Convert them to woff2, or load them from Google Fonts.

## brand

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/brand/logo.png` | 522x495 | 36 | Zambaara logo mark (gold flame/peak) | Footer brand block, favicon source |

## cards

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/cards/lava.webp` | 480x702 | 47 | Lava tribe card front | Hero, deck, mat, modal, host orbit |
| `assets/cards/rain.webp` | 480x702 | 43 | Rain tribe card front | Hero, deck, mat, modal, host orbit |
| `assets/cards/wind.webp` | 480x702 | 30 | Wind tribe card front | Hero, deck, modal, host orbit |
| `assets/cards/mountain.webp` | 480x702 | 34 | Mountain tribe card front | Hero, deck, modal, host orbit |
| `assets/cards/freeze.webp` | 480x702 | 89 | Freeze power card front | Deck, mat (Punish Pile), modal |
| `assets/cards/lightning.webp` | 480x702 | 53 | Lightning power card front | Deck, mat (Punish Pile), modal |
| `assets/cards/reverse.webp` | 480x702 | 52 | Reverse power card front | Deck, modal |
| `assets/cards/meteor.webp` | 480x702 | 57 | Meteor power card front | Deck, modal |
| `assets/cards/back.webp` | 480x702 | 34 | Card back (gold ZAMBAARA) | Hero flip, deck, transit, deal-and-flip mosaic |
| `assets/cards/back-hd.webp` | 720x1054 | 113 | Card back, high resolution | Draw Deck stack on the mat |
| `assets/cards/reveal/reveal-lava.webp` | 635x840 | 70 | Tribe reveal card: Lava | Tribe Reveal page |
| `assets/cards/reveal/reveal-rain.webp` | 633x840 | 62 | Tribe reveal card: Rain | Tribe Reveal page |
| `assets/cards/reveal/reveal-wind.webp` | 633x840 | 51 | Tribe reveal card: Wind | Tribe Reveal page |
| `assets/cards/reveal/reveal-mountain.webp` | 633x840 | 72 | Tribe reveal card: Mountain | Tribe Reveal page |

## icons

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/icons/lava.png` | 160x160 | 19 | Lava element icon | Card modal, footer, tournaments |
| `assets/icons/rain.png` | 160x160 | 17 | Rain element icon | Card modal, footer, tournaments |
| `assets/icons/wind.png` | 160x160 | 22 | Wind element icon | Card modal, footer, tournaments |
| `assets/icons/mountain.png` | 160x160 | 15 | Mountain element icon | Card modal, footer, tournaments |
| `assets/icons/freeze.png` | 160x160 | 23 | Freeze power icon | Card modal |
| `assets/icons/lightning.png` | 160x160 | 18 | Lightning power icon | Card modal |
| `assets/icons/reverse.png` | 160x160 | 23 | Reverse power icon | Card modal |
| `assets/icons/meteor.png` | 160x160 | 20 | Meteor power icon | Card modal |

## bracelets

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/bracelets/bracelet-lava.webp` | 544x344 | 28 | Lava bracelet (generated, transparent) | Bracelet Chamber on the mat, Tribe Reveal |
| `assets/bracelets/bracelet-rain.webp` | 544x344 | 28 | Rain bracelet (generated, transparent) | Bracelet Chamber, Tribe Reveal |
| `assets/bracelets/bracelet-wind.webp` | 544x344 | 30 | Wind bracelet (generated, transparent) | Bracelet Chamber, Tribe Reveal |
| `assets/bracelets/bracelet-mountain.webp` | 544x344 | 24 | Mountain bracelet (generated, transparent) | Bracelet Chamber, Tribe Reveal |
| `assets/bracelets/bracelets-stack-photo.webp` | 1400x1400 | 236 | Real photo: four bracelets stacked | Win the Bracelets ring, product gallery |

## backgrounds

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/backgrounds/universe-bg.jpg` | 3200x1800 | 199 | Black universe background (Prototype B + mobile) | Fixed sky layer |
| `assets/backgrounds/constellation-bg.jpg` | 3200x1800 | 522 | Constellation sky background (Prototype A) | Fixed sky layer |
| `assets/backgrounds/smoke.webp` | 1600x900 | 84 | Smoke overlay (screen blend) | Drifting fog over the sky |
| `assets/backgrounds/mat-bg.jpg` | 1600x800 | 98 | Play mat texture | How to Play mat |

## host

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/host/host-throw.webp` | 1024x1536 | 107 | The Host conjuring cards | How to Play backdrop |
| `assets/host/host-portrait.webp` | 1024x1536 | 134 | The Host portrait (red top hat) | Beat the Host |

## gallery

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/gallery/friends-table.webp` | 828x1100 | 168 | Players laughing at a stone table | Gallery tile 1, deal-and-flip reveal image |
| `assets/gallery/box-waterfall.webp` | 828x1100 | 131 | Wooden box by the falls | Gallery, product gallery |
| `assets/gallery/hand.webp` | 825x1100 | 48 | A hand of cards | Gallery |
| `assets/gallery/tree.webp` | 828x1100 | 110 | Zambaara in the wild (tree) | Gallery |
| `assets/gallery/face.webp` | 825x1100 | 86 | Player hiding behind cards | Gallery |
| `assets/gallery/cave-cards.webp` | 1600x573 | 83 | Mountain, Rain and Lava cards in a cave | Gallery, product gallery |
| `assets/gallery/fan-table.webp` | 1600x1066 | 118 | Full deck fanned on a table | Gallery film poster, product gallery |
| `assets/gallery/player-pouch.webp` | 618x1100 | 136 | Player with pouch and bracelets | Voices card 1 |
| `assets/gallery/player-reader.webp` | 618x1100 | 80 | Player reading a Lava card | Voices card 2 |
| `assets/gallery/player-box.webp` | 618x1100 | 143 | Player holding the wooden box | Voices card 3 |

## product

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/product/battle-pack.jpg` | 972x996 | 237 | Battle Pack product photo (your reference photo) | Product section main image |

## sprites

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/sprites/hourglass-sprite.webp` | 5760x400 | 279 | Sand clock sprite: 24 frames x 120x200 | Sand Clock zone on the mat |

## video

| File | Size | KB | Description | Used in |
|---|---|---|---|---|
| `assets/video/hero-a-intro.mp4` | 1920x1080, 10.0s | 6219 | Prototype A hero intro (plays once) | Hero |
| `assets/video/hero-a-loop.mp4` | 1920x1080, 6.0s | 835 | Prototype A hero loop | Hero |
| `assets/video/hero-a-poster.jpg` | 1920x1080 | 301 | Prototype A hero poster | Hero |
| `assets/video/hero-b-intro.mp4` | 1920x1080, 10.0s | 5603 | Prototype B / mobile hero intro (orb, plays once) | Hero |
| `assets/video/hero-b-loop.mp4` | 1920x1080, 12.0s | 2283 | Prototype B / mobile hero loop | Hero |
| `assets/video/hero-b-poster.jpg` | 1920x1080 | 199 | Prototype B / mobile hero poster | Hero |
| `assets/video/gallery-film.mp4` | 1600x900, 20.6s | 2752 | Gallery film loop | Gallery video tile |

## fonts

| File | Use |
|---|---|
| `assets/fonts/Cinzel.ttf` | Display: wordmark, headlines, numbers (weights 500/700/900) |
| `assets/fonts/Saira.ttf` | Body, buttons, labels (weights 300–600) |
