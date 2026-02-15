import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import BankBuilding from './BankBuilding';
import EmptyPlotGrid from './EmptyPlotGrid';
import GameHUD from './GameHUD';

function Scene() {
  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.75} />
      <directionalLight 
        position={[15, 18, 15]} 
        intensity={1.0} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <directionalLight position={[-10, 12, -10]} intensity={0.4} />
      
      {/* Sky gradient effect with blue background */}
      <color attach="background" args={['#87CEEB']} />
      
      {/* Fog to hide far edges */}
      <fog attach="fog" args={['#87CEEB', 25, 50]} />
      
      {/* Large ground plane - darker green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#4A7A4A" />
      </mesh>
      
      {/* Bank - central building */}
      <BankBuilding />
      
      {/* Town grid with roads, plots, and decorations */}
      <EmptyPlotGrid />
    </>
  );
}

export default function TownMap() {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Canvas 
        camera={{ 
          position: [16, 14, 16],  // Optimized isometric perspective
          fov: 50,
          near: 0.1,
          far: 150
        }}
        shadows
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <GameHUD />
    </div>
  );
}
