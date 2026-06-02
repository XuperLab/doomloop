# PRD: Doomloop — Sprint 4 (Audio, Weapons, Gameplay Depth, Scenes)

## 1. Product Overview

Doomloop is a fast-paced, low-poly 3D FPS web game inspired by Doom 2016. Sprint 1 delivered the minimum playable loop (1 weapon, 1 enemy, 5 waves, 1 boss). Sprint 2 added mobile touch controls. Sprint 3 polished iPhone Safari/WebKit touch behavior (safe areas, gesture suppression, haptics, settings).

Sprint 4 is the **BIG update** — the game transforms from a single-arena, single-weapon prototype into a full-featured FPS with 4 weapons, 4 enemy types, 3 arenas, audio, power-ups, scoring, difficulty selection, and visual polish.

### 1.1 Vision Statement

A browser-based 3D FPS that feels like a complete arcade experience — multiple weapons with distinct playstyles, varied arenas to explore, visceral audio feedback, and deep enough gameplay (power-ups, combos, kill streaks) to keep players coming back for "just one more run."

### 1.2 Sprint 4 Goal

Deliver four major pillars simultaneously — Audio & Atmosphere, Weapon System, Gameplay Depth, and Scene & Visual enhancements — turning Doomloop from a tech demo into a compelling arcade FPS. All new features must work on both desktop (keyboard + mouse) and mobile (touch).

### 1.3 Target Audience

- **Primary**: Existing Doomloop players (both desktop and mobile) who have mastered the single-weapon loop and want more variety
- **Secondary**: New players attracted by screenshots of multiple arenas, weapons, and kill streak callouts
- **Tertiary**: iOS/Android Safari users (must maintain Sprint 3 touch polish)

### 1.4 Current State (Sprint 3 Delivered)

| Area | Status | Details |
|------|--------|---------|
| 1 weapon (Plasma Rifle) | ✅ Deployed | Single fire, 250ms interval, projectile |
| 2 enemies (Imp, Boss) | ✅ Deployed | Imp melee charger, Boss ranged strafer |
| 5 wave structure | ✅ Deployed | Waves 1-4 imps, wave 5 boss |
| 1 arena (procedural) | ✅ Deployed | 40x40, 4-8 pillars, seeded generation |
| Mobile touch controls | ✅ Deployed | Virtual joystick, camera drag, fire/jump/sprint |
| Safe area / gestures | ✅ Deployed | env(safe-area-inset-*), gesture suppression |
| Haptic feedback | ✅ Deployed | navaigator.vibrate() with settings toggle |
| Touch settings panel | ✅ Deployed | Dead zone, sensitivity, haptics in localStorage |
| Control hints overlay | ✅ Deployed | Help overlay for new mobile players |
| Desktop controls | ✅ Stable | WASD + mouse + pointer lock (unchanged) |
| Audio | ❌ Missing | No SFX, no music, no audio system |
| Weapon variety | ❌ Missing | One weapon only |
| Power-ups / scoring | ❌ Missing | No power-ups, no score/combo/kill streaks |
| Arena variety | ❌ Missing | Same arena every playthrough |

---

## 2. Feature List (Sprint 4)

### P0 — Must Have (Ship Blockers)

#### A. Audio & Atmosphere

