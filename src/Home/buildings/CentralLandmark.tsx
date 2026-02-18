import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MONOPOLY_COLORS } from '../styles/BankopolyColors';

interface CentralLandmarkProps {
  position: [number, number, number];
}

export default function CentralLandmark({ position }: CentralLandmarkProps) {
  const fountainRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (fountainRef.current) {
      fountainRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group position={position} ref={fountainRef}>
      {/* Decorative plaza base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3.5, 3.5, 0.2, 8]} />
        <meshStandardMaterial color={MONOPOLY_COLORS.accentGold} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Fountain base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2.2, 0.8, 8]} />
        <meshStandardMaterial color={MONOPOLY_COLORS.fountainStone} />
      </mesh>

      {/* Fountain middle */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 0.8, 8]} />
        <meshStandardMaterial color={MONOPOLY_COLORS.fountainStone} />
      </mesh>

      {/* Fountain top */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color={MONOPOLY_COLORS.accentGold} metalness={0.5} />
      </mesh>

      {/* Water */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial 
          color={MONOPOLY_COLORS.fountainWater} 
          transparent 
          opacity={0.7}
          emissive={MONOPOLY_COLORS.fountainWater}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Decorative rings */}
      {[1.8, 2.4, 3.0].map((radius, i) => (
        <mesh key={`ring-${i}`} position={[0, 0.15, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <torusGeometry args={[radius, 0.1, 8, 32]} />
          <meshStandardMaterial color={MONOPOLY_COLORS.accentGold} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}