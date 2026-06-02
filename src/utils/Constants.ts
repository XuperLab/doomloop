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
export const PLAYER_WALK_SPEED = 12;
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

// ── Plasma Rifle ──
export const PLASMA_FIRE_INTERVAL = 0.25;
export const PLASMA_PROJECTILE_SPEED = 100;
export const PLASMA_PROJECTILE_DAMAGE = 1;
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
export const JOYSTICK_MAX_RADIUS = 80;          // px — maximum drag distance
export const JOYSTICK_DEAD_ZONE = 8;            // px — dead zone radius
export const TOUCH_SENSITIVITY = 0.008;          // rad/px (~0.46°/px)
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
  HEALTH_PACK: 0x020,
  BOSS_PROJECTILE: 0x040,
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

// ── Types ──
export type CollisionGroup = keyof typeof COLLISION_GROUPS;
export type EnemyType = 'imp' | 'boss' | 'none';
export type ProjectileOwner = 'player' | 'boss';
export type PillarShape = 'box' | 'cylinder';
export type WaveState = 'idle' | 'spawning' | 'fighting' | 'intermission' | 'victory' | 'gameOver';
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
export interface WaveDef {
  wave: number;
  enemyCount: number;
  enemyType: EnemyType;
  hasBoss: boolean;
}

export const WAVE_DEFS: WaveDef[] = [
  { wave: 1, enemyCount: 3,  enemyType: 'imp',  hasBoss: false },
  { wave: 2, enemyCount: 5,  enemyType: 'imp',  hasBoss: false },
  { wave: 3, enemyCount: 7,  enemyType: 'imp',  hasBoss: false },
  { wave: 4, enemyCount: 10, enemyType: 'imp',  hasBoss: false },
  { wave: 5, enemyCount: 0,  enemyType: 'none', hasBoss: true  },
];
