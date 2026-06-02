import * as THREE from 'three';
import { ParticlePool } from './ParticlePool';

export interface MuzzleFlashConfig {
  particleCount: number;
  color: number;
  lifetime: number;
  size: number;
  spreadAngle: number;
  poolSize: number;
}

export const MUZZLE_FLASH_CONFIGS: Record<string, MuzzleFlashConfig> = {
  plasma:  { particleCount: 8,  color: 0x4488FF, lifetime: 0.1, size: 0.1, spreadAngle: 10, poolSize: 10 },
  shotgun: { particleCount: 15, color: 0xFFFF88, lifetime: 0.2, size: 0.15, spreadAngle: 15, poolSize: 5 },
  smg:     { particleCount: 3,  color: 0xFF8800, lifetime: 0.05, size: 0.05, spreadAngle: 5, poolSize: 20 },
  rocket:  { particleCount: 20, color: 0xFF4400, lifetime: 0.3, size: 0.2, spreadAngle: 20, poolSize: 3 },
};

export class MuzzleFlash {
  private pools: Map<string, ParticlePool> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Create a pool per weapon type
    for (const [name, cfg] of Object.entries(MUZZLE_FLASH_CONFIGS)) {
      const pool = new ParticlePool(scene, {
        poolSize: cfg.poolSize,
        particleCount: cfg.particleCount,
        defaultLifetime: cfg.lifetime,
        defaultSize: cfg.size,
        colors: [cfg.color],
        velocities: { min: 0.5, max: 3 },
      });
      this.pools.set(name, pool);
    }
  }

  emit(weaponType: string, position: THREE.Vector3, direction: THREE.Vector3): void {
    const config = MUZZLE_FLASH_CONFIGS[weaponType];
    if (!config) return;

    const pool = this.pools.get(weaponType);
    if (!pool) return;

    const color = new THREE.Color(config.color);
    const count = config.particleCount;

    const velocity = direction.clone().multiplyScalar(3);
    velocity.x += (Math.random() - 0.5) * config.spreadAngle * 0.5;
    velocity.y += (Math.random() - 0.5) * config.spreadAngle * 0.5;
    velocity.z += (Math.random() - 0.5) * config.spreadAngle * 0.5;

    pool.emit(position, count, color, config.lifetime, config.size, velocity);
  }

  update(dt: number): void {
    for (const pool of this.pools.values()) {
      pool.update(dt);
    }
  }

  clear(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
  }
}
