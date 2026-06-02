import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { DeathBurst } from './DeathBurst';
import {
  DEATH_FRAGMENT_COUNT,
  DEATH_FRAGMENT_LIFETIME,
  DEATH_FRAGMENT_SPEED,
  COLORS,
} from '../utils/Constants';

interface Fragment {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  angularVelocity: THREE.Vector3;
}

export class DeathEffect {
  private scene: THREE.Scene;
  private physicsWorld: PhysicsWorld;
  private fragments: Fragment[] = [];
  private deathBurst: DeathBurst;

  constructor(scene: THREE.Scene, physicsWorld: PhysicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.deathBurst = new DeathBurst(scene);
  }

  /** Spawn imp death fragments */
  spawnImp(position: THREE.Vector3): void {
    this.deathBurst.emit('imp', position);
    this.spawnFragments(position, COLORS.IMP, DEATH_FRAGMENT_COUNT.IMP, DEATH_FRAGMENT_SPEED);
  }

  /** Spawn boss death explosion */
  spawnBoss(position: THREE.Vector3): void {
    this.deathBurst.emit('boss', position);
    this.spawnFragments(position, COLORS.BOSS, DEATH_FRAGMENT_COUNT.BOSS, DEATH_FRAGMENT_SPEED * 1.5);
    this.spawnFragments(position, 0xff6622, 8, DEATH_FRAGMENT_SPEED * 2);
  }

  /** Spawn ShooterImp death */
  spawnShooterImp(position: THREE.Vector3): void {
    this.deathBurst.emit('shooter_imp', position);
    this.spawnFragments(position, 0x88AA44, 8, DEATH_FRAGMENT_SPEED);
  }

  /** Spawn Exploder death (bigger explosion) */
  spawnExploder(position: THREE.Vector3): void {
    this.deathBurst.emit('exploder', position);
    this.spawnFragments(position, 0xFF4422, 12, DEATH_FRAGMENT_SPEED * 1.3);
  }

  /** Spawn Flyer death */
  spawnFlyer(position: THREE.Vector3): void {
    this.deathBurst.emit('flyer', position);
    this.spawnFragments(position, 0x8844CC, 8, DEATH_FRAGMENT_SPEED);
  }

  private spawnFragments(
    position: THREE.Vector3,
    color: number,
    count: number,
    speed: number
  ): void {
    for (let i = 0; i < count; i++) {
      const size = 0.1 + Math.random() * 0.2;
      const geo = new THREE.BoxGeometry(size, size, size);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(position);
      mesh.position.x += (Math.random() - 0.5) * 0.3;
      mesh.position.y += (Math.random() - 0.5) * 0.3;
      mesh.position.z += (Math.random() - 0.5) * 0.3;

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * speed * 2,
        Math.random() * speed,
        (Math.random() - 0.5) * speed * 2
      );

      const angularVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      this.scene.add(mesh);
      this.fragments.push({
        mesh,
        velocity,
        lifetime: DEATH_FRAGMENT_LIFETIME,
        angularVelocity,
      });
    }
  }

  update(dt: number): void {
    this.deathBurst.update(dt);

    for (let i = this.fragments.length - 1; i >= 0; i--) {
      const f = this.fragments[i];
      f.lifetime -= dt;
      f.velocity.y += -20 * dt;
      f.mesh.position.add(f.velocity.clone().multiplyScalar(dt));
      f.mesh.rotation.x += f.angularVelocity.x * dt;
      f.mesh.rotation.y += f.angularVelocity.y * dt;
      f.mesh.rotation.z += f.angularVelocity.z * dt;

      const alpha = Math.max(0, f.lifetime / DEATH_FRAGMENT_LIFETIME);
      const mat = f.mesh.material;
      if (!Array.isArray(mat)) {
        mat.transparent = true;
        mat.opacity = alpha;
      }

      if (f.lifetime <= 0) {
        this.scene.remove(f.mesh);
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE.Material).dispose();
        this.fragments.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const f of this.fragments) {
      this.scene.remove(f.mesh);
      f.mesh.geometry.dispose();
      (f.mesh.material as THREE.Material).dispose();
    }
    this.fragments.length = 0;
    this.deathBurst.clear();
  }
}
