import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Weapon } from './Weapon';
import { Entity } from '../entities/Entity';
import {
  WEAPON_CONFIGS,
  ROCKET_AOE_RADIUS,
  ROCKET_SELF_DAMAGE_RADIUS,
  COLORS,
} from '../utils/Constants';

export class RocketLauncher extends Weapon {
  constructor(
    camera: THREE.PerspectiveCamera,
    physicsWorld: PhysicsWorld,
    owner: Entity,
  ) {
    super(camera, physicsWorld, owner, {
      name: WEAPON_CONFIGS.rocket.name,
      damage: WEAPON_CONFIGS.rocket.damage,
      fireRate: WEAPON_CONFIGS.rocket.fireRate,
      maxAmmo: WEAPON_CONFIGS.rocket.maxAmmo,
      projectileSpeed: WEAPON_CONFIGS.rocket.projectileSpeed,
      spreadAngle: WEAPON_CONFIGS.rocket.spreadAngle,
      projectileCount: WEAPON_CONFIGS.rocket.projectileCount,
      isAutomatic: WEAPON_CONFIGS.rocket.isAutomatic,
      icon: WEAPON_CONFIGS.rocket.icon,
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
      this.projectileSpeed,
      this.damage,
      0xFF4400,
      0.25,
      5,
      this.damage,
      ROCKET_AOE_RADIUS,
      (hitPoint: THREE.Vector3) => {
        // Create explosion point light
        const light = new THREE.PointLight(0xFF6600, 2, 10);
        light.position.copy(hitPoint);
        scene.add(light);
        setTimeout(() => {
          scene.remove(light);
          light.dispose();
        }, 300);
      }
    );
    scene.add(proj.mesh);

    return true;
  }
}
