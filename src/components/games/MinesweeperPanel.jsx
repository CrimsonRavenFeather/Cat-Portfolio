import { useEffect, useRef, useState } from 'react';
import { audio } from '../../audio/audio.js';
import { gameLines } from '../../content/portfolio.js';
import {
  LEVELS,
  createGame,
  flagsUsed,
  hintCell,
  reveal,
  toggleFlag,
} from '../../games/minesweeper.js';
import CatSays from '../CatSays.jsx';
import PixelIcon from '../PixelIcon.jsx';

const L = gameLines.minesweeper;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const MAX_HINTS = 3;
const LONG_PRESS_MS = 420;

/**
 * Minesweeper with the cat as your partner: it reacts to your moves and can
 * sniff out a safe square (3 per game). The rules live in src/games/minesweeper.js.
 *
 * Mouse: click = dig, right-click = flag.   Touch: tap = dig, long-press = flag
 * (or switch the Dig/Flag toggle).
 */
export default function MinesweeperPanel() {
  const [level, setLevel] = useState('easy');
  const [game, setGame] = useState(() => createGame('easy'));
  const [mode, setMode] = useState('dig');
  const [hints, setHints] = useState(MAX_HINTS);
  const [seconds, setSeconds] = useState(0);
  const [sniff, setSniff] = useState(-1);
  const [cat, setCat] = useState({ anim: 'idle', line: L.start });

  const timers = useRef([]);
  const press = useRef({ timer: null, fired: false });
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(press.current.timer);
    },
    [],
  );

  // clock
  useEffect(() => {
    if (game.status !== 'playing') return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [game.status]);

  const over = game.status === 'won' || game.status === 'lost';

  const start = (lvl = level) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setGame(createGame(lvl));
    setSeconds(0);
    setHints(MAX_HINTS);
    setSniff(-1);
    setMode('dig');
    setCat({ anim: 'idle', line: L.start });
  };

  const dig = (i) => {
    if (over) return;
    const next = reveal(game, i);
    if (next === game) return;
    setGame(next);
    setSniff(-1);
    if (next.status === 'lost') {
      audio.play('boom');
      setTimeout(() => audio.play('meowSad'), 700);
      setCat({ anim: 'drag', line: L.boom });
    } else if (next.status === 'won') {
      audio.play('win');
      setTimeout(() => audio.play('meowHappy'), 700);
      setCat({ anim: 'react', line: L.win });
    } else {
      audio.play('dig');
      if (Math.random() < 0.35) setCat({ anim: 'idle', line: pick(L.safe) });
    }
  };

  const flag = (i) => {
    if (over) return;
    const next = toggleFlag(game, i);
    if (next === game) return;
    setGame(next);
    audio.play('flag');
    if (next.cells[i].flagged && Math.random() < 0.5) setCat({ anim: 'react', line: pick(L.flag) });
  };

  const askCat = () => {
    if (over) return;
    if (game.status === 'ready') return setCat({ anim: 'idle', line: L.notYet });
    if (hints <= 0) return setCat({ anim: 'sleep', line: L.noHint });

    const i = hintCell(game);
    if (i < 0) return setCat({ anim: 'idle', line: L.noHint });

    setHints((h) => h - 1);
    setCat({ anim: 'walk', line: L.sniff });
    audio.play('sniff');
    later(() => {
      audio.play('found');
      setSniff(i);
      setCat({ anim: 'react', line: L.found });
    }, 1000);
    later(() => setSniff((s) => (s === i ? -1 : s)), 4500);
  };

  // --- pointer handling: click / right-click / long-press
  const onCellClick = (i) => {
    if (press.current.fired) {
      press.current.fired = false;
      return;
    }
    if (mode === 'flag') flag(i);
    else dig(i);
  };
  const onPointerDown = (e, i) => {
    press.current.fired = false;
    if (e.pointerType === 'mouse') return;
    clearTimeout(press.current.timer);
    press.current.timer = setTimeout(() => {
      press.current.fired = true;
      flag(i);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => clearTimeout(press.current.timer);

  const minesLeft = game.mines - flagsUsed(game);

  return (
    <div className="game">
      <CatSays line={cat.line} anim={cat.anim}>
        <button className="btn btn-small" onClick={askCat} disabled={over}>
          Ask Mochi to sniff ({hints})
        </button>
      </CatSays>

      <div className="ms-status" aria-live="off">
        <span>
          <PixelIcon name="mine" size={2} label="Mines left" /> {String(Math.max(minesLeft, 0)).padStart(2, '0')}
        </span>
        <span>Time {String(Math.min(seconds, 999)).padStart(3, '0')}</span>
      </div>

      <div
        className="ms"
        style={{ '--cols': game.cols }}
        role="grid"
        aria-label="Minesweeper board"
        onContextMenu={(e) => e.preventDefault()}
      >
        {game.cells.map((c, i) => {
          const classes = ['ms-cell'];
          if (c.revealed) classes.push('open');
          if (i === game.exploded) classes.push('boom');
          if (i === sniff) classes.push('sniff');
          if (c.revealed && !c.mine && c.adj) classes.push(`n${c.adj}`);

          let content = null;
          if (c.flagged) content = <PixelIcon name="flag" />;
          else if (c.revealed && c.mine) content = <PixelIcon name="mine" />;
          else if (c.revealed && c.adj) content = c.adj;

          return (
            <button
              key={i}
              role="gridcell"
              className={classes.join(' ')}
              onClick={() => onCellClick(i)}
              onContextMenu={(e) => {
                e.preventDefault();
                flag(i);
              }}
              onPointerDown={(e) => onPointerDown(e, i)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onPointerCancel={cancelPress}
              aria-label={`Row ${Math.floor(i / game.cols) + 1}, column ${(i % game.cols) + 1}${
                c.flagged ? ', flagged' : c.revealed ? (c.mine ? ', mine' : `, ${c.adj} nearby`) : ', hidden'
              }`}
            >
              {content}
            </button>
          );
        })}
      </div>

      <div className="row game-controls">
        <div className="segmented" role="group" aria-label="Tool">
          <button
            className={`btn btn-small${mode === 'dig' ? ' is-on' : ''}`}
            aria-pressed={mode === 'dig'}
            onClick={() => setMode('dig')}
          >
            Dig
          </button>
          <button
            className={`btn btn-small${mode === 'flag' ? ' is-on' : ''}`}
            aria-pressed={mode === 'flag'}
            onClick={() => setMode('flag')}
          >
            Flag
          </button>
        </div>
        <div className="segmented" role="group" aria-label="Difficulty">
          {Object.entries(LEVELS).map(([key, { label }]) => (
            <button
              key={key}
              className={`btn btn-small${level === key ? ' is-on' : ''}`}
              aria-pressed={level === key}
              onClick={() => {
                setLevel(key);
                start(key);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => start()}>
          {over ? 'Play again' : 'New game'}
        </button>
      </div>
    </div>
  );
}
