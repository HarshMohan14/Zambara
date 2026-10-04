# 07 — Battle Pack: the e-commerce section (`#next`)

This is where the site sells. It must read as a standard, trustworthy product page, not a game screen.

## Layout

Desktop: breadcrumb, then a 2-column grid (gallery left, info right), max width 1240px. Mobile: one column, gallery first.

```
HOME / SHOP / ZAMBAARA BATTLE PACK                       ← breadcrumb (nav aria-label="Breadcrumb")
┌──────────────────────────┐  08 · THE BATTLE PACK
│  [PRE-BOOKING OPEN]      │  Zambaara Battle Pack                     (h2)
│                          │  Strategic gameplay for 2–8 players
│     main image (1:1)     │  [CARD GAME] [STRATEGY GAME] [PARTY GAME]
│  hover-zoom (mouse only) │  ₹799   Pre-book price · 2 × ₹799 (when qty > 1)
└──────────────────────────┘  ───────────────────────────────
[t1][t2][t3][t4][t5] thumbs   Description paragraph
                              EDITION                       2–4 PLAYERS
                              [2–4 PLAYERS] [5–8 PLAYERS]    (toggle, aria-pressed)
                              edition note
                              [− 1 +]  [ADD TO CART]  [PRE-BOOK NOW]
                              ✓ Added to cart · n item(s) · edition      (toast, role=status, 3.2s)
                              [2–8 PLAYERS] [4 + 4 TRIBES · POWERS] [Live TOURNAMENTS]
                              ▸ WHAT'S IN THE BOX   (open by default)
                              ▸ HOW TO PLAY
                              ▸ SHIPPING & RETURNS
                              Rulebook · Video tutorial · Bulk & café orders
```

## Images (in order)

1. `product/battle-pack.jpg`: the Battle Pack reference photo (main). **Replace it with a high-resolution shot (≥ 1600px)** before launch.
2. `gallery/fan-table.webp`: the full deck fanned out.
3. `bracelets/bracelets-stack-photo.webp`: the four tribe bracelets.
4. `gallery/cave-cards.webp`: Mountain, Rain and Lava cards.
5. `gallery/box-waterfall.webp`: the wooden box outdoors.

Main image: 1:1, radius 16px, gold border. Thumbnails cross-fade (0.6s). Hover zoom is 1.8x with the transform origin following the mouse; mouse only.

## Behaviour

| Control | Behaviour |
|---|---|
| Thumbnails | Set the main image; active thumb has a gold border and full opacity (others 0.6) |
| Edition toggle | 2–4 or 5–8 players; updates the "EDITION" label and the edition note |
| Quantity | 1–10 |
| Price | `799 × qty`, formatted with `toLocaleString('en-IN')`. **Set the real 5–8 price when known.** |
| ADD TO CART | Adds `{sku, edition, qty}` to the cart provider and shows the toast |
| PRE-BOOK NOW | Goes straight to checkout with the current selection |
| Accordion | One open at a time; `aria-expanded`; + rotates to × |

Edition notes:
- 2–4: "Perfect for intimate gaming sessions. Experience the thrill of elemental mastery with a smaller group of players." (this is the current site's own copy)
- 5–8: "Built for the bigger table: game nights, cafés and group battles for up to eight players."

## Accordion content

- **What's in the box:** Zambaara card deck — tribe cards and power cards · Burlap carry pouch · Tribe bracelets · Card box. *(Confirm against the real box contents and card count.)*
- **How to play:** "Choose your tribe, draw from the deck, attack and punish — and race the sand clock. Most groups are playing within minutes of opening the box. The full rulebook and video guide are linked below."
- **Shipping & returns:** `[PLACEHOLDER]`. Add delivery timelines, shipping regions, COD availability and the returns policy.

## Wiring a real checkout

Build a small provider interface so the UI does not care which backend is used:

```ts
interface CartProvider {
  add(item: { sku: string; edition: '2-4' | '5-8'; qty: number }): Promise<Cart>;
  checkout(): Promise<{ url: string }>;   // redirect URL
}
```

Options:
- **Shopify Storefront API.** Two variants (2–4, 5–8). `cartCreate` / `cartLinesAdd`, then redirect to `checkoutUrl`. Good for inventory, taxes and shipping rules.
- **Razorpay Payment Links or Checkout.** Simplest for India-only pre-orders. Create an order on a serverless route, then open Razorpay Checkout.
- Ship with a `MockCartProvider` (what the prototype does) behind `NEXT_PUBLIC_CART_PROVIDER=mock`.

Also add:
- a cart count badge on the nav PRE-BOOK button;
- a slide-over mini cart (optional);
- JSON-LD `Product` with `offers` (docs/09);
- analytics events: `view_item`, `select_item` (edition), `add_to_cart`, `begin_checkout`.

## Copy tone

Standard, confident and clear. No "game-speak" in prices, buttons or policies. Highlights are short nouns: 2–8 PLAYERS · 4 + 4 TRIBES · POWERS · LIVE TOURNAMENTS.
