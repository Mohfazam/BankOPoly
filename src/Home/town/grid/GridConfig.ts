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