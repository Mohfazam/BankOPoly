'use client';

import { PlotTile } from './tiles/PlotTile';
import { RoadTile } from './tiles/RoadTile';
import { GrassTile } from './tiles/GrassTile';
import { Tree } from './tiles/Tree';

interface EmptyPlotGridProps {
  position?: [number, number, number];
}

const GRID_SIZE = 6;
const SPACING = 4.5;
const CENTER_IDX = 2.5;

export default function EmptyPlotGrid({ position = [0, 0, 0] }: EmptyPlotGridProps) {
  // Pre-calculate all positions and types
  const getTileType = (row: number, col: number) => {
    if (row === 2 || col === 2) return 'road';
    return 'plot';
  };

  const getRoadType = (row: number, col: number): 'horizontal' | 'vertical' | 'intersection' => {
    const isHorizontal = row === 2;
    const isVertical = col === 2;
    return isHorizontal && isVertical ? 'intersection' : isHorizontal ? 'horizontal' : 'vertical';
  };

  return (
    <group position={position}>
      {/* Render all grid tiles */}
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;
        const x = (col - CENTER_IDX) * SPACING;
        const z = (row - CENTER_IDX) * SPACING;
        const pos: [number, number, number] = [x, 0, z];
        const tileType = getTileType(row, col);

        if (tileType === 'road') {
          const roadType = getRoadType(row, col);
          return <RoadTile key={i} position={pos} type={roadType} />;
        } else {
          const variant = (row + col) % 3;
          return (
            <group key={i}>
              <GrassTile position={pos} variant={variant} />
              <PlotTile position={pos} id={i} />
            </group>
          );
        }
      })}

      {/* Decorative trees around town - high quality */}
      <Tree position={[-11, 0, -11]} />
      <Tree position={[11, 0, -11]} />
      <Tree position={[-11, 0, 11]} />
      <Tree position={[11, 0, 11]} />
      <Tree position={[0, 0, -13]} />
      <Tree position={[-13, 0, 0]} />
      <Tree position={[13, 0, 0]} />
      <Tree position={[0, 0, 13]} />
      <Tree position={[-7, 0, -13]} />
      <Tree position={[7, 0, -13]} />
      <Tree position={[-13, 0, -7]} />
      <Tree position={[-13, 0, 7]} />
    </group>
  );
}
