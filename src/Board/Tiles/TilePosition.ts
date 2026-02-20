// src/Board/tilePositions.ts
const CORN = 76;
const CELL = 62;
const N    = 5;
const BS   = CORN * 2 + CELL * N;

// Returns {top, left} center of each tile for the token to sit on
export function getTilePosition(tileId: number): { top: number; left: number } {
  const TOP_IDS   = [0, 1, 2, 3, 4];
  const RIGHT_IDS = [5, 6, 7, 8, 9];
  const BOT_IDS   = [14, 13, 12, 11, 10];
  const LEFT_IDS  = [19, 18, 17, 16, 15];

  if (TOP_IDS.includes(tileId)) {
    const idx = TOP_IDS.indexOf(tileId);
    return { top: CORN / 2, left: CORN + CELL * idx + CELL / 2 };
  }
  if (RIGHT_IDS.includes(tileId)) {
    const idx = RIGHT_IDS.indexOf(tileId);
    return { left: BS - CORN / 2, top: CORN + CELL * idx + CELL / 2 };
  }
  if (BOT_IDS.includes(tileId)) {
    const idx = BOT_IDS.indexOf(tileId);
    return { top: BS - CORN / 2, left: CORN + CELL * idx + CELL / 2 };
  }
  if (LEFT_IDS.includes(tileId)) {
    const idx = LEFT_IDS.indexOf(tileId);
    return { left: CORN / 2, top: CORN + CELL * idx + CELL / 2 };
  }
  return { top: CORN / 2, left: CORN / 2 };
}