| ID | Feature | Description |
|----|---------|-------------|
| A01 | **AudioManager Architecture** | Create a centralized AudioManager using the Web Audio API. Manages SFX and music channels separately. Provides `playSFX(name)`, `playMusic(name)`, `stopAll()`, and `setVolume(channel, level)`. Initializes on user interaction to satisfy browser autoplay policies. Must be a singleton accessible from any game module. |
| A02 | **Weapon Shooting SFX** | Each weapon has a distinct shooting sound effect: Plasma Rifle (zap/energy pulse), Shotgun (heavy boom with spread echo), SMG (rapid crackle), Rocket Launcher (whoosh + delayed explosion). Sounds are synthesized via Web Audio API (oscillators, noise, filters, gain envelopes) — no external audio files. |
| A03 | **Enemy Hurt/Death Sounds** | Each enemy type has distinct hurt and death sound effects: Imp (growl on hurt, shriek on death), Boss (deep roar on hurt, explosion on death), Shooter Imp (electronic screech), Exploder (hiss on hurt, fizzle before detonation), Flyer (buzzing hurt, crackle on death). Hurt sound plays when hit by player projectile. Death sound plays when enemy health reaches 0. |
| A04 | **Boss Entrance Roar** | When the boss spawns (Wave 5 start), a distinctive loud roar plays. This roar is longer and more dramatic than normal boss sounds (~2 seconds). It triggers a brief camera shake effect and a flash on the HUD. |
| A05 | **Background Music** | Procedurally generated background music that intensifies with waves. Base layer is a dark ambient drone (low-pass filtered sawtooth). Each wave adds an additional layer: Wave 1 (drone only), Wave 2 (+percussive pulse), Wave 3 (+bass line), Wave 4 (+lead melody), Wave 5 boss (+full intensity with distortion). Music uses Web Audio API oscillators and gain nodes — no audio files. |
| A06 | **Footstep Sounds** | Player footsteps play at a rate proportional to movement speed. Walking ≈ 2 steps/sec, sprinting ≈ 3 steps/sec. Footstep sound is a low-impact thud (synthesized via short noise burst + low-pass filter). No footsteps when standing still or airborne. Different material sounds are optional (P2). |
| A07 | **Bullet Impact Sounds** | When a player projectile hits an enemy or arena wall, a brief impact sound plays. Enemy impact: sharp crack (varies by enemy type). Wall impact: dull thud with spark-like high-end. Explosions (Rocket Launcher) have a loud, deep boom with reverb-like tail. |
| A08 | **Volume Controls in Settings** | Settings panel (extending the Sprint 3 TouchSettings) adds three volume sliders: Master Volume (0–100%, default 100%), SFX Volume (0–100%, default 80%), Music Volume (0–100%, default 50%). Volume controls work on both desktop and mobile. Master volume multiplies both SFX and Music. Persisted to localStorage. |

#### B. Weapon System

| ID | Feature | Description |
|----|---------|-------------|
| B01 | **Weapon Interface / Abstract Class** | Refactor `PlasmaRifle` into an abstract `Weapon` base class or interface. All weapons implement: `fire()`, `reload()`, `update(dt)`, `getAmmo()`, `getMaxAmmo()`, `getName()`, `getIcon()`. Properties: damage, fireRate (seconds between shots), ammo, maxAmmo, projectileSpeed, spreadAngle, projectileCount, isAutomatic. The existing PlasmaRifle becomes one implementation of this interface. |
| B02 | **Weapons — Shotgun** | Shotgun fires a spread of 5–8 pellets in a narrow cone (15° spread angle). Each pellet does 2 damage (15 max if all hit). Fire rate: 1 per 1.2 seconds (slowest weapon). Ammo: 12 max, uses 1 ammo per shot. Short range (projectile lifetime 0.8s). Effective at close range. Icon: three-dot triangle pattern. |
| B03 | **Weapons — SMG (Sub-Machine Gun)** | SMG fires single projectiles rapidly. Damage per hit: 1 (lowest per-shot). Fire rate: 8 per second (0.125s interval). Ammo: 60 max, uses 1 ammo per shot. Automatic fire (hold to continuously fire). Moderate projectile speed. Icon: horizontal lines. |
| B04 | **Weapons — Rocket Launcher** | Rocket Launcher fires a slow-moving projectile that explodes on impact. Direct hit: 20 damage to primary target, 10+ damage in 3-unit radius (falloff). Fire rate: 1 per 1.5 seconds. Ammo: 6 max, uses 1 ammo per shot. Large explosion effect (particle burst + screen shake + camera kick). Projectile speed: 30 units/sec (slowest — players must lead targets). Self-damage: rocket explosion damages player if too close (< 2 units). Icon: circle with crosshair. |
| B05 | **Weapon Switching — Desktop** | Number keys 1–4 switch weapons: 1 = Plasma Rifle, 2 = Shotgun, 3 = SMG, 4 = Rocket Launcher. Mouse wheel scroll also switches weapons (up = next, down = previous). Weapon switch has a 0.3s animation delay (cannot fire during switch). Current weapon is highlighted in the weapon bar HUD. |
| B06 | **Weapon Switching — Mobile** | A weapon bar appears above the fire button on mobile, showing up to 4 weapon icons in a horizontal row. Tap a weapon icon to switch. The current weapon is highlighted. The weapon bar auto-fades to low opacity after 2s of no interaction, reappears on weapon zone tap. Same 0.3s switch delay. |
| B07 | **Weapon Pickup Spawners** | Weapon pickup spawners are placed at fixed positions in each arena. Each spawner shows a floating weapon icon and ammo crate. When the player walks over it, the weapon is added to their inventory (or ammo replenished if already owned). Spawners respawn after 15 seconds. Each arena has 2–3 spawner positions. |
| B08 | **Ammo System** | Each weapon has its own ammo count and max ammo. Ammo is consumed on fire. When ammo reaches 0, the weapon cannot fire — the player must find an ammo pickup or switch weapons. Ammo pickups (small and large) spawn in the arena during waves. Small ammo pickup: +15 SMG / +5 Shotgun / +3 Rocket / +20 Plasma. Large ammo pickup: fills all weapons to 50% of max. |
| B09 | **Ammo Pickups** | Ammo pickups appear as floating bullet/energy cell models with a glow pulse. Small: single item, dimmer glow. Large: stack or crate, brighter glow. Spawn at random positions in the arena (not overlapping pillars). 1 small ammo pickup spawns per 3 enemies killed. 1 large ammo pickup spawns on wave intermission. |
| B10 | **Weapon HUD** | Bottom-center weapon HUD bar showing: all owned weapon icons, current weapon highlighted, crosshair adapts to current weapon (Shotgun: wider cross, SMG: tight cluster, Rocket: large circle). Ammo counter per weapon shown below icon. Out-of-ammo weapon icon is dimmed with a red X or translucent. |

