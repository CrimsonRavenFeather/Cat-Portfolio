import { ASSET_BASE, CAT_ANIMS, CAT_SHEET } from '../game/config/assets.js';

/**
 * The cat drawn in the HTML UI, using the same sprite sheet and animation rows
 * as the game (idle / walk / sleep / react / drag - see config/assets.js).
 * Pure CSS: a stepped background-position animation, no canvas needed.
 */
export default function CatAvatar({ anim = 'idle', scale = 3, flip = false, label }) {
  const a = CAT_ANIMS[anim] ?? CAT_ANIMS.idle;
  const fw = CAT_SHEET.frameWidth * scale;
  const fh = CAT_SHEET.frameHeight * scale;

  const style = {
    width: fw,
    height: fh,
    backgroundImage: `url(${ASSET_BASE}${CAT_SHEET.file})`,
    backgroundSize: `${CAT_SHEET.columns * fw}px ${CAT_SHEET.rows * fh}px`,
    backgroundPositionX: 0,
    backgroundPositionY: -a.row * fh,
    '--end': `${-a.frames * fw}px`,
    animation: `cat-frames ${a.frames / a.frameRate}s steps(${a.frames}) infinite`,
    transform: flip ? 'scaleX(-1)' : undefined,
  };

  return (
    <div
      key={anim}
      className="cat-avatar pixelated"
      style={style}
      role="img"
      aria-label={label ?? `Cat, ${anim}`}
    />
  );
}
