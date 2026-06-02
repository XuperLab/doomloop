import * as THREE from 'three';
import { Camera } from '../engine/Camera';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Projectile } from '../entities/Projectile';
import { Entity } from '../entities/Entity';
import {
  PLASMA_FIRE_INTERVAL,
  PLASMA_PROJECTILE_SPEED,
  PLASMA_PROJECTILE_DAMAGE,
  PLASMA_PROJECTILE_LIFETIME,
  PLASMA_CROSSHAIR_BLOOM_RECOVERY,
  PLASMA_PROJECTILE_RADIUS,
  COLORS,
} from '../utils/Constants';

export class PlasmaRifle {
  fireRate = PLASMA_FIRE_INTERVAL;
  lastFireTime = 0;
  crosshairBloom = 0;

  private camera: Camera;
  private physicsWorld: PhysicsWorld;
  private owner: Entity;

  constructor(camera: Camera, physicsWorld: PhysicsWorld, owner: Entity) {
    this.camera = camera;
    this.physicsWorld = physicsWorld;
    this.owner = owner;
  }

  canFire(): boolean {
    const now = performance.now() / 1000;
    return now - this.lastFireTime >= this.fireRate;
  }

  fire(): Projectile | null {
    if (!this.canFire()) return null;

    const now = performance.now() / 1000;
    this.lastFireTime = now;

    // Spawn projectile from camera position in look direction
    const lookDir = this.camera.getLookDirection();
    const spawnPos = this.camera.camera.position.clone();

    // Offset slightly forward so it doesn't clip into the camera
    spawnPos.add(lookDir.clone().multiplyScalar(1));

    const proj = new Projectile(
      spawnPos,
      lookDir,
      PLASMA_PROJECTILE_SPEED,
      PLASMA_PROJECTILE_DAMAGE,
      'player',
      PLASMA_PROJECTILE_LIFETIME,
      PLASMA_PROJECTILE_RADIUS,
      this.physicsWorld,
      COLORS.PLAYER_PROJECTILE
    );

    // Set crosshair bloom
    this.crosshairBloom = 1;

    return proj;
  }

  update(dt: number): void {
    // Recover crosshair bloom
    if (this.crosshairBloom > 0) {
      this.crosshairBloom = Math.max(
        0,
        this.crosshairBloom - (dt / PLASMA_CROSSHAIR_BLOOM_RECOVERY)
      );
    }
  }
}
