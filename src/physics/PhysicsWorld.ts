import * as CANNON from 'cannon-es';
import { GRAVITY, PHYSICS_SOLVER_ITERATIONS, COLLISION_GROUPS } from '../utils/Constants';
import * as THREE from 'three';

export interface CollisionPair {
  bodyA: CANNON.Body;
  bodyB: CANNON.Body;
}

export class PhysicsWorld {
  readonly world: CANNON.World;
  private collisionHandlers: Array<(pair: CollisionPair) => void> = [];

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, GRAVITY, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.allowSleep = true;
    (this.world.solver as any).iterations = PHYSICS_SOLVER_ITERATIONS;

    // Default contact material
    const defaultMat = new CANNON.Material('default');
    const contactMat = new CANNON.ContactMaterial(defaultMat, defaultMat, {
      friction: 0.3,
      restitution: 0.0,
    });
    this.world.addContactMaterial(contactMat);

    // Listen for collisions
    this.world.addEventListener('postStep', () => {
      this.processCollisions();
    });
  }

  /** Register a collision handler */
  onCollide(handler: (pair: CollisionPair) => void): void {
    this.collisionHandlers.push(handler);
  }

  addBody(body: CANNON.Body): void {
    this.world.addBody(body);
  }

  removeBody(body: CANNON.Body): void {
    this.world.removeBody(body);
  }

  /** Step physics simulation */
  step(dt: number): void {
    this.world.step(dt, dt, 3);
  }

  /** Clear all bodies */
  clear(): void {
    while (this.world.bodies.length > 0) {
      this.world.removeBody(this.world.bodies[0]);
    }
    this.collisionHandlers = [];
  }

  /** Process contact events and dispatch to handlers */
  private processCollisions(): void {
    const contacts = this.world.contacts;
    const handled = new Set<string>();

    for (const contact of contacts) {
      if (!contact.bi || !contact.bj) continue;

      const bodyA = contact.bi;
      const bodyB = contact.bj;

      // Create a unique key to avoid processing the same pair twice
      const keyA = bodyA.id + '-' + bodyB.id;
      const keyB = bodyB.id + '-' + bodyA.id;

      if (handled.has(keyA) || handled.has(keyB)) continue;
      handled.add(keyA);
      handled.add(keyB);

      for (const handler of this.collisionHandlers) {
        handler({ bodyA, bodyB });
      }
    }
  }

  /** Create a static body for arena geometry */
  createStaticBody(
    shape: CANNON.Shape,
    position: THREE.Vector3 | [number, number, number],
    collisionGroup: number = COLLISION_GROUPS.ARENA,
    collisionMask: number = 0xffff & ~COLLISION_GROUPS.ARENA
  ): CANNON.Body {
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    if (position instanceof THREE.Vector3) {
      body.position.set(position.x, position.y, position.z);
    } else {
      body.position.set(position[0], position[1], position[2]);
    }
    body.collisionFilterGroup = collisionGroup;
    body.collisionFilterMask = collisionMask;
    return body;
  }

  /** Create a dynamic body */
  createDynamicBody(
    shape: CANNON.Shape,
    mass: number,
    position: THREE.Vector3 | [number, number, number],
    collisionGroup: number,
    collisionMask: number
  ): CANNON.Body {
    const body = new CANNON.Body({ mass });
    body.addShape(shape);
    if (position instanceof THREE.Vector3) {
      body.position.set(position.x, position.y, position.z);
    } else {
      body.position.set(position[0], position[1], position[2]);
    }
    body.collisionFilterGroup = collisionGroup;
    body.collisionFilterMask = collisionMask;
    body.updateMassProperties();
    return body;
  }
}
