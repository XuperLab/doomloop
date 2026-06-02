import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import {
  HEALTH_PACK_HEAL,
  HEALTH_PACK_RADIUS,
  COLLISION_GROUPS,
  COLORS,
} from '../utils/Constants';

export class HealthPack extends Entity {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  healAmount = HEALTH_PACK_HEAL;
  consumed = false;
  pulsePhase = 0;

  private physicsWorld: PhysicsWorld;

  constructor(position: THREE.Vector3, physicsWorld: PhysicsWorld) {
    super();

    this.physicsWorld = physicsWorld;

    // Visual — green glowing cylinder
    const geo = new THREE.CylinderGeometry(HEALTH_PACK_RADIUS, HEALTH_PACK_RADIUS, 0.3, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS.HEALTH_PACK,
      emissive: COLORS.HEALTH_PACK,
      emissiveIntensity: 0.5,
      flatShading: true,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.position.y += 0.15;

    // Physics body — trigger-like, just needs to detect overlap
    this.body = physicsWorld.createDynamicBody(
      new CANNON.Cylinder(HEALTH_PACK_RADIUS, HEALTH_PACK_RADIUS, 0.3, 8),
      0, // mass 0 = static, but we use collision group properly
      [position.x, position.y + 0.15, position.z],
      COLLISION_GROUPS.HEALTH_PACK,
      COLLISION_GROUPS.PLAYER
    );
    (this.body as any).userData = { entity: this };
    this.body.sleepSpeedLimit = 0;

    physicsWorld.addBody(this.body);
  }

  update(dt: number): void {
    if (!this.isAlive || this.consumed) return;

    // Rotate and pulse animation
    this.pulsePhase += dt * 2;
    this.mesh.rotation.y += dt * 1.5;

    // Scale pulse
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.15;
    this.mesh.scale.set(pulse, pulse, pulse);

    // Sync position from physics body
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
  }

  onConsumed(): void {
    this.consumed = true;
    this.isAlive = false;
    this.mesh.visible = false;
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
