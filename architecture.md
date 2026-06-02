# Doomloop — Architecture Document (Sprint 1)

> **Language:** TypeScript (see D10 resolution below)
> **Rendering:** Three.js r160+
> **Physics:** Cannon-es
> **Build:** Vite 5+
> **Deployment:** Static host (Vercel / Netlify / GitHub Pages)

---

## 1. Project Structure

```
doomloop/
├── index.html                  # Vite entry HTML (mounts #app)
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies: three, cannon-es, vite, typescript
├── .gitignore
│
└── src/
    ├── main.ts                 # Bootstrap: loading screen → Three.js boot → game start
    │
    ├── Game.ts                 # Top-level orchestrator. Owns: scene, camera, physics,
    │                           # wave manager, HUD, entity registry. Runs the game loop.
    │
    ├── engine/
    │   ├── GameLoop.ts         # Fixed-timestep loop (accumulator pattern).
    │   │                       # Order: input → entity update → physics step → render
    │   ├── InputManager.ts     # Keyboard state map + mouse deltas (Pointer Lock API).
    │   │                       # Publishes actions: move, look, sprint, jump, fire.
    │   └── Camera.ts           # PerspectiveCamera wrapper. FOV management (sprint kick),
    │                           # camera bob, pitch/yaw limits.
    │
    ├── physics/
    │   └── PhysicsWorld.ts     # CANNON.World wrapper. Bodies, materials, contacts.
    │                           # Fixed 1/60s step. Syncs Three.js meshes to body positions.
    │
    ├── arena/
    │   ├── ArenaGenerator.ts   # Seeded RNG → ArenaLayout data (walls, pillars, spawn points).
    │   └── ArenaMesh.ts        # ArenaLayout → Three.js mesh group (floor, walls, pillars).
    │
    ├── entities/
    │   ├── Entity.ts           # Abstract base: mesh, body, health, isAlive, update().
    │   ├── Player.ts           # WASD movement, acceleration curve, sprint, jump.
    │   ├── Imp.ts              # Melee charger — moves toward player on each frame.
    │   ├── Boss.ts             # Ranged attacker — faces player, fires every 2s.
    │   ├── Projectile.ts       # Generic projectile: speed, damage, owner, lifetime.
    │   └── HealthPack.ts       # Pickup item: healAmount, consumed on player contact.
    │
    ├── weapons/
    │   └── PlasmaRifle.ts      # Fire rate (250ms), spawns Projectile, crosshair bloom.
    │
    ├── waves/
    │   ├── WaveManager.ts      # State machine: spawning → fighting → intermission → next/victory.
    │   └── WaveConfig.ts       # Wave definitions: enemy count per wave, boss flag.
    │
    ├── hud/
    │   ├── HUD.ts              # HP bar, wave counter, kill count — all HTML/CSS overlay.
    │   ├── Crosshair.ts        # SVG-based crosshair with bloom on fire.
    │   └── OverlayScreen.ts    # Start prompt, death screen, victory screen (HTML).
    │
    ├── effects/
    │   ├── DamageFlash.ts      # Red vignette overlay on player damage.
    │   ├── HitMarker.ts        # Brief X flash on crosshair when hitting enemy.
    │   ├── DeathEffect.ts      # Imp/Boss fragmentation burst (Three.js geometry shards).
    │   └── ScreenShake.ts      # Camera shake on boss death / big impacts.
    │
    └── utils/
        ├── RNG.ts              # Seeded PRNG (mulberry32). Deterministic arena generation.
        └── Constants.ts        # All tunable game values in one place.
```

### Module Dependencies (Import Graph)

```
main.ts ──→ Game.ts ──→ GameLoop.ts
                  ├──→ InputManager.ts
                  ├──→ Camera.ts
                  ├──→ PhysicsWorld.ts
                  ├──→ ArenaGenerator.ts → ArenaMesh.ts
                  ├──→ Player.ts → PlasmaRifle.ts → Projectile.ts
                  ├──→ Imp.ts / Boss.ts / HealthPack.ts
                  ├──→ WaveManager.ts → WaveConfig.ts
                  ├──→ HUD.ts / Crosshair.ts / OverlayScreen.ts
                  └──→ effects/*.ts
```

`Game.ts` is the single orchestration hub. All modules are injectable / replaceable for testing.

---

## 2. Entity System

