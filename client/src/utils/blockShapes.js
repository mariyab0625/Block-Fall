// All 7 classic Tetrominoes — always available regardless of level
export const SHAPES = {
  I: { matrix: [[1,1,1,1]],                  color: '#00f5ff' },
  O: { matrix: [[1,1],[1,1]],                color: '#f5e642' },
  T: { matrix: [[0,1,0],[1,1,1]],            color: '#bf5fff' },
  S: { matrix: [[0,1,1],[1,1,0]],            color: '#39ff14' },
  Z: { matrix: [[1,1,0],[0,1,1]],            color: '#ff4d4d' },
  L: { matrix: [[1,0],[1,0],[1,1]],          color: '#ff8800' },
  J: { matrix: [[0,1],[0,1],[1,1]],          color: '#0066ff' },
};

const ALL_KEYS = Object.keys(SHAPES);

// Always random from all 7 — blockTypes param is ignored intentionally
export function getRandomShape() {
  const key = ALL_KEYS[Math.floor(Math.random() * ALL_KEYS.length)];
  return { ...SHAPES[key], matrix: SHAPES[key].matrix, type: key };
}
