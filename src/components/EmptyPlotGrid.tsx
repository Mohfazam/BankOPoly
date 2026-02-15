import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface EmptyPlotGridProps {
  position?: [number, number, number];
}

// Road tiles - the pathways between buildings
function RoadTile({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={[pos[0], 0, pos[2]]}>
      {/* Road surface - gray asphalt */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[4, 0.15, 4]} />
        <meshStandardMaterial 
          color="#8B8B7F"
          roughness={0.9}
        />
      </mesh>

      {/* Road line markings */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[3.8, 0.01, 0.2]} />
        <meshBasicMaterial color="#FFFF99" />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.2, 0.01, 3.8]} />
        <meshBasicMaterial color="#FFFF99" />
      </mesh>
    </group>
  );
}

// Decorative grass patches with variation
function GrassPatch({ pos, variant = 0 }: { pos: [number, number, number]; variant?: number }) {
  const colors = ['#6BCD59', '#5CBD4F', '#7BDD69'];
  const color = colors[variant % colors.length];

  return (
    <group position={[pos[0], 0, pos[2]]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4, 0.15, 4]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.8}
        />
      </mesh>

      {/* Grass highlights */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[3.9, 0.01, 3.9]} />
        <meshStandardMaterial color={`${color}DD`} />
      </mesh>
    </group>
  );
}

// BuildablePlot - interactive tiles where players can build
function PlotTile({ pos }: { pos: [number, number, number]; id: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) {
      const target = hovered ? 0.25 : 0;
      groupRef.current.position.y += (target - groupRef.current.position.y) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[pos[0], 0, pos[2]]}>
      {/* Base - darker green foundation */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.15, 4.2]} />
        <meshStandardMaterial color="#5A8A5A" />
      </mesh>

      {/* Main grass surface - interactive */}
      <mesh 
        castShadow 
        receiveShadow 
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        position={[0, 0.08, 0]}
      >
        <boxGeometry args={[4, 0.15, 4]} />
        <meshStandardMaterial 
          color={hovered ? "#A8E6A1" : "#7EBD6B"}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Highlight stripe */}
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[3.8, 0.01, 3.8]} />
        <meshStandardMaterial color="#9FE88F" />
      </mesh>

      {/* Corner pegs */}
      {[
        [-1.95, 0.1, -1.95],
        [1.95, 0.1, -1.95],
        [-1.95, 0.1, 1.95],
        [1.95, 0.1, 1.95]
      ].map((cornerPos, i) => (
        <mesh key={i} position={cornerPos as [number, number, number]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 8]} />
          <meshStandardMaterial color="#6B8E6B" />
        </mesh>
      ))}

      {/* Hover effects */}
      {hovered && (
        <>
          {/* Glow ring */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[4.15, 0.01, 4.15]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
          </mesh>
          
          <Html position={[0, 1.2, 0]} center>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                textShadow: '0 0 12px #228B22, 2px 2px 6px rgba(0,0,0,0.6)',
                lineHeight: 1,
                marginBottom: '4px'
              }}>
                +
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: 'bold',
                boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
                border: '2px solid white'
              }}>
                Build Here
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// Tree decoration for aesthetics
function Tree({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={[pos[0], pos[1], pos[2]]}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
        <meshStandardMaterial color="#8B6F47" />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[-0.3, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#2D8C2D" />
      </mesh>
      <mesh position={[0.3, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#2D8C2D" />
      </mesh>
    </group>
  );
}

export default function EmptyPlotGrid({ position = [0, 0, 0] }: EmptyPlotGridProps) {
  const gridSize = 6;
  const spacing = 4.5;
  const centerIdx = Math.floor(gridSize / 2);

  // Build a grid with variety: roads, grass, and buildable plots
  const getTileType = (row: number, col: number): 'plot' | 'road' | 'grass' => {
    // Center is for the bank - return road
    if (row === centerIdx && col === centerIdx) return 'road';
    
    // Create a cross pattern of roads through the middle
    if (row === centerIdx || col === centerIdx) return 'road';
    
    // Buildable plots around the edges
    return 'plot';
  };

  return (
    <group position={position}>
      {/* Expanded ground plane */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[35, 0.1, 35]} />
        <meshStandardMaterial color="#4A7A4A" />
      </mesh>

      {/* Grid tiles */}
      {Array.from({ length: gridSize * gridSize }).map((_, i) => {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const tileType = getTileType(row, col);

        const x = (col - centerIdx) * spacing;
        const z = (row - centerIdx) * spacing;
        const pos: [number, number, number] = [x, 0, z];

        if (tileType === 'road') {
          return <RoadTile key={i} pos={pos} />;
        } else if (tileType === 'grass') {
          return <GrassPatch key={i} pos={pos} variant={i} />;
        } else {
          return <PlotTile key={i} pos={pos} id={i} />;
        }
      })}

      {/* Decorative trees scattered around */}
      <Tree pos={[-8, 0, -8]} />
      <Tree pos={[8, 0, -8]} />
      <Tree pos={[-8, 0, 8]} />
      <Tree pos={[8, 0, 8]} />
      <Tree pos={[0, 0, -10]} />
      <Tree pos={[-10, 0, 0]} />
      <Tree pos={[10, 0, 0]} />
      <Tree pos={[0, 0, 10]} />
    </group>
  );
}
