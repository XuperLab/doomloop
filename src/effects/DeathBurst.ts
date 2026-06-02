import * as THREE from 'three';
import { ParticlePool } from './ParticlePool';

const DEATHBURST_CONFIGS: Record<string, { color: number; count: number; lifetime: number; size: number }> = {
  imp:          { color: 0xCC5533, count: 20, lifetime: 1.0, size: 0.12 },
  shooter_imp:  { color: 0x88AA44, count: 20, lifetime: 1.0, size: 0.1 },
  exploder:     { color: 0xFF4422, count: 30, lifetime: 1.5, size: 0.15 },
  flyer:        { color: 0x8844CC, count: 25, lifetime: 1.2, size: 0.1 },
  boss:         { color: 0x883333, count: 50, lifetime: 2.0, size: 0.2 },
};

export class DeathBurst {
  private pool: ParticlePool;

  constructor(scene: THREE.Scene) {
    this.pool = new ParticlePool(scene, {
      poolSize: 30,
      particleCount: 50,
      defaultLifetime: 1.0,
      defaultSize: 0.15,
      colors: [0xFFFFFF],
      velocities: { min: 2, max: 8 },
    });
  }

  emit(enemyType: string, position: THREE.Vector3): void {
    const config = DEATHBURST_CONFIGS[enemyType];
    if (!config) return;

    const color = new THREE.Color(config.color);

    // Emit multiple bursts for larger enemies
    const bursts = enemyType === 'boss' ? 3 : 1;
    for (let b = 0; b < bursts; b++) {
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        Math.random() * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      this.pool.emit(
        position.clone().add(offset),
        config.count,
        color,
        config.lifetime,
        config.size
      );
    }

    // Add some lighter secondary particles for visual pop
    const secondaryColor = new THREE.Color(0xFFFFFF);
    this.pool.emit(
      position,
      Math.floor(config.count / 3),
      secondaryColor,
      config.lifetime * 0.5,
      config.size * 0.5
    );
  }

  update(dt: number): void {
    this.pool.update(dt);
  }

  clear(): void {
    this.pool.clear();
  }
}
