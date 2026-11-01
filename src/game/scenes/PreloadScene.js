import Phaser from 'phaser';
import { ASSET_BASE, CAT_SHEET, IMAGES } from '../config/assets.js';
import { registerCatAnimations } from '../entities/catAnimations.js';

/** Loads everything listed in config/assets.js, then starts the room. */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.cameras.main.setBackgroundColor(0x2a1d2e);

    // tiny pixel loading bar
    const w = 120;
    const x = (this.scale.width - w) / 2;
    const y = this.scale.height / 2;
    const frame = this.add.graphics();
    frame.lineStyle(1, 0xf6e8d0, 1).strokeRect(x - 2, y - 2, w + 4, 8);
    const bar = this.add.graphics();
    this.load.on('progress', (p) => {
      bar.clear().fillStyle(0xee9340, 1).fillRect(x, y, w * p, 4);
    });
    this.load.on('loaderror', (file) => {
      console.warn(`[assets] could not load "${file.key}" (${file.url}) - using a placeholder box.`);
    });

    this.load.setPath(ASSET_BASE);
    IMAGES.forEach((a) => this.load.image(a.key, a.file));
    this.load.spritesheet(CAT_SHEET.key, CAT_SHEET.file, {
      frameWidth: CAT_SHEET.frameWidth,
      frameHeight: CAT_SHEET.frameHeight,
    });
  }

  create() {
    this.createFallbacks();
    registerCatAnimations(this.anims);
    this.scene.start('Room');
  }

  /** A missing/mistyped asset becomes a magenta box instead of a crash. */
  createFallbacks() {
    IMAGES.forEach(({ key, fallbackSize }) => {
      if (this.textures.exists(key)) return;
      this.drawBox(key, fallbackSize[0], fallbackSize[1]);
    });

    if (!this.textures.exists(CAT_SHEET.key)) {
      const { key, frameWidth: fw, frameHeight: fh, columns, rows } = CAT_SHEET;
      this.drawBox(key, fw * columns, fh * rows);
      const tex = this.textures.get(key);
      for (let i = 0; i < columns * rows; i++) {
        tex.add(i, 0, (i % columns) * fw, Math.floor(i / columns) * fh, fw, fh);
      }
    }
  }

  drawBox(key, w, h) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff00ff, 0.6).fillRect(0, 0, w, h);
    g.lineStyle(1, 0x000000, 1).strokeRect(0.5, 0.5, w - 1, h - 1);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
