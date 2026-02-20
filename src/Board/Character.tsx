import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterProps {
  position: [number, number, number];
  targetPosition?: [number, number, number];
}

export const Character: React.FC<CharacterProps> = ({ position, targetPosition }) => {
  const characterRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));
  const targetPos = useRef(targetPosition ? new THREE.Vector3(...targetPosition) : new THREE.Vector3(...position));
  
  useFrame(() => {
    if (characterRef.current) {
      // Smooth movement
      currentPos.current.lerp(targetPos.current, 0.1);
      characterRef.current.position.copy(currentPos.current);
      
      // Add a little bounce animation
      const time = Date.now() * 0.005;
      characterRef.current.position.y = Math.sin(time) * 0.1 + 0.5;
    }
  });

  useEffect(() => {
    if (targetPosition) {
      targetPos.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    }
  }, [targetPosition]);

  return (
    <group ref={characterRef}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial color="#FF6B6B" emissive="#FF8E8E" />
      </mesh>
      
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#FFE66D" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.1, 1.25, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.1, 1.25, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Hat */}
      <mesh position={[0, 1.45, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 0.2, 8]} />
        <meshStandardMaterial color="#4ECDC4" />
      </mesh>
    </group>
  );
};