#### C. Gameplay Depth

| ID | Feature | Description |
|----|---------|-------------|
| C01 | **Power-Up Spawning** | Power-ups spawn in the arena during combat. One power-up spawns per wave (at wave start, at a random position). Power-up respawns 10 seconds after being collected (max 1 active at a time). Power-up drops are visible as glowing floating orbs with distinct colors: Speed Boost (blue), Double Damage (red), Shield (white), Health Pack (green — extra, not replacing existing health pack spawns). |
| C02 | **Power-Up — Speed Boost** | Increases player movement speed by 50% for 8 seconds. Player character gains a blue aura/glow (or Three.js rim light effect). Stacking: picking up another Speed Boost while active resets the timer. Visual: blue glow particles trail behind player. |
| C03 | **Power-Up — Double Damage** | All weapon damage is multiplied by 2 for 8 seconds. Weapon projectiles gain a red hue / flame effect. Crosshair turns red. Stacking: timer resets. |
| C04 | **Power-Up — Shield** | Player takes no damage for 6 seconds. Shield visual: translucent white sphere/force field effect around player (a Three.js sphere mesh with wireframe or semi-transparent material). Shield break sound on expiration or when hit. |
| C05 | **Power-Up — Health Pack** | Instantly heals 40 HP (overheal not possible — caps at 100). Same visual as existing health packs but more prominent glow. This is an arena power-up, not a replacement for the wave health pack spawns. |
| C06 | **Score System** | Track player score across waves. Points per kill: Imp = 100, Shooter Imp = 150, Exploder = 200, Flyer = 300, Boss = 1000. Score persists across waves within a run. Score displayed in top-right HUD area. High score saved to localStorage (`doomloop_high_score`). |
| C07 | **Combo Multiplier** | Kill enemies in quick succession (within 2 seconds of each other) to build a combo multiplier. Combo > 1: points multiplied by combo count. Combo multiplier displayed next to score. Combo timer bar shows remaining window. Combo resets to 1 if no kill within 2 seconds. Max combo: 10x. |
| C08 | **Kill Streak Display** | When combo reaches certain thresholds, a callout appears center-screen: combo 2 = "Double Kill!", combo 3 = "Triple Kill!", combo 4 = "Multi Kill!", combo 5 = "RAMPAGE!", combo 7 = "DOMINATION!", combo 10 = "GODLIKE!". Callout is text overlaid on screen with animation (scale from 0.8→1.2→1.0 over 1.5s). Sound plays on each streak tier. |
| C09 | **Difficulty Selection** | Before game start, player selects difficulty: Easy, Normal, Hard. Difficulty affects: enemy health multiplier (0.7x / 1.0x / 1.5x), enemy damage multiplier (0.5x / 1.0x / 1.5x), enemy count per wave (+0 / reference / +25%), power-up duration (10s / 8s / 5s), score multiplier (0.8x / 1.0x / 1.5x). Selection is a 3-button choice on the start screen. Default: Normal. |
| C10 | **New Enemy — Shooter Imp** | Ranged enemy. Same health as Imp (3). Stays at distance (8–15 units from player) and fires slow-moving energy projectiles (speed 20 units/sec, damage 8 per hit). Fire interval: 1.5s. Appearance: Imp body with glowing arm-cannon. AI: run to preferred range → stop → aim → fire → reposition. |
| C11 | **New Enemy — Exploder** | Self-destruct enemy. Low health (2 HP). Charges directly at player at high speed (1.3x player sprint speed). On reaching the player (or being killed), explodes in a 4-unit radius dealing 20 damage to player and 5 damage to other enemies in blast zone. Explosion visual: orange/red particle burst. Warning: yellow glow intensifies as it gets closer. Makes a loud hissing sound. |
| C12 | **New Enemy — Flyer** | Swooping aerial enemy. Hovers above the arena at height 6–10 units. Health: 4 HP. Movement: undulating flight path (sine wave on horizontal plane) toward player. Attack: dive-bombs downward when within 5 units horizontally, dealing 12 contact damage on dive, then flies back up. Dive has a 3-second cooldown. Appearance: bat-like or floating skull mesh. AI: hover → circle → pick target → dive → climb → repeat. |

