/**
 * Placeholder sounds, synthesised with the Web Audio API - no audio files needed.
 *
 * Every recipe is `(ctx, out, t) => void`: it schedules its sound on `ctx`
 * starting at time `t`, into the node `out`. Nothing here touches the DOM,
 * Phaser or React, and it works on an OfflineAudioContext too (used by tests).
 *
 * To use a real recording instead of a recipe, see src/audio/config.js.
 */
const rnd = (a, b) => a + Math.random() * (b - a);
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// ------------------------------------------------------------- primitives
const noiseCache = new WeakMap();
function noiseBuffer(ctx) {
  let buf = noiseCache.get(ctx);
  if (!buf) {
    buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseCache.set(ctx, buf);
  }
  return buf;
}

/** A single pitched note with an optional pitch glide and filter. */
function tone(ctx, out, { t, freq, to, dur = 0.15, type = 'square', vol = 0.15, attack = 0.004, filter }) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = filter.type;
    f.frequency.value = filter.freq;
    f.Q.value = filter.q ?? 1;
    osc.connect(f);
    f.connect(gain);
  } else {
    osc.connect(gain);
  }
  gain.connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** A burst of filtered noise (whooshes, clicks, hi-hats, explosions). */
function noise(ctx, out, { t, dur = 0.1, vol = 0.15, type = 'bandpass', freq = 1000, to, q = 1, attack = 0.003 }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;

  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(f);
  f.connect(gain);
  gain.connect(out);
  src.start(t, rnd(0, 1));
  src.stop(t + dur + 0.05);
}

/** A cat-ish "meow": a sawtooth sweeping through a moving vowel filter, with vibrato. */
function meow(ctx, out, t, { f0 = rnd(430, 520), dur = 0.45, peak = 1.7, end = 1.05, vol = 0.5 } = {}) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.linearRampToValueAtTime(f0 * peak, t + dur * 0.35);
  osc.frequency.linearRampToValueAtTime(f0 * end, t + dur);

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 6.5;
  lfoGain.gain.value = f0 * 0.025;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  const vowel = ctx.createBiquadFilter();
  vowel.type = 'bandpass';
  vowel.Q.value = 3;
  vowel.frequency.setValueAtTime(800, t);
  vowel.frequency.linearRampToValueAtTime(2000, t + dur * 0.4);
  vowel.frequency.linearRampToValueAtTime(1000, t + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.05);
  gain.gain.setValueAtTime(vol, t + dur * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(vowel);
  vowel.connect(gain);
  gain.connect(out);
  osc.start(t);
  lfo.start(t);
  osc.stop(t + dur + 0.05);
  lfo.stop(t + dur + 0.05);
}

/** Low rumbling purr: lowpassed noise whose volume pulses ~24 times a second. */
function purr(ctx, out, t, dur = 1.4, vol = 0.5) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 220;

  const pulse = ctx.createGain();
  pulse.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 24;
  lfoGain.gain.value = 0.5;
  lfo.connect(lfoGain);
  lfoGain.connect(pulse.gain);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(vol, t + dur * 0.25);
  env.gain.linearRampToValueAtTime(vol, t + dur * 0.7);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(lp);
  lp.connect(pulse);
  pulse.connect(env);
  env.connect(out);
  src.start(t, rnd(0, 1));
  lfo.start(t);
  src.stop(t + dur + 0.05);
  lfo.stop(t + dur + 0.05);
}

const arpeggio = (ctx, out, t, notes, { step = 0.09, type = 'triangle', vol = 0.2, dur = 0.22 } = {}) =>
  notes.forEach((m, i) => tone(ctx, out, { t: t + i * step, freq: mtof(m), dur, type, vol }));

