import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface BankBuildingProps {
  position?: [number, number, number];
}

export default function BankBuilding({ position = [0, 0, 0] }: BankBuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Gentle rotation animation
  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const handleClick = () => {
    window.location.href = '/board';
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Main building - wider and shorter for cartoon style */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        position={[0, 2, 0]}
      >
        <boxGeometry args={[5, 4, 5]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>

      {/* Blue roof - flatter pyramid */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[4, 1.5, 4]} />
        <meshStandardMaterial color="#4169E1" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* Front entrance/door area - yellow/gold */}
      <mesh position={[0, 1.2, 2.6]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.5, 0.3]} />
        <meshStandardMaterial color="#FFD700" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.7, 2.75]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Sign above entrance */}
      <mesh position={[0, 2.8, 2.65]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 0.2]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.4} 
          roughness={0.4}
          emissive={hovered ? '#FFA500' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Windows - 4 windows */}
      {[
        [-1.3, 2.8, 2.55],
        [1.3, 2.8, 2.55],
        [-1.3, 1.5, 2.55],
        [1.3, 1.5, 2.55]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.7, 0.1]} />
          <meshStandardMaterial color="#87CEEB" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}

      {/* Side windows */}
      {[
        [2.55, 2.8, 0],
        [2.55, 1.5, 0],
        [-2.55, 2.8, 0],
        [-2.55, 1.5, 0]
      ].map((pos, i) => (
        <mesh key={`side-${i}`} position={pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.7, 0.7]} />
          <meshStandardMaterial color="#87CEEB" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, 6, 0]} center>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            color: '#4169E1',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            🏦 Click to enter!
          </div>
        </Html>
      )}
    </group>
  );
}