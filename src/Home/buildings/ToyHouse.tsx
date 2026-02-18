interface ToyHouseProps {
  position: [number, number, number];
  color?: string;
}

export default function ToyHouse({ position, color = '#FFB6C1' }: ToyHouseProps) {
  return (
    <group position={position}>
      {/* House body */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[1.5, 1.6, 1.5]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Roof */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <coneGeometry args={[1.1, 0.8, 4]} />
        <meshStandardMaterial color="#FF4444" roughness={0.5} />
      </mesh>

      {/* Chimney */}
      <mesh castShadow position={[0.5, 1.6, 0.5]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Door */}
      <mesh castShadow position={[0, 0.4, 0.8]}>
        <boxGeometry args={[0.5, 0.8, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Windows */}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={`window-${i}`} position={[x, 1, 0.8]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.1]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
      ))}
    </group>
  );
}