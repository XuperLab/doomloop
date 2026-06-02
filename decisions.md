# Architectural Decisions — Doomloop Sprint 4 (Audio, Weapons, Gameplay Depth, Scenes)

---

## D01 — AudioManager: Web Audio API Singleton Over Audio Files

**Status:** Accepted

**Context:** Doomloop needs a centralized audio system supporting distinct SFX per weapon/enemy/action, background music that intensifies per wave, and volume controls. Options: (a) load audio files (mp3/ogg), (b) synthesize via Web Audio API, (c) use a library like Howler.js.

**Decision:** Build `AudioManager` as a singleton using the Web Audio API directly. All P0 sounds are synthesized via `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `NoiseBuffer`, and `StereoPannerNode`. No external audio files are loaded for P0 features. AudioManager provides `playSFX(name, options)`, `playMusic(name)`, `setVolume(channel, level)`, and `stopAll()`.

**Alternatives considered:**
1. **Howler.js / Tone.js** — Adds ~20 KB gzipped for features we don't need (multi-channel streaming, spatial audio, audio sprite). The Web Audio API directly gives full control with zero dependency cost.
2. **Pre-recorded audio files (mp3/ogg)** — Requires asset pipeline, storage, loading time, and licensing. Synthesized sounds are infinitely customizable, zero download cost, and don't need licensing.
3. **AudioCraft-generated sounds** — Original Sprint 2 plan was to use AudioCraft for generation, but that generates static audio files that still need playback infrastructure. AudioCraft is a generation tool, not a playback tool. Synthesis via Web Audio API covers playback natively.

**Consequences:** Zero new npm dependencies. All sounds are code-generated, reproducible, and adjustable at runtime. The AudioManager uses lazy node creation (create oscillator/gain on first use, cache if reused). Must handle AudioContext autoplay policies (suspended → resumed on user interaction). Estimated code: ~300–400 lines for AudioManager + ~200 lines for sound definitions in a sound config file. Audio file loading (P1 feature A09) is a pluggable fallback.

---

## D02 — Sound Synthesis: Procedural Per-Sound Functions Over Monolithic Synth

**Status:** Accepted

**Context:** 20+ distinct sounds are needed (weapon fire×4, enemy hurt×5, enemy death×5, boss roar, footsteps, impacts, explosions, music layers, streak callouts). Each has different oscillator, filter, gain envelope, and duration requirements.

**Decision:** Each sound type is a separate function or factory that returns a `ScheduledSound` object (containing oscillator/filter/gain node references with pre-configured parameters). Sound definitions live in a `SoundDefs.ts` file as a dictionary mapping sound names to factory functions. `playSFX('shotgun_fire')` looks up the factory, creates the nodes, schedules the envelope, and returns a handle for optional early-stop.

**Alternatives considered:**
1. **Single uber-synth with parameter tables** — Would create a giant switch/if-else for every possible parameter combination. Hard to maintain, hard to tune individual sounds.
2. **Web Audio `AudioWorklet`** — Overkill for synthesized beeps/booms. AudioWorklet is for latency-critical real-time processing. Our requirements (< 50ms) are easily met with main-thread Web Audio API.
3. **Pre-compiled AudioBuffer per sound** — Would need to generate and cache buffers. More complex than live oscillator scheduling, and we lose the ability to modulate parameters in real-time (e.g., pitch shift for combo streaks).

**Consequences:** Each sound is easy to author, test, and tune independently. Estimated: 20–25 sound functions, each 10–30 lines. New sounds can be added by dropping a new function into `SoundDefs.ts`. Performance: creating oscillator/gain nodes per sound is fast (< 1ms) on modern browsers; GC pressure from short-lived nodes is negligible at the rate sounds are triggered.

---

## D03 — Background Music: Layered Synthesized Tracks Over Looped Audio

**Status:** Accepted

**Context:** Background music must intensify through 5 waves and support arena-specific themes. Options: (a) looped audio file per wave, (b) procedural layered synthesis with per-wave triggers.

**Decision:** BGM uses layered synthesis: Wave 1 = drone oscillator (low sawtooth, 55Hz, low-pass filtered). Wave 2 adds percussion (noise-based kick drum via oscillator sweep). Wave 3 adds bass (triangle wave). Wave 4 adds lead melody (square wave arpeggio). Wave 5 adds distortion + tempo increase (1.2x playback rate on all layers). Each layer is a continuous oscillator node with gain envelope gates. Arena themes change oscillator types (square organ for Fortress, sawtooth distortion for Cavern, sine+delay for Nexus).

**Alternatives considered:**
1. **Procedural MIDI-style sequencer** — More complex state machine (note sequences, timing). The ambient/drone style doesn't need melody sequencing for the base layers; sustained oscillators with filter modulation achieve the desired atmosphere with simpler code.
2. **Single pre-recorded track per arena** — Cannot smoothly layer per wave. Would need 5 tracks per arena × 3 arenas = 15 audio files. File loading, licensing, and crossfade complexity outweighs the simplicity of synthesis.
3. **Tone.js / Web Audio API sequencer** — Adds ~15 KB for features (scheduler, transport) we don't need. Our layers are continuous oscillators, not sequenced notes.

**Consequences:** ~200 lines of code for all BGM. Layer transitions via 0.5s cross-fade (ramp gain up/down). Each arena theme is ~30 lines of oscillator configuration. No file loading, no asset management. If procedural music sounds too "synthetic," adding a reverb/delay effect would be a simple extension.

---

## D04 — Weapon Interface: Abstract Class Over ECS or Trait System

**Status:** Accepted

**Context:** The existing `PlasmaRifle.ts` is a standalone weapon class. Sprint 4 adds 3 more weapon types (Shotgun, SMG, Rocket Launcher) with shared behavior (fire rate, ammo, projectile creation) and weapon-specific behavior (spread, AoE, auto-fire).

**Decision:** Create an abstract `Weapon` class in `src/weapons/Weapon.ts`. All weapon implementations extend it. Shared logic (fire cooldown tracking, ammo management, projectile spawning) lives in the base class. Weapon-specific behavior (spread calculation, explosion on impact, auto-fire) is implemented in subclasses via virtual methods.

**Alternatives considered:**
1. **Component-based (ECS-lite)** — Would over-complicate for 4 weapon types. Each weapon is defined by a small set of data (damage, fireRate, spread, ammo) and one variant behavior (onHit). An abstract class + type switch is cleaner.
2. **Data-driven (JSON config + generic weapon handler)** — All weapon behavior would be encoded in JSON with callbacks for onHit/onFire. Powerful but harder to debug, harder for AI agents to extend, and the behavior differences (spread calculation, explosion AoE) aren't easily data-driven without embedded functions.
3. **Strategy pattern** — fire() and onHit() as strategy interfaces. Could be useful if we expect to compose weapon behaviors, but 4 weapons with fixed behaviors don't need composition flexibility.

**Consequences:** Clean inheritance hierarchy. PlasmaRifle needs minor refactoring to extend Weapon. New weapons = new file extending Weapon + adding to weapon registry in Constants.ts. The `Player.weapons` array and `currentWeaponIndex` pattern from `Player.ts` replaces the single `PlasmaRifle` reference.

---

## D05 — Ammo System: Per-Weapon Depletion Over Global Pool

**Status:** Accepted

**Context:** Weapons need resource management. Options: (a) global ammo pool shared across weapons, (b) per-weapon ammo counters.

**Decision:** Each weapon tracks its own `ammo` and `maxAmmo`. Ammo is consumed per-shot. When ammo = 0, `fire()` returns false. Ammo pickups restore per-weapon amounts. Large ammo pickups restore all weapons to 50% max. This creates meaningful weapon-switching gameplay (burn through SMG ammo → switch to Shotgun).

**Alternatives considered:**
1. **Global ammo pool** — Less interesting gameplay (no reason to switch weapons based on ammo). Would need complex rules about which weapon consumes how much from the pool.
2. **Infinite ammo** — Removes resource management entirely. Simplifies implementation but reduces strategic depth. Shotgun + Rocket Launcher with infinite ammo would trivialize the game.
3. **Heat/overheat system** — Interesting alternative (used in games like Aliens: Fireteam Elite) but adds complexity (heat gauge, cooldown mechanic) that doesn't match Doom's "find more ammo" identity.

**Consequences:** Each weapon subclass tracks its own ammo. Constants.ts stores maxAmmo per weapon. Pickup system needs to know how much ammo each weapon gets. HUD shows per-weapon ammo. Simple, familiar, and player-expected.

---

## D06 — Power-Up System: Simple Timer-Based Effects Over Complex Buff System

**Status:** Accepted

**Context:** 4 power-up types (Speed Boost, Double Damage, Shield, Health Pack) with different effects, durations, and visuals. Some are timed (speed, damage, shield), one is instant (health).

**Decision:** Power-ups are implemented as a `PowerUpManager` that tracks active effects as `{type, duration, timer}` objects. On collection: apply effect immediately (set player state flags: `player.speedBoosted = true`, set timeout). On timer expiry: revert effect. HUD shows active power-up icons with countdown bars. Health Pack is a special case (instant heal, no timer).

**Alternatives considered:**
1. **ECS buff/debuff component system** — Over-engineered for 4 simple timed effects. A state flag + timer is the simplest correct approach.
2. **Modifier stack** — Allows stacking multiple of the same type. Rejected because the PRD explicitly says "stacking resets timer, not magnitude." Complex stack tracking (additive vs multiplicative) would be needed for future power-ups, not for Sprint 4.
3. **Scriptable buff definitions** — JSON-defined duration, effect function, visual function. Elegant but premature for 4 effects. If Sprint 5 adds 10+ power-ups, refactor to data-driven then.

**Consequences:** ~100 lines for PowerUpManager + ~50 lines per power-up effect integration into Player.ts/Weapon.ts. Power-ups are injected into the game loop through PowerUpManager.update(dt) (tick timers, spawn logic). Player.ts gains boolean/setter flags for each effect type.

---

## D07 — Score System: In-Memory With localStorage High Score

**Status:** Accepted

**Context:** Need score tracking, combo multiplier, kill streak callouts, and high score persistence.

**Decision:** `ScoreManager` is a standalone module (not an entity). Tracks `score`, `combo`, `comboTimer`, `enemiesKilled`, `highScore`. On `registerKill(enemyType)`: calculates points × combo multiplier, increments combo, resets combo timer, checks streak thresholds for callout display. On player death: compare score to high score, persist if higher. High score stored in localStorage under `doomloop_high_score`.

**Alternatives considered:**
1. **Backend leaderboard** — Requires server, database, auth, anti-cheat. Overkill for a single-player arcade game. localStorage is zero-latency, works offline, and matches the existing pattern from Sprint 2/3 settings.
2. **Score as part of Game.ts** — Would bloat Game.ts. ScoreManager is a clear separate concern with its own update loop and event firing (kill registered, streak achieved, high score broken).
3. **Combo as damage multiplier** — Some games make combo affect damage output. Rejected for Sprint 4 — purely score-based combo keeps the system simpler and doesn't unbalance combat.

**Consequences:** ScoreManager is ~150 lines. Combo timer integration with HUD (combo bar). Kill streak callout integration with HTML overlay. High score persistence adds ~20 lines. Score resets on full game restart (R key or new game) but persists across arena transitions.

---

## D08 — New Enemy Types: Direct Entity Subclasses Over AI State Machine Framework

**Status:** Accepted

**Context:** Sprint 4 adds 3 new enemy types (Shooter Imp, Exploder, Flyer) with distinct AI behaviors. The existing Imp and Boss are direct Entity subclasses with hardcoded AI in their `update()` methods.

**Decision:** Each new enemy type is a direct subclass of `Entity` (via an `Enemy` intermediate that provides shared enemy utilities). AI is implemented in `update(dt)` as a simple state machine (2–4 states per enemy) using if/switch statements. No generic AI framework or behavior tree library.

**Alternatives considered:**
1. **Behavior tree library (e.g., `behaviortree.js`)** — Adds a ~10 KB dependency. Behavior trees shine for complex AI with 10+ states and interruptible actions. For 3 enemies with 2-4 states each (idle, chase, attack, flee), inline state machines are clearer and cheaper.
2. **Finite State Machine (FSM) framework** — Could build or import a generic FSM. Again, overkill. Each enemy's states are simple enough that a `switch(currentState)` inside `update()` is the most readable approach.
3. **Shared Enemy AI (strategy pattern)** — Make AI a strategy interface that enemies compose. Would work but adds indirection. The enemies share almost no AI logic (Shooter Imp runs to range and fires, Exploder rushes directly, Flyer flies in sine waves). The only shared code is "move toward player" which is a utility function.

**Consequences:** 3 new files: `ShooterImp.ts`, `Exploder.ts`, `Flyer.ts`, each 80–150 lines. Enemy collision masks: Flyer uses a separate mask (0x010, reserved in Sprint 1) since it flies above ground effects and doesn't collide with traps. `Entity.ts` gains abstract `takeDamage(amount)` and `die()` methods to standardize enemy death behavior.

---

## D09 — Multiple Arenas: Arena Variant Data Over Full Procedural Engine

**Status:** Accepted

**Context:** 3 distinct arena themes (Stone Fortress, Lava Cavern, Void Nexus) with different visual styles. The existing `ArenaGenerator.ts` creates procedural layouts from a seed. Options: (a) extend ArenaGenerator with theme-aware generation, (b) hand-author 3 arena layouts, (c) mix (themed procedural generation).

**Decision:** Create an `ArenaTheme` data structure in `ArenaConfig.ts` that defines all per-arena visual properties: wall/floor/pillar colors, lighting (ambient/directional/fog), pillar types, decorative elements, size, and special features (lava pools, floating debris, etc.). `ArenaGenerator` takes an `ArenaTheme` parameter and generates layout geometry that respects the theme. The procedural layout algorithm (pillar placement, spawn points, dimensions) stays the same; only the visual rendering changes.

**Alternatives considered:**
1. **3 completely hand-authored arenas** — Provides the most control over visual quality but is inflexible. Each arena would require manual mesh placement, UV mapping, and physics body creation.
2. **Arena loader (glTF/JSON)** — 3 arena files loaded from disk. Would need an asset pipeline, file management, and loading orchestration. Too much infrastructure for what's essentially 3 visual themes over the same procedural layout.
3. **Single arena with color swaps** — Too cheap. The arenas need to feel distinct (lava cracks, crystal pillars, star floor) not just different colors on the same boxes.

**Consequences:** `ArenaTheme` interface has ~20 properties. `ArenaGenerator.generate(layout, theme)` applies theme colors/materials during mesh creation. `ArenaMesh.ts` gains branch logic to add theme-specific decoration (lava pools, crystals, torches). Arena selection at game start picks a random `ArenaTheme`. This is extensible to add more arenas by adding more theme config objects.

---

## D10 — Arena Portal Transitions: CSS Fade + Scene Rebuild Over In-Place Mesh Swapping

**Status:** Accepted

**Context:** When the player completes 5 waves, they need to move to a new arena. Options: (a) fade out → destroy scene → fade in, (b) smooth mesh transition (morph geometries), (c) seamless streaming.

**Decision:** Use a two-phase fade: (1) CSS overlay fades to opaque white over 0.5s (existing overlay mechanism), (2) destroy current arena (dispose Three.js geometries, remove physics bodies, clear entity arrays), (3) generate new arena with new theme, rebuild generation + meshes, (4) CSS overlay fades to transparent over 0.5s. Player health, weapons, ammo, score persist (serialized to a `GameState` object before teardown, restored after load).

**Alternatives considered:**
1. **In-place mesh replacement** — Swap each mesh material/texture to the new theme. Complex (different geometry types, pillar shapes change, floor patterns differ). Would need 3x the mesh data loaded simultaneously.
2. **Progressive loading (streaming)** — Load next arena while fighting last wave. More complex async loading pattern. Given that arena generation takes < 100ms (it's procedural geometry, not asset loading), the fade + rebuild approach is simpler and the player won't notice a delay.
3. **Portal walk-through (continuous)** — A visual corridor/doorway that the player walks through to reach the next arena. Would need two scenes rendered simultaneously or a loading corridor. Fade is simpler and more reliable.

**Consequences:** ~50 lines for transition orchestration in Game.ts. Player state serialization adds ~20 lines. The portal mesh itself (torus/ring) is a Three.js primitive with animated material (rotating UV offset). Portal appears in the arena center after wave 5 completion.

---

## D11 — Mini-Map: HTML5 Canvas Overlay Over Three.js/Renderer Approach

**Status:** Accepted

**Context:** A mini-map showing arena layout, player position, enemies, and pickups. Options: (a) HTML5 Canvas 2D overlay, (b) second Three.js camera (top-down render to a small viewport), (c) DOM elements positioned by coordinate math.

**Decision:** HTML5 Canvas 2D overlay. A fixed-position `<canvas>` element with `pointer-events: none` is rendered each frame using 2D context primitives (rectangles, arcs, paths). The canvas clears and redraws every frame.

**Alternatives considered:**
1. **Second Three.js camera (render target)** — Would render the full 3D scene from top-down to a small render target. This doubles the rendering work per frame and can hit performance hard on mobile. For a simple 2D icon-map, this is overkill.
2. **DOM element positioning** — Position dot/icon elements with CSS transforms based on coordinate math. Works but causes DOM thrash (updating 10+ element positions every frame). Canvas is lighter.
3. **Pre-rendered arena map texture** — Render arena layout once, then overlay dynamic elements. Saves redrawing the static parts each frame. Could be a P1 optimization if FPS concerns arise.

**Consequences:** `<canvas>` element created in HUD setup. MiniMap class with `update(playerPos, enemies, pickups, arenaBounds)` called from GameLoop's HUD update phase. Canvas size: 120x120 (desktop), 80x80 (mobile). Rendering is a simple 2D projection: `screenX = (entity.x - player.x) / arenaWidth * canvasSize + canvasSize/2`. Must handle map rotation (rotate canvas context by player heading). Estimated: ~100 lines for MiniMap class.

---

## D12 — Particle Effects: Object-Pooled Three.js Points Over Per-Event Geometry

**Status:** Accepted

**Context:** Multiple particle systems (muzzle flash, explosions, shell casings, death bursts) fire frequently during combat. Creating and destroying Three.js objects per event causes GC pressure and frame drops on mobile.

**Decision:** Each particle type has an object pool. Pre-allocate a fixed number of particle instances (e.g., 100 for muzzle flashes, 50 for explosions, 30 for shell casings). When a particle effect needs to spawn: grab available particles from the pool, configure their properties (position, velocity, color, lifetime), mark as active. In the game loop: update active particles (move, age), mark expired particles as available (reset to pool). Shell casings use Cannon-es physics bodies in the pool (pre-created, repositioned on reuse).

**Alternatives considered:**
1. **Create/destroy per event** — Simple but creates GC churn. Cannon-es body creation is especially expensive.
2. **Single giant particle system** — A single THREE.Points geometry with all particles. Harder to manage multiple independent effects (muzzle flash vs explosion vs death burst) with different lifetimes and colors in one buffer.
3. **Sprite-based particles** — Billboarding sprites. Three.js Points are simpler and more performant for small dot particles. Sprites add texture loading and alpha blending cost.

**Consequences:** `ParticlePool.ts` generic pool class (~60 lines). Each particle system type owns a pool. Pools initialized in Game init. Particle update in the game loop (after physics step, before render). Mobile: reduce pool sizes by 50% to save GPU memory. Shell casing pool max: 30 casings. Explosion pool: 10 explosion instances (20-40 particles each = 400 particles max).

---

## D13 — Interactive Arena Elements: Physics-Triggered Game Logic Over Event-Bus

**Status:** Accepted

**Context:** Trap zones and supply stations need to detect player/enemy proximity and trigger effects. Options: (a) Cannon-es trigger volumes (sensor bodies), (b) distance checks in update loop, (c) raycasts.

**Decision:** Use simple distance checks in the game loop for trap zones and supply stations. Each trap/station has a `position` and `activationRadius`. In each frame's update step: iterate trap zones, check distance to all entities (player and enemies) that have physics bodies within the activation radius, trigger the zone's effect if not on cooldown.

**Alternatives considered:**
1. **Cannon-es sensor bodies (ghost triggers)** — More "correct" physics integration but requires adding invisible physics bodies to the world and listening for collide events. The distance check approach is simpler and the performance cost (distance check to 2-4 zones × 15 enemies = 60-80 squared-distance calculations per frame) is negligible.
2. **Event bus — zones emit enter/exit events** — Better for many zones (10+). Over-engineered for 2-4 zones per arena. Simple distance checks in a loop are clearer.
3. **AABB overlap via Cannon-es broadphase** — Would need to add the trigger to the broadphase. More integration than needed.

**Consequences:** `InteractiveElement.ts` base class or interface: `{ position, radius, cooldown, isReady, activate(entity), update(dt) }`. TrapZone and SupplyStation implement this. Game.ts holds an `interactiveElements: InteractiveElement[]` array and calls check/update during the fixed-timestep loop. The interaction button for supply stations on mobile reuses the same UI pattern as the weapon bar (appears near fire button when in range).

---

## D14 — Difficulty System: Multiplier Config Constants Over Per-Difficulty Game Objects

**Status:** Accepted

**Context:** 3 difficulty levels (Easy, Normal, Hard) affecting enemy health, damage, count, power-up duration, and score multiplier.

**Decision:** Difficulty is a set of multiplier constants in `Constants.ts`: `DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig>`. Game.ts reads the selected difficulty's config at start and applies multipliers where relevant: `enemy.maxHp * diff.enemyHealthMultiplier`, `projectile.damage * diff.enemyDamageMultiplier`, `waveDef.enemyCount * diff.waveCountMultiplier`, `powerUp.duration * diff.powerUpDuration`.

**Alternatives considered:**
1. **3 separate wave definitions** — Would triple the WaveConfig data and make balancing harder (tuning Normal would need corresponding tune of Easy and Hard).
2. **Per-difficulty entity subclasses** — EasyImp, NormalImp, HardImp. Absurd amount of code duplication.
3. **Scripted difficulty that scales dynamically** — Adaptive difficulty based on player performance. Would be Sprint 5+ work. For Sprint 4, static multiplier-based difficulty is simpler and more predictable.

**Consequences:** ~30 lines for config object. Multiplier application scattered across several files (WaveManager for count, Entity constructor for HP, Projectile for damage, PowerUpManager for duration, ScoreManager for score). Each application point is a single multiplication. Difficulty selection on start screen adds ~30 lines of HTML/CSS/JS.

---

## D15 — File & Package Scope (No New Dependencies)

**Status:** Accepted

**Context:** Sprint 4 adds significant new subsystems (audio, weapons, power-ups, score, particles, mini-map, interactive elements). Need to organize new code clearly without bloating existing files.

**Decision:** New files organized as follows:

```
src/
├── audio/
│   ├── AudioManager.ts          # Singleton audio controller
│   ├── SoundDefs.ts             # Per-sound factory functions
│   └── MusicLayer.ts            # BGM layer oscillator management
├── weapons/
│   ├── Weapon.ts                # Abstract weapon base class
│   ├── PlasmaRifle.ts           # Refactored (extends Weapon)
│   ├── Shotgun.ts               # New (extends Weapon)
│   ├── SMG.ts                   # New (extends Weapon)
│   ├── RocketLauncher.ts        # New (extends Weapon)
│   └── WeaponPickup.ts          # Weapon pickup spawner logic
├── entities/
│   ├── ShooterImp.ts            # New ranged enemy
│   ├── Exploder.ts              # New self-destruct enemy
│   └── Flyer.ts                 # New aerial enemy
├── gameplay/
│   ├── PowerUpManager.ts        # Power-up spawning and active effect tracking
│   ├── ScoreManager.ts          # Score, combo, kill streak callouts
│   └── Difficulty.ts            # Difficulty config and selection state
├── arena/
│   ├── ArenaTheme.ts            # Arena visual configuration
│   ├── TrapZone.ts              # Trap zone logic
│   └── SupplyStation.ts         # Supply station logic
├── effects/
│   ├── ParticlePool.ts          # Generic object pool for particles
│   ├── MuzzleFlash.ts           # Per-weapon muzzle flash effects
│   ├── ShellCasing.ts           # Shell casing particle system
│   └── DeathBurst.ts            # Per-enemy death burst effects
├── hud/
│   ├── MiniMap.ts               # Canvas-based mini-map
│   ├── WeaponHUD.ts             # Weapon bar + ammo display
│   └── ComboDisplay.ts          # Combo bar + streak callouts
└── utils/
    └── Constants.ts             # Extended with all new tunable values
