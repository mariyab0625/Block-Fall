import { useReducer, useEffect, useCallback } from 'react';
import { LEVEL_CONFIG } from '../utils/levelConfig';
import { getRandomShape } from '../utils/blockShapes';
import {
  createGrid, canMove, lockPiece, countPieceCells,
  findCompleteRows, findCompleteCols,
  removeRows, rotateCW, getGhostY, hardDropY, expandGrid,
} from '../utils/gridHelpers';

// ─── Scoring constants ────────────────────────────────────────────────────────
const PTS_PER_BLOCK = 1;   // +1 for every cell placed
const PTS_PER_ROW   = 10;  // +10 for every row cleared

// ─── State factory ────────────────────────────────────────────────────────────
function makeInitialState(level = 1) {
  const cfg = LEVEL_CONFIG[level];
  const grid = createGrid(cfg.rows, cfg.cols);
  const firstPiece = spawnPiece(cfg.blockTypes, cfg.cols);
  const nextPiece  = spawnPiece(cfg.blockTypes, cfg.cols);
  return {
    grid,
    cols: cfg.cols,
    rows: cfg.rows,
    activePiece: firstPiece,
    nextPiece,
    score: 0,
    level,
    rowsCleared: 0,        // total rows cleared (for leaderboard / display)
    rowsThisLevel: 0,      // rows cleared this level (for win condition)
    // Floating score events consumed by the UI for animations
    // Each: { id, pts, type: 'block'|'row' }
    scoreEvents: [],
    phase: 'PLAYING',      // PLAYING | PAUSED | ANIMATING | LEVEL_WIN | GAME_OVER
    clearedRows: [],       // row indices currently flashing
    fallInterval: cfg.fallMs,
    isSoftDropping: false,
    gameOverReason: null,  // 'column_full' | 'spawn_blocked'
  };
}

function spawnPiece(blockTypes, cols) {
  const shape = getRandomShape(blockTypes);
  return {
    shape: shape.matrix,
    color: shape.color,
    type:  shape.type,
    x: Math.floor((cols - shape.matrix[0].length) / 2),
    y: 0,
  };
}

let _evId = 0;
function evId() { return ++_evId; }

// ─── Reducer ─────────────────────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    case 'TICK_FALL': {
      if (state.phase !== 'PLAYING') return state;
      if (canMove(state.grid, state.activePiece, 0, 1, state.rows, state.cols)) {
        return { ...state, activePiece: { ...state.activePiece, y: state.activePiece.y + 1 } };
      }
      return lockAndProcess(state);
    }

    case 'MOVE_LEFT': {
      if (state.phase !== 'PLAYING') return state;
      if (canMove(state.grid, state.activePiece, -1, 0, state.rows, state.cols))
        return { ...state, activePiece: { ...state.activePiece, x: state.activePiece.x - 1 } };
      return state;
    }

    case 'MOVE_RIGHT': {
      if (state.phase !== 'PLAYING') return state;
      if (canMove(state.grid, state.activePiece, 1, 0, state.rows, state.cols))
        return { ...state, activePiece: { ...state.activePiece, x: state.activePiece.x + 1 } };
      return state;
    }

    case 'ROTATE': {
      if (state.phase !== 'PLAYING') return state;
      const rotated = rotateCW(state.activePiece.shape);
      for (const kick of [0, -1, 1, -2, 2]) {
        const test = { ...state.activePiece, shape: rotated, x: state.activePiece.x + kick };
        if (canMove(state.grid, test, 0, 0, state.rows, state.cols))
          return { ...state, activePiece: test };
      }
      return state;
    }

    case 'HARD_DROP': {
      if (state.phase !== 'PLAYING') return state;
      const dropY = hardDropY(state.grid, state.activePiece, state.rows, state.cols);
      return lockAndProcess({ ...state, activePiece: { ...state.activePiece, y: dropY } });
    }

    case 'SOFT_DROP_START': return { ...state, isSoftDropping: true  };
    case 'SOFT_DROP_END':   return { ...state, isSoftDropping: false };

    // Remove the flashed rows, update score, check win, spawn next
    case 'FINISH_CLEAR': {
      const clearedCount = state.clearedRows.length;
      const rowPoints    = clearedCount * PTS_PER_ROW;

      // Build score events for each cleared row (+10 animation)
      const rowEvents = Array.from({ length: clearedCount }, () => ({
        id: evId(), pts: PTS_PER_ROW, type: 'row',
      }));

      const cleanGrid       = removeRows(state.grid, state.clearedRows);
      const newTotal        = state.rowsCleared + clearedCount;
      const newThisLevel    = state.rowsThisLevel + clearedCount;
      const cfg             = LEVEL_CONFIG[state.level];
      const wonLevel        = cfg.linesToWin !== null && newThisLevel >= cfg.linesToWin;

      if (wonLevel) {
        return {
          ...state,
          grid: cleanGrid,
          score: state.score + rowPoints,
          rowsCleared: newTotal,
          rowsThisLevel: newThisLevel,
          clearedRows: [],
          scoreEvents: [...state.scoreEvents, ...rowEvents],
          phase: 'LEVEL_WIN',
        };
      }

      return spawnNext(
        { ...state, scoreEvents: [...state.scoreEvents, ...rowEvents] },
        cleanGrid, rowPoints, newTotal, newThisLevel
      );
    }

    case 'NEXT_LEVEL': {
      const nextLevel = state.level + 1;
      if (nextLevel > 10) return { ...state, phase: 'GAME_OVER', gameOverReason: 'all_levels_done' };
      const nextCfg   = LEVEL_CONFIG[nextLevel];
      const expanded  = expandGrid(state.grid, state.cols, state.rows, nextCfg.cols, nextCfg.rows);
      return {
        ...makeInitialState(nextLevel),
        grid: expanded,
        score: state.score,
        rowsCleared: state.rowsCleared,
      };
    }

    case 'DISMISS_EVENT': {
      return { ...state, scoreEvents: state.scoreEvents.filter(e => e.id !== action.id) };
    }

    case 'PAUSE':
      return { ...state, phase: state.phase === 'PAUSED' ? 'PLAYING' : 'PAUSED' };

    case 'RESTART':
      return makeInitialState(action.level || 1);

    default:
      return state;
  }
}

