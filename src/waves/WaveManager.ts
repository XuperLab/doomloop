import { WaveDef, WaveState, WAVE_DEFS, TOTAL_WAVES, EnemyType } from '../utils/Constants';

export class WaveManager {
  currentWaveIndex = 0; // 0-4
  state: WaveState = 'idle';
  enemiesAlive = 0;
  enemiesKilled = 0;
  totalEnemiesThisWave = 0;
  timer = 0;
  currentWaveDef: WaveDef = WAVE_DEFS[0];

  // Sprint 4: Portal flag
  portalActive = false;

  // Callbacks set by Game.ts
  onSpawnEnemies: ((count: number, waveDef: WaveDef) => void) | null = null;
  onSpawnHealthPacks: (() => void) | null = null;
  onWaveStateChange: ((state: WaveState, waveNum: number) => void) | null = null;
  onSpawnAmmoPickup: (() => void) | null = null;  // Sprint 4
  onPortalActivated: (() => void) | null = null;   // Sprint 4

  startGame(): void {
    this.currentWaveIndex = 0;
    this.state = 'idle';
    this.enemiesAlive = 0;
    this.enemiesKilled = 0;
    this.timer = 0;
    this.portalActive = false;
    this.beginSpawning();
  }

  onEnemyKilled(): void {
    if (this.state !== 'fighting') return;
    this.enemiesAlive = Math.max(0, this.enemiesAlive - 1);
    this.enemiesKilled++;

    // Sprint 4: Ammo pickup every 3 kills
    if (this.enemiesKilled % 3 === 0) {
      this.onSpawnAmmoPickup?.();
    }

    if (this.enemiesAlive <= 0) {
      this.beginIntermission();
    }
  }

  onPlayerDeath(): void {
    this.state = 'gameOver';
    this.onWaveStateChange?.('gameOver', this.currentWaveIndex + 1);
  }

  update(dt: number): void {
    this.timer -= dt;

    if (this.state === 'spawning' && this.timer <= 0) {
      this.beginFighting();
    }

    if (this.state === 'intermission' && this.timer <= 0) {
      this.beginNextWave();
    }
  }

  getCurrentWaveDef(): WaveDef {
    return this.currentWaveDef;
  }

  isLastWave(): boolean {
    return this.currentWaveIndex >= TOTAL_WAVES - 1;
  }

  reset(): void {
    this.currentWaveIndex = 0;
    this.state = 'idle';
    this.enemiesAlive = 0;
    this.enemiesKilled = 0;
    this.totalEnemiesThisWave = 0;
    this.timer = 0;
    this.currentWaveDef = WAVE_DEFS[0];
    this.portalActive = false;
  }

  // Sprint 4: Arena transition
  startNextArenaWaveSet(): void {
    this.currentWaveIndex = 0;
    this.portalActive = false;
    this.beginSpawning();
  }

  onPortalEntered(): void {
    this.state = 'transitioning';
    this.onPortalActivated?.();
  }

  private beginSpawning(): void {
    this.currentWaveDef = WAVE_DEFS[this.currentWaveIndex];
    this.enemiesKilled = 0;

    // Calculate total enemies from wave def's enemy groups
    let totalEnemies = 0;
    if (this.currentWaveDef.enemies) {
      for (const group of this.currentWaveDef.enemies) {
        totalEnemies += group.count;
      }
    } else if (this.currentWaveDef.enemyType === 'imp') {
      totalEnemies = this.currentWaveDef.enemyCount;
    } else {
      totalEnemies = this.currentWaveDef.hasBoss ? 1 : 0;
    }

    // Apply difficulty multiplier
    this.totalEnemiesThisWave = totalEnemies;
    this.enemiesAlive = totalEnemies;

    this.state = 'spawning';
    this.timer = 2;

    this.onSpawnEnemies?.(totalEnemies, this.currentWaveDef);
    this.onWaveStateChange?.('spawning', this.currentWaveIndex + 1);
  }

  private beginFighting(): void {
    this.state = 'fighting';
    this.onWaveStateChange?.('fighting', this.currentWaveIndex + 1);
  }

  private beginIntermission(): void {
    if (this.isLastWave() && this.currentWaveDef.hasBoss) {
      // Sprint 4: Show portal after boss kill
      this.portalActive = true;
      this.state = 'victory';
      this.onWaveStateChange?.('victory', this.currentWaveIndex + 1);
      return;
    }

    this.state = 'intermission';
    this.timer = 3;

    this.onSpawnHealthPacks?.();
    this.onSpawnAmmoPickup?.(); // Sprint 4: Large ammo on intermission
    this.onWaveStateChange?.('intermission', this.currentWaveIndex + 1);
  }

  private beginNextWave(): void {
    if (this.currentWaveIndex >= TOTAL_WAVES - 1) {
      this.state = 'victory';
      this.onWaveStateChange?.('victory', this.currentWaveIndex + 1);
      return;
    }

    this.currentWaveIndex++;
    this.beginSpawning();
  }
}
