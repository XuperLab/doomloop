# Acceptance Criteria — Doomloop Sprint 1

> Each criterion is structured as: **Given** [precondition], **When** [action], **Then** [observable result].

---

## AC-01: Page Load & Initialization

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-01.1 | Given the user navigates to `doomloop.lmmlab.com`, when the page loads, then a loading screen is displayed with a progress indicator or animation | P0 |
| AC-01.2 | Given a standard desktop browser (Chrome 90+, Firefox 90+, Edge 90+), when the page loads, then total load time is < 5 seconds on a 10 Mbps connection | P0 |
| AC-01.3 | Given the game has finished loading, when the user sees the initial screen, then a "Click to play" prompt is displayed before pointer lock is requested | P0 |
| AC-01.4 | Given the "Click to play" prompt is shown, when the user clicks, then pointer lock is activated and the game starts | P0 |
| AC-01.5 | Given the user denies pointer lock (browser prompt), when the game attempts to lock the pointer, then the game displays a "Please allow mouse lock" message and does not crash | P0 |
| AC-01.6 | Given the page is loaded, when inspected, then no external API calls, analytics pings, or CDN requests are made beyond the initial bundle | P0 |
| AC-01.7 | Given the page loads, when the bundle is measured, then total transfer size (gzipped) is < 5 MB | P0 |

---

## AC-02: Player Movement

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-02.1 | Given the player is in game, when W is pressed, then the player moves forward in the camera-facing direction | P0 |
| AC-02.2 | Given the player is in game, when S is pressed, then the player moves backward | P0 |
| AC-02.3 | Given the player is in game, when A is pressed, then the player strafes left | P0 |
| AC-02.4 | Given the player is in game, when D is pressed, then the player strafes right | P0 |
| AC-02.5 | Given the player is in game, when the mouse is moved, then the camera rotates (yaw and pitch) following mouse movement | P0 |
| AC-02.6 | Given the player is in game, when Shift is held, then the player moves at 1.5x walk speed (sprint) | P0 |
| AC-02.7 | Given the player is sprinting, when Shift is released, then the player returns to walk speed | P0 |
| AC-02.8 | Given the player is in game, when Space is pressed, then the player jumps (vertical velocity with gravity pull-down) | P0 |
| AC-02.9 | Given the player is in the air, when Space is pressed again, then no double-jump occurs | P0 |
| AC-02.10 | Given the player is moving, when movement stops, then the player decelerates smoothly over ~0.1s (not instant stop) | P1 |
| AC-02.11 | Given the player collides with a wall or pillar, when moving into it, then the player cannot pass through the geometry (collision stops forward progress) | P0 |

---

## AC-03: Shooting & Combat

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-03.1 | Given the player is in game, when left mouse button is clicked, then a visible energy bolt/projectile fires from the camera/gun position toward the crosshair | P0 |
| AC-03.2 | Given the player fires, when the projectile travels, then it follows a straight line path visible as a tracer | P0 |
| AC-03.3 | Given the player fires, when the projectile hits a wall, then it disappears with a small impact spark | P0 |
| AC-03.4 | Given the player fires, when the projectile hits an enemy, then the enemy takes damage (1 HP per hit — Imps need 3 hits, Boss needs 15 hits) | P0 |
| AC-03.5 | Given the player fires continuously, when measuring fire rate, then the rate is ~4 shots per second (250ms cooldown) | P0 |
| AC-03.6 | Given the player fires, when checking ammo, then there is infinite ammo (no reload, no ammo counter) | P0 |
| AC-03.7 | Given the crosshair, when the player fires, then the crosshair briefly widens (bloom) and resets within 200ms | P1 |

---

## AC-04: Health & Damage

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-04.1 | Given the player starts a new game, when checking HP, then HP = 100 | P0 |
| AC-04.2 | Given the player takes damage from an Imp (contact), when hit, then HP decreases by 10 | P0 |
| AC-04.3 | Given the player takes damage from a boss projectile, when hit, then HP decreases by 15 | P0 |
| AC-04.4 | Given the player is hit, when taking damage, then the screen briefly flashes red at the edges (damage vignette, ~200ms) | P1 |
| AC-04.5 | Given the player takes damage, when HP changes, then the HUD HP bar updates in real-time | P0 |
| AC-04.6 | Given a health pack exists in the arena, when the player walks over it, then the health pack is consumed and HP increases by 25 (capped at 100) | P0 |
| AC-04.7 | Given 3 health packs spawn per wave, when a new wave starts, then exactly 3 health packs appear at fixed/random positions in the arena | P0 |
| AC-04.8 | Given the player is at 100 HP, when walking over a health pack, then the health pack is not consumed (or consumed with no effect — HP stays at 100) | P1 |

---

