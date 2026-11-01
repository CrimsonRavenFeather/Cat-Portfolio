import Phaser from 'phaser';
import { audio } from '../../audio/audio.js';
import { EventBus, GameEvents } from '../EventBus.js';
import { CAT, CAT_STATES as S } from '../config/cat.js';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/layout.js';
import { animKey } from './catAnimations.js';

const rand = (min, max) => min + Math.random() * (max - min);
const randRange = ([min, max]) => rand(min, max);
const lerp = (a, b, t) => a + (b - a) * t;

// While fetching, the cat can't be picked up.
const NO_DRAG = [S.FETCH, S.GRAB, S.CARRY, S.PRESENT, S.HOLD];
const BUSY = [...NO_DRAG, S.DRAG, S.FALL];
const CARRYING = [S.CARRY, S.PRESENT, S.HOLD];

/**
 * The virtual pet. A small state machine:
 *
 *   idle  -> wander (walking) -> idle
 *   idle  -> walk to bed (walking) -> sleeping -> idle
 *   click -> reacting (hop + hearts) -> idle
 *   drag  -> dragged -> falling -> returning (walks back to bed) -> idle
 *
 *   fetch -> fetching (runs to the item) -> grabbing (hops, item flies to its
 *            head) -> carrying (walks to the front) -> presenting (ta-da!) ->
 *            holding (the UI panel is open) -> returnItem() puts it back -> idle
 *
 * `x`/`y` is where the paws touch the ground. `hop` lifts the sprite (but not
 * the shadow) for jumps.
 */
export default class Cat {
  constructor(scene) {
    this.scene = scene;
    this.x = CAT.home.x;
    this.y = CAT.home.y;
    this.hop = 0;
    this.landY = this.y;

    this.state = S.IDLE;
    this.timer = 2500;
    this.target = null;
    this.onArrive = null;
    this.speed = CAT.walkSpeed;
    this.dragTarget = { x: this.x, y: this.y };
    this.wasDragged = false;

    // fetch bookkeeping
    this.item = null;
    this.ghost = null;
    this.onPresented = null;
    this.ghostLift = 0;
    this.carryH = 20;

    this.shadow = scene.add.image(this.x, this.y, 'shadow').setOrigin(0.5, 0.5);
    this.sprite = scene.add
      .sprite(this.x, this.y, CAT.textureKey, 0)
      .setOrigin(0.5, CAT.feetY / CAT.frameSize);

    this.setupInput();
    this.play('idle');
    this.sync();
  }

