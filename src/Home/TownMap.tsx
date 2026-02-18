/**
 * TownMap.tsx  — Bankopoly Home Screen
 *
 * Layout (top-down):
 *
 *   ┌─────────────────────────────────┐
 *   │        outer town               │  ← HouseBuilding / ShopBuilding / Windmill
 *   │   ┌───road────────road───┐      │
 *   │   │  [P1] [P2] [P3]     │      │
 *   │ road  [P4][BANK][P5]  road      │  ← 3×3 plot grid, bank at centre
 *   │   │  [P6] [P7] [P8]     │      │
 *   │   └───road────────road───┘      │
 *   │        outer town               │
 *   └─────────────────────────────────┘
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  EffectComposer, Bloom, Vignette, ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import { GridProvider } from './town/grid/GridManager';
import GrassTile from './tiles/GrassTile';
import RoadSystem from './roads/RoadSystem';
import PlotSystem from './town/plots/PlotSystem';
import BankBuilding from './BankBuilding';
import DecorationSystem from './decorations/DecorationSystem';
import AmbientEffects from './effects/AmbientEffects';
import CameraController from './effects/CameraController';
import GameHUD from './GameHUD';

// ── Post-processing — NO DepthOfField (no blur) ───────────────────────────────
function PostProcessing() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={1.35}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.72}
      />
      <Vignette offset={0.28} darkness={0.52} blendFunction={BlendFunction.NORMAL} />
      <ChromaticAberration
        offset={[0.0004, 0.0004] as any}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}

// ── 3-D scene — everything inside Canvas ─────────────────────────────────────
function TownScene() {
  return (
    <GridProvider>
      {/* Atmosphere: sky, stars, fog, sparkles, clouds, coins, balloons, birds */}
      <AmbientEffects />

      {/* Ground */}
      <GrassTile />

      {/* Roads (4 roads + intersections + crosswalks + sidewalks) */}
      <RoadSystem />

      {/* 3×3 plot grid (internal paths + 8 empty plots) */}
      <PlotSystem />

      {/* Bank building at grid centre (0,0) */}
      <BankBuilding />

      {/* Street lamps, benches, hedges, parking meters,
          trees, windmills, outer-town buildings */}
      <DecorationSystem />

      {/* Post-processing FX */}
      <PostProcessing />

      {/* Isometric 2.5D camera — drag to rotate, scroll to zoom */}
      <CameraController />
    </GridProvider>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function TownMap() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas
        shadows="soft"
        dpr={[1, 1.5]}
        camera={{ position: [20, 22, 20], fov: 44, near: 0.5, far: 220 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <TownScene />
        </Suspense>
      </Canvas>

      {/* HUD overlay (top bar + bottom hint) — outside Canvas */}
      <GameHUD />
    </div>
  );
}