#### D. Scene & Visual

| ID | Feature | Description |
|----|---------|-------------|
| D01 | **Multiple Arenas — Stone Fortress** | Arena 1: Stone Fortress. Gray stone walls, torch sconces, flagstone floor with grid pattern. Ambient light: warm (0xFFCC88 at 0.8 intensity). Fog: light grey, distance 30–60. Pillars are square stone columns with capital tops. Size: 40x40. Atmosphere: medieval fortress. |
| D02 | **Multiple Arenas — Lava Cavern** | Arena 2: Lava Cavern. Red/orange glow from lava crevasses in the floor. Dark basalt walls. Floor has glowing lava cracks (procedural lines with emissive material). Ambient light: red (0xFF4422 at 0.6). Fog: orange/red, distance 35–60. Pillars are rough rock columns. Lava pools at edges (decorative — player dies if falling in). Size: 45x45. |
| D03 | **Multiple Arenas — Void Nexus** | Arena 3: Void Nexus. Cosmic/space theme. Floor is a reflective dark surface with star-like specks (particles or emissive dots). Walls are dark purple/black with swirling energy patterns. Ambient light: purple (0x8844FF at 0.5). Pillars are crystalline/glowing. Floating debris / asteroid-like rocks. Size: 50x50 (largest arena). |
| D04 | **Arena Selection & Portal Transitions** | At game start, one arena is selected (random or sequential). When the player completes all 5 waves in an arena, a portal (glowing circular vortex) appears. Touching the portal transitions to the next arena. Transition animation: screen fades to white over 0.5s → portal vortex visual → load next arena → fade in over 0.5s. Player health, weapons, score, and ammo persist across transitions. Enemies reset (new waves). |
| D05 | **Enhanced Particle Effects — Muzzle Flash** | Each weapon has a distinct muzzle flash when fired: Plasma Rifle (brief bright blue flash, particle burst), Shotgun (wide yellow-white flash with smoke puff), SMG (rapid small orange sparks), Rocket Launcher (large red/orange flash with smoke ring). Muzzle flash is a Three.js Points/Particle system that spawns at the weapon tip and decays over 0.1–0.3s. |
| D06 | **Enhanced Particle Effects — Explosion** | Rocket Launcher and Exploder deaths create an explosion particle effect: expanding sphere of particles (20–40 points) in orange/red/yellow, fading over 0.5s. Screen shake (intensity 0.3, duration 0.3s) accompanies explosions. Explosion also creates a brief point light (THREE.PointLight) for dynamic lighting. |
| D07 | **Enhanced Particle Effects — Shell Casings** | Weapons eject shell casings on fire. Casings are small Three.js box meshes with physics bodies (low mass) that drop to the floor. Shotgun ejects 1 large shell, SMG ejects small casings rapidly, Plasma Rifle ejects glowing energy cell that fades quickly, Rocket Launcher ejects a smoking canister. Casings despawn after 5 seconds. |
| D08 | **Enhanced Particle Effects — Death Burst** | When an enemy dies, a burst of particles matching its color scheme flies outward: Imp (red shards), Shooter Imp (blue sparks), Exploder (orange embers), Flyer (purple wisps), Boss (large golden burst with 50+ particles). Existing DeathEffect.ts geometry shards extended for this purpose. |
| D09 | **Mini-Map** | A small mini-map overlay in the top-right corner of the screen (if on mobile, shifted to respect safe area). Size: 120x120px on desktop, 80x80px on narrow mobile. Shows: arena boundaries (rectangle outline), player position (bright dot, always centered), enemy positions (red dots), power-up/ammo pickup positions (colored dots), portal position (glowing circle). Mini-map is an HTML5 Canvas overlay (not Three.js) — simple 2D rendering from top-down projection. Arena layout data shared between ArenaGenerator and MiniMap. |
| D10 | **Interactive Arena Elements — Trap Zones** | Each arena has 2–4 trap zones (visually distinct floor areas). Stone Fortress: pressure plates that trigger wall spikes. Lava Cavern: geyser vents that burst upward (damage 15, knockback). Void Nexus: gravity wells that slow player movement by 50% for 3 seconds. Enemies are affected by traps too. Traps reset after 5 seconds. Visual indicator: subtle glow/pulse on floor. |
| D11 | **Interactive Arena Elements — Supply Stations** | Each arena has 1 supply station: a glowing terminal/altar that provides a one-time full ammo refill and 25 HP heal per wave. Visually distinct (glowing crystal/console). Player must walk up to it and press a button (desktop: E key, mobile: on-screen interaction button) to activate. Cooldown: once per wave. A green checkmark above the station indicates it's available. |

