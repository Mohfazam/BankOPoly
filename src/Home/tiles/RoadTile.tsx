// RoadTile — base road surface for one unit tile (used internally by RoadSegment)
interface RoadTileProps {
  width    : number;
  length   : number;
  position : [number, number, number];
}

export default function RoadTile({ width, length, position }: RoadTileProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={[length, width]} />
      <meshStandardMaterial color="#b5a068" roughness={0.87} />
    </mesh>
  );
}