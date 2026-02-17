/**
 * Town3D — Bankopoly immersive background
 *
 * Install deps (if not already):
 *   npm install @react-three/drei @react-three/postprocessing postprocessing
 *
 * This component is 100% passive — pointerEvents: 'none' — it never
 * intercepts clicks meant for BoardGame.tsx above it.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import {
  Sky,
  Stars,
  Sparkles,
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Cloud as DreiCloud,
  Billboard,
  Trail,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function useWave(speed = 1, amplitude = 0.06, offset = 0) {
  const val = useRef(0);
  useFrame(({ clock }) => {
    val.current = Math.sin(clock.getElapsedTime() * speed + offset) * amplitude;
  });
  return val;
}

/* ─────────────────────────────────────────────────────────
   GROUND — multi-layer with subtle hex tile pattern
───────────────────────────────────────────────────────── */
function Ground() {
  return (
    <group>
      {/* Deep outer grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#3d8b37" roughness={1} />
      </mesh>

      {/* Main play-area grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#5cb85c" roughness={0.9} />
      </mesh>

      {/* Cobblestone intersection pads */}
      {([-5, 5] as const).flatMap(x =>
        ([-5, 5] as const).map(z => (
          <mesh key={`${x}${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, z]}>
            <planeGeometry args={[3, 3]} />
            <meshStandardMaterial color="#b5a080" roughness={0.85} />
          </mesh>
        ))
      )}

      {/* Roads — horizontal */}
      {([-5, 5] as const).map((z, i) => (
        <mesh key={`rh${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, z]}>
          <planeGeometry args={[50, 2.6]} />
          <meshStandardMaterial color="#c0aa80" roughness={0.82} />
        </mesh>
      ))}

      {/* Roads — vertical */}
      {([-5, 5] as const).map((x, i) => (
        <mesh key={`rv${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.004, 0]}>
          <planeGeometry args={[2.6, 50]} />
          <meshStandardMaterial color="#c0aa80" roughness={0.82} />
        </mesh>
      ))}

      {/* Road centre dashes */}
      {([-5, 5] as const).map((z, zi) =>
        [-14, -9, -2, 2, 9, 14].map((x, xi) => (
          <mesh key={`dh${zi}${xi}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, z]}>
            <planeGeometry args={[1.2, 0.15]} />
            <meshStandardMaterial color="#e8d8a0" roughness={0.5} />
          </mesh>
        ))
      )}
      {([-5, 5] as const).map((x, xi) =>
        [-14, -9, -2, 2, 9, 14].map((z, zi) => (
          <mesh key={`dv${xi}${zi}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, z]}>
            <planeGeometry args={[0.15, 1.2]} />
            <meshStandardMaterial color="#e8d8a0" roughness={0.5} />
          </mesh>
        ))
      )}

      {/* Plot pads */}
      {([-12, 0, 12] as const).flatMap(x =>
        ([-12, 0, 12] as const)
          .filter(z => !(x === 0 && z === 0))
          .map(z => (
            <mesh key={`pad${x}${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, z]}>
              <planeGeometry args={[8.6, 8.6]} />
              <meshStandardMaterial color="#68b55a" roughness={0.88} />
            </mesh>
          ))
      )}

      {/* Flower patches — tiny coloured discs scattered around plots */}
      {[
        [-9.5, 0.01, -9.5, '#f43f5e'], [-10.5, 0.01, -8.5, '#a78bfa'],
        [9.5, 0.01, -9.5, '#fb923c'],  [10.5, 0.01, -8.5, '#34d399'],
        [-9.5, 0.01, 9.5, '#60a5fa'],  [-10.5, 0.01, 8.5, '#fbbf24'],
        [9.5, 0.01, 9.5, '#f472b6'],   [10.5, 0.01, 8.5, '#4ade80'],
        [-3.5, 0.01, -9.5, '#fbbf24'], [3.5, 0.01, -9.5, '#f43f5e'],
        [-3.5, 0.01, 9.5, '#a78bfa'],  [3.5, 0.01, 9.5, '#34d399'],
        [-9.5, 0.01, 0, '#60a5fa'],    [9.5, 0.01, 0, '#fb923c'],
      ].map(([x, y, z, col], i) => (
        <mesh key={`fl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x as number, y as number, z as number]}>
          <circleGeometry args={[0.55, 8]} />
          <meshStandardMaterial color={col as string} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────
   ANIMATED FOUNTAIN (distort water = alive)
───────────────────────────────────────────────────────── */
function Fountain() {
  return (
    <group position={[0, 0, 0]}>
      {/* Basin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#d2c49e" roughness={0.6} />
      </mesh>
      {/* Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.6, 3.1, 48]} />
        <meshStandardMaterial color="#e0d0a8" roughness={0.5} />
      </mesh>
      {/* Distorted water surface — the star of the show */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <circleGeometry args={[2.55, 48]} />
        <MeshDistortMaterial
          color="#56b4e9"
          distort={0.22}
          speed={2.5}
          roughness={0.05}
          metalness={0.4}
          emissive="#1e88e5"
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.32, 2.2, 14]} />
        <meshStandardMaterial color="#e8e0cc" roughness={0.45} />
      </mesh>
      {/* Top bowl */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <sphereGeometry args={[0.55, 18, 12]} />
        <meshStandardMaterial color="#d4c9a8" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Gold finial */}
      <mesh position={[0, 3.0, 0]}>
        <cylinderGeometry args={[0.1, 0.18, 0.6, 8]} />
        <meshStandardMaterial
          color="#ffd700" metalness={0.95} roughness={0.05}
          emissive="#ffaa00" emissiveIntensity={0.6}
        />
      </mesh>
      {/* Sparkles rising from fountain */}
      <Sparkles
        count={35} scale={5} size={3} speed={0.6}
        color="#56d4fd" opacity={0.85}
        position={[0, 1.2, 0]}
      />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────
   TREE — swaying, lush, tiered cones
───────────────────────────────────────────────────────── */
function Tree({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  const topRef = useRef<THREE.Group>(null!);
  const phase  = useMemo(() => Math.random() * Math.PI * 2, []);
  const spd    = useMemo(() => 0.6 + Math.random() * 0.5, []);
  useFrame(({ clock }) => {
    topRef.current.rotation.z = Math.sin(clock.getElapsedTime() * spd + phase) * 0.035;
    topRef.current.rotation.x = Math.sin(clock.getElapsedTime() * spd * 0.7 + phase) * 0.015;
  });
  const darkGreen  = '#1b5e20';
  const midGreen   = '#2e7d32';
  const lightGreen = '#388e3c';
  return (
    <group position={position} scale={s}>
      {/* Trunk */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.9, 8]} />
        <meshStandardMaterial color="#4e342e" roughness={0.9} />
      </mesh>
      {/* Roots bump */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.3, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      <group ref={topRef} position={[0, 1.9, 0]}>
        <mesh position={[0, 1.3, 0]} castShadow>
          <coneGeometry args={[1.05, 2.3, 8]} />
          <meshStandardMaterial color={darkGreen} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <coneGeometry args={[0.88, 1.8, 8]} />
          <meshStandardMaterial color={midGreen} roughness={0.8} />
        </mesh>
        <mesh castShadow>
          <coneGeometry args={[0.72, 1.45, 8]} />
          <meshStandardMaterial color={lightGreen} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────
   LAMP POST — warm glowing bulb with bloom pickup
───────────────────────────────────────────────────────── */
function LampPost({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const mat = glowRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.4 + Math.sin(clock.getElapsedTime() * 1.8) * 0.3;
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.1, 3.2, 7]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.45, 3.15, 0]} rotation={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.05, 0.05, 0.95, 6]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Housing */}
      <mesh position={[0.9, 3.5, 0]}>
        <cylinderGeometry args={[0.18, 0.1, 0.3, 7]} />
        <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Bulb — emissive, picked up by Bloom */}
      <mesh ref={glowRef} position={[0.9, 3.36, 0]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial
          color="#fffde7" emissive="#fff176"
          emissiveIntensity={1.4} roughness={0.2}
        />
      </mesh>
      {/* Halo point light */}
      <pointLight position={[0.9, 3.4, 0]} intensity={1.8} distance={7} color="#fff9c4" decay={2} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────
   FLOATING COIN — bloom + trail
───────────────────────────────────────────────────────── */
function FloatingCoin({
  startPos, speed, phase,
}: {
  startPos: [number, number, number]; speed: number; phase: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRef.current.position.y = startPos[1] + Math.sin(t * speed + phase) * 0.65;
    meshRef.current.rotation.y = t * 2.2;
    meshRef.current.rotation.x = Math.sin(t * 0.45 + phase) * 0.28;
  });
  return (
    <mesh ref={meshRef} position={startPos} castShadow>
      <cylinderGeometry args={[0.34, 0.34, 0.09, 18]} />
      <meshStandardMaterial
        color="#ffd700" metalness={0.95} roughness={0.05}
        emissive="#ffab00" emissiveIntensity={1.2}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────
   HOT AIR BALLOON 🎈 — dramatic background element
───────────────────────────────────────────────────────── */
function HotAirBalloon({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 0.3) * 1.2;
    groupRef.current.position.x = position[0] + Math.sin(t * 0.18) * 3.0;
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.04;
  });
  const stripeColors = ['#ef4444','#fbbf24','#3b82f6','#10b981','#f97316','#a855f7'];
  return (
    <group ref={groupRef} position={position}>
      {/* Balloon envelope — striped */}
      {stripeColors.map((col, i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[0, (Math.PI / 3) * i, 0]}>
          <sphereGeometry args={[2.8, 4, 18, (Math.PI / 3) * i, Math.PI / 3]} />
          <meshStandardMaterial color={col} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Top knot */}
      <mesh position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
      {/* Ropes */}
      {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([x, z], i) => (
        <mesh key={i} position={[x * 1.1, -2.0, z * 1.1]} rotation={[x * 0.35, 0, z * 0.35]}>
          <cylinderGeometry args={[0.03, 0.03, 2.5, 4]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
      ))}
      {/* Basket */}
      <mesh position={[0, -3.4, 0]}>
        <boxGeometry args={[1.5, 0.9, 1.5]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>
      {/* Flame glow inside basket neck */}
      <mesh position={[0, -2.2, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#ff6b00" emissive="#ff4500" emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0, -2.2, 0]} intensity={3} distance={6} color="#ff8c00" />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────
   WINDMILL — proper animated blades
───────────────────────────────────────────────────────── */
function Windmill({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  const bladesRef = useRef<THREE.Group>(null!);
  const spd = useMemo(() => 0.5 + Math.random() * 0.6, []);
  useFrame(({ clock }) => {
    bladesRef.current.rotation.z = -clock.getElapsedTime() * spd;
  });
  return (
    <group position={position} scale={s}>
      {/* Tower */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.6, 4.4, 8]} />
        <meshStandardMaterial color="#d4b86a" roughness={0.6} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 4.6, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.7, 8]} />
        <meshStandardMaterial color="#b8893e" roughness={0.5} />
      </mesh>
      {/* Hub */}
      <mesh position={[0, 4.62, 0.55]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#6b4e1a" roughness={0.5} />
      </mesh>
      {/* Spinning blades */}
      <group ref={bladesRef} position={[0, 4.62, 0.6]}>
        {[0, 1, 2, 3].map(i => (
          <group key={i} rotation={[0, 0, (Math.PI / 2) * i]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.22, 2.5, 0.06]} />
              <MeshWobbleMaterial
                factor={0.08} speed={1.5}
                color="#f0e8cc" roughness={0.5}
              />
            </mesh>
            {/* Blade tip */}
            <mesh position={[0, 2.8, 0]}>
              <boxGeometry args={[0.12, 0.4, 0.05]} />
              <meshStandardMaterial color="#d4c49a" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Door */}
      <mesh position={[0, 0.7, 0.62]}>
        <boxGeometry args={[0.55, 1.4, 0.06]} />
        <meshStandardMaterial color="#5d3a1a" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────
   BANK BUILDING — grande, neoclassical
───────────────────────────────────────────────────────── */
function BankBuilding({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={0.8} rotationIntensity={0} floatIntensity={0.4} floatingRange={[0, 0.12]}>
      <group position={position}>
        {/* Steps */}
        <mesh receiveShadow>
          <boxGeometry args={[8.0, 0.3, 7.4]} />
          <meshStandardMaterial color="#e8dfc8" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.22, 0]} receiveShadow>
          <boxGeometry args={[7.2, 0.22, 6.6]} />
          <meshStandardMaterial color="#f0e8d4" roughness={0.6} />
        </mesh>
        {/* Body */}
        <mesh position={[0, 3.0, 0]} castShadow>
          <boxGeometry args={[6.4, 5.8, 5.6]} />
          <meshStandardMaterial color="#f5f0dc" roughness={0.35} />
        </mesh>
        {/* Cornice */}
        <mesh position={[0, 6.05, 0]}>
          <boxGeometry args={[7.0, 0.38, 6.2]} />
          <meshStandardMaterial color="#dcd5bb" roughness={0.5} />
        </mesh>
        {/* Roof deck */}
        <mesh position={[0, 6.55, 0]} castShadow>
          <boxGeometry args={[6.0, 0.8, 5.2]} />
          <meshStandardMaterial color="#154785" roughness={0.35} metalness={0.2} />
        </mesh>
        {/* Dome */}
        <mesh position={[0, 7.8, 0]} castShadow>
          <sphereGeometry args={[1.6, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0d3b6e" roughness={0.25} metalness={0.45} />
        </mesh>
        {/* Dome ring */}
        <mesh position={[0, 7.2, 0]}>
          <cylinderGeometry args={[1.65, 1.65, 0.2, 22]} />
          <meshStandardMaterial color="#1a5276" roughness={0.3} metalness={0.3} />
        </mesh>
        {/* Finial — glows with bloom */}
        <mesh position={[0, 9.38, 0]}>
          <cylinderGeometry args={[0.1, 0.2, 0.6, 8]} />
          <meshStandardMaterial
            color="#ffd700" metalness={0.97} roughness={0.03}
            emissive="#ffcc00" emissiveIntensity={1.2}
          />
        </mesh>
        <mesh position={[0, 9.75, 0]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial color="#ffd700" metalness={0.97} roughness={0.03} emissive="#ffcc00" emissiveIntensity={1.5} />
        </mesh>
        {/* Columns */}
        {([-2.4, -0.8, 0.8, 2.4] as const).map((x, i) => (
          <group key={i}>
            <mesh position={[x, 3.0, 3.12]} castShadow>
              <cylinderGeometry args={[0.27, 0.31, 5.8, 12]} />
              <meshStandardMaterial color="#f0e8d0" roughness={0.45} />
            </mesh>
            {/* Capital */}
            <mesh position={[x, 6.02, 3.12]}>
              <boxGeometry args={[0.7, 0.28, 0.7]} />
              <meshStandardMaterial color="#e8dfc8" roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* Pediment triangle */}
        <mesh position={[0, 6.55, 3.15]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3.8, 1.2, 4]} />
          <meshStandardMaterial color="#dcd5bb" roughness={0.5} />
        </mesh>
        {/* Door */}
        <mesh position={[0, 1.4, 3.13]}>
          <boxGeometry args={[1.15, 2.8, 0.1]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.65} />
        </mesh>
        <mesh position={[0, 2.92, 3.13]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.575, 0.575, 0.1, 14, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.65} />
        </mesh>
        {/* Windows — emissive yellow (bloom picks up) */}
        {([-2.4, 2.4] as const).map((x, i) => (
          <mesh key={i} position={[x, 3.6, 3.14]}>
            <boxGeometry args={[0.95, 1.35, 0.08]} />
            <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.9} />
          </mesh>
        ))}
        {/* BANK sign */}
        <mesh position={[0, 5.3, 3.15]}>
          <boxGeometry args={[3.4, 0.58, 0.08]} />
          <meshStandardMaterial color="#1a3a6b" roughness={0.28} />
        </mesh>
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────────────────
   HOUSE — charming residential with garden
───────────────────────────────────────────────────────── */
function HouseBuilding({
  position, color, roofColor, s = 1,
}: {
  position: [number, number, number]; color: string; roofColor: string; s?: number;
}) {
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  return (
    <Float speed={0.7 + Math.random() * 0.3} rotationIntensity={0} floatIntensity={0.3} floatingRange={[0, 0.1]}>
      <group position={position} scale={s}>
        {/* Foundation */}
        <mesh receiveShadow>
          <boxGeometry args={[5.4, 0.25, 5.4]} />
          <meshStandardMaterial color="#c4a882" roughness={0.7} />
        </mesh>
        {/* Body */}
        <mesh position={[0, 2.12, 0]} castShadow>
          <boxGeometry args={[4.8, 4.0, 4.8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 4.5, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3.75, 2.8, 4]} />
          <meshStandardMaterial color={roofColor} roughness={0.58} />
        </mesh>
        {/* Gable trim */}
        {([0, Math.PI / 2] as const).map((ry, i) => (
          <mesh key={i} position={[0, 4.0, i === 0 ? 2.45 : 0]} rotation={[0, ry, 0]}>
            <boxGeometry args={[4.82, 0.18, 0.1]} />
            <meshStandardMaterial color="#f0f0e8" roughness={0.6} />
          </mesh>
        ))}
        {/* Chimney */}
        <mesh position={[1.4, 5.2, -0.9]} castShadow>
          <boxGeometry args={[0.62, 1.9, 0.62]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.8} />
        </mesh>
        <mesh position={[1.4, 6.17, -0.9]}>
          <boxGeometry args={[0.78, 0.14, 0.78]} />
          <meshStandardMaterial color="#795548" roughness={0.75} />
        </mesh>
        {/* Door */}
        <mesh position={[0, 1.05, 2.45]}>
          <boxGeometry args={[0.92, 2.1, 0.08]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.65} />
        </mesh>
        <mesh position={[0, 2.17, 2.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.08, 12, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.65} />
        </mesh>
        {/* Knocker */}
        <mesh position={[0.28, 1.05, 2.5]}>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.08} emissive="#ffd700" emissiveIntensity={0.5} />
        </mesh>
        {/* Windows — emissive */}
        {([-1.65, 1.65] as const).map((x, i) => (
          <group key={i}>
            <mesh position={[x, 2.4, 2.46]}>
              <boxGeometry args={[0.9, 1.05, 0.07]} />
              <meshStandardMaterial color="#fef9c3" emissive="#fbbf24" emissiveIntensity={0.65} />
            </mesh>
            {/* Cross divider */}
            <mesh position={[x, 2.4, 2.5]}>
              <boxGeometry args={[0.07, 1.05, 0.04]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[x, 2.4, 2.5]}>
              <boxGeometry args={[0.9, 0.07, 0.04]} />
              <meshStandardMaterial color="white" />
            </mesh>
            {/* Sill */}
            <mesh position={[x, 1.85, 2.5]}>
              <boxGeometry args={[1.05, 0.1, 0.14]} />
              <meshStandardMaterial color="#e8dfc8" roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* Fence */}
        {Array.from({ length: 10 }, (_, i) => (i - 4.5) * 0.55).map((x, i) => (
          <mesh key={i} position={[x, 0.48, 2.9]} castShadow>
            <boxGeometry args={[0.11, 0.95, 0.11]} />
            <meshStandardMaterial color="#f5f5f0" roughness={0.55} />
          </mesh>
        ))}
        <mesh position={[0, 0.85, 2.9]}>
          <boxGeometry args={[5.5, 0.1, 0.11]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.55} />
        </mesh>
        {/* Garden flowers */}
        {[[-1.8, color], [1.8, roofColor]].map(([x, col], i) => (
          <mesh key={i} position={[x as number, 0.22, 3.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.35, 8]} />
            <meshStandardMaterial color={col as string} roughness={0.6} emissive={col as string} emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────────────────
   HOSPITAL — clean, authoritative
───────────────────────────────────────────────────────── */
function HospitalBuilding({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={0.6} rotationIntensity={0} floatIntensity={0.35} floatingRange={[0, 0.1]}>
      <group position={position}>
        <mesh receiveShadow>
          <boxGeometry args={[6.8, 0.26, 6.2]} />
          <meshStandardMaterial color="#d0cfc8" roughness={0.65} />
        </mesh>
        {/* Main body */}
        <mesh position={[0, 3.1, 0]} castShadow>
          <boxGeometry args={[6.0, 6.2, 5.6]} />
          <meshStandardMaterial color="#ecf0f1" roughness={0.38} />
        </mesh>
        {/* Flat roof */}
        <mesh position={[0, 6.35, 0]} castShadow>
          <boxGeometry args={[6.3, 0.42, 5.9]} />
          <meshStandardMaterial color="#bdc3c7" roughness={0.42} />
        </mesh>
        {/* Parapet */}
        <mesh position={[0, 6.7, 0]}>
          <boxGeometry args={[6.6, 0.6, 6.2]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.5} />
        </mesh>
        {/* Illuminated red cross — heavy bloom pickup */}
        <mesh position={[0, 4.0, 2.84]}>
          <boxGeometry args={[0.72, 2.6, 0.1]} />
          <meshStandardMaterial color="#e53935" emissive="#c62828" emissiveIntensity={1.5} roughness={0.2} />
        </mesh>
        <mesh position={[0, 4.0, 2.84]}>
          <boxGeometry args={[2.6, 0.72, 0.1]} />
          <meshStandardMaterial color="#e53935" emissive="#c62828" emissiveIntensity={1.5} roughness={0.2} />
        </mesh>
        {/* Windows grid */}
        {([-2.0, 2.0] as const).flatMap(x =>
          ([1.8, 3.6] as const).map(y => ({ x, y }))
        ).map(({ x, y }, i) => (
          <mesh key={i} position={[x, y, 2.85]}>
            <boxGeometry args={[0.95, 1.1, 0.08]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fbbf24" emissiveIntensity={0.6} />
          </mesh>
        ))}
        {/* Door */}
        <mesh position={[0, 0.92, 2.84]}>
          <boxGeometry args={[1.25, 1.84, 0.08]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.65} />
        </mesh>
        {/* Ambulance bay overhang */}
        <mesh position={[0, 2.2, 3.3]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[4.2, 0.14, 1.4]} />
          <meshStandardMaterial color="#bdc3c7" roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────────────────
   SHOP — colourful market stall vibe
───────────────────────────────────────────────────────── */
function ShopBuilding({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={0.75} rotationIntensity={0} floatIntensity={0.38} floatingRange={[0, 0.12]}>
      <group position={position}>
        <mesh receiveShadow>
          <boxGeometry args={[5.4, 0.22, 5.0]} />
          <meshStandardMaterial color="#a08060" roughness={0.75} />
        </mesh>
        {/* Body */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[4.6, 4.4, 4.4]} />
          <meshStandardMaterial color={color} roughness={0.48} />
        </mesh>
        {/* Parapet */}
        <mesh position={[0, 4.55, 0]} castShadow>
          <boxGeometry args={[5.0, 0.48, 4.8]} />
          <meshStandardMaterial color="#c97d30" roughness={0.45} />
        </mesh>
        {/* Striped awning */}
        <mesh position={[0, 2.8, 2.5]} rotation={[0.38, 0, 0]}>
          <boxGeometry args={[4.4, 0.12, 1.55]} />
          <meshStandardMaterial color="#dc2626" roughness={0.48} />
        </mesh>
        {[-1.6, -0.55, 0.55, 1.6].map((x, i) => (
          <mesh key={i} position={[x, 2.81, 2.52]} rotation={[0.38, 0, 0]}>
            <boxGeometry args={[0.18, 0.13, 1.55]} />
            <meshStandardMaterial color="white" roughness={0.5} />
          </mesh>
        ))}
        {/* Display window glow */}
        <mesh position={[0, 1.75, 2.26]}>
          <boxGeometry args={[2.8, 1.6, 0.08]} />
          <meshStandardMaterial color="#fef9c3" emissive="#fbbf24" emissiveIntensity={0.7} />
        </mesh>
        {/* Products in window (tiny cubes) */}
        {[-0.7, 0, 0.7].map((x, i) => (
          <mesh key={i} position={[x, 1.7, 2.32]}>
            <boxGeometry args={[0.35, 0.45, 0.08]} />
            <meshStandardMaterial color={['#ef4444','#3b82f6','#10b981'][i]} roughness={0.5} emissive={['#ef4444','#3b82f6','#10b981'][i]} emissiveIntensity={0.4} />
          </mesh>
        ))}
        {/* Door */}
        <mesh position={[0, 0.82, 2.26]}>
          <boxGeometry args={[1.0, 1.64, 0.08]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.65} />
        </mesh>
        {/* Hanging sign */}
        <mesh position={[0, 3.7, 2.4]}>
          <boxGeometry args={[2.0, 0.5, 0.08]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.4} emissive="#fbbf24" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────────────────
   BIRDS — simple animated Vs flying across sky
───────────────────────────────────────────────────────── */
function Birds({ count = 5, height = 16, speed = 0.8, xOffset = 0 }: {
  count?: number; height?: number; speed?: number; xOffset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const startZ   = useMemo(() => -40 - Math.random() * 10, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    groupRef.current.position.z = ((startZ + t * speed * 4) % 80) - 40;
    groupRef.current.position.y = height + Math.sin(t * 0.4) * 0.8;
  });
  return (
    <group ref={groupRef} position={[xOffset, height, startZ]}>
      {Array.from({ length: count }, (_, i) => {
        const x = (i - Math.floor(count / 2)) * 2.2;
        const y = Math.abs(i - Math.floor(count / 2)) * 0.5;
        return (
          <mesh key={i} position={[x, -y, i * 0.8]}>
            <torusGeometry args={[0.55, 0.06, 4, 6, Math.PI]} />
            <meshStandardMaterial color="#374151" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────
   POST PROCESSING
───────────────────────────────────────────────────────── */
function PostProcessing() {
  return (
    <EffectComposer multisampling={4}>
      {/* Bloom — makes emissive materials glow */}
      <Bloom
        intensity={1.4}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.72}
      />
      {/* Depth of field — foreground sharp, far buildings blur */}
      <DepthOfField
        focusDistance={0.018}
        focalLength={0.055}
        bokehScale={2.8}
        height={720}
      />
      {/* Vignette — cinematic dark corners */}
      <Vignette
        offset={0.28}
        darkness={0.62}
        blendFunction={BlendFunction.NORMAL}
      />
      {/* Very subtle chromatic aberration */}
      <ChromaticAberration
        offset={[0.0006, 0.0006] as any}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}

/* ─────────────────────────────────────────────────────────
   FULL SCENE
───────────────────────────────────────────────────────── */
function TownScene() {
  const coins: Array<{ pos: [number, number, number]; sp: number; ph: number }> = [
    { pos: [-17, 3.5, -17], sp: 0.55, ph: 0.0 },
    { pos: [17,  4.0, -17], sp: 0.68, ph: 1.2 },
    { pos: [-17, 3.2,  17], sp: 0.60, ph: 2.4 },
    { pos: [17,  3.7,  17], sp: 0.78, ph: 0.8 },
    { pos: [-10, 4.5, -22], sp: 0.50, ph: 3.1 },
    { pos: [10,  4.8, -22], sp: 0.63, ph: 1.8 },
    { pos: [0,   5.0, -24], sp: 0.70, ph: 2.2 },
    { pos: [-22, 4.2,   0], sp: 0.58, ph: 0.5 },
    { pos: [22,  4.0,   0], sp: 0.65, ph: 2.8 },
    { pos: [-10, 3.8,  22], sp: 0.55, ph: 1.5 },
    { pos: [10,  4.1,  22], sp: 0.73, ph: 3.5 },
    { pos: [0,   4.6,  24], sp: 0.60, ph: 0.3 },
    { pos: [-24, 3.5, -10], sp: 0.62, ph: 1.0 },
    { pos: [24,  3.8, -10], sp: 0.57, ph: 2.0 },
    { pos: [-24, 4.0,  10], sp: 0.66, ph: 3.0 },
    { pos: [24,  3.6,  10], sp: 0.72, ph: 0.6 },
  ];

  const trees: Array<{ p: [number, number, number]; s: number }> = [
    ...[[-18,0,-18],[-10,0,-21],[0,0,-21],[10,0,-21],[18,0,-18],
        [21,0,-10],[21,0,0],[21,0,10],[18,0,18],[10,0,21],
        [0,0,21],[-10,0,21],[-18,0,18],[-21,0,10],[-21,0,0],[-21,0,-10]]
      .map(p => ({ p: p as [number,number,number], s: 0.75 + Math.random() * 0.25 })),
    // Corner clusters
    ...[[-16,0,-16],[-14,0,-18],[-18,0,-14],[16,0,-16],[14,0,-18],[18,0,-14],
        [-16,0,16],[-14,0,18],[-18,0,14],[16,0,16],[14,0,18],[18,0,14]]
      .map(p => ({ p: p as [number,number,number], s: 0.6 + Math.random() * 0.2 })),
    // Between-plot trees
    ...[[-8,0,0],[8,0,0],[0,0,-8],[0,0,8],
        [-8,0,-8],[8,0,-8],[-8,0,8],[8,0,8],
        [-4,0,-14],[4,0,-14],[-14,0,-4],[14,0,-4],
        [-4,0,14],[4,0,14],[-14,0,4],[14,0,4]]
      .map(p => ({ p: p as [number,number,number], s: 0.58 + Math.random() * 0.18 })),
  ];

  const lamps: Array<[number,number,number]> = [
    [-4,0,-4],[4,0,-4],[-4,0,4],[4,0,4],
    [-9,0,-4],[9,0,-4],[-9,0,4],[9,0,4],
    [-4,0,-9],[4,0,-9],[-4,0,9],[4,0,9],
    [-14,0,-4],[14,0,-4],[-14,0,4],[14,0,4],
    [-4,0,-14],[4,0,-14],[-4,0,14],[4,0,14],
  ];

  return (
    <>
      {/* ── Photorealistic sky with Rayleigh scattering ── */}
      <Sky
        distance={4500}
        sunPosition={[100, 20, -100]}
        inclination={0.52}
        azimuth={0.28}
        turbidity={6}
        rayleigh={0.6}
        mieCoefficient={0.004}
        mieDirectionalG={0.8}
      />

      {/* ── Star field visible near horizon ── */}
      <Stars radius={120} depth={55} count={1200} factor={4} fade speed={0.3} />

      {/* ── Atmospheric fog ── */}
      <fog attach="fog" args={['#c9dff5', 32, 72]} />

      {/* ── Lighting ── */}
      <ambientLight intensity={0.55} color="#ffe4c4" />
      <directionalLight
        position={[20, 30, 15]} intensity={1.6} color="#fff8e8" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={90} shadow-camera-near={0.5}
        shadow-camera-left={-35} shadow-camera-right={35}
        shadow-camera-top={35}  shadow-camera-bottom={-35}
        shadow-bias={-0.0004}
      />
      {/* Warm fill from ground bounce */}
      <hemisphereLight args={['#87ceeb', '#4a7a30', 0.4]} />
      {/* Rim light from opposite side — golden hour */}
      <directionalLight position={[-15, 8, -20]} intensity={0.45} color="#ffb347" />

      {/* ── Global sparkle field ── */}
      <Sparkles
        count={180} scale={50} size={2.2} speed={0.25}
        color="#ffd700" opacity={0.55}
        position={[0, 6, 0]}
      />
      {/* Lower dense sparkles around the town */}
      <Sparkles
        count={120} scale={28} size={3.5} speed={0.4}
        color="#ffe082" opacity={0.7}
        position={[0, 3, 0]}
      />

      {/* ── Drei volumetric clouds ── */}
      <DreiCloud position={[-22, 16, -20]} speed={0.3} opacity={0.65} />
      <DreiCloud position={[20,  18, -24]} speed={0.2} opacity={0.5}  />
      <DreiCloud position={[-12, 14,  22]} speed={0.35} opacity={0.6} />
      <DreiCloud position={[24,  15,  14]} speed={0.28} opacity={0.55} />
      <DreiCloud position={[0,   20, -30]} speed={0.18} opacity={0.45} />
      <DreiCloud position={[-30, 12,   5]} speed={0.32} opacity={0.5}  />

      <Ground />
      <Fountain />

      {/* ── 4 Landmark buildings on cardinal plots ── */}
      <BankBuilding    position={[0, 0, -12]} />
      <HouseBuilding   position={[-12, 0, 0]}  color="#e74c3c" roofColor="#7f1010" />
      <HospitalBuilding position={[12, 0, 0]} />
      <ShopBuilding    position={[0, 0, 12]}   color="#f59e0b" />

      {/* ── 4 Corner buildings ── */}
      <HouseBuilding position={[-12, 0, -12]} color="#3b82f6"  roofColor="#1e3a8a" s={0.72} />
      <HouseBuilding position={[ 12, 0, -12]} color="#8b5cf6"  roofColor="#4c1d95" s={0.72} />
      <ShopBuilding  position={[-12, 0,  12]} color="#0d9488" />
      <HouseBuilding position={[ 12, 0,  12]} color="#16a34a"  roofColor="#14532d" s={0.72} />

      {/* ── Far background buildings ── */}
      <HouseBuilding position={[-27, 0, -23]} color="#ea580c" roofColor="#9a3412" s={0.55} />
      <HouseBuilding position={[ 27, 0, -23]} color="#d97706" roofColor="#92400e" s={0.5}  />
      <HouseBuilding position={[-27, 0,  23]} color="#6366f1" roofColor="#312e81" s={0.48} />
      <HouseBuilding position={[ 27, 0,  23]} color="#059669" roofColor="#064e3b" s={0.52} />
      <HouseBuilding position={[  0, 0, -30]} color="#dc2626" roofColor="#7f1d1d" s={0.44} />
      <HouseBuilding position={[  0, 0,  30]} color="#0891b2" roofColor="#164e63" s={0.44} />
      <ShopBuilding  position={[-28, 0,   0]} color="#c026d3" />
      <ShopBuilding  position={[ 28, 0,   0]} color="#16a34a" />

      {/* ── Windmills ── */}
      <Windmill position={[-25, 0,  3]} s={0.9} />
      <Windmill position={[ 25, 0,  3]} s={0.9} />
      <Windmill position={[  3, 0, -27]} s={0.8} />
      <Windmill position={[ -3, 0,  27]} s={0.75} />

      {/* ── Trees ── */}
      {trees.map(({ p, s }, i) => <Tree key={i} position={p} s={s} />)}

      {/* ── Lamp posts ── */}
      {lamps.map((pos, i) => <LampPost key={i} position={pos} />)}

      {/* ── Floating golden coins ── */}
      {coins.map((c, i) => (
        <FloatingCoin key={i} startPos={c.pos} speed={c.sp} phase={c.ph} />
      ))}

      {/* ── Hot air balloons 🎈 ── */}
      <HotAirBalloon position={[-18, 22, -18]} />
      <HotAirBalloon position={[ 22, 26,  10]} />

      {/* ── Birds ── */}
      <Birds count={5} height={18} speed={0.9} xOffset={-8} />
      <Birds count={4} height={21} speed={0.7} xOffset={12} />
      <Birds count={6} height={15} speed={1.1} xOffset={0}  />

      {/* ── Post processing ── */}
      <PostProcessing />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   EXPORT — pure passive background
   pointerEvents: 'none' → zero interaction with board game
───────────────────────────────────────────────────────── */
export function Town3D() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',   // ← never steals clicks
      }}
      camera={{ position: [0, 16, 26], fov: 48, near: 0.5, far: 200 }}
      shadows="soft"
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={[1, 1.5]}   // cap pixel ratio for perf
    >
      <Suspense fallback={null}>
        <TownScene />
      </Suspense>
    </Canvas>
  );
}