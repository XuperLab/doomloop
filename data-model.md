# Doomloop — Data Model (Sprint 1)

> All types are TypeScript interfaces for documentation purposes. The impl-agent should define these in a `src/types.ts` or co-located with their consumers.

---

## 1. Game Constants

```typescript
// src/utils/Constants.ts

export const GAME = {
  ARENA_SIZE: 40,                         // 40x40 units
  WALL_HEIGHT: 10,
  WALL_THICKNESS: 1,
  GRAVITY: -30,                           // m/s²
  PLAYER_EYE_HEIGHT: 1.6,                 // Camera height above ground
  PLAYER_WALK_SPEED: 12,                  // units/s
  PLAYER_SPRINT_MULTIPLIER: 1.5,          // 18 units/s
  PLAYER_SPRINT_FOV: 70,                  // degrees (default 75)
  PLAYER_DEFAULT_FOV: 75,                 // degrees
  PLAYER_ACCEL_TIME: 0.2,                 // seconds to reach full speed
  PLAYER_DECEL_TIME: 0.1,                 // seconds to stop
  PLAYER_JUMP_VELOCITY: 8,               // initial vertical velocity
  PLAYER_MAX_HEALTH: 100,

  IMP_SPEED: 14,                          // ~80% of sprint speed
  IMP_HEALTH: 3,
  IMP_CONTACT_DAMAGE: 10,
  IMP_KNOCKBACK_DURATION: 0.5,            // seconds

  BOSS_SPEED: 6,                          // ~50% of walk speed
  BOSS_HEALTH: 15,
  BOSS_PROJECTILE_DAMAGE: 15,
  BOSS_FIRE_INTERVAL: 2,                  // seconds between shots

  PLASMA_FIRE_INTERVAL: 0.25,             // seconds (~4 shots/sec)
  PLASMA_PROJECTILE_SPEED: 100,           // units/s
  PLASMA_PROJECTILE_DAMAGE: 1,            // 1 HP per hit
  PLASMA_PROJECTILE_LIFETIME: 3,          // seconds auto-destroy
  PLASMA_CROSSHAIR_BLOOM_RECOVERY: 0.2,   // seconds

  BOSS_PROJECTILE_SPEED: 60,              // units/s (60% of plasma bolt speed)
  BOSS_PROJECTILE_LIFETIME: 5,            // seconds

  HEALTH_PACK_HEAL: 25,
  HEALTH_PACKS_PER_WAVE: 3,

  WAVE_INCOMING_DURATION: 2,              // "Wave X incoming!" display time
  INTERMISSION_DURATION: 3,               // seconds between waves

  PHYSICS_FIXED_DT: 1 / 60,              // 16.67ms
  MAX_FRAME_DELTA: 0.1,                   // cap to prevent spiral of death
  PHYSICS_SOLVER_ITERATIONS: 5,

  CAMERA_BOB_AMPLITUDE: 0.03,
  CAMERA_BOB_FREQUENCY: 8,
  DAMAGE_FLASH_DURATION: 0.2,             // seconds
  DEATH_FRAGMENT_COUNT: { IMP: 6, BOSS: 15 },
  DEATH_FRAGMENT_LIFETIME: 2,             // seconds
};
```

---

## 2. Core Type Definitions

```typescript
// src/utils/Constants.ts (cont.)

export type CollisionGroup =
  | 'PLAYER'              // 0x001
  | 'ARENA'               // 0x002
  | 'ENEMIES'             // 0x004
  | 'PLAYER_PROJECTILE'   // 0x008
  | 'HEALTH_PACK'         // 0x020
  | 'BOSS_PROJECTILE';    // 0x040

export const COLLISION_MASK: Record<CollisionGroup, number> = {
  PLAYER: 0x001,
  ARENA: 0x002,
  ENEMIES: 0x004,
  PLAYER_PROJECTILE: 0x008,
  HEALTH_PACK: 0x020,
  BOSS_PROJECTILE: 0x040,
};

export type EnemyType = 'imp' | 'boss';
export type ProjectileOwner = 'player' | 'boss';
export type PillarShape = 'box' | 'cylinder';
export type WaveState = 'idle' | 'spawning' | 'fighting' | 'intermission' | 'victory' | 'gameOver';
export type GameResult = 'victory' | 'death';
```

---

## 3. Input State

```typescript
// src/engine/InputManager.ts

interface InputState {
  /** WASD: which direction keys are held */
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;

  /** Action keys — pressed this frame */
  fire: boolean;                            // Left click this frame
  jumpPressed: boolean;                     // Space pressed this frame
  sprint: boolean;                          // Shift held

  /** Mouse delta since last frame (Pointer Lock) */
  mouseDeltaX: number;
  mouseDeltaY: number;

  /** Restart trigger */
  restart: boolean;                         // R key pressed this frame
}
```

---

## 4. Arena Data

```typescript
// src/arena/ArenaGenerator.ts

interface ArenaLayout {
  seed: number;
  size: { width: number; depth: number; };
  walls: WallDef[];
  pillars: PillarDef[];
  healthPackPositions: Vec3[];
  enemySpawnPoints: Vec3[];
  playerSpawn: Vec3;
  bossSpawn: Vec3;
}

interface WallDef {
  position: Vec3;                              // Center position
  size: [number, number, number];              // [width, height, depth]
}

interface PillarDef {
  shape: PillarShape;
  position: Vec3;
  height: number;
  /** For cylinders */
  radius?: number;
  /** For boxes */
  size?: [number, number];                     // [width, depth]
}

// Reusable 3D vector tuple (avoids coupling to THREE.Vector3 in pure data)
type Vec3 = [number, number, number];
```

---

## 5. Entity Interfaces

### 5.1 Base Entity

```typescript
// src/entities/Entity.ts

interface Entity {
  id: string;                                  // Unique ID (crypto.randomUUID or counter)
  mesh: THREE.Mesh | THREE.Group;              // Visual representation
  body: CANNON.Body;                           // Physics body
  isAlive: boolean;                            // False = pending removal
  createdAt: number;                           // Timestamp for lifetime tracking

  update(dt: number): void;
  destroy(): void;                             // Remove from scene + physics world
}
```

### 5.2 Damageable Entity

```typescript
// Interface for damageable entities (Player, Imp, Boss)

interface Damageable {
  health: number;
  maxHealth: number;

  takeDamage(amount: number): void;
  heal(amount: number): void;
  onDeath(): void;
}
```

### 5.3 Player

```typescript
// src/entities/Player.ts

interface Player extends Entity, Damageable {
  health: 100;
  maxHealth: 100;
  grounded: boolean;                           // True when on ground (can jump)

  // Movement
  velocity: THREE.Vector3;                     // Current velocity (computed from input)
  isSprinting: boolean;
  walkSpeed: number;                           // 12
  sprintMultiplier: number;                    // 1.5

  // Weapon
  weapon: PlasmaRifle;

  // Methods (overrides Entity.update)
  update(dt: number): void;                    // Read input → compute velocity → apply to body
  takeDamage(amount: number): void;            // Decrease HP, trigger flash if alive
  heal(amount: number): void;                  // Increase HP (cap at maxHealth)
  onDeath(): void;                             // Trigger death state → waveManager.onPlayerDeath()
  jump(): void;                                // Apply upward velocity if grounded
}
```

### 5.4 Imp

```typescript
// src/entities/Imp.ts

interface Imp extends Entity, Damageable {
  health: 3;
  maxHealth: 3;
  speed: number;                               // 14 (80% of player sprint)
  contactDamage: number;                       // 10

  // AI state
  target: THREE.Vector3;                       // Current player position (updated each frame)

  // Methods
  update(dt: number): void;                    // Move toward target position
  takeDamage(amount: number): void;            // Decrease HP, flash white
  onDeath(): void;                             // DeathEffect fragments
}
```

### 5.5 Boss

```typescript
// src/entities/Boss.ts

interface Boss extends Entity, Damageable {
  health: 15;
  maxHealth: 15;
  moveSpeed: number;                           // 6 (50% of player walk)
  rangedDamage: number;                        // 15 (per projectile hit)

  // AI state
  target: THREE.Vector3;
  fireCooldown: number;                        // Countdown timer (2s between shots)

  // Methods
  update(dt: number): void;                    // Move toward target, fire when cooldown expires
  takeDamage(amount: number): void;            // Decrease HP, flash white
  onDeath(): void;                             // Large explosion effect
  fireProjectile(): Projectile;                // Spawn boss projectile
}
```

### 5.6 Projectile

```typescript
// src/entities/Projectile.ts

interface Projectile extends Entity {
  speed: number;                               // 100 (player) or 60 (boss)
  damage: number;                              // 1 (player) or 15 (boss)
  owner: ProjectileOwner;                      // 'player' | 'boss'
  direction: THREE.Vector3;                    // Normalized direction vector
  lifetime: number;                            // Seconds remaining (counted from creation)

  // Methods
  update(dt: number): void;                    // Move along direction, decrement lifetime
  onHit(): void;                               // Impact effect (spark), queue for removal
}
```

### 5.7 HealthPack

```typescript
// src/entities/HealthPack.ts

interface HealthPack extends Entity {
  healAmount: number;                          // 25
  consumed: boolean;

  // Visual
  pulsePhase: number;                          // For glowing animation

  // Methods
  update(dt: number): void;                    // Rotate/pulse animation
  onConsumed(): void;                          // Destroy mesh, remove from world
}
```

### 5.8 Enemy (shared base for Imp/Boss)

```typescript
// src/entities/Enemy.ts (optional — can be inlined in Imp/Boss)

interface Enemy extends Entity, Damageable {
  // Common enemy behavior
  moveTowardTarget(speed: number, dt: number): void;
  faceTarget(): void;                          // Rotate mesh toward player
  takeDamage(amount: number): void;            // Shared damage + flash logic
  onDeath(): void;                             // Shared death effect spawning
}
```

---

## 6. Wave Manager State

```typescript
// src/waves/WaveManager.ts

interface WaveManagerState {
  currentWaveIndex: number;                    // 0-4 (display as Wave 1-5)
  state: WaveState;
  enemiesAlive: number;
  enemiesKilled: number;                       // For "X/Y Killed" HUD
  timer: number;                               // Countdown for intermission/spawning

  // For wave-to-wave tracking
  currentWaveDef: WaveDef;
  totalEnemiesThisWave: number;
}

interface WaveDef {
  wave: number;                                // 1-5 display number
  enemyCount: number;                          // Number of Imps to spawn
  enemyType: 'imp' | 'none';
  hasBoss: boolean;
}

const WAVE_DEFS: WaveDef[] = [
  { wave: 1, enemyCount: 3,  enemyType: 'imp',  hasBoss: false },
  { wave: 2, enemyCount: 5,  enemyType: 'imp',  hasBoss: false },
  { wave: 3, enemyCount: 7,  enemyType: 'imp',  hasBoss: false },
  { wave: 4, enemyCount: 10, enemyType: 'imp',  hasBoss: false },
  { wave: 5, enemyCount: 0,  enemyType: 'none', hasBoss: true  },
];
```

---

## 7. Weapon

```typescript
// src/weapons/PlasmaRifle.ts

interface PlasmaRifle {
  fireRate: number;                            // 0.25s (4 shots/sec)
  lastFireTime: number;                        // Timestamp of last shot
  crosshairBloom: number;                      // 0-1, visual spread on crosshair

  canFire(): boolean;                          // true if cooldown elapsed
  fire(camera: THREE.Camera): Projectile | null;  // Spawn projectile or null if on cooldown
  update(dt: number): void;                    // Recover crosshair bloom
}
```

---

## 8. Collision Event Payloads

```typescript
// src/physics/PhysicsWorld.ts

interface CollisionEvent {
  bodyA: CANNON.Body;
  bodyB: CANNON.Body;
  contact: CANNON.ContactEquation;
}

type CollisionHandler = (
  entityA: Entity,
  entityB: Entity,
  contact: CANNON.ContactEquation
) => void;

interface CollisionHandlerMap {
  'player-imp': CollisionHandler;
  'player-healthpack': CollisionHandler;
  'playerprojectile-imp': CollisionHandler;
  'playerprojectile-boss': CollisionHandler;
  'bossprojectile-player': CollisionHandler;
  'projectile-arena': CollisionHandler;
}
```

---

## 9. HUD State

```typescript
// src/hud/HUD.ts

interface HUDState {
  health: number;
  maxHealth: number;
  currentWave: number;                         // 1-indexed display number
  maxWave: number;                             // Always 5
  enemiesKilled: number;
  totalEnemies: number;                        // For current wave
  isVisible: boolean;                          // False during overlays
}

interface OverlayState {
  type: 'none' | 'start' | 'death' | 'victory' | 'waveIncoming' | 'intermission';
  text: string;
  subtext?: string;
  visible: boolean;
  autoHideTimer: number;                       // For wave incoming / intermission
}
```

---

## 10. Effect State

```typescript
// src/effects/DamageFlash.ts

interface DamageFlashState {
  active: boolean;
  intensity: number;                           // 0-1, fades over duration
  duration: number;                            // 0.2s
  elapsed: number;
}

// src/effects/DeathEffect.ts

interface Fragment {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;                            // Seconds remaining
  angularVelocity: THREE.Vector3;
}

interface DeathEffectConfig {
  color: number;
  fragmentCount: number;
  explosionRadius: number;
  fragmentLifetime: number;                    // 2s default
}
```

---

## 11. Game State (Top-Level)

```typescript
// src/Game.ts

interface GameState {
  phase: 'loading' | 'menu' | 'playing' | 'paused' | 'dead' | 'victory';

  // Sub-component states
  arena: ArenaLayout | null;
  player: Player | null;
  waveManager: WaveManagerState;
  hud: HUDState;
  overlay: OverlayState;
}
```

---

## 12. RNG Interface

```typescript
// src/utils/RNG.ts

interface RNG {
  readonly state: number;                      // Current seed state

  /** Returns float in [0, 1) */
  next(): number;

  /** Returns float in [min, max) */
  nextRange(min: number, max: number): number;

  /** Returns integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;

  /** Weighted boolean */
  nextBool(probability: number): boolean;

  /** Pick random element from array */
  pick<T>(array: T[]): T;

  /** Fisher-Yates shuffle (in-place) */
  shuffle<T>(array: T[]): T[];
}
```