// ─── Lock piece + check rows/cols ─────────────────────────────────────────────
function lockAndProcess(state) {
  const newGrid  = lockPiece(state.grid, state.activePiece);
  const cellsPts = countPieceCells(state.activePiece) * PTS_PER_BLOCK;

  // +1 per block event
  const blockEvent = { id: evId(), pts: cellsPts, type: 'block' };

  // Check for full columns → GAME OVER
  const fullCols = findCompleteCols(newGrid, state.rows, state.cols);
  if (fullCols.length) {
    return {
      ...state,
      grid: newGrid,
      score: state.score + cellsPts,
      scoreEvents: [...state.scoreEvents, blockEvent],
      phase: 'GAME_OVER',
      gameOverReason: 'column_full',
    };
  }

  // Check for full rows → animate then clear
  const fullRows = findCompleteRows(newGrid, state.cols);
  if (fullRows.length) {
    return {
      ...state,
      grid: newGrid,
      score: state.score + cellsPts,
      scoreEvents: [...state.scoreEvents, blockEvent],
      phase: 'ANIMATING',
      clearedRows: fullRows,
    };
  }

  // Nothing special — spawn next
  return spawnNext(
    { ...state, scoreEvents: [...state.scoreEvents, blockEvent] },
    newGrid, cellsPts, state.rowsCleared, state.rowsThisLevel
  );
}

function spawnNext(state, grid, bonusPoints, newTotal, newThisLevel) {
  const cfg = LEVEL_CONFIG[state.level];
  const newActive = state.nextPiece
    ? { ...state.nextPiece, x: Math.floor((state.cols - state.nextPiece.shape[0].length) / 2), y: 0 }
    : spawnPiece(cfg.blockTypes, state.cols);

  if (!canMove(grid, newActive, 0, 0, state.rows, state.cols)) {
    return {
      ...state, grid,
      score: state.score + bonusPoints,
      rowsCleared: newTotal,
      clearedRows: [],
      phase: 'GAME_OVER',
      gameOverReason: 'spawn_blocked',
    };
  }

  return {
    ...state,
    grid,
    activePiece: newActive,
    nextPiece: spawnPiece(cfg.blockTypes, state.cols),
    score: state.score + bonusPoints,
    rowsCleared: newTotal,
    rowsThisLevel: newThisLevel,
    clearedRows: [],
    phase: 'PLAYING',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGameEngine(startLevel = 1) {
  const [state, dispatch] = useReducer(gameReducer, startLevel, makeInitialState);

  // Fall loop
  useEffect(() => {
    if (state.phase !== 'PLAYING') return;
    const ms = state.isSoftDropping ? 80 : state.fallInterval;
    const id = setInterval(() => dispatch({ type: 'TICK_FALL' }), ms);
    return () => clearInterval(id);
  }, [state.phase, state.fallInterval, state.isSoftDropping]);

  // Row-clear flash → finish after 500ms
  useEffect(() => {
    if (state.phase !== 'ANIMATING') return;
    const id = setTimeout(() => dispatch({ type: 'FINISH_CLEAR' }), 500);
    return () => clearTimeout(id);
  }, [state.phase, state.clearedRows]);

  const ghostY = (state.phase === 'PLAYING' || state.phase === 'ANIMATING') && state.activePiece
    ? getGhostY(state.grid, state.activePiece, state.rows, state.cols)
    : null;

  const actions = {
    moveLeft:     useCallback(() => dispatch({ type: 'MOVE_LEFT' }),        []),
    moveRight:    useCallback(() => dispatch({ type: 'MOVE_RIGHT' }),       []),
    rotate:       useCallback(() => dispatch({ type: 'ROTATE' }),           []),
    hardDrop:     useCallback(() => dispatch({ type: 'HARD_DROP' }),        []),
    softDrop:     useCallback(() => dispatch({ type: 'SOFT_DROP_START' }),  []),
    softDropEnd:  useCallback(() => dispatch({ type: 'SOFT_DROP_END' }),    []),
    pause:        useCallback(() => dispatch({ type: 'PAUSE' }),            []),
    nextLevel:    useCallback(() => dispatch({ type: 'NEXT_LEVEL' }),       []),
    restart:      useCallback((lvl) => dispatch({ type: 'RESTART', level: lvl }), []),
    dismissEvent: useCallback((id) => dispatch({ type: 'DISMISS_EVENT', id }), []),
  };

  return { state, ghostY, actions };
}
