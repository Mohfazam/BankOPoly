import { useRef, useMemo } from 'react';
import { useFrame }        from '@react-three/fiber';
import { Float }           from '@react-three/drei';
import { MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

import StreetLamp    from './StreetLamp';
import ParkBench     from './ParkBench';
import Hedges        from './Hedges';
import ParkingMeter  from './ParkingMeter';
import TreeSystem    from './TreeSystem';
import { useGrid }   from '../town/grid/GridManager';

// ── House ─────────────────────────────────────────────────────────────────────
function HouseBuilding({ position, color, roofColor, s = 1 }: {
  position: [number, number, number]; color: string; roofColor: string; s?: number;
}) {
  return (
    <Float speed={0.7} rotationIntensity={0} floatIntensity={0.28} floatingRange={[0, 0.08]}>
      <group position={position} scale={s}>
        <mesh receiveShadow>
          <boxGeometry args={[5.2, 0.25, 5.2]} />
          <meshStandardMaterial color="#c4a882" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.12, 0]} castShadow>
          <boxGeometry args={[4.7, 4.2, 4.7]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.48, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3.65, 2.8, 4]} />
          <meshStandardMaterial color={roofColor} roughness={0.58} />
        </mesh>
        <mesh position={[1.3, 5.15, -0.8]} castShadow>
          <boxGeometry args={[0.62, 1.85, 0.62]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.05, 2.38]}>
          <boxGeometry args={[0.92, 2.1, 0.09]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.65} />
        </mesh>
        {([-1.55, 1.55] as const).map((x, i) => (
          <mesh key={i} position={[x, 2.4, 2.39]}>
            <boxGeometry args={[0.9, 1.08, 0.07]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fbbf24" emissiveIntensity={0.65} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// ── Shop ──────────────────────────────────────────────────────────────────────
function ShopBuilding({ position, color, s = 1 }: {
  position: [number, number, number]; color: string; s?: number;
}) {
  return (
    <Float speed={0.75} rotationIntensity={0} floatIntensity={0.32} floatingRange={[0, 0.1]}>
      <group position={position} scale={s}>
        <mesh receiveShadow>
          <boxGeometry args={[5.2, 0.22, 5.0]} />
          <meshStandardMaterial color="#a08060" roughness={0.75} />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[4.5, 4.4, 4.4]} />
          <meshStandardMaterial color={color} roughness={0.48} />
        </mesh>
        <mesh position={[0, 4.52, 0]} castShadow>
          <boxGeometry args={[4.9, 0.46, 4.7]} />
          <meshStandardMaterial color="#c97d30" roughness={0.45} />
        </mesh>
        <mesh position={[0, 2.78, 2.46]} rotation={[0.38, 0, 0]}>
          <boxGeometry args={[4.3, 0.12, 1.5]} />
          <meshStandardMaterial color="#dc2626" roughness={0.48} />
        </mesh>
        <mesh position={[0, 1.72, 2.24]}>
          <boxGeometry args={[2.7, 1.55, 0.08]} />
          <meshStandardMaterial color="#fef9c3" emissive="#fbbf24" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, 0.8, 2.24]}>
          <boxGeometry args={[0.95, 1.6, 0.08]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.65} />
        </mesh>
      </group>
    </Float>
  );
}

// ── Windmill ──────────────────────────────────────────────────────────────────
function Windmill({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  const bladesRef = useRef<THREE.Group>(null!);
  const spd = useMemo(() => 0.52 + Math.random() * 0.55, []);
  useFrame(({ clock }) => { bladesRef.current.rotation.z = -clock.getElapsedTime() * spd; });
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 2.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.58, 4.6, 8]} />
        <meshStandardMaterial color="#d4b86a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 4.7, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.72, 8]} />
        <meshStandardMaterial color="#b8893e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.72, 0.57]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#6b4e1a" roughness={0.5} />
      </mesh>
      <group ref={bladesRef} position={[0, 4.72, 0.64]}>
        {[0, 1, 2, 3].map(i => (
          <group key={i} rotation={[0, 0, (Math.PI / 2) * i]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.22, 2.55, 0.06]} />
              <MeshWobbleMaterial factor={0.07} speed={1.5} color="#f0e8cc" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function DecorationSystem() {
  const { ROAD_HALF, OUTER_START } = useGrid();
  const os = OUTER_START + 1.5;
  const rl = ROAD_HALF + 1.4;   // road-edge lamp offset

  const lampPositions: Array<[number, number, number]> = [
    // 4 corners
    [-rl, 0, -rl], [rl, 0, -rl], [-rl, 0, rl], [rl, 0, rl],
    // mid-sides
    [0, 0, -rl], [0, 0, rl], [-rl, 0, 0], [rl, 0, 0],
    // extra along block edges
    [-8, 0, -rl], [8, 0, -rl], [-8, 0, rl], [8, 0, rl],
    [-rl, 0, -8], [-rl, 0, 8], [rl, 0, -8], [rl, 0, 8],
  ];

  return (
    <group>
      {/* ── Trees ── */}
      <TreeSystem />

      {/* ── Street lamps ── */}
      {lampPositions.map((pos, i) => <StreetLamp key={i} position={pos} />)}

      {/* ── Park benches (along inner sidewalk) ── */}
      <ParkBench position={[-rl, 0, -3.5]} rotation={Math.PI / 2} />
      <ParkBench position={[-rl, 0,  3.5]} rotation={Math.PI / 2} />
      <ParkBench position={[ rl, 0, -3.5]} rotation={-Math.PI / 2} />
      <ParkBench position={[ rl, 0,  3.5]} rotation={-Math.PI / 2} />
      <ParkBench position={[-3.5, 0, -rl]} rotation={0} />
      <ParkBench position={[ 3.5, 0, -rl]} rotation={0} />
      <ParkBench position={[-3.5, 0,  rl]} rotation={Math.PI} />
      <ParkBench position={[ 3.5, 0,  rl]} rotation={Math.PI} />

      {/* ── Hedges (outer sidewalk boundary) ── */}
      <Hedges position={[-rl, 0,  -9.5]} width={3} />
      <Hedges position={[-rl, 0,   9.5]} width={3} />
      <Hedges position={[ rl, 0,  -9.5]} width={3} />
      <Hedges position={[ rl, 0,   9.5]} width={3} />
      <Hedges position={[-9.5, 0,  -rl]} width={3} />
      <Hedges position={[ 9.5, 0,  -rl]} width={3} />
      <Hedges position={[-9.5, 0,   rl]} width={3} />
      <Hedges position={[ 9.5, 0,   rl]} width={3} />

      {/* ── Parking meters on road edges ── */}
      <ParkingMeter position={[-rl + 1, 0, -5]} />
      <ParkingMeter position={[-rl + 1, 0,  5]} />
      <ParkingMeter position={[ rl - 1, 0, -5]} />
      <ParkingMeter position={[ rl - 1, 0,  5]} />

      {/* ── Outer town buildings ── */}
      <HouseBuilding position={[-os - 5, 0, -os - 4]} color="#e74c3c" roofColor="#7f1010" s={0.72} />
      <HouseBuilding position={[ os + 5, 0, -os - 4]} color="#3b82f6" roofColor="#1e3a8a" s={0.68} />
      <HouseBuilding position={[-os - 5, 0,  os + 4]} color="#8b5cf6" roofColor="#4c1d95" s={0.70} />
      <HouseBuilding position={[ os + 5, 0,  os + 4]} color="#16a34a" roofColor="#14532d" s={0.72} />
      <ShopBuilding  position={[     0,  0, -os - 7]} color="#f59e0b" s={0.9} />
      <ShopBuilding  position={[     0,  0,  os + 7]} color="#0d9488" s={0.9} />
      <HouseBuilding position={[-os - 8, 0, 0]}       color="#ea580c" roofColor="#9a3412" s={0.65} />
      <HouseBuilding position={[ os + 8, 0, 0]}       color="#d97706" roofColor="#92400e" s={0.65} />
      <HouseBuilding position={[-os - 3, 0, -os - 9]} color="#ec4899" roofColor="#831843" s={0.55} />
      <HouseBuilding position={[ os + 3, 0, -os - 9]} color="#0891b2" roofColor="#164e63" s={0.55} />
      <HouseBuilding position={[-os - 3, 0,  os + 9]} color="#ca8a04" roofColor="#713f12" s={0.55} />
      <HouseBuilding position={[ os + 3, 0,  os + 9]} color="#7c3aed" roofColor="#2e1065" s={0.55} />

      {/* ── Windmills ── */}
      <Windmill position={[-os - 9, 0,  3]} s={0.85} />
      <Windmill position={[ os + 9, 0, -3]} s={0.80} />
    </group>
  );
}