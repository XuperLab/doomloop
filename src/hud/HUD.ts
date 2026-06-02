import { TOTAL_WAVES } from '../utils/Constants';

export class HUD {
  private hpLabel: HTMLElement;
  private hpFill: HTMLElement;
  private waveDisplay: HTMLElement;
  private killCount: HTMLElement;
  private container: HTMLElement;

  constructor() {
    this.hpLabel = document.getElementById('hp-label')!;
    this.hpFill = document.getElementById('hp-bar-fill')!;
    this.waveDisplay = document.getElementById('wave-display')!;
    this.killCount = document.getElementById('kill-count')!;
    this.container = document.getElementById('hud')!;
  }

  show(): void {
    this.container.classList.add('visible');
  }

  hide(): void {
    this.container.classList.remove('visible');
  }

  update(
    health: number,
    maxHealth: number,
    currentWave: number,
    enemiesKilled: number,
    totalEnemies: number
  ): void {
    // HP bar
    const hpPercent = Math.max(0, health / maxHealth * 100);
    this.hpFill.style.width = `${hpPercent}%`;
    this.hpLabel.textContent = `HP: ${Math.max(0, Math.round(health))}/${maxHealth}`;

    // Color based on HP percent
    this.hpFill.classList.remove('low', 'medium', 'high');
    if (hpPercent <= 30) this.hpFill.classList.add('low');
    else if (hpPercent <= 60) this.hpFill.classList.add('medium');
    else this.hpFill.classList.add('high');

    // Wave display
    this.waveDisplay.textContent = `Wave ${currentWave}/${TOTAL_WAVES}`;

    // Kill count
    this.killCount.textContent = `${enemiesKilled}/${totalEnemies} Killed`;
  }
}
