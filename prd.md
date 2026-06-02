# PRD: Doomloop — Sprint 1 (Minimum Playable)

## 1. Product Overview

Doomloop is a fast-paced, low-poly 3D FPS web game inspired by Doom 2016. Players fight through procedurally generated arenas against waves of enemies, culminating in a boss fight. Sprint 1 delivers the **minimum playable loop** to prove the core shooting and movement feel good.

### 1.1 Vision Statement

A browser-based 3D FPS that captures the speed, aggression, and satisfaction of Doom 2016 combat — accessible in any desktop browser with zero install.

### 1.2 Sprint 1 Goal

One weapon, one enemy type, five waves, one boss, one procedural arena. No upgrades, no audio, no score system. **Prove the loop is fun.**

### 1.3 Target Audience

Casual desktop gamers who want a quick (5–10 minute) FPS session in the browser. Familiar with WASD + mouse controls. No account or login required.

---

## 2. Feature List (Sprint 1)

### P0 — Must Have (Ship Blockers)

| ID | Feature | Description |
|----|---------|-------------|
| F01 | **Player Movement** | WASD movement, mouse-look (pointer lock), sprint (Shift), jump (Space). No crouch, no dodge, no slide. |
| F02 | **Basic Shooting** | Left-click fires a projectile. Hitscan or slow projectile (arch-agent decides). Single weapon: "Plasma Rifle" (energy bolts, visible tracers). Infinite ammo (no reload — keeps flow fast). |
| F03 | **1 Enemy Type (Imp)** | A fast, melee-ranged enemy that charges at the player. 3 hits to kill. Damages player on contact. Spawns at random arena edges each wave. |
| F04 | **5 Waves + 1 Boss** | Waves 1–4: increasing Imp count (3, 5, 7, 10). Wave 5: Boss fight. Boss: larger, slower, ranged projectile attack, 15 hits to kill. |
| F05 | **Procedural Arena** | A single arena layout generated from a seeded random algorithm. Walls, floor, and pillars using Three.js primitives (box, cylinder). Rebuilds on each new game. Arena size: ~40x40 units. |
| F06 | **Player Health** | 100 HP. Displayed as an on-screen bar. No health regen. Health packs (3 per wave) spawn at fixed points in the arena. Each restores 25 HP. |
| F07 | **Death & Restart** | HP reaches 0 → game over screen (red flash, "YOU DIED" text, click to restart). New game regenerates arena and resets wave counter. |
| F08 | **Crosshair & HUD** | Simple crosshair (cross or dot). HUD shows: HP bar, wave number (e.g., "Wave 3/5"), enemy kill count for current wave. |
| F09 | **Game Over Screen** | Shows "GAME OVER — Wave X reached" + prompt to restart. |
| F10 | **Win Condition** | Defeat the Wave 5 boss → "VICTORY" screen with "Play Again" button. |

### P1 — Should Have (High Priority)

| ID | Feature | Description |
|----|---------|-------------|
| F11 | **Damage Feedback** | Enemy flashes red/white on hit. Screen flash on player damage. Crosshair hit-marker briefly appears. |
| F12 | **Enemy Death Effect** | Imp explodes into low-poly fragments / particles on death. Boss has a larger death effect. |
| F13 | **Movement Feel** | FOV kick on sprint (narrower FOV while sprinting, snaps back). Smooth acceleration/deceleration (not instant stop). Camera bob on walk (subtle). |

### P2 — Nice to Have (If Time Permits)

| ID | Feature | Description |
|----|---------|-------------|
| F14 | **Weapon Bob** | Gun model sways slightly with movement. |
| F15 | **Simple Skybox** | A gradient or starfield skybox to set mood. |
| F16 | **Loading Screen** | Brief loading/initialization screen while Three.js boots and arena generates. |

---

## 3. Player Experience (Sprint 1 Flow)

1. Player opens `doomloop.lmmlab.com` in desktop browser
2. Loading screen (2–3 seconds) while scene initializes
3. Player appears in center of a procedural low-poly arena
4. Brief "click to lock mouse" prompt / instruction overlay
5. Wave 1 starts: 3 Imps spawn at arena edges and charge
6. Player moves, jumps, sprints, shoots Imps
7. After all Imps in wave are dead, brief pause (3 seconds), then Wave 2 (5 Imps), Wave 3 (7), Wave 4 (10)
8. Wave 5: Boss spawns — larger demon, ranged attack. Player must dodge projectiles and land 15 hits
9. Win → Victory screen. Death → Game Over with wave reached. Both offer restart

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR01 | **Frame rate** | 60 FPS on a mid-range desktop (GTX 1060 / equivalent). Minimum 30 FPS on integrated graphics. |
| NFR02 | **Load time** | < 5 seconds on a reasonable connection (10 Mbps+). < 10 seconds on slow connection (3 Mbps). |
| NFR03 | **Bundle size** | < 5 MB total (gzipped). Three.js + Cannon-es + game code + assets. |
| NFR04 | **Browser support** | Chrome 90+, Firefox 90+, Edge 90+. |
| NFR05 | **Memory** | < 500 MB RAM at peak usage. |
| NFR06 | **No external API calls** | Fully offline-playable after page load. No analytics, no ads, no CDN dependencies. |
| NFR07 | **Pointer lock** | Must use Pointer Lock API for mouse look. Graceful fallback if denied. |
| NFR08 | **Accessible restart** | Keyboard shortcut (R) or click-button to restart. |

---

## 5. Out-of-Scope (Even in Future Sprints)

- Mobile / touch controls
- Multiplayer / online
- Accounts / login / cloud saves
- Payments / IAP
- Custom 3D modeling (CC0 only)
- Voiceover / dialogue / cutscenes / story
- Localization (English only)
- Analytics / tracking

---

## 6. Future Sprint Roadmap (Reference Only)

| Sprint | Focus |
|--------|-------|
| **Sprint 1** (this) | Minimum playable: 1 weapon, 1 enemy, 5 waves, 1 boss, 1 arena |
| **Sprint 2** | 3 weapons, 4 enemy types, upgrade card system, audio (SFX + music), multiple arenas |
| **Sprint 3** | Particles, screen shake, hit feedback ("juice"), balance tuning, boss variety (3+), score + localStorage |

---

## 7. Success Criteria for Sprint 1

1. A player can complete a full 5-wave + boss run in 5–10 minutes
2. Core movement (WASD + sprint + jump + mouse-look) feels responsive and smooth
3. Shooting is satisfying — visible tracers, hit feedback, enemy death effects
4. The procedural arena is different each game session (seed changes on restart)
5. Game runs at 60 FPS on mid-range desktop hardware
6. No crashes, no console errors, no game-breaking bugs
