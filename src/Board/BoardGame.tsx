'use client';

import React, { useState, useEffect } from 'react';
import { Town3D } from './Town3D';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & GAME DATA
// ═══════════════════════════════════════════════════════════════════════════
type TileType = 'start' | 'save' | 'interest' | 'scam' | 'budget' | 'property' | 'loan' | 'normal';

interface Tile {
  id: number;
  type: TileType;
  label: string;
  icon: string;
  price: number;
  rent: number;
}

const TILES: Tile[] = [
  { id: 0,  type: 'start',    label: 'GO',       icon: '🏁', price: 0,   rent: 0  },
  { id: 1,  type: 'save',     label: 'SAVE',     icon: '🏦', price: 0,   rent: 0  },
  { id: 2,  type: 'interest', label: 'EARN',     icon: '💰', price: 0,   rent: 0  },
  { id: 3,  type: 'property', label: 'PARK ST',  icon: '🏠', price: 100, rent: 25 },
  { id: 4,  type: 'scam',     label: 'SCAM',     icon: '⚠️', price: 0,   rent: 0  },
  { id: 5,  type: 'budget',   label: 'BUDGET',   icon: '📚', price: 0,   rent: 0  },
  { id: 6,  type: 'loan',     label: 'LOAN',     icon: '📋', price: 0,   rent: 0  },
  { id: 7,  type: 'property', label: 'HILL RD',  icon: '🏠', price: 120, rent: 30 },
  { id: 8,  type: 'interest', label: 'EARN',     icon: '💰', price: 0,   rent: 0  },
  { id: 9,  type: 'normal',   label: 'FREE',     icon: '⭐', price: 0,   rent: 0  },
  { id: 10, type: 'budget',   label: 'BUDGET',   icon: '📚', price: 0,   rent: 0  },
  { id: 11, type: 'save',     label: 'SAVE',     icon: '🏦', price: 0,   rent: 0  },
  { id: 12, type: 'loan',     label: 'LOAN',     icon: '📋', price: 0,   rent: 0  },
  { id: 13, type: 'scam',     label: 'SCAM',     icon: '⚠️', price: 0,   rent: 0  },
  { id: 14, type: 'property', label: 'MG ROAD',  icon: '🏠', price: 150, rent: 40 },
  { id: 15, type: 'interest', label: 'EARN',     icon: '💰', price: 0,   rent: 0  },
  { id: 16, type: 'budget',   label: 'BUDGET',   icon: '📚', price: 0,   rent: 0  },
  { id: 17, type: 'normal',   label: 'FREE',     icon: '⭐', price: 0,   rent: 0  },
  { id: 18, type: 'save',     label: 'SAVE',     icon: '🏦', price: 0,   rent: 0  },
  { id: 19, type: 'property', label: 'MALL AVE', icon: '🏠', price: 180, rent: 50 },
];

const GO_SALARY    = 200;
const LOAN_AMOUNT  = 100;
const LOAN_REPAY   = 120;
const WIN_THRESHOLD = 5000;
const ATM_PIN      = '1234';

const TOP:   number[] = [0, 1, 2, 3, 4];
const RIGHT: number[] = [5, 6, 7, 8, 9];
const BOT:   number[] = [14, 13, 12, 11, 10];
const LEFT:  number[] = [19, 18, 17, 16, 15];

interface ColorConfig {
  accent: string;
  fill: string;
  dark: string;
}

const COLORS: Record<TileType, ColorConfig> = {
  start:    { accent: '#22c55e', fill: '#dcfce7', dark: '#15803d' },
  save:     { accent: '#3b82f6', fill: '#dbeafe', dark: '#1e40af' },
  interest: { accent: '#14b8a6', fill: '#ccfbf1', dark: '#0f766e' },
  scam:     { accent: '#ef4444', fill: '#fee2e2', dark: '#b91c1c' },
  budget:   { accent: '#a855f7', fill: '#f3e8ff', dark: '#7e22ce' },
  property: { accent: '#f97316', fill: '#ffedd5', dark: '#c2410c' },
  loan:     { accent: '#ec4899', fill: '#fce7f3', dark: '#be185d' },
  normal:   { accent: '#64748b', fill: '#f8fafc', dark: '#475569' },
};

// ═══════════════════════════════════════════════════════════════════════════
// DICE
// ═══════════════════════════════════════════════════════════════════════════
const F = false, T = true;
const FACES: Record<number, boolean[]> = {
  1: [F, F, F, F, T, F, F, F, F],
  2: [T, F, F, F, F, F, F, F, T],
  3: [T, F, F, F, T, F, F, F, T],
  4: [T, F, T, F, F, F, T, F, T],
  5: [T, F, T, F, T, F, T, F, T],
  6: [T, F, T, T, F, T, T, F, T],
};

interface DiceProps {
  value: number;
  rolling: boolean;
}

