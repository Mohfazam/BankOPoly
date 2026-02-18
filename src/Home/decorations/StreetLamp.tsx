import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function StreetLamp({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const mat = glowRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.3 + Math.sin(clock.getElapsedTime() * 1.9) * 0.28;
  });

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.11, 3.6, 7]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.52, 3.45, 0]} rotation={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.05, 0.05, 1.05, 6]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Lamp cap */}
      <mesh position={[1.04, 3.82, 0]}>
        <cylinderGeometry args={[0.2, 0.11, 0.34, 7]} />
        <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Glow bulb */}
      <mesh ref={glowRef} position={[1.04, 3.65, 0]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#fffde7" emissive="#fff176"
          emissiveIntensity={1.3} roughness={0.2} />
      </mesh>
      <pointLight position={[1.04, 3.68, 0]} intensity={1.7}
        distance={7.5} color="#fff9c4" decay={2} />
    </group>
  );
}