// PlotTile — base grass tile for an empty building plot
interface PlotTileProps {
  size     : number;
  position : [number, number, number];
}

export default function PlotTile({ size, position }: PlotTileProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#58a84e" roughness={0.88} />
    </mesh>
  );
}