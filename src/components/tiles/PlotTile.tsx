import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface PlotTileProps {
  position: [number, number, number];
  id: number;
}

export function PlotTile({ position }: PlotTileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) {
      const target = hovered ? 0.18 : 0;
      groupRef.current.position.y += (target - groupRef.current.position.y) * 0.12;
    }
  });

  const handlePointerEnter = (e: any) => {
    e.stopPropagation();
    setHovered(true);
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    setHovered(false);
  };

  const size = 3.95;
  const baseColor = '#6BBD5B';
  const hoverColor = '#7FD56F';

  return (
    <group ref={groupRef} position={position}>
      {/* Deep shadow base layer */}
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <boxGeometry args={[size + 0.15, 0.08, size + 0.15]} />
        <meshStandardMaterial 
          color="#4A7A4A"
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Main grass surface */}
      <mesh 
        ref={meshRef}
        castShadow 
        receiveShadow 
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        position={[0, 0.06, 0]}
      >
        <boxGeometry args={[size, 0.12, size]} />
        <meshStandardMaterial 
          color={hovered ? hoverColor : baseColor}
          roughness={0.78}
          metalness={0.02}
          emissive={hovered ? '#4CAF50' : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>

      {/* Beveled edge - creates depth */}
      <mesh position={[0, 0.078, 0]}>
        <boxGeometry args={[size - 0.08, 0.006, size - 0.08]} />
        <meshBasicMaterial color="#8FCD7F" />
      </mesh>

      {/* Top highlight strip for 3D effect */}
      <mesh position={[0, 0.0795, -1.87]}>
        <boxGeometry args={[size - 0.1, 0.004, 0.2]} />
        <meshBasicMaterial color="#A8E6A1" />
      </mesh>

      {/* Corner pegs - decorative markers */}
      {[
        [-1.92, 0.088, -1.92],
        [1.92, 0.088, -1.92],
        [-1.92, 0.088, 1.92],
        [1.92, 0.088, 1.92]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.08, 6]} />
          <meshStandardMaterial 
            color="#5A7A5A"
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Subtle grass texture variation - small bumps */}
      {[
        [-0.8, 0.062, -0.8],
        [0.8, 0.062, -0.8],
        [-0.8, 0.062, 0.8],
        [0.8, 0.062, 0.8]
      ].map((pos, i) => (
        <mesh key={`bump-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.25, 4, 4]} />
          <meshStandardMaterial 
            color="#7ABD6B"
            roughness={0.8}
            emissive="#6AAD5B"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Hover interactive UI */}
      {hovered && (
        <Html position={[0, 0.95, 0]} center distanceFactor={1}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))'
          }}>
            <div style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              textShadow: '0 0 10px #228B22, 2px 2px 4px rgba(0,0,0,0.9)',
              lineHeight: 1,
              marginBottom: '8px'
            }}>
              +
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              color: 'white',
              padding: '8px 18px',
              borderRadius: '18px',
              fontSize: '14px',
              fontWeight: '600',
              border: '2.5px solid #FFFFFF',
              boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(2px)'
            }}>
              Build Plot
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