### 2.1 Class Hierarchy (not ECS)

Sprint 1 has exactly **6 entity types** — ECS overhead (component registration, system queries, archetype fragments) is not justified. A **class hierarchy with composition** is simpler, faster for AI code generation, and easier to reason about.

```
Entity (abstract)
├── mesh: THREE.Mesh | THREE.Group
├── body: CANNON.Body
├── isAlive: boolean
├── abstract update(dt: number): void
│
├── Player
│   ├── health: number (100)
│   ├── movement: Velocity-based input → acceleration curve → body.velocity
│   ├── weapon: PlasmaRifle (owned, created with player)
│   └── grounded: boolean (for jump gating)
│
├── Imp (extends Enemy — shared enemy AI utilities)
│   ├── health: 3
│   ├── speed: ~80% of player sprint speed
│   ├── contactDamage: 10
│   └── AI: chase → Player.position each frame
│
├── Boss (extends Enemy)
│   ├── health: 15
│   ├── moveSpeed: ~50% of player walk speed
│   ├── rangedDamage: 15
│   ├── fireCooldown: 2s
│   └── AI: strafe toward player, fire projectile every 2s
│
├── Projectile
│   ├── speed: number (100 for player, 60 for boss)
│   ├── damage: number (1 for player, 15 for boss)
│   ├── owner: 'player' | 'boss'
│   ├── lifetime: 3s (auto-destroy after timeout)
│   └── mesh: Energy bolt mesh (glowing sphere + trail particle)
│
└── HealthPack
    ├── healAmount: 25
    ├── consumed: boolean (on player contact)
    └── mesh: Green glowing cylinder
```

### 2.2 Entity Registry

Game.ts maintains flat arrays:

```typescript
class Game {
  entities: Entity[];               // All alive entities
  player: Player;                   // Singleton reference
  enemies: Enemy[];                 // Imps + Boss (for wave checking)
  projectiles: Projectile[];        // Player + enemy projectiles
  healthPacks: HealthPack[];        // Current wave's health packs
  pendingRemovals: Entity[];        // Entities to remove at end of frame
}
```

Entities are added at spawn time, removed at end-of-frame after iterating. This prevents mid-iteration array mutation bugs.

### 2.3 Entity Lifecycle

```
Spawn → Add to registry → GameLoop.update() each frame → 
Death (isAlive=false) → DeathEffect → pendingRemovals → Removed from registry → GC
```

---

## 3. Physics Integration

### 3.1 Fixed Timestep + Variable Render

The classic **accumulator pattern** ensures deterministic physics regardless of display refresh rate:

```typescript
class GameLoop {
  private readonly FIXED_DT = 1 / 60;       // 16.67ms physics step
  private readonly MAX_FRAME = 0.1;          // Cap at 100ms to prevent spiral of death
  private accumulator = 0;

  frame(time: number): void {
    const dt = Math.min(time - this.lastTime, this.MAX_FRAME);
    this.lastTime = time;
    this.accumulator += dt;

    // Fixed-timestep updates
    while (this.accumulator >= this.FIXED_DT) {
      this.inputManager.update();
      this.player.update(this.FIXED_DT);
      this.enemies.forEach(e => e.update(this.FIXED_DT));
      this.projectiles.forEach(p => p.update(this.FIXED_DT));
      this.waveManager.update(this.FIXED_DT);
      this.physicsWorld.step(this.FIXED_DT);
      this.handleCollisions();              // Process contact events from this step
      this.flushRemovals();
      this.accumulator -= this.FIXED_DT;
    }

    // Variable-rate render (interpolated alpha for smooth visuals)
    const alpha = this.accumulator / this.FIXED_DT;
    this.syncTransforms(alpha);             // Interpolate mesh positions between physics steps
    this.camera.update();
    this.hud.update();
    this.renderer.render(this.scene, this.camera);
  }
}
```

### 3.2 Cannon-es Setup

```typescript
const physics = new CANNON.World();
physics.gravity.set(0, -30, 0);           // Tunable gravity
physics.broadphase = new CANNON.NaiveBroadphase();
physics.allowSleep = true;
physics.solver.iterations = 5;            // Performance vs accuracy tradeoff
```

### 3.3 Collision Groups (Bitmask)

