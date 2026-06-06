/** Create an empty 2D grid filled with null */
export function createGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

/** Check if a piece can move by (dx, dy) without hitting walls, floor, or locked cells */
export function canMove(grid, piece, dx, dy, rows, cols) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const newX = piece.x + c + dx;
      const newY = piece.y + r + dy;
      if (newX < 0 || newX >= cols) return false;
      if (newY >= rows) return false;
      if (newY >= 0 && grid[newY][newX] !== null) return false;
    }
  }
  return true;
}

/** Stamp the active piece into the grid as locked cells */
export function lockPiece(grid, piece) {
  const newGrid = grid.map(row => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const y = piece.y + r;
        const x = piece.x + c;
        if (y >= 0) newGrid[y][x] = { color: piece.color, locked: true };
      }
    }
  }
  return newGrid;
}

/** Count how many cells a piece occupies (for +1 per block scoring) */
export function countPieceCells(piece) {
  return piece.shape.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
}

/** Return indices of fully-filled ROWS */
export function findCompleteRows(grid, cols) {
  return grid.reduce((acc, row, i) => {
    if (row.length === cols && row.every(cell => cell !== null)) acc.push(i);
    return acc;
  }, []);
}

/**
 * Return indices of fully-filled COLUMNS.
 * A full column = GAME OVER trigger, so we expose this separately.
 */
export function findCompleteCols(grid, rows, cols) {
  const complete = [];
  for (let c = 0; c < cols; c++) {
    if (grid.every(row => row[c] !== null)) complete.push(c);
  }
  return complete;
}

/**
 * Remove completed rows — shift everything above down.
 * Blocks that were above the cleared row fall down naturally.
 * Returns new grid with empty rows added at the TOP.
 */
export function removeRows(grid, rowIndices) {
  // Keep all rows that are NOT being cleared
  const filtered = grid.filter((_, i) => !rowIndices.includes(i));
  // Pad top with empty rows so the grid stays the same height
  const empty = Array.from({ length: rowIndices.length }, () =>
    Array(grid[0].length).fill(null)
  );
  return [...empty, ...filtered];
}

/** Rotate a matrix 90° clockwise */
export function rotateCW(matrix) {
  const N = matrix.length;
  const M = matrix[0].length;
  const rotated = Array.from({ length: M }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++)
    for (let c = 0; c < M; c++)
      rotated[c][N - 1 - r] = matrix[r][c];
  return rotated;
}

/** Y position where the piece will land */
export function getGhostY(grid, piece, rows, cols) {
  let ghostY = piece.y;
  while (canMove(grid, { ...piece, y: ghostY }, 0, 1, rows, cols)) {
    ghostY++;
  }
  return ghostY;
}

export function hardDropY(grid, piece, rows, cols) {
  return getGhostY(grid, piece, rows, cols);
}

/** Expand grid for level-up */
export function expandGrid(grid, oldCols, oldRows, newCols, newRows) {
  const colOffset = Math.floor((newCols - oldCols) / 2);
  const expanded = [];
  for (let r = 0; r < newRows - oldRows; r++) {
    expanded.push(Array(newCols).fill(null));
  }
  for (let r = 0; r < grid.length; r++) {
    const newRow = Array(newCols).fill(null);
    for (let c = 0; c < oldCols; c++) {
      newRow[c + colOffset] = grid[r][c];
    }
    expanded.push(newRow);
  }
  return expanded;
}
