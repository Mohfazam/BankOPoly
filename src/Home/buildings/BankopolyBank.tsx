import { useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { MONOPOLY_COLORS } from '../styles/BankopolyColors';

interface MonopolyBankProps {
  position: [number, number, number];
  color?: string;
}

export default function MonopolyBank({ position, color = MONOPOLY_COLORS.bankPrimary }: MonopolyBankProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => window.location.href = '/board'}
    >
      {/* Building base with rounded edges (using multiple boxes for "rounded" look) */}
      <group>
        {/* Main building */}
        <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
          <boxGeometry args={[2.5, 3, 2.5]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Classical columns */}
        {[-0.8, 0.8].map((x, i) => (
          <mesh key={`column-${i}`} position={[x, 1.5, 1.3]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 3, 8]} />
            <meshStandardMaterial color="#F5F5F5" />
          </mesh>
        ))}

        {/* Pediment (triangular top) */}
        <mesh position={[0, 3.2, 1.3]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[1.5, 0.8, 3]} />
          <meshStandardMaterial color={MONOPOLY_COLORS.accentGold} metalness={0.5} />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[2.8, 0.3, 2.8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Bank Sign */}
        <group position={[0, 2.5, 1.4]}>
          <mesh castShadow>
            <boxGeometry args={[1.8, 0.5, 0.2]} />
            <meshStandardMaterial color={MONOPOLY_COLORS.accentGold} metalness={0.5} />
          </mesh>
          <Text
            position={[0, 0, 0.15]}
            fontSize={0.4}
            color={MONOPOLY_COLORS.bankPrimary}
            anchorX="center"
            anchorY="middle"
          >
            BANK
          </Text>
        </group>

        {/* Vault door (decorative) */}
        <mesh position={[0, 1, 1.3]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 8]} />
          <meshStandardMaterial color="#8B4513" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Windows */}
        {[-0.8, 0.8].map((x, i) => (
          <mesh key={`window-${i}`} position={[x, 2, 1.3]} castShadow>
            <boxGeometry args={[0.6, 0.8, 0.1]} />
            <meshStandardMaterial color="#87CEEB" emissive="#4AA3FF" emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>

      {/* Hover effect */}
      {hovered && (
        <Html position={[0, 4, 0]} center>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-full font-bold shadow-xl border-4 border-white">
            🏦 MONOPOLY BANK 🏦
          </div>
        </Html>
      )}
    </group>
  );
}