import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus.js';
import { GAME_HEIGHT, GAME_WIDTH, OBJECTS } from '../config/layout.js';
import Cat from '../entities/Cat.js';
import InteractiveObject from '../entities/InteractiveObject.js';

/**
 * The bedroom: background, clickable objects and the cat.
 * The canvas fills the whole window; the 320x180 room is zoomed to fit it.
 */
export default class RoomScene extends Phaser.Scene {
  constructor() {
    super('Room');
  }

  create() {
    this.add
      .image(0, 0, 'room')
      .setOrigin(0, 0)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setDepth(0);

    this.objects = OBJECTS.map((def) => new InteractiveObject(this, def));
    this.cat = new Cat(this);

    this.input.dragDistanceThreshold = 3;

    this.layout();
    this.scale.on('resize', this.layout, this);

    // an object was clicked in the room, or asked for from the accessible menu
    this.events.on('object:click', this.requestOpen, this);
    EventBus.on(GameEvents.UI_OPEN, this.requestOpen, this);
    EventBus.on(GameEvents.UI_HIGHLIGHT, this.onHighlight, this);
    EventBus.on(GameEvents.UI_PANEL, this.onPanel, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    EventBus.emit(GameEvents.SCENE_READY, { scene: this });
  }

  update(time, delta) {
    this.cat.update(time, delta);
  }

  /** Fit the whole room inside the window, centred. */
  layout() {
    const { width, height } = this.scale.gameSize;
    const cam = this.cameras.main;
    cam.setSize(width, height);
    cam.setZoom(Math.min(width / GAME_WIDTH, height / GAME_HEIGHT));
    cam.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }

  /** Room coordinates -> screen pixels (what the React overlay needs). */
  toScreen(x, y) {
    const cam = this.cameras.main;
    return { sx: (x - cam.worldView.x) * cam.zoom, sy: (y - cam.worldView.y) * cam.zoom };
  }

  isCatBusy() {
    return this.cat ? this.cat.isBusy() : false;
  }

  /** Send the cat to fetch an object; the UI opens when it presents it. */
  requestOpen(id) {
    if (this.cat.isBusy()) return;
    const obj = this.objects.find((o) => o.id === id);
    if (!obj) return;
    this.objects.forEach((o) => o.reset());
    EventBus.emit(GameEvents.OBJECT_OUT, { id });
    this.cat.fetch(obj, () => EventBus.emit(GameEvents.OBJECT_OPEN, { id }));
  }

  onHighlight(id) {
    this.objects.forEach((o) => o.setHighlight(o.id === id));
  }

  /** While a panel is open the room ignores the pointer; closing sends the item back. */
  onPanel({ open }) {
    this.input.enabled = !open;
    if (open) {
      this.objects.forEach((o) => o.reset());
    } else {
      this.cat.returnItem();
    }
  }

  cleanup() {
    this.scale.off('resize', this.layout, this);
    this.events.off('object:click', this.requestOpen, this);
    EventBus.off(GameEvents.UI_OPEN, this.requestOpen, this);
    EventBus.off(GameEvents.UI_HIGHLIGHT, this.onHighlight, this);
    EventBus.off(GameEvents.UI_PANEL, this.onPanel, this);
  }
}
