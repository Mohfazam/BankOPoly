import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface DiceProps {
  onRoll: (value: number) => void;
  diceValue: number;
}

function DiceMesh({ isRolling, targetValue }: { isRolling: boolean; targetValue: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const velocityRef = useRef({ x: 0.5, y: 0.5, z: 0.5 });

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isRolling) {
      // Wild spinning
      meshRef.current.rotation.x += velocityRef.current.x * delta * 12;
      meshRef.current.rotation.y += velocityRef.current.y * delta * 12;
      meshRef.current.rotation.z += velocityRef.current.z * delta * 12;
      
      // Bounce
      meshRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 1.5;
    } else {
      // Settle to show number
      const target = getFaceRotation(targetValue);
      meshRef.current.rotation.x += (target.x - meshRef.current.rotation.x) * 0.12;
      meshRef.current.rotation.y += (target.y - meshRef.current.rotation.y) * 0.12;
      meshRef.current.rotation.z += (target.z - meshRef.current.rotation.z) * 0.12;
      meshRef.current.position.y += (0 - meshRef.current.position.y) * 0.15;
    }
  });

  const getFaceRotation = (value: number) => {
    const rots = {
      1: { x: 0, y: 0, z: 0 },
      2: { x: 0, y: -Math.PI / 2, z: 0 },
      3: { x: -Math.PI / 2, y: 0, z: 0 },
      4: { x: Math.PI / 2, y: 0, z: 0 },
      5: { x: 0, y: Math.PI / 2, z: 0 },
      6: { x: Math.PI, y: 0, z: 0 },
    };
    return rots[value as keyof typeof rots] || rots[1];
  };

  const createDot = (face: number, positions: number[][]) => {
    return positions.map((pos, i) => {
      let position: [number, number, number];
      let rotation: [number, number, number] = [0, 0, 0];

      switch (face) {
        case 1: position = [pos[0], pos[1], 1.02]; break;
        case 2: position = [1.02, pos[1], -pos[0]]; rotation = [0, Math.PI / 2, 0]; break;
        case 3: position = [pos[0], 1.02, pos[1]]; rotation = [-Math.PI / 2, 0, 0]; break;
        case 4: position = [pos[0], -1.02, -pos[1]]; rotation = [Math.PI / 2, 0, 0]; break;
        case 5: position = [-1.02, pos[1], pos[0]]; rotation = [0, -Math.PI / 2, 0]; break;
        case 6: position = [-pos[0], pos[1], -1.02]; rotation = [0, Math.PI, 0]; break;
        default: position = [0, 0, 0];
      }

      return (
        <mesh key={`${face}-${i}`} position={position} rotation={rotation}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.2} />
        </mesh>
      );
    });
  };

  return (
    <group ref={meshRef}>
      <RoundedBox args={[2, 2, 2]} radius={0.2} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.15}
          metalness={0.1}
          envMapIntensity={0.8}
        />
      </RoundedBox>

      {createDot(1, [[0, 0]])}
      {createDot(2, [[-0.5, 0.5], [0.5, -0.5]])}
      {createDot(3, [[-0.5, 0.5], [0, 0], [0.5, -0.5]])}
      {createDot(4, [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]])}
      {createDot(5, [[-0.5, 0.5], [0.5, 0.5], [0, 0], [-0.5, -0.5], [0.5, -0.5]])}
      {createDot(6, [[-0.5, 0.6], [0.5, 0.6], [-0.5, 0], [0.5, 0], [-0.5, -0.6], [0.5, -0.6]])}
    </group>
  );
}

export default function Dice({ onRoll, diceValue }: DiceProps) {
  const [rolling, setRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState(diceValue || 6);

  const handleRoll = () => {
    if (rolling) return;
    setRolling(true);

    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setCurrentValue(result);
      onRoll(result);
      setTimeout(() => setRolling(false), 800);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
      {/* Dice Canvas */}
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: rolling 
            ? '0 8px 32px rgba(102, 126, 234, 0.4), 0 0 0 4px rgba(255, 215, 0, 0.5)'
            : '0 8px 24px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s ease',
        }}>
          <Canvas
            camera={{ position: [0, 3, 7], fov: 30 }}
            shadows
            dpr={[1, 2]}
          >
            <color attach="background" args={['#8b5cf6']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[8, 10, 5]} intensity={1.5} castShadow />
            <pointLight position={[-5, 5, -3]} intensity={0.4} color="#fbbf24" />
            
            <DiceMesh isRolling={rolling} targetValue={currentValue} />
            <Environment preset="sunset" />
          </Canvas>
        </div>

        {/* Result badge */}
        {!rolling && (
          <div style={{
            position: 'absolute',
            bottom: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(251, 191, 36, 0.5), 0 0 0 4px white',
            border: '3px solid white',
          }}>
            <span style={{
              fontSize: '24px',
              fontWeight: '900',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              {currentValue}
            </span>
          </div>
        )}
      </div>

      {/* Roll Button */}
      <button
        onClick={handleRoll}
        disabled={rolling}
        style={{
          marginTop: '32px',
          padding: '16px 48px',
          fontSize: '20px',
          fontWeight: '800',
          color: 'white',
          background: rolling 
            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          border: 'none',
          borderRadius: '16px',
          cursor: rolling ? 'not-allowed' : 'pointer',
          boxShadow: rolling 
            ? '0 4px 12px rgba(107, 114, 128, 0.3)'
            : '0 8px 24px rgba(59, 130, 246, 0.4)',
          transform: rolling ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          if (!rolling) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!rolling) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
          }
        }}
        onMouseDown={(e) => {
          if (!rolling) {
            e.currentTarget.style.transform = 'scale(0.98)';
          }
        }}
        onMouseUp={(e) => {
          if (!rolling) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
      >
        {rolling ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <svg 
              style={{ 
                animation: 'spin 1s linear infinite',
                width: '24px',
                height: '24px',
              }} 
              viewBox="0 0 24 24"
            >
              <circle 
                style={{ opacity: 0.25 }} 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none" 
              />
              <path 
                style={{ opacity: 0.75 }} 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              />
            </svg>
            Rolling...
          </span>
        ) : (
          '🎲 Roll Dice'
        )}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}