```

**Decision:** Zero new npm dependencies. All new features use:
- Web Audio API (AudioManager, SoundDefs)
- Three.js already in the project (particles using THREE.Points, mesh effects, PointLight)
- Cannon-es already in the project (shell casing physics, trigger volumes via distance check)
- HTML5 Canvas (MiniMap, no new lib)
- HTML/CSS overlays (WeaponHUD, ComboDisplay, kill streak callouts)

**Alternatives considered:**
1. **Tone.js** — Audio library. Adds ~20 KB gzipped. Our synth needs are simple enough for raw Web Audio API.
2. **three-nebula** — Three.js particle library. Overkill for simple Points-based particles.
3. **Stats.js** — FPS counter. Could be helpful for perf debugging but not needed in production.

**Consequences:** Bundle size increase ≤ 50 KB gzipped (estimated: 35 KB for all TypeScript sources). Zero new library maintenance burden. All AudioContext usage is wrapped in AudioManager — no direct Web Audio API calls outside it.

---

## D16 — Mobile Adaptations (No Desktop Regressions)

**Status:** Accepted

**Context:** All Sprint 4 features must work on both desktop (keyboard + mouse) and mobile (touch). The existing InputAdapter pattern (Sprint 2) dispatches input through a unified interface.

**Decision:** For each new mobile interaction:
- **Weapon bar**: DOM overlay (like existing touch controls), positioned above fire button. Tap-based switching.
- **Supply station**: On-screen "Interact" button appears near fire button when in range of a station.
- **Mini-map**: Same canvas element, sized smaller (80x80px), positioned top-right respecting safe areas.
- **Kill streak callouts / HUD**: Same HTML overlay, font sizes scaled down via CSS media query.
- **Mobile detection**: Existing `isTouchDevice()` from Sprint 2 remains the gate.

Desktop code paths are never modified. No touch DOM elements are created on desktop (`if (!isTouchDevice) return` guards in all touch-UI constructors). The existing Sprint 3 touch polish (safe areas, gesture suppression, haptics, settings) is preserved.

**Alternatives considered:**
1. **Responsive single UI** — One set of elements that respond to pointer type. Buttons like "Press E" shouldn't appear on mobile, and touch-only elements (weapon bar) shouldn't appear on desktop. Separate DOM creation per device type is cleaner.
2. **Universal keybinding** — Always show key hints as numbers (1-4) AND as touch icons. Confusing. Both sets of hints shown based on device detection is clearer.

**Consequences:** Touch controls total DOM grows by ~10 elements (4 weapon icons, 1 interaction button, mini-map canvas). No existing touch elements are modified (positions, safe areas, fade logic all unchanged). Desktop bundle gets zero new DOM for touch-only features (tree-shaken or conditionally loaded).
