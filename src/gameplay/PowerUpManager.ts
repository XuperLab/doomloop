import * as THREE from 'three';
import { POWER_UP_CONFIGS, POWER_UP_RESPAWN_TIME, COLORS } from '../utils/Constants';

export type PowerUpType = 'speed_boost' | 'double_damage' | 'shield' | 'health_pack';

export interface PowerUp {
  type: PowerUpType;
  position: THREE.Vector3;
  duration: number;
  mesh: THREE.Mesh;
  color: THREE.Color;
  isCollected: boolean;
  bobPhase: number;
}

export interface ActiveEffect {
  type: PowerUpType;
  remaining: number;
  duration: number;
  onExpire: () => void;
}

export class PowerUpManager {
  activePowerUp: PowerUp | null = null;
  activeEffects: ActiveEffect[] = [];
  nextSpawnTimer = 5; // Initial spawn after 5 seconds
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  setTimeScale(scale: number): void {
    // Scale spawn timers by difficulty
    this.nextSpawnTimer = this.nextSpawnTimer > 0 ? this.nextSpawnTimer * scale : 5;
  }

  update(dt: number, playerPos: THREE.Vector3, collectionRadius: number = 1.5): void {
    // Tick active effects
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.remaining -= dt;
      if (effect.remaining <= 0) {
        effect.onExpire();
        this.activeEffects.splice(i, 1);
      }
    }

    // Spawn check
    this.nextSpawnTimer -= dt;
    if (this.activePowerUp === null && this.nextSpawnTimer <= 0) {
      this.spawnPowerUp();
    }

    // Animate existing power-up
    if (this.activePowerUp && !this.activePowerUp.isCollected) {
      this.activePowerUp.bobPhase += dt * 2;
      this.activePowerUp.mesh.position.y =
        this.activePowerUp.position.y + 0.5 + Math.sin(this.activePowerUp.bobPhase) * 0.3;
      this.activePowerUp.mesh.rotation.y += dt;

      // Collection check
      const dist = playerPos.distanceTo(this.activePowerUp.position);
      if (dist < collectionRadius) {
        this.collectPowerUp(this.activePowerUp.type);
      }
    }
  }

  spawnPowerUp(): void {
    const types: PowerUpType[] = ['speed_boost', 'double_damage', 'shield', 'health_pack'];
    const weights = [0.30, 0.25, 0.25, 0.20];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;
    let selectedType: PowerUpType = 'speed_boost';
    for (let i = 0; i < types.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        selectedType = types[i];
        break;
      }
    }

    const config = POWER_UP_CONFIGS[selectedType];
    if (!config) return;

    // Random position within arena bounds
    const arenaHalf = 15;
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * arenaHalf * 2,
      0.5,
      (Math.random() - 0.5) * arenaHalf * 2
    );

    // Visual: glowing floating orb
    const geo = new THREE.SphereGeometry(0.25, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: config.color,
      emissive: config.color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.position.y += 0.5;

    this.scene.add(mesh);

    this.activePowerUp = {
      type: selectedType,
      position: pos,
      duration: config.duration,
      mesh,
      color: new THREE.Color(config.color),
      isCollected: false,
      bobPhase: 0,
    };
    this.nextSpawnTimer = 0;
  }

  collectPowerUp(type: PowerUpType): void {
    if (!this.activePowerUp || this.activePowerUp.isCollected) return;

    this.activePowerUp.isCollected = true;
    this.scene.remove(this.activePowerUp.mesh);
    this.activePowerUp.mesh.geometry.dispose();
    (this.activePowerUp.mesh.material as THREE.Material).dispose();

    if (type === 'health_pack') {
      // Instant — no timer
      this.nextSpawnTimer = POWER_UP_RESPAWN_TIME;
      this.activePowerUp = null;
      return;
    }

    const config = POWER_UP_CONFIGS[type];
    const duration = config?.duration ?? 8;

    this.activeEffects.push({
      type,
      remaining: duration,
      duration,
      onExpire: () => this.revertEffect(type),
    });

    this.nextSpawnTimer = POWER_UP_RESPAWN_TIME;
    this.activePowerUp = null;
  }

  private revertEffect(type: PowerUpType): void {
    // Effect reversion is handled by Player reading activeEffects array
    // This is a no-op here; Player checks active effects each frame
  }

  hasActiveEffect(type: PowerUpType): boolean {
    return this.activeEffects.some(e => e.type === type);
  }

  getActiveEffectTime(type: PowerUpType): number {
    const effect = this.activeEffects.find(e => e.type === type);
    return effect ? effect.remaining / effect.duration : 0;
  }

  clear(): void {
    if (this.activePowerUp && !this.activePowerUp.isCollected) {
      this.scene.remove(this.activePowerUp.mesh);
      this.activePowerUp.mesh.geometry.dispose();
      (this.activePowerUp.mesh.material as THREE.Material).dispose();
    }
    this.activePowerUp = null;
    this.activeEffects = [];
    this.nextSpawnTimer = 5;
  }
}
