import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Entity } from './Entity';
import { Camera } from '../engine/Camera';
import { InputState } from '../engine/InputManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Weapon } from '../weapons/Weapon';
import { PlasmaRifle } from '../weapons/PlasmaRifle';
import { Shotgun } from '../weapons/Shotgun';
import { SMG } from '../weapons/SMG';
import { RocketLauncher } from '../weapons/RocketLauncher';
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
  FOOTSTEP_WALK_INTERVAL,
  FOOTSTEP_SPRINT_INTERVAL,
} from '../utils/Constants';

export class Player extends Entity {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  health = PLAYER_MAX_HEALTH;
  maxHealth = PLAYER_MAX_HEALTH;
  grounded = false;
  isSprinting = false;

  // Sprint 4: Weapon system (replaces single weapon)
  weapons: Weapon[] = [];
  currentWeaponIndex = 0;
  get currentWeapon(): Weapon {
    return this.weapons[this.currentWeaponIndex];
  }

  // Sprint 4: Power-up state
  speedMultiplier = 1.0;
  damageMultiplier = 1.0;
  isInvulnerable = false;

  // Sprint 4: Footstep audio
  footstepTimer = 0;

  private camera: Camera;
  private physicsWorld: PhysicsWorld;
  private currentSpeed = 0;

  constructor(camera: Camera, physicsWorld: PhysicsWorld) {
    super();
    this.camera = camera;
    this.physicsWorld = physicsWorld;

    // Sprint 4: Start with PlasmaRifle
    this.weapons.push(new PlasmaRifle(camera.camera, physicsWorld, this));
    this.currentWeaponIndex = 0;

    // Visual mesh
    const geo = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3366cc,
      flatShading: true,
      transparent: true,
      opacity: 0,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.visible = false;

    // Physics body
    this.body = physicsWorld.createDynamicBody(
      new CANNON.Cylinder(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8),
      80,
      [0, PLAYER_HEIGHT / 2, 0],
      COLLISION_GROUPS.PLAYER,
      COLLISION_GROUPS.ARENA | COLLISION_GROUPS.ENEMIES | COLLISION_GROUPS.HEALTH_PACK |
        COLLISION_GROUPS.BOSS_PROJECTILE | COLLISION_GROUPS.FLYER |
        COLLISION_GROUPS.POWER_UP | COLLISION_GROUPS.AMMO_PICKUP | COLLISION_GROUPS.WEAPON_PICKUP
    );
    this.body.fixedRotation = true;
    this.body.updateMassProperties();
    this.body.linearDamping = 0.0;
    (this.body as any).userData = { entity: this };
    physicsWorld.addBody(this.body);
  }

  update(dt: number): void {
    if (!this.isAlive) return;
    // Tick weapon cooldowns
    for (const w of this.weapons) {
      w.update(dt);
    }
  }

  applyMovement(input: InputState, dt: number): void {
    if (!this.isAlive) return;

    this.isSprinting = input.sprint;

    const forward = this.camera.getForwardVector();
    const right = this.camera.getRightVector();

    const moveDir = new THREE.Vector3();

    if (input.moveAnalogX !== undefined && input.moveAnalogZ !== undefined) {
      const fwd = forward.clone().multiplyScalar(input.moveAnalogZ);
      const rgt = right.clone().multiplyScalar(input.moveAnalogX);
      moveDir.copy(fwd.add(rgt));
    } else {
      if (input.moveForward) moveDir.add(forward);
      if (input.moveBackward) moveDir.sub(forward);
      if (input.moveLeft) moveDir.sub(right);
      if (input.moveRight) moveDir.add(right);
    }

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    // Apply speed multiplier from power-ups
    const maxSpeed = (this.isSprinting
      ? PLAYER_WALK_SPEED * PLAYER_SPRINT_MULTIPLIER
      : PLAYER_WALK_SPEED) * this.speedMultiplier;

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

    const targetVel = moveDir.clone().multiplyScalar(this.currentSpeed);
    this.body.velocity.x = targetVel.x;
    this.body.velocity.z = targetVel.z;

    if (input.jumpPressed && this.grounded) {
      this.body.velocity.y = PLAYER_JUMP_VELOCITY;
      this.grounded = false;
    }

    this.camera.setSprinting(this.isSprinting);
    this.camera.setMoving(isMoving);

    // Update footsteps
    this.updateFootstep(dt, isMoving);
  }

  applyLook(deltaYaw: number, deltaPitch: number): void {
    if (!this.isAlive) return;
    this.camera.rotate(deltaYaw, deltaPitch);
  }

  syncCamera(): void {
    if (!this.isAlive) return;
    this.camera.camera.position.set(
      this.body.position.x,
      this.body.position.y + PLAYER_EYE_HEIGHT,
      this.body.position.z
    );
  }

  takeDamage(amount: number): void {
    if (!this.isAlive || this.isInvulnerable) return;
    const finalDamage = amount; // Difficulty scaling applied by caller
    this.health = Math.max(0, this.health - finalDamage);
    if (this.health <= 0) {
      this.die();
    }
  }

  die(): void {
    this.isAlive = false;
  }

  heal(amount: number): void {
    if (!this.isAlive) return;
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  // Sprint 4: Weapon management
  switchWeapon(index: number): void {
    if (index < 0 || index >= this.weapons.length) return;
    if (index === this.currentWeaponIndex) return;
    this.currentWeaponIndex = index;
  }

  addWeapon(weapon: Weapon): void {
    // Only add if not already owned
    const exists = this.weapons.some(w => w.getName() === weapon.getName());
    if (!exists) {
      this.weapons.push(weapon);
    }
  }

  refillAllAmmo(percent: number = 0.5): void {
    for (const w of this.weapons) {
      w.addAmmo(Math.floor(w.maxAmmo * percent));
    }
  }

  updateFootstep(dt: number, isMoving: boolean): void {
    if (!isMoving) return;
    const interval = this.isSprinting ? FOOTSTEP_SPRINT_INTERVAL : FOOTSTEP_WALK_INTERVAL;
    this.footstepTimer += dt;
    if (this.footstepTimer >= interval) {
      this.footstepTimer = 0;
      // AudioManager.playSFX('footstep') is called by Game.ts
    }
  }

  // Sprint 4: Power-up effects
  applySpeedBoost(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  removeSpeedBoost(): void {
    this.speedMultiplier = 1.0;
  }

  applyDoubleDamage(multiplier: number): void {
    this.damageMultiplier = multiplier;
  }

  removeDoubleDamage(): void {
    this.damageMultiplier = 1.0;
  }

  applyShield(): void {
    this.isInvulnerable = true;
  }

  removeShield(): void {
    this.isInvulnerable = false;
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

    // Reset weapons to starting inventory
    this.weapons = [];
    this.weapons.push(new PlasmaRifle(this.camera.camera, this.physicsWorld, this));
    this.currentWeaponIndex = 0;

    // Reset power-up state
    this.speedMultiplier = 1.0;
    this.damageMultiplier = 1.0;
    this.isInvulnerable = false;
    this.footstepTimer = 0;
  }

  destroy(): void {
    this.isAlive = false;
    this.physicsWorld.removeBody(this.body);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
