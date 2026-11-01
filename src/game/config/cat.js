/**
 * Cat behaviour tuning. Tweak freely - nothing else needs to change.
 */
export const CAT = {
  textureKey: 'cat',
  frameSize: 32,
  /** y (in the frame) where the paws touch the ground; used as the sprite origin */
  feetY: 28,

  /** The cat's "place": its bed. It returns here after being dragged around. */
  home: { x: 156, y: 157 },

  /** Where the cat shows you the item it fetched */
  presentSpot: { x: 156, y: 157 },

  /** Area the cat wanders in on its own (floor / rug) */
  bounds: { minX: 44, maxX: 268, minY: 130, maxY: 170 },

  /** Where a dropped cat is allowed to land before it walks home */
  dropBounds: { minX: 14, maxX: 306, minY: 124, maxY: 174 },

  /** Held by the scruff: how far below the pointer the feet dangle */
  dragHoldOffsetY: 22,

  walkSpeed: 30, // px / second while wandering
  returnSpeed: 58, // px / second when heading back to its bed
  fetchSpeed: 70, // px / second when running to grab something
  carrySpeed: 50, // px / second when carrying it back

  idleDelay: [2500, 6000], // ms between decisions
  sleepDuration: [9000, 16000], // ms
  chances: { wander: 0.4, sleep: 0.3 }, // the rest: keep sitting
};

export const CAT_STATES = {
  IDLE: 'idle',
  WALK: 'walking',
  SLEEP: 'sleeping',
  REACT: 'reacting',
  DRAG: 'dragged',
  FALL: 'falling',
  RETURN: 'returning',
  // fetching an item
  FETCH: 'fetching',
  GRAB: 'grabbing',
  CARRY: 'carrying',
  PRESENT: 'presenting',
  HOLD: 'holding',
};
