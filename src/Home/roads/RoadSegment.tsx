import { useMemo } from 'react';

interface RoadSegmentProps {
  length    : number;
  width     : number;
  position  : [number, number, number];
  rotation? : number;   // Y-axis rotation in radians
  lanes?    : number;   // number of lane dividers
}

export default function RoadSegment({
  length, width, position, rotation = 0, lanes = 1,
}: RoadSegmentProps) {
  const dashL   = 1.6;
  const dashGap = 2.0;
  const dashW   = 0.18;
  const count   = Math.floor(length / (dashL + dashGap));
  const offsets = useMemo(
    () => Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * (dashL + dashGap)),
    [count],
  );

  const laneOffsets = useMemo(() => {
    const arr: number[] = [];
    for (let l = 1; l < lanes + 1; l++) {
      arr.push((l / (lanes + 1) - 0.5) * width);
    }
    return arr;
  }, [lanes, width]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Road bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#b5a068" roughness={0.86} />
      </mesh>

      {/* Shoulder lines */}
      {[-1, 1].map(sign => (
        <mesh key={sign} rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.005, sign * (width / 2 - 0.16)]}>
          <planeGeometry args={[length, 0.16]} />
          <meshStandardMaterial color="#f0e8c8" roughness={0.45} />
        </mesh>
      ))}

      {/* Centre dashes per lane divider */}
      {laneOffsets.map((lz, li) =>
        offsets.map((ox, di) => (
          <mesh key={`${li}_${di}`} rotation={[-Math.PI / 2, 0, 0]}
            position={[ox, 0.007, lz]}>
            <planeGeometry args={[dashL, dashW]} />
            <meshStandardMaterial color="#e8d880" roughness={0.5} />
          </mesh>
        ))
      )}
    </group>
  );
}