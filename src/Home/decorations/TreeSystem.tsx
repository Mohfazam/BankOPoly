import Tree from '../tiles/Tree';
import { useGrid } from '../town/grid/GridManager';

export default function TreeSystem() {
  const { ROAD_HALF, OUTER_START } = useGrid();
  const os = OUTER_START + 1.2;

  const trees: Array<{ pos: [number, number, number]; s: number }> = [
    // ── Sidewalk trees along road ring ──────────────────────────────
    { pos: [-ROAD_HALF - 1.6, 0, -6], s: 0.62 },
    { pos: [-ROAD_HALF - 1.6, 0,  6], s: 0.65 },
    { pos: [ ROAD_HALF + 1.6, 0, -6], s: 0.62 },
    { pos: [ ROAD_HALF + 1.6, 0,  6], s: 0.65 },
    { pos: [-6, 0, -ROAD_HALF - 1.6], s: 0.62 },
    { pos: [ 6, 0, -ROAD_HALF - 1.6], s: 0.65 },
    { pos: [-6, 0,  ROAD_HALF + 1.6], s: 0.64 },
    { pos: [ 6, 0,  ROAD_HALF + 1.6], s: 0.62 },

    // ── Corner clusters ──────────────────────────────────────────────
    { pos: [-ROAD_HALF - 1.8, 0, -ROAD_HALF - 1.8], s: 0.7 },
    { pos: [ ROAD_HALF + 1.8, 0, -ROAD_HALF - 1.8], s: 0.68 },
    { pos: [-ROAD_HALF - 1.8, 0,  ROAD_HALF + 1.8], s: 0.72 },
    { pos: [ ROAD_HALF + 1.8, 0,  ROAD_HALF + 1.8], s: 0.7 },

    // ── Outer ring ────────────────────────────────────────────────────
    { pos: [-os - 3, 0, -os - 3], s: 0.88 }, { pos: [ os + 3, 0, -os - 3], s: 0.85 },
    { pos: [-os - 3, 0,  os + 3], s: 0.90 }, { pos: [ os + 3, 0,  os + 3], s: 0.87 },
    { pos: [0,       0, -os - 5], s: 0.80 }, { pos: [0,       0,  os + 5], s: 0.82 },
    { pos: [-os - 5, 0, 0],       s: 0.78 }, { pos: [ os + 5, 0, 0],       s: 0.76 },
    { pos: [-os - 2, 0, -os - 1], s: 0.65 }, { pos: [ os + 2, 0, -os - 1], s: 0.68 },
    { pos: [-os - 2, 0,  os + 1], s: 0.66 }, { pos: [ os + 2, 0,  os + 1], s: 0.67 },
    { pos: [-os - 1, 0, -os - 3], s: 0.66 }, { pos: [ os + 1, 0, -os - 3], s: 0.64 },
    { pos: [-os - 1, 0,  os + 3], s: 0.68 }, { pos: [ os + 1, 0,  os + 3], s: 0.66 },
    { pos: [-os - 4, 0, -8],      s: 0.6  }, { pos: [ os + 4, 0, -8],      s: 0.6  },
    { pos: [-os - 4, 0,  8],      s: 0.6  }, { pos: [ os + 4, 0,  8],      s: 0.6  },
    { pos: [-8,      0, -os - 4], s: 0.6  }, { pos: [ 8,      0, -os - 4], s: 0.6  },
    { pos: [-8,      0,  os + 4], s: 0.6  }, { pos: [ 8,      0,  os + 4], s: 0.6  },
  ];

  return (
    <group>
      {trees.map(({ pos, s }, i) => (
        <Tree key={i} position={pos} scale={s} />
      ))}
    </group>
  );
}