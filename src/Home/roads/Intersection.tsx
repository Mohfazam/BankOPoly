interface IntersectionProps {
  position : [number, number, number];
  size     : number;
}

export default function Intersection({ position, size }: IntersectionProps) {
  const stripes = 5;
  const stripeW = 0.42;
  const stripeL = size * 0.7;

  return (
    <group position={position}>
      {/* Base pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#a89860" roughness={0.88} />
      </mesh>

      {/* Crosswalk on 4 sides */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot, ri) => (
        <group key={ri} rotation={[0, rot, 0]}>
          {Array.from({ length: stripes }, (_, si) => {
            const offset = (si - (stripes - 1) / 2) * (stripeW + 0.18);
            return (
              <mesh key={si} rotation={[-Math.PI / 2, 0, 0]}
                position={[offset, 0.011, size * 0.5 - stripeL * 0.5 - 0.1]}>
                <planeGeometry args={[stripeW, stripeL]} />
                <meshStandardMaterial color="white" roughness={0.5}
                  opacity={0.82} transparent />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}