/**
 * ASSET MANIFEST  -  the one place that knows about files on disk.
 *
 * To swap in your own art: drop a file with the same name into public/assets/
 * (or change the `file` below). If your new image has a different size, update
 * `size`/frame dimensions here and, for objects, the placement in layout.js.
 * See public/assets/README.md for the full guide.
 *
 * `fallbackSize` is only used if a file fails to load - the game then draws a
 * magenta placeholder box instead of crashing, so a typo is easy to spot.
 */
export const ASSET_BASE = `${import.meta.env.BASE_URL}assets/`;

export const IMAGES = [
  // Background. Any 16:9 image works: it is stretched to the game size.
  { key: 'room', file: 'room/room.png', fallbackSize: [320, 180] },

  // Interactive objects
  { key: 'laptop', file: 'objects/laptop.png', fallbackSize: [32, 24] },
  { key: 'folder', file: 'objects/folder.png', fallbackSize: [26, 18] },
  { key: 'bookshelf', file: 'objects/bookshelf.png', fallbackSize: [44, 84] },
  { key: 'frame', file: 'objects/frame.png', fallbackSize: [26, 28] },
  { key: 'phone', file: 'objects/phone.png', fallbackSize: [12, 20] },
  { key: 'tictactoe', file: 'objects/tictactoe.png', fallbackSize: [30, 22] },
  { key: 'minesweeper', file: 'objects/minesweeper.png', fallbackSize: [18, 26] },

  // Effects
  { key: 'heart', file: 'fx/heart.png', fallbackSize: [9, 8] },
  { key: 'sparkle', file: 'fx/sparkle.png', fallbackSize: [7, 7] },
  { key: 'shadow', file: 'fx/shadow.png', fallbackSize: [24, 8] },
];

/**
 * Cat sprite sheet: a grid of equally sized frames, one animation per ROW.
 * Replace public/assets/cat/cat-sheet.png with your own sheet and edit the
 * numbers below to match its grid.
 */
export const CAT_SHEET = {
  key: 'cat',
  file: 'cat/cat-sheet.png',
  frameWidth: 32,
  frameHeight: 32,
  columns: 6,
  rows: 5,
};

/**
 * Animations. `row` is the sheet row (0-based), `frames` how many frames of
 * that row are used (counted from the left).
 */
export const CAT_ANIMS = {
  idle: { row: 0, frames: 4, frameRate: 3, repeat: -1 },
  walk: { row: 1, frames: 6, frameRate: 9, repeat: -1 },
  sleep: { row: 2, frames: 4, frameRate: 2, repeat: -1 },
  react: { row: 3, frames: 4, frameRate: 8, repeat: 0 },
  drag: { row: 4, frames: 2, frameRate: 4, repeat: -1 },
};
