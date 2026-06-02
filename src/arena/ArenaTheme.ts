import * as THREE from 'three';

export interface ArenaTheme {
  name: string;
  description: string;
  size: { width: number; depth: number };
  colors: {
    wall: number;
    floor: number;
    pillar: number;
    pillarEmissive?: number;
    ambient: number;
    fog: number;
    floorAccent?: number;
  };
  lighting: {
    ambientIntensity: number;
    directional: { color: number; intensity: number; position: [number, number, number] };
    fogNear: number;
    fogFar: number;
  };
  pillar: {
    shape: 'box' | 'cylinder' | 'crystal';
    minHeight: number;
    maxHeight: number;
    minRadius: number;
    maxRadius: number;
    countMin: number;
    countMax: number;
  };
  floorPattern: 'grid' | 'lava_cracks' | 'stars';
  decorations: {
    hasTorches: boolean;
    torchesColor?: number;
    torchesCount?: number;
    hasLavaPools: boolean;
    hasFloatingDebris: boolean;
    debrisCount?: number;
  };
  specialFeature: 'none' | 'lava_pools' | 'crystals' | 'debris';
}

export const ARENA_THEMES: ArenaTheme[] = [
  {
    name: 'Stone Fortress',
    description: 'An ancient stone arena carved from mountain rock.',
    size: { width: 40, depth: 40 },
    colors: {
      wall: 0x8B8B8B, floor: 0x6B6B6B, pillar: 0x7A7A7A,
      ambient: 0xFFCC88, fog: 0xCCBBAA,
    },
    lighting: {
      ambientIntensity: 1.5,
      directional: { color: 0xFFFFFF, intensity: 2.0, position: [10, 20, 10] },
      fogNear: 45, fogFar: 90,
    },
    pillar: {
      shape: 'box', minHeight: 6, maxHeight: 10,
      minRadius: 1, maxRadius: 1.5, countMin: 4, countMax: 8,
    },
    floorPattern: 'grid',
    decorations: {
      hasTorches: true, torchesColor: 0xFF8844, torchesCount: 3,
      hasLavaPools: false, hasFloatingDebris: false,
    },
    specialFeature: 'none',
  },
  {
    name: 'Lava Cavern',
    description: 'A volcanic chamber with molten rock and heat shimmer.',
    size: { width: 48, depth: 48 },
    colors: {
      wall: 0x553322, floor: 0x332211, pillar: 0x664433,
      pillarEmissive: 0xFF4400,
      ambient: 0xFF6633, fog: 0x442211,
      floorAccent: 0xFF4400,
    },
    lighting: {
      ambientIntensity: 1.2,
      directional: { color: 0xFF6633, intensity: 1.8, position: [5, 15, 5] },
      fogNear: 35, fogFar: 70,
    },
    pillar: {
      shape: 'cylinder', minHeight: 5, maxHeight: 9,
      minRadius: 0.6, maxRadius: 1.2, countMin: 5, countMax: 10,
    },
    floorPattern: 'lava_cracks',
    decorations: {
      hasTorches: false,
      hasLavaPools: true,
      hasFloatingDebris: false,
    },
    specialFeature: 'lava_pools',
  },
  {
    name: 'Void Nexus',
    description: 'A dark ethereal space between dimensions.',
    size: { width: 36, depth: 36 },
    colors: {
      wall: 0x223355, floor: 0x112233, pillar: 0x334466,
      pillarEmissive: 0x6688FF,
      ambient: 0x4488CC, fog: 0x0A0A22,
      floorAccent: 0x4488FF,
    },
    lighting: {
      ambientIntensity: 0.8,
      directional: { color: 0x8888FF, intensity: 1.2, position: [0, 25, 0] },
      fogNear: 30, fogFar: 60,
    },
    pillar: {
      shape: 'crystal', minHeight: 7, maxHeight: 12,
      minRadius: 0.4, maxRadius: 0.8, countMin: 6, countMax: 10,
    },
    floorPattern: 'stars',
    decorations: {
      hasTorches: false,
      hasLavaPools: false,
      hasFloatingDebris: true,
      debrisCount: 5,
    },
    specialFeature: 'crystals',
  },
];

export function getArenaKey(index: number): string {
  const names = ['fortress', 'cavern', 'nexus'];
  return names[index % names.length] ?? 'fortress';
}

export function getMusicKey(index: number): 'fortress' | 'cavern' | 'nexus' {
  const names: ('fortress' | 'cavern' | 'nexus')[] = ['fortress', 'cavern', 'nexus'];
  return names[index % names.length] ?? 'fortress';
}
