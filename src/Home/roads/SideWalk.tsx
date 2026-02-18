interface SideWalkProps {
  length   : number;
  width    : number;
  position : [number, number, number];
  rotation?: number;
}

export default function SideWalk({ length, width, position, rotation = 0 }: SideWalkProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pavement slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#d4c8a0" roughness={0.78} />
      </mesh>
      {/* Kerb edge line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]}>
        <planeGeometry args={[length, 0.13]} />
        <meshStandardMaterial color="#f0ead2" roughness={0.45} />
      </mesh>
    </group>
  );
}