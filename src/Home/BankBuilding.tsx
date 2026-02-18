import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

export default function BankBuilding() {
  const [hovered, setHovered] = useState(false);
  const buildingRef = useRef<THREE.Group>(null!);
  const navigate = useNavigate();

  useFrame(() => {
    if (!buildingRef.current) return;
    buildingRef.current.position.y = THREE.MathUtils.lerp(
      buildingRef.current.position.y, hovered ? 0.25 : 0, 0.10,
    );
  });

  const h = (a: string, b: string) => hovered ? a : b;

  return (
    <Float speed={0.9} rotationIntensity={0} floatIntensity={0.25} floatingRange={[0, 0.08]}>
      <group
        ref={buildingRef}
        onClick={e => { e.stopPropagation(); navigate('/board'); }}
        onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        {/* ── Hover tooltip (matching plot style) ── */}
        {hovered && (
          <Html position={[0, 5.5, 0]} center distanceFactor={10} zIndexRange={[200, 0]}>
            <div style={{
              background: 'linear-gradient(135deg,#fef9c3,#fef08a)',
              border: '3px solid #d97706',
              borderRadius: 14,
              padding: '10px 20px',
              textAlign: 'center',
              fontFamily: '"Nunito",system-ui,sans-serif',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              animation: 'plotPop 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <div style={{ fontSize: 22, marginBottom: 2 }}>🏦</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#92400e', letterSpacing: 1 }}>
                BANKOPOLY BANK
              </div>
              <div style={{ fontSize: 11, color: '#a16207', fontWeight: 700, marginTop: 2 }}>
                Click to play the game!
              </div>
            </div>
          </Html>
        )}

        {/* ── Foundation ── */}
        <mesh receiveShadow>
          <boxGeometry args={[5.0, 0.2, 5.0]} />
          <meshStandardMaterial color="#d4a574" roughness={0.7} />
        </mesh>

        {/* ── Main building body (BLUE) ── */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[4.5, 3.2, 4.5]} />
          <meshStandardMaterial color={h('#2B6EB0', '#1A4B7A')} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* ── Roof base (darker blue) ── */}
        <mesh position={[0, 3.4, 0]} castShadow>
          <boxGeometry args={[4.8, 0.35, 4.8]} />
          <meshStandardMaterial color="#0A2F5A" roughness={0.5} />
        </mesh>

        {/* ── Roof center platform (gold) ── */}
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[2.2, 0.15, 2.2]} />
          <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.5} emissive="#FFA500" emissiveIntensity={0.3} />
        </mesh>

        {/* ── Large golden dollar sign ($) on roof ── */}
        <Text
          position={[0, 3.8, 0]}
          fontSize={1.4}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          $
        </Text>

        {/* ── BANK sign on front facade ── */}
        <group position={[0, 2.8, 2.3]}>
          {/* Sign board background */}
          <mesh>
            <boxGeometry args={[2.2, 0.6, 0.15]} />
            <meshStandardMaterial color="#8B4513" roughness={0.5} />
          </mesh>
          
          {/* Gold trim */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[2.3, 0.7, 0.05]} />
            <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.2} />
          </mesh>
          
          {/* "BANK" text */}
          <Text
            position={[0, 0, 0.12]}
            fontSize={0.45}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            BANK
          </Text>
        </group>

        {/* ── Front facade - 4 windows (2x2 grid) ── */}
        {([-1.0, 1.0] as const).map((x, i) => (
          <group key={`col-${i}`}>
            {([1.0, 0.0] as const).map(( j) => (
              <mesh key={`window-${i}-${j}`} position={[x, 2.5 - j * 0.9, 2.3]}>
                <boxGeometry args={[0.7, 0.7, 0.08]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#fbbf24"
                  emissiveIntensity={hovered ? 1.8 : 0.9}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* ── Side windows (left) ── */}
        {([1.0, 0.0, -1.0] as const).map((z, i) => (
          <mesh key={`left-${i}`} position={[-2.3, 2.5, z]}>
            <boxGeometry args={[0.08, 0.7, 0.7]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fbbf24"
              emissiveIntensity={hovered ? 1.6 : 0.85}
            />
          </mesh>
        ))}

        {/* ── Side windows (right) ── */}
        {([1.0, 0.0, -1.0] as const).map((z, i) => (
          <mesh key={`right-${i}`} position={[2.3, 2.5, z]}>
            <boxGeometry args={[0.08, 0.7, 0.7]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fbbf24"
              emissiveIntensity={hovered ? 1.6 : 0.85}
            />
          </mesh>
        ))}

        {/* ── Main door ── */}
        <mesh position={[0, 1.5, 2.3]}>
          <boxGeometry args={[0.8, 1.2, 0.08]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.7} />
        </mesh>

        {/* ── Door handle ── */}
        <mesh position={[0.35, 1.5, 2.35]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
          <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* ── Classical columns at entrance ── */}
        {[-0.8, 0.8].map((x, i) => (
          <mesh key={`column-${i}`} position={[x, 1.8, 2.3]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 3.2, 8]} />
            <meshStandardMaterial color="#F5F5F5" roughness={0.4} />
          </mesh>
        ))}

        {/* ── Hover glow ── */}
        {hovered && <pointLight position={[0, 3, 0]} intensity={5} distance={12} color="#fbbf24" />}
      </group>
    </Float>
  );
}