---

### P1 — Should Have (High Priority)

| ID | Feature | Description |
|----|---------|-------------|
| A09 | **Optional Audio Asset File Loading** | Support fallback to loaded audio files (mp3/ogg via AudioBuffer) for any SFX that can't be adequately synthesized. AudioManager detects if an audio file URL is configured; if so, loads and plays it instead of synthesizing. Configurable via Constants.ts audio file map. |
| B11 | **Weapon Stats Display** | When switching weapons, brief stat overlay shows: damage per shot, fire rate, ammo remaining, a short description. Overlay fades after 2 seconds. |
| C13 | **Boss Buff Per Arena** | Boss gets a unique buff depending on the arena: Stone Fortress (+50% HP), Lava Cavern (+25% damage), Void Nexus (teleports every 4 seconds). This adds variety to boss fights across runs. |
| D12 | **Arena-Specific Lighting & Weather** | Subtle ambiance per arena: Stone Fortress has dust particle effect (small brown particles floating), Lava Cavern has rising ember particles (small orange dots), Void Nexus has faint aurora wave effect in the sky (color cycling strip). |
| D13 | **Portal Visual Polish** | Portal vortex has animated spiral texture (rotating UV offset on a torus/ring geometry). Particles streaming into the portal. Portal glow pulses in intensity. |

### P2 — Nice to Have (If Time Permits)

| ID | Feature | Description |
|----|---------|-------------|
| A10 | **Audio Occlusion** | When enemy is behind a pillar, reduce SFX volume slightly (raycast check from player to sound source). Simple implementation: if line-of-sight blocked, apply 0.5x volume multiplier. |
| B12 | **Recoil System** | Each weapon has a recoil pattern: visual (crosshair kick) and camera pitch offset. Shotgun: strongest kick. SMG: sustained climb. Rocket Launcher: big single kick. Recoil recovers over 0.5s of not firing. |
| C14 | **Wave Skip Option** | On Normal/Hard difficulty, if player has killed all enemies quickly (within 10 seconds), an optional "Rush" portal appears offering to skip directly to the next wave with a score bonus (500 points × wave number). |
| D14 | **Arena Secret Rooms** | Hidden wall sections in each arena that open briefly (2s) when triggered by a specific action (e.g., shooting a weak wall). Secret room contains a large ammo crate and a score bonus (1000 points). |
| D15 | **Cooperative/Local Multiplayer Stub** | Placeholder for future split-screen. Not functional in Sprint 4 but architecture must not prevent it. Specifically: InputAdapter pattern supports 2+ input sources in Sprint 4 (by instantiating a second InputAdapter for player 2). Actual rendering not required. |

---

## 3. Player Experience (Sprint 4 Flow)