| Group | Mask | Name | Collides With |
|-------|------|------|---------------|
| 0x001 | 1 | Player | Arena (2), Enemies (4), HP (32), BossProjectiles (64) |
| 0x002 | 2 | Arena (walls/floor/pillars) | Player (1), Enemies (4), AllProjectiles (8+64) |
| 0x004 | 4 | Enemies (Imps + Boss) | Player (1), Arena (2), PlayerProjectiles (8) |
| 0x008 | 8 | PlayerProjectiles | Arena (2), Enemies (4) |
| 0x010 | 16 | (reserved) | — |
| 0x020 | 32 | HealthPacks | Player (1) |
| 0x040 | 64 | BossProjectiles | Player (1), Arena (2) |

**Collision Matrix:**

| | Player (1) | Arena (2) | Enemies (4) | PlayerProj (8) | HPacks (32) | BossProj (64) |
|---|---|---|---|---|---|---|
| **Player** | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Arena** | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ |
| **Enemies** | ✓ | ✓ | ✗ (let overlap) | ✓ | ✗ | ✗ |
| **PlayerProj** | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **HPacks** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **BossProj** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

### 3.4 Contact Event Handling

Cannon-es `collide` events dispatch to handlers:

```
PhysicsWorld.on('collide', (event) => {
  const bodyA = event.body;
  const bodyB = event.target;
  const entityA = bodyA.userData.entity;  // Back-reference to game Entity
  const entityB = bodyB.userData.entity;

  // Dispatch to type-specific handler
  CollisionDispatcher.dispatch(entityA, entityB);
});
```

**Contact Handlers:**

| Pair | Handler | Effect |
|------|---------|--------|
| Player ↔ Imp | `contactDamage(entityA, entityB, 10)` | Player HP -= 10, Imp knockback 0.5s |
| Player ↔ HealthPack | `heal(entityA, entityB, 25)` | Player HP += 25 (cap 100), remove HP |
| PlayerProjectile ↔ Imp | `applyDamage(projectile, imp, 1)` | Imp HP -= 1, destroy projectile |
| PlayerProjectile ↔ Boss | `applyDamage(projectile, boss, 1)` | Boss HP -= 1, destroy projectile |
| BossProjectile ↔ Player | `applyDamage(projectile, player, 15)` | Player HP -= 15, destroy projectile |
| Projectile ↔ Arena | `destroyProjectile(projectile)` | Remove projectile, wall spark effect |

### 3.5 Transform Sync Pattern

After each physics step, sync Three.js meshes to Cannon-es body positions:

```typescript
entity.mesh.position.copy(entity.body.position as any);
entity.mesh.quaternion.copy(entity.body.quaternion as any);
```

For smooth rendering between physics steps, apply interpolation:

```typescript
const interpPos = new THREE.Vector3().lerpVectors(
  entity.body.previousPosition,
  entity.body.position,
  alpha
);
entity.mesh.position.copy(interpPos);
```

---

## 4. Procedural Arena Generation

### 4.1 Seeded RNG

Use **mulberry32** — simple, fast, deterministic 32-bit PRNG:

```typescript
class RNG {
  private state: number;
  constructor(seed: number) { this.state = seed; }
  next(): number { /* mulberry32 algorithm */ }
  nextRange(min: number, max: number): number { /* returns float in [min, max) */ }
  nextInt(min: number, max: number): number { /* inclusive integer */ }
  nextBool(probability: number = 0.5): boolean { /* weighted coin flip */ }
}
```

Seed source: `Date.now() + Math.random()` at game start. Player can't re-use same seed without explicit feature (Sprint 3+).

### 4.2 ArenaLayout Data Structure

```typescript
interface ArenaLayout {
  seed: number;
  size: { width: number; depth: number; };            // 40 x 40
  walls: WallDef[];                                    // 4 walls
  pillars: PillarDef[];                                // 4–8 pillars
  healthPackPositions: THREE.Vector3[];                // 3 fixed points
  enemySpawnPoints: THREE.Vector3[];                   // N points along edges
  playerSpawn: THREE.Vector3;                          // Arena center
  bossSpawn: THREE.Vector3;                            // Arena center (offset)
}

interface WallDef {
  position: [number, number, number];
  size: [number, number, number];                      // width, height, depth
}

interface PillarDef {
  shape: 'box' | 'cylinder';
  position: [number, number, number];
  radius: number;                                       // for cylinders
  size: [number, number];                               // width, depth for boxes
  height: number;
}
```

