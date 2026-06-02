import * as THREE from 'three';
import { Camera } from '../engine/Camera';
import { SCREEN_SHAKE_DURATION, SCREEN_SHAKE_INTENSITY } from '../utils/Constants';

export class ScreenShake {
  private camera: Camera;
  private timer = 0;
  private duration = SCREEN_SHAKE_DURATION;
  private intensity = SCREEN_SHAKE_INTENSITY;

  constructor(camera: Camera) {
    this.camera = camera;
  }

  shake(duration?: number, intensity?: number): void {
    this.timer = duration ?? this.duration;
    this.intensity = intensity ?? this.intensity;
  }

  update(dt: number): void {
    if (this.timer <= 0) return;

    this.timer -= dt;

    if (this.timer > 0) {
      const shakeAmount = (this.timer / this.duration) * this.intensity;
      this.camera.camera.position.x += (Math.random() - 0.5) * shakeAmount;
      this.camera.camera.position.y += (Math.random() - 0.5) * shakeAmount;
    }
  }

  reset(): void {
    this.timer = 0;
  }
}
