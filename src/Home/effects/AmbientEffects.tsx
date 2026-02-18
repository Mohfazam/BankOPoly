import { useRef, useMemo } from 'react';
import { useFrame }        from '@react-three/fiber';
import { Sky, Stars, Sparkles, Cloud as DreiCloud } from '@react-three/drei';
import * as THREE from 'three';

// ── Floating gold coin ────────────────────────────────────────────────────────
function FloatingCoin({ pos, speed, phase }: {
  pos: [number,number,number]; speed: number; phase: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = pos[1] + Math.sin(t * speed + phase) * 0.65;
    ref.current.rotation.y = t * 2.2;
  });
  return (
    <mesh ref={ref} position={pos} castShadow>
      <cylinderGeometry args={[0.35, 0.35, 0.1, 18]} />
      <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05}
        emissive="#ffab00" emissiveIntensity={1.2} />
    </mesh>
  );
}

// ── Hot air balloon ────────────────────────────────────────────────────────────
function HotAirBalloon({ position }: { position: [number,number,number] }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 0.3)  * 1.2;
    ref.current.position.x = position[0] + Math.sin(t * 0.17) * 2.8;
  });
  const stripes = ['#ef4444','#fbbf24','#3b82f6','#10b981','#f97316','#a855f7'];
  return (
    <group ref={ref} position={position}>
      {stripes.map((col, i) => (
        <mesh key={i} rotation={[0,(Math.PI/3)*i,0]}>
          <sphereGeometry args={[2.9, 4, 18, (Math.PI/3)*i, Math.PI/3]} />
          <meshStandardMaterial color={col} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0,2.9,0]}>
        <sphereGeometry args={[0.3,8,8]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
      {([[-1,-1],[1,-1],[-1,1],[1,1]] as const).map(([x,z],i) => (
        <mesh key={i} position={[x*1.1,-2.1,z*1.1]} rotation={[x*0.35,0,z*0.35]}>
          <cylinderGeometry args={[0.035,0.035,2.6,4]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0,-3.5,0]}>
        <boxGeometry args={[1.55,0.92,1.55]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>
      <mesh position={[0,-2.3,0]}>
        <sphereGeometry args={[0.26,8,8]} />
        <meshStandardMaterial color="#ff6b00" emissive="#ff4500" emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0,-2.3,0]} intensity={3} distance={6} color="#ff8c00" />
    </group>
  );
}

// ── Birds in V-formation ──────────────────────────────────────────────────────
function Birds({ count=5, height=19, speed=0.85, xOff=0 }: {
  count?:number; height?:number; speed?:number; xOff?:number;
}) {
  const ref    = useRef<THREE.Group>(null!);
  const startZ = useMemo(() => -48 - Math.random() * 12, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.z = ((startZ + t * speed * 4) % 96) - 48;
    ref.current.position.y = height + Math.sin(t * 0.4) * 0.8;
  });
  return (
    <group ref={ref} position={[xOff, height, startZ]}>
      {Array.from({ length: count }, (_, i) => {
        const x = (i - Math.floor(count/2)) * 2.2;
        const y = Math.abs(i - Math.floor(count/2)) * 0.5;
        return (
          <mesh key={i} position={[x,-y,i*0.8]}>
            <torusGeometry args={[0.55,0.06,4,6,Math.PI]} />
            <meshStandardMaterial color="#374151" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
export default function AmbientEffects() {
  const coins: Array<{pos:[number,number,number];sp:number;ph:number}> = [
    {pos:[-23,3.5,-23],sp:0.55,ph:0.0}, {pos:[23,4.0,-23],sp:0.68,ph:1.2},
    {pos:[-23,3.2, 23],sp:0.60,ph:2.4}, {pos:[23,3.7, 23],sp:0.78,ph:0.8},
    {pos:[-14,4.5,-29],sp:0.50,ph:3.1}, {pos:[14,4.8,-29],sp:0.63,ph:1.8},
    {pos:[-29,4.2,  0],sp:0.58,ph:0.5}, {pos:[29,4.0,  0],sp:0.65,ph:2.8},
    {pos:[  0,5.0,-31],sp:0.70,ph:2.2}, {pos:[ 0,4.6, 31],sp:0.60,ph:0.3},
  ];

  return (
    <>
      <Sky distance={4500} sunPosition={[100,20,-100]}
        inclination={0.52} azimuth={0.28} turbidity={6}
        rayleigh={0.6} mieCoefficient={0.004} mieDirectionalG={0.8} />
      <Stars radius={130} depth={55} count={1200} factor={4} fade speed={0.3} />
      <fog attach="fog" args={['#c9dff5', 46, 95]} />

      <ambientLight intensity={0.58} color="#ffe4c4" />
      <directionalLight position={[20,30,15]} intensity={1.65} color="#fff8e8" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={100} shadow-camera-near={0.5}
        shadow-camera-left={-48} shadow-camera-right={48}
        shadow-camera-top={48}   shadow-camera-bottom={-48}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={['#87ceeb','#4a7a30', 0.4]} />
      <directionalLight position={[-15,8,-20]} intensity={0.45} color="#ffb347" />

      <Sparkles count={220} scale={62} size={2.2} speed={0.25} color="#ffd700" opacity={0.55} position={[0,6,0]} />
      <Sparkles count={140} scale={33} size={3.5} speed={0.4}  color="#ffe082" opacity={0.7}  position={[0,3,0]} />

      <DreiCloud position={[-25,17,-23]} speed={0.3}  opacity={0.65} />
      <DreiCloud position={[ 23,19,-27]} speed={0.2}  opacity={0.50} />
      <DreiCloud position={[-15,15, 25]} speed={0.35} opacity={0.60} />
      <DreiCloud position={[ 27,16, 17]} speed={0.28} opacity={0.55} />

      {coins.map((c,i) => <FloatingCoin key={i} pos={c.pos} speed={c.sp} phase={c.ph} />)}

      <HotAirBalloon position={[-21,24,-21]} />
      <HotAirBalloon position={[ 25,28, 13]} />

      <Birds count={5} height={19} speed={0.9} xOff={-9}  />
      <Birds count={4} height={22} speed={0.7} xOff={ 14} />
    </>
  );
}