/**
 * Minesweeper rules. Pure functions - no React, no DOM.
 * Every function returns a NEW state object, so it is safe to use with React state.
 *
 * state = { level, rows, cols, mines, cells, status, exploded }
 *   status: 'ready' (no mines placed yet) | 'playing' | 'won' | 'lost'
 *   cell:   { mine, adj, revealed, flagged }
 */
export const LEVELS = {
  easy: { label: 'Easy', rows: 7, cols: 7, mines: 6 },
  normal: { label: 'Normal', rows: 9, cols: 9, mines: 10 },
  hard: { label: 'Hard', rows: 11, cols: 9, mines: 18 },
};

export function neighbours(i, rows, cols) {
  const r = Math.floor(i / cols);
  const c = i % cols;
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
    }
  }
  return out;
}

export function createGame(level = 'normal') {
  const { rows, cols, mines } = LEVELS[level];
  return {
    level,
    rows,
    cols,
    mines,
    status: 'ready',
    exploded: -1,
    cells: Array.from({ length: rows * cols }, () => ({
      mine: false,
      adj: 0,
      revealed: false,
      flagged: false,
    })),
  };
}

/** Mines are placed on the first click, never on or next to it. */
function placeMines(state, safe, rng) {
  const { rows, cols, mines } = state;
  const banned = new Set([safe, ...neighbours(safe, rows, cols)]);
  let pool = state.cells.map((_, i) => i).filter((i) => !banned.has(i));
  if (pool.length < mines) pool = state.cells.map((_, i) => i).filter((i) => i !== safe);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const mineSet = new Set(pool.slice(0, mines));

  const cells = state.cells.map((c, i) => ({ ...c, mine: mineSet.has(i) }));
  cells.forEach((c, i) => {
    c.adj = neighbours(i, rows, cols).filter((n) => cells[n].mine).length;
  });
  return { ...state, cells, status: 'playing' };
}

export function reveal(state, index, rng = Math.random) {
  if (state.status === 'won' || state.status === 'lost') return state;
  const target = state.cells[index];
  if (!target || target.revealed || target.flagged) return state;

  const base = state.status === 'ready' ? placeMines(state, index, rng) : state;
  const cells = base.cells.map((c) => ({ ...c }));

  if (cells[index].mine) {
    cells.forEach((c) => {
      if (c.mine) c.revealed = true;
    });
    return { ...base, cells, status: 'lost', exploded: index };
  }

  // flood-fill through empty (0) cells
  const queue = [index];
  while (queue.length) {
    const i = queue.pop();
    const c = cells[i];
    if (c.revealed || c.flagged) continue;
    c.revealed = true;
    if (c.adj === 0) neighbours(i, base.rows, base.cols).forEach((n) => queue.push(n));
  }

  const won = cells.every((c) => c.mine || c.revealed);
  if (won) cells.forEach((c) => {
    if (c.mine) c.flagged = true;
  });
  return { ...base, cells, status: won ? 'won' : 'playing' };
}

export function toggleFlag(state, index) {
  if (state.status === 'won' || state.status === 'lost') return state;
  const c = state.cells[index];
  if (!c || c.revealed) return state;
  const cells = state.cells.map((x, i) => (i === index ? { ...x, flagged: !x.flagged } : x));
  return { ...state, cells };
}

export const flagsUsed = (state) => state.cells.filter((c) => c.flagged).length;

/**
 * The cat "sniffs out" a safe cell. Prefers cells touching an opened cell so the
 * hint is actually useful. Returns -1 if there is nothing to suggest.
 */
export function hintCell(state, rng = Math.random) {
  if (state.status !== 'playing') return -1;
  const safe = state.cells.flatMap((c, i) => (!c.mine && !c.revealed ? [i] : []));
  if (!safe.length) return -1;
  const near = safe.filter((i) =>
    neighbours(i, state.rows, state.cols).some((n) => state.cells[n].revealed),
  );
  const pool = near.length ? near : safe;
  return pool[Math.floor(rng() * pool.length)];
}
