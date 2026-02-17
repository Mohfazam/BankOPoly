'use client';

interface BottomHUDProps {
  onRoll: () => void;
  rolling: boolean;
  diceValue: number;
  turnsRemaining: number;
  totalTurns: number;
}

export function BottomHUD({
  onRoll,
  rolling,
  diceValue,
  turnsRemaining,
  totalTurns,
}: BottomHUDProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      gap: '20px',
    }}>
      {/* Quick stats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>✅</span>
          <span>WINS</span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>🏗️</span>
          <span>BUILD</span>
        </div>
      </div>

      {/* Turn progress */}
      <div style={{
        flex: 1,
        maxWidth: '200px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: 'white',
          fontFamily: 'monospace',
        }}>
          {turnsRemaining}/{totalTurns}
        </div>
        <div style={{
          flex: 1,
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(turnsRemaining / totalTurns) * 100}%`,
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Dice button */}
      <button
        onClick={onRoll}
        disabled={rolling}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: 'none',
          background: rolling 
            ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          boxShadow: rolling
            ? '0 0 32px rgba(139, 92, 246, 0.6), 0 8px 20px rgba(0, 0, 0, 0.3)'
            : '0 8px 20px rgba(0, 0, 0, 0.3)',
          cursor: rolling ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '4px',
          transition: 'all 0.3s',
          transform: rolling ? 'scale(1.05)' : 'scale(1)',
          flexShrink: 0,
        }}
      >
        <div style={{
          fontSize: '28px',
        }}>
          🎲
        </div>
        {!rolling && (
          <div style={{
            fontSize: '16px',
            fontWeight: '900',
            color: 'white',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
          }}>
            {diceValue}
          </div>
        )}
      </button>

      {/* Right side stats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>🎖️</span>
          <span>ALBUM</span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>🤝</span>
          <span>FRIENDS</span>
        </div>
      </div>
    </div>
  );
}
