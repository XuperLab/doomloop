import { DAMAGE_FLASH_DURATION } from '../utils/Constants';

export class DamageFlash {
  private element: HTMLElement;
  private active = false;
  private elapsed = 0;
  private duration = DAMAGE_FLASH_DURATION;

  constructor() {
    this.element = document.getElementById('damage-flash')!;
  }

  show(): void {
    this.active = true;
    this.elapsed = 0;
    this.element.style.opacity = '1';
  }

  update(dt: number): void {
    if (!this.active) return;

    this.elapsed += dt;
    const progress = this.elapsed / this.duration;

    if (progress >= 1) {
      this.active = false;
      this.element.style.opacity = '0';
    } else {
      this.element.style.opacity = (1 - progress).toString();
    }
  }

  reset(): void {
    this.active = false;
    this.elapsed = 0;
    this.element.style.opacity = '0';
  }
}
