export class Crosshair {
  private element: HTMLElement;
  private svgCircle: Element | null;

  constructor() {
    this.element = document.getElementById('crosshair')!;
    this.svgCircle = this.element.querySelector('circle');
  }

  show(): void {
    this.element.classList.add('visible');
  }

  hide(): void {
    this.element.classList.remove('visible');
  }

  setBloom(bloom: number): void {
    if (this.svgCircle) {
      // Bloom increases the gap from the crosshair center
      const baseRadius = 2;
      const maxBloom = 8;
      const r = baseRadius + bloom * maxBloom;
      this.svgCircle.setAttribute('r', r.toString());
    }
  }

  reset(): void {
    this.setBloom(0);
  }
}
