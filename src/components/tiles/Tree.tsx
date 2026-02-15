import * as THREE from 'three';

interface TreeProps {
  position: [number, number, number];
}

export function Tree({ position }: TreeProps) {
  return (
    <group position={position}>
      {/* Thick tree trunk with taper */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.75, 8]} />
        <meshStandardMaterial 
          color="#7A6248"
          roughness={0.75}
          metalness={0}
          emissive="#6A5238"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Tree bark texture - vertical groove */}
      <mesh position={[0.15, 0.45, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.04]} />
        <meshStandardMaterial 
          color="#6A5238"
          roughness={0.8}
        />
      </mesh>

      <mesh position={[-0.15, 0.45, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.04]} />
        <meshStandardMaterial 
          color="#6A5238"
          roughness={0.8}
        />
      </mesh>

      {/* Primary foliage cone - main canopy */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.72, 1.35, 10]} />
        <meshStandardMaterial 
          color="#2D7A2D"
          roughness={0.82}
          metalness={0}
          emissive="#1D6A1D"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Secondary foliage - layered effect */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.58, 0.9, 10]} />
        <meshStandardMaterial 
          color="#4CAF50"
          roughness={0.8}
          metalness={0}
          emissive="#2D7A2D"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Light foliage highlight - top layer */}
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.4, 0.5, 8]} />
        <meshStandardMaterial 
          color="#66BB6A"
          roughness={0.78}
          metalness={0}
          emissive="#4CAF50"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Sunlit foliage accent - side highlight */}
      <mesh position={[0.35, 0.95, -0.25]} castShadow>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial 
          color="#81C784"
          roughness={0.75}
          metalness={0}
          emissive="#66BB6A"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Shadow side foliage - depth */}
      <mesh position={[-0.28, 0.85, 0.2]} castShadow>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshStandardMaterial 
          color="#1F5F1F"
          roughness={0.85}
          metalness={0}
          emissive="#0F4F0F"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Base foliage transition */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.35, 0.4, 10]} />
        <meshStandardMaterial 
          color="#3D8F3D"
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}
