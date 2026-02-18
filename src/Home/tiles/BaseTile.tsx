// BaseTile — generic flat tile (reused by various systems)
interface BaseTileProps {
  width    : number;
  length   : number;
  color    : string;
  position : [number, number, number];
  yOffset? : number;
}

export default function BaseTile({ width, length, color, position, yOffset = 0 }: BaseTileProps) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[position[0], position[1] + yOffset, position[2]]}
      receiveShadow
    >
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  );
}