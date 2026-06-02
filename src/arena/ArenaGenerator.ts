import { RNG } from '../utils/RNG';
import {
  ARENA_SIZE,
  WALL_HEIGHT,
  WALL_THICKNESS,
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
import { ArenaTheme } from './ArenaTheme';

export class ArenaGenerator {
  /**
   * Generate a complete arena layout from a seed, with optional theme.
   */
  generate(seed: number, theme?: ArenaTheme): ArenaLayout {
    const rng = new RNG(seed);
    const size = theme?.size ?? { width: ARENA_SIZE, depth: ARENA_SIZE };
    const halfWidth = size.width / 2;
    const halfDepth = size.depth / 2;

    // Walls sized to arena dimensions
    const walls: WallDef[] = [
      { position: [0, WALL_HEIGHT / 2, -halfDepth], size: [size.width, WALL_HEIGHT, WALL_THICKNESS] },
      { position: [0, WALL_HEIGHT / 2, halfDepth], size: [size.width, WALL_HEIGHT, WALL_THICKNESS] },
      { position: [halfWidth, WALL_HEIGHT / 2, 0], size: [WALL_THICKNESS, WALL_HEIGHT, size.depth] },
      { position: [-halfWidth, WALL_HEIGHT / 2, 0], size: [WALL_THICKNESS, WALL_HEIGHT, size.depth] },
    ];

    // Theme-aware pillars
    const pillarCfg = theme?.pillar;
    const countMin = pillarCfg?.countMin ?? 4;
    const countMax = pillarCfg?.countMax ?? 8;
    const pillarCount = rng.nextInt(countMin, countMax);
    const pillars: PillarDef[] = [];
    const usedPositions: Vec3[] = [];

    for (let i = 0; i < pillarCount; i++) {
      const shape = theme
        ? (pillarCfg?.shape === 'crystal' ? (rng.nextBool(0.5) ? 'cylinder' as const : 'cylinder' as const)
          : pillarCfg?.shape === 'box' ? 'box' as const
          : 'cylinder' as const)
        : (rng.nextBool(0.5) ? 'box' as const : 'cylinder' as const);

      let position: Vec3;
      let attempts = 0;

      do {
        const x = rng.nextRange(
          -halfWidth + PILLAR_MARGIN_FROM_WALL,
          halfWidth - PILLAR_MARGIN_FROM_WALL
        );
        const z = rng.nextRange(
          -halfDepth + PILLAR_MARGIN_FROM_WALL,
          halfDepth - PILLAR_MARGIN_FROM_WALL
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

      const minH = pillarCfg?.minHeight ?? 3;
      const maxH = pillarCfg?.maxHeight ?? 8;
      const height = rng.nextRange(minH, maxH);

      if (shape === 'box') {
        const w = rng.nextRange(1, 3);
        const d = rng.nextRange(1, 3);
        pillars.push({ shape, position, height, size: [w, d] });
      } else {
        const minR = pillarCfg?.minRadius ?? 0.5;
        const maxR = pillarCfg?.maxRadius ?? 1.5;
        const radius = rng.nextRange(minR, maxR);
        pillars.push({ shape, position, height, radius });
      }
    }

    const healthPackPositions: Vec3[] = HEALTH_PACK_POSITIONS.slice(0, HEALTH_PACKS_PER_WAVE);
    const enemySpawnPoints: Vec3[] = this.generateEnemySpawnPoints(rng, halfWidth, halfDepth, pillars);

    return {
      seed,
      size,
      walls,
      pillars,
      healthPackPositions,
      enemySpawnPoints,
      playerSpawn: PLAYER_SPAWN,
      bossSpawn: BOSS_SPAWN,
    };
  }

  private generateEnemySpawnPoints(
    rng: RNG,
    halfWidth: number,
    halfDepth: number,
    pillars: PillarDef[]
  ): Vec3[] {
    const points: Vec3[] = [];
    const margin = 2;
    const edgeOffsetX = halfWidth - margin;
    const edgeOffsetZ = halfDepth - margin;

    for (let i = 0; i < 20; i++) {
      const edge = rng.nextInt(0, 3);
      let x: number, z: number;

      switch (edge) {
        case 0:
          x = rng.nextRange(-edgeOffsetX, edgeOffsetX);
          z = -edgeOffsetZ;
          break;
        case 1:
          x = rng.nextRange(-edgeOffsetX, edgeOffsetX);
          z = edgeOffsetZ;
          break;
        case 2:
          x = edgeOffsetX;
          z = rng.nextRange(-edgeOffsetZ, edgeOffsetZ);
          break;
        default:
          x = -edgeOffsetX;
          z = rng.nextRange(-edgeOffsetZ, edgeOffsetZ);
          break;
      }

      const tooCloseToPillar = pillars.some(
        (p) =>
          Math.sqrt((p.position[0] - x) ** 2 + (p.position[2] - z) ** 2) < 2
      );

      if (!tooCloseToPillar) {
        const tooCloseToOther = points.some(
          (p) => Math.sqrt((p[0] - x) ** 2 + (p[2] - z) ** 2) < 3
        );

        if (!tooCloseToOther) {
          points.push([x, 0, z]);
        }
      }
    }

    if (points.length < 10) {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = Math.min(halfWidth, halfDepth) - margin - 1;
        points.push([
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ]);
      }
    }

    return rng.shuffle(points);
  }

  /** Get weapon spawners for a given arena */
  getWeaponSpawnerPositions(rng: RNG, halfWidth: number, halfDepth: number): Vec3[] {
    const spawners: Vec3[] = [];
    const margin = 4;
    const positions = [
      [margin, 0, margin],
      [-margin, 0, -margin],
      [margin, 0, -margin],
      [-margin, 0, margin],
    ];
    return positions as Vec3[];
  }
}
