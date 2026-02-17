'use client';

interface TopHUDProps {
  coins: number;
  savings: number;
  position: number;
  loanActive: boolean;
  loanRemaining: number;
}

export function TopHUD({ coins, savings, position, loanActive, loanRemaining }: TopHUDProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.4) 100%)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      gap: '16px',
    }}>
      {/* Player avatar */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)',
        flexShrink: 0,
      }}>
        🐠
      </div>

      {/* Money display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '8px 16px',
      }}>
        <span style={{ fontSize: '18px' }}>💵</span>
        <span style={{
          fontWeight: '800',
          fontSize: '18px',
          color: 'white',
          fontFamily: 'monospace',
        }}>
          {coins.toLocaleString()}
        </span>
      </div>

      {/* Savings display */}
      {savings > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '24px',
          padding: '8px 16px',
        }}>
          <span style={{ fontSize: '14px' }}>🏦</span>
          <span style={{
            fontWeight: '700',
            fontSize: '14px',
            color: '#86efac',
            fontFamily: 'monospace',
          }}>
            ₹{savings.toLocaleString()}
          </span>
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* Loan indicator */}
        {loanActive && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span>⚠️</span>
            <span>₹{loanRemaining.toLocaleString()}</span>
          </div>
        )}

        {/* Position indicator */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.7)',
        }}>
          {position + 1}/24
        </div>
      </div>
    </div>
  );
}