### 4.3 Generation Algorithm

1. **Floor**: 40x40 PlaneGeometry (or BoxGeometry for thickness), y=0
2. **Walls**: 4 walls, each ~40 units long × 10 units tall × 1 unit thick, positioned at edges
3. **Pillars (4–8)**:
   - Roll count: `rng.nextInt(4, 8)`
   - For each pillar:
     - Shape: `rng.nextBool(0.5)` → box or cylinder
     - Position (x, z): random within inner 32×32 zone (4-unit margin from walls), min 4-unit spacing from player spawn center (3-unit radius exclusion zone)
     - Dimensions vary: boxes 1-3 units wide, cylinders radius 0.5-1.5, heights 3-8 units
4. **Health pack spawns**: 3 fixed positions at (0, 10, 0), (10, 10, -10), (-10, 10, 10) relative to center
5. **Enemy spawn points**: Pre-compute N points along the inner edges of walls (avoid overlap with pillars via rejection sampling)
6. **Player spawn**: Center of arena `(0, 1, 0)` (y=1 for eye height)
7. **Boss spawn**: Slightly offset from center `(0, 1, 5)` — visible on wave 5 start

### 4.4 Three.js Mesh Building

ArenaMesh.ts takes `ArenaLayout` and creates a `THREE.Group`:

- **Floor**: Grid-textured plane (procedural canvas texture — checkerboard or grid lines)
- **Walls**: BoxGeometry with muted low-poly color
- **Pillars**: BoxGeometry or CylinderGeometry with a darker stone color
- **Ceiling**: Optional (Sprint 1 skip if FPS concerns — open top gives an outdoor arena feel)

All meshes use `MeshStandardMaterial` with flat shading (`flatShading: true`) for the low-poly aesthetic.

Cannon-es bodies are created alongside meshes:
- Floor: `CANNON.Plane` (static)
- Walls: `CANNON.Box` (static)
- Pillars: `CANNON.Box` or `CANNON.Cylinder` (static)

---

## 5. Wave State Machine

### 5.1 States

```
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    ▼                                                     │
IDLE → SPAWNING → FIGHTING → INTERMISSION ──────────────┘
                │             │              (back to SPAWNING for next wave)
                │             ▼
                │         VICTORY (after wave 5 boss killed)
                │
                └──→ GAME_OVER (player death at any time)
```

### 5.2 State Details

| State | Entry | During | Exit | Duration |
|-------|-------|--------|------|----------|
| **IDLE** | Game boots, "Click to play" shown | Waiting for user click | Click → SPAWNING | Indefinite |
| **SPAWNING** | Player clicked / intermission ended | Spawn enemies at edge points, show "Wave X incoming!" (2s) | All spawned → FIGHTING | ~2 seconds |
| **FIGHTING** | Enemies spawned | Enemies chase/fight player. Player may die. | All enemies dead → INTERMISSION. Player dead → GAME_OVER | Variable (15s–2min) |
| **INTERMISSION** | All enemies killed | "Wave X complete!" (3s), spawn health packs. Check if wave 5 → VICTORY | Timer expires, next wave exists → SPAWNING | 3 seconds |
| **VICTORY** | Wave 5 boss killed | "VICTORY" screen, celebration particles | Click / R → restart (resets to IDLE) | Indefinite |
| **GAME_OVER** | Player HP = 0 | "YOU DIED — Wave X/5" screen | Click / R → restart (resets to IDLE) | Indefinite |

### 5.3 Wave Definitions

```typescript
const WAVE_DEFS: WaveDef[] = [
  { wave: 1, enemyCount: 3, enemyType: 'imp', hasBoss: false },
  { wave: 2, enemyCount: 5, enemyType: 'imp', hasBoss: false },
  { wave: 3, enemyCount: 7, enemyType: 'imp', hasBoss: false },
  { wave: 4, enemyCount: 10, enemyType: 'imp', hasBoss: false },
  { wave: 5, enemyCount: 0, enemyType: 'none', hasBoss: true },   // Boss only
];
```

### 5.4 WaveManager Interface

