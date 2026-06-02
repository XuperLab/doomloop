import * as THREE from 'three';

export interface ScheduledSound {
  osc?: OscillatorNode;
  gain: GainNode;
  filter?: BiquadFilterNode;
  noise?: AudioBufferSourceNode;
  stop: () => void;
}

export interface SFXOptions {
  volume?: number;      // 0-1, default 1
  loop?: boolean;       // default false
  stereoPan?: number;   // -1 to 1, default 0
  pitch?: number;       // playback rate multiplier, default 1
}

export type SoundName =
  | 'plasma_fire' | 'shotgun_fire' | 'smg_fire' | 'rocket_fire'
  | 'imp_hurt' | 'imp_death'
  | 'boss_hurt' | 'boss_death' | 'boss_roar'
  | 'shooter_imp_hurt' | 'shooter_imp_death'
  | 'exploder_hurt' | 'exploder_death'
  | 'flyer_hurt' | 'flyer_death'
  | 'footstep' | 'impact_enemy' | 'impact_wall' | 'explosion'
  | 'double_kill' | 'triple_kill' | 'multi_kill'
  | 'rampage' | 'domination' | 'godlike'
  | 'power_up_collect' | 'shield_break'
  | 'supply_station' | 'portal_open';

type SoundFactory = (ctx: AudioContext) => ScheduledSound;

function noiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const length = sr * duration;
  const buffer = ctx.createBuffer(1, length, sr);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createStop(ctx: AudioContext, ...nodes: AudioNode[]): () => void {
  return () => {
    for (const node of nodes) {
      if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
        try { node.stop(); } catch (_) { /* already stopped */ }
      }
    }
  };
}

export const SOUND_DEFS: Record<string, SoundFactory> = {
  // ─── Weapons ───
  plasma_fire: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  shotgun_fire: (ctx) => {
    const bufferSrc = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    bufferSrc.buffer = noiseBuffer(ctx, 0.15);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    bufferSrc.connect(filter);
    filter.connect(gain);
    bufferSrc.start(ctx.currentTime);
    bufferSrc.stop(ctx.currentTime + 0.15);
    return { gain, filter, noise: bufferSrc, stop: createStop(ctx, bufferSrc) };
  },

  smg_fire: (ctx) => {
    const bufferSrc = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    bufferSrc.buffer = noiseBuffer(ctx, 0.04);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    bufferSrc.connect(filter);
    filter.connect(gain);
    bufferSrc.start(ctx.currentTime);
    bufferSrc.stop(ctx.currentTime + 0.04);
    return { gain, filter, noise: bufferSrc, stop: createStop(ctx, bufferSrc) };
  },

  rocket_fire: (ctx) => {
    const bufferSrc = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    bufferSrc.buffer = noiseBuffer(ctx, 0.3);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    bufferSrc.connect(filter);
    filter.connect(gain);
    bufferSrc.start(ctx.currentTime);
    bufferSrc.stop(ctx.currentTime + 0.3);
    return { gain, filter, noise: bufferSrc, stop: createStop(ctx, bufferSrc) };
  },

  // ─── Enemy Hurt ───
  imp_hurt: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  imp_death: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  boss_hurt: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.setValueAtTime(120, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  boss_death: (ctx) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(200, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.0);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(150, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.0);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.0);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.0);
    osc2.stop(ctx.currentTime + 1.0);
    return { osc: osc1, gain, filter, stop: createStop(ctx, osc1, osc2) };
  },

  boss_roar: (ctx) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const distortion = ctx.createWaveShaper();
    // Soft clipping
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i - 128) / 128;
      curve[i] = Math.tanh(x * 2);
    }
    distortion.curve = curve;
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 1.5);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(100, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.5);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(distortion);
    distortion.connect(gain);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.6);
    osc2.stop(ctx.currentTime + 1.6);
    return { osc: osc1, gain, filter, stop: createStop(ctx, osc1, osc2) };
  },

  shooter_imp_hurt: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(300, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  shooter_imp_death: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  exploder_hurt: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.setValueAtTime(200, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  exploder_death: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.65);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  flyer_hurt: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.setValueAtTime(700, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  flyer_death: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.55);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  // ─── Generic ───
  footstep: (ctx) => {
    const bufferSrc = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    bufferSrc.buffer = noiseBuffer(ctx, 0.05);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    bufferSrc.connect(filter);
    filter.connect(gain);
    bufferSrc.start(ctx.currentTime);
    bufferSrc.stop(ctx.currentTime + 0.06);
    return { gain, filter, noise: bufferSrc, stop: createStop(ctx, bufferSrc) };
  },

  impact_enemy: (ctx) => {
    const bufferSrc = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    bufferSrc.buffer = noiseBuffer(ctx, 0.04);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    bufferSrc.connect(filter);
    filter.connect(gain);
    bufferSrc.start(ctx.currentTime);
    bufferSrc.stop(ctx.currentTime + 0.05);
    return { gain, filter, noise: bufferSrc, stop: createStop(ctx, bufferSrc) };
  },

  impact_wall: (ctx) => {
    const bufferSrc = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    bufferSrc.buffer = noiseBuffer(ctx, 0.06);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    bufferSrc.connect(filter);
    filter.connect(gain);
    bufferSrc.start(ctx.currentTime);
    bufferSrc.stop(ctx.currentTime + 0.07);
    return { gain, filter, noise: bufferSrc, stop: createStop(ctx, bufferSrc) };
  },

  explosion: (ctx) => {
    const bufferSrc = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    bufferSrc.buffer = noiseBuffer(ctx, 0.3);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    bufferSrc.connect(filter);
    filter.connect(gain);
    bufferSrc.start(ctx.currentTime);
    bufferSrc.stop(ctx.currentTime + 0.35);
    return { gain, filter, noise: bufferSrc, stop: createStop(ctx, bufferSrc) };
  },

  // ─── Streak Callouts ───
  double_kill: (ctx) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc1.connect(gain);
    osc2.connect(gain);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.1);
    osc1.stop(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.25);
    return { osc: osc1, gain, stop: createStop(ctx, osc1, osc2) };
  },

  triple_kill: (ctx) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.1);
    osc3.start(ctx.currentTime + 0.2);
    osc1.stop(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.22);
    osc3.stop(ctx.currentTime + 0.35);
    return { osc: osc1, gain, stop: createStop(ctx, osc1, osc2, osc3) };
  },

  multi_kill: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  rampage: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(filter);
    filter.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    return { osc, gain, filter, stop: createStop(ctx, osc) };
  },

  domination: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(300, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  godlike: (ctx) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(100, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(80, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.5);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.55);
    osc2.stop(ctx.currentTime + 0.55);
    return { osc: osc1, gain, filter, stop: createStop(ctx, osc1, osc2) };
  },

  // ─── Misc ───
  power_up_collect: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  shield_break: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  supply_station: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, ctx.currentTime);
    osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(550, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    return { osc, gain, stop: createStop(ctx, osc) };
  },

  portal_open: (ctx) => {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(330, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    osc2.connect(gain);
    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.65);
    osc2.stop(ctx.currentTime + 0.65);
    return { osc, gain, stop: createStop(ctx, osc, osc2) };
  },
};
