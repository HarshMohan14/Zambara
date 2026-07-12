# Zambara Game Prototype - AI Agents Codex

This document serves as the guide for any future AI coding agents or developers working on the Zambara asymmetrical rescue game prototype.

## 1. Project Architecture

The project is structured as an npm workspaces monorepo:

```text
/
├── package.json          # Root configurations & workspaces
├── tsconfig.json         # Root references compilation mapping
├── shared/               # Shared gameplay configurations, types, and logic (pure TS)
│   ├── src/types.ts      # Shared enums and data interfaces
│   ├── src/config.ts     # Global balance values (speeds, limits, durations)
│   └── src/logic.ts      # Shared algorithms (majority calculations)
├── client/               # Frontend Client (Vite + TS + BabylonJS)
│   ├── index.html        # Entry page
│   ├── src/main.ts       # Setup & Entry
│   ├── src/network.ts    # Socket.IO connection and packet emissions
│   ├── src/game.ts       # Babylon.js Engine loops & local prediction / interpolation
│   ├── src/map.ts        # 3D building elements generator
│   ├── src/controller.ts # Pointer-locked WASD third-person controls
│   ├── src/ui.ts         # Translucent CSS HTML overlays & HUD
│   └── src/debug.ts      # URL dev configuration panel
└── server/               # Authoritative Backend Server (Node + Express + Socket.IO)
    ├── src/index.ts      # Socket connection handlers
    ├── src/room.ts       # Lobby & session tracking
    ├── src/game.ts       # Server game ticks, interactions & pulse validation
    └── src/physics.ts    # Bounding box collision and speed limit validation
```

## 2. Server-Side Authoritativeness

* **Never trust the client** for captures, revives, hits, doors locking, extraction states, role assignments, or timers.
* **Physics & Collisions**: The server validates all position updates against a speed limit tolerance `maxSpeed * dt + 1.0m` and coordinates player boundaries against static wall AABBs and active door blocks.
* **Interactions**: The server tracks hold durations on its own clock starting from `start-interaction` and completes them on validation.

## 3. Game State Machine

The match flows through a strict phase cycle managed by the server in `server/src/game.ts`:
1. `Lobby`: Players enter display names, ready up, and the admin starts the match.
2. `CivilianPreparation` (20s): Civilians move and hide. Gate doors are locked.
3. `AttackerEntry` (40s): Attacker is released. Rescue Officer remains locked.
4. `RescuePhase` (180s): Rescue Officer is released. Extraction zone is active. Revives and pulses are enabled.
5. `MatchEnd` (15s): Motion is locked, match stats are displayed. Room auto-resets back to lobby.

## 4. Coding & Modification Rules

* **Single Source of Truth**: All configuration constants must be placed in [shared/src/config.ts](file:///c:/Users/Admin/Desktop/Zambaara/Zambara/shared/src/config.ts). Do not hardcode speeds, times, ranges, or dimensions.
* **No Babylon.js on Server**: The server must remain 100% decoupled from Babylon.js classes. Use basic serializable structures (like `Vector3Data`).
* **Clean Named Imports**: Always use modular named imports for Babylon.js (e.g. `import { Scene } from '@babylonjs/core'`).
* **Vite CSS Overlay**: Keep HUD, menus, and scoreboard elements as CSS-styled HTML overlays on top of the 3D canvas instead of using complex Babylon GUI.
* **Declaration Merging**: If legacy `BABYLON` namespaces are needed in client scripts, use the declaration merging pattern shown in [client/src/game.ts](file:///c:/Users/Admin/Desktop/Zambaara/Zambara/client/src/game.ts) rather than a wildcard import.

## 5. Development & Verification Commands

To perform checks, use the following commands in the workspace root:

* **Install dependencies**: `npm install`
* **Run dev servers**: `npm run dev` (starts client on port 5173, backend on 3000)
* **Compile code**: `npm run build`
* **Test game rules**: `npm run test` (runs Vitest test cases)
* **TypeScript type check**: `npm run typecheck`
* **Linter check**: `npm run lint`
