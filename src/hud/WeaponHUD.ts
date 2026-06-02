import { Weapon } from '../weapons/Weapon';
import { isTouchDevice } from '../input/MobileDetector';

export class WeaponHUD {
  private container: HTMLElement;
  private weaponSlots: HTMLElement[] = [];
  private currentIndex = 0;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'weapon-hud';
    this.container.style.cssText = `
      position: fixed;
      bottom: ${isTouchDevice() ? '180px' : '20px'};
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      z-index: 1001;
      pointer-events: ${isTouchDevice() ? 'auto' : 'none'};
    `;

    // Create 4 weapon slots
    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.style.cssText = `
        width: ${isTouchDevice() ? '40px' : '48px'};
        height: ${isTouchDevice() ? '40px' : '48px'};
        background: rgba(0,0,0,0.6);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: ${isTouchDevice() ? '14px' : '10px'};
        color: white;
        font-family: monospace;
        transition: border-color 0.15s, background 0.15s;
      `;
      slot.dataset.index = i.toString();
      this.container.appendChild(slot);
      this.weaponSlots.push(slot);
    }

    document.body.appendChild(this.container);
  }

  update(weapons: Weapon[], currentIndex: number): void {
    this.currentIndex = currentIndex;

    for (let i = 0; i < this.weaponSlots.length; i++) {
      const slot = this.weaponSlots[i];
      const weapon = weapons[i];

      if (weapon) {
        slot.innerHTML = `
          <span style="font-size:16px">${weapon.getIcon()}</span>
          <span style="font-size:9px;opacity:0.8">${weapon.getAmmo()}/${weapon.getMaxAmmo()}</span>
        `;

        // Highlight current weapon
        if (i === currentIndex) {
          slot.style.borderColor = '#44FF44';
          slot.style.background = 'rgba(68,255,68,0.15)';
        } else {
          slot.style.borderColor = 'rgba(255,255,255,0.2)';
          slot.style.background = 'rgba(0,0,0,0.6)';
        }

        // Dim if out of ammo
        if (weapon.getAmmo() <= 0) {
          slot.style.opacity = '0.4';
        } else {
          slot.style.opacity = '1';
        }
      } else {
        // Empty slot
        slot.innerHTML = '<span style="opacity:0.3">—</span>';
        slot.style.borderColor = 'rgba(255,255,255,0.1)';
        slot.style.background = 'rgba(0,0,0,0.3)';
        slot.style.opacity = '1';
      }
    }
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  destroy(): void {
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}
