import { SOUND_DEFS, SFXOptions, SoundName, ScheduledSound } from './SoundDefs';
import { MusicManager } from './MusicLayer';
import { AUDIO_DEFAULTS, AUDIO_STORAGE_KEY } from '../utils/Constants';

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
}

export class AudioManager {
  private static instance: AudioManager | null = null;

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicManager: MusicManager | null = null;
  private initialized = false;
  private settings: AudioSettings = { ...AUDIO_DEFAULTS };

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /** Create AudioContext (suspended). Call on first user interaction. */
  init(): void {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.ctx.suspend(); // Ensure suspended state

    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // SFX gain (Master → SFX)
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    // Music gain (Master → Music)
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);

    // Music manager
    this.musicManager = new MusicManager(this.ctx, this.musicGain);

    // Load saved settings
    this.loadSettings();

    this.initialized = true;
  }

  /** Resume AudioContext on user interaction */
  async resume(): Promise<void> {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /** Play a sound effect by name */
  playSFX(name: string, options?: SFXOptions): void {
    if (!this.ctx || !this.sfxGain) return;
    const factory = SOUND_DEFS[name];
    if (!factory) return;

    const vol = (options?.volume ?? 1) * (this.settings.sfxVolume / 100) * (this.settings.masterVolume / 100);
    if (vol <= 0) return;

    const sound = factory(this.ctx);

    // Apply volume
    sound.gain.gain.setValueAtTime(
      Math.min(1, Math.max(0, vol)),
      this.ctx.currentTime
    );

    // Apply pitch
    if (sound.osc && options?.pitch && options.pitch !== 1) {
      sound.osc.detune.setValueAtTime(
        (options.pitch - 1) * 1200,
        this.ctx.currentTime
      );
    }

    // Connect to SFX bus
    sound.gain.connect(this.sfxGain);
  }

  /** Start/switch BGM */
  playMusic(arenaKey: 'fortress' | 'cavern' | 'nexus'): void {
    if (!this.musicManager) return;
    const vol = (this.settings.musicVolume / 100) * (this.settings.masterVolume / 100);
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(vol, this.ctx?.currentTime ?? 0);
    }
    this.musicManager.setArenaTheme(arenaKey);
    this.musicManager.start();
  }

  /** Set wave index for BGM layering */
  setWave(waveIndex: number): void {
    this.musicManager?.setWave(waveIndex);
  }

  /** Stop all audio */
  stopAll(): void {
    this.musicManager?.stop();
  }

  /** Set volume for a channel */
  setVolume(channel: 'master' | 'sfx' | 'music', level: number): void {
    level = Math.max(0, Math.min(100, level));
    this.settings[channel === 'master' ? 'masterVolume' : channel === 'sfx' ? 'sfxVolume' : 'musicVolume'] = level;

    if (this.ctx && this.initialized) {
      if (channel === 'master' && this.masterGain) {
        this.masterGain.gain.setValueAtTime(level / 100, this.ctx.currentTime);
      } else if (channel === 'sfx' && this.sfxGain) {
        this.sfxGain.gain.setValueAtTime(level / 100, this.ctx.currentTime);
      } else if (channel === 'music' && this.musicGain) {
        this.musicGain.gain.setValueAtTime(level / 100, this.ctx.currentTime);
      }
    }

    this.saveSettings();
  }

  /** Get current volume */
  getVolume(channel: 'master' | 'sfx' | 'music'): number {
    return channel === 'master' ? this.settings.masterVolume
      : channel === 'sfx' ? this.settings.sfxVolume
      : this.settings.musicVolume;
  }

  getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...AUDIO_DEFAULTS, ...parsed };
      }
    } catch (_) {
      this.settings = { ...AUDIO_DEFAULTS };
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (_) { /* localStorage not available */ }
  }

  destroy(): void {
    this.stopAll();
    this.musicManager?.destroy();
    this.musicManager = null;
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
    AudioManager.instance = null;
  }
}
