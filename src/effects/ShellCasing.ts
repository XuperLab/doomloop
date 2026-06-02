import * as THREE from 'three';
import { SHELL_CASING_LIFETIME } from '../utils/Constants';

export interface ShellCasingConfig {
  color: number;
  size: [number, number, number];
  mass: number;
  lifetime: number;
  ejectVelocity: THREE.Vector3;
  poolSize: number;
}

export const SHELL_CASING_CONFIGS: Record<string, ShellCasingConfig> = {
  plasma:  { color: 0x4488FF, size: [0.05, 0.08, 0.05], mass: 0.1, lifetime: SHELL_CASING_LIFETIME,
             ejectVelocity: new THREE.Vector3(0.3, 0.2, -0.5), poolSize: 30 },
  shotgun: { color: 0xDDDD88, size: [0.08, 0.12, 0.08], mass: 0.15, lifetime: SHELL_CASING_LIFETIME,
             ejectVelocity: new THREE.Vector3(0.4, 0.3, -0.6), poolSize: 20 },
  smg:     { color: 0xFF8800, size: [0.03, 0.05, 0.03], mass: 0.05, lifetime: SHELL_CASING_LIFETIME,
             ejectVelocity: new THREE.Vector3(0.2, 0.15, -0.3), poolSize: 40 },
  rocket:  { color: 0xFF4400, size: [0.1, 0.15, 0.1], mass: 0.2, lifetime: SHELL_CASING_LIFETIME,
             ejectVelocity: new THREE.Vector3(0.5, 0.3, -0.7), poolSize: 10 },
};

interface CasingInstance {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  isActive: boolean;
}

export class ShellCasing {
  private scene: THREE.Scene;
  private activeCasings: CasingInstance[] = [];
  private pool: CasingInstance[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // Pre-allocate pool (max pool across all weapon types)
    const totalPool = 40;
    for (let i = 0; i < totalPool; i++) {
      const boxGeo = new THREE.BoxGeometry(0.05, 0.08, 0.05);
      const boxMat = new THREE.MeshBasicMaterial({ color: 0x4488FF });
      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.visible = false;
      this.pool.push({
        mesh,
        velocity: new THREE.Vector3(),
        lifetime: 0,
        maxLifetime: 0,
        isActive: false,
      });
    }
  }

  emit(weaponType: string, position: THREE.Vector3): void {
    // Find a free casing from the pool
    const casing = this.pool.find(c => !c.isActive);
    if (!casing) return;

    const config = SHELL_CASING_CONFIGS[weaponType] ?? SHELL_CASING_CONFIGS.plasma;
    casing.mesh.geometry.dispose();
    casing.mesh.geometry = new THREE.BoxGeometry(...config.size);
    (casing.mesh.material as THREE.MeshBasicMaterial).color.setHex(config.color);

    casing.mesh.position.copy(position);
    casing.mesh.position.y += 0.3;

    // Randomize ejection velocity slightly
    casing.velocity.set(
      config.ejectVelocity.x + (Math.random() - 0.5) * 0.2,
      config.ejectVelocity.y + Math.random() * 0.1,
      config.ejectVelocity.z + (Math.random() - 0.5) * 0.2
    );

    casing.lifetime = config.lifetime;
    casing.maxLifetime = config.lifetime;
    casing.isActive = true;
    casing.mesh.visible = true;

    // Random rotation
    casing.mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    this.scene.add(casing.mesh);
    this.activeCasings.push(casing);
  }

  update(dt: number): void {
    for (let i = this.activeCasings.length - 1; i >= 0; i--) {
      const c = this.activeCasings[i];
      c.lifetime -= dt;
      c.velocity.y += -20 * dt; // Gravity

      c.mesh.position.x += c.velocity.x * dt;
      c.mesh.position.y += c.velocity.y * dt;
      c.mesh.position.z += c.velocity.z * dt;

      // Spin
      c.mesh.rotation.x += c.velocity.z * dt * 5;
      c.mesh.rotation.z += c.velocity.x * dt * 5;

      // Floor contact (simplified)
      if (c.mesh.position.y < 0.05) {
        c.mesh.position.y = 0.05;
        c.velocity.x *= 0.8;
        c.velocity.z *= 0.8;
        c.velocity.y *= -0.3;
      }

      // Fade and expire
      if (c.lifetime <= 0) {
        c.isActive = false;
        c.mesh.visible = false;
        this.scene.remove(c.mesh);
        this.activeCasings.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const c of this.activeCasings) {
      c.isActive = false;
      c.mesh.visible = false;
      this.scene.remove(c.mesh);
    }
    this.activeCasings.length = 0;
  }
}
