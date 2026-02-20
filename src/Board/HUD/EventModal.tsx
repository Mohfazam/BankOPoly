'use client';

import { useState, useEffect, type ReactNode } from 'react';

// ─── Tile Theme Map ──────────────────────────────────────────────────────────
// Each tile type gets its own visual identity: header gradient, body gradient,
// accent colours, decorative pattern, and particle emoji.
// Used by ThemedEventModal to style the shell without knowing the content.
// ─────────────────────────────────────────────────────────────────────────────
export type EventTileType =
  | 'start' | 'save' | 'interest' | 'scam'
  | 'budget' | 'property' | 'loan' | 'normal';

interface TileTheme {
  headerGradient: string;
  bodyGradient:   string;
  accentColor:    string;
  glowColor:      string;
  borderColor:    string;
  headerEmoji:    string;
  badgeLabel:     string;
  patternSvg:     string;
  particleEmoji:  string;
}

export const EVENT_TILE_THEMES: Record<EventTileType, TileTheme> = {
  start: {
    headerGradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 60%, #22c55e 100%)',
    bodyGradient:   'linear-gradient(180deg, #dcfce7 0%, #f0fdf4 100%)',
    accentColor:    '#16a34a',
    glowColor:      'rgba(22,163,74,0.35)',
    borderColor:    '#4ade80',
    headerEmoji:    '🏁',
    badgeLabel:     'PAYDAY!',
    patternSvg:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='8' fill='none' stroke='%2316a34a' stroke-width='1.5' opacity='0.15'/%3E%3C/svg%3E")`,
    particleEmoji:  '💵',
  },
  save: {
    headerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
    bodyGradient:   'linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)',
    accentColor:    '#2563eb',
    glowColor:      'rgba(37,99,235,0.35)',
    borderColor:    '#60a5fa',
    headerEmoji:    '🏦',
    badgeLabel:     'DEPOSIT',
    patternSvg:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='12' y='12' width='16' height='16' rx='3' fill='none' stroke='%232563eb' stroke-width='1.5' opacity='0.15'/%3E%3C/svg%3E")`,
    particleEmoji:  '🪙',
  },
  interest: {
    headerGradient: 'linear-gradient(135deg, #064e3b 0%, #0d9488 60%, #14b8a6 100%)',
    bodyGradient:   'linear-gradient(180deg, #ccfbf1 0%, #f0fdfa 100%)',
    accentColor:    '#0d9488',
    glowColor:      'rgba(13,148,136,0.35)',
    borderColor:    '#2dd4bf',
    headerEmoji:    '📈',
    badgeLabel:     '+INTEREST',
    patternSvg:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M8 30 L15 20 L22 24 L30 10' fill='none' stroke='%230d9488' stroke-width='1.5' opacity='0.2'/%3E%3C/svg%3E")`,
    particleEmoji:  '💹',
  },
  scam: {
    headerGradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 60%, #ef4444 100%)',
    bodyGradient:   'linear-gradient(180deg, #fee2e2 0%, #fff1f2 100%)',
    accentColor:    '#dc2626',
    glowColor:      'rgba(220,38,38,0.4)',
    borderColor:    '#f87171',
    headerEmoji:    '🚨',
    badgeLabel:     '⚠ DANGER',
    patternSvg:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 8 L32 30 L8 30 Z' fill='none' stroke='%23dc2626' stroke-width='1.5' opacity='0.12'/%3E%3C/svg%3E")`,
    particleEmoji:  '🚫',
  },
  budget: {
    headerGradient: 'linear-gradient(135deg, #4c1d95 0%, #9333ea 60%, #a855f7 100%)',
    bodyGradient:   'linear-gradient(180deg, #f3e8ff 0%, #faf5ff 100%)',
    accentColor:    '#9333ea',
    glowColor:      'rgba(147,51,234,0.35)',
    borderColor:    '#c084fc',
    headerEmoji:    '📊',
    badgeLabel:     'BUDGET',
    patternSvg:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='10' cy='20' r='3' fill='%239333ea' opacity='0.12'/%3E%3Ccircle cx='20' cy='14' r='3' fill='%239333ea' opacity='0.12'/%3E%3Ccircle cx='30' cy='22' r='3' fill='%239333ea' opacity='0.12'/%3E%3C/svg%3E")`,
    particleEmoji:  '📊',
  },
  property: {
    headerGradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 60%, #f97316 100%)',
    bodyGradient:   'linear-gradient(180deg, #ffedd5 0%, #fff7ed 100%)',
    accentColor:    '#ea580c',
    glowColor:      'rgba(234,88,12,0.35)',
    borderColor:    '#fb923c',
    headerEmoji:    '🏠',
    badgeLabel:     'PROPERTY',
    patternSvg:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 10 L30 18 L30 30 L10 30 L10 18 Z' fill='none' stroke='%23ea580c' stroke-width='1.5' opacity='0.12'/%3E%3C/svg%3E")`,
    particleEmoji:  '🏡',
  },
  loan: {
    headerGradient: 'linear-gradient(135deg, #831843 0%, #db2777 60%, #ec4899 100%)',
    bodyGradient:   'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 100%)',
    accentColor:    '#db2777',
    glowColor:      'rgba(219,39,119,0.35)',
    borderColor:    '#f472b6',
    headerEmoji:    '📋',
    badgeLabel:     'BANK LOAN',
    patternSvg:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cline x1='10' y1='10' x2='30' y2='10' stroke='%23db2777' stroke-width='1.5' opacity='0.15'/%3E%3Cline x1='10' y1='18' x2='30' y2='18' stroke='%23db2777' stroke-width='1.5' opacity='0.15'/%3E%3Cline x1='10' y1='26' x2='22' y2='26' stroke='%23db2777' stroke-width='1.5' opacity='0.15'/%3E%3C/svg%3E")`,
    particleEmoji:  '💸',
  },
  normal: {
    headerGradient: 'linear-gradient(135deg, #14532d 0%, #4ade80 60%, #86efac 100%)',
    bodyGradient:   'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
    accentColor:    '#4ade80',
    glowColor:      'rgba(74,222,128,0.3)',
    borderColor:    '#86efac',
    headerEmoji:    '⭐',
    badgeLabel:     'FREE!',
    patternSvg:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 8 l2.5 7.5 H30 l-6 4.5 2.5 7.5 L20 23 l-6.5 4.5 2.5-7.5-6-4.5h7.5Z' fill='none' stroke='%234ade80' stroke-width='1' opacity='0.18'/%3E%3C/svg%3E")`,
    particleEmoji:  '🌟',
  },
};