function Dice({ value, rolling }: DiceProps) {
  const dots = FACES[value] ?? FACES[1];
  return (
    <div style={{
      width: 80, height: 80,
      borderRadius: 16,
      background: 'white',
      boxShadow: rolling
        ? '0 0 0 4px #fbbf24, 0 0 32px rgba(251,191,36,0.9), 0 8px 24px rgba(0,0,0,0.5)'
        : '0 6px 0 rgba(0,0,0,0.35), 0 10px 28px rgba(0,0,0,0.5)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      padding: 12,
      gap: 3,
      animation: rolling ? 'diceRoll 0.11s linear infinite' : 'diceLand 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      transition: 'box-shadow 0.3s ease',
      userSelect: 'none',
      cursor: rolling ? 'wait' : 'pointer',
    }}>
      {dots.map((on, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {on && (
            <div style={{
              width: 12, height: 12,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #374151, #0f172a)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 1px 4px rgba(0,0,0,0.5)',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOARD TILE
// ═══════════════════════════════════════════════════════════════════════════
interface BTileProps {
  tile: Tile;
  active: boolean;
  owned: boolean;
  side: 'top' | 'bottom' | 'left' | 'right';
}

function BTile({ tile, active, owned, side }: BTileProps) {
  const c = COLORS[tile.type];
  const isH = side === 'top' || side === 'bottom';
  const dark = owned && tile.type === 'property' ? '#92400e' : c.dark;
  const bg   = owned && tile.type === 'property' ? '#fef3c7' : c.fill;

  const stripPos: React.CSSProperties =
    side === 'top'    ? { top: 0, left: 0, right: 0, height: 7 } :
    side === 'bottom' ? { bottom: 0, left: 0, right: 0, height: 7 } :
    side === 'left'   ? { left: 0, top: 0, bottom: 0, width: 7 } :
                        { right: 0, top: 0, bottom: 0, width: 7 };

  const contentPad =
    side === 'top'    ? '10px 3px 4px' :
    side === 'bottom' ? '4px 3px 10px' :
    side === 'left'   ? '4px 4px 4px 10px' :
                        '4px 10px 4px 4px';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: bg,
      border: `3px solid ${dark}`,
      borderRadius: 8,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      boxShadow: active
        ? `0 0 0 2px #fbbf24, 0 4px 12px rgba(251,191,36,0.4)`
        : owned && tile.type === 'property'
        ? '0 0 0 2px rgba(217,119,6,0.4) inset, 0 2px 6px rgba(0,0,0,0.15)'
        : '0 2px 6px rgba(0,0,0,0.15)',
    }}>
      <div style={{ position: 'absolute', background: dark, ...stripPos }} />

      {owned && tile.type === 'property' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, transparent 60%)',
        }} />
      )}

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
        padding: contentPad,
        width: '100%', height: '100%',
        boxSizing: 'border-box',
        writingMode: isH ? 'horizontal-tb' : 'vertical-lr',
        transform: side === 'left' ? 'scaleX(-1)' : 'none',
      }}>
        <span style={{
          fontSize: isH ? 28 : 24,
          lineHeight: 1,
          filter: active
            ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))'
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}>{tile.icon}</span>
        <span style={{
          fontSize: isH ? 8 : 7,
          fontWeight: 900,
          color: dark,
          letterSpacing: '0.3px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.2,
          textTransform: 'uppercase',
        }}>{tile.label}</span>
        {owned && tile.type === 'property' && (
          <span style={{ fontSize: 5, fontWeight: 900, color: '#d97706', lineHeight: 1 }}>★ YOURS</span>
        )}
      </div>

      {active && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20, pointerEvents: 'none',
          background: 'rgba(255,248,220,0.92)',
          backdropFilter: 'blur(4px)',
          borderRadius: 6,
        }}>
          <div style={{
            animation: 'pinBounce 1.2s ease-in-out infinite',
            filter: 'drop-shadow(0 4px 10px rgba(239,68,68,0.6))',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}>
            <svg width="28" height="36" viewBox="0 0 22 30" fill="none">
              <ellipse cx="11" cy="28" rx="7" ry="2.5" fill="rgba(0,0,0,0.25)" />
              <path d="M11 1C6.5 1 3 4.8 3 9.5C3 15.5 8 21 11 24.5C14 21 19 15.5 19 9.5C19 4.8 15.5 1 11 1Z" fill="#ef4444" />
              <path d="M11 1C6.5 1 3 4.8 3 9.5C3 15.5 8 21 11 24.5C14 21 19 15.5 19 9.5C19 4.8 15.5 1 11 1Z" fill="url(#pGrad)" />
              <defs>
                <linearGradient id="pGrad" x1="6" y1="2" x2="15" y2="12">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <circle cx="11" cy="9.5" r="4.2" fill="white" opacity="0.96" />
              <circle cx="11" cy="9.5" r="2.4" fill="#ef4444" />
            </svg>
            <span style={{ fontSize: 6, fontWeight: 900, color: '#dc2626', letterSpacing: '0.4px' }}>YOU</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CORNER
// ═══════════════════════════════════════════════════════════════════════════
interface CornerProps {
  icon: string;
  top: string;
  bot?: string;
  bg: string;
  border: string;
}

function Corner({ icon, top, bot, bg, border }: CornerProps) {
  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      border: `3px solid ${border}`, borderRadius: 8,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 4, boxSizing: 'border-box',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 7, fontWeight: 900, color: border, textAlign: 'center', fontFamily: 'system-ui,sans-serif', lineHeight: 1.3, textTransform: 'uppercase' }}>{top}</span>
      {bot && <span style={{ fontSize: 9, fontWeight: 900, color: border, fontFamily: 'Georgia,serif' }}>{bot}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ATM MODAL
// ═══════════════════════════════════════════════════════════════════════════
type ATMStep = 'pin' | 'amount' | 'success';

interface ATMModalProps {
  savings: number;
  onWithdraw: (amount: number) => void;
  onClose: () => void;
}

function ATMModal({ savings, onWithdraw, onClose }: ATMModalProps) {
  const [pin, setPin]         = useState<string>('');
  const [amount, setAmount]   = useState<string>('');
  const [step, setStep]       = useState<ATMStep>('pin');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handlePinKey = (key: string) => {
    if (key === 'DEL') { setPin(p => p.slice(0, -1)); return; }
    if (pin.length < 4) setPin(p => p + key);
  };

  const confirmPin = () => {
    if (pin === ATM_PIN) {
      setStep('amount');
      setErrorMsg('');
    } else {
      setErrorMsg('Wrong PIN! Try again.');
      setPin('');
    }
  };

  const confirmWithdraw = () => {
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0)    { setErrorMsg('Enter a valid amount!'); return; }
    if (amt > savings)        { setErrorMsg(`Only ₹${savings} in savings!`); return; }
    if (amt % 50 !== 0)       { setErrorMsg('Withdraw in multiples of ₹50!'); return; }
    onWithdraw(amt);
    setStep('success');
    setTimeout(() => onClose(), 1600);
  };

  const presets = [50, 100, 150, 200].filter(v => v <= savings);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 340,
          background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 28,
          border: '2px solid rgba(34,197,94,0.4)',
          boxShadow: '0 0 0 1px rgba(34,197,94,0.1), 0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(34,197,94,0.1)',
          overflow: 'hidden',
          animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #065f46, #047857)', padding: '20px 24px 16px', borderBottom: '2px solid rgba(34,197,94,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏧</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: 'white', fontFamily: 'Georgia,serif', letterSpacing: 1 }}>ZenCoins ATM</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginTop: 1 }}>SAVINGS ACCOUNT · Balance: ₹{savings}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {step === 'pin' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Enter your 4-digit PIN</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 4 }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      width: 44, height: 52, borderRadius: 12,
                      background: pin.length > i ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)',
                      border: pin.length > i ? '2px solid rgba(34,197,94,0.6)' : '2px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, color: '#4ade80', fontWeight: 900,
                      transition: 'all 0.2s',
                    }}>{pin.length > i ? '●' : ''}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#6ee7b7', fontWeight: 700, marginTop: 4, letterSpacing: '0.5px' }}>💡 Hint: Try 1234</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', '✓'].map(k => (
                  <button
                    key={k}
                    onClick={() => k === '✓' ? confirmPin() : handlePinKey(k)}
                    style={{
                      padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: k === '✓' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : k === 'DEL' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
                      color: k === '✓' ? 'white' : k === 'DEL' ? '#f87171' : 'white',
                      fontSize: k === '✓' || k === 'DEL' ? 16 : 18,
                      fontWeight: 900, fontFamily: 'system-ui',
                      boxShadow: k === '✓' ? '0 4px 0 #15803d' : '0 2px 0 rgba(0,0,0,0.3)',
                      transition: 'all 0.1s',
                    }}
                  >{k}</button>
                ))}
              </div>

              {errorMsg && <div style={{ textAlign: 'center', color: '#f87171', fontSize: 12, fontWeight: 800, padding: '6px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{errorMsg}</div>}
            </>
          )}

          {step === 'amount' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>How much to withdraw?</div>

                {presets.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 14 }}>
                    {presets.map(v => (
                      <button
                        key={v}
                        onClick={() => setAmount(String(v))}
                        style={{
                          padding: '11px', borderRadius: 12,
                          border: `2px solid ${amount === String(v) ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.1)'}`,
                          cursor: 'pointer',
                          background: amount === String(v) ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                          color: amount === String(v) ? '#4ade80' : 'rgba(255,255,255,0.7)',
                          fontWeight: 900, fontSize: 15, transition: 'all 0.15s',
                        }}
                      >₹{v}</button>
                    ))}
                  </div>
                )}

                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4ade80', fontWeight: 900, fontSize: 16 }}>₹</span>
                  <input
                    type="number"
                    placeholder="Custom amount..."
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.07)',
                      border: '2px solid rgba(255,255,255,0.12)',
                      borderRadius: 12, padding: '12px 14px 12px 32px',
                      color: 'white', fontSize: 15, fontWeight: 700, outline: 'none',
                      fontFamily: 'system-ui',
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textAlign: 'center' }}>Multiples of ₹50 only · Max: ₹{savings}</div>
              </div>

              {errorMsg && <div style={{ textAlign: 'center', color: '#f87171', fontSize: 12, fontWeight: 800, padding: '6px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, marginBottom: 12 }}>{errorMsg}</div>}

              <button
                onClick={confirmWithdraw}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white', fontWeight: 900, fontSize: 16,
                  boxShadow: '0 6px 0 #15803d, 0 10px 30px rgba(34,197,94,0.4)',
                  fontFamily: 'system-ui', letterSpacing: '0.5px', transition: 'all 0.15s',
                }}
              >💸 Withdraw Cash</button>
            </>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 12, animation: 'pinBounce 0.6s ease' }}>✅</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: 'Georgia,serif' }}>Withdrawn!</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6, fontWeight: 600 }}>₹{amount} added to your wallet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WIN MODAL
