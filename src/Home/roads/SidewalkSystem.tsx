import SideWalk from './SideWalk';
import { useGrid } from '../town/grid/GridManager';

export default function SidewalkSystem() {
  const { ROAD_HALF, ROAD_WIDTH, BLOCK_HALF, SIDEWALK_W } = useGrid();
  const roadLen = (ROAD_HALF + ROAD_WIDTH / 2 + 2) * 2;
  const blockLen = BLOCK_HALF * 2;
  const inner = BLOCK_HALF + SIDEWALK_W / 2;
  const outer = ROAD_HALF - ROAD_WIDTH / 2 - SIDEWALK_W / 2;

  return (
    <group>
      {/* Inner sidewalks (between plot block & road) */}
      {[-inner, inner].map((z, i) => (
        <SideWalk key={`inner_h${i}`}
          length={blockLen} width={SIDEWALK_W}
          position={[0, 0, z]} />
      ))}
      {[-inner, inner].map((x, i) => (
        <SideWalk key={`inner_v${i}`}
          length={SIDEWALK_W} width={blockLen}
          position={[x, 0, 0]} />
      ))}

      {/* Outer sidewalks (between road & outer town) */}
      {[-outer, outer].map((z, i) => (
        <SideWalk key={`outer_h${i}`}
          length={roadLen} width={SIDEWALK_W}
          position={[0, 0, z]} />
      ))}
      {[-outer, outer].map((x, i) => (
        <SideWalk key={`outer_v${i}`}
          length={SIDEWALK_W} width={roadLen}
          position={[x, 0, 0]} />
      ))}
    </group>
  );
}