import { RNG } from '../utils/RNG';
import {
  ARENA_SIZE,
  WALL_HEIGHT,
  WALL_THICKNESS,
  PILLAR_MIN_COUNT,
  PILLAR_MAX_COUNT,
  PILLAR_MARGIN_FROM_WALL,
  PILLAR_EXCLUSION_RADIUS,
  HEALTH_PACK_POSITIONS,
  PLAYER_SPAWN,
  BOSS_SPAWN,
  HEALTH_PACKS_PER_WAVE,
  ArenaLayout,
  WallDef,
  PillarDef,
  Vec3,
} from '../utils/Constants';

export class ArenaGenerator {
  /**
   * Generate a complete arena layout from a seed.
   * Uses mulberry32 PRNG for deterministic, reproducible generation.
   */
  generate(seed: number): ArenaLayout {
    const rng = new RNG(seed);
    const halfSize = ARENA_SIZE / 2;

    // 4 walls: north, south, east, west
    const walls: WallDef[] = [
      // North wall
      { position: [0, WALL_HEIGHT / 2, -halfSize], size: [ARENA_SIZE, WALL_HEIGHT, WALL_THICKNESS] },
      // South wall
      { position: [0, WALL_HEIGHT / 2, halfSize], size: [ARENA_SIZE, WALL_HEIGHT, WALL_THICKNESS] },
      // East wall
      { position: [halfSize, WALL_HEIGHT / 2, 0], size: [WALL_THICKNESS, WALL_HEIGHT, ARENA_SIZE] },
      // West wall
      { position: [-halfSize, WALL_HEIGHT / 2, 0], size: [WALL_THICKNESS, WALL_HEIGHT, ARENA_SIZE] },
    ];

    // Pillars: 4-8, within inner 32x32 zone, exclusion zone at center
    const pillarCount = rng.nextInt(PILLAR_MIN_COUNT, PILLAR_MAX_COUNT);
    const pillars: PillarDef[] = [];
    const usedPositions: Vec3[] = [];

    for (let i = 0; i < pillarCount; i++) {
      const shape = rng.nextBool(0.5) ? 'box' : 'cylinder';
      let position: Vec3;
      let attempts = 0;

      // Rejection sampling to avoid overlap
      do {
        const x = rng.nextRange(
          -halfSize + PILLAR_MARGIN_FROM_WALL,
          halfSize - PILLAR_MARGIN_FROM_WALL
        );
        const z = rng.nextRange(
          -halfSize + PILLAR_MARGIN_FROM_WALL,
          halfSize - PILLAR_MARGIN_FROM_WALL
        );
        position = [x, 0, z];
        attempts++;
      } while (
        attempts < 20 &&
        usedPositions.some(
          (p) =>
            Math.sqrt(
              (p[0] - position[0]) ** 2 + (p[2] - position[2]) ** 2
            ) < PILLAR_EXCLUSION_RADIUS + 1
        ) &&
        Math.sqrt(position[0] ** 2 + position[2] ** 2) < PILLAR_EXCLUSION_RADIUS
      );

      usedPositions.push(position);

      const height = rng.nextRange(3, 8);

      if (shape === 'box') {
        const w = rng.nextRange(1, 3);
        const d = rng.nextRange(1, 3);
        pillars.push({ shape, position, height, size: [w, d] });
      } else {
        const radius = rng.nextRange(0.5, 1.5);
        pillars.push({ shape, position, height, radius });
      }
    }

    // Health pack positions - use 3 from CONSTANTS
    const healthPackPositions: Vec3[] = HEALTH_PACK_POSITIONS.slice(0, HEALTH_PACKS_PER_WAVE);

    // Enemy spawn points - along inner edges
    const enemySpawnPoints: Vec3[] = this.generateEnemySpawnPoints(rng, halfSize, pillars);

    return {
      seed,
      size: { width: ARENA_SIZE, depth: ARENA_SIZE },
      walls,
      pillars,
      healthPackPositions,
      enemySpawnPoints,
      playerSpawn: PLAYER_SPAWN,
      bossSpawn: BOSS_SPAWN,
    };
  }

  /** Generate enemy spawn points along arena edges */
  private generateEnemySpawnPoints(
    rng: RNG,
    halfSize: number,
    pillars: PillarDef[]
  ): Vec3[] {
    const points: Vec3[] = [];
    const margin = 2; // Slightly inward from walls
    const edgeOffset = halfSize - margin;

    // Generate points along all 4 edges
    for (let i = 0; i < 20; i++) {
      const edge = rng.nextInt(0, 3);
      let x: number, z: number;

      switch (edge) {
        case 0: // North edge
          x = rng.nextRange(-edgeOffset, edgeOffset);
          z = -edgeOffset;
          break;
        case 1: // South edge
          x = rng.nextRange(-edgeOffset, edgeOffset);
          z = edgeOffset;
          break;
        case 2: // East edge
          x = edgeOffset;
          z = rng.nextRange(-edgeOffset, edgeOffset);
          break;
        default: // West edge
          x = -edgeOffset;
          z = rng.nextRange(-edgeOffset, edgeOffset);
          break;
      }

      // Check against pillar positions (rejection if too close)
      const tooCloseToPillar = pillars.some(
        (p) =>
          Math.sqrt((p.position[0] - x) ** 2 + (p.position[2] - z) ** 2) < 2
      );

      if (!tooCloseToPillar) {
        // Check against existing spawn points
        const tooCloseToOther = points.some(
          (p) => Math.sqrt((p[0] - x) ** 2 + (p[2] - z) ** 2) < 3
        );

        if (!tooCloseToOther) {
          points.push([x, 0, z]);
        }
      }
    }

    // Ensure we have at least some points
    if (points.length < 10) {
      // Fallback: place along edges evenly
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = halfSize - margin - 1;
        points.push([
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ]);
      }
    }

    return rng.shuffle(points);
  }
}
