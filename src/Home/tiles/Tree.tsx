import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TreeProps {
  position : [number, number, number];
  scale?   : number;
}

export default function Tree({ position, scale = 1 }: TreeProps) {
  const topRef = useRef<THREE.Group>(null!);
  const phase  = useMemo(() => Math.random() * Math.PI * 2, []);
  const spd    = useMemo(() => 0.55 + Math.random() * 0.5, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    topRef.current.rotation.z = Math.sin(t * spd + phase)       * 0.034;
    topRef.current.rotation.x = Math.sin(t * spd * 0.7 + phase) * 0.014;
  });

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh castShadow>
        <cylinderGeometry args={[0.21, 0.33, 2.1, 8]} />
        <meshStandardMaterial color="#4e342e" roughness={0.9} />
      </mesh>
      {/* Foliage — 3 stacked cones */}
      <group ref={topRef} position={[0, 2.1, 0]}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <coneGeometry args={[1.12, 2.5, 8]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <coneGeometry args={[0.92, 1.9, 8]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.8} />
        </mesh>
        <mesh castShadow>
          <coneGeometry args={[0.76, 1.55, 8]} />
          <meshStandardMaterial color="#388e3c" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}