// ----------------------------------------------------------- sound effects
/** name -> (ctx, out, t) */
export const SFX = {
  // interface
  click: (c, o, t) => tone(c, o, { t, freq: 900, to: 1300, dur: 0.05, type: 'square', vol: 0.12 }),
  hover: (c, o, t) => tone(c, o, { t, freq: 1400, dur: 0.03, type: 'sine', vol: 0.07 }),
  panelOpen: (c, o, t) => {
    tone(c, o, { t, freq: 660, dur: 0.08, vol: 0.14 });
    tone(c, o, { t: t + 0.07, freq: 990, dur: 0.12, vol: 0.14 });
  },
  panelClose: (c, o, t) => {
    tone(c, o, { t, freq: 880, dur: 0.07, vol: 0.12 });
    tone(c, o, { t: t + 0.06, freq: 587, dur: 0.12, vol: 0.12 });
  },

  // the cat
  meow: (c, o, t) => meow(c, o, t),
  meowShort: (c, o, t) => meow(c, o, t, { f0: rnd(520, 600), dur: 0.22, peak: 1.4, end: 1.1, vol: 0.45 }),
  meowHappy: (c, o, t) => {
    meow(c, o, t, { f0: rnd(640, 720), dur: 0.2, peak: 1.5, end: 1.2, vol: 0.4 });
    meow(c, o, t + 0.22, { f0: rnd(700, 780), dur: 0.26, peak: 1.5, end: 1.1, vol: 0.4 });
  },
  meowSad: (c, o, t) => meow(c, o, t, { f0: 640, dur: 0.7, peak: 1.25, end: 0.7, vol: 0.4 }),
  purr: (c, o, t) => purr(c, o, t),
  hop: (c, o, t) => tone(c, o, { t, freq: 300, to: 720, dur: 0.12, type: 'sine', vol: 0.22 }),
  thud: (c, o, t) => {
    tone(c, o, { t, freq: 150, to: 45, dur: 0.18, type: 'sine', vol: 0.6 });
    noise(c, o, { t, dur: 0.06, vol: 0.12, type: 'lowpass', freq: 500 });
  },
  whoosh: (c, o, t) => noise(c, o, { t, dur: 0.4, vol: 0.4, type: 'bandpass', freq: 400, to: 2800, q: 1.2, attack: 0.12 }),
  grab: (c, o, t) => {
    tone(c, o, { t, freq: 520, to: 1040, dur: 0.07, type: 'square', vol: 0.14 });
    tone(c, o, { t: t + 0.07, freq: 1040, dur: 0.1, type: 'square', vol: 0.12 });
  },
  tada: (c, o, t) => {
    arpeggio(c, o, t, [72, 76, 79, 84], { step: 0.085, vol: 0.2 });
    tone(c, o, { t: t + 0.34, freq: mtof(88), dur: 0.5, type: 'sine', vol: 0.12 });
    noise(c, o, { t: t + 0.3, dur: 0.35, vol: 0.05, type: 'highpass', freq: 6000 });
  },

  // games
  place: (c, o, t) => {
    noise(c, o, { t, dur: 0.04, vol: 0.4, type: 'bandpass', freq: 1800, q: 2 });
    tone(c, o, { t, freq: 320, to: 220, dur: 0.07, type: 'triangle', vol: 0.3 });
  },
  paw: (c, o, t) => {
    noise(c, o, { t, dur: 0.09, vol: 0.4, type: 'lowpass', freq: 700 });
    tone(c, o, { t, freq: 230, to: 150, dur: 0.1, type: 'sine', vol: 0.35 });
  },
  dig: (c, o, t) => noise(c, o, { t, dur: 0.1, vol: 0.35, type: 'bandpass', freq: 1000, to: 450, q: 1.5 }),
  flag: (c, o, t) => {
    tone(c, o, { t, freq: 660, dur: 0.12, type: 'triangle', vol: 0.25 });
    tone(c, o, { t: t + 0.06, freq: 990, dur: 0.14, type: 'triangle', vol: 0.22 });
  },
  sniff: (c, o, t) => {
    [0, 0.14, 0.28].forEach((d) => noise(c, o, { t: t + d, dur: 0.09, vol: 0.2, type: 'highpass', freq: 3500, attack: 0.02 }));
  },
  found: (c, o, t) => {
    tone(c, o, { t, freq: 1320, dur: 0.45, type: 'sine', vol: 0.22 });
    tone(c, o, { t: t + 0.1, freq: 1760, dur: 0.5, type: 'sine', vol: 0.16 });
  },
  boom: (c, o, t) => {
    noise(c, o, { t, dur: 0.8, vol: 0.5, type: 'lowpass', freq: 900, to: 60, attack: 0.005 });
    tone(c, o, { t, freq: 110, to: 30, dur: 0.7, type: 'sine', vol: 0.4 });
  },
  win: (c, o, t) => {
    arpeggio(c, o, t, [72, 76, 79, 84, 88], { step: 0.1, type: 'square', vol: 0.14, dur: 0.2 });
    tone(c, o, { t: t + 0.5, freq: mtof(91), dur: 0.55, type: 'triangle', vol: 0.2 });
  },
  lose: (c, o, t) => arpeggio(c, o, t, [69, 67, 64, 60], { step: 0.18, type: 'triangle', vol: 0.25, dur: 0.3 }),
  draw: (c, o, t) => arpeggio(c, o, t, [67, 64], { step: 0.15, type: 'triangle', vol: 0.22, dur: 0.25 }),
};

