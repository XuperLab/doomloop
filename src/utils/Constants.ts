import * as THREE from 'three';

// ── Arena ──
export const ARENA_SIZE = 40;
export const WALL_HEIGHT = 10;
export const WALL_THICKNESS = 1;
export const PILLAR_MIN_COUNT = 4;
export const PILLAR_MAX_COUNT = 8;
export const PILLAR_MARGIN_FROM_WALL = 4;
export const PILLAR_EXCLUSION_RADIUS = 3;
export const HEALTH_PACK_POSITIONS: [number, number, number][] = [
  [0, 1, 10],
  [10, 1, -10],
  [-10, 1, 10],
];
export const PLAYER_SPAWN: [number, number, number] = [0, 1, 0];
export const BOSS_SPAWN: [number, number, number] = [0, 1, 5];

// ── Physics ──
export const GRAVITY = -30;
export const PHYSICS_FIXED_DT = 1 / 60;
export const MAX_FRAME_DELTA = 0.1;
export const PHYSICS_SOLVER_ITERATIONS = 5;

// ── Player ──
export const PLAYER_EYE_HEIGHT = 1.6;
export const PLAYER_WALK_SPEED = 16;
export const PLAYER_SPRINT_MULTIPLIER = 1.5;
export const PLAYER_SPRINT_FOV = 70;
export const PLAYER_DEFAULT_FOV = 75;
export const PLAYER_ACCEL_TIME = 0.2;
export const PLAYER_DECEL_TIME = 0.1;
export const PLAYER_JUMP_VELOCITY = 8;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_RADIUS = 0.5;
export const PLAYER_HEIGHT = 1.8;

// ── Imp ──
export const IMP_SPEED = 14;
export const IMP_HEALTH = 3;
export const IMP_CONTACT_DAMAGE = 10;
export const IMP_KNOCKBACK_DURATION = 0.5;
export const IMP_KNOCKBACK_FORCE = 15;

// ── Boss ──
export const BOSS_SPEED = 6;
export const BOSS_HEALTH = 15;
export const BOSS_PROJECTILE_DAMAGE = 15;
export const BOSS_FIRE_INTERVAL = 2;
export const BOSS_RADIUS = 1.2;
export const BOSS_HEIGHT = 3;

// ── Plasma Rifle (Sprint 4: damage changed from 1 to 5) ──
export const PLASMA_FIRE_INTERVAL = 0.25;
export const PLASMA_PROJECTILE_SPEED = 60;
export const PLASMA_PROJECTILE_DAMAGE = 5;
export const PLASMA_PROJECTILE_LIFETIME = 3;
export const PLASMA_CROSSHAIR_BLOOM_RECOVERY = 0.2;
export const PLASMA_PROJECTILE_RADIUS = 0.15;

// ── Boss Projectile ──
export const BOSS_PROJECTILE_SPEED = 60;
export const BOSS_PROJECTILE_LIFETIME = 5;
export const BOSS_PROJECTILE_RADIUS = 0.4;

// ── Health Pack ──
export const HEALTH_PACK_HEAL = 25;
export const HEALTH_PACKS_PER_WAVE = 3;
export const HEALTH_PACK_RADIUS = 0.5;

// ── Waves ──
export const WAVE_INCOMING_DURATION = 2;
export const INTERMISSION_DURATION = 3;
export const TOTAL_WAVES = 5;

// ── Camera ──
export const CAMERA_BOB_AMPLITUDE = 0.03;
export const CAMERA_BOB_FREQUENCY = 8;
export const MOUSE_SENSITIVITY = 0.002;
export const PITCH_LIMIT = Math.PI / 2 - 0.05;

// ── Effects ──
export const DAMAGE_FLASH_DURATION = 0.2;
export const DEATH_FRAGMENT_COUNT = { IMP: 6, BOSS: 15 };
export const DEATH_FRAGMENT_LIFETIME = 2;
export const DEATH_FRAGMENT_SPEED = 8;
export const HIT_MARKER_DURATION = 0.1;
export const SCREEN_SHAKE_DURATION = 0.4;
export const SCREEN_SHAKE_INTENSITY = 0.08;

