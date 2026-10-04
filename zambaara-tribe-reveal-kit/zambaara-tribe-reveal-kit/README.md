# Zambaara Tribe Reveal — mobile kit (design only)

The mobile design for the tribe reveal page, with a **search bar to find registered tournament players**. This is the UI only; your existing logic stays as it is. That logic covers:
- player search and data;
- the reveal API that assigns tribes;
- registration;
- sounds;
- the thumb scanner.

| What | Where |
|---|---|
| The full design spec (layout, states, animation timeline, props) | `TRIBE_REVEAL_SPEC.md` |
| Prompt to paste into Antigravity | `BUILD_PROMPT.md` |
| Every asset the page needs (16 files + 2 fonts) | `assets/` with `assets/assets-manifest.json` |
| Working reference prototype | `reference/`. Run `npx serve .` and open `/reference/` |
| Screenshot of every state | `screens/01…12` |

In the prototype, the **PROTOTYPE STATES** button (bottom-right) lets you see loading, list error, no results, a slow reveal API and a failed reveal. It is for the design review only and must not be built into the real page. The player names in the prototype are sample data.