  // ------------------------------------------------------------------ input
  setupInput() {
    const s = this.sprite;
    s.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(2, 0, CAT.frameSize - 4, CAT.frameSize),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
      draggable: true,
    });

    s.on('pointerdown', () => {
      this.wasDragged = false;
    });
    s.on('pointerup', () => {
      if (!this.wasDragged) this.onClick();
    });
    s.on('dragstart', (pointer) => this.onDragStart(pointer));
    s.on('drag', (pointer) => {
      if (this.state === S.DRAG) this.updateDragTarget(pointer);
    });
    s.on('dragend', () => this.onDragEnd());
  }

  // ----------------------------------------------------------------- helpers
  setState(next) {
    if (this.state === next) return;
    this.state = next;
    this.scene.input.setDraggable(this.sprite, !NO_DRAG.includes(next));
    EventBus.emit(GameEvents.CAT_STATE, { state: next });
  }

  isBusy() {
    return BUSY.includes(this.state);
  }

  play(name, restart = false) {
    this.sprite.play(animKey(name), !restart);
  }

  distanceTo(p) {
    return Math.hypot(p.x - this.x, p.y - this.y);
  }

  /** Stop whatever tweens / timers are running so a new behaviour can start cleanly. */
  cancelPending() {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.sprite);
    if (this.homeTimer) this.homeTimer.remove(false);
    this.sprite.setScale(1);
    this.hop = 0;
    this.target = null;
    this.onArrive = null;
  }

  /** Speech bubble above the cat (drawn by the React overlay). */
  say(text) {
    EventBus.emit(GameEvents.CAT_SAY, { text, ...this.scene.toScreen(this.x, this.y - 34) });
  }

  // ---------------------------------------------------------- behaviour: AI
  enterIdle(delay) {
    this.setState(S.IDLE);
    this.timer = delay ?? randRange(CAT.idleDelay);
    this.play('idle');
  }

  enterSleep() {
    this.setState(S.SLEEP);
    this.timer = randRange(CAT.sleepDuration);
    this.play('sleep');
    audio.play('purr');
  }

  decide() {
    const r = Math.random();
    const { wander, sleep } = CAT.chances;
    if (r < wander) {
      this.wander();
    } else if (r < wander + sleep) {
      if (this.distanceTo(CAT.home) < 4) {
        this.enterSleep();
      } else {
        this.walkTo(CAT.home, CAT.walkSpeed, () => this.enterSleep());
      }
    } else {
      this.enterIdle();
    }
  }

  wander() {
    const b = CAT.bounds;
    let point = { x: rand(b.minX, b.maxX), y: rand(b.minY, b.maxY) };
    for (let i = 0; i < 5 && this.distanceTo(point) < 30; i++) {
      point = { x: rand(b.minX, b.maxX), y: rand(b.minY, b.maxY) };
    }
    this.walkTo(point, CAT.walkSpeed, () => this.enterIdle());
  }

  walkTo(point, speed, onArrive, state = S.WALK) {
    this.setState(state);
    this.target = point;
    this.speed = speed;
    this.onArrive = onArrive;
    this.play('walk');
  }

  stepToward(dt) {
    const t = this.target;
    if (!t) return;
    const dx = t.x - this.x;
    const dy = t.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (dist <= step) {
      this.x = t.x;
      this.y = t.y;
      const done = this.onArrive;
      this.target = null;
      this.onArrive = null;
      if (done) done();
      return;
    }
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    if (Math.abs(dx) > 0.4) this.sprite.setFlipX(dx < 0);
  }

  // ------------------------------------------------------- behaviour: click
  onClick() {
    const ok = [S.IDLE, S.WALK, S.SLEEP, S.REACT, S.RETURN].includes(this.state);
    if (!ok) return;

    this.cancelPending();
    this.setState(S.REACT);
    this.play('react', true);

    this.scene.tweens.add({
      targets: this,
      hop: 9,
      duration: 150,
      ease: 'Sine.easeOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.hop = 0;
        if (this.state === S.REACT) this.enterIdle(1800);
      },
    });

    this.spawnHearts(3);
    audio.play('meow');
    EventBus.emit(GameEvents.CAT_CLICK, this.scene.toScreen(this.x, this.y - 34));
  }

  spawnHearts(count) {
    for (let i = 0; i < count; i++) {
      const heart = this.scene.add
        .image(this.x + rand(-9, 9), this.y - 26, 'heart')
        .setDepth(1100)
        .setAlpha(0);
      this.scene.tweens.add({
        targets: heart,
        y: heart.y - rand(16, 26),
        alpha: { from: 1, to: 0 },
        duration: 950,
        delay: i * 140,
        ease: 'Sine.easeOut',
        onStart: () => heart.setAlpha(1),
        onComplete: () => heart.destroy(),
      });
    }
  }

  // ------------------------------------------------------ behaviour: fetch
  /**
   * Run to `obj`, grab it, carry it to the front of the room and show it off.
   * `onPresented` fires when the cat is holding it up (the UI opens then).
   */
  fetch(obj, onPresented) {
    if (this.isBusy()) return;
    this.cancelPending();
    this.item = obj;
    this.onPresented = onPresented;
    this.say('On it!');
    audio.play('meowShort');
    this.walkTo(obj.def.fetchFrom, CAT.fetchSpeed, () => this.grab(), S.FETCH);
  }

  grab() {
    const def = this.item.def;
    this.setState(S.GRAB);
    this.sprite.setFlipX(def.x < this.x);
    this.play('react', true);
    audio.play('hop');
    this.scene.tweens.add({
      targets: this,
      hop: 11,
      duration: 150,
      ease: 'Sine.easeOut',
      yoyo: true,
      repeat: 1,
    });
    this.scene.time.delayedCall(260, () => {
      if (this.state !== S.GRAB || !this.item) return;
      this.say('Got it!');
      audio.play('grab');
      audio.play('whoosh');
      this.launchItem();
    });
  }

  /** The item leaps off its spot and lands above the cat's head. */
  launchItem() {
    const obj = this.item;
    const s = obj.sprite;
    const center = s.getCenter();
    const baseScale = s.scaleX;
    const w = s.width * baseScale;
    const h = s.height * baseScale;
    const shrink = Math.min(1, 22 / h, 30 / w);
    const carryScale = baseScale * shrink;
    this.carryH = h * shrink;

    obj.setBorrowed(true);
    const ghost = this.scene.add
      .image(center.x, center.y, s.texture.key)
      .setOrigin(0.5, 0.5)
      .setScale(baseScale)
      .setDepth(1200);
    this.ghost = ghost;

    const flight = { t: 0 };
    this.scene.tweens.add({
      targets: flight,
      t: 1,
      duration: 520,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const end = this.carryPos();
        ghost.setPosition(
          lerp(center.x, end.x, flight.t),
          lerp(center.y, end.y, flight.t) - Math.sin(Math.PI * flight.t) * 22,
        );
        ghost.setScale(lerp(baseScale, carryScale, flight.t));
      },
      onComplete: () => {
        if (this.item) this.carry();
      },
    });
  }

  /** Where the carried item floats: just above the head. */
  carryPos() {
    return {
      x: Math.round(this.x),
      y: Math.round(this.y - this.hop) - 30 - this.carryH / 2 - this.ghostLift,
    };
  }

  carry() {
    this.ghostLift = 0;
    this.walkTo(CAT.presentSpot, CAT.carrySpeed, () => this.present(), S.CARRY);
  }

  present() {
    this.setState(S.PRESENT);
    this.sprite.setFlipX(false);
    this.play('idle', true);
    this.say('Ta-da!');
    audio.play('tada');

    const g = this.ghost;
    this.scene.tweens.add({ targets: this, ghostLift: 14, duration: 350, ease: 'Back.easeOut' });
    this.scene.tweens.add({ targets: g, scale: g.scaleX * 1.5, duration: 350, ease: 'Back.easeOut' });
    this.spawnSparkles(7);

    this.scene.time.delayedCall(750, () => {
      if (this.state !== S.PRESENT) return;
      this.setState(S.HOLD);
      if (this.onPresented) this.onPresented();
    });
  }

  spawnSparkles(count) {
    const origin = this.carryPos();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const sp = this.scene.add.image(origin.x, origin.y, 'sparkle').setDepth(1250);
      this.scene.tweens.add({
        targets: sp,
        x: origin.x + Math.cos(angle) * 26,
        y: origin.y + Math.sin(angle) * 20,
        alpha: 0,
        duration: 620,
        ease: 'Sine.easeOut',
        onComplete: () => sp.destroy(),
      });
    }
  }

  /** The UI panel closed: the item flies back to where it lives. */
  returnItem() {
    const obj = this.item;
    const g = this.ghost;
    if (!obj || !g) return;

    this.cancelPending();
    this.setState(S.REACT);
    this.play('react', true);
    this.spawnHearts(2);
    audio.play('whoosh');
    audio.play('meowHappy');
    this.scene.tweens.add({
      targets: this,
      hop: 8,
      duration: 140,
      ease: 'Sine.easeOut',
      yoyo: true,
      repeat: 1,
    });

    const s = obj.sprite;
    const to = s.getCenter();
    const from = { x: g.x, y: g.y, scale: g.scaleX };
    const flight = { t: 0 };
    this.scene.tweens.add({
      targets: flight,
      t: 1,
      duration: 650,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        g.setPosition(
          lerp(from.x, to.x, flight.t),
          lerp(from.y, to.y, flight.t) - Math.sin(Math.PI * flight.t) * 24,
        );
        g.setScale(lerp(from.scale, s.scaleX, flight.t));
      },
      onComplete: () => {
        obj.setBorrowed(false);
        g.destroy();
        this.ghost = null;
        this.item = null;
        this.ghostLift = 0;
        this.hop = 0;
        if (this.state === S.REACT) this.enterIdle(1500);
      },
    });
  }

  // -------------------------------------------------------- behaviour: drag
  updateDragTarget(pointer) {
    this.dragTarget = {
      x: Phaser.Math.Clamp(pointer.worldX, 12, GAME_WIDTH - 12),
      y: Phaser.Math.Clamp(pointer.worldY + CAT.dragHoldOffsetY, 30, GAME_HEIGHT - 1),
    };
  }

  onDragStart(pointer) {
    if (NO_DRAG.includes(this.state)) return;
    this.wasDragged = true;
    this.cancelPending();
    this.setState(S.DRAG);
    audio.play('meowSad');
    this.sprite.setFlipX(false);
    this.play('drag', true);
    this.updateDragTarget(pointer);
  }

  onDragEnd() {
    if (this.state !== S.DRAG) return;

    const d = CAT.dropBounds;
    this.x = Phaser.Math.Clamp(this.x, d.minX, d.maxX);
    this.landY = Phaser.Math.Clamp(this.y, d.minY, d.maxY);
    this.setState(S.FALL);

    const dist = Math.abs(this.landY - this.y);
    const land = () => {
      this.y = this.landY;
      audio.play('thud');
      this.play('idle', true);
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.18,
        scaleY: 0.8,
        duration: 80,
        yoyo: true,
        onComplete: () => this.sprite.setScale(1),
      });
      // a short dazed moment, then back to its place
      this.homeTimer = this.scene.time.delayedCall(550, () => {
        if (this.state === S.FALL) this.goHome();
      });
    };

    if (dist < 1) {
      land();
    } else {
      this.scene.tweens.add({
        targets: this,
        y: this.landY,
        duration: Phaser.Math.Clamp(160 + dist * 4, 220, 650),
        ease: 'Bounce.easeOut',
        onComplete: land,
      });
    }
  }

  goHome() {
    this.walkTo(CAT.home, CAT.returnSpeed, () => this.enterIdle(1800), S.RETURN);
  }

  // ----------------------------------------------------------------- update
  update(_time, delta) {
    const dt = delta / 1000;

    switch (this.state) {
      case S.IDLE:
        this.timer -= delta;
        if (this.timer <= 0) this.decide();
        break;
      case S.SLEEP:
        this.timer -= delta;
        if (this.timer <= 0) this.enterIdle(1500);
        break;
      case S.WALK:
      case S.RETURN:
      case S.FETCH:
      case S.CARRY:
        this.stepToward(dt);
        break;
      case S.DRAG: {
        const k = 1 - Math.exp(-dt * 22);
        this.x += (this.dragTarget.x - this.x) * k;
        this.y += (this.dragTarget.y - this.y) * k;
        break;
      }
      default:
        break;
    }

    this.sync();
  }

  /** Push logical position to the sprite + shadow (and carried item), and sort by depth. */
  sync() {
    const dragging = this.state === S.DRAG;
    const spriteY = this.y - this.hop;
    this.sprite.setPosition(Math.round(this.x), Math.round(spriteY));
    this.sprite.setDepth(dragging ? 1000 : this.y);

    let groundY = this.y;
    if (dragging) groundY = Math.max(this.y, CAT.bounds.minY);
    else if (this.state === S.FALL) groundY = this.landY;

    const height = Math.max(0, groundY - spriteY);
    this.shadow
      .setPosition(Math.round(this.x), Math.round(groundY) - 1)
      .setScale(Phaser.Math.Clamp(1 - height / 90, 0.45, 1))
      .setAlpha(Phaser.Math.Clamp(1 - height / 130, 0.35, 1))
      .setDepth(dragging ? 999 : groundY - 0.5);

    if (this.ghost && CARRYING.includes(this.state)) {
      const p = this.carryPos();
      const bob = this.state === S.CARRY ? Math.round(Math.sin(this.scene.time.now * 0.012)) : 0;
      this.ghost.setPosition(p.x, p.y + bob);
    }
  }
}
