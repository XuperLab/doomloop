import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Weapon } from './Weapon';
import { Entity } from '../entities/Entity';
import {
  PLASMA_PROJECTILE_SPEED,
  PLASMA_PROJECTILE_DAMAGE,
  PLASMA_PROJECTILE_LIFETIME,
  PLASMA_PROJECTILE_RADIUS,
  WEAPON_CONFIGS,
  COLORS,
} from '../utils/Constants';

export class PlasmaRifle extends Weapon {
  constructor(
    camera: THREE.PerspectiveCamera,
    physicsWorld: PhysicsWorld,
    owner: Entity,
  ) {
    super(camera, physicsWorld, owner, {
      name: WEAPON_CONFIGS.plasma.name,
      damage: WEAPON_CONFIGS.plasma.damage,
      fireRate: WEAPON_CONFIGS.plasma.fireRate,
      maxAmmo: WEAPON_CONFIGS.plasma.maxAmmo,
      projectileSpeed: WEAPON_CONFIGS.plasma.projectileSpeed,
      spreadAngle: WEAPON_CONFIGS.plasma.spreadAngle,
      projectileCount: WEAPON_CONFIGS.plasma.projectileCount,
      isAutomatic: WEAPON_CONFIGS.plasma.isAutomatic,
      icon: WEAPON_CONFIGS.plasma.icon,
    });
  }

  fire(playerPos: THREE.Vector3, lookDir: THREE.Vector3, scene: THREE.Scene): boolean {
    if (!this.checkCooldown() || this.ammo <= 0) return false;

    this.fireCooldownTimer = this.fireRate;
    this.ammo--;

    const spawnPos = playerPos.clone().add(lookDir.clone().multiplyScalar(1));
    const proj = this.createProjectile(
      spawnPos,
      lookDir,
      PLASMA_PROJECTILE_SPEED,
      PLASMA_PROJECTILE_DAMAGE,
      COLORS.PLAYER_PROJECTILE,
      PLASMA_PROJECTILE_RADIUS,
      PLASMA_PROJECTILE_LIFETIME
    );
    scene.add(proj.mesh);

    return true;
  }
}