1. Player opens `doomloop.lmmlab.com` — start screen now shows difficulty selection (Easy / Normal / Hard) before "Click/Tap to Start"
2. Desktop: number keys 1-4 ready for weapon switching. Mobile: weapon bar visible above fire button
3. Arena loads — could be Stone Fortress, Lava Cavern, or Void Nexus. Ambient music begins (dark drone)
4. Wave 1 starts — Shooter Imps and regular Imps appear. Player fires Plasma Rifle — hears energy pulse SFX
5. Player picks up Shotgun from spawner — HUD updates, Shotgun added to inventory
6. Enemies die with distinct hurt/death sounds. Kill streak callouts appear on combo build-up
7. Player picks up Speed Boost power-up — blue aura, faster movement, timer visible
8. Exploder enemy charges — hissing sound intensifies — player kills it mid-charge — explosion particles
9. Flyer enemy swoops from above — player dodges and fires SMG — rapid crackling SFX
10. Wave 5 boss appears with entrance roar + camera shake
11. Player defeats boss with Rocket Launcher — explosion particles, screen shake, large death burst
12. Portal opens — player walks through — fade to white — new arena loads — next wave set begins
13. Player dies — death screen shows score, high score, wave reached, and "Play Again" (R / tap)
14. Player can adjust volume (Master/SFX/Music) from the settings panel at any time

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR01 | **Desktop 60 FPS** | Maintain 60 FPS on mid-range desktop (i5-8400, GTX 1060) in any arena with 15+ enemies, particles, and mini-map active |
| NFR02 | **Mobile 30 FPS** | Maintain 30 FPS on iPhone 11+ / mid-range Android with touch controls, mini-map, and particles |
| NFR03 | **Audio latency** | SFX must play within 50ms of the triggering event (weapon fire, enemy hit, pick-up) |
| NFR04 | **No Sprint 1-3 regression** | All existing features (1 arena basic loop, touch controls, safe areas, haptics, settings) must work identically |
| NFR05 | **No desktop regression** | Desktop touch input must not be modified; pointer lock must work as before |
| NFR06 | **Bundle size** | Sprint 4 additions should add < 50 KB gzipped total (audio synthesis is code-only, particles are procedural) |
| NFR07 | **Audio autoplay** | AudioContext must be suspended until first user interaction, then resumed. No audible playback before user click/tap |
| NFR08 | **Mobile mini-map** | Mini-map must not overlap touch controls. Positioned top-right, below safe area inset |
| NFR09 | **Weapon switch responsiveness** | Weapon switch must register within 50ms of keypress/tap (the 0.3s switch delay is gameplay, not input lag) |
| NFR10 | **Arena transition smoothness** | Transition fade must be complete within 1 second total (0.5s fade out + 0.5s fade in) |
| NFR11 | **TypeScript compilation** | `tsc --noEmit` must produce zero errors |
| NFR12 | **Build success** | `npm run build` must succeed and produce a deployable `dist/` |

---

## 5. Out-of-Scope (Even in Future Sprints)

- Multiplayer / co-op (architecture stub only — actual gameplay is out)
- In-game economy / microtransactions
- Save/load game mid-run (run always ends on death or manual restart)
- Controller / gamepad support
- Map editor / modding tools
- Leaderboards / online ranking
- Achievements / trophies
- Voice chat / in-game text chat
- WebGL 2.0 specific features (must support WebGL 1.0 fallback)

---

## 6. Sprint 4 Success Criteria

1. All 4 weapons fire correctly with distinct sounds, damage values, and ammo consumption — on both desktop and mobile
2. Weapon switching (keys 1-4 / mouse wheel / mobile weapon bar) works and respects the 0.3s switch delay
3. Weapon pickups and ammo pickups spawn, are collectible, and replenish correctly
4. AudioManager plays distinct SFX for each weapon, each enemy type (hurt/death), boss roar, footsteps, and impacts — all on first user interaction
5. Background music intensifies through 5 waves in each arena
6. Volume sliders (Master/SFX/Music) correctly control audio levels and persist across sessions
7. Power-ups (Speed Boost, Double Damage, Shield, Health Pack) spawn, are collectible, apply correct effects with timers
8. Score tracks correctly with combo multiplier. Kill streak callouts display at correct thresholds
9. Difficulty selection (Easy/Normal/Hard) correctly modifies enemy stats and score multiplier
10. All 3 new enemy types (Shooter Imp, Exploder, Flyer) have correct AI behavior, damage values, and death effects
11. All 3 arenas (Stone Fortress, Lava Cavern, Void Nexus) load with correct visual theme, lighting, and dimensions
12. Portal transitions between arenas work with fade animation — player health/weapons/score persist
13. Mini-map renders correctly on desktop and mobile, showing arena outline, player, enemies, and pickups
14. Trap zones and supply stations function in each arena with correct cooldowns
15. Enhanced particle effects (muzzle flash, explosion, shell casings, death burst) render without causing frame drops
16. Sprint 1-3 features (basic arena loop, touch controls, safe areas, haptics, settings panel) are unchanged
17. `tsc --noEmit` zero errors. `npm run build` succeeds
