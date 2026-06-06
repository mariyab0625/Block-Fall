import React, { useMemo } from 'react';

/**
 * GameGrid
 * Cell size is computed so the grid fits inside:
 *   - vertically:   viewport height  minus navbar (52px) minus padding (32px)
 *   - horizontally: viewport width   minus two side panels (160px each) minus gaps/padding (~120px)
 * Hard cap of 56px keeps cells from being huge on small grids.
 */
export default function GameGrid({ state, ghostY }) {
  const { grid, activePiece, cols, rows, phase } = state;
  const clearedRows = state.clearedRows ?? [];
  const clearedCols = state.clearedCols ?? [];

  const NAVBAR_H  = 52;
  const V_PADDING = 32;
  const H_TAKEN   = 160 * 2 + 120; // two side panels + gaps + page padding

  const cellSize = Math.min(
    Math.floor((window.innerHeight - NAVBAR_H - V_PADDING) / rows),
    Math.floor((window.innerWidth  - H_TAKEN) / cols),
    56
  );

  /* Build display grid: locked + ghost + active */
  const displayGrid = useMemo(() => {
    const flat = grid.map(row => row.map(cell => (cell ? { ...cell } : null)));

    // Ghost
    if (ghostY !== null && activePiece && phase !== 'GAME_OVER') {
      for (let r = 0; r < activePiece.shape.length; r++) {
        for (let c = 0; c < activePiece.shape[r].length; c++) {
          if (!activePiece.shape[r][c]) continue;
          const gy = ghostY + r;
          const gx = activePiece.x + c;
          if (gy >= 0 && gy < rows && gx >= 0 && gx < cols && !flat[gy][gx]) {
            flat[gy][gx] = { color: activePiece.color, ghost: true };
          }
        }
      }
    }

    // Active piece
    if (activePiece && phase !== 'GAME_OVER') {
      for (let r = 0; r < activePiece.shape.length; r++) {
        for (let c = 0; c < activePiece.shape[r].length; c++) {
          if (!activePiece.shape[r][c]) continue;
          const py = activePiece.y + r;
          const px = activePiece.x + c;
          if (py >= 0 && py < rows && px >= 0 && px < cols) {
            flat[py][px] = { color: activePiece.color, active: true };
          }
        }
      }
    }

    return flat;
  }, [grid, activePiece, ghostY, rows, cols, phase]);

  const W = cellSize * cols;
  const H = cellSize * rows;

  return (
    <div style={{
      width: W, height: H,
      position: 'relative',
      border: '2px solid rgba(0,245,255,0.35)',
      borderRadius: 6,
      background: 'rgba(0,0,0,0.75)',
      boxShadow: '0 0 40px rgba(0,245,255,0.15), inset 0 0 40px rgba(0,0,0,0.5)',
    }}>

      {/* Grid line overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 4,
        backgroundImage:
          'linear-gradient(rgba(0,245,255,0.06) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(0,245,255,0.06) 1px, transparent 1px)',
        backgroundSize: `${cellSize}px ${cellSize}px`,
      }} />

      {/* Cells */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows:    `repeat(${rows}, ${cellSize}px)`,
        position: 'relative',
      }}>
        {displayGrid.flat().map((cell, i) => {
          const rowIdx = Math.floor(i / cols);
          const colIdx = i % cols;
          const clearing = clearedRows.includes(rowIdx) || clearedCols.includes(colIdx);
          return <Cell key={i} cell={cell} size={cellSize} clearing={clearing} />;
        })}
      </div>
    </div>
  );
}

function Cell({ cell, size, clearing }) {
  const base = { width: size, height: size, boxSizing: 'border-box' };

  if (!cell) {
    return <div style={{ ...base, border: '1px solid rgba(255,255,255,0.05)' }} />;
  }

  if (cell.ghost) {
    return (
      <div style={{
        ...base,
        border: `2px solid ${cell.color}`,
        borderRadius: 3,
        opacity: 0.28,
        boxShadow: `inset 0 0 4px ${cell.color}60`,
      }} />
    );
  }

  return (
    <div style={{
      ...base,
      background: clearing ? '#ffffff' : cell.color,
      border: '1px solid rgba(255,255,255,0.22)',
      borderRadius: 3,
      boxShadow: clearing
        ? '0 0 24px white, inset 0 0 12px white'
        : `0 0 8px ${cell.color}cc, inset 0 0 6px rgba(255,255,255,0.2)`,
      transition: 'background 0.08s, box-shadow 0.08s',
    }} />
  );
}
