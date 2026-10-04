# 09 — Content and SEO

All on-page copy is in `../content.json`, structured by section. This page covers voice, keywords and the metadata to ship.

## Voice

- **Storytelling sections** (hero, deck, how to play, host, gallery): short, mythic, uppercase headlines: "FROM STONE… FIRE IS BORN", "ENTER THE ARENA", "BEAT THE HOST".
- **Selling section and footer:** standard e-commerce language. Clear nouns, prices and policies. No game-speak on buttons.
- Players are **Zampions**. The game "turns" on **tribes** (Lava, Rain, Wind, Mountain) and **powers** (Freeze, Lightning, Reverse, Meteor). Prizes are **bracelets**.

## Keywords (taken from the live zambaara.com)

Primary: **Zambaara**, **elemental card game**, **strategy card game**, **card game for 2–8 players**.
Secondary: party game, battle pack, Zampion, master the elements, win the bracelets, Beat the Host, tournaments, Beach Battle, Lava Rain Wind Mountain cards, Freeze Lightning Reverse Meteor, card game India, family/party card game for game nights and cafés.

Phrases the current site uses (keep them):
- "Master the Elements, Become the Zampion" (page title)
- "The ultimate elemental card game"
- "Strategic gameplay for 2-8 players"
- "Master the Elements / Win the Bracelets / Become the Zampion"
- "Hear From the Zampions"
- "Witness the Elements in Action"
- "Event Rankings"
- "Battle Pack"

## Meta tags (home)

```html
<title>Zambaara – Master the Elements, Become the Zampion | Elemental Card Game</title>
<meta name="description" content="Zambaara is the ultimate elemental card game for 2–8 players. Master Lava, Rain, Wind and Mountain, wield Freeze, Lightning, Reverse and Meteor, win the bracelets and become the Zampion. Pre-book the Battle Pack.">
<link rel="canonical" href="https://www.zambaara.com/">
<meta property="og:type" content="website">
<meta property="og:title" content="Zambaara – Master the Elements, Become the Zampion">
<meta property="og:description" content="The ultimate elemental card game for 2–8 players. Pre-book the Battle Pack.">
<meta property="og:image" content="https://www.zambaara.com/og/zambaara-og.jpg">   <!-- 1200x630: make from hero-b-poster.jpg + wordmark -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@zambaara">
<meta name="theme-color" content="#05060B">
```

Tournaments page:
- `<title>Zambaara Tournaments – Beach Battle, TagCon & Event Rankings</title>`
- description: "Join Zambaara tournaments: live Beach Battle brackets, TagCon seat booking, tribe rosters and event rankings. Beat the Host and become the Zampion."

Tribe Reveal page:
- `<title>Summon Your Tribe – Zambaara</title>`
- description: "Enter your name and let the elements choose your Zambaara tribe: Lava, Rain, Wind or Mountain."

## Structured data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "name": "Zambaara", "url": "https://www.zambaara.com/",
      "logo": "https://www.zambaara.com/brand/logo.png", "sameAs": ["https://twitter.com/zambaara"] },
    { "@type": "Product", "name": "Zambaara Battle Pack",
      "description": "The ultimate elemental card game for 2–8 players.",
      "brand": { "@type": "Brand", "name": "Zambaara" },
      "image": ["https://www.zambaara.com/product/battle-pack.jpg"],
      "category": "Card game",
      "offers": { "@type": "Offer", "priceCurrency": "INR", "price": "799",
                  "availability": "https://schema.org/PreOrder", "url": "https://www.zambaara.com/#next" } }
  ]
}
```

Add `Event` objects on `/tournaments` for each dated tournament (name, startDate, location, organizer). Add `AggregateRating` only when you have real reviews.

## Semantic structure

- One `<h1>` per page (the ZAMBAARA wordmark, with `aria-label="Zambaara"` because the letters are split into spans).
- Each section gets an `<h2>`.
- Purely decorative duplicates (the wordmark shine layer, the footer letter spans, overlay cards) get `aria-hidden="true"`. Mat zone labels stay as real text.
- Animated text must exist in the DOM as real text, not canvas, so it can be indexed and translated.
- Alt text: use `assets/assets-manifest.json → description`. Decorative card backs get `alt=""`.
