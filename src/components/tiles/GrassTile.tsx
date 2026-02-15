import * as THREE from 'three';

interface GrassTileProps {
  position: [number, number, number];
  variant?: number;
}

export function GrassTile({ position, variant = 0 }: GrassTileProps) {
  const size = 3.95;
  
  // Grass color variations for natural look
  const grassVariants = [
    { main: '#5BAD4B', highlight: '#7ABD6B', dark: '#4A9D3B' },
    { main: '#6BBD5B', highlight: '#8FCD7F', dark: '#5AAD4B' },
    { main: '#66B855', highlight: '#85D870', dark: '#558A45' }
  ];

  const colors = grassVariants[variant % grassVariants.length];

  return (
    <group position={position}>
      {/* Dark shadow base */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[size + 0.1, 0.08, size + 0.1]} />
        <meshStandardMaterial 
          color="#4A7A4A"
          roughness={0.95}
        />
      </mesh>

      {/* Main grass surface */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[size, 0.1, size]} />
        <meshStandardMaterial 
          color={colors.main}
          roughness={0.82}
          metalness={0}
          emissive={colors.dark}
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Highlight top edge - natural grass shine */}
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[size - 0.2, 0.006, size - 0.2]} />
        <meshBasicMaterial color={colors.highlight} />
      </mesh>

      {/* Subtle grass texture - random bumps for organic feel */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 1.2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh key={`grass-${i}`} position={[x, 0.062, z]} scale={[0.3, 0.2, 0.3]}>
            <sphereGeometry args={[0.3, 4, 4]} />
            <meshStandardMaterial 
              color={colors.highlight}
              roughness={0.8}
              emissive={colors.main}
              emissiveIntensity={0.15}
            />
          </mesh>
        );
      })}

      {/* Subtle shadow lines for grass blades effect */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`shadow-${i}`} position={[-1.6 + i * 1.6, 0.063, 0]}>
          <boxGeometry args={[0.2, 0.004, size - 0.2]} />
          <meshBasicMaterial color={colors.dark} transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Corner accent - small flowers/decorative elements */}
      {[
        [-1.6, 0.068, -1.6],
        [1.6, 0.068, -1.6],
        [-1.6, 0.068, 1.6]
      ].map((pos, i) => (
        <mesh key={`accent-${i}`} position={pos as [number, number, number]} scale={[0.25, 0.25, 0.25]}>
          <sphereGeometry args={[0.15, 3, 3]} />
          <meshStandardMaterial 
            color="#FF6B6B"
            roughness={0.7}
            emissive="#FF5555"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
