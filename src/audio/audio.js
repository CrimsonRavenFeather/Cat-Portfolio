import { AUDIO_BASE, MUSIC_FILE, SFX_FILES, THROTTLE, VOLUME } from './config.js';
import { BAR, SFX, scheduleBar } from './synth.js';

/**
 * The one audio engine for the whole site. Neutral on purpose: both the Phaser
 * game and the React UI import it, and it imports neither.
 *
 *   audio.play('meow')       play a sound effect
 *   audio.setMusic(true)     background music on/off (remembered)
 *   audio.setSfx(false)      sound effects on/off  (remembered)
 *   audio.unlock()           called on the first click/key (browsers block sound before that)
 */
const STORAGE_KEY = 'pixelpet.audio';

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { music: saved.music ?? true, sfx: saved.sfx ?? true };
  } catch {
    return { music: true, sfx: true };
  }
}

let settings = loadSettings();
const listeners = new Set();

let ctx = null;
let master = null;
let sfxBus = null;
let music = null; // { bus, timer } while music is playing
let musicBuffer = null;
const buffers = {}; // name -> AudioBuffer for file-based sounds
const lastPlayed = {};

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage blocked (private mode etc.): settings just won't persist
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

async function loadFile(name) {
  const res = await fetch(`${AUDIO_BASE}${name}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return ctx.decodeAudioData(await res.arrayBuffer());
}

function loadFiles() {
  Object.entries(SFX_FILES).forEach(([name, file]) => {
    loadFile(file)
      .then((buf) => {
        buffers[name] = buf;
      })
      .catch(() => console.warn(`[audio] could not load "${file}" for "${name}" - using the built-in sound.`));
  });
  if (MUSIC_FILE) {
    loadFile(MUSIC_FILE)
      .then((buf) => {
        musicBuffer = buf;
        // the synth loop may already be running: swap it for the real track
        if (music && settings.music) {
          stopMusic(true);
          startMusic();
        }
      })
      .catch(() => console.warn(`[audio] could not load "${MUSIC_FILE}" - using the built-in music.`));
  }
}

function startMusic() {
  if (!ctx || music) return;
  const now = ctx.currentTime;
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, now);
  bus.gain.linearRampToValueAtTime(VOLUME.music, now + 1.5); // gentle fade-in
  bus.connect(master);

  if (musicBuffer) {
    const src = ctx.createBufferSource();
    src.buffer = musicBuffer;
    src.loop = true;
    src.connect(bus);
    src.start();
    music = { bus, src };
    return;
  }

  // Synth loop: schedule a bar at a time, a little ahead of the clock.
  let bar = 0;
  let next = now + 0.1;
  const pump = () => {
    while (next < ctx.currentTime + 1.2) {
      scheduleBar(ctx, bus, bar, next);
      next += BAR;
      bar += 1;
    }
  };
  pump();
  music = { bus, timer: setInterval(pump, 250) };
}

function stopMusic(immediate = false) {
  if (!music) return;
  const { bus, timer, src } = music;
  music = null;
  clearInterval(timer);
  const now = ctx.currentTime;
  bus.gain.cancelScheduledValues(now);
  bus.gain.setValueAtTime(bus.gain.value, now);
  bus.gain.linearRampToValueAtTime(0.0001, now + (immediate ? 0.05 : 0.5)); // fade out
  setTimeout(() => {
    try {
      src?.stop();
    } catch {
      // already stopped
    }
    bus.disconnect();
  }, immediate ? 120 : 700);
}

export const audio = {
  /** Create the audio context. Must run inside a user gesture (first click / key). */
  unlock() {
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();

      // a compressor on the way out keeps big moments (explosions) from clipping
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.ratio.value = 8;
      master = ctx.createGain();
      master.gain.value = VOLUME.master;
      master.connect(limiter);
      limiter.connect(ctx.destination);

      sfxBus = ctx.createGain();
      sfxBus.gain.value = VOLUME.sfx;
      sfxBus.connect(master);

      loadFiles();
      document.addEventListener('visibilitychange', () => {
        if (!ctx) return;
        if (document.hidden) ctx.suspend();
        else ctx.resume();
      });
    }
    ctx.resume().then(() => {
      if (settings.music) startMusic();
    });
  },

  play(name) {
    if (!settings.sfx || !ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const gap = THROTTLE[name] ?? THROTTLE.default;
    if (now - (lastPlayed[name] ?? -1) < gap) return;
    lastPlayed[name] = now;

    try {
      if (buffers[name]) {
        const src = ctx.createBufferSource();
        src.buffer = buffers[name];
        src.connect(sfxBus);
        src.start();
      } else if (SFX[name]) {
        SFX[name](ctx, sfxBus, now + 0.005);
      }
    } catch (err) {
      console.warn(`[audio] "${name}" failed`, err);
    }
  },

  setMusic(on) {
    settings = { ...settings, music: on };
    save();
    emit();
    if (!ctx) return; // will start on unlock()
    if (on) ctx.resume().then(startMusic);
    else stopMusic();
  },

  setSfx(on) {
    settings = { ...settings, sfx: on };
    save();
    emit();
  },

  toggleMusic() {
    this.unlock(); // a toggle is a click, so it is allowed to start audio
    this.setMusic(!settings.music);
  },

  toggleSfx() {
    this.unlock();
    this.setSfx(!settings.sfx);
  },

  // for React's useSyncExternalStore
  getState: () => settings,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** For tests / debugging */
  debug: () => ({ ctxState: ctx?.state ?? 'none', musicPlaying: Boolean(music), settings }),
};

// Dev only: lets tests / the console inspect the live engine (window.__audio.debug()).
if (import.meta.env.DEV) window.__audio = audio;