```typescript
class WaveManager {
  currentWaveIndex: number;                   // 0-4
  state: WaveState;                           // 'idle' | 'spawning' | 'fighting' | 'intermission' | 'victory' | 'gameOver'
  enemiesAlive: number;                       // decremented on enemy death
  enemiesKilled: number;                      // incremented on enemy death (for HUD)

  startGame(): void;                           // IDLE → SPAWNING
  onEnemyKilled(): void;                       // Called by event system
  onPlayerDeath(): void;                       // GAME_OVER transition
  update(dt: number): void;                    // Timer management for spawning/intermission delays
  getCurrentWaveDef(): WaveDef;
  isLastWave(): boolean;                       // wave 5 check
}
```

---

## 6. Data Flow

### 6.1 Input → Game World

```
Browser Events (keydown/keyup, mousemove, click)
    │
    ▼
InputManager
    ├── keyState: Map<KeyCode, boolean>       // Polled each frame
    ├── mouseDelta: { x: number, y: number }  // Accumulated between frames
    ├── actions: {
    │     fire: boolean,                       // Mouse click this frame
    │     sprint: boolean,                     // Shift held
    │     jump: boolean,                       // Space pressed this frame
    │   }
    │
    ▼
Player.update(dt)
    ├── Read keyState → compute desired velocity direction
    ├── Apply acceleration curve (0.2s to full speed, 0.1s deceleration)
    ├── Apply sprint multiplier (1.5x) if Shift held
    ├── Jump if Space pressed AND grounded
    ├── Set CANNON.Body.velocity
    └── Update Camera (yaw/pitch from mouseDelta)
```

### 6.2 Health/Damage Propagation

```
Contact Event (Cannon-es collide)
    │
    ├── Player ↔ Imp:
    │       player.takeDamage(10)
    │       damageFlash.show()
    │       hud.updateHealth()
    │       if (player.health <= 0) waveManager.onPlayerDeath()
    │
    ├── Player Projectile ↔ Enemy:
    │       enemy.takeDamage(1)
    │       projectile.destroy()
    │       hitMarker.show()
    │       if (enemy.health <= 0) {
    │         deathEffect.play()
    │         waveManager.onEnemyKilled()
    │       }
    │
    ├── Boss Projectile ↔ Player:
    │       player.takeDamage(15)
    │       projectile.destroy()
    │       damageFlash.show()
    │
    └── Player ↔ HealthPack:
            player.heal(25)
            healthPack.destroy()
```

### 6.3 HUD Data Flow

```
HUD.update() ← called every frame from GameLoop
    ├── Read Player.health → HP bar width + text
    ├── Read WaveManager.currentWaveIndex + 1 → "Wave X/5"
    ├── Read WaveManager.enemiesKilled / total → "Y/Z Killed"
    └── Render via DOM manipulation (CSS styled HTML overlay)
```

All HUD is **HTML/CSS overlay** (not Three.js sprites) — simpler to style, text renders at native resolution, no texture atlas needed.

### 6.4 Game Reset Flow

```
Restart (click / R key) → Game.reset()
    ├── Clear entity arrays (GC Three.js meshes, Cannon-es bodies)
    ├── Clear physics world
    ├── Generate new ArenaLayout with new seed
    ├── Build new arena meshes and physics bodies
    ├── Create new Player at center
    ├── Reset WaveManager to IDLE
    └── Show "Click to play" overlay
```

---

## 7. Game Loop Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                        requestAnimationFrame                    │
│                           (GameLoop.frame)                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │  Accumulator += dt  │
                  │  (capped at 100ms)  │
                  └──────────┬──────────┘
                             │
                      ┌──────▼──────┐
                      │ accumulator │
                      │ >= FIXED_DT?│
                      └──┬───────┬──┘
                    Yes   │       │  No
                          ▼       │
            ┌─────────────────────┤
            │ Fixed Step Loop     │
            │ (while acc >= dt)   │
            ├─────────────────────┤
            │ 1. Input.poll()     │
            │ 2. Player.update()  │
            │ 3. Enemies.update() │
            │ 4. Projectiles.update() │
            │ 5. WaveManager.update() │
            │ 6. Physics.step()   │
            │ 7. Collision.events │
            │ 8. Remove dead ents │
            │ accumulator -= dt   │
            └─────────────────────┘
                          │
                          ▼
            ┌─────────────────────────┐
            │ Render Phase           │
            ├─────────────────────────┤
            │ 1. Interpolate meshes  │
            │ 2. Camera.update()     │
            │ 3. HUD.update()        │
            │ 4. Renderer.render()   │
            └─────────────────────────┘
