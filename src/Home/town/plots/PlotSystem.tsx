// PlotSystem.tsx — manages all 8 building plots.
// When a plot is unlocked it plays ConstructionEffect, then shows PlacedHouse.

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGrid } from '../grid/GridManager';
import BuildingPlot from './BuildingPlot';
import ConstructionEffect from './ConstructionEffect';
import { useGameStore } from '../../../Store/useGameStore';

const PLOT_COSTS = [100, 150, 200, 250, 300, 350, 400, 500];

function buildPlots(spacing: number) {
  const offsets = [-1, 0, 1];
  const list: { plotId: string; plotNum: number; px: number; pz: number; cost: number }[] = [];
  let n = 0;
  for (const gx of offsets) {
    for (const gz of offsets) {
      if (gx === 0 && gz === 0) continue;
      list.push({
        plotId : `plot_${n + 1}`,
        plotNum: n + 1,
        px     : gx * spacing,
        pz     : gz * spacing,
        cost   : PLOT_COSTS[n] ?? 200,
      });
      n++;
    }
  }
  return list;
}

// ── Placed house — shown after construction effect finishes ───────────────────
function PlacedHouse({ px, pz }: { px: number; pz: number }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 0.8 + px) * 0.06;
  });
  return (
    <group ref={ref} position={[px, 0, pz]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[6.4, 6.4]} />
        <meshStandardMaterial color="#58a84e" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[4.0, 4.0]} />
        <meshStandardMaterial color="#d4c9a8" roughness={0.75} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[2.8, 2.0, 2.8]} />
        <meshStandardMaterial color="#f9c784" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 2.45, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.1, 1.2, 4]} />
        <meshStandardMaterial color="#e05c2a" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.7, 2.6, 0.7]}>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.6, 1.41]}>
        <boxGeometry args={[0.6, 1.0, 0.08]} />
        <meshStandardMaterial color="#5d3a1a" roughness={0.6} />
      </mesh>
      {([-0.7, 0.7] as const).map((x, i) => (
        <mesh key={i} position={[x, 1.3, 1.41]}>
          <boxGeometry args={[0.5, 0.5, 0.08]} />
          <meshStandardMaterial color="#87CEEB" emissive="#fef08a" emissiveIntensity={0.5} />
        </mesh>
      ))}
      <pointLight position={[0, 1.2, 1.5]} intensity={1.8} distance={6} color="#fde68a" />
    </group>
  );
}

// ── Single plot — decides what to render based on unlock + animation state ────
function PlotSlot({ plotId, plotNum, px, pz, cost, size, isUnlocked }: {
  plotId: string; plotNum: number; px: number; pz: number;
  cost: number; size: number; isUnlocked: boolean;
}) {
  // animating = playing construction effect; done = show house
  const [animating, setAnimating] = useState(false);
  const [showHouse, setShowHouse] = useState(false);

  // When store marks this plot unlocked, start the animation (once)
  const prevUnlocked = useRef(false);
  useFrame(() => {
    if (isUnlocked && !prevUnlocked.current && !animating && !showHouse) {
      prevUnlocked.current = true;
      setAnimating(true);
    }
    // If already unlocked on mount (page reload) just show house immediately
    if (isUnlocked && !prevUnlocked.current) {
      prevUnlocked.current = true;
      setShowHouse(true);
    }
  });

  if (showHouse) return <PlacedHouse px={px} pz={pz} />;

  if (animating) return (
    <ConstructionEffect
      px={px}
      pz={pz}
      onDone={() => { setAnimating(false); setShowHouse(true); }}
    />
  );

  return (
    <BuildingPlot
      plotNum={plotNum}
      px={px}
      pz={pz}
      size={size}
      plotId={plotId}
      cost={cost}
    />
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function PlotSystem() {
  const { PLOT_SIZE, PLOT_SPACING, GRID_OFFSETS } = useGrid();
  const blockSpan         = PLOT_SPACING * 3 + 0.5;
  const unlockedBuildings = useGameStore(s => s.unlockedBuildings);
  const plots             = buildPlots(PLOT_SPACING);

  return (
    <group>
      {/* Green base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[blockSpan, blockSpan]} />
        <meshStandardMaterial color="#4a9642" roughness={0.9} />
      </mesh>
      {/* Paths */}
      {GRID_OFFSETS.map((gz, i) => (
        <mesh key={`ph${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, gz * PLOT_SPACING]}>
          <planeGeometry args={[blockSpan, 0.65]} />
          <meshStandardMaterial color="#c8b880" roughness={0.82} />
        </mesh>
      ))}
      {GRID_OFFSETS.map((gx, i) => (
        <mesh key={`pv${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[gx * PLOT_SPACING, 0.007, 0]}>
          <planeGeometry args={[0.65, blockSpan]} />
          <meshStandardMaterial color="#c8b880" roughness={0.82} />
        </mesh>
      ))}
      {/* Plots */}
      {plots.map(({ plotId, plotNum, px, pz, cost }) => (
        <PlotSlot
          key={plotId}
          plotId={plotId}
          plotNum={plotNum}
          px={px}
          pz={pz}
          cost={cost}
          size={PLOT_SIZE}
          isUnlocked={unlockedBuildings.includes(plotId)}
        />
      ))}
    </group>
  );
}
