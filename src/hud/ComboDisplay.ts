import { isTouchDevice } from '../input/MobileDetector';

export class ComboDisplay {
  private container: HTMLElement;
  private calloutElement: HTMLElement;
  private comboBar: HTMLElement;
  private comboText: HTMLElement;
  private scoreText: HTMLElement;
  private calloutTimer = 0;
  private calloutDuration = 1.5;
  private calloutScale = 0.8;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'combo-display';
    this.container.style.cssText = `
      position: fixed;
      top: 8px;
      right: 8px;
      z-index: 999;
      text-align: right;
      font-family: monospace;
      pointer-events: none;
    `;

    // Score display
    this.scoreText = document.createElement('div');
    this.scoreText.style.cssText = `
      font-size: ${isTouchDevice() ? '14px' : '18px'};
      color: #FFD700;
      text-shadow: 0 0 10px rgba(255,215,0,0.5);
      margin-bottom: 4px;
    `;

    // Combo bar container
    this.comboBar = document.createElement('div');
    this.comboBar.style.cssText = `
      width: ${isTouchDevice() ? '80px' : '120px'};
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-left: auto;
    `;

    // Combo bar fill
    const barFill = document.createElement('div');
    barFill.id = 'combo-bar-fill';
    barFill.style.cssText = `
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #FF4444, #FFD700);
      transition: width 0.1s;
    `;
    this.comboBar.appendChild(barFill);

    // Combo multiplier text
    this.comboText = document.createElement('div');
    this.comboText.style.cssText = `
      font-size: ${isTouchDevice() ? '12px' : '14px'};
      color: #FF8844;
      margin-top: 2px;
    `;

    // Kill streak callout
    this.calloutElement = document.createElement('div');
    this.calloutElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      font-size: ${isTouchDevice() ? '1.5rem' : '2rem'};
      color: #FFD700;
      font-family: monospace;
      font-weight: bold;
      text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.4);
      opacity: 0;
      pointer-events: none;
      z-index: 1002;
      transition: opacity 0.3s, transform 0.3s;
    `;

    this.container.appendChild(this.scoreText);
    this.container.appendChild(this.comboBar);
    this.container.appendChild(this.comboText);

    document.body.appendChild(this.container);
    document.body.appendChild(this.calloutElement);
  }

  updateScore(score: number): void {
    this.scoreText.textContent = `SCORE: ${score.toLocaleString()}`;
  }

  updateCombo(combo: number): void {
    if (combo > 1) {
      this.comboText.textContent = `×${combo}`;
      this.comboText.style.display = 'block';
    } else {
      this.comboText.textContent = '';
      this.comboText.style.display = 'none';
    }
  }

  updateComboBar(ratio: number): void {
    const fill = this.comboBar.querySelector('#combo-bar-fill') as HTMLElement;
    if (fill) {
      fill.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
    }
  }

  showCallout(text: string): void {
    this.calloutElement.textContent = text;
    this.calloutElement.style.opacity = '1';
    this.calloutElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
    this.calloutTimer = this.calloutDuration;
    this.calloutScale = 1.2;
  }

  update(dt: number): void {
    if (this.calloutTimer > 0) {
      this.calloutTimer -= dt;
      const t = this.calloutTimer / this.calloutDuration;

      // Scale animation: 1.2 → 1.0
      const scale = 1.0 + 0.2 * Math.min(1, t * 3);
      this.calloutElement.style.transform = `translate(-50%, -50%) scale(${scale})`;

      if (this.calloutTimer <= 0) {
        // Fade out
        this.calloutElement.style.opacity = '0';
        this.calloutElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
      }
    }
  }

  show(): void {
    this.container.style.display = 'block';
  }

  hide(): void {
    this.container.style.display = 'none';
    this.calloutElement.style.opacity = '0';
  }

  destroy(): void {
    if (this.container.parentElement) this.container.parentElement.removeChild(this.container);
    if (this.calloutElement.parentElement) this.calloutElement.parentElement.removeChild(this.calloutElement);
  }
}
