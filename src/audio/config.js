/**
 * AUDIO ASSETS  -  how to replace the placeholder sounds with real recordings.
 *
 * Out of the box every sound is synthesised (see synth.js), so there are no
 * audio files. To use your own, drop files into public/audio/ and list them
 * here. A sound with a file is played from the file; one without (or whose
 * file fails to load) falls back to the built-in synth, so you can replace
 * them one at a time.
 *
 * Sound names: click, hover, panelOpen, panelClose, meow, meowShort,
 * meowHappy, meowSad, purr, hop, thud, whoosh, grab, tada, place, paw, dig,
 * flag, sniff, found, boom, win, lose, draw
 */
export const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/`;

/** e.g. { meow: 'meow.mp3', tada: 'tada.ogg' } */
export const SFX_FILES = {};

/** e.g. 'music.mp3'. A looping track replaces the built-in lo-fi loop. */
export const MUSIC_FILE = null;

/** Levels (1 = unchanged; effects are boosted above the music) */
export const VOLUME = {
  master: 0.8,
  sfx: 1.6, // effects sit above the music
  music: 0.42,
};

/** Minimum gap (seconds) between two plays of the same sound, to avoid machine-gunning. */
export const THROTTLE = { hover: 0.12, click: 0.05, default: 0.04 };
