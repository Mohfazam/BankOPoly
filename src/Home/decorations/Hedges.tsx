export default function Hedges({
  position, width = 2.5, height = 0.88,
}: {
  position: [number, number, number]; width?: number; height?: number;
}) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} castShadow>
      <boxGeometry args={[width, height, 0.62]} />
      <meshStandardMaterial color="#1b5e20" roughness={0.9} />
    </mesh>
  );
}