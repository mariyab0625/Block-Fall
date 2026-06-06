/**
 * Level configuration.
 * - All levels use ALL block types — fully random pieces every time.
 * - Level 1 starts at 9×9. Grid grows as levels increase.
 * - fallMs decreases (faster) each level.
 * - linesToWin: rows to clear to win the level (null = endless final level).
 */
export const LEVEL_CONFIG = {
  1:  { cols: 9,  rows: 9,  fallMs: 1800, linesToWin: 3,  blockTypes: 'ALL', label: 'Beginner'  },
  2:  { cols: 9,  rows: 10, fallMs: 1600, linesToWin: 4,  blockTypes: 'ALL', label: 'Easy'      },
  3:  { cols: 10, rows: 11, fallMs: 1400, linesToWin: 5,  blockTypes: 'ALL', label: 'Easy+'     },
  4:  { cols: 10, rows: 12, fallMs: 1200, linesToWin: 6,  blockTypes: 'ALL', label: 'Medium'    },
  5:  { cols: 10, rows: 14, fallMs: 1100, linesToWin: 7,  blockTypes: 'ALL', label: 'Medium+'   },
  6:  { cols: 11, rows: 15, fallMs: 1000, linesToWin: 8,  blockTypes: 'ALL', label: 'Hard'      },
  7:  { cols: 11, rows: 16, fallMs: 850,  linesToWin: 9,  blockTypes: 'ALL', label: 'Hard+'     },
  8:  { cols: 12, rows: 17, fallMs: 700,  linesToWin: 10, blockTypes: 'ALL', label: 'Expert'    },
  9:  { cols: 12, rows: 19, fallMs: 550,  linesToWin: 12, blockTypes: 'ALL', label: 'Master'    },
  10: { cols: 12, rows: 20, fallMs: 350,  linesToWin: null, blockTypes: 'ALL', label: '⚡ INSANE' },
};

export const MAX_LEVEL = 10;
