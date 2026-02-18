interface CrosswalkProps {
  position : [number, number, number];
  rotation?: number;
  width?   : number;
  length?  : number;
  stripes? : number;
}

export default function Crosswalk({
  position, rotation = 0, width = 3.2, length = 2.2, stripes = 5,
}: CrosswalkProps) {
  const stripeW = width / (stripes * 2 - 1);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: stripes }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}
          position={[(i - (stripes - 1) / 2) * stripeW * 2, 0.014, 0]}>
          <planeGeometry args={[stripeW * 0.9, length]} />
          <meshStandardMaterial color="white" roughness={0.5} opacity={0.86} transparent />
        </mesh>
      ))}
    </group>
  );
}