// ═══════════════════════════════════════════════════════════════════════════
interface WinModalProps {
  zenCoins: number;
  onClaim: () => void;
}

function WinModal({ zenCoins, onClaim }: WinModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        maxWidth: 420, width: '90%',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 32, border: '2px solid rgba(251,191,36,0.5)',
        boxShadow: '0 0 0 1px rgba(251,191,36,0.15), 0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(251,191,36,0.15)',
        padding: '36px 32px', textAlign: 'center',
        animation: 'slideInBounce 0.6s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ fontSize: 72, marginBottom: 8, animation: 'pinBounce 2s ease-in-out infinite' }}>🏆</div>
        <div style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: 28, color: '#fde68a', letterSpacing: 2, marginBottom: 8 }}>YOU WIN!</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 20, lineHeight: 1.7 }}>
          You've accumulated <strong style={{ color: '#fde68a' }}>₹{zenCoins.toLocaleString()} ZenCoins</strong> — crushing the <strong style={{ color: '#fde68a' }}>₹{WIN_THRESHOLD.toLocaleString()}</strong> goal!<br />
          You've mastered the art of smart money management. 🎉
        </div>

        <div style={{
          background: 'rgba(251,191,36,0.1)', border: '2px solid rgba(251,191,36,0.3)',
          borderRadius: 20, padding: '18px 24px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>⚡ {zenCoins.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 800, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>ZenCoins Earned</div>
        </div>

        <button
          onClick={onClaim}
          style={{
            width: '100%', padding: '16px', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white', fontWeight: 900, fontSize: 17, fontFamily: 'system-ui',
            boxShadow: '0 8px 0 #92400e, 0 14px 40px rgba(245,158,11,0.5)',
            letterSpacing: '0.5px', transition: 'all 0.15s',
          }}
        >🗺️ Claim &amp; Go to Town Map!</button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 10, fontWeight: 600 }}>Use your ZenCoins to buy plots &amp; build your empire</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOW TO PLAY
// ═══════════════════════════════════════════════════════════════════════════
interface HowToPlayProps {
  onClose: () => void;
}

