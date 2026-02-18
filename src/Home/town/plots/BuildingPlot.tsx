import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface BuildingPlotProps {
  plotNum : number;
  px      : number;
  pz      : number;
  size    : number;
}

export default function BuildingPlot({ plotNum, px, pz, size }: BuildingPlotProps) {
  const [hovered, setHovered] = useState(false);
  const glowRef   = useRef<THREE.Mesh>(null!);
  const half      = size / 2;

  useFrame(() => {
    if (!glowRef.current) return;
    const mat = glowRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity           = THREE.MathUtils.lerp(mat.opacity,           hovered ? 0.52 : 0,   0.10);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, hovered ? 0.45 : 0,   0.10);
  });

  return (
    <group position={[px, 0, pz]}>

      {/* ── Grass base ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#58a84e" roughness={0.88} />
      </mesh>

      {/* ── Hover glow overlay (invisible mesh that captures pointer) ── */}
      <mesh
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.018, 0]}
        onPointerEnter={() => { setHovered(true);  document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#fbbf24" emissive="#fbbf24"
          emissiveIntensity={0} transparent opacity={0} roughness={0.4}
        />
      </mesh>

      {/* ── 4 corner marker posts ── */}
      {([[-1,-1],[-1,1],[1,-1],[1,1]] as const).map(([cx,cz], i) => (
        <mesh key={i} position={[cx*(half-0.22), 0.32, cz*(half-0.22)]} castShadow>
          <cylinderGeometry args={[0.09, 0.13, 0.64, 8]} />
          <meshStandardMaterial color="#c8b880" roughness={0.65} />
        </mesh>
      ))}

      {/* ── Perimeter fence rail ── */}
      {[0,1,2,3].map(side => {
        const isH  = side < 2;
        const sign = (side === 0 || side === 2) ? -1 : 1;
        return (
          <mesh key={side}
            position={[isH ? 0 : sign*half, 0.35, isH ? sign*half : 0]}
            rotation={[-Math.PI/2, 0, isH ? 0 : Math.PI/2]}
          >
            <planeGeometry args={[size - 0.28, 0.08]} />
            <meshStandardMaterial color="#e0d4a8" roughness={0.55} />
          </mesh>
        );
      })}

      {/* ── Plot number ground decal ── */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[1.8, 1.1]} />
        <meshStandardMaterial color="#fef9c3" roughness={0.4} opacity={0.8} transparent />
      </mesh>

      {/* ── Hover tooltip ── */}
      {hovered && (
        <Html position={[0, 4.5, 0]} center distanceFactor={14} zIndexRange={[200, 0]}>
          <div style={{
            background   : 'linear-gradient(135deg,#fef9c3,#fef08a)',
            border       : '3px solid #d97706',
            borderRadius : 14,
            padding      : '10px 20px',
            textAlign    : 'center',
            fontFamily   : '"Nunito",system-ui,sans-serif',
            boxShadow    : '0 8px 24px rgba(0,0,0,0.4)',
            whiteSpace   : 'nowrap',
            pointerEvents: 'none',
            animation    : 'plotPop 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{ fontSize: 22, marginBottom: 2 }}>🏗️</div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#92400e', letterSpacing: 1 }}>
              Plot #{plotNum}
            </div>
            <div style={{ fontSize: 11, color: '#a16207', fontWeight: 700, marginTop: 2 }}>
              Empty · Available to build
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}