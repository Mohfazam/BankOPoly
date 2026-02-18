'use client';

import type { ReactNode } from 'react';

interface EventModalProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  children: ReactNode;
  onClose: () => void;
}

export function EventModal({
  title,
  description,
  icon,
  color,
  children,
  onClose,
}: EventModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'white',
          borderRadius: '28px 28px 0 0',
          padding: '0 24px 40px',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{
          width: '44px',
          height: '4px',
          background: '#e5e7eb',
          borderRadius: '2px',
          margin: '12px auto 20px',
        }} />

        {/* Header with icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: `0 8px 24px ${color}44`,
            flexShrink: 0,
          }}>
            {icon}
          </div>
          <div>
            <div style={{
              fontWeight: '900',
              fontSize: '22px',
              color: '#111',
              fontFamily: 'Georgia, serif',
            }}>
              {title}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              fontWeight: '600',
            }}>
              Monopoly • Event Tile
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{
          color: '#4b5563',
          fontSize: '14px',
          lineHeight: '1.65',
          textAlign: 'center',
          margin: '0 0 16px',
          fontFamily: 'system-ui, sans-serif',
        }}>
          {description}
        </p>

        {/* Content */}
        {children}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '14px',
            borderRadius: '14px',
            border: 'none',
            cursor: 'pointer',
            background: '#f3f4f6',
            color: '#9ca3af',
            fontWeight: '700',
            fontSize: '14px',
          }}
        >
          Continue
        </button>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
