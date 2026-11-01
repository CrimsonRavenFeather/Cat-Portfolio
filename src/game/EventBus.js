import Phaser from 'phaser';

/**
 * The ONLY bridge between the Phaser game and the React UI.
 *
 *   game  -> React : emit GameEvents.* (hover, cat speech, "item delivered" ...)
 *   React -> game  : emit GameEvents.UI_* (ask for an item, highlight, panel state)
 *
 * Neither side imports the other. Positions sent to React are SCREEN pixels
 * (sx, sy) relative to the viewport, already converted by the scene's camera.
 */
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  // game -> UI
  SCENE_READY: 'scene:ready',
  OBJECT_HOVER: 'object:hover', // { id, label, item, sx, sy }
  OBJECT_OUT: 'object:out', //     { id }
  OBJECT_OPEN: 'object:open', //   { id }  the cat has delivered the item -> show its panel
  CAT_CLICK: 'cat:click', //       { sx, sy }
  CAT_SAY: 'cat:say', //           { text, sx, sy }
  CAT_STATE: 'cat:state', //       { state }

  // UI -> game
  UI_OPEN: 'ui:open', //           id   (e.g. from the screen-reader menu): cat fetches it
  UI_HIGHLIGHT: 'ui:highlight', // id | null
  UI_PANEL: 'ui:panel', //         { open: boolean }  (closing sends the item back)
};
