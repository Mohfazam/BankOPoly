export default function ParkingMeter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.1, 6]} />
        <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[0.18, 0.28, 0.14]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.18, 0.08]}>
        <boxGeometry args={[0.12, 0.1, 0.02]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}