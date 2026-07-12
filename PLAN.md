# Zambara Game Prototype - PLAN

This file outlines the architecture, implementation milestones, and technical risks for the 3D Asymmetrical Rescue Game.

## Tech Stack
* **Client**: Vite, TypeScript, Babylon.js, Socket.IO Client, HTML/CSS Overlays
* **Server**: Node.js, Express, Socket.IO, TypeScript, tsx
* **Shared**: TypeScript Types, Enums, and Game Configuration

## Implementation Milestones
1. **Project Foundation**: Setup workspaces, package.json, TS configurations, and shared/client/server files.
2. **Basic 3D Scene**: Build the 2-floor building with rooms, staircases, and visual labels in Babylon.js.
3. **Player Controller**: Third-person WASD movement, camera control, collisions, and local markers.
4. **Multiplayer Rooms**: Server-side lobby management, room codes, ready states.
5. **Role Assignment**: Dynamic and random assignment based on player counts.
6. **Match Phase System**: Server-authoritative phase machine (Lobby -> Prep -> AttackerEntry -> Rescue -> End).
7. **Hiding**: Implement 10 hiding spots with occupant management, search by Attacker, check by Rescue.
8. **Capture and Revival**: Attacker capture hold (2s) and Rescue revive hold (3s) with state validation.
9. **Rescue Officer Attack**: Blue pulse raycast with range, cooldown, and Attacker health (3 HP).
10. **Doors**: 6 interactive doors (Open, Closed, Locked, Broken).
11. **Extraction**: Green extraction zone active in Rescue phase. Civilian escape rules.
12. **Win Conditions**: Check civilian escapes (3) vs captured civilians (all or phase timer).
13. **HUD and Debug Tools**: HTML overlays, scoreboard, Admin panel (skip phase, teleports).
14. **Tests and Documentation**: Vitest test suites, typecheck, lint, README, AGENTS.md.

## Technical Risks
* **Movement Sync**: Mitigated by linear interpolation (LERP) and rate-limiting client inputs to 30Hz.
* **Cheating**: Server-authoritative position validation and distance check.
* **UI Overhead**: Solved by using CSS-styled HTML overlays for HUD/Menus instead of Babylon GUI.
