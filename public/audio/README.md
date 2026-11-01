# Replacing the placeholder sounds

The site ships with **no audio files**: every sound effect and the background music are
synthesised in the browser (`src/audio/synth.js`). To use real recordings, put files in this
folder and list them in `src/audio/config.js`:

```js
export const SFX_FILES = { meow: 'meow.mp3', tada: 'tada.ogg' };
export const MUSIC_FILE = 'music.mp3';   // loops automatically
```

You can replace sounds one at a time - anything not listed (or that fails to load) keeps the
built-in version. mp3, ogg and wav all work.

Sound names: `click`, `hover`, `panelOpen`, `panelClose`, `meow`, `meowShort`, `meowHappy`,
`meowSad`, `purr`, `hop`, `thud`, `whoosh`, `grab`, `tada`, `place`, `paw`, `dig`, `flag`,
`sniff`, `found`, `boom`, `win`, `lose`, `draw`.

Volumes are in `VOLUME` in `src/audio/config.js`.
