import { Canvas } from '@react-three/fiber';


function Building({ position, width, depth, height, color }: any) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0} />
    </mesh>
  );
}

function Window({ position, size }: any) {
  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial color="#fbbf24" />
    </mesh>
  );
}

function Tree({ position }: any) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.4, 2, 6]} />
        <meshStandardMaterial color="#6b4423" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[1.2, 2.4, 8]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.9, 1.8, 8]} />
        <meshStandardMaterial color="#3d6b1f" roughness={0.8} />
      </mesh>
    </group>
  );
}

function TownBuildings() {
  return (
    <>
      {/* Background buildings - far left and right */}
      <Building position={[-8, 1.5, -6]} width={3} depth={3} height={3} color="#c84c2d" />
      <Building position={[8, 1.2, -6]} width={2.5} depth={3} height={2.4} color="#d97706" />
      <Building position={[-7, 1, 6]} width={2} depth={2.5} height={2} color="#2563eb" />
      <Building position={[7, 1.8, 6]} width={3.5} depth={2} height={3.6} color="#0d9488" />

      {/* Top left building */}
      <Building position={[-5, 1.2, -7]} width={2.5} depth={2.5} height={2.4} color="#dc2626" />
      <Window position={[-5.6, 1.5, -6.5]} size={0.4} />
      <Window position={[-4.4, 1.5, -6.5]} size={0.4} />

      {/* Top right building */}
      <Building position={[5, 1.5, -7]} width={3} depth={2.5} height={3} color="#7c3aed" />
      <Window position={[4.2, 1.8, -6.5]} size={0.5} />
      <Window position={[5.8, 1.8, -6.5]} size={0.5} />

      {/* Bottom left building */}
      <Building position={[-6, 1.3, 7]} width={2.5} depth={3} height={2.6} color="#ea580c" />
      <Window position={[-6.6, 1.6, 7.5]} size={0.4} />
      <Window position={[-5.4, 1.6, 7.5]} size={0.4} />

      {/* Bottom right building */}
      <Building position={[5.5, 1, 7.5]} width={2.5} depth={2} height={2} color="#16a34a" />
      <Window position={[5.5, 1.3, 8.2]} size={0.4} />

      {/* Trees scattered around */}
      <Tree position={[-9, 0, -8]} />
      <Tree position={[9, 0, -8]} />
      <Tree position={[-10, 0, 8]} />
      <Tree position={[10, 0, 8]} />
      <Tree position={[0, 0, -9.5]} />
      <Tree position={[0, 0, 9.5]} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#a6a175" roughness={0.9} />
      </mesh>
    </>
  );
}

export function Town3D() {
  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      camera={{ position: [0, 6, 12], fov: 50 }}
      shadows
    >
      <color attach="background" args={['#87CEEB']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 12, 8]} intensity={1} castShadow />
      <TownBuildings />
    </Canvas>
  );
}
