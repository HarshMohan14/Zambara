# Zambara - 3D Asymmetrical Rescue Game Prototype

Zambara is a complete, playable browser-based 3D multiplayer prototype of an asymmetrical rescue game. It is designed to test the viability of a three-role gameplay loop: **Civilians**, **Attackers**, and **Rescue Officers**. 

This is a **block-graphics gameplay prototype** utilizing primitive shapes (cylinders, boxes, capsules) to prioritize network responsiveness, game loop clarity, and rapid playtest iterations.

---

## 1. Gameplay Summary & Roles

The game takes place inside a fictional 2-floor building during an emergency. Six players are divided into three distinct roles:

### 🧑‍🤝‍🧑 Civilians (4 Players)
* **Goal**: Hide from the Attacker, survive, and reach the ground-floor extraction zone after the Rescue Officer arrives.
* **Abilities**: Move, sprint (creates noise), crouch, open/close doors, lock selected doors, hide inside cabinets/boxes.

### 👹 Attacker (1 Player)
* **Goal**: Hunt and capture Civilians before they escape. Prevent at least 3 Civilians from extracting.
* **Abilities**: Fast movement, search hiding spots (e.g. wardrobes), break locked doors, capture Civilians. Can view visual sound direction indicators when civilians run or break doors.

### 👮 Rescue Officer (1 Player)
* **Goal**: Protect Civilians, neutralize the Attacker, and coordinate extraction.
* **Abilities**: Pulse weapon (shoot blue rays to damage the Attacker, 3 hits neutralize), check hiding spots without ejecting occupants, breach locked doors, revive captured Civilians.

---

## 2. Match Phases

A server-authoritative match state machine coordinates the match progression:

1. **Lobby**: Players join, enter display names, ready up, and the creator starts the match.
2. **Civilian Preparation (20s)**: Civilians spawn and get time to hide. Gate doors block the Attacker and Rescue spawn rooms.
3. **Attacker Entry (40s)**: Attacker is released to hunt Civilians. Rescue Officer is still locked. Extraction zone remains inactive.
4. **Rescue Phase (180s)**: Rescue Officer is released. Green extraction zone becomes active. Civilians can extract and the Rescue Officer can revive and fight.
5. **Match End (15s)**: Movement disabled. Leaderboards and statistics are displayed. Administrator can restart the match.

---

## 3. Technology Stack

* **Shared**: TypeScript Types, configurations, and core formula logic.
* **Client**: Vite, TypeScript, Babylon.js (3D Viewport), CSS-styled glassmorphic HTML/CSS overlays (Lobby, HUD, and scoreboard).
* **Server**: Node.js, Express, Socket.IO, TypeScript, tsx.
* **Testing & Tools**: Vitest, concurrently, eslint, tsc compiler.

---

## 4. Project Structure

```text
/
├── package.json          # Monorepo configuration
├── tsconfig.json         # Root TypeScript building references
├── shared/               # Common code shared by client & server
│   └── src/
│       ├── types.ts      # Shared enums, player models, room state
│       ├── config.ts     # Central gameplay config (speeds, durations, ranges)
│       └── logic.ts      # Majority calculation formulas
├── client/               # Frontend Vite Application
│   ├── index.html        # Game viewport index
│   ├── src/
│   │   ├── main.ts       # Client entry
│   │   ├── style.css     # Glassmorphic HUD styles
│   │   ├── network.ts    # Socket connection manager
│   │   ├── game.ts       # Babylon.js engine, LERP replication, interaction scanner
│   │   ├── map.ts        # 3D primitives map builder
│   │   ├── controller.ts # Pointer-lock camera WASD controller
│   │   ├── ui.ts         # Overlay templates
│   │   └── debug.ts      # Dev flow shortcuts
│   └── postcss.config.js # Bypasses root configs
├── server/               # Backend Express Server
│   └── src/
│       ├── index.ts      # Socket connection routes
│       ├── room.ts       # Lobby rooms manager
│       ├── game.ts       # Match loop tick and interaction resolver
│       ├── physics.ts    # Server collisions and speed limit checks
│       └── logic.ts      # Player assignment and win conditions
├── PLAN.md               # Milestones plan
└── AGENTS.md             # Developer coding rules and instructions
```

---

## 5. Development Commands

Run all commands in the **workspace root**:

* **Install Dependencies**:
  ```bash
  npm install
  ```
* **Run Client & Server concurrently locally**:
  ```bash
  npm run dev
  ```
  * Client runs on: `http://localhost:5173`
  * Server runs on: `http://localhost:3000`
* **Run automated Vitest test suite**:
  ```bash
  npm run test
  ```
* **TypeScript type check**:
  ```bash
  npm run typecheck
  ```
* **Linter check**:
  ```bash
  npm run lint
  ```
* **Production build**:
  ```bash
  npm run build
  ```

---

## 6. How to Playtest & Open Multiple Clients

1. Start the server and client: `npm run dev`
2. Open a web browser at `http://localhost:5173`.
3. Enter a nickname, and click **Create Room**. Copy the 4-letter room code (e.g. `H3KF`).
4. To test multiplayer interactions, open another tab or incognito window at `http://localhost:5173`.
5. Enter a nickname, click **Join Room**, paste the 4-letter code, and click **Join Lobby**.
6. Both tabs must mark themselves **Ready** (or cancel ready).
7. On the creator's tab, click **Start Match**.

### Developer Automation Url Parameters:
To accelerate testing, you can append query parameters to bypass the lobby screens:
* **Auto create, ready, and start a solo match**:
  `http://localhost:5173/?dev=true`
* **Auto create and request preferred role (for testing mechanics)**:
  `http://localhost:5173/?dev=true&role=Attacker`
  `http://localhost:5173/?dev=true&role=RescueOfficer`
  `http://localhost:5173/?dev=true&role=Civilian`
* **Shorten phase timer limits for fast playtests**:
  `http://localhost:5173/?dev=true&fastPhases=true`

---

## 7. Controls

* **W, A, S, D**: Move character (move relative to camera look angle)
* **Mouse Movement**: Rotate camera view (requires clicking inside window to capture pointer-lock, press `Esc` to release)
* **Left Shift (Hold)**: Sprint (faster but emits sound noise vectors to the Attacker)
* **Left Ctrl or C**: Crouch (slow movement, quiet)
* **E**: Interact
  * Look at doors: Open / Close
  * Look at locked doors: Break (Attacker, 2s hold) / Breach (Rescue, 1s hold)
  * Look at closed doors: Lock (Civilian, 1s hold)
  * Look at hiding spot: Hide (Civilian) / Leave spot (Civilian) / Search (Attacker, 1.5s hold) / Check (Rescue)
  * Look at player: Capture (Attacker, 2s hold) / Revive (Rescue, 3s hold)
* **Left Mouse Button (Click)**: Pulse Attack (Rescue Officer only, range 12m, 1.5s cooldown)
* **Backquote (\`)**: Toggle Administrator Developer Overrides panel
  * Skip current phase
  * Add 30 seconds
  * Force release Attacker or Rescue Officer
  * Reset all doors
  * Teleport player to Ground Floor
* **Space / Arrow Keys**: Cycle between teammates while spectating (when Dead/Escaped)

---

## 8. Known Limitations

* **Reconnection**: Rejoining an ongoing match after dropping connection is not supported in this prototype.
* **Complex Ragdolls / Animations**: Models are represented as colored cylinders and spheres. Mesh rotations mimic facing angles.
* **Geometry sliding**: Visual sliding collisions are handled locally on the client. Simple coordinate checks are validated on the server. Jitter might occur under heavy network lag.
