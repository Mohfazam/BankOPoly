export default function GrassTile() {
  return (
    <group>
      {/* Deep outer grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#3d8b37" roughness={1} />
      </mesh>
      {/* Inner grass (brighter) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#5cb85c" roughness={0.9} />
      </mesh>
    </group>
  );
}