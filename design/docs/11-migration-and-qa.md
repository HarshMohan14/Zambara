# 11 — Moving from the current zambaara.com, and the launch checklist

## What exists today (zambaara.com, checked October 2026)

- **Home:**
  - title "Zambaara - Master the Elements, Become the Zampion"
  - sections: Welcome; Master the Elements / Win the Bracelets / Become the Zampion; Game Cards; How to Play (rulebook + YouTube tutorial); Battle Pack (₹799 for 2–4 players, 5–8 players also offered); Hear From the Zampions; Witness the Elements in Action; Event Rankings; Stay Updated (newsletter)
- **Sub-pages linked by the new design:** `/how-to-play`, `/beat-the-host`, `/beach-battle`, `/tournaments`
- **Social:** @zambaara (X/Twitter)

## Mapping old → new

| Current | New |
|---|---|
| Welcome / hero | Hero: cinematic intro, wordmark, MASTER THE ELEMENTS |
| Game Cards | 02 · Game Cards: shuffle → draw → reveal, plus card-details modal |
| How to Play | 04 · How to Play: interactive mat walkthrough. Keep `/how-to-play` as the full rulebook page |
| Battle Pack | 08 · The Battle Pack product section (real cart) |
| Hear From the Zampions | 07 · Voices (real quotes needed) |
| Witness the Elements in Action | 06 · Gallery (photos + film) |
| Event Rankings | `/tournaments` → Hall of Champions (link from the footer) |
| Stay Updated | **Not in the prototype. Add a newsletter row above the footer** (email field + SUBSCRIBE, glass panel, same tokens) and keep your existing provider |
| `#battle-pack` anchor | keep it as an alias for `#next` (both ids on the section, or a redirect script) so existing links work |

## URLs to keep working

`/`, `/how-to-play`, `/beat-the-host`, `/beach-battle`, `/tournaments`, and the anchors `/#battle-pack`, `/#rankings`, `/#contact`. If any of these move, add 301 redirects.

## Placeholders to replace before launch

- [ ] Voices: 3 real quotes, names and events (with permission)
- [ ] Price of the 5–8 player edition
- [ ] Shipping & returns policy text
- [ ] Exact box contents and card count
- [ ] Rules text for Reverse and Meteor (which pile, what they do)
- [ ] Beach Battle bracket names; TagCon seat booking backend; rosters
- [ ] Social links (Instagram, YouTube)
- [ ] High-resolution Battle Pack photo; OG image; favicons
- [ ] Contact details (email/phone) for "Bulk & café orders"
- [ ] Payment provider keys (Shopify or Razorpay) and a test order

## Launch QA checklist

**Visual parity.** Compare against `reference/` at the same scroll positions:
- desktop 1440x900 and 1920x1080;
- mobile 390x844 and 360x780;
- tablet 820x1180.

**Transitions** (each must have no visible jump):
- [ ] Hero cards → deck stack
- [ ] Deck stack → mat Draw Deck
- [ ] Bracelet ring → card mosaic → gallery photo (the overlay's last frame equals the gallery's first frame)
- [ ] Footer letters fill with gold (not solid blocks)

**Touch** (real devices; see 06 §5):
- [ ] Swipes never open modals
- [ ] Hero cards never block scrolling
- [ ] No stuck hover or zoom

**Accessibility:**
- [ ] Keyboard: Tab through nav, cards, gallery, product controls; Enter opens; Esc closes; focus returns
- [ ] Screen reader: headings in order; buttons have names; the cart toast is announced (`role=status`)
- [ ] Reduced motion: no scrubbing, final states shown
- [ ] Contrast of muted text over photos (keep the gradient scrims)

**Performance:**
- [ ] Lighthouse mobile ≥ 85 (Performance), ≥ 95 (Accessibility, Best Practices, SEO)
- [ ] LCP < 2.5s on 4G; CLS < 0.05 (fixed sizes on all media)
- [ ] Videos pause off-screen; no 4K assets on mobile

**Commerce:**
- [ ] Add to cart and checkout work in test mode
- [ ] Prices are correct per edition and quantity
- [ ] Order confirmation email
- [ ] Analytics events fire

**SEO:**
- [ ] Titles, descriptions, OG and JSON-LD validated (Rich Results Test)
- [ ] Sitemap and robots
- [ ] Canonical URLs

**Browsers:** Chrome, Safari (iOS + macOS), Firefox, Samsung Internet.
