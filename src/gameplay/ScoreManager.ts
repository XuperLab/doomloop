import { POINTS_PER_KILL, COMBO_WINDOW, MAX_COMBO, STORAGE_KEY_HIGH_SCORE } from '../utils/Constants';
import { AudioManager } from '../audio/AudioManager';

export interface StreakTier {
  text: string;
  sound: string;
}

export const STREAK_TIERS: Record<number, StreakTier> = {
  2:  { text: 'Double Kill!',  sound: 'double_kill' },
  3:  { text: 'Triple Kill!',  sound: 'triple_kill' },
  4:  { text: 'Multi Kill!',   sound: 'multi_kill' },
  5:  { text: 'RAMPAGE!',      sound: 'rampage' },
  7:  { text: 'DOMINATION!',   sound: 'domination' },
  10: { text: 'GODLIKE!',      sound: 'godlike' },
};

export class ScoreManager {
  score = 0;
  combo = 1;
  comboTimer = 0;
  highScore = 0;
  lastStreakTier = 0;
  scoreMultiplier = 1;

  // Callbacks
  onScoreChanged: ((score: number) => void) | null = null;
  onComboChanged: ((combo: number) => void) | null = null;
  onStreakCallout: ((text: string) => void) | null = null;

  constructor() {
    this.loadHighScore();
  }

  registerKill(enemyType: string): void {
    const basePoints = POINTS_PER_KILL[enemyType];
    if (!basePoints) return;

    const points = Math.round(basePoints * this.combo * this.scoreMultiplier);
    this.score += points;

    // Update combo
    this.combo++;
    if (this.combo > MAX_COMBO) this.combo = MAX_COMBO;
    this.comboTimer = COMBO_WINDOW;

    // Notify
    this.onScoreChanged?.(this.score);
    this.onComboChanged?.(this.combo);

    // Check streak callout
    this.checkStreakCallout();
  }

  update(dt: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.lastStreakTier = 0;
        this.onComboChanged?.(this.combo);
      }
    }
  }

  private checkStreakCallout(): void {
    for (const [tier, data] of Object.entries(STREAK_TIERS)) {
      const tierNum = Number(tier);
      if (this.combo >= tierNum && tierNum > this.lastStreakTier) {
        this.lastStreakTier = tierNum;
        this.onStreakCallout?.(data.text);
        AudioManager.getInstance().playSFX(data.sound);
      }
    }
  }

  onDeath(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  private loadHighScore(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
      if (saved) {
        this.highScore = parseInt(saved, 10) || 0;
      }
    } catch (_) {
      this.highScore = 0;
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(STORAGE_KEY_HIGH_SCORE, this.highScore.toString());
    } catch (_) { /* localStorage not available */ }
  }

  reset(): void {
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.lastStreakTier = 0;
  }
}
