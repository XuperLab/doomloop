import { TOTAL_WAVES } from '../utils/Constants';
import { WeaponHUD } from './WeaponHUD';
import { ComboDisplay } from './ComboDisplay';
import { Weapon } from '../weapons/Weapon';

export class HUD {
  private hpLabel: HTMLElement;
  private hpFill: HTMLElement;
  private waveDisplay: HTMLElement;
  private killCount: HTMLElement;
  private container: HTMLElement;

  // Sprint 4: Sub-components
  weaponHUD: WeaponHUD;
  comboDisplay: ComboDisplay;

  constructor() {
    this.hpLabel = document.getElementById('hp-label')!;
    this.hpFill = document.getElementById('hp-bar-fill')!;
    this.waveDisplay = document.getElementById('wave-display')!;
    this.killCount = document.getElementById('kill-count')!;
    this.container = document.getElementById('hud')!;

    // Sprint 4: Create sub-components
    this.weaponHUD = new WeaponHUD();
    this.comboDisplay = new ComboDisplay();
  }

  show(): void {
    this.container.classList.add('visible');
    this.weaponHUD.show();
    this.comboDisplay.show();
  }

  hide(): void {
    this.container.classList.remove('visible');
    this.weaponHUD.hide();
    this.comboDisplay.hide();
  }

  update(
    health: number,
    maxHealth: number,
    currentWave: number,
    enemiesKilled: number,
    totalEnemies: number,
    // Sprint 4: Additional params
    weapons?: Weapon[],
    currentWeaponIndex?: number,
    score?: number,
    combo?: number,
    comboTimer?: number,
    comboWindow?: number,
  ): void {
    // HP bar
    const hpPercent = Math.max(0, health / maxHealth * 100);
    this.hpFill.style.width = `${hpPercent}%`;
    this.hpLabel.textContent = `HP: ${Math.max(0, Math.round(health))}/${maxHealth}`;

    this.hpFill.classList.remove('low', 'medium', 'high');
    if (hpPercent <= 30) this.hpFill.classList.add('low');
    else if (hpPercent <= 60) this.hpFill.classList.add('medium');
    else this.hpFill.classList.add('high');

    // Wave display
    this.waveDisplay.textContent = `Wave ${currentWave}/${TOTAL_WAVES}`;

    // Kill count
    this.killCount.textContent = `${enemiesKilled}/${totalEnemies} Killed`;

    // Sprint 4: Sub-component updates
    if (weapons && currentWeaponIndex !== undefined) {
      this.weaponHUD.update(weapons, currentWeaponIndex);
    }
    if (score !== undefined) {
      this.comboDisplay.updateScore(score);
    }
    if (combo !== undefined) {
      this.comboDisplay.updateCombo(combo);
    }
    if (comboTimer !== undefined && comboWindow !== undefined && comboWindow > 0) {
      this.comboDisplay.updateComboBar(comboTimer / comboWindow);
    }
  }

  destroy(): void {
    this.weaponHUD.destroy();
    this.comboDisplay.destroy();
  }
}
