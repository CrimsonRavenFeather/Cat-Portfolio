/**
 * Where things sit in the room. All numbers are in game pixels
 * (the room is 320 x 180; the canvas is zoomed to fit the screen).
 */
export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

/**
 * Clickable objects. `id` must match a key in src/components/panels/index.js.
 *
 *  x, y        position of the object's origin point
 *  originX/Y   which part of the image sits on x,y (0..1). 0.5/1 = bottom-centre
 *  fetchFrom   floor spot where the cat stands to grab it (must be inside the
 *              cat's walkable floor, see config/cat.js bounds)
 *  depth       draw order. Floor items use their y so the cat can walk in front/behind
 *  scale       optional, handy if you swap in a higher-resolution image
 *  hitPadding  extra clickable pixels around the image (nice for tiny objects)
 */
export const OBJECTS = [
  {
    id: 'projects',
    item: 'Laptop',
    label: 'My Projects',
    textureKey: 'laptop',
    x: 236,
    y: 94,
    originX: 0.5,
    originY: 1,
    depth: 20,
    hitPadding: 3,
    fetchFrom: { x: 236, y: 136 },
  },
  {
    id: 'resume',
    item: 'Resume folder',
    label: 'My Resume',
    textureKey: 'folder',
    x: 297,
    y: 94,
    originX: 0.5,
    originY: 1,
    depth: 20,
    hitPadding: 3,
    fetchFrom: { x: 288, y: 134 },
  },
  {
    id: 'experience',
    item: 'Bookshelf',
    label: 'Work Experience',
    textureKey: 'bookshelf',
    x: 175,
    y: 112,
    originX: 0.5,
    originY: 1,
    depth: 20,
    hitPadding: 0,
    fetchFrom: { x: 175, y: 132 },
  },
  {
    id: 'about',
    item: 'Photo frame',
    label: 'About Me',
    textureKey: 'frame',
    x: 51,
    y: 44,
    originX: 0.5,
    originY: 0.5,
    depth: 20,
    hitPadding: 3,
    fetchFrom: { x: 70, y: 134 },
  },
  {
    id: 'contact',
    item: 'Phone',
    label: 'Contact',
    textureKey: 'phone',
    x: 270,
    y: 94,
    originX: 0.5,
    originY: 1,
    depth: 20,
    hitPadding: 4,
    fetchFrom: { x: 262, y: 136 },
  },

  // ---- games (floor items) ----
  {
    id: 'tictactoe',
    item: 'Board game',
    label: 'Tic Tac Toe',
    textureKey: 'tictactoe',
    x: 54,
    y: 164,
    originX: 0.5,
    originY: 1,
    depth: 164,
    hitPadding: 3,
    fetchFrom: { x: 76, y: 166 },
  },
  {
    id: 'minesweeper',
    item: 'Retro console',
    label: 'Minesweeper',
    textureKey: 'minesweeper',
    x: 268,
    y: 162,
    originX: 0.5,
    originY: 1,
    depth: 162,
    hitPadding: 3,
    fetchFrom: { x: 250, y: 164 },
  },
];