## AC-05: Enemies & Waves

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-05.1 | Given Wave 1 starts, when enemies spawn, then exactly 3 Imps appear at random positions along arena edges | P0 |
| AC-05.2 | Given Wave 2 starts, when enemies spawn, then exactly 5 Imps appear | P0 |
| AC-05.3 | Given Wave 3 starts, when enemies spawn, then exactly 7 Imps appear | P0 |
| AC-05.4 | Given Wave 4 starts, when enemies spawn, then exactly 10 Imps appear | P0 |
| AC-05.5 | Given Wave 5 starts, when the boss spawns, then exactly 1 Boss appears at the arena center | P0 |
| AC-05.6 | Given a wave starts, when the wave begins, then a text notification appears ("Wave X/5 — Y enemies") that fades after 2 seconds | P0 |
| AC-05.7 | Given a wave is completed (all enemies dead), when the last enemy dies, then a 3-second pause occurs with "Wave X complete!" text before the next wave starts | P0 |
| AC-05.8 | Given an Imp has spawned, when it exists, then it moves directly toward the player at a speed slightly slower than player sprint (~80% sprint speed) | P0 |
| AC-05.9 | Given an Imp contacts the player, when contact occurs, then the player takes 10 damage and the Imp is briefly pushed back/stopped (~0.5s) | P1 |
| AC-05.10 | Given an Imp takes damage, when hit 3 times, then the Imp dies (death effect triggers) | P0 |
| AC-05.11 | Given the Boss has spawned, when it exists, then it moves toward the player at walk speed (~50% player walk speed) | P0 |
| AC-05.12 | Given the Boss is alive, when 2 seconds pass, then the Boss fires a visible projectile toward the player | P0 |
| AC-05.13 | Given the Boss fires a projectile, when the projectile travels, then it moves at ~60% speed of player plasma bolts and is visually distinct (larger, orange/red) | P0 |
| AC-05.14 | Given the Boss takes damage, when hit 15 times, then the Boss dies with a large explosion effect | P0 |

---

## AC-06: Death & Victory

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-06.1 | Given the player's HP reaches 0, when death occurs, then the screen fades to red with "YOU DIED" centered text | P0 |
| AC-06.2 | Given the death screen is shown, when displayed, then the text includes the wave reached ("Wave X/5") | P0 |
| AC-06.3 | Given the death screen is shown, when the user clicks or presses R, then the game restarts with a new arena and resets all state | P0 |
| AC-06.4 | Given the Boss is killed, when victory occurs, then the screen shows "VICTORY" with a golden/white celebration effect | P0 |
| AC-06.5 | Given the victory screen is shown, when the user clicks or presses R, then the game restarts with a new arena | P0 |
| AC-06.6 | Given the game restarts, when checking the arena, then the seed is different and the arena layout is different from the previous game | P0 |

---

## AC-07: Procedural Arena

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-07.1 | Given a new game starts, when the arena generates, then the arena is approximately 40x40 units with walls, floor, and ceiling | P0 |
| AC-07.2 | Given a new game starts, when the arena generates, then 4–8 pillars/obstacles are placed at random positions determined by a seed | P0 |
| AC-07.3 | Given a new game starts with a different seed, when the arena generates, then pillar positions differ from the previous game | P0 |
| AC-07.4 | Given the player is in the arena, when checking boundaries, then walls are at least 10 units tall (too tall to jump over) | P0 |
| AC-07.5 | Given the arena generates, when checking geometry, then all geometry uses Three.js primitives (BoxGeometry, CylinderGeometry, PlaneGeometry) — no external 3D model files | P0 |

---

## AC-08: HUD & UI

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-08.1 | Given the player is in game, when looking at the HUD, then a red HP bar is visible in the top-left corner showing current/max HP | P0 |
| AC-08.2 | Given the player is in game, when looking at the HUD, then "Wave X/5" is displayed at top-center | P0 |
| AC-08.3 | Given the player is in game, when looking at the HUD, then enemy kill count for the current wave is displayed (e.g., "3/7 Killed") | P0 |
| AC-08.4 | Given the player is in game, when looking at the HUD, then a crosshair is displayed at screen center | P0 |
| AC-08.5 | Given a new wave starts, when the wave notification appears, then it shows the wave number and enemy count, and fades after 2 seconds | P0 |

---

## AC-09: Performance & Technical

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-09.1 | Given a mid-range desktop (GTX 1060 / equivalent), when playing the game, then the frame rate averages 60 FPS | P0 |
| AC-09.2 | Given an integrated graphics laptop (Intel UHD 630), when playing the game, then frame rate averages at least 30 FPS | P0 |
| AC-09.3 | Given the game is running, when monitoring memory usage in browser DevTools, then peak memory stays under 500 MB | P0 |
| AC-09.4 | Given the game is running, when checking the browser console, then there are no uncaught errors or warnings | P0 |
| AC-09.5 | Given the game has loaded, when checking network tab, then no requests are made to external servers after the initial bundle load | P0 |

---

## AC-10: Feel & Polish (P1/P2)

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-10.1 | Given the player hits an enemy, when the projectile connects, then the enemy model flashes white/red for ~100ms | P1 |
| AC-10.2 | Given the player hits an enemy, when the projectile connects, then the crosshair briefly shows a hit marker | P1 |
| AC-10.3 | Given an Imp dies, when death occurs, then the Imp model bursts into 4–6 low-poly fragments that scatter and fade after 1–2 seconds | P1 |
| AC-10.4 | Given the Boss dies, when death occurs, then a larger explosion effect plays with more fragments and optional screen shake | P1 |
| AC-10.5 | Given the player sprints, when Shift is held, then the FOV narrows by ~5 degrees, creating a tunnel-vision effect | P1 |
| AC-10.6 | Given the player walks, when moving, then the camera has a subtle vertical bob | P1 |
| AC-10.7 | Given the player moves from stopped to moving, when acceleration is measured, then reaching full speed takes ~0.2s | P1 |
| AC-10.8 | Given the player is holding a weapon (gun model visible), when moving, then the weapon sways slightly (weapon bob) | P2 |
| AC-10.9 | Given the game loads, when checking the scene background, then a simple skybox (gradient or starfield) is present | P2 |
