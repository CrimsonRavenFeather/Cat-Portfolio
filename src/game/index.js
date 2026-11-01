import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene.js';
import RoomScene from './scenes/RoomScene.js';

export { EventBus, GameEvents } from './EventBus.js';

/**
 * Entry point used by React: create the game inside `parent`.
 * The canvas always fills `parent` (RESIZE mode); RoomScene zooms the room to fit.
 */
export function createGame(parent) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: '100%',
    height: '100%',
    backgroundColor: '#2a1d2e',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    banner: false,
    audio: { noAudio: true }, // sound is handled by src/audio, not Phaser
    scale: { mode: Phaser.Scale.RESIZE },
    input: { activePointers: 2 },
    scene: [PreloadScene, RoomScene],
  });
}

export function destroyGame(game) {
  if (game) game.destroy(true);
}
