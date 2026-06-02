import * as THREE from 'three';
import {
  PLAYER_DEFAULT_FOV,
  PLAYER_SPRINT_FOV,
  PITCH_LIMIT,
  CAMERA_BOB_AMPLITUDE,
  CAMERA_BOB_FREQUENCY,
} from '../utils/Constants';

export class Camera {
  readonly camera: THREE.PerspectiveCamera;
  private yaw = 0;
  private pitch = 0;
  private currentFov: number;
  private targetFov: number;
  private bobPhase = 0;
  private isMoving = false;
  private walking = false;
  private deathPitchOffset = 0;
  private deathRollOffset = 0;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(PLAYER_DEFAULT_FOV, aspect, 0.1, 200);
    this.camera.position.set(0, 1.6, 0);
    this.currentFov = PLAYER_DEFAULT_FOV;
    this.targetFov = PLAYER_DEFAULT_FOV;
  }

  get aspect(): number {
    return this.camera.aspect;
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  /** Rotate camera by delta yaw/pitch from mouse input */
  rotate(deltaYaw: number, deltaPitch: number): void {
    this.yaw -= deltaYaw;
    this.pitch += deltaPitch;
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));
  }

  /** Set sprint FOV kick */
  setSprinting(sprinting: boolean): void {
    this.targetFov = sprinting ? PLAYER_SPRINT_FOV : PLAYER_DEFAULT_FOV;
  }

  /** Set walking state for camera bob */
  setMoving(moving: boolean): void {
    this.isMoving = moving;
    this.walking = moving;
  }

  /** Set death animation pitch offset (looking up at sky) */
  setDeathPitch(pitch: number): void {
    this.deathPitchOffset = pitch;
  }

  /** Set death animation roll offset (slight tilt) */
  setDeathRoll(roll: number): void {
    this.deathRollOffset = roll;
  }

  /** Get forward direction in XZ plane */
  getForwardVector(): THREE.Vector3 {
    return new THREE.Vector3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    ).normalize();
  }

  /** Get right direction in XZ plane */
  getRightVector(): THREE.Vector3 {
    return new THREE.Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    ).normalize();
  }

  /** Get the direction the camera is looking (full 3D) */
  getLookDirection(): THREE.Vector3 {
    return new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();
  }

  /** Update camera: FOV smoothing, bob, quaternion */
  update(dt: number): void {
    // Smooth FOV transition
    const fovDiff = this.targetFov - this.currentFov;
    this.currentFov += fovDiff * Math.min(1, dt * 10);
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();

    // Camera bob
    let bobOffset = new THREE.Vector3();
    if (this.isMoving && this.walking) {
      this.bobPhase += dt * CAMERA_BOB_FREQUENCY;
      const bobY = Math.sin(this.bobPhase) * CAMERA_BOB_AMPLITUDE;
      bobOffset = new THREE.Vector3(0, bobY, 0);
    } else {
      this.bobPhase = 0;
    }

    // Apply rotation (with death animation offsets)
    const effectivePitch = this.pitch + this.deathPitchOffset;
    const q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler(effectivePitch, this.yaw, this.deathRollOffset, 'YXZ'));
    this.camera.quaternion.copy(q);

    // Bob offset is applied to position externally (camera position is driven by Player)
  }

  /** Reset camera state */
  reset(): void {
    this.yaw = 0;
    this.pitch = 0;
    this.currentFov = PLAYER_DEFAULT_FOV;
    this.targetFov = PLAYER_DEFAULT_FOV;
    this.bobPhase = 0;
    this.isMoving = false;
    this.deathPitchOffset = 0;
    this.deathRollOffset = 0;
  }

  getYaw(): number {
    return this.yaw;
  }

  getPitch(): number {
    return this.pitch;
  }
}
