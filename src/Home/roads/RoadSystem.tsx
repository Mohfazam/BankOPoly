import RoadSegment    from './RoadSegment';
import Intersection   from './Intersection';
import Crosswalk      from './Crosswalk';
import SidewalkSystem from './SidewalkSystem';
import { useGrid }    from '../town/grid/GridManager';

export default function RoadSystem() {
  const { ROAD_HALF, ROAD_WIDTH, BLOCK_HALF } = useGrid();

  // Roads extend from inner corner to outer corner (excluding intersection squares)
  const segLen = BLOCK_HALF * 2 + 2; // a bit longer so roads bleed past the block

  return (
    <group>
      <SidewalkSystem />

      {/* ── Horizontal roads (top / bottom) ── */}
      {([-ROAD_HALF, ROAD_HALF] as const).map((z, i) => (
        <RoadSegment key={`hr${i}`}
          length={segLen + ROAD_WIDTH * 2}
          width={ROAD_WIDTH}
          position={[0, 0, z]}
          lanes={1}
        />
      ))}

      {/* ── Vertical roads (left / right) ── */}
      {([-ROAD_HALF, ROAD_HALF] as const).map((x, i) => (
        <RoadSegment key={`vr${i}`}
          length={segLen + ROAD_WIDTH * 2}
          width={ROAD_WIDTH}
          position={[x, 0, 0]}
          rotation={Math.PI / 2}
          lanes={1}
        />
      ))}

      {/* ── 4 intersection pads ── */}
      {([-ROAD_HALF, ROAD_HALF] as const).flatMap(x =>
        ([-ROAD_HALF, ROAD_HALF] as const).map(z => (
          <Intersection key={`int${x}${z}`}
            position={[x, 0, z]}
            size={ROAD_WIDTH}
          />
        ))
      )}

      {/* ── Crosswalks — one on each side of each intersection ── */}
      {([-ROAD_HALF, ROAD_HALF] as const).flatMap(x =>
        ([-ROAD_HALF, ROAD_HALF] as const).flatMap(z => [
          // along X
          <Crosswalk key={`cwx1_${x}_${z}`}
            position={[x, 0, z + (z > 0 ? -(ROAD_WIDTH / 2 + 0.2) : ROAD_WIDTH / 2 + 0.2)]}
            width={ROAD_WIDTH} length={1.8}
          />,
          // along Z
          <Crosswalk key={`cwz1_${x}_${z}`}
            position={[x + (x > 0 ? -(ROAD_WIDTH / 2 + 0.2) : ROAD_WIDTH / 2 + 0.2), 0, z]}
            rotation={Math.PI / 2}
            width={ROAD_WIDTH} length={1.8}
          />,
        ])
      )}
    </group>
  );
}