import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DiceProps {
  onRoll: (value: number) => void;
  diceValue: number;
}

function DiceMesh({ isRolling, value }: { isRolling: boolean; value: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotRef = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0));

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isRolling) {
      groupRef.current.rotation.x += delta * 18;
      groupRef.current.rotation.y += delta * 15;
      groupRef.current.rotation.z += delta * 12;
      groupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.6;
    } else {
      // Smoothly interpolate to target rotation
      groupRef.current.rotation.x += (targetRotRef.current.x - groupRef.current.rotation.x) * 0.12;
      groupRef.current.rotation.y += (targetRotRef.current.y - groupRef.current.rotation.y) * 0.12;
      groupRef.current.rotation.z += (targetRotRef.current.z - groupRef.current.rotation.z) * 0.12;
      groupRef.current.position.y += (0 - groupRef.current.position.y) * 0.12;
    }
  });

  // Set target rotation when value changes
  useEffect(() => {
    // Standard dice: opposite faces sum to 7
    // 1-6, 2-5, 3-4
    const rotations: { [key: number]: [number, number, number] } = {
      1: [0, 0, 0],                    // 1 facing front
      2: [0, -Math.PI / 2, 0],         // 2 facing front  
      3: [0, 0, -Math.PI / 2],         // 3 facing front
      4: [0, 0, Math.PI / 2],          // 4 facing front
      5: [0, Math.PI / 2, 0],          // 5 facing front
      6: [0, Math.PI, 0],              // 6 facing front
    };
    
    const [x, y, z] = rotations[value] || rotations[1];
    targetRotRef.current = new THREE.Euler(x, y, z);
  }, [value]);

  // Create dice geometry with dots
  const createDice = () => {
    const size = 1.8;
    const radius = 0.15;
    const dotSize = 0.12;
    const dotDepth = 0.08;
    const offset = 0.45;

    // Create rounded cube
    const shape = new THREE.Shape();
    const x = -size / 2;
    const y = -size / 2;
    const width = size;
    const height = size;

    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    const extrudeSettings = {
      depth: size,
      bevelEnabled: true,
      bevelThickness: radius,
      bevelSize: radius,
      bevelSegments: 8,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    return (
      <>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Face 1: One dot in center (front) */}
        <mesh position={[0, 0, size / 2 + dotDepth / 2]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>

        {/* Face 2: Two dots diagonal (right) */}
        <mesh position={[size / 2 + dotDepth / 2, offset, -offset]} rotation={[0, Math.PI / 2, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[size / 2 + dotDepth / 2, -offset, offset]} rotation={[0, Math.PI / 2, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>

        {/* Face 3: Three dots diagonal (top) */}
        <mesh position={[-offset, size / 2 + dotDepth / 2, offset]} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[0, size / 2 + dotDepth / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[offset, size / 2 + dotDepth / 2, -offset]} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>

        {/* Face 4: Four dots in corners (bottom) */}
        <mesh position={[-offset, -size / 2 - dotDepth / 2, -offset]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[offset, -size / 2 - dotDepth / 2, -offset]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[-offset, -size / 2 - dotDepth / 2, offset]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[offset, -size / 2 - dotDepth / 2, offset]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>

        {/* Face 5: Five dots (left) */}
        <mesh position={[-size / 2 - dotDepth / 2, offset, offset]} rotation={[0, -Math.PI / 2, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[-size / 2 - dotDepth / 2, -offset, offset]} rotation={[0, -Math.PI / 2, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[-size / 2 - dotDepth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[-size / 2 - dotDepth / 2, offset, -offset]} rotation={[0, -Math.PI / 2, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[-size / 2 - dotDepth / 2, -offset, -offset]} rotation={[0, -Math.PI / 2, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>

        {/* Face 6: Six dots (back) */}
        <mesh position={[-offset, offset, -size / 2 - dotDepth / 2]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[offset, offset, -size / 2 - dotDepth / 2]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[-offset, 0, -size / 2 - dotDepth / 2]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[offset, 0, -size / 2 - dotDepth / 2]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[-offset, -offset, -size / 2 - dotDepth / 2]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
        <mesh position={[offset, -offset, -size / 2 - dotDepth / 2]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[dotSize, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.4} />
        </mesh>
      </>
    );
  };

  return <group ref={groupRef}>{createDice()}</group>;
}

export default function Dice({ onRoll, diceValue }: DiceProps) {
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState(diceValue || 1);

  const handleRoll = () => {
    if (rolling) return;
    setRolling(true);

    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setValue(result);
      onRoll(result);
      setTimeout(() => setRolling(false), 800);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
          overflow: 'hidden',
        }}>
          <Canvas camera={{ position: [0, 2, 5], fov: 35 }} shadows>
            <color attach="background" args={['#8b5cf6']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
            <DiceMesh isRolling={rolling} value={value} />
          </Canvas>
        </div>

        {!rolling && (
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4), 0 0 0 3px white',
          }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{value}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleRoll}
        disabled={rolling}
        style={{
          marginTop: '8px',
          padding: '12px 32px',
          fontSize: '16px',
          fontWeight: '700',
          color: 'white',
          background: rolling ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          border: 'none',
          borderRadius: '12px',
          cursor: rolling ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        }}
      >
        {rolling ? 'Rolling...' : '🎲 Roll'}
      </button>
    </div>
  );
}