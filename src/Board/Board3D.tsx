'use client';

import { useMemo } from 'react';

interface PropertyTile {
  id: number;
  type: 'corner' | 'property';
  label: string;
  color: string;
  icon: string;
}

const PROPERTY_TILES: PropertyTile[] = [
  // Bottom row (left to right)
  { id: 0, type: 'corner', label: 'GO', color: '#16a34a', icon: '🏁' },
  { id: 1, type: 'property', label: 'Park', color: '#8b5cf6', icon: '🌳' },
  { id: 2, type: 'property', label: 'Office', color: '#0891b2', icon: '🏢' },
  { id: 3, type: 'property', label: 'Mall', color: '#ea580c', icon: '🛍️' },
  { id: 4, type: 'property', label: 'School', color: '#7c3aed', icon: '🏫' },
  { id: 5, type: 'property', label: 'Farm', color: '#65a30d', icon: '🌾' },
  { id: 6, type: 'corner', label: 'JAIL', color: '#dc2626', icon: '🔒' },

  // Right column (bottom to top)
  { id: 7, type: 'property', label: 'Hotel', color: '#f43f5e', icon: '🏨' },
  { id: 8, type: 'property', label: 'Store', color: '#06b6d4', icon: '🏪' },
  { id: 9, type: 'property', label: 'Garden', color: '#10b981', icon: '🌸' },
  { id: 10, type: 'property', label: 'Library', color: '#6366f1', icon: '📚' },
  { id: 11, type: 'property', label: 'Park', color: '#8b5cf6', icon: '🎪' },
  { id: 12, type: 'corner', label: 'FREE\nPARKING', color: '#2563eb', icon: '🅿️' },

  // Top row (right to left)
  { id: 13, type: 'property', label: 'Gym', color: '#ec4899', icon: '🏋️' },
  { id: 14, type: 'property', label: 'Museum', color: '#8b5cf6', icon: '🎨' },
  { id: 15, type: 'property', label: 'Tower', color: '#0284c7', icon: '🏗️' },
  { id: 16, type: 'property', label: 'Beach', color: '#06b6d4', icon: '🏖️' },
  { id: 17, type: 'property', label: 'Market', color: '#eab308', icon: '🏬' },
  { id: 18, type: 'corner', label: "GO TO\nJAIL", color: '#b91c1c', icon: '⚠️' },

  // Left column (top to bottom)
  { id: 19, type: 'property', label: 'Temple', color: '#f97316', icon: '🏛️' },
  { id: 20, type: 'property', label: 'Bridge', color: '#64748b', icon: '🌉' },
  { id: 21, type: 'property', label: 'Harbor', color: '#0369a1', icon: '⛵' },
  { id: 22, type: 'property', label: 'Factory', color: '#7c3aed', icon: '🏭' },
  { id: 23, type: 'property', label: 'Tavern', color: '#b45309', icon: '🍺' },
];

interface Board3DProps {
  currentPos: number;
  onTileClick: (id: number) => void;
}

export function Board3D({ currentPos, onTileClick }: Board3DProps) {
  // Arrange tiles in Monopoly board layout
  const tilePositions = useMemo(() => {
    const positions: Record<number, { row: number; col: number; rotate: number }> = {};
    
    // Bottom row (0-6): left to right
    [0, 1, 2, 3, 4, 5, 6].forEach((id, i) => {
      positions[id] = { row: 5, col: i, rotate: 0 };
    });

    // Right column (7-12): bottom to top
    [7, 8, 9, 10, 11, 12].forEach((id, i) => {
      positions[id] = { row: 5 - i, col: 6, rotate: 90 };
    });

    // Top row (13-18): right to left
    [13, 14, 15, 16, 17, 18].forEach((id, i) => {
      positions[id] = { row: 0, col: 6 - i, rotate: 180 };
    });

    // Left column (19-23): top to bottom
    [19, 20, 21, 22, 23].forEach((id, i) => {
      positions[id] = { row: i + 1, col: 0, rotate: 270 };
    });

    return positions;
  }, []);

  return (
    <div style={{
      perspective: '1000px',
      perspectiveOrigin: '50% 45%',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative',
        width: '520px',
        height: '520px',
        transform: 'rotateX(55deg) rotateZ(-35deg)',
        transformStyle: 'preserve-3d',
        filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5))',
      }}>
        {/* Board background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #fef3c7 0%, #f3e8ff 100%)',
          borderRadius: '16px',
          border: '8px solid #a16207',
          boxShadow: 'inset 0 0 0 3px #dc2626, 0 0 0 6px #92400e',
          overflow: 'hidden',
        }}>
          {/* Center green felt */}
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '80px',
            right: '80px',
            bottom: '80px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
            borderRadius: '8px',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexDirection: 'column',
          }}>
            {/* Monopoly text */}
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: '32px',
              fontWeight: '900',
              color: 'white',
              textShadow: '2px 3px 12px rgba(0, 0, 0, 0.4)',
              letterSpacing: '2px',
              textAlign: 'center',
            }}>
              MONOPOLY
            </div>

            {/* Dice area - placeholder for dice component */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6d28d9, #2e1065)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '900',
                color: '#fbbf24',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              }}>
                🎲
              </div>
            </div>
          </div>

          {/* Property tiles in grid */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: 'repeat(7, 1fr)',
            gap: '6px',
            padding: '6px',
            boxSizing: 'border-box',
          }}>
            {PROPERTY_TILES.map((tile) => {
              const pos = tilePositions[tile.id];
              const isActive = currentPos === tile.id;
              
              return (
                <div
                  key={tile.id}
                  style={{
                    gridRow: pos.row + 1,
                    gridColumn: pos.col + 1,
                    background: tile.type === 'corner' 
                      ? `linear-gradient(135deg, ${tile.color} 0%, ${tile.color}dd 100%)`
                      : '#f8f8f8',
                    border: isActive ? '3px solid #fbbf24' : `2px solid ${tile.color}`,
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isActive 
                      ? `0 0 0 3px #fbbf24, 0 4px 12px rgba(0, 0, 0, 0.2)`
                      : '0 2px 6px rgba(0, 0, 0, 0.1)',
                    minHeight: '60px',
                    fontSize: '24px',
                  }}
                  onClick={() => onTileClick(tile.id)}
                >
                  <span>{tile.icon}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: tile.type === 'corner' ? 'white' : tile.color,
                    textAlign: 'center',
                    lineHeight: '1.2',
                  }}>
                    {tile.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
