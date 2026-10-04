# Cinematic home page (desktop + mobile)

The home page (`/`) is the new cinematic, scroll-animated design. Every other route — how-to-play, beat-the-host, beach-battle, tournaments, reveal, tagcon, admin and the APIs — is unchanged.

## How it is built

| File | What it does |
|---|---|
| `app/page.tsx` | Keeps the existing metadata and JSON-LD, then renders `<CinematicHome />` (plus a `<noscript>` fallback) |
| `components/ConditionalLayout.tsx` | `/` skips the old `Navigation` and `Footer`; the cinematic page has its own |
| `components/cinematic/CinematicHome.tsx` | Picks the build: **desktop (> 860px)** or **mobile (≤ 860px)**. Each build is code-split, so phones never download the desktop bundle |
| `components/cinematic/DesktopHome.tsx` + `desktop.css` | Desktop build (Prototype B, "black universe"). **Generated, do not edit by hand** |
| `components/cinematic/MobileHome.tsx` + `mobile.css` | Mobile build. **Generated, do not edit by hand** |
| `components/cinematic/blocks.tsx` + `blocks.css` | Hand-written parts that use the site's real APIs: pre-booking modal (`/api/pre-bookings`), event rankings (`/api/events` + `/api/rankings`), newsletter (`/api/newsletter`), contact (`/api/contact`), mobile menu |
| `public/cinematic/` | All images, videos and sprites used by the design |
| `design/` | Source of truth: the approved prototypes (`design/prototypes/*.dc.html`), the asset manifest, tokens, content and the full spec in `design/docs/` |
| `scripts/cinematic/` | The generator: `prod.py` applies the production changes, `dc2tsx.py` converts a prototype to React, and `gen.sh` runs both |

## Changing the design

1. Edit the prototype in `design/prototypes/` (layout, animation timing, copy), **or** add a production rule to `scripts/cinematic/prod.py` (content, links, API wiring).
2. Run `bash scripts/cinematic/gen.sh`.
3. Run `npm run dev` and check both widths (1440x900 and 390x844).

Small copy changes can also go straight into `prod.py`, which already holds:
- the real prices (₹799 for 2–4 players, ₹899 for 5–8);
- the card texts from the old card slider;
- the rules from the How to Play page;
- the testimonial names;
- all links.

## Content wired to the existing site

- **Pre-book:** the Battle Pack section's PRE-BOOK NOW opens a form (edition, quantity, name, email, mobile) that posts to `/api/pre-bookings`. Bookings appear in **Admin → Pre-bookings** as before, with the pack, quantity and total in `specialRequests`.
- **Rankings:** `#rankings` lists the top 5 per event from the live rankings API. It hides itself when there is no data.
- **Newsletter:** "Stay updated" posts to `/api/newsletter` and shows up in **Admin → Newsletter**.
- **Contact:** `#contact` posts to `/api/contact` and shows up in **Admin → Contact**.
- **Old anchors:** `/#hero`, `/#cards`, `/#how-to-play`, `/#battle-pack`, `/#cave`, `/#rankings` and `/#contact` still work, so links from other pages land in the right place.

## Mobile behaviour (main customer)

- The page uses window scrolling with real viewport heights (`100svh`) and safe-area insets.
- Overlays never block a swipe. A card or gallery modal only opens on a quick, still tap; a swipe, a resting thumb or a tap during momentum scrolling is ignored.
- Hover effects only apply on devices that can hover. The product image zoom is mouse-only.
- Open modals lock background scrolling, and Esc closes them.

## Fonts

Cinzel and Saira load from Google Fonts in `app/layout.tsx`.
