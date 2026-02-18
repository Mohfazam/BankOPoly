import { useGrid } from '../grid/GridManager';
import BuildingPlot from './BuildingPlot';

export default function PlotSystem() {
  const { PLOT_SIZE, PLOT_SPACING, GRID_OFFSETS } = useGrid();
  const blockSpan = PLOT_SPACING * 3 + 0.5;
  let plotNum = 0;

  return (
    <group>
      {/* ── Large green base for entire 3×3 block ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[blockSpan, blockSpan]} />
        <meshStandardMaterial color="#4a9642" roughness={0.9} />
      </mesh>

      {/* ── Internal path grid (between the 9 cells) ── */}
      {GRID_OFFSETS.map((gz, i) => (
        <mesh key={`ph${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, gz * PLOT_SPACING]}>
          <planeGeometry args={[blockSpan, 0.65]} />
          <meshStandardMaterial color="#c8b880" roughness={0.82} />
        </mesh>
      ))}
      {GRID_OFFSETS.map((gx, i) => (
        <mesh key={`pv${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[gx * PLOT_SPACING, 0.007, 0]}>
          <planeGeometry args={[0.65, blockSpan]} />
          <meshStandardMaterial color="#c8b880" roughness={0.82} />
        </mesh>
      ))}

      {/* ── 8 empty plots (skip 0,0 = bank) ── */}
      {GRID_OFFSETS.map(gx =>
        GRID_OFFSETS.map(gz => {
          if (gx === 0 && gz === 0) return null;
          plotNum++;
          return (
            <BuildingPlot
              key={`${gx}_${gz}`}
              plotNum={plotNum}
              px={gx * PLOT_SPACING}
              pz={gz * PLOT_SPACING}
              size={PLOT_SIZE}
            />
          );
        })
      )}
    </group>
  );
}