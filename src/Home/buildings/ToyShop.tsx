interface ToyShopProps {
  position: [number, number, number];
  color?: string;
}

export default function ToyShop({ position, color = '#87CEEB' }: ToyShopProps) {
  return (
    <group position={position}>
      {/* Shop base */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[1.8, 1.6, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Colorful roof */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <coneGeometry args={[1.2, 0.8, 4]} />
        <meshStandardMaterial color="#FF6B6B" roughness={0.5} />
      </mesh>

      {/* Roof decorations */}
      <mesh castShadow position={[0.5, 2.2, 0.5]}>
        <sphereGeometry args={[0.15, 5, 5]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh castShadow position={[-0.5, 2.2, -0.5]}>
        <sphereGeometry args={[0.15, 5, 5]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Store front */}
      <mesh position={[0, 0.8, 0.95]} castShadow>
        <boxGeometry args={[1.2, 1.2, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.5, 1.0]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Windows */}
      <mesh position={[-0.6, 1.0, 0.95]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[0.6, 1.0, 0.95]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* Awning */}
      <mesh position={[0, 1.4, 0.95]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.4, 0.2, 0.4]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>

      {/* Sign */}
      <mesh position={[0, 1.8, 0.9]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.1]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}