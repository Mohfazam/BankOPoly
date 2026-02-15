import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import BankBuilding from './BankBuilding';
import EmptyPlotGrid from './EmptyPlotGrid';
import GameHUD from './GameHUD';

function Scene() {
  return (
    <>
      {/* Professional lighting setup - warm sunlight */}
      <ambientLight intensity={0.65} color={0xffffff} />
      
      {/* Main directional light - warm sunlight from upper right */}
      <directionalLight 
        position={[20, 22, 15]} 
        intensity={1.1}
        color={0xfffacd}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={80}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light - subtle blue shadow fill */}
      <directionalLight 
        position={[-12, 10, -15]} 
        intensity={0.35}
        color={0x87CEEB}
      />

      {/* Warm rim light */}
      <directionalLight 
        position={[15, 8, -20]} 
        intensity={0.25}
        color={0xffa500}
      />
      
      {/* Sky-blue background */}
      <color attach="background" args={['#87CEEB']} />
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#B0D9FF', 30, 65]} />
      
      {/* Large ground plane - natural grass green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial 
          color="#558B55"
          roughness={0.95}
        />
      </mesh>
      
      {/* Bank - central focal point */}
      <BankBuilding />
      
      {/* Town grid with roads, plots, and decorative elements */}
      <EmptyPlotGrid />
    </>
  );
}

export default function TownMap() {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Canvas 
        camera={{ 
          position: [18, 16, 18],  // Perfect isometric 45-degree angle
          fov: 48,
          near: 0.1,
          far: 180
        }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <GameHUD />
    </div>
  );
}
