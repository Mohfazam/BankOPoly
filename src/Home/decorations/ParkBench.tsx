export default function ParkBench({
  position, rotation = 0,
}: {
  position: [number, number, number]; rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.41, 0]} castShadow>
        <boxGeometry args={[1.45, 0.09, 0.46]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.74, -0.19]} rotation={[0.16, 0, 0]} castShadow>
        <boxGeometry args={[1.45, 0.4, 0.08]} />
        <meshStandardMaterial color="#795548" roughness={0.7} />
      </mesh>
      {([-0.58, 0.58] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0]} castShadow>
          <boxGeometry args={[0.09, 0.42, 0.4]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}