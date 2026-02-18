// ─── GRID LAYOUT CONSTANTS ────────────────────────────────────────────────────
//
//  Visual layout (top-down):
//
//   ████████████████████████████████████  ← outer town (buildings, trees)
//   ██  road  ██  road  ██  road  ██  road  ██
//       [P1]      [P2]      [P3]
//   ██  road  ██  [BANK]    ██  P6  ██  road  ██
//       [P7]      [P8]      [P9]
//   ██  road  ██  road  ██  road  ██  road  ██
//   ████████████████████████████████████  ← outer town
//

export const PLOT_SIZE     = 7.0;                         // one plot square side
export const PLOT_GAP      = 0.8;                         // gap between plots (internal path)
export const PLOT_SPACING  = PLOT_SIZE + PLOT_GAP;        // 7.8  centre-to-centre
export const BLOCK_HALF    = PLOT_SPACING * 1.5;          // 11.7 half-span of 3-plot block

export const ROAD_WIDTH    = 4.0;                         // surrounding road width
export const ROAD_HALF     = BLOCK_HALF + ROAD_WIDTH / 2; // 13.7 road centreline from origin

export const SIDEWALK_W    = 0.9;                         // pavement strip width
export const OUTER_START   = BLOCK_HALF + ROAD_WIDTH;     // 15.7 outer buildings start here

export const GRID_OFFSETS  = [-1, 0, 1] as const;

// Plot positions (9 plots in 3x3 grid, bank in center)
export const PLOT_POSITIONS = [
  [-BLOCK_HALF, 0, -BLOCK_HALF], // Top-left (P1)
  [0, 0, -BLOCK_HALF],           // Top-middle (P2)
  [BLOCK_HALF, 0, -BLOCK_HALF],  // Top-right (P3)
  
  [-BLOCK_HALF, 0, 0],           // Middle-left (P4) - will be BANK
  [0, 0, 0],                     // Center - BANK
  [BLOCK_HALF, 0, 0],            // Middle-right (P6)
  
  [-BLOCK_HALF, 0, BLOCK_HALF],  // Bottom-left (P7)
  [0, 0, BLOCK_HALF],            // Bottom-middle (P8)
  [BLOCK_HALF, 0, BLOCK_HALF],   // Bottom-right (P9)
] as [number, number, number][];

// Color palette
export const COLORS = {
  // Roads
  roadAsphalt: '#2F2F2F',
  roadMarking: '#FFFFFF',
  centerLine: '#FFD700',
  sidewalk: '#E0E0E0',
  curb: '#A0A0A0',
  crosswalk: '#FFFFFF',
  
  // Plots
  plotGrass: '#5cb85c',
  plotBorder: '#c4a882',
  plotMarker: '#FFD700',
  
  // Bank
  bankPrimary: '#f5f0dc',
  bankSecondary: '#154785',
  bankAccent: '#FFD700',
  
  // Environment
  groundBase: '#3d8b37',
  groundDark: '#2d6a2d',
  treeTrunk: '#4e342e',
  treeLeaf: '#388e3c',
};

// Export all constants together for convenience
export const GRID_CONFIG = {
  PLOT_SIZE,
  PLOT_GAP,
  PLOT_SPACING,
  BLOCK_HALF,
  ROAD_WIDTH,
  ROAD_HALF,
  SIDEWALK_W,
  OUTER_START,
  GRID_OFFSETS,
  PLOT_POSITIONS,
  COLORS,
};