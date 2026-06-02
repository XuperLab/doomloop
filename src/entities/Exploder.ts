import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { COLLISION_GROUPS } from '../utils/Constants';

enum ExploderState {
  CHARGE,
  EXPLODE,
}

export class Exploder extends Entity {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  health: number;
  maxHealth: number;
  speed = 18; // 1.3x sprint speed
  target = new THREE.Vector3();

  private physicsWorld: PhysicsWorld;
  private state: ExploderState = ExploderState.CHARGE;
  private flashTimer = 0;
  private isFlashing = false;
  private pointLight: THREE.PointLight;
  private hissSoundTimer = 0;

  constructor(position: THREE.Vector3, physicsWorld: PhysicsWorld, healthMultiplier: number = 1) {
    super();
    this.physicsWorld = physicsWorld;
    this.maxHealth = Math.round(4 * healthMultiplier);
    this.health = this.maxHealth;

    // Visual — round, glowing red
    const geo = new THREE.SphereGeometry(0.6, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xFF4422,
      emissive: 0xFF2200,
      emissiveIntensity: 0.3,
      flatShading: true,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.position.y += 0.6;

    // Point light that intensifies as it gets closer
    this.pointLight = new THREE.PointLight(0xFF4400, 0.5, 5);
    this.pointLight.position.copy(position);
    this.pointLight.position.y += 0.6;

    // Physics body
    this.body = physicsWorld.createDynamicBody(
      new CANNON.Sphere(0.6),
      40,
      [position.x, position.y + 0.6, position.z],
      COLLISION_GROUPS.ENEMIES,
      COLLISION_GROUPS.PLAYER | COLLISION_GROUPS.ARENA | COLLISION_GROUPS.PLAYER_PROJECTILE | COLLISION_GROUPS.ENEMIES
    );
    this.body.fixedRotation = true;
    this.body.linearDamping = 0.8;
    this.body.updateMassProperties();
    (this.body as any).userData = { entity: this };
    physicsWorld.addBody(this.body);
  }

  getLight(): THREE.PointLight { return this.pointLight; }

  update(dt: number): void {
    if (!this.isAlive) return;

    const toTarget = new THREE.Vector3(
      this.target.x - this.body.position.x,
      0,
      this.target.z - this.body.position.z
    );
    const dist = toTarget.length();

    switch (this.state) {
      case ExploderState.CHARGE:
        // Move directly toward player
        if (dist > 0.5) {
          toTarget.normalize();
          this.body.velocity.x = toTarget.x * this.speed;
          this.body.velocity.z = toTarget.z * this.speed;
          this.faceTarget(toTarget);
        } else {
          this.body.velocity.x = 0;
          this.body.velocity.z = 0;
        }

        if (dist < 1.0) {
          this.state = ExploderState.EXPLODE;
        }

        // Increase light intensity as distance decreases
        const intensity = Math.max(0.5, Math.min(3, 3 - dist / 10));
        this.pointLight.intensity = intensity;
        break;

      case ExploderState.EXPLODE:
        this.explode();
        break;
    }

    // Sync light position
    this.pointLight.position.copy(this.mesh.position);

    // Flash effect
    if (this.isFlashing) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        const mat = this.mesh.material as THREE.MeshStandardMaterial;
        mat.color.setHex(0xFF4422);
        mat.emissiveIntensity = 0.3;
      }
    }

    this.syncMesh();
  }

  private faceTarget(toTarget: THREE.Vector3): void {
    if (toTarget.length() > 0.1) {
      this.mesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);
    }
  }

  private explode(): void {
    // AoE: 4-unit radius, 20 dmg to player, 5 dmg to other enemies
    // Handled by Game.ts collision/dispatch system
    this.isAlive = false;
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    this.health -= amount;
    this.flashTimer = 0.1;
    this.isFlashing = true;
    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    mat.color.setHex(0xFFFFFF);
    mat.emissiveIntensity = 1.0;

    if (this.health <= 0) {
      // Die with delayed explosion
      this.isAlive = false;
      // Explosion is triggered by Game.ts on death
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
