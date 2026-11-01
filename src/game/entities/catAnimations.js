import { CAT_ANIMS, CAT_SHEET } from '../config/assets.js';

export const animKey = (name) => `cat-${name}`;

/** Builds one Phaser animation per entry in CAT_ANIMS (one sheet row each). */
export function registerCatAnimations(anims) {
  Object.entries(CAT_ANIMS).forEach(([name, a]) => {
    const key = animKey(name);
    if (anims.exists(key)) return;
    const start = a.row * CAT_SHEET.columns;
    anims.create({
      key,
      frames: anims.generateFrameNumbers(CAT_SHEET.key, { start, end: start + a.frames - 1 }),
      frameRate: a.frameRate,
      repeat: a.repeat,
    });
  });
}