// ─── Props ───────────────────────────────────────────────────────────────────
interface EventModalProps {
  /** Tile type drives the entire visual theme */
  tileType: EventTileType;
  /** Short title shown in the header, e.g. "SAVE" or "SCAM" */
  title: string;
  /** Tile number shown as sub-label */
  tileNumber?: number;
  /** Whether the property is owned (adds "★ Owned" badge) */
  isOwned?: boolean;
  /** Event content (buttons, info rows, etc.) */
  children: ReactNode;
  /** Called when the backdrop or ✕ is clicked */
  onClose: () => void;
  /** Optional footer "Continue" label, defaults to "Continue →" */
  continueLabel?: string;
}

// ─── ThemedEventModal ────────────────────────────────────────────────────────
// Drop-in replacement for the old white EventModal.
// All visual styling is driven by `tileType`; callers only provide content.
// ─────────────────────────────────────────────────────────────────────────────
export function EventModal({
  tileType,
  title,
  tileNumber,
  isOwned = false,
  children,
  onClose,
  continueLabel = 'Continue →',
}: EventModalProps) {
  const theme = EVENT_TILE_THEMES[tileType];

  // Stagger-in floating particles for the header
  const [particles] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({ id: i, x: 8 + i * 15, delay: i * 0.18 }))
  );

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(8, 12, 28, 0.78)',
          backdropFilter: 'blur(7px)',
          WebkitBackdropFilter: 'blur(7px)',
          animation: 'em_fadeIn 0.22s ease',
        }}
      />

      {/* ── Sheet ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '100%', maxWidth: 490,
          borderRadius: '28px 28px 0 0',
          overflow: 'hidden',
          maxHeight: '84vh', display: 'flex', flexDirection: 'column',
          animation: 'em_sheetRise 0.44s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: `0 -8px 60px ${theme.glowColor}, 0 -2px 0 ${theme.borderColor}`,
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          background: theme.headerGradient,
          padding: '0 22px 18px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Tile-type decorative SVG pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: theme.patternSvg,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />

          {/* Floating particles */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, overflow: 'hidden', pointerEvents: 'none' }}>
            {particles.map(p => (
              <div key={p.id} style={{
                position: 'absolute', left: `${p.x}%`, top: 2,
                fontSize: 13, opacity: 0,
                animation: `em_particle 2.6s ease-out ${p.delay}s infinite`,
              }}>
                {theme.particleEmoji}
              </div>
            ))}
          </div>

          {/* Drag handle */}
          <div style={{
            width: 44, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.35)',
            margin: '14px auto 16px',
          }} />

          {/* Header content row */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Icon orb */}
            <div style={{
              width: 60, height: 60, borderRadius: 20, flexShrink: 0,
              background: 'rgba(255,255,255,0.18)',
              border: '2px solid rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(4px)',
              animation: 'em_iconPulse 2.2s ease-in-out infinite',
            }}>
              {theme.headerEmoji}
            </div>

            {/* Title block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 20, padding: '3px 10px', marginBottom: 6,
              }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.92)', letterSpacing: '1.4px', textTransform: 'uppercase' }}>
                  {theme.badgeLabel}
                </span>
              </div>

              {/* Main title */}
              <div style={{
                fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 22,
                color: 'white', lineHeight: 1.2,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                {title}
                {isOwned && (
                  <span style={{ fontSize: 14, marginLeft: 8, opacity: 0.9 }}>★ Owned</span>
                )}
              </div>

              {/* Sub-label */}
              {tileNumber !== undefined && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginTop: 2 }}>
                  Tile #{tileNumber} · Bankopoly Board
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(0,0,0,0.2)',
                color: 'rgba(255,255,255,0.85)', fontSize: 15,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{
          background: theme.bodyGradient,
          padding: '20px 22px 28px',
          overflowY: 'auto',
          flex: 1,
        }}>
          {children}

          {/* Footer continue button */}
          <button
            onClick={onClose}
            style={{
              width: '100%', marginTop: 18, padding: '13px',
              borderRadius: 14,
              border: `2px solid ${theme.borderColor}44`,
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(4px)',
              color: '#64748b', fontWeight: 800, fontSize: 13,
              fontFamily: '"Nunito", system-ui',
              transition: 'background 0.15s',
            }}
          >
            {continueLabel}
          </button>
        </div>
      </div>

      {/* ── Scoped keyframes ── */}
      <style>{`
        @keyframes em_fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes em_sheetRise {
          0%   { transform: translateX(-50%) translateY(100%) scale(0.96); opacity: 0; }
          65%  { transform: translateX(-50%) translateY(-6px) scale(1.01); opacity: 1; }
          100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
        }
        @keyframes em_iconPulse {
          0%,100% { transform: scale(1);    }
          50%     { transform: scale(1.1);  }
        }
        @keyframes em_particle {
          0%   { transform: translateY(0) scale(1) rotate(0deg);   opacity: 0.85; }
          80%  { transform: translateY(-38px) scale(0.75) rotate(18deg); opacity: 0.25; }
          100% { transform: translateY(-54px) scale(0.5);          opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ─── Legacy shim ─────────────────────────────────────────────────────────────
// Keeps any existing imports of the old <EventModal> signature working
// without a breaking change. Maps the old flat props onto the new themed shell.
// Delete this once all callers have migrated to the new signature.
// ─────────────────────────────────────────────────────────────────────────────
interface LegacyEventModalProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  children: ReactNode;
  onClose: () => void;
}

export function LegacyEventModal({
  title, description, icon: _icon, color: _color, children, onClose,
}: LegacyEventModalProps) {
  // Infer tile type from title for best-effort theming
  const inferType = (): EventTileType => {
    const t = title.toUpperCase();
    if (t.includes('SAVE') || t.includes('DEPOSIT')) return 'save';
    if (t.includes('EARN') || t.includes('INTEREST')) return 'interest';
    if (t.includes('SCAM') || t.includes('FRAUD')) return 'scam';
    if (t.includes('BUDGET')) return 'budget';
    if (t.includes('LOAN')) return 'loan';
    if (t.includes('GO') || t.includes('START')) return 'start';
    if (t.includes('PROPERTY') || t.includes('HOUSE')) return 'property';
    return 'normal';
  };

  return (
    <EventModal tileType={inferType()} title={title} onClose={onClose}>
      {description && (
        <p style={{
          color: '#475569', fontSize: 14, lineHeight: 1.7,
          textAlign: 'center', margin: '0 0 16px',
          fontFamily: '"Nunito", system-ui',
        }}>
          {description}
        </p>
      )}
      {children}
    </EventModal>
  );
}