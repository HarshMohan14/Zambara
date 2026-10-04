# Build prompt — paste into Antigravity (Opus, high)

Open your **Zambara website repo** as the workspace and copy this kit folder into it (for example as `design/tribe-reveal-kit/`). Then paste the block below.

```text
Implement the new MOBILE design of the tribe reveal page. DESIGN/UI ONLY — do not change any logic.

Design source (in this repo): design/tribe-reveal-kit/
- TRIBE_REVEAL_SPEC.md   ← the spec. Follow it exactly (layout, sizes, colours, states, animation timeline).
- reference/pages/tribe-reveal-mobile.dc.html ← the approved prototype. Its script is the source of truth
  for every number and the reveal animation. Run `npx serve design/tribe-reveal-kit` and open /reference/
  to see it. Use its "PROTOTYPE STATES" button to see loading/error/empty/slow/failed states (do NOT build
  that button into the real page).
- screens/01…12 ← what each state must look like at 390x844.
- assets/ ← copy to public/tribe-reveal/ (keep sub-folders) and use these files only.

Rules:
1. Keep ALL existing logic untouched:
   - the registered-player search/data source;
   - the reveal API call that assigns the tribe (tribe values: lava | rain | wind | mountain);
   - registration;
   - Firebase/Supabase access;
   - the existing sound synth;
   - the thumb scanner, if present.
   Only replace the UI.
2. Build one client component, components/tribe-reveal/TribeRevealMobile.tsx (+ a CSS module), with the props in
   spec §9 (players, query, onQueryChange, loading, error, onRetry, onReveal, eventName, optional sound hooks).
   Wire it to the existing logic in the current reveal page(s) instead of the old UI.
3. Screens:
   - A Search: sticky search bar, filter chips with counts, rows with initials or tribe sigil, highlighted
     match, masked mobile (last 4 digits only), status chip; loading, empty and error states.
   - B Confirm: "Is this you?" name plate, ring, 1.6s press-and-hold sigil (pointer + Space/Enter).
   - C Reveal: the timeline in spec §7. Start the reveal API call when the hold completes; if it hasn't
     answered by t=2.9s, keep orbiting and show "CONSULTING THE ELEMENTS…"; on error return to B with the toast.
   - D Result: spec §8. "NEXT ZAMPION" returns to search (cleared, focused). Already-revealed players open
     straight on D (no burst).
4. Stage screens use a 390x844 design canvas scaled by min(vw/390, vh/844); the search screen is a normal fluid
   layout (max-width 480px). Use 100dvh, safe-area insets, 44px touch targets, no horizontal scroll.
5. One requestAnimationFrame loop; animate only transform, opacity and filter; preload the 4 reveal cards and
   4 bracelets when Confirm opens; support prefers-reduced-motion (spec §10).
6. Fonts: Cinzel (500/700/900) and Saira (300–600), via Google Fonts or assets/fonts.

Check your work: at 390x844 and 360x740, compare each state with screens/01…12 and the running prototype, and
fix any differences. Also test:
- a slow API (orbit waits);
- a failed API (toast);
- releasing the hold early;
- the keyboard hold;
- reduced motion.
At the end, list the files you changed and confirm that no logic or API code was modified.
```

Tips:
- Ask it to stop after each screen (A, B, C, D) so you can approve it before it continues.
- If the animation drifts, reply: "Match `renderVals()` in reference/pages/tribe-reveal-mobile.dc.html exactly (cards, burst, wave, r1–r5)."