function HowToPlay({ onClose }: HowToPlayProps) {
  const steps: Array<{ icon: string; title: string; desc: string }> = [
    { icon: '🎲', title: 'Roll the Dice',    desc: 'Click the GO button or the dice to roll and move around the board.' },
    { icon: '🏁', title: 'Collect Salary',   desc: `Pass GO to earn ₹${GO_SALARY} ZenCoins as your salary each lap!` },
    { icon: '🏦', title: 'Save & Earn',      desc: 'Land on SAVE tiles to bank money. Land on EARN tiles for 10% interest!' },
    { icon: '🏠', title: 'Buy Properties',   desc: 'Own properties and collect rent every time you land on them.' },
    { icon: '⚠️', title: 'Avoid Scams',      desc: 'SCAM tiles test you — always ignore strangers asking for OTPs!' },
    { icon: '🏧', title: 'Use the ATM',      desc: 'Hit the ATM button to withdraw from savings. PIN: 1234' },
    { icon: '🏆', title: 'Win Condition',    desc: `Reach ₹${WIN_THRESHOLD.toLocaleString()} total ZenCoins to win and unlock the Town Map!` },
  ];

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 400, width: '100%',
        background: 'linear-gradient(160deg,#0f172a,#1e293b)',
        borderRadius: 28, border: '2px solid rgba(255,255,255,0.1)',
        padding: '28px 24px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        animation: 'slideInBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        maxHeight: '85vh', overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>🎮</div>
          <div style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: 22, color: 'white', marginTop: 8 }}>How To Play</div>
        </div>
        {steps.map(item => (
          <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', marginTop: 4, padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#1e40af)', color: 'white', fontWeight: 900, fontSize: 15, boxShadow: '0 5px 0 #1e3a8a' }}>
          Got it! Let&apos;s play! 🚀
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TILE MODAL
// ═══════════════════════════════════════════════════════════════════════════
const pStyle: React.CSSProperties = {
  color: '#475569', fontSize: 15, lineHeight: 1.7, textAlign: 'center',
  margin: '0 0 16px', fontFamily: 'system-ui, sans-serif',
};

interface ModalProps {
  tile: Tile;
  coins: number;
  savings: number;
  loanActive: boolean;
  loanRemaining: number;
  ownedTiles: number[];
  lapBonus: number | null;
  rentEarned: number | null;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  setSavings: React.Dispatch<React.SetStateAction<number>>;
  setLoanActive: React.Dispatch<React.SetStateAction<boolean>>;
  setLoanRemaining: React.Dispatch<React.SetStateAction<number>>;
  setOwnedTiles: React.Dispatch<React.SetStateAction<number[]>>;
  onClose: () => void;
}

function Modal({
  tile, coins, savings, loanActive, loanRemaining, ownedTiles,
  lapBonus, rentEarned,
  setCoins, setSavings, setLoanActive, setLoanRemaining, setOwnedTiles, onClose,
}: ModalProps) {
  const c = COLORS[tile.type];
  const isOwned = ownedTiles.includes(tile.id);

  interface BtnProps {
    onClick: () => void;
    disabled?: boolean;
    color: string;
    children: React.ReactNode;
  }
  const Btn = ({ onClick, disabled = false, color, children }: BtnProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, padding: '10px 6px', borderRadius: 16, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? '#e5e7eb' : color,
        color: disabled ? '#9ca3af' : 'white',
        fontWeight: 900, fontSize: 15, lineHeight: 1.4,
        boxShadow: disabled ? 'none' : '0 5px 0 rgba(0,0,0,0.25)',
        fontFamily: 'system-ui, sans-serif',
        transition: 'all 0.15s ease',
      }}
    >{children}</button>
  );

  interface InfoProps {
    l: string;
    v: string;
    color?: string;
  }
  const Info = ({ l, v, color }: InfoProps) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <span style={{ color: '#64748b', fontWeight: 600 }}>{l}</span>
      <strong style={{ color: color ?? '#0f172a', fontWeight: 800 }}>{v}</strong>
    </div>
  );

  const Box = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: c.fill, border: `2px solid ${c.accent}33`, borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
      {children}
    </div>
  );

  interface BannerProps {
    emoji: string;
    text: string;
    sub?: string;
    color: string;
  }
  const Banner = ({ emoji, text, sub, color }: BannerProps) => (
    <div style={{
      background: `${color}18`, border: `2px solid ${color}40`,
      borderRadius: 14, padding: '13px 16px', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'slideInBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <span style={{ fontSize: 28, flexShrink: 0 }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 900, fontSize: 17, color, lineHeight: 1.3 }}>{text}</div>
        {sub && <div style={{ fontSize: 13, color: '#64748b', marginTop: 3, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );

  const body = (): React.ReactNode => {
    switch (tile.type) {
      case 'start':
        return (
          <>
            {lapBonus !== null && (
              <Banner emoji="🎉" text={`+₹${lapBonus} ZenCoins!`} sub="You completed a lap and earned your salary!" color="#22c55e" />
            )}
            <p style={pStyle}>Every time you pass GO, you collect <strong>₹{GO_SALARY} ZenCoins</strong>. That's your salary for playing smart!</p>
            <Box><div style={{ textAlign: 'center', fontSize: 26, fontWeight: 900, color: c.accent }}>₹{GO_SALARY} every lap! 🏁</div></Box>
            <Btn onClick={onClose} color={c.accent}>Sweet! Let&apos;s roll! 🎲</Btn>
          </>
        );

      case 'save':
        return (
          <>
            <p style={pStyle}>Put <strong>₹50 ZenCoins</strong> in your savings account! Earn 10% interest on EARN tiles.</p>
            <Box>
              <Info l="Your wallet" v={`₹${coins}`} />
              <Info l="In savings"  v={`₹${savings}`} />
              {coins >= 50 && <Info l="After saving" v={`₹${coins - 50} wallet, ₹${savings + 50} saved`} color="#3b82f6" />}
            </Box>
            <Btn onClick={() => { if (coins >= 50) { setCoins(coins - 50); setSavings(savings + 50); } onClose(); }} disabled={coins < 50} color={c.accent}>
              {coins >= 50 ? 'Save ₹50! 🏦' : 'Not enough ZenCoins!'}
            </Btn>
          </>
        );

      case 'interest': {
        const bonus = Math.floor(savings * 0.1);
        return (
          <>
            <p style={pStyle}>Your savings earned interest! You get <strong>10% interest</strong> on whatever you&apos;ve saved.</p>
            <Box>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: bonus > 0 ? c.accent : '#cbd5e1' }}>+₹{bonus}</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 600 }}>10% of your ₹{savings} savings</div>
              </div>
            </Box>
            {bonus === 0 && <p style={{ ...pStyle, color: '#ef4444', fontSize: 13, margin: '0 0 12px', fontWeight: 700 }}>⚠️ Save some ZenCoins first to earn interest!</p>}
            <Btn onClick={() => { if (bonus > 0) setSavings(savings + bonus); onClose(); }} color={c.accent} disabled={bonus === 0}>
              {bonus > 0 ? 'Collect my interest! 💰' : 'Save first, then earn!'}
            </Btn>
          </>
        );
      }

      case 'scam':
        return (
          <>
            <p style={pStyle}>Oh no! Someone&apos;s trying to scam you! They&apos;re asking for your bank OTP. What should you do? 🤔</p>
            <Box>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 2, fontWeight: 600 }}>
                ⚠️ <strong>Give them the code</strong> → They steal ₹100 ZenCoins! 😱<br />
                ✅ <strong>Ignore &amp; report it</strong> → Bank rewards you ₹50! ✨
              </div>
            </Box>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn onClick={() => { setCoins(Math.max(0, coins - 100)); onClose(); }} color="#ef4444">
                Give Code<br /><span style={{ fontSize: 13, fontWeight: 600 }}>LOSE ₹100 😭</span>
              </Btn>
              <Btn onClick={() => { setCoins(coins + 50); onClose(); }} color="#22c55e">
                Ignore It!<br /><span style={{ fontSize: 13, fontWeight: 600 }}>GET ₹50 🎉</span>
              </Btn>
            </div>
          </>
        );

      case 'budget':
        return (
          <>
            <p style={pStyle}>Make a choice! <strong>Spend</strong> on something fun or <strong>save</strong> for something important? 🤓</p>
            <Box><Info l="Your wallet" v={`₹${coins}`} /></Box>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn onClick={() => { if (coins >= 100) setCoins(coins - 100); onClose(); }} disabled={coins < 100} color="#f97316">
                🚲 New Bike<br /><span style={{ fontSize: 13, fontWeight: 600 }}>₹100 (Want)</span>
              </Btn>
              <Btn onClick={() => { setSavings(savings + 50); onClose(); }} color="#a855f7">
                📚 Save for School<br /><span style={{ fontSize: 13, fontWeight: 600 }}>+₹50 Saved!</span>
              </Btn>
            </div>
          </>
        );

      case 'property':
        if (isOwned) {
          return (
            <>
              <Banner emoji="🏠" text="This is YOUR property!" sub={`You earn ₹${tile.rent} every time you land here!`} color="#f97316" />
              {rentEarned !== null && rentEarned > 0 && (
                <Banner emoji="💰" text={`You collected ₹${rentEarned}!`} sub="Your property is making you money!" color="#22c55e" />
              )}
              <Box>
                <Info l="Property name"    v={tile.label} />
                <Info l="You paid"         v={`₹${tile.price}`} />
                <Info l="Rent you collect" v={`₹${tile.rent}`} color="#22c55e" />
              </Box>
              <Btn onClick={onClose} color={c.accent}>That&apos;s my place! 🏠</Btn>
            </>
          );
        }
        return (
          <>
            <p style={pStyle}>Want to buy <strong>{tile.label}</strong>? Own it and collect ₹{tile.rent} rent every visit!</p>
            <Box>
              <Info l="Property cost"  v={`₹${tile.price}`} />
              <Info l="Rent per visit" v={`₹${tile.rent}`} color="#22c55e" />
              <Info l="Your wallet"    v={`₹${coins}`} />
              {loanActive && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8, fontWeight: 700 }}>⚠️ You have a loan! Still owe ₹{loanRemaining}</div>}
            </Box>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn onClick={() => {
                if (coins >= tile.price) { setCoins(coins - tile.price); setOwnedTiles(prev => [...prev, tile.id]); }
                onClose();
              }} disabled={coins < tile.price} color="#f97316">
                🏠 Buy It!<br /><span style={{ fontSize: 13, fontWeight: 600 }}>₹{tile.price}</span>
              </Btn>
              <Btn onClick={() => {
                if (!loanActive) { setCoins(coins + LOAN_AMOUNT); setLoanActive(true); setLoanRemaining(LOAN_REPAY); }
                onClose();
              }} disabled={loanActive} color="#ec4899">
                🏦 Get Loan<br /><span style={{ fontSize: 13, fontWeight: 600 }}>₹{LOAN_AMOUNT} now</span>
              </Btn>
            </div>
            <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer', background: '#f1f5f9', color: '#94a3b8', fontWeight: 800, fontSize: 14 }}>
              Skip — don&apos;t buy
            </button>
          </>
        );

      case 'loan':
        return (
          <>
            <p style={pStyle}>Borrow ₹{LOAN_AMOUNT} now, but pay back ₹{LOAN_REPAY} next time you pass GO — that&apos;s ₹{LOAN_REPAY - LOAN_AMOUNT} extra! 😬</p>
            <Box>
              <Info l="You get now"   v={`₹${LOAN_AMOUNT}`} color="#3b82f6" />
              <Info l="Pay back later" v={`₹${LOAN_REPAY}`} color="#ef4444" />
              <Info l="Interest cost" v={`₹${LOAN_REPAY - LOAN_AMOUNT}`} color="#ef4444" />
              {loanActive && <div style={{ marginTop: 8, fontSize: 13, color: '#ef4444', fontWeight: 700 }}>⚠️ You already have a loan! Pay it back first!</div>}
            </Box>
            <Btn onClick={() => {
              if (!loanActive) { setCoins(coins + LOAN_AMOUNT); setLoanActive(true); setLoanRemaining(LOAN_REPAY); }
              onClose();
            }} disabled={loanActive} color={c.accent}>
              {loanActive ? 'Already have loan! ⛔' : 'Borrow money 💳'}
            </Btn>
          </>
        );

      default:
        return (
          <>
            <p style={pStyle}>Lucky you! Free space — nothing to pay, nothing to do. Chill and enjoy the break! 😎</p>
            <Box><div style={{ textAlign: 'center', fontSize: 48, padding: '8px 0' }}>🌟</div></Box>
            <Btn onClick={onClose} color={c.accent}>Nice! Keep rolling! 🎲</Btn>
          </>
        );
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: '32px 32px 0 0', padding: '0 24px 36px', animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 -10px 60px rgba(0,0,0,0.3)' }}
      >
        <div style={{ width: 48, height: 5, background: '#cbd5e1', borderRadius: 3, margin: '14px auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: `0 8px 24px ${c.accent}66`, flexShrink: 0 }}>
            {tile.icon}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22, color: '#0f172a', fontFamily: 'Georgia,serif', lineHeight: 1.2 }}>{tile.label}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>
              Tile #{tile.id + 1} · Bankopoly{tile.type === 'property' && isOwned ? ' · ★ OWNED' : ''}
            </div>
          </div>
        </div>
        {body()}
        <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: 14, borderRadius: 14, border: 'none', cursor: 'pointer', background: '#f1f5f9', color: '#94a3b8', fontWeight: 800, fontSize: 14, letterSpacing: '0.4px', transition: 'all 0.15s' }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════════════════════
