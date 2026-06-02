import { WaveDef, WaveState, WAVE_DEFS, TOTAL_WAVES } from '../utils/Constants';

export class WaveManager {
  currentWaveIndex = 0; // 0-4
  state: WaveState = 'idle';
  enemiesAlive = 0;
  enemiesKilled = 0;
  totalEnemiesThisWave = 0;
  timer = 0;
  currentWaveDef: WaveDef = WAVE_DEFS[0];

  // Callbacks set by Game.ts
  onSpawnEnemies: ((count: number, waveDef: WaveDef) => void) | null = null;
  onSpawnHealthPacks: (() => void) | null = null;
  onWaveStateChange: ((state: WaveState, waveNum: number) => void) | null = null;

  startGame(): void {
    this.currentWaveIndex = 0;
    this.state = 'idle';
    this.enemiesAlive = 0;
    this.enemiesKilled = 0;
    this.timer = 0;
    this.beginSpawning();
  }

  onEnemyKilled(): void {
    if (this.state !== 'fighting') return;
    this.enemiesAlive = Math.max(0, this.enemiesAlive - 1);
    this.enemiesKilled++;

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
  }

  private beginSpawning(): void {
    this.currentWaveDef = WAVE_DEFS[this.currentWaveIndex];
    this.enemiesKilled = 0;

    if (this.currentWaveDef.enemyType === 'imp') {
      this.totalEnemiesThisWave = this.currentWaveDef.enemyCount;
      this.enemiesAlive = this.currentWaveDef.enemyCount;
    } else {
      this.totalEnemiesThisWave = this.currentWaveDef.hasBoss ? 1 : 0;
      this.enemiesAlive = this.currentWaveDef.hasBoss ? 1 : 0;
    }

    this.state = 'spawning';
    this.timer = 2; // "Wave X incoming!" display time

    // Notify to spawn enemies
    this.onSpawnEnemies?.(this.currentWaveDef.enemyCount, this.currentWaveDef);
    this.onWaveStateChange?.('spawning', this.currentWaveIndex + 1);
  }

  private beginFighting(): void {
    this.state = 'fighting';
    this.onWaveStateChange?.('fighting', this.currentWaveIndex + 1);
  }

  private beginIntermission(): void {
    if (this.isLastWave() && this.currentWaveDef.hasBoss) {
      // Boss was on this wave — victory!
      this.state = 'victory';
      this.onWaveStateChange?.('victory', this.currentWaveIndex + 1);
      return;
    }

    this.state = 'intermission';
    this.timer = 3; // 3-second intermission

    // Spawn health packs for next wave
    // Actually, health packs should be available now, not at the start of next wave
    this.onSpawnHealthPacks?.();
    this.onWaveStateChange?.('intermission', this.currentWaveIndex + 1);
  }

  private beginNextWave(): void {
    if (this.currentWaveIndex >= TOTAL_WAVES - 1) {
      // This shouldn't happen if wave contains boss
      this.state = 'victory';
      this.onWaveStateChange?.('victory', this.currentWaveIndex + 1);
      return;
    }

    this.currentWaveIndex++;
    this.beginSpawning();
  }
}
