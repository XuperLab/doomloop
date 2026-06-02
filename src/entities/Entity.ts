import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export abstract class Entity {
  readonly id: string;
  abstract mesh: THREE.Mesh | THREE.Group;
  abstract body: CANNON.Body;
  isAlive = true;
  createdAt: number;

  private static nextId = 0;

  constructor() {
    this.id = 'ent_' + (Entity.nextId++);
    this.createdAt = performance.now();
  }

  abstract update(dt: number): void;

  /** Remove from scene + physics world (override to clean up) */
  destroy(): void {
    this.isAlive = false;
  }
}
