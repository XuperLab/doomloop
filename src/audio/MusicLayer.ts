import * as THREE from 'three';

export interface MusicLayer {
  type: OscillatorType;
  frequency: number;
  gainNode: GainNode;
  filter: BiquadFilterNode;
  isActive: boolean;
  oscNode: OscillatorNode | null;
  gain: number; // Base gain level for this layer
}

export interface ArenaMusicConfig {
  leadWaveform: OscillatorType;
  leadFreq: number;
  hasDistortion: boolean;
  reverbAmount: number;
  tempoMultiplier: number;
}

export const ARENA_MUSIC_CONFIGS: Record<string, ArenaMusicConfig> = {
  fortress: {
    leadWaveform: 'square',
    leadFreq: 110,
    hasDistortion: false,
    reverbAmount: 0.3,
    tempoMultiplier: 1.0,
  },
  cavern: {
    leadWaveform: 'sawtooth',
    leadFreq: 90,
    hasDistortion: true,
    reverbAmount: 0.6,
    tempoMultiplier: 1.0,
  },
  nexus: {
    leadWaveform: 'sine',
    leadFreq: 130,
    hasDistortion: false,
    reverbAmount: 0.8,
    tempoMultiplier: 1.0,
  },
};

// Wave-based layer activation (index = wave number - 1)
export const BGM_LAYER_ACTIVATION: Record<string, number[]> = {
  drone:       [1, 1, 1, 1, 1],
  percussion:  [0, 1, 1, 1, 1],
  bass:        [0, 0, 1, 1, 1],
  lead:        [0, 0, 0, 1, 1],
  distortion:  [0, 0, 0, 0, 1],
};

export class MusicManager {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private layers: Map<string, MusicLayer> = new Map();
  private currentArena: string = 'fortress';
  private currentWave: number = 0; // 0-indexed
  private isPlaying = false;
  private distortionNode: WaveShaperNode | null = null;
  private delayNode: DelayNode | null = null;

  constructor(ctx: AudioContext, masterGain: GainNode) {
    this.ctx = ctx;
    this.masterGain = masterGain;
  }

  setArenaTheme(arenaKey: string): void {
    this.currentArena = arenaKey;
  }

  setWave(waveIndex: number): void {
    this.currentWave = waveIndex;
    if (this.isPlaying) {
      this.updateLayers();
    }
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.createAllLayers();
    this.updateLayers();
  }

  stop(): void {
    this.isPlaying = false;
    for (const [, layer] of this.layers) {
      if (layer.oscNode) {
        try { layer.oscNode.stop(); } catch (_) {}
        layer.oscNode = null;
      }
      layer.isActive = false;
    }
  }

  private createAllLayers(): void {
    const config = ARENA_MUSIC_CONFIGS[this.currentArena] ?? ARENA_MUSIC_CONFIGS.fortress;

    // Drone: low sawtooth
    this.createLayer('drone', 'sawtooth', 55, 0.08, 300);
    // Percussion: noise burst (square wave at very low freq, filtered)
    this.createLayer('percussion', 'square', 30, 0.06, 100);
    // Bass: triangle
    this.createLayer('bass', 'triangle', 82, 0.1, 200);
    // Lead: arena-themed waveform
    this.createLayer('lead', config.leadWaveform, config.leadFreq, 0.07, 500);

    // Distortion effect for wave 5
    if (config.hasDistortion || this.currentWave >= 4) {
      this.distortionNode = this.ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i - 128) / 128;
        curve[i] = Math.tanh(x * 3);
      }
      this.distortionNode.curve = curve;
    }

    // Delay (reverb) for Nexus
    if (this.currentArena === 'nexus' || config.reverbAmount > 0.5) {
      this.delayNode = this.ctx.createDelay(0.5);
      this.delayNode.delayTime.value = 0.3;
    }
  }

  private createLayer(
    name: string, type: OscillatorType, freq: number,
    gain: number, filterFreq: number
  ): void {
    const filterNode = this.ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
    filterNode.Q.setValueAtTime(2, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

    const layer: MusicLayer = {
      type,
      frequency: freq,
      gainNode,
      filter: filterNode,
      isActive: false,
      oscNode: null,
      gain,
    };

    // Wire: filter → gainNode → masterGain (or distortion/delay)
    filterNode.connect(gainNode);

    if (this.distortionNode && this.delayNode) {
      gainNode.connect(this.distortionNode);
      this.distortionNode.connect(this.masterGain);
      this.distortionNode.connect(this.delayNode);
      this.delayNode.connect(this.masterGain);
    } else if (this.distortionNode) {
      gainNode.connect(this.distortionNode);
      this.distortionNode.connect(this.masterGain);
    } else {
      gainNode.connect(this.masterGain);
    }

    this.layers.set(name, layer);
  }

  private updateLayers(): void {
    const waveIdx = Math.min(this.currentWave, 4);

    for (const [name, layer] of this.layers) {
      const shouldBeActive = BGM_LAYER_ACTIVATION[name]?.[waveIdx] === 1;

      if (shouldBeActive && !layer.isActive) {
        // Start oscillator
        const osc = this.ctx.createOscillator();
        osc.type = layer.type;
        osc.frequency.setValueAtTime(layer.frequency, this.ctx.currentTime);

        // Crossfade in
        layer.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        layer.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        layer.gainNode.gain.linearRampToValueAtTime(layer.gain, this.ctx.currentTime + 0.5);

        osc.connect(layer.filter);
        osc.start(this.ctx.currentTime);

        layer.oscNode = osc;
        layer.isActive = true;
      } else if (!shouldBeActive && layer.isActive) {
        // Crossfade out
        layer.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        layer.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

        const osc = layer.oscNode;
        if (osc) {
          setTimeout(() => {
            try { osc.stop(); } catch (_) {}
          }, 500);
        }
        layer.oscNode = null;
        layer.isActive = false;
      }
    }
  }

  destroy(): void {
    this.stop();
    this.layers.clear();
    this.distortionNode = null;
    this.delayNode = null;
  }
}