export default function BoardGame() {
  const [coins, setCoins]                        = useState<number>(300);
  const [savings, setSavings]                    = useState<number>(0);
  const [loanActive, setLoanActive]              = useState<boolean>(false);
  const [loanRemaining, setLoanRemaining]        = useState<number>(0);
  const [ownedTiles, setOwnedTiles]              = useState<number[]>([]);
  const [pos, setPos]                            = useState<number>(0);
  const [diceVal, setDiceVal]                    = useState<number>(1);
  const [rolling, setRolling]                    = useState<boolean>(false);
  const [modal, setModal]                        = useState<Tile | null>(null);
  const [lapBonus, setLapBonus]                  = useState<number | null>(null);
  const [rentEarned, setRentEarned]              = useState<number | null>(null);
  const [laps, setLaps]                          = useState<number>(0);
  const [rollSeed, setRollSeed]                  = useState<number>(0);
  const [showATM, setShowATM]                    = useState<boolean>(false);
  const [showHowTo, setShowHowTo]                = useState<boolean>(false);
  const [showWin, setShowWin]                    = useState<boolean>(false);

  const propValue = ownedTiles.reduce((s, id) => s + TILES[id].price, 0);
  const netWorth  = coins + savings + propValue - loanRemaining;
  const propCount = ownedTiles.length;

  useEffect(() => {
    if (netWorth >= WIN_THRESHOLD && !showWin) {
      setShowWin(true);
    }
  }, [netWorth, showWin]);

  const roll = () => {
    if (rolling || modal || showATM || showWin) return;
    setRolling(true);
    setLapBonus(null);
    setRentEarned(null);

    setTimeout(() => {
      const r       = Math.floor(Math.random() * 6) + 1;
      const next    = (pos + r) % 20;
      const crossedGo = (pos + r) >= 20;

      let newCoins = coins;

      if (crossedGo) {
        newCoins += GO_SALARY;
        setLapBonus(GO_SALARY);
        setLaps(l => l + 1);
      }

      if (crossedGo && loanActive) {
        const repay = Math.min(newCoins, loanRemaining);
        newCoins   -= repay;
        const rem   = loanRemaining - repay;
        setLoanRemaining(rem);
        if (rem <= 0) setLoanActive(false);
      }

      const landedTile = TILES[next];
      if (landedTile.type === 'property' && ownedTiles.includes(next)) {
        newCoins += landedTile.rent;
        setRentEarned(landedTile.rent);
      }

      setCoins(newCoins);
      setPos(next);
      setDiceVal(r);
      setRollSeed(s => s + 1);

      setTimeout(() => {
        setRolling(false);
        setModal(TILES[next]);
      }, 900);
    }, 650);
  };

  const withdrawFromSavings = (amount: number) => {
    setSavings(s => s - amount);
    setCoins(c => c + amount);
  };

  const CORN = 80;
  const CELL = 68;
  const N    = 5;
  const BS   = CORN * 2 + CELL * N;

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
    }}>
      <Town3D />

      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.06) 0%, transparent 60%)',
      }} />

      {/* ── TOP HUD ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        padding: '8px 16px', gap: 8,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '2px solid rgba(255,255,255,0.08)',
      }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            border: '2.5px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 3px 12px rgba(59,130,246,0.4)', flexShrink: 0,
          }}>🐠</div>
          <div style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: 14, color: 'rgba(255,255,255,0.9)', letterSpacing: 1 }}>BANKOPOLY</div>
        </div>

        {/* Stat pills */}
        {([
          { icon: '⚡', val: `₹${coins.toLocaleString()}`,    label: 'ZenCoins',  bg: 'rgba(251,191,36,0.12)',  bd: 'rgba(251,191,36,0.25)',  c: '#fde68a' },
          { icon: '🏦', val: `₹${savings.toLocaleString()}`,  label: 'Savings',   bg: 'rgba(52,211,153,0.12)', bd: 'rgba(52,211,153,0.25)', c: '#6ee7b7' },
          { icon: '🏠', val: `${propCount}`,                   label: 'Props',     bg: 'rgba(251,146,60,0.12)', bd: 'rgba(251,146,60,0.25)', c: '#fdba74' },
          { icon: '📊', val: `₹${netWorth.toLocaleString()}`, label: 'Net Worth', bg: 'rgba(167,139,250,0.12)', bd: 'rgba(167,139,250,0.25)', c: '#c4b5fd' },
        ] as Array<{ icon: string; val: string; label: string; bg: string; bd: string; c: string }>).map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: s.bg, border: `1.5px solid ${s.bd}`, borderRadius: 24, padding: '5px 12px' }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, color: s.c, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          </div>
        ))}

        {/* Win progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '5px 14px' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, whiteSpace: 'nowrap' }}>🏆 Win Goal</span>
          <div style={{ width: 80, height: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${Math.min(100, (netWorth / WIN_THRESHOLD) * 100)}%`,
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              transition: 'width 0.6s ease',
              boxShadow: '0 0 8px rgba(251,191,36,0.5)',
            }} />
          </div>
          <span style={{ fontSize: 11, color: '#fde68a', fontWeight: 800, whiteSpace: 'nowrap' }}>₹{WIN_THRESHOLD.toLocaleString()}</span>
        </div>

        {loanActive && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 800, color: '#fca5a5' }}>
            ⚠️ Loan ₹{loanRemaining}
          </div>
        )}

        {/* Right-side actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowATM(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.15))',
              border: '1.5px solid rgba(34,197,94,0.4)',
              borderRadius: 20, padding: '7px 14px',
              color: '#4ade80', fontWeight: 800, fontSize: 12,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 3px 12px rgba(34,197,94,0.2)',
            }}
          ><span style={{ fontSize: 16 }}>🏧</span><span>ATM</span></button>

          <button
            onClick={() => setShowHowTo(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: 20, padding: '7px 14px',
              color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: 12,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          ><span>❓</span><span>How to Play</span></button>

          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>
            Round {laps + 1} · Tile {pos + 1}/20
          </div>
        </div>
      </div>

      {/* ── MAIN BOARD AREA ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative', zIndex: 1,
      }}>

        {/* BOARD */}
        <div style={{ perspective: 1100, perspectiveOrigin: '50% 38%', flexShrink: 0, marginTop: '-100px' }}>
          <div style={{
            width: BS, height: BS,
            transform: 'rotateX(46deg) rotateZ(-38deg)',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 28px 48px rgba(0,0,0,0.9)) drop-shadow(0 8px 18px rgba(0,0,0,0.6))',
            animation: 'boardFloat 8s ease-in-out infinite',
          }}>
            <div style={{
              position: 'relative', width: BS, height: BS,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: 14,
              outline: '5px solid #92400e',
              boxShadow: '0 0 0 12px #d97706, 0 0 0 16px #78350f, 0 0 0 20px rgba(255,255,255,0.04), 0 32px 75px rgba(0,0,0,0.95)',
            }}>

              {/* CENTER */}
              <div style={{
                position: 'absolute', top: CORN, left: CORN,
                width: BS - CORN * 2, height: BS - CORN * 2,
                background: 'radial-gradient(ellipse at 40% 35%, #10b981 0%, #059669 50%, #047857 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 10, overflow: 'hidden',
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.4), inset 0 3px 0 rgba(255,255,255,0.1)',
                borderRadius: 4,
              }}>
                <div style={{ position: 'absolute', inset: 10, border: '2px solid rgba(255,255,255,0.08)', borderRadius: 6, pointerEvents: 'none' }} />

                <div style={{
                  fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 14,
                  color: 'rgba(255,255,255,0.98)',
                  textShadow: '0 3px 15px rgba(0,0,0,0.8)',
                  letterSpacing: 3, textAlign: 'center', lineHeight: 1.4,
                  background: 'rgba(0,0,0,0.3)',
                  padding: '6px 18px', borderRadius: 9,
                  border: '2px solid rgba(255,255,255,0.12)',
                }}>🏦<br />BANKOPOLY</div>

                {/* Mini progress */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#fde68a', fontWeight: 800 }}>🏆</span>
                  <div style={{ width: 60, height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(100, (netWorth / WIN_THRESHOLD) * 100)}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{Math.floor((netWorth / WIN_THRESHOLD) * 100)}%</span>
                </div>

                <div
                  onClick={rolling || !!modal ? undefined : roll}
                  style={{ filter: rolling ? 'drop-shadow(0 0 20px rgba(251,191,36,1))' : 'drop-shadow(0 5px 14px rgba(0,0,0,0.6))', transition: 'filter 0.3s', cursor: rolling || !!modal ? 'default' : 'pointer' }}
                  title={rolling ? 'Rolling…' : 'Click to roll!'}
                >
                  <Dice key={`d${rollSeed}`} value={diceVal} rolling={rolling} />
                </div>

                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.6px', color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 6px rgba(0,0,0,0.6)', textTransform: 'uppercase' }}>
                  {rolling ? '🎲 Rolling…' : `Rolled ${diceVal} · Tap to roll!`}
                </div>

                {propCount > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', maxWidth: 200, padding: '0 8px' }}>
                    {ownedTiles.map(id => (
                      <div key={id} style={{
                        background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)',
                        borderRadius: 16, padding: '2px 8px',
                        fontSize: 8, fontWeight: 900, color: 'white',
                        display: 'flex', alignItems: 'center', gap: 2,
                        textTransform: 'uppercase', letterSpacing: '0.3px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      }}>🏠 {TILES[id].label}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edges */}
              <div style={{ position: 'absolute', top: 0, left: CORN, width: BS - CORN * 2, height: CORN, display: 'grid', gridTemplateColumns: `repeat(${N},1fr)`, gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {TOP.map(id => <BTile key={id} tile={TILES[id]} active={pos === id} owned={ownedTiles.includes(id)} side="top" />)}
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: CORN, width: BS - CORN * 2, height: CORN, display: 'grid', gridTemplateColumns: `repeat(${N},1fr)`, gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {BOT.map(id => <BTile key={id} tile={TILES[id]} active={pos === id} owned={ownedTiles.includes(id)} side="bottom" />)}
              </div>
              <div style={{ position: 'absolute', right: 0, top: CORN, width: CORN, height: BS - CORN * 2, display: 'grid', gridTemplateRows: `repeat(${N},1fr)`, gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {RIGHT.map(id => <BTile key={id} tile={TILES[id]} active={pos === id} owned={ownedTiles.includes(id)} side="right" />)}
              </div>
              <div style={{ position: 'absolute', left: 0, top: CORN, width: CORN, height: BS - CORN * 2, display: 'grid', gridTemplateRows: `repeat(${N},1fr)`, gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {LEFT.map(id => <BTile key={id} tile={TILES[id]} active={pos === id} owned={ownedTiles.includes(id)} side="left" />)}
              </div>

              {/* Corners */}
              <div style={{ position: 'absolute', top: 0,    left: 0,   width: CORN, height: CORN, padding: 2, boxSizing: 'border-box' }}><Corner icon="🎲" top="Free Park" bg="#fefce8" border="#a16207" /></div>
              <div style={{ position: 'absolute', top: 0,    right: 0,  width: CORN, height: CORN, padding: 2, boxSizing: 'border-box' }}><Corner icon="❓" top="Chance"    bg="#dbeafe" border="#1e40af" /></div>
              <div style={{ position: 'absolute', bottom: 0, left: 0,   width: CORN, height: CORN, padding: 2, boxSizing: 'border-box' }}><Corner icon="🏁" top="Collect"   bot="← GO"  bg="#dcfce7" border="#15803d" /></div>
              <div style={{ position: 'absolute', bottom: 0, right: 0,  width: CORN, height: CORN, padding: 2, boxSizing: 'border-box' }}><Corner icon="🚔" top="Jail"                  bg="#fee2e2" border="#b91c1c" /></div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Roll button */}
          <button
            onClick={roll}
            disabled={rolling || !!modal}
            style={{
              width: 110, height: 110, borderRadius: '50%',
              background: rolling || !!modal ? 'linear-gradient(145deg, #64748b, #475569)' : 'linear-gradient(145deg, #f87171, #ef4444)',
              border: '5px solid white',
              boxShadow: rolling || !!modal
                ? '0 4px 0 #1e293b, 0 8px 20px rgba(0,0,0,0.5)'
                : '0 10px 0 #991b1b, 0 16px 40px rgba(239,68,68,0.6), inset 0 2px 0 rgba(255,255,255,0.25)',
              cursor: rolling || !!modal ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              transform: rolling ? 'translateY(7px)' : 'translateY(0)',
              transition: 'all 0.16s cubic-bezier(0.34,1.56,0.64,1)',
              outline: 'none', position: 'relative', overflow: 'hidden',
            }}
          >
            {!(rolling || !!modal) && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2), transparent 65%)', pointerEvents: 'none' }} />}
            <span style={{ fontSize: rolling ? 32 : 40, fontWeight: 900, color: 'white', textShadow: '0 3px 10px rgba(0,0,0,0.5)', fontFamily: 'Georgia,serif', lineHeight: 1, position: 'relative', zIndex: 1 }}>
              {rolling ? '🎲' : 'GO'}
            </span>
            {!rolling && (
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 900, position: 'relative', zIndex: 1, marginTop: 4, letterSpacing: '1.2px', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                ROLL!
              </span>
            )}
          </button>

          {/* Stat cards */}
          {([
            { icon: '⚡', label: 'ZENCOINS', val: `₹${coins}`,    color: '#fbbf24' },
            { icon: '🏦', label: 'SAVINGS',  val: `₹${savings}`,  color: '#34d399' },
            { icon: '🏠', label: 'PROPS',    val: `${propCount}`,  color: '#fb923c' },
            { icon: '📊', label: 'WORTH',    val: `₹${netWorth}`, color: '#a78bfa' },
          ] as Array<{ icon: string; label: string; val: string; color: string }>).map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '9px 12px', textAlign: 'center', width: 136, backdropFilter: 'blur(12px)', boxShadow: '0 3px 14px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: s.color, lineHeight: 1.2, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginTop: 2, letterSpacing: '0.7px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}

          <button
            onClick={() => setShowATM(true)}
            style={{
              width: 136, padding: '10px 12px', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,185,129,0.12))',
              border: '1.5px solid rgba(34,197,94,0.35)',
              color: '#4ade80', fontWeight: 900, fontSize: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s', letterSpacing: '0.4px',
              boxShadow: '0 3px 12px rgba(34,197,94,0.15)',
            }}
          >🏧 ATM</button>

          {/* Progress ring */}
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <svg width="64" height="64" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
              <circle cx="32" cy="32" r="25" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
              <circle cx="32" cy="32" r="25" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 25}`}
                strokeDashoffset={`${2 * Math.PI * 25 * (1 - (pos + 1) / 20)}`}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: 'white', lineHeight: 1, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>{pos + 1}</span>
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontWeight: 700, lineHeight: 1 }}>/20</span>
            </div>
          </div>
        </div>

        {/* Overlays */}
        {modal && !showWin && (
          <Modal
            tile={modal}
            coins={coins}
            savings={savings}
            loanActive={loanActive}
            loanRemaining={loanRemaining}
            ownedTiles={ownedTiles}
            lapBonus={lapBonus}
            rentEarned={rentEarned}
            setCoins={setCoins}
            setSavings={setSavings}
            setLoanActive={setLoanActive}
            setLoanRemaining={setLoanRemaining}
            setOwnedTiles={setOwnedTiles}
            onClose={() => setModal(null)}
          />
        )}
        {showATM    && <ATMModal savings={savings} onWithdraw={withdrawFromSavings} onClose={() => setShowATM(false)} />}
        {showHowTo  && <HowToPlay onClose={() => setShowHowTo(false)} />}
        {showWin    && <WinModal zenCoins={netWorth} onClaim={() => { window.location.href = '/'; }} />}
      </div>

      <style>{`
        @keyframes fadeIn        { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp       { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes slideInBounce {
          0%   { transform:translateX(-20px) scale(0.9); opacity:0 }
          60%  { transform:translateX(5px)   scale(1.02); opacity:1 }
          100% { transform:translateX(0)     scale(1) }
        }
        @keyframes boardFloat {
          0%,100% { transform:rotateX(46deg) rotateZ(-38deg) translateZ(0) }
          50%     { transform:rotateX(46deg) rotateZ(-38deg) translateZ(10px) }
        }
        @keyframes pinBounce {
          0%,100% { transform:translateY(0)  scale(1) }
          50%     { transform:translateY(-5px) scale(1.08) }
        }
        @keyframes diceRoll {
          0%   { transform:rotate(0deg)   scale(1.06) }
          25%  { transform:rotate(90deg)  scale(0.94) }
          50%  { transform:rotate(180deg) scale(1.06) }
          75%  { transform:rotate(270deg) scale(0.94) }
          100% { transform:rotate(360deg) scale(1.06) }
        }
        @keyframes diceLand {
          0%   { transform:scale(0.75) rotate(-12deg) }
          60%  { transform:scale(1.15) rotate(6deg)   }
          80%  { transform:scale(0.95) rotate(-3deg)  }
          100% { transform:scale(1)    rotate(0deg)   }
        }
        input:focus          { border-color: rgba(34,197,94,0.6) !important; outline: none; }
        input::placeholder   { color: rgba(255,255,255,0.2); }
        input[type=number]   { -moz-appearance: textfield; }
        input::-webkit-inner-spin-button,
        input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}