// ── Touch Controls (Sprint 2) ──
export const JOYSTICK_MAX_RADIUS = 60;          // px — maximum drag distance (smaller = more responsive)
export const JOYSTICK_DEAD_ZONE = 4;            // px — dead zone radius (smaller = more sensitive)
export const TOUCH_SENSITIVITY = 0.012;          // rad/px (~0.69°/px) — increased for faster camera
export const SPRINT_DOUBLE_TAP_WINDOW = 300;     // ms between taps
export const CONTROL_FADE_DELAY = 3000;          // ms — fade idle controls (P2)
export const FADE_OPACITY = 0.3;                 // faded opacity (P2)
export const DEFAULT_OPACITY = 0.4;              // normal opacity
export const ACTIVE_OPACITY = 0.8;               // pressed opacity

// ── Sprint 3: Haptic Feedback (F06) ──
export const HAPTIC_FIRE_MS = 20;               // ms — fire button vibration
export const HAPTIC_HIT_MS = 50;                // ms — enemy hit vibration
export const HAPTIC_DAMAGE_MS = 100;            // ms — player damage vibration
export const HAPTIC_DAMAGE_DEBOUNCE_MS = 200;   // ms — cooldown between damage haptics

// ── Sprint 3: Touch Settings (F07) ──
export const SETTINGS_DEAD_ZONE_MIN = 4;         // px — minimum dead zone slider value
export const SETTINGS_DEAD_ZONE_MAX = 20;        // px — maximum dead zone slider value
export const SETTINGS_DEAD_ZONE_DEFAULT = 8;     // px — default dead zone
export const SETTINGS_DEAD_ZONE_STEP = 1;        // px — slider step
export const SETTINGS_SENSITIVITY_MIN = 0.004;   // rad/px — minimum sensitivity
export const SETTINGS_SENSITIVITY_MAX = 0.016;   // rad/px — maximum sensitivity
export const SETTINGS_SENSITIVITY_DEFAULT = 0.008; // rad/px — default sensitivity
export const SETTINGS_SENSITIVITY_STEP = 0.001;  // rad/px — slider step
export const SETTINGS_HAPTIC_DEFAULT = true;     // haptic feedback default
export const LOCALSTORAGE_SETTINGS_KEY = 'doomloop_touch_settings';  // localStorage key
export const LOCALSTORAGE_HELP_KEY = 'doomloop_help_shown';          // help overlay flag key

// ── Sprint 3: Visual Feedback (F08) ──
export const FIRE_HOLD_ACTIVE_MS = 300;         // ms — hold duration before "active-hold" state
export const HINT_LABEL_DURATION_MS = 2000;      // ms — hint labels visible on first touch
export const HINT_LABEL_FADE_MS = 1000;           // ms — hint label fade-out transition

// ── Sprint 3: Address Bar Resize (F04) ──
export const VISUAL_VIEWPORT_DEBOUNCE_MS = 50;   // ms — debounce for visualViewport resize

// ── Button Dimensions ──
export const FIRE_BUTTON_SIZE = 60;              // px minimum
export const JUMP_BUTTON_SIZE = 50;              // px minimum

// ── Collision Groups ──
export const COLLISION_GROUPS = {
  PLAYER: 0x001,
  ARENA: 0x002,
  ENEMIES: 0x004,
  PLAYER_PROJECTILE: 0x008,
  FLYER: 0x010,
  HEALTH_PACK: 0x020,
  BOSS_PROJECTILE: 0x040,
  POWER_UP: 0x080,
  AMMO_PICKUP: 0x100,
  WEAPON_PICKUP: 0x200,
  SHELL_CASING: 0x400,
} as const;

// ── Colors ──
export const COLORS = {
  FLOOR: 0x3a3a3a,
  WALL: 0x555555,
  PILLAR: 0x444444,
  IMP: 0xcc5533,
  BOSS: 0x883333,
  PLAYER_PROJECTILE: 0x44ddff,
  BOSS_PROJECTILE: 0xff6622,
  HEALTH_PACK: 0x44ff44,
  VICTORY_PARTICLE: 0xffd700,
} as const;

// ── Sprint 4: Audio ──
export const AUDIO_DEFAULTS = {
  masterVolume: 100,
  sfxVolume: 80,
  musicVolume: 50,
};
export const AUDIO_STORAGE_KEY = 'doomloop_audio_settings';

// ── Sprint 4: Weapons ──
export const WEAPON_SWITCH_COOLDOWN = 0.3;     // Seconds
export const ROCKET_SELF_DAMAGE_RADIUS = 2;
export const ROCKET_AOE_RADIUS = 3;
export const ROCKET_SELF_DAMAGE = 10;
export const SHOTGUN_PELLET_MIN = 5;
export const SHOTGUN_PELLET_MAX = 8;
export const AMMO_PICKUP_RESPAWN_KILL_INTERVAL = 3;  // Every N kills
export const WEAPON_SPAWNER_RESPAWN_TIME = 15;       // Seconds

export const WEAPON_CONFIGS = {
  plasma: {
    name: 'Plasma Rifle', damage: 5, fireRate: 0.25,
    maxAmmo: 40, projectileSpeed: 60, spreadAngle: 0,
    projectileCount: 1, isAutomatic: false,
    icon: '⚡', projectileMesh: 'energy_bolt' as const,
  },
  shotgun: {
    name: 'Shotgun', damage: 2, fireRate: 1.2,
    maxAmmo: 12, projectileSpeed: 40, spreadAngle: 15,
    projectileCount: 6, isAutomatic: false,
    icon: '☰', projectileMesh: 'sphere' as const,
  },
  smg: {
    name: 'SMG', damage: 1, fireRate: 0.125,
    maxAmmo: 60, projectileSpeed: 60, spreadAngle: 2,
    projectileCount: 1, isAutomatic: true,
    icon: '≡', projectileMesh: 'sphere' as const,
  },
  rocket: {
    name: 'Rocket Launcher', damage: 20, fireRate: 1.5,
    maxAmmo: 6, projectileSpeed: 30, spreadAngle: 0,
    projectileCount: 1, isAutomatic: false,
    icon: '◎', projectileMesh: 'capsule' as const,
  },
} as const;

export const AMMO_PICKUP_SMALL: Record<string, number> = {
  plasma: 20, shotgun: 5, smg: 15, rocket: 3,
};

// ── Sprint 4: Gameplay ──
export const COMBO_WINDOW = 2.0;               // Seconds between kills to maintain combo
export const MAX_COMBO = 10;
export const POWER_UP_RESPAWN_TIME = 10;       // Seconds after collection
export const POWER_UP_SPAWN_CHANCE: Record<string, number> = {
  speed_boost: 0.30, double_damage: 0.25, shield: 0.25, health_pack: 0.20,
};

export const POWER_UP_CONFIGS: Record<string, { duration: number; color: number; spawnWeight: number }> = {
  speed_boost:     { duration: 8,  color: 0x4488FF, spawnWeight: 0.30 },
  double_damage:   { duration: 8,  color: 0xFF4444, spawnWeight: 0.25 },
  shield:          { duration: 6,  color: 0xFFFFFF, spawnWeight: 0.25 },
  health_pack:     { duration: 0,  color: 0x44FF44, spawnWeight: 0.20 },
};

// ── Sprint 4: Footsteps ──
export const FOOTSTEP_WALK_INTERVAL = 0.5;     // Seconds (2/sec)
export const FOOTSTEP_SPRINT_INTERVAL = 0.33;  // Seconds (3/sec)
export const FOOTSTEP_VOLUME_WALK = 0.3;
export const FOOTSTEP_VOLUME_SPRINT = 0.6;

// ── Sprint 4: Mini-Map ──
export const MINI_MAP_SIZE_DESKTOP = 120;
export const MINI_MAP_SIZE_MOBILE = 80;
export const MINI_MAP_PADDING = 4;
export const MINI_MAP_PLAYER_RADIUS = 3;
export const MINI_MAP_ENEMY_RADIUS = 2;

// ── Sprint 4: Particles ──
export const PARTICLE_POOL_MUZZLE_FLASH = 100;
export const PARTICLE_POOL_EXPLOSION = 400;
export const PARTICLE_POOL_ENEMY = 50;
export const SHELL_CASING_POOL = 30;
export const SHELL_CASING_LIFETIME = 5;

// ── Sprint 4: Interactive Elements ──
export const INTERACT_RADIUS = 2;
export const SUPPLY_STATION_HEAL = 25;
export const TRAP_COOLDOWN = 5;
export const TRAP_SPIKE_DAMAGE = 15;
export const TRAP_GEYSER_DAMAGE = 15;
export const TRAP_SLOW_DURATION = 3;
export const TRAP_SLOW_MULTIPLIER = 0.5;

// ── Sprint 4: Score ──
export const STORAGE_KEY_HIGH_SCORE = 'doomloop_high_score';

export const POINTS_PER_KILL: Record<string, number> = {
  imp: 100,
  shooter_imp: 150,
  exploder: 200,
  flyer: 300,
  boss: 1000,
};

// ── Sprint 4: Difficulty ──
export enum Difficulty { easy = 0, normal = 1, hard = 2 }

export interface DifficultyConfig {
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  waveCountMultiplier: number;
  powerUpDuration: number;
  scoreMultiplier: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.easy]:   { enemyHealthMultiplier: 0.7, enemyDamageMultiplier: 0.5,
                          waveCountMultiplier: 1.0, powerUpDuration: 10, scoreMultiplier: 0.8 },
  [Difficulty.normal]: { enemyHealthMultiplier: 1.0, enemyDamageMultiplier: 1.0,
                          waveCountMultiplier: 1.0, powerUpDuration: 8, scoreMultiplier: 1.0 },
  [Difficulty.hard]:   { enemyHealthMultiplier: 1.5, enemyDamageMultiplier: 1.5,
                          waveCountMultiplier: 1.25, powerUpDuration: 5, scoreMultiplier: 1.5 },
};

export interface WeaponConfig {
  name: string;
  damage: number;
  fireRate: number;
  maxAmmo: number;
  projectileSpeed: number;
  spreadAngle: number;
  projectileCount: number;
  isAutomatic: boolean;
  icon: string;
  projectileMesh: 'sphere' | 'capsule' | 'energy_bolt';
}

// ── Types ──
export type CollisionGroup = keyof typeof COLLISION_GROUPS;
export type EnemyType = 'imp' | 'shooter_imp' | 'exploder' | 'flyer' | 'boss' | 'none';
export type ProjectileOwner = 'player' | 'boss';
export type PillarShape = 'box' | 'cylinder';
export type WaveState = 'idle' | 'spawning' | 'fighting' | 'intermission' | 'victory' | 'gameOver' | 'transitioning';
export type Vec3 = [number, number, number];

// ── Arena Layout Types ──
export interface WallDef {
  position: Vec3;
  size: [number, number, number];
}

export interface PillarDef {
  shape: PillarShape;
  position: Vec3;
  height: number;
  radius?: number;
  size?: [number, number];
}

export interface ArenaLayout {
  seed: number;
  size: { width: number; depth: number };
  walls: WallDef[];
  pillars: PillarDef[];
  healthPackPositions: Vec3[];
  enemySpawnPoints: Vec3[];
  playerSpawn: Vec3;
  bossSpawn: Vec3;
}

// ── Wave Types ──
export interface WaveEnemyGroup {
  type: EnemyType;
  count: number;
}

export interface WaveDef {
  wave: number;
  enemyCount: number;
  enemyType: EnemyType;
  hasBoss: boolean;
  enemies?: WaveEnemyGroup[];
}

export const WAVE_DEFS: WaveDef[] = [
  { wave: 1, enemyCount: 3,  enemyType: 'imp',  hasBoss: false, enemies: [{ type: 'imp', count: 3 }] },
  { wave: 2, enemyCount: 5,  enemyType: 'imp',  hasBoss: false, enemies: [{ type: 'imp', count: 3 }, { type: 'shooter_imp', count: 2 }] },
  { wave: 3, enemyCount: 7,  enemyType: 'imp',  hasBoss: false, enemies: [{ type: 'imp', count: 4 }, { type: 'shooter_imp', count: 2 }, { type: 'exploder', count: 1 }] },
  { wave: 4, enemyCount: 10, enemyType: 'imp',  hasBoss: false, enemies: [{ type: 'imp', count: 4 }, { type: 'shooter_imp', count: 3 }, { type: 'exploder', count: 2 }, { type: 'flyer', count: 1 }] },
  { wave: 5, enemyCount: 0,  enemyType: 'none', hasBoss: true,  enemies: [] },
];
