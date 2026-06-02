import { HIT_MARKER_DURATION } from '../utils/Constants';

export class HitMarker {
  private element: HTMLElement;
  private timer = 0;

  constructor() {
    this.element = document.getElementById('hit-marker')!;
  }

  show(): void {
    this.timer = HIT_MARKER_DURATION;
    this.element.classList.add('show');
  }

  update(dt: number): void {
    if (this.timer <= 0) return;

    this.timer -= dt;
    if (this.timer <= 0) {
      this.element.classList.remove('show');
    }
  }

  reset(): void {
    this.timer = 0;
    this.element.classList.remove('show');
  }
}
