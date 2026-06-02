import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { ProjectileOwner, COLLISION_GROUPS, PLASMA_PROJECTILE_RADIUS } from '../utils/Constants';

export class Projectile extends Entity {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  speed: number;
  damage: number;
  owner: ProjectileOwner;
  direction: THREE.Vector3;
  lifetime: number;

  // AoE properties
  areaDamage?: number;
  areaRadius?: number;
  hitCallback?: (hitPoint: THREE.Vector3, hitEntity?: Entity) => void;

  private physicsWorld: PhysicsWorld;
  private wasHit = false;

  constructor(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    damage: number,
    owner: ProjectileOwner,
    lifetime: number,
    radius: number = PLASMA_PROJECTILE_RADIUS,
    physicsWorld: PhysicsWorld,
    color: number = 0x44ddff,
    areaDamage?: number,
    areaRadius?: number,
    hitCallback?: (hitPoint: THREE.Vector3, hitEntity?: Entity) => void
  ) {
    super();

    this.physicsWorld = physicsWorld;
    this.speed = speed;
    this.damage = damage;
    this.owner = owner;
    this.direction = direction.normalize();
    this.lifetime = lifetime;
    this.areaDamage = areaDamage;
    this.areaRadius = areaRadius;
    this.hitCallback = hitCallback;

    // Visual — glowing sphere
    const geo = new THREE.SphereGeometry(radius, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);

    // Physics body
    const bodyShape = new CANNON.Sphere(radius);
    this.body = physicsWorld.createDynamicBody(
      bodyShape,
      1,
      [position.x, position.y, position.z],
      owner === 'player' ? COLLISION_GROUPS.PLAYER_PROJECTILE : COLLISION_GROUPS.BOSS_PROJECTILE,
      owner === 'player'
        ? COLLISION_GROUPS.ARENA | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.FLYER
        : COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ARENA
    );
    (this.body as any).userData = { entity: this };
    this.body.sleepSpeedLimit = 0;
    this.body.sleepTimeLimit = 999;

    physicsWorld.addBody(this.body);
  }

  update(dt: number): void {
    if (!this.isAlive) return;

    // Move along direction at speed
    this.body.velocity.x = this.direction.x * this.speed;
    this.body.velocity.y = this.direction.y * this.speed;
    this.body.velocity.z = this.direction.z * this.speed;

    // Decrement lifetime
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.isAlive = false;
    }

    // Sync mesh to body
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
  }

  /** Called by collision system when projectile hits something */
  onHit(): void {
    if (this.wasHit) return;
    this.wasHit = true;
    const hitPos = this.mesh.position.clone();
    if (this.hitCallback) {
      this.hitCallback(hitPos, undefined);
    }
    this.isAlive = false;
  }

  takeDamage(_amount: number): void {
    // Projectiles don't take damage, they're destroyed on contact
    this.onHit();
  }

  die(): void {
    this.isAlive = false;
  }

  destroy(): void {
    this.isAlive = false;
    if (this.body) this.physicsWorld.removeBody(this.body);
    if (this.mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
  }
}
