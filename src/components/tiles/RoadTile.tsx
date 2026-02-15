

interface RoadTileProps {
  position: [number, number, number];
  type?: 'horizontal' | 'vertical' | 'intersection';
}

export function RoadTile({ position, type = 'intersection' }: RoadTileProps) {
  const size = 3.95;

  return (
    <group position={position}>
      {/* Asphalt base - main road surface */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[size, 0.12, size]} />
        <meshStandardMaterial 
          color="#6B6B60"
          roughness={0.92}
          metalness={0.01}
        />
      </mesh>

      {/* Road edge shadows - depth illusion */}
      <mesh position={[-1.97, 0.078, 0]}>
        <boxGeometry args={[0.08, 0.004, size]} />
        <meshBasicMaterial color="#5A5A50" />
      </mesh>

      <mesh position={[1.97, 0.078, 0]}>
        <boxGeometry args={[0.08, 0.004, size]} />
        <meshBasicMaterial color="#5A5A50" />
      </mesh>

      {/* Center road markings */}
      {type === 'horizontal' || type === 'intersection' ? (
        <mesh position={[0, 0.0785, 0]}>
          <boxGeometry args={[size - 0.4, 0.008, 0.3]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      ) : null}

      {type === 'vertical' || type === 'intersection' ? (
        <mesh position={[0, 0.0785, 0]}>
          <boxGeometry args={[0.3, 0.008, size - 0.4]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      ) : null}

      {/* Intersection center marker */}
      {type === 'intersection' ? (
        <mesh position={[0, 0.079, 0]}>
          <boxGeometry args={[0.4, 0.006, 0.4]} />
          <meshBasicMaterial color="#FFED4E" />
        </mesh>
      ) : null}

      {/* Subtle lane divider details */}
      <mesh position={[0, 0.0775, 0]}>
        <boxGeometry args={[size - 0.1, 0.004, size - 0.1]} />
        <meshBasicMaterial color="#7B7B70" />
      </mesh>

      {/* Weathered/worn effect with lines */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`wear-${i}`} position={[-1.8 + i * 1.2, 0.077, 0]}>
          <boxGeometry args={[0.15, 0.003, size]} />
          <meshBasicMaterial color="#5A5A50" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
