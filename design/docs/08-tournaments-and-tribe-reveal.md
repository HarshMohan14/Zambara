# 08 — Tournaments page and Tribe Reveal page

## A. `/tournaments` — `reference/pages/tournaments.dc.html`

Same universe background and tokens as the home page. Fluid page (designed at 1440 wide, about 2600 tall). Make it responsive with the same breakpoint.

**1. Hero.** Logo mark, eyebrow "THE ARENAS OF ZAMBAARA", title **ZAMBAARA TOURNAMENTS**, line "Witness the clash of legends. Select a tournament arena below to review standings, rosters, and live stats.", [ENTER THE ARENAS ↓] to `#arenas`. The nav has [CHOOSE ARENA].

**2. Arena cards** (3 across; stacked on mobile). Selecting one:
- dims and slightly scales down the others;
- tints the page background with that arena's accent;
- reveals its panel below.

| Arena | Eyebrow | Panel |
|---|---|---|
| Beach Battle | COASTAL DUELS | **BEACH BATTLE · THE BRACKET.** Stats: 32 PLAYERS · ROUNDS · LOSS AND YOU'RE OUT · SUMMER · ON THE BEACH. A live 32-seat single-elimination bracket (Round of 32 → 16 → Quarters → Semis → Final → ZAMPION) draws in line by line. Note: "Seats fill as players register. Results update live during the event." CTA: VIEW LIVE BRACKET (zambaara.com/beach-battle) |
| TagCon Arena | KIOSK ARENA | **TAGCON ARENA · BOOK YOUR SEAT.** "Pick a tribe table and a seat. Tribe battles run through the event — the last tribe standing crowns the ultimate Zampions." 4 tribe tables x 8 seats; tap a seat to select it, then BOOK THIS SEAT |
| Zambaara Arena | ELEMENTAL ARENA | **ZAMBAARA ARENA · TRIBE ROSTERS.** Four tribe roster cards with their bracelet, "✓✓ VERIFIED" players and "— Open seat" slots. "Every roster is verified twice before the brackets go live." CTA: JOIN A ROSTER |

**3. Hall of Champions — EVENT RANKINGS.** "MEEPLECON · DAY 2 — Fastest time to defeat the host wins."

| Rank | Player | Time |
|---|---|---|
| 1 | Priyanka | 347s |
| 2 | Chetali Gandhi | 561s |
| 3 | Kian | 627s |
| 4 | Jervis | 690s |
| 5 | Tejas | 711s |

**4. Footer.** © 2026 ZAMBAARA · MASTER THE ELEMENTS, BECOME THE ZAMPION · ← BACK TO ZAMBAARA.

**Data to connect:**
- bracket seats (currently "Seat 01–32" / TBD) come from registrations;
- seat booking needs a backend (a simple table plus a form; Supabase or Google Sheets works);
- rosters and rankings should come from a CMS or JSON so staff can update them on event day.

## B. `/tribe-reveal` — `reference/pages/tribe-reveal.dc.html`

A shareable mini-experience: "Summon your tribe". Design stage 600 x 900, scaled to fit (works on phones as-is).

**Flow:**
1. **Idle.** Eyebrow "THE ELEMENTS ARE WAITING" / **SUMMON YOUR TRIBE**. A logo sigil sits in a ring with the 4 element icons orbiting. Input "ENTER YOUR NAME, ZAMPION" and a "HOLD TO REVEAL" button.
2. **Hold.** Press and hold the sigil (pointer) or Space/Enter for **1.6s**. A ring fills 0 → 360°, the logo grows 12% and its glow builds. Releasing early rewinds.
3. **Reveal timeline.**
   - Four face-down cards orbit the sigil.
   - Three fly off-screen.
   - The chosen card comes forward and flips to show its **tribe reveal card** (`cards/reveal/reveal-<tribe>.webp`, about 254 x 336).
4. **Result.** A name plate, "THE ELEMENTS HAVE SPOKEN", **WELCOME, {NAME}**, "Your {Tribe} bracelet waits for you in the arena.", the tribe's bracelet image, then [PRE-BOOK] (#battle-pack) and [REVEAL AGAIN].

The **tribe is deterministic**, from a hash of the trimmed, upper-cased name (`h = 7; for each char: h = (h*31 + code) % 100003`, tribe = `h % 4` in the order Lava, Rain, Wind, Mountain. Check the exact mapping in the page script), so the same name always gets the same tribe. The function is in the page script; keep it so results stay stable.

**Production extras:**
- share button using the Web Share API with an OG image per tribe (generate 4 static images);
- `?name=` query param prefill;
- an analytics event per reveal.
