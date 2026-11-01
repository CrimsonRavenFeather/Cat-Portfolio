import { useEffect, useRef, useState } from 'react';
import { audio } from '../../audio/audio.js';
import { gameLines } from '../../content/portfolio.js';
import { LEVELS, chooseMove, emptyBoard, isFull, winnerOf } from '../../games/ticTacToe.js';
import CatSays from '../CatSays.jsx';
import PixelIcon from '../PixelIcon.jsx';

const L = gameLines.tictactoe;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

/**
 * You (X) play against the cat (paw prints). The cat thinks, answers with a
 * paw, and reacts with its sprite animations - the game logic itself lives in
 * src/games/ticTacToe.js.
 */
export default function TicTacToePanel() {
  const [board, setBoard] = useState(emptyBoard);
  const [level, setLevel] = useState('normal');
  const [thinking, setThinking] = useState(false);
  const [cat, setCat] = useState({ anim: 'idle', line: L.start });
  const [score, setScore] = useState({ you: 0, cat: 0, draw: 0 });

  const levelRef = useRef(level);
  levelRef.current = level;
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const result = winnerOf(board);
  const over = Boolean(result) || isFull(board);

  const finish = (who) => {
    setScore((s) => ({ ...s, [who]: s[who] + 1 }));
    if (who === 'you') {
      audio.play('win');
      setTimeout(() => audio.play('meowSad'), 650);
      setCat({ anim: 'drag', line: L.lose });
    } else if (who === 'cat') {
      audio.play('lose');
      setTimeout(() => audio.play('meowHappy'), 800);
      setCat({ anim: 'react', line: L.win });
    } else {
      audio.play('draw');
      setCat({ anim: 'sleep', line: L.draw });
    }
  };

  const play = (i) => {
    if (over || thinking || board[i]) return;

    const next = board.slice();
    next[i] = 'X';
    setBoard(next);
    audio.play('place');

    const r = winnerOf(next);
    if (r) return finish('you');
    if (isFull(next)) return finish('draw');

    setThinking(true);
    setCat({ anim: 'idle', line: pick(L.think) });
    timer.current = setTimeout(() => {
      const move = chooseMove(next, 'O', levelRef.current);
      const after = next.slice();
      after[move] = 'O';
      setBoard(after);
      audio.play('paw');
      setThinking(false);

      if (winnerOf(after)) finish('cat');
      else if (isFull(after)) finish('draw');
      else setCat({ anim: 'react', line: pick(L.move) });
    }, 650 + Math.random() * 450);
  };

  const reset = () => {
    clearTimeout(timer.current);
    setBoard(emptyBoard());
    setThinking(false);
    setCat({ anim: 'idle', line: L.start });
  };

  const winLine = result?.line ?? [];

  return (
    <div className="game">
      <CatSays line={cat.line} anim={cat.anim}>
        <p className="score" aria-label="Score">
          You {score.you} - Mochi {score.cat} - Draws {score.draw}
        </p>
      </CatSays>

      <div className="ttt" role="grid" aria-label="Tic Tac Toe board">
        {board.map((v, i) => (
          <button
            key={i}
            role="gridcell"
            className={`ttt-cell${winLine.includes(i) ? ' win' : ''}`}
            onClick={() => play(i)}
            disabled={over || thinking || Boolean(v)}
            aria-label={`Cell ${i + 1}: ${v === 'X' ? 'you' : v === 'O' ? 'the cat' : 'empty'}`}
          >
            {v === 'X' && <PixelIcon name="x" />}
            {v === 'O' && <PixelIcon name="paw" />}
          </button>
        ))}
      </div>

      <div className="row game-controls">
        <div className="segmented" role="group" aria-label="Cat skill">
          {Object.entries(LEVELS).map(([key, { label }]) => (
            <button
              key={key}
              className={`btn btn-small${level === key ? ' is-on' : ''}`}
              aria-pressed={level === key}
              onClick={() => setLevel(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={reset}>
          {over ? 'Play again' : 'New game'}
        </button>
      </div>
    </div>
  );
}
