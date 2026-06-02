import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { Camera } from '../engine/Camera';
import { InputState } from '../engine/InputManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { PlasmaRifle } from '../weapons/PlasmaRifle';
import {
  PLAYER_MAX_HEALTH,
  PLAYER_WALK_SPEED,
  PLAYER_SPRINT_MULTIPLIER,
  PLAYER_JUMP_VELOCITY,
  PLAYER_ACCEL_TIME,
  PLAYER_DECEL_TIME,
  PLAYER_EYE_HEIGHT,
  PLAYER_RADIUS,
  PLAYER_HEIGHT,
  COLLISION_GROUPS,
  COLORS,
} from '../utils/Constants';

export class Player extends Entity {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  health = PLAYER_MAX_HEALTH;
  maxHealth = PLAYER_MAX_HEALTH;
  grounded = false;
  isSprinting = false;
  weapon: PlasmaRifle;
  private camera: Camera;
  private physicsWorld: PhysicsWorld;
  private currentSpeed = 0;

  constructor(camera: Camera, physicsWorld: PhysicsWorld) {
    super();
    this.camera = camera;
    this.physicsWorld = physicsWorld;
    this.weapon = new PlasmaRifle(camera, physicsWorld, this);

    // Visual mesh — capsule-like (cylinder + sphere cap)
    const geo = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3366cc,
      flatShading: true,
      transparent: true,
      opacity: 0, // Invisible first-person — visible for debugging
    });
    this.mesh = new THREE.Mesh(geo, mat);
    // In first-person, the player model is invisible; weapon is visible
    this.mesh.visible = false;

    // Physics body — cylinder shape
    this.body = physicsWorld.createDynamicBody(
      new CANNON.Cylinder(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8),
      80, // 80kg mass
      [0, PLAYER_HEIGHT / 2, 0],
      COLLISION_GROUPS.PLAYER,
      COLLISION_GROUPS.ARENA | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.HEALTH_PACK | COLLISION_GROUPS.BOSS_PROJECTILE
    );
    this.body.fixedRotation = true; // Prevent player from tipping over
    this.body.updateMassProperties();
    this.body.linearDamping = 0.0;

    // Store reference for collision dispatch
    (this.body as any).userData = { entity: this };

    physicsWorld.addBody(this.body);
  }

  update(dt: number): void {
    if (!this.isAlive) return;
    // Movement is driven externally by Game.ts which calls applyMovement & look
  }

  /** Apply movement from input state */
  applyMovement(input: InputState, dt: number): void {
    if (!this.isAlive) return;

    this.isSprinting = input.sprint;

    // Get camera-relative directions (XZ plane only — no pitch influence)
    const forward = this.camera.getForwardVector();
    const right = this.camera.getRightVector();

    // Compute desired movement direction
    const moveDir = new THREE.Vector3();

    // Check for analog input first (Sprint 2 — TouchInputAdapter)
    if (input.moveAnalogX !== undefined && input.moveAnalogZ !== undefined) {
      // Analog: C = forward * analogZ + right * analogX
      const fwd = forward.clone().multiplyScalar(input.moveAnalogZ);
      const rgt = right.clone().multiplyScalar(input.moveAnalogX);
      moveDir.copy(fwd.add(rgt));
    } else {
      // Fall back to boolean directional input (Sprint 1 — desktop)
      if (input.moveForward) moveDir.add(forward);
      if (input.moveBackward) moveDir.sub(forward);
      if (input.moveLeft) moveDir.sub(right);
      if (input.moveRight) moveDir.add(right);
    }

    // Normalize if moving diagonally
    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    // Apply speed
    const maxSpeed = this.isSprinting
      ? PLAYER_WALK_SPEED * PLAYER_SPRINT_MULTIPLIER
      : PLAYER_WALK_SPEED;

    // Smooth acceleration/deceleration
    const isMoving = moveDir.lengthSq() > 0;
    if (isMoving) {
      this.currentSpeed = Math.min(
        this.currentSpeed + (maxSpeed / PLAYER_ACCEL_TIME) * dt,
        maxSpeed
      );
    } else {
      this.currentSpeed = Math.max(
        this.currentSpeed - (maxSpeed / PLAYER_DECEL_TIME) * dt,
        0
      );
    }

    // Apply velocity to physics body (maintain current Y velocity for gravity)
    const targetVel = moveDir.clone().multiplyScalar(this.currentSpeed);
    this.body.velocity.x = targetVel.x;
    this.body.velocity.z = targetVel.z;

    // Jump
    if (input.jumpPressed && this.grounded) {
      this.body.velocity.y = PLAYER_JUMP_VELOCITY;
      this.grounded = false;
    }

    // Update sprint state on camera
    this.camera.setSprinting(this.isSprinting);
    this.camera.setMoving(isMoving);
  }

  /** Apply mouse look */
  applyLook(deltaYaw: number, deltaPitch: number): void {
    if (!this.isAlive) return;
    this.camera.rotate(deltaYaw, deltaPitch);
  }

  /** Sync camera position to player body */
  syncCamera(): void {
    if (!this.isAlive) return;
    this.camera.camera.position.set(
      this.body.position.x,
      this.body.position.y + PLAYER_EYE_HEIGHT,
      this.body.position.z
    );
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  heal(amount: number): void {
    if (!this.isAlive) return;
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  reset(position?: THREE.Vector3): void {
    this.health = PLAYER_MAX_HEALTH;
    this.isAlive = true;
    this.grounded = false;
    this.currentSpeed = 0;
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    if (position) {
      this.body.position.set(position.x, position.y, position.z);
    }
  }

  destroy(): void {
    this.isAlive = false;
    this.physicsWorld.removeBody(this.body);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