```

---

## 8. D10 Resolution: TypeScript

**Decision: TypeScript.** Rationale given in journal (arch-agent-journal.md) and summarized:

- Three.js + Cannon-es have mature `@types/` packages
- Vector math type safety prevents `Vector3` ↔ `Euler` ↔ `Quaternion` confusion
- Entity interfaces make it clear what state each entity holds
- Vite supports TypeScript with zero config overhead
- Strict mode (`"strict": true` in tsconfig) catches null/undefined bugs at compile time

---

## 9. Performance Strategy

| Technique | Why | Where |
|-----------|-----|-------|
| Fixed timestep | Deterministic physics, no tunneling | GameLoop |
| Cannon-es body sleeping | Puts static arena bodies to sleep | PhysicsWorld config |
| Object pooling | Projectile reuse (no GC thrash) | Projectile.ts (optional — 4fps rate is low) |
| Frustum culling | Three.js built-in, auto-enabled | Renderer |
| Low vertex count | All primitives, no high-poly models | ArenaMesh, entities |
| No post-processing | Saves GPU fill rate | Skip EffectComposer |
| DOM HUD (not sprites) | Native text rendering, no texture cost | HUD/Crosshair |
| `allowSleep: true` | Cannon-es sleeps static bodies | PhysicsWorld |
| `solver.iterations: 5` | Good enough for boxes/spheres | PhysicsWorld (tunable) |

---

## 10. Bundle Size Budget

| Package | Estimated Gzipped |
|---------|-------------------|
| Three.js (tree-shaken) | ~200 KB |
| Cannon-es | ~50 KB |
| Game TypeScript sources | ~50 KB |
| HTML + CSS | ~5 KB |
| **Total** | **~305 KB** | ← Well under 5 MB NFR

---

## 11. NFR Compliance Map

| NFR | How Architecture Addresses It |
|-----|-------------------------------|
| NFR01 — 60 FPS on mid-range | Fixed timestep, low vertex count, no post-processing, Cannon-es sleeping |
| NFR02 — <5s load time | Vite build optimization, total bundle ~300KB |
| NFR03 — <5MB gzipped | All procedural, no external textures, ~300KB actual |
| NFR04 — Browser support | Three.js targets WebGL1/2, Pointer Lock API widely supported |
| NFR05 — <500MB RAM | Object reuse, no texture memory, low mesh count |
| NFR06 — No external API calls | Single HTML+JS bundle, no CDN in production |
| NFR07 — Pointer lock | InputManager handles Pointer Lock API with graceful fallback |
| NFR08 — Restart (R key) | InputManager captures R key → Game.reset() |

---

## 12. Future Sprint Architecture Considerations

The architecture is designed to absorb Sprint 2/3 additions without major refactoring:

- **Audio (Sprint 2)**: Add `AudioManager.ts` as a new singleton, hook into game events (fire, hit, death, wave start)
- **More weapons (Sprint 2)**: Add weapon classes (Shotgun, RocketLauncher), `Weapon` interface, player weapon slot
- **More enemies (Sprint 2)**: Add new Entity subclasses, plug into collision handler switch statement
- **Score system (Sprint 3)**: Add `ScoreManager.ts`, hook into `onEnemyKilled`, save to localStorage
- **Particles/Screen shake (Sprint 3)**: Add `ParticleSystem.ts`, extend existing effect modules
- **ECS refactor (future)**: Entity class can remain as a facade over an internal component store if needed

---

## Appendix: Key Architecture Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entity Architecture | Class hierarchy | 6 entity types; ECS is overkill |
| Language | TypeScript | Type safety for vector math + physics |
| Physics timestep | Fixed (1/60) + variable render | Deterministic, no tunneling |
| Collision detection | Cannon-es contact events | Built-in, reliable |
| Arena generation | Data-first (ArenaLayout → ArenaMesh) | Testability, separation of concerns |
| HUD rendering | HTML/CSS overlay (not sprites) | Native text, simpler styling |
| Weapon type | Visible projectile (tracer) | Feels better than hitscan (per D09) |
| Healing | Health pickups (not regen) | Tension, resource management (per D08) |
| Game loop | Accumulator pattern | Industry standard, deterministic |
