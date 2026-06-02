import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Weapon } from './Weapon';
import { Entity } from '../entities/Entity';
import {
  WEAPON_CONFIGS,
  COLORS,
} from '../utils/Constants';

export class SMG extends Weapon {
  constructor(
    camera: THREE.PerspectiveCamera,
    physicsWorld: PhysicsWorld,
    owner: Entity,
  ) {
    super(camera, physicsWorld, owner, {
      name: WEAPON_CONFIGS.smg.name,
      damage: WEAPON_CONFIGS.smg.damage,
      fireRate: WEAPON_CONFIGS.smg.fireRate,
      maxAmmo: WEAPON_CONFIGS.smg.maxAmmo,
      projectileSpeed: WEAPON_CONFIGS.smg.projectileSpeed,
      spreadAngle: WEAPON_CONFIGS.smg.spreadAngle,
      projectileCount: WEAPON_CONFIGS.smg.projectileCount,
      isAutomatic: WEAPON_CONFIGS.smg.isAutomatic,
      icon: WEAPON_CONFIGS.smg.icon,
    });
  }

  fire(playerPos: THREE.Vector3, lookDir: THREE.Vector3, scene: THREE.Scene): boolean {
    if (!this.checkCooldown() || this.ammo <= 0) return false;

    this.fireCooldownTimer = this.fireRate;
    this.ammo--;

    const spawnPos = playerPos.clone().add(lookDir.clone().multiplyScalar(0.5));
    // Small random spread
    const spread = (Math.random() - 0.5) * this.spreadAngle * (Math.PI / 180);
    const vertSpread = (Math.random() - 0.5) * this.spreadAngle * (Math.PI / 180);
    const dir = new THREE.Vector3(
      lookDir.x + Math.sin(spread),
      lookDir.y + Math.sin(vertSpread),
      lookDir.z + Math.cos(spread) * Math.cos(vertSpread)
    ).normalize();

    const proj = this.createProjectile(
      spawnPos,
      dir,
      this.projectileSpeed,
      this.damage,
      0xFF8800,
      0.08,
      2
    );
    scene.add(proj.mesh);

    return true;
  }
}
