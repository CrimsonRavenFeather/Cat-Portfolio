/**
 * Tiny hand-drawn pixel icons rendered as crisp SVG. Each map is rows of
 * characters: '.' = empty, any other letter = a colour from the palette.
 * Edit a map to redraw an icon, or swap <PixelIcon> for an <img> of your own art.
 */
const ICONS = {
  x: {
    map: ['XX...XX', 'XXX.XXX', '.XXXXX.', '..XXX..', '.XXXXX.', 'XXX.XXX', 'XX...XX'],
    palette: { X: '#2f5f9a' },
  },
  paw: {
    map: [
      '.XX.X.XX.',
      'XXXX.XXXX',
      '.XX...XX.',
      '...XXX...',
      '..XXXXX..',
      '.XXXXXXX.',
      '.XXXXXXX.',
      '..XX.XX..',
    ],
    palette: { X: '#ee9340' },
  },
  flag: {
    map: ['.RRRR...', '.RRRRR..', '.RRRR...', '.K......', '.K......', 'KKKK....'],
    palette: { R: '#c8554a', K: '#3b2216' },
  },
  note: {
    map: ['..XXXXXX', '..X....X', '..X....X', '..X....X', 'XXX..XXX', 'XXX..XXX'],
    palette: { X: '#3b2216' },
  },
  speaker: {
    map: ['...X....', '..XX..X.', 'XXXX...X', 'XXXX.X.X', 'XXXX.X.X', 'XXXX...X', '..XX..X.', '...X....'],
    palette: { X: '#3b2216' },
  },
  mine: {
    map: [
      '....K....',
      '.K.KKK.K.',
      '..KKKKK..',
      '.KKWKKKK.',
      'KKKWKKKKK',
      '.KKKKKKK.',
      '..KKKKK..',
      '.K.KKK.K.',
      '....K....',
    ],
    palette: { K: '#2a1d2e', W: '#ffffff' },
  },
};

export default function PixelIcon({ name, size, label }) {
  const { map, palette } = ICONS[name];
  const rows = map.length;
  const cols = map[0].length;
  const rects = [];
  map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[ch]} />);
    });
  });

  return (
    <svg
      className="pixel-icon"
      width={size ? cols * size : undefined}
      height={size ? rows * size : undefined}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rects}
    </svg>
  );
}
