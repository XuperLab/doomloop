import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Weapon, SpreadResult } from './Weapon';
import { Entity } from '../entities/Entity';
import {
  WEAPON_CONFIGS,
  SHOTGUN_PELLET_MIN,
  SHOTGUN_PELLET_MAX,
  COLORS,
} from '../utils/Constants';

export class Shotgun extends Weapon {
  constructor(
    camera: THREE.PerspectiveCamera,
    physicsWorld: PhysicsWorld,
    owner: Entity,
  ) {
    super(camera, physicsWorld, owner, {
      name: WEAPON_CONFIGS.shotgun.name,
      damage: WEAPON_CONFIGS.shotgun.damage,
      fireRate: WEAPON_CONFIGS.shotgun.fireRate,
      maxAmmo: WEAPON_CONFIGS.shotgun.maxAmmo,
      projectileSpeed: WEAPON_CONFIGS.shotgun.projectileSpeed,
      spreadAngle: WEAPON_CONFIGS.shotgun.spreadAngle,
      projectileCount: WEAPON_CONFIGS.shotgun.projectileCount,
      isAutomatic: WEAPON_CONFIGS.shotgun.isAutomatic,
      icon: WEAPON_CONFIGS.shotgun.icon,
    });
  }

  getSpread(): SpreadResult {
    // Random pellet count between 5-8
    const pelletCount = SHOTGUN_PELLET_MIN + Math.floor(Math.random() * (SHOTGUN_PELLET_MAX - SHOTGUN_PELLET_MIN + 1));
    const directions: THREE.Vector3[] = [];
    for (let i = 0; i < pelletCount; i++) {
      const angleSpread = (Math.random() - 0.5) * this.spreadAngle * (Math.PI / 180);
      const verticalSpread = (Math.random() - 0.5) * this.spreadAngle * (Math.PI / 180);
      const dir = new THREE.Vector3(
        Math.sin(angleSpread),
        Math.sin(verticalSpread),
        Math.cos(angleSpread) * Math.cos(verticalSpread)
      ).normalize();
      directions.push(dir);
    }
    return { directions };
  }

  fire(playerPos: THREE.Vector3, lookDir: THREE.Vector3, scene: THREE.Scene): boolean {
    if (!this.checkCooldown() || this.ammo <= 0) return false;

    this.fireCooldownTimer = this.fireRate;
    this.ammo--;

    const spawnPos = playerPos.clone().add(lookDir.clone().multiplyScalar(0.5));
    const spread = this.getSpread();

    for (const dir of spread.directions) {
      // Rotate spread direction to match look direction
      const worldDir = new THREE.Vector3(
        lookDir.x + dir.x * 0.5,
        lookDir.y + dir.y * 0.5,
        lookDir.z + dir.z * 0.5
      ).normalize();

      const proj = this.createProjectile(
        spawnPos,
        worldDir,
        this.projectileSpeed,
        this.damage,
        0xFFFF88,
        0.08,
        2
      );
      scene.add(proj.mesh);
    }

    return true;
  }
}
