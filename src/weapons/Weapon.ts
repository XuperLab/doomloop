import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Projectile } from '../entities/Projectile';
import { Entity } from '../entities/Entity';
import { COLLISION_GROUPS } from '../utils/Constants';

export interface SpreadResult {
  directions: THREE.Vector3[];
}

export abstract class Weapon {
  name: string;
  damage: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  projectileSpeed: number;
  spreadAngle: number;
  projectileCount: number;
  isAutomatic: boolean;
  icon: string;

  protected fireCooldownTimer = 0;
  protected switchCooldownTimer = 0;
  /** Projectiles created this tick (consumed by Game.ts for tracking) */
  lastCreatedProjectiles: Projectile[] = [];
  protected camera: THREE.PerspectiveCamera;
  protected physicsWorld: PhysicsWorld;
  protected owner: Entity;

  constructor(
    camera: THREE.PerspectiveCamera,
    physicsWorld: PhysicsWorld,
    owner: Entity,
    config: {
      name: string;
      damage: number;
      fireRate: number;
      maxAmmo: number;
      projectileSpeed: number;
      spreadAngle: number;
      projectileCount: number;
      isAutomatic: boolean;
      icon: string;
    }
  ) {
    this.name = config.name;
    this.damage = config.damage;
    this.fireRate = config.fireRate;
    this.ammo = config.maxAmmo;
    this.maxAmmo = config.maxAmmo;
    this.projectileSpeed = config.projectileSpeed;
    this.spreadAngle = config.spreadAngle;
    this.projectileCount = config.projectileCount;
    this.isAutomatic = config.isAutomatic;
    this.icon = config.icon;

    this.camera = camera;
    this.physicsWorld = physicsWorld;
    this.owner = owner;
  }

  abstract fire(playerPos: THREE.Vector3, playerLookDir: THREE.Vector3, scene: THREE.Scene): boolean;

  update(dt: number): void {
    if (this.fireCooldownTimer > 0) this.fireCooldownTimer -= dt;
    if (this.switchCooldownTimer > 0) this.switchCooldownTimer -= dt;
  }

  getName(): string { return this.name; }
  getIcon(): string { return this.icon; }
  getAmmo(): number { return this.ammo; }
  getMaxAmmo(): number { return this.maxAmmo; }

  getSpread(): SpreadResult {
    const directions: THREE.Vector3[] = [];
    const count = this.projectileCount;
    for (let i = 0; i < count; i++) {
      const angleSpread = (Math.random() - 0.5) * this.spreadAngle * (Math.PI / 180);
      const verticalSpread = (Math.random() - 0.5) * this.spreadAngle * (Math.PI / 180);
      // Base direction is Z-forward (will be rotated by caller)
      const dir = new THREE.Vector3(
        Math.sin(angleSpread),
        Math.sin(verticalSpread),
        Math.cos(angleSpread) * Math.cos(verticalSpread)
      ).normalize();
      directions.push(dir);
    }
    return { directions };
  }

  getProjectileSpeed(): number { return this.projectileSpeed; }

  isOnCooldown(): boolean { return this.fireCooldownTimer > 0; }
  isOnSwitchCooldown(): boolean { return this.switchCooldownTimer > 0; }

  addAmmo(amount: number): void {
    this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
  }

  protected checkCooldown(): boolean {
    return this.fireCooldownTimer <= 0 && this.switchCooldownTimer <= 0;
  }

  protected createProjectile(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    damage: number,
    color: number = 0x44ddff,
    radius: number = 0.15,
    lifetime: number = 3,
    areaDamage?: number,
    areaRadius?: number,
    onHit?: (hitPoint: THREE.Vector3, hitEntity?: Entity) => void
  ): Projectile {
    const proj = new Projectile(
      position,
      direction,
      speed,
      damage,
      'player',
      lifetime,
      radius,
      this.physicsWorld,
      color,
      areaDamage,
      areaRadius,
      onHit
    );
    this.lastCreatedProjectiles.push(proj);
    return proj;
  }
}
