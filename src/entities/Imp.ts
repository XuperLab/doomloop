import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import {
  IMP_SPEED,
  IMP_HEALTH,
  IMP_CONTACT_DAMAGE,
  IMP_KNOCKBACK_DURATION,
  COLLISION_GROUPS,
  COLORS,
} from '../utils/Constants';

export class Imp extends Entity {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  health = IMP_HEALTH;
  maxHealth = IMP_HEALTH;
  speed = IMP_SPEED;
  contactDamage = IMP_CONTACT_DAMAGE;
  target = new THREE.Vector3();

  private physicsWorld: PhysicsWorld;
  private knockbackTimer = 0;
  private flashTimer = 0;
  private isFlashing = false;

  constructor(position: THREE.Vector3, physicsWorld: PhysicsWorld) {
    super();

    this.physicsWorld = physicsWorld;

    // Visual mesh — short demon-like cylinder
    const geo = new THREE.CylinderGeometry(0.4, 0.6, 1.2, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS.IMP,
      flatShading: true,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.position.y += 0.6;

    // Physics body
    this.body = physicsWorld.createDynamicBody(
      new CANNON.Cylinder(0.4, 0.6, 1.2, 6),
      30,
      [position.x, position.y + 0.6, position.z],
      COLLISION_GROUPS.ENEMIES,
      COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ARENA | COLLISION_GROUPS.PLAYER_PROJECTILE
    );
    this.body.fixedRotation = true;
    this.body.linearDamping = 0.9; // High damping so it stops quickly
    this.body.updateMassProperties();
    (this.body as any).userData = { entity: this };

    physicsWorld.addBody(this.body);
  }

  update(dt: number): void {
    if (!this.isAlive) return;

    // Update knockback timer
    if (this.knockbackTimer > 0) {
      this.knockbackTimer -= dt;
      // During knockback, don't chase
      this.syncMesh();
      return;
    }

    // Chase player: move toward target
    const toTarget = new THREE.Vector3(
      this.target.x - this.body.position.x,
      0,
      this.target.z - this.body.position.z
    );

    const dist = toTarget.length();

    if (dist > 0.5) {
      toTarget.normalize();
      this.body.velocity.x = toTarget.x * this.speed;
      this.body.velocity.z = toTarget.z * this.speed;
    } else {
      this.body.velocity.x = 0;
      this.body.velocity.z = 0;
    }

    // Face target
    if (dist > 0.1) {
      const angle = Math.atan2(toTarget.x, toTarget.z);
      this.mesh.rotation.y = angle;
    }

    // Flash effect
    if (this.isFlashing) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(COLORS.IMP);
      }
    }

    this.syncMesh();
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    this.health -= amount;
    this.flashTimer = 0.1;
    this.isFlashing = true;
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);

    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  applyKnockback(from: THREE.Vector3): void {
    this.knockbackTimer = IMP_KNOCKBACK_DURATION;
    const dir = new THREE.Vector3(
      this.body.position.x - from.x,
      0,
      this.body.position.z - from.z
    ).normalize();
    this.body.velocity.x = dir.x * 15;
    this.body.velocity.z = dir.z * 15;
    this.body.velocity.y = 5;
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
