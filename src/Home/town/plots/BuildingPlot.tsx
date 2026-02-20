import { useState } from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../../Store/useGameStore';

interface BuildingPlotProps {
  plotNum : number;
  px      : number;
  pz      : number;
  size    : number;
  plotId  : string;
  cost    : number;
}

export default function BuildingPlot({ plotNum, px, pz, size, plotId, cost }: BuildingPlotProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [hovered,     setHovered]     = useState(false);

  const wealth         = useGameStore(s => s.wealth);
  const unlockBuilding = useGameStore(s => s.unlockBuilding);
  const canAfford      = wealth >= cost;

  const handleBuy = () => {
    unlockBuilding(plotId, cost);
    setShowConfirm(false);
  };

  return (
    <group position={[px, 0, pz]}>

      {/* Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#58a84e" roughness={0.88} />
      </mesh>

      {/* Clickable box — tall enough for easy raycasting */}
      <mesh
        position={[0, 0.3, 0]}
        onPointerEnter={e => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = 'pointer'; }}
        onPointerLeave={e => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={e => { e.stopPropagation(); setShowConfirm(v => !v); }}
      >
        <boxGeometry args={[size * 0.9, 0.6, size * 0.9]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#7ec87a'}
          transparent
          opacity={hovered ? 0.5 : 0.15}
        />
      </mesh>

      {/* Corner posts */}
      {([[-1,-1],[-1,1],[1,-1],[1,1]] as const).map(([cx, cz], i) => (
        <mesh key={i} position={[cx * (size / 2 - 0.22), 0.32, cz * (size / 2 - 0.22)]} castShadow>
          <cylinderGeometry args={[0.09, 0.13, 0.64, 8]} />
          <meshStandardMaterial color="#c8b880" roughness={0.65} />
        </mesh>
      ))}

      {/* Hover tooltip */}
      {hovered && !showConfirm && (
        <Html position={[0, 3.5, 0]} center distanceFactor={14} zIndexRange={[200, 0]}>
          <div style={{
            background   : canAfford ? 'linear-gradient(135deg,#fef9c3,#fef08a)' : '#f1f5f9',
            border       : `3px solid ${canAfford ? '#d97706' : '#94a3b8'}`,
            borderRadius : 14, padding: '10px 20px', textAlign: 'center',
            fontFamily   : '"Nunito",system-ui,sans-serif',
            boxShadow    : '0 8px 24px rgba(0,0,0,0.4)',
            whiteSpace   : 'nowrap', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 22 }}>{canAfford ? '🏗️' : '🔒'}</div>
            <div style={{ fontWeight: 900, fontSize: 15, color: canAfford ? '#92400e' : '#475569' }}>
              Plot #{plotNum}
            </div>
            <div style={{ fontSize: 11, color: canAfford ? '#a16207' : '#64748b', fontWeight: 700, marginTop: 2 }}>
              {canAfford ? `Click to build · ₹${cost}` : `Need ₹${cost - wealth} more`}
            </div>
          </div>
        </Html>
      )}

      {/* Buy popup */}
      {showConfirm && (
        <Html position={[0, 5, 0]} center distanceFactor={13} zIndexRange={[300, 0]}>
          <div
            onPointerDown={e => e.stopPropagation()}
            style={{
              background  : 'linear-gradient(145deg,#fef9c3,#fef08a)',
              border      : '4px solid #d97706', borderRadius: 20,
              padding     : '20px 24px', textAlign: 'center',
              fontFamily  : '"Nunito",system-ui,sans-serif',
              boxShadow   : '0 12px 40px rgba(0,0,0,0.5)',
              minWidth    : 220,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 6 }}>🏠</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#92400e', marginBottom: 4 }}>
              Place a House?
            </div>
            <div style={{ fontSize: 13, color: '#78350f', fontWeight: 700, marginBottom: 6 }}>
              Plot #{plotNum} · ₹{cost}
            </div>
            <div style={{ fontSize: 13, color: canAfford ? '#15803d' : '#dc2626', fontWeight: 800, marginBottom: 16 }}>
              Your wealth: ₹{wealth} {canAfford ? '✅' : '❌'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12,
                  border: '2px solid #d97706', background: 'white',
                  color: '#92400e', fontWeight: 900, fontSize: 13, cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={handleBuy}
                disabled={!canAfford}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                  background : canAfford ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#e2e8f0',
                  color      : canAfford ? 'white' : '#94a3b8',
                  fontWeight : 900, fontSize: 13,
                  cursor     : canAfford ? 'pointer' : 'not-allowed',
                  boxShadow  : canAfford ? '0 4px 0 #14532d' : 'none',
                }}
              >{canAfford ? '🏠 Build!' : '🔒 Locked'}</button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
