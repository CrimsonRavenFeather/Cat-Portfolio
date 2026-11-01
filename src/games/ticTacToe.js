/**
 * Tic Tac Toe rules + the cat's brain. Pure functions - no React, no DOM.
 *
 * Board: array of 9 cells, each null | 'X' | 'O'. You are X, the cat is O.
 */
export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/** `mistakes` = chance the cat ignores its best move and plays randomly. */
export const LEVELS = {
  sleepy: { label: 'Sleepy', mistakes: 1 },
  normal: { label: 'Normal', mistakes: 0.35 },
  genius: { label: 'Genius', mistakes: 0 },
};

export const emptyBoard = () => Array(9).fill(null);

export function winnerOf(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

export const isFull = (board) => board.every(Boolean);

const emptyCells = (board) => board.flatMap((v, i) => (v ? [] : [i]));

function minimax(board, turn, cat, depth) {
  const win = winnerOf(board);
  if (win) return win.player === cat ? 10 - depth : depth - 10;
  if (isFull(board)) return 0;

  const other = cat === 'O' ? 'X' : 'O';
  const scores = emptyCells(board).map((i) => {
    const next = board.slice();
    next[i] = turn;
    return minimax(next, turn === cat ? other : cat, cat, depth + 1);
  });
  return turn === cat ? Math.max(...scores) : Math.min(...scores);
}

/** Picks the cat's move. `rng` is injectable so tests are deterministic. */
export function chooseMove(board, cat = 'O', level = 'normal', rng = Math.random) {
  const free = emptyCells(board);
  if (free.length === 0) return -1;
  const other = cat === 'O' ? 'X' : 'O';

  if (rng() < (LEVELS[level]?.mistakes ?? 0)) {
    return free[Math.floor(rng() * free.length)];
  }

  let best = -Infinity;
  let bestMoves = [];
  for (const i of free) {
    const next = board.slice();
    next[i] = cat;
    const score = minimax(next, other, cat, 1);
    if (score > best) {
      best = score;
      bestMoves = [i];
    } else if (score === best) {
      bestMoves.push(i);
    }
  }
  return bestMoves[Math.floor(rng() * bestMoves.length)];
}
