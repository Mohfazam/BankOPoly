import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface BankBuildingProps {
  position?: [number, number, number];
}

export default function BankBuilding({ position = [0, 0, 0] }: BankBuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    window.location.href = '/board';
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Main building body - white/cream */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        position={[0, 2, 0]}
      >
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color={hovered ? "#FFFAF0" : "#F5F5DC"} />
      </mesh>

      {/* Roof - blue */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[3, 1.5, 4]} />
        <meshStandardMaterial color="#4682B4" />
      </mesh>

      {/* Front entrance - golden */}
      <mesh position={[0, 1.5, 2.05]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 2, 0.1]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>

      {/* Door - brown */}
      <mesh position={[0, 1.2, 2.1]} castShadow receiveShadow>
        <boxGeometry args={[1, 1.8, 0.05]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Sign above entrance */}
      <mesh position={[0, 3.2, 2.05]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.6, 0.1]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive={hovered ? '#FFA500' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Windows - light blue */}
      {[
        [-1, 3, 2.05],
        [1, 3, 2.05],
        [-1, 2, 2.05],
        [1, 2, 2.05]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#B0E0E6" />
        </mesh>
      ))}

      {/* Hover effect */}
      {hovered && (
        <Html position={[0, 6, 0]} center>
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4682B4',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            🏦 Click to play!
          </div>
        </Html>
      )}
    </group>
  );
}