// ------------------------------------------------------------------- music
export const BPM = 80;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
export const LOOP_BARS = 8;

// 8-bar cozy loop: C^7  Am7  Dm7  G7 | F^7  Em7  Dm7  G7
const PROGRESSION = [
  { root: 36, notes: [48, 52, 55, 59] },
  { root: 33, notes: [45, 48, 52, 55] },
  { root: 38, notes: [50, 53, 57, 60] },
  { root: 31, notes: [43, 47, 50, 53] },
  { root: 41, notes: [53, 57, 60, 64] },
  { root: 40, notes: [52, 55, 59, 62] },
  { root: 38, notes: [50, 53, 57, 60] },
  { root: 31, notes: [43, 47, 50, 53] },
];
const ARP_PATTERN = [0, 1, 2, 3, 2, 1, 2, 1];
const PENTATONIC = [72, 74, 76, 79, 81]; // C major pentatonic, always sounds fine
const SWING = BEAT * 0.07;

/** Schedules one bar of the lo-fi loop starting at time `t0`. */
export function scheduleBar(ctx, out, bar, t0) {
  const chord = PROGRESSION[bar % LOOP_BARS];

  // bass
  tone(ctx, out, { t: t0, freq: mtof(chord.root), dur: BEAT * 1.8, type: 'sine', vol: 0.3 });
  tone(ctx, out, { t: t0 + BEAT * 2.5, freq: mtof(chord.root), dur: BEAT * 1.2, type: 'sine', vol: 0.22 });

  // soft pad
  chord.notes.forEach((m) =>
    tone(ctx, out, { t: t0, freq: mtof(m), dur: BAR * 0.98, type: 'sine', vol: 0.05, attack: 0.35 }),
  );

  // plucky arpeggio, eighth notes with a little swing
  ARP_PATTERN.forEach((idx, i) => {
    const t = t0 + (i * BEAT) / 2 + (i % 2 ? SWING : 0);
    tone(ctx, out, {
      t,
      freq: mtof(chord.notes[idx] + 12),
      dur: BEAT * 0.9,
      type: 'triangle',
      vol: 0.1,
      filter: { type: 'lowpass', freq: 2000 },
    });
  });

  // drums: soft kick, brushed snare, quiet hats
  tone(ctx, out, { t: t0, freq: 130, to: 45, dur: 0.22, type: 'sine', vol: 0.4 });
  tone(ctx, out, { t: t0 + BEAT * 2.5, freq: 130, to: 45, dur: 0.22, type: 'sine', vol: 0.32 });
  [1, 3].forEach((b) =>
    noise(ctx, out, { t: t0 + b * BEAT, dur: 0.13, vol: 0.11, type: 'bandpass', freq: 1800, q: 0.8 }),
  );
  for (let i = 0; i < 8; i++) {
    noise(ctx, out, {
      t: t0 + (i * BEAT) / 2 + (i % 2 ? SWING : 0),
      dur: 0.035,
      vol: i % 2 ? 0.035 : 0.055,
      type: 'highpass',
      freq: 7000,
    });
  }

  // a sparse little melody with an echo, every other bar
  if (bar % 2 === 1) {
    const slots = [0.5, 1.5, 2, 3, 3.5].filter(() => Math.random() < 0.55);
    slots.forEach((s) => {
      const m = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      tone(ctx, out, { t: t0 + s * BEAT, freq: mtof(m), dur: BEAT * 1.1, type: 'sine', vol: 0.12 });
      tone(ctx, out, { t: t0 + s * BEAT + BEAT * 0.75, freq: mtof(m), dur: BEAT * 0.9, type: 'sine', vol: 0.045 });
    });
  }
}
