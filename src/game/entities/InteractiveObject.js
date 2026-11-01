import Phaser from 'phaser';
import { audio } from '../../audio/audio.js';
import { EventBus, GameEvents } from '../EventBus.js';

/**
 * A clickable piece of furniture. It knows nothing about React: it emits
 * hover/out on the EventBus, tells its scene when it was clicked, and can be
 * "borrowed" (hidden) while the cat is carrying it around.
 */
export default class InteractiveObject {
  constructor(scene, def) {
    this.scene = scene;
    this.def = def;
    this.id = def.id;
    this.hovered = false;
    this.highlighted = false;
    this.borrowed = false;

    const sprite = scene.add
      .image(def.x, def.y, def.textureKey)
      .setOrigin(def.originX ?? 0.5, def.originY ?? 1)
      .setDepth(def.depth ?? 20);
    if (def.scale) sprite.setScale(def.scale);
    this.sprite = sprite;

    const pad = def.hitPadding ?? 3;
    sprite.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-pad, -pad, sprite.width + pad * 2, sprite.height + pad * 2),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    // Soft glow (WebGL only), created only while lit: a post-FX pass costs a
    // full-canvas render, so it must not stay attached to every object.
    this.glow = null;
    this.canGlow = scene.renderer.type === Phaser.WEBGL && Boolean(sprite.postFX);

    // A little twinkle above the object says "I'm clickable".
    const top = sprite.getTopCenter();
    this.sparkle = scene.add
      .image(Math.round(top.x), Math.round(top.y) - 5, 'sparkle')
      .setDepth(900)
      .setAlpha(0.9);
    scene.tweens.add({
      targets: this.sparkle,
      y: this.sparkle.y - 2,
      alpha: 0.35,
      duration: 900 + Math.random() * 400,
      delay: Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    sprite.on('pointerover', () => this.setHover(true));
    sprite.on('pointerout', () => this.setHover(false));
    sprite.on('pointerup', () => {
      if (!scene.isCatBusy()) audio.play('click');
      scene.events.emit('object:click', this.id);
    });
  }

  /** Screen position of the top-centre, for UI overlays. */
  anchor() {
    const top = this.sprite.getTopCenter();
    return this.scene.toScreen(top.x, top.y - 4);
  }

  setHover(on) {
    if (this.hovered === on) return;
    this.hovered = on;
    this.refresh();
    if (on) {
      if (this.scene.isCatBusy()) return; // no tooltips while the cat is on a mission
      audio.play('hover');
      EventBus.emit(GameEvents.OBJECT_HOVER, {
        id: this.id,
        label: this.def.label,
        item: this.def.item,
        ...this.anchor(),
      });
    } else {
      EventBus.emit(GameEvents.OBJECT_OUT, { id: this.id });
    }
  }

  /** Lit up from the UI (e.g. keyboard focus in the accessible menu). */
  setHighlight(on) {
    this.highlighted = on;
    this.refresh();
  }

  /** Hidden while the cat is carrying it. */
  setBorrowed(on) {
    this.borrowed = on;
    this.sprite.setVisible(!on);
    if (on) {
      this.hovered = false;
      EventBus.emit(GameEvents.OBJECT_OUT, { id: this.id });
    }
    this.refresh();
  }

  /** Drop any hover/highlight state without emitting events. */
  reset() {
    this.hovered = false;
    this.highlighted = false;
    this.refresh();
  }

  refresh() {
    const lit = this.hovered || this.highlighted;
    this.sparkle.setVisible(!lit && !this.borrowed);

    if (!this.canGlow) {
      if (lit) this.sprite.setTint(0xfff3c4);
      else this.sprite.clearTint();
      return;
    }

    if (lit && !this.glow) {
      try {
        this.glow = this.sprite.postFX.addGlow(0xffe9a0, 0, 0, false, 0.1, 8);
      } catch {
        this.canGlow = false;
        this.sprite.setTint(0xfff3c4);
        return;
      }
    }
    if (!this.glow) return;

    const glow = this.glow;
    this.scene.tweens.killTweensOf(glow);
    this.scene.tweens.add({
      targets: glow,
      outerStrength: lit ? 3 : 0,
      duration: 140,
      onComplete: () => {
        if (!lit && this.glow === glow) {
          this.sprite.postFX.remove(glow);
          this.glow = null;
        }
      },
    });
  }
}
