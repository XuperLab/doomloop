import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { COLLISION_GROUPS } from '../utils/Constants';

enum FlyerState {
  HOVER,
  CIRCLE,
  DIVE,
  CLIMB,
}

export class Flyer extends Entity {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  health: number;
  maxHealth: number;
  target = new THREE.Vector3();

  private physicsWorld: PhysicsWorld;
  private state: FlyerState = FlyerState.HOVER;
  private stateTimer = 0;
  private diveCooldown = 0;
  private circleAngle = 0;
  private baseY: number;
  private flashTimer = 0;
  private isFlashing = false;

  constructor(position: THREE.Vector3, physicsWorld: PhysicsWorld, healthMultiplier: number = 1) {
    super();
    this.physicsWorld = physicsWorld;
    this.maxHealth = Math.round(6 * healthMultiplier);
    this.health = this.maxHealth;
    this.baseY = position.y + 6 + Math.random() * 4; // 6-10 units high

    // Visual — flat, winged shape
    const geo = new THREE.ConeGeometry(0.5, 0.3, 4);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8844CC,
      flatShading: true,
      emissive: 0x442266,
      emissiveIntensity: 0.3,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(position.x, this.baseY, position.z);

    // Physics body — Flyer uses collision group 0x010
    this.body = physicsWorld.createDynamicBody(
      new CANNON.Sphere(0.5),
      10,
      [position.x, this.baseY, position.z],
      COLLISION_GROUPS.FLYER,
      COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ARENA | COLLISION_GROUPS.PLAYER_PROJECTILE
    );
    this.body.fixedRotation = true;
    this.body.linearDamping = 0.6;
    this.body.updateMassProperties();
    (this.body as any).userData = { entity: this };
    // Flyer doesn't collide with ground or other enemies
    physicsWorld.addBody(this.body);
  }

  update(dt: number): void {
    if (!this.isAlive) return;

    const targetXZ = new THREE.Vector3(
      this.target.x - this.body.position.x,
      0,
      this.target.z - this.body.position.z
    );
    const horizDist = targetXZ.length();
    const toTarget = new THREE.Vector3(
      this.target.x - this.body.position.x,
      this.target.y - this.body.position.y,
      this.target.z - this.body.position.z
    );

    this.stateTimer -= dt;
    this.diveCooldown -= dt;

    switch (this.state) {
      case FlyerState.HOVER:
        // Maintain height, gentle bobbing
        const hoverBob = Math.sin(performance.now() / 500) * 0.3;
        this.body.position.y = this.baseY + hoverBob;
        this.body.velocity.y = 0;

        // Move toward player XZ slowly
        if (horizDist > 2) {
          targetXZ.normalize();
          this.body.velocity.x = targetXZ.x * 4;
          this.body.velocity.z = targetXZ.z * 4;
        } else {
          this.body.velocity.x *= 0.9;
          this.body.velocity.z *= 0.9;
        }

        if (horizDist < 8 && this.diveCooldown <= 0) {
          this.state = FlyerState.CIRCLE;
          this.circleAngle = Math.atan2(targetXZ.x, targetXZ.z);
          this.stateTimer = 2;
        }
        break;

      case FlyerState.CIRCLE:
        // Orbit player in sine-wave horizontal path
        this.circleAngle += dt * Math.PI; // Full circle in 2s
        const circleRadius = 5;
        const circleX = this.target.x + Math.cos(this.circleAngle) * circleRadius;
        const circleZ = this.target.z + Math.sin(this.circleAngle) * circleRadius;
        const dx = circleX - this.body.position.x;
        const dz = circleZ - this.body.position.z;
        this.body.velocity.x = dx * 3;
        this.body.velocity.z = dz * 3;
        this.body.position.y = this.baseY + Math.sin(this.circleAngle * 2) * 1;

        if (horizDist < 5 && this.diveCooldown <= 0) {
          this.state = FlyerState.DIVE;
          this.stateTimer = 1;
        } else if (this.stateTimer <= 0) {
          this.state = FlyerState.HOVER;
        }
        break;

      case FlyerState.DIVE:
        // Dive toward player at high speed
        if (toTarget.length() > 0.5) {
          const diveDir = toTarget.clone().normalize();
          this.body.velocity.x = diveDir.x * 30;
          this.body.velocity.y = diveDir.y * 30;
          this.body.velocity.z = diveDir.z * 30;
        }

        // End dive on ground contact or timeout
        if (this.body.position.y <= 1 || this.stateTimer <= 0) {
          this.state = FlyerState.CLIMB;
          this.stateTimer = 1;
        }
        break;

      case FlyerState.CLIMB:
        // Ascend back to hover height
        this.body.velocity.y = 10;
        if (this.body.position.y >= this.baseY - 1) {
          this.body.velocity.y = 0;
          this.body.position.y = this.baseY;
          this.diveCooldown = 3;
          this.state = FlyerState.HOVER;
        }
        // Drift back toward player XZ
        if (horizDist > 2) {
          targetXZ.normalize();
          this.body.velocity.x = targetXZ.x * 5;
          this.body.velocity.z = targetXZ.z * 5;
        }
        break;
    }

    // Face movement direction
    const moveDir = new THREE.Vector3(
      this.body.velocity.x,
      0,
      this.body.velocity.z
    );
    if (moveDir.length() > 0.1) {
      this.mesh.rotation.y = Math.atan2(moveDir.x, moveDir.z);
    }

    // Flash effect
    if (this.isFlashing) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x8844CC);
      }
    }

    this.syncMesh();
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    this.health -= amount;
    this.flashTimer = 0.1;
    this.isFlashing = true;
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xFFFFFF);
    if (this.health <= 0) {
      this.die();
    }
  }

  die(): void {
    this.isAlive = false;
  }

  private syncMesh(): void {
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
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
