export class OverlayScreen {
  private startOverlay: HTMLElement;
  private deathScreen: HTMLElement;
  private victoryScreen: HTMLElement;
  private notification: HTMLElement;
  private deathWaveText: HTMLElement;
  private notificationMain: HTMLElement;
  private notificationSub: HTMLElement;
  private pointerLockRequired: HTMLElement;
  private loadingScreen: HTMLElement;

  // Callbacks
  onStartClick: (() => void) | null = null;
  onRestartFromDeath: (() => void) | null = null;
  onRestartFromVictory: (() => void) | null = null;
  onPointerLockRetry: (() => void) | null = null;

  constructor() {
    this.startOverlay = document.getElementById('start-overlay')!;
    this.deathScreen = document.getElementById('death-screen')!;
    this.victoryScreen = document.getElementById('victory-screen')!;
    this.notification = document.getElementById('notification')!;
    this.deathWaveText = document.getElementById('death-wave-text')!;
    this.notificationMain = this.notification.querySelector('.main-text')!;
    this.notificationSub = this.notification.querySelector('.subtext')!;
    this.pointerLockRequired = document.getElementById('pointer-lock-required')!;
    this.loadingScreen = document.getElementById('loading-screen')!;

    this.bindEvents();
  }

  private bindEvents(): void {
    this.startOverlay.addEventListener('click', () => {
      this.onStartClick?.();
    });

    document.getElementById('restart-from-death')?.addEventListener('click', () => {
      this.onRestartFromDeath?.();
    });

    document.getElementById('restart-from-victory')?.addEventListener('click', () => {
      this.onRestartFromVictory?.();
    });

    document.getElementById('pointer-lock-retry')?.addEventListener('click', () => {
      this.onPointerLockRetry?.();
    });
  }

  hideLoading(): void {
    this.loadingScreen.classList.add('hidden');
  }

  showStart(): void {
    this.startOverlay.classList.remove('hidden');
    this.hideDeath();
    this.hideVictory();
    this.hideNotification();
  }

  hideStart(): void {
    this.startOverlay.classList.add('hidden');
  }

  showDeath(wave: number): void {
    this.deathScreen.classList.add('visible');
    this.deathWaveText.textContent = `Wave ${wave}/${5}`;
  }

  hideDeath(): void {
    this.deathScreen.classList.remove('visible');
  }

  showVictory(): void {
    this.victoryScreen.classList.add('visible');
  }

  hideVictory(): void {
    this.victoryScreen.classList.remove('visible');
  }

  showNotification(text: string, subtext: string = '', duration: number = 2): void {
    this.notificationMain.textContent = text;
    this.notificationSub.textContent = subtext;
    this.notification.classList.add('show');

    if (duration > 0) {
      setTimeout(() => {
        this.hideNotification();
      }, duration * 1000);
    }
  }

  hideNotification(): void {
    this.notification.classList.remove('show');
  }

  showPointerLockRequired(): void {
    this.pointerLockRequired.classList.add('visible');
  }

  hidePointerLockRequired(): void {
    this.pointerLockRequired.classList.remove('visible');
  }
}
