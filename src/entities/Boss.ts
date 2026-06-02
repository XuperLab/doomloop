import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { Projectile } from './Projectile';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import {
  BOSS_SPEED,
  BOSS_HEALTH,
  BOSS_PROJECTILE_DAMAGE,
  BOSS_FIRE_INTERVAL,
  BOSS_PROJECTILE_SPEED,
  BOSS_PROJECTILE_LIFETIME,
  BOSS_RADIUS,
  BOSS_HEIGHT,
  BOSS_PROJECTILE_RADIUS,
  COLLISION_GROUPS,
  COLORS,
} from '../utils/Constants';

export class Boss extends Entity {
  mesh: THREE.Group;
  body: CANNON.Body;
  health = BOSS_HEALTH;
  maxHealth = BOSS_HEALTH;
  moveSpeed = BOSS_SPEED;
  rangedDamage = BOSS_PROJECTILE_DAMAGE;
  target = new THREE.Vector3();
  fireCooldown = 0;

  private physicsWorld: PhysicsWorld;
  private flashTimer = 0;
  private isFlashing = false;
  private bodyMesh: THREE.Mesh;

  constructor(position: THREE.Vector3, physicsWorld: PhysicsWorld) {
    super();
    this.physicsWorld = physicsWorld;

    // Visual mesh group — larger, distinct from Imps
    this.mesh = new THREE.Group();

    // Main body (larger cylinder)
    const bodyGeo = new THREE.CylinderGeometry(BOSS_RADIUS * 0.8, BOSS_RADIUS * 1.2, BOSS_HEIGHT, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: COLORS.BOSS,
      flatShading: true,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.y = BOSS_HEIGHT / 2;
    this.mesh.add(this.bodyMesh);

    // Head (sphere on top)
    const headGeo = new THREE.SphereGeometry(0.6, 6, 6);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x993333,
      flatShading: true,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = BOSS_HEIGHT + 0.3;
    this.mesh.add(headMesh);

    // Shoulder spikes (4 small cones)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spikeGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
      const spikeMat = new THREE.MeshStandardMaterial({
        color: 0xaa2222,
        flatShading: true,
      });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(
        Math.cos(angle) * BOSS_RADIUS,
        BOSS_HEIGHT * 0.7,
        Math.sin(angle) * BOSS_RADIUS
      );
      spike.rotation.z = Math.PI / 4;
      spike.rotation.y = angle;
      this.mesh.add(spike);
    }

    this.mesh.position.copy(position);
    this.mesh.position.y += 0;

    // Physics body
    this.body = physicsWorld.createDynamicBody(
      new CANNON.Cylinder(BOSS_RADIUS * 0.8, BOSS_RADIUS * 1.2, BOSS_HEIGHT, 8),
      200,
      [position.x, position.y + BOSS_HEIGHT / 2, position.z],
      COLLISION_GROUPS.ENEMIES,
      COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ARENA | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.ENEMIES
    );
    this.body.fixedRotation = true;
    this.body.linearDamping = 0.8;
    this.body.updateMassProperties();
    (this.body as any).userData = { entity: this };

    physicsWorld.addBody(this.body);
  }

  update(dt: number): void {
    if (!this.isAlive) return;

    // Move toward target at slow speed
    const toTarget = new THREE.Vector3(
      this.target.x - this.body.position.x,
      0,
      this.target.z - this.body.position.z
    );
    const dist = toTarget.length();

    if (dist > 3) {
      // Move closer if too far
      toTarget.normalize();
      this.body.velocity.x = toTarget.x * this.moveSpeed;
      this.body.velocity.z = toTarget.z * this.moveSpeed;
    } else {
      // Stay at range and strafe slightly
      this.body.velocity.x *= 0.9;
      this.body.velocity.z *= 0.9;
    }

    // Face target
    if (dist > 0.1) {
      const angle = Math.atan2(toTarget.x, toTarget.z);
      this.mesh.rotation.y = angle;
    }

    // Fire projectile on cooldown
    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && dist < 30) {
      this.fireProjectile();
      this.fireCooldown = BOSS_FIRE_INTERVAL;
    }

    // Flash effect
    if (this.isFlashing) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(COLORS.BOSS);
      }
    }

    this.syncMesh();
  }

  fireProjectile(): Projectile {
    const dir = new THREE.Vector3(
      this.target.x - this.body.position.x,
      this.target.y - this.body.position.y - BOSS_HEIGHT / 2,
      this.target.z - this.body.position.z
    ).normalize();

    const spawnPos = new THREE.Vector3(
      this.body.position.x,
      this.body.position.y + BOSS_HEIGHT / 2,
      this.body.position.z
    );

    const proj = new Projectile(
      spawnPos,
      dir,
      BOSS_PROJECTILE_SPEED,
      BOSS_PROJECTILE_DAMAGE,
      'boss',
      BOSS_PROJECTILE_LIFETIME,
      BOSS_PROJECTILE_RADIUS,
      this.physicsWorld,
      COLORS.BOSS_PROJECTILE
    );

    return proj;
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    this.health -= amount;
    this.flashTimer = 0.1;
    this.isFlashing = true;
    (this.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);

    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  private syncMesh(): void {
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y - BOSS_HEIGHT / 2,
      this.body.position.z
    );
  }

  destroy(): void {
    this.isAlive = false;
    if (this.body) this.physicsWorld.removeBody(this.body);
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
