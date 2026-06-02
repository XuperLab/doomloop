import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { Projectile } from './Projectile';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import {
  COLLISION_GROUPS,
  COLORS,
} from '../utils/Constants';

enum ShooterState {
  CHASE,
  AIM,
  FIRE,
  REPOSITION,
}

export class ShooterImp extends Entity {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  health: number;
  maxHealth: number;
  speed = 11; // 0.8x sprint speed
  contactDamage = 8;
  target = new THREE.Vector3();

  private physicsWorld: PhysicsWorld;
  private state: ShooterState = ShooterState.CHASE;
  private aimTimer = 0;
  private repositionTimer = 0;
  private flashTimer = 0;
  private isFlashing = false;

  constructor(position: THREE.Vector3, physicsWorld: PhysicsWorld, healthMultiplier: number = 1) {
    super();
    this.physicsWorld = physicsWorld;
    this.maxHealth = Math.round(5 * healthMultiplier);
    this.health = this.maxHealth;

    // Visual — taller, thinner than Imp
    const geo = new THREE.CylinderGeometry(0.35, 0.5, 1.5, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x88AA44,
      flatShading: true,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.position.y += 0.75;

    // Physics body
    this.body = physicsWorld.createDynamicBody(
      new CANNON.Cylinder(0.35, 0.5, 1.5, 6),
      25,
      [position.x, position.y + 0.75, position.z],
      COLLISION_GROUPS.ENEMIES,
      COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ARENA | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.ENEMIES
    );
    this.body.fixedRotation = true;
    this.body.linearDamping = 0.9;
    this.body.updateMassProperties();
    (this.body as any).userData = { entity: this };
    physicsWorld.addBody(this.body);
  }

  update(dt: number): void {
    if (!this.isAlive) return;

    const toTarget = new THREE.Vector3(
      this.target.x - this.body.position.x,
      0,
      this.target.z - this.body.position.z
    );
    const dist = toTarget.length();

    switch (this.state) {
      case ShooterState.CHASE:
        if (dist <= 15) {
          this.state = ShooterState.AIM;
          this.aimTimer = 0;
        } else {
          // Move toward player
          toTarget.normalize();
          this.body.velocity.x = toTarget.x * this.speed;
          this.body.velocity.z = toTarget.z * this.speed;
          this.faceTarget(toTarget);
        }
        break;

      case ShooterState.AIM:
        this.body.velocity.x = 0;
        this.body.velocity.z = 0;
        this.aimTimer += dt;
        this.faceTarget(toTarget);
        if (this.aimTimer >= 0.5) {
          this.state = ShooterState.FIRE;
        }
        break;

      case ShooterState.FIRE:
        this.fireProjectile();
        this.aimTimer = 0;
        this.state = ShooterState.REPOSITION;
        this.repositionTimer = 1;
        break;

      case ShooterState.REPOSITION:
        // Strafe sideways
        this.repositionTimer -= dt;
        const strafeDir = new THREE.Vector3(-toTarget.z, 0, toTarget.x).normalize();
        this.body.velocity.x = strafeDir.x * this.speed * 0.6;
        this.body.velocity.z = strafeDir.z * this.speed * 0.6;
        if (this.repositionTimer <= 0) {
          this.state = ShooterState.CHASE;
        }
        break;
    }

    // Flash effect
    if (this.isFlashing) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x88AA44);
      }
    }

    this.syncMesh();
  }

  private faceTarget(toTarget: THREE.Vector3): void {
    if (toTarget.length() > 0.1) {
      this.mesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);
    }
  }

  private fireProjectile(): void {
    const dir = new THREE.Vector3(
      this.target.x - this.body.position.x,
      this.target.y - this.body.position.y,
      this.target.z - this.body.position.z
    ).normalize();

    const spawnPos = new THREE.Vector3(
      this.body.position.x,
      this.body.position.y + 1.0,
      this.body.position.z
    );

    const proj = new Projectile(
      spawnPos,
      dir,
      20, // speed
      8,  // damage
      'boss',
      3,
      0.15,
      this.physicsWorld,
      0x99CC44
    );
    // No need to add to scene — Game.ts will handle it via projectile tracking
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
