import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export abstract class Entity {
  readonly id: string;
  abstract mesh: THREE.Mesh | THREE.Group;
  abstract body: CANNON.Body;
  isAlive = true;
  createdAt: number;

  // Sprint 4: Standardized HP/MP for all entities
  health: number = 1;
  maxHealth: number = 1;

  private static nextId = 0;

  constructor() {
    this.id = 'ent_' + (Entity.nextId++);
    this.createdAt = performance.now();
  }

  abstract update(dt: number): void;

  /** Sprint 4: Standardized damage method */
  abstract takeDamage(amount: number): void;

  /** Sprint 4: Standardized death behavior */
  abstract die(): void;

  /** Remove from scene + physics world (override to clean up) */
  destroy(): void {
    this.isAlive = false;
  }
}
