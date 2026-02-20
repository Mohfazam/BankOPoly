'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Town3D } from './Town3D';
import { useGameStore } from '../Store/useGameStore';

// ═══════════════════════════════════════════════════════════════════════════
// SOUND ENGINE — Web Audio API, no external deps
// ═══════════════════════════════════════════════════════════════════════════
function useSound() {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx.current;
  };

  const play = useCallback((type: 'roll' | 'coin' | 'scam' | 'buy' | 'sad' | 'cheer' | 'unlock') => {
    try {
      const ac = getCtx();
      const now = ac.currentTime;

      const osc = (freq: number, start: number, dur: number, gainVal: number, shape: OscillatorType = 'sine') => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = shape;
        o.frequency.setValueAtTime(freq, now + start);
        g.gain.setValueAtTime(0, now + start);
        g.gain.linearRampToValueAtTime(gainVal, now + start + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        o.connect(g); g.connect(ac.destination);
        o.start(now + start); o.stop(now + start + dur);
      };

      if (type === 'roll') {
        for (let i = 0; i < 6; i++) osc(120 + Math.random() * 200, i * 0.08, 0.07, 0.15, 'square');
      } else if (type === 'coin') {
        osc(880, 0, 0.12, 0.2); osc(1100, 0.1, 0.15, 0.15); osc(1320, 0.2, 0.2, 0.12);
      } else if (type === 'scam') {
        osc(180, 0, 0.3, 0.3, 'sawtooth'); osc(160, 0.15, 0.3, 0.25, 'sawtooth');
      } else if (type === 'buy') {
        osc(440, 0, 0.08, 0.2); osc(554, 0.06, 0.08, 0.18); osc(659, 0.12, 0.15, 0.15); osc(880, 0.2, 0.2, 0.12);
      } else if (type === 'sad') {
        const o = ac.createOscillator(); const g = ac.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(440, now); o.frequency.linearRampToValueAtTime(220, now + 0.4);
        g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 0.5);
      } else if (type === 'cheer') {
        [523, 659, 784, 1047].forEach((f, i) => osc(f, i * 0.12, 0.2, 0.18));
      } else if (type === 'unlock') {
        // Triumphant fanfare for house unlock
        [523, 659, 784, 880, 1047, 1318].forEach((f, i) => osc(f, i * 0.11, 0.28, 0.22));
        osc(1568, 0.7, 0.6, 0.18);
      }
    } catch (_) {}
  }, []);

  return play;
}

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
const WIN_THRESHOLD = 2000;
const HOUSE_BONUS  = 500;
const ATM_PIN      = '1234';

const TOP:   number[] = [0, 1, 2, 3, 4];
const RIGHT: number[] = [5, 6, 7, 8, 9];
const BOT:   number[] = [14, 13, 12, 11, 10];
const LEFT:  number[] = [19, 18, 17, 16, 15];

const COLORS: Record<TileType, { bg: string; border: string; text: string; strip: string }> = {
  start:    { bg: '#dcfce7', border: '#16a34a', text: '#15803d', strip: '#16a34a' },
  save:     { bg: '#dbeafe', border: '#2563eb', text: '#1e40af', strip: '#2563eb' },
  interest: { bg: '#ccfbf1', border: '#0d9488', text: '#0f766e', strip: '#0d9488' },
  scam:     { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c', strip: '#dc2626' },
  budget:   { bg: '#f3e8ff', border: '#9333ea', text: '#7e22ce', strip: '#9333ea' },
  property: { bg: '#ffedd5', border: '#ea580c', text: '#c2410c', strip: '#ea580c' },
  loan:     { bg: '#fce7f3', border: '#db2777', text: '#be185d', strip: '#db2777' },
  normal:   { bg: '#f0fdf4', border: '#4ade80', text: '#16a34a', strip: '#4ade80' },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXTRA TYPES
// ═══════════════════════════════════════════════════════════════════════════
interface FloatingText {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

type TileReaction = 'scam' | 'coin' | 'firework' | null;

interface TurnEntry {
  id: number;
  rolled: number;
  tile: string;
  tileIcon: string;
  changes: string[];
  netChange: number;
}

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

function Dice({ value, rolling }: { value: number; rolling: boolean }) {
  const dots = FACES[value] ?? FACES[1];
  return (
    <div style={{
      width: 72, height: 72,
      borderRadius: 14,
      background: 'white',
      border: '3px solid #e5e7eb',
      boxShadow: rolling ? '0 0 0 4px #fbbf24, 0 4px 0 #d1d5db' : '0 4px 0 #d1d5db',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      padding: 10,
      gap: 2,
      animation: rolling ? 'diceRoll 0.12s linear infinite' : 'diceLand 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      userSelect: 'none',
      cursor: rolling ? 'wait' : 'pointer',
    }}>
      {dots.map((on, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {on && (
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1e293b' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOARD TILE
// ═══════════════════════════════════════════════════════════════════════════
function BTile({ tile, active, owned, side, reaction, stepping }: {
  tile: Tile; active: boolean; owned: boolean;
  side: 'top'|'bottom'|'left'|'right';
  reaction?: TileReaction;
  stepping?: boolean;
}) {
  const c = COLORS[tile.type];
  const isH = side === 'top' || side === 'bottom';

  const stripStyle: React.CSSProperties =
    side === 'top'    ? { top: 0, left: 0, right: 0, height: 6 } :
    side === 'bottom' ? { bottom: 0, left: 0, right: 0, height: 6 } :
    side === 'left'   ? { left: 0, top: 0, bottom: 0, width: 6 } :
                        { right: 0, top: 0, bottom: 0, width: 6 };

  const reactionOverlay = reaction === 'scam'
    ? { bg: 'rgba(254,226,226,0.95)', anim: 'tileShake 0.5s ease', content: '🚨' }
    : reaction === 'coin'
    ? { bg: 'rgba(220,252,231,0.95)', anim: 'coinPop 0.6s ease', content: '💰' }
    : reaction === 'firework'
    ? { bg: 'rgba(255,237,213,0.95)', anim: 'coinPop 0.5s ease', content: '🎉' }
    : null;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: owned && tile.type === 'property' ? '#fef9c3' : c.bg,
      border: `2.5px solid ${owned && tile.type === 'property' ? '#ca8a04' : c.border}`,
      borderRadius: 6,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      boxSizing: 'border-box',
      outline: active ? '3px solid #fbbf24' : stepping ? '2px dashed #94a3b8' : 'none',
      outlineOffset: '-1px',
      animation: reaction === 'scam' ? 'tileShake 0.5s ease' : undefined,
    }}>
      <div style={{ position: 'absolute', background: owned && tile.type === 'property' ? '#ca8a04' : c.strip, ...stripStyle }} />
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 1,
        padding: side === 'top' ? '9px 2px 2px' : side === 'bottom' ? '2px 2px 9px' : side === 'left' ? '2px 2px 2px 9px' : '2px 9px 2px 2px',
        width: '100%', height: '100%',
        boxSizing: 'border-box',
        writingMode: isH ? 'horizontal-tb' : 'vertical-lr',
        transform: side === 'left' ? 'scaleX(-1)' : 'none',
      }}>
        <span style={{ fontSize: isH ? 22 : 18, lineHeight: 1 }}>{tile.icon}</span>
        <span style={{
          fontSize: isH ? 7 : 6, fontWeight: 800,
          color: owned && tile.type === 'property' ? '#92400e' : c.text,
          textAlign: 'center', lineHeight: 1.1,
          textTransform: 'uppercase', letterSpacing: '0.2px',
          fontFamily: '"Nunito", system-ui, sans-serif',
        }}>{tile.label}</span>
        {owned && tile.type === 'property' && (
          <span style={{ fontSize: 6, fontWeight: 900, color: '#d97706' }}>★</span>
        )}
      </div>

      {stepping && !active && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15, background: 'rgba(241,245,249,0.85)' }}>
          <div style={{ fontSize: 16, animation: 'tokenHop 0.25s ease-out' }}>🔵</div>
        </div>
      )}

      {active && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, background: 'rgba(255,251,235,0.93)' }}>
          <div style={{ animation: 'pinBounce 1s ease-in-out infinite', textAlign: 'center' }}>
            <div style={{ fontSize: 22 }}>📍</div>
            <div style={{ fontSize: 6, fontWeight: 900, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.4px' }}>YOU</div>
          </div>
        </div>
      )}

      {reactionOverlay && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25, background: reactionOverlay.bg, animation: reactionOverlay.anim }}>
          <span style={{ fontSize: 24 }}>{reactionOverlay.content}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CORNER
// ═══════════════════════════════════════════════════════════════════════════
function Corner({ icon, top, bot, bg, border }: { icon: string; top: string; bot?: string; bg: string; border: string }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      border: `2.5px solid ${border}`, borderRadius: 6,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 3, boxSizing: 'border-box',
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 7, fontWeight: 800, color: border, textAlign: 'center', lineHeight: 1.3, textTransform: 'uppercase', fontFamily: '"Nunito", system-ui' }}>{top}</span>
      {bot && <span style={{ fontSize: 8, fontWeight: 900, color: border, fontFamily: 'Georgia, serif' }}>{bot}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ATM MODAL
// ═══════════════════════════════════════════════════════════════════════════
type ATMStep = 'pin' | 'amount' | 'success';
function ATMModal({ savings, onWithdraw, onClose }: { savings: number; onWithdraw: (n: number) => void; onClose: () => void }) {
  const [pin, setPin]       = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep]     = useState<ATMStep>('pin');
  const [error, setError]   = useState('');

  const confirmPin = () => {
    if (pin === ATM_PIN) { setStep('amount'); setError(''); }
    else { setError('Wrong PIN! Try again.'); setPin(''); }
  };
  const confirmWithdraw = () => {
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) { setError('Enter a valid amount!'); return; }
    if (amt > savings) { setError(`Only ₹${savings} saved!`); return; }
    if (amt % 50 !== 0) { setError('Use multiples of ₹50!'); return; }
    onWithdraw(amt);
    setStep('success');
    setTimeout(onClose, 1600);
  };
  const presets = [50, 100, 150, 200].filter(v => v <= savings);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 320, background: '#1e293b', borderRadius: 24, border: '3px solid #16a34a', overflow: 'hidden', animation: 'slideInBounce 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ background: '#15803d', padding: '18px 22px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏧</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: 'white', fontFamily: '"Nunito", system-ui' }}>ZenCoins ATM</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Savings: ₹{savings}</div>
          </div>
        </div>
        <div style={{ padding: '18px 20px 22px' }}>
          {step === 'pin' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Enter your 4-digit PIN</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: 44, height: 52, borderRadius: 10, background: pin.length > i ? '#16a34a' : '#334155', border: `2px solid ${pin.length > i ? '#4ade80' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#4ade80', fontWeight: 900 }}>{pin.length > i ? '●' : ''}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#86efac', fontWeight: 700 }}>💡 Hint: Try 1234</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
                {['1','2','3','4','5','6','7','8','9','DEL','0','✓'].map(k => (
                  <button key={k} onClick={() => k === '✓' ? confirmPin() : k === 'DEL' ? setPin(p => p.slice(0,-1)) : pin.length < 4 && setPin(p => p + k)}
                    style={{ padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer', background: k === '✓' ? '#16a34a' : k === 'DEL' ? '#7f1d1d' : '#334155', color: 'white', fontSize: k === '✓' || k === 'DEL' ? 15 : 17, fontWeight: 900 }}>
                    {k}
                  </button>
                ))}
              </div>
              {error && <div style={{ textAlign: 'center', color: '#fca5a5', fontSize: 12, fontWeight: 800, padding: '6px 10px', background: '#7f1d1d', borderRadius: 8 }}>{error}</div>}
            </>
          )}
          {step === 'amount' && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>How much?</div>
              {presets.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 12 }}>
                  {presets.map(v => (
                    <button key={v} onClick={() => setAmount(String(v))} style={{ padding: '10px', borderRadius: 10, border: `2px solid ${amount === String(v) ? '#4ade80' : '#475569'}`, cursor: 'pointer', background: amount === String(v) ? '#166534' : '#334155', color: amount === String(v) ? '#4ade80' : 'rgba(255,255,255,0.7)', fontWeight: 900, fontSize: 15 }}>₹{v}</button>
                  ))}
                </div>
              )}
              <input type="number" placeholder="Custom amount..." value={amount} onChange={e => setAmount(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: '#334155', border: '2px solid #475569', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 15, fontWeight: 700, outline: 'none', fontFamily: 'system-ui', marginBottom: 8 }} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textAlign: 'center', marginBottom: 10 }}>Multiples of ₹50 · Max ₹{savings}</div>
              {error && <div style={{ textAlign: 'center', color: '#fca5a5', fontSize: 12, fontWeight: 800, padding: '6px 10px', background: '#7f1d1d', borderRadius: 8, marginBottom: 10 }}>{error}</div>}
              <button onClick={confirmWithdraw} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#16a34a', color: 'white', fontWeight: 900, fontSize: 16, fontFamily: 'system-ui' }}>💸 Withdraw Cash</button>
            </>
          )}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: '"Nunito", system-ui' }}>Withdrawn!</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6, fontWeight: 600 }}>₹{amount} added to wallet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOUSE UNLOCK OVERLAY — full-screen cinematic celebration
// ═══════════════════════════════════════════════════════════════════════════
function HouseUnlockOverlay({ netWorth, onDone }: { netWorth: number; onDone: () => void }) {
  const [phase, setPhase] = useState<'flash' | 'reveal' | 'bonus' | 'done'>('flash');
  const [bonusVisible, setBonusVisible] = useState(false);
  const [confetti] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.6,
      dur: 2.0 + Math.random() * 1.2,
      size: 7 + Math.random() * 9,
      color: ['#fbbf24','#ef4444','#3b82f6','#10b981','#f97316','#a855f7','#ec4899','#fde68a'][i % 8],
      rotation: Math.random() * 360,
      shape: i % 3,
    }))
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 350);
    const t2 = setTimeout(() => { setPhase('bonus'); setBonusVisible(true); }, 1400);
    const t3 = setTimeout(() => setPhase('done'), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: phase === 'flash'
          ? 'rgba(255,255,255,0.95)'
          : 'radial-gradient(ellipse at 50% 40%, #1a0a3e 0%, #0a0a1a 100%)',
        transition: 'background 0.45s ease',
        willChange: 'background',
      }} />

      {phase !== 'flash' && confetti.map(c => (
        <div key={c.id} style={{
          position: 'absolute',
          left: `${c.x}%`,
          top: '-20px',
          width: c.size,
          height: c.size,
          borderRadius: c.shape === 0 ? '50%' : c.shape === 1 ? '2px' : '0',
          background: c.shape === 2 ? 'transparent' : c.color,
          fontSize: c.shape === 2 ? c.size + 4 : undefined,
          lineHeight: 1,
          color: c.color,
          animation: `confettiFall ${c.dur}s ${c.delay}s linear infinite`,
          willChange: 'transform',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          {c.shape === 2 ? '★' : null}
        </div>
      ))}

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: phase === 'flash' ? undefined : 'houseUnlockReveal 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: phase === 'flash' ? 0 : 1,
        willChange: 'transform, opacity',
      }}>
        {[1, 2].map(r => (
          <div key={r} style={{
            position: 'absolute',
            width: 300 + r * 80,
            height: 300 + r * 80,
            borderRadius: '50%',
            border: `2px solid rgba(251,191,36,${0.14 - r * 0.04})`,
            animation: `pulseRing 2.2s ${r * 0.35}s ease-out infinite`,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
          }} />
        ))}

        <div style={{
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(251,191,36,0.4)',
          borderRadius: 50,
          padding: '5px 22px',
          marginBottom: 14,
          fontSize: 11,
          fontWeight: 900,
          color: '#fde68a',
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontFamily: '"Nunito", system-ui',
          animation: phase !== 'flash' ? 'fadeSlideDown 0.5s 0.2s both ease-out' : undefined,
        }}>
          🏆 Goal Reached!
        </div>

        <div style={{
          width: 290,
          background: 'linear-gradient(160deg, #1e3a5f 0%, #0f2040 100%)',
          borderRadius: 26,
          border: '3px solid #fbbf24',
          boxShadow: '0 0 50px rgba(251,191,36,0.3), 0 16px 48px rgba(0,0,0,0.55)',
          overflow: 'hidden',
          marginBottom: 16,
          willChange: 'transform',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #d97706, #fbbf24, #d97706)',
            padding: '3px 0',
            textAlign: 'center',
            fontSize: 9,
            fontWeight: 900,
            color: '#78350f',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            ★ PURCHASABLE LAND UNLOCKED ★
          </div>

          <div style={{ padding: '20px 22px 18px', textAlign: 'center' }}>
            <div style={{
              fontSize: 72,
              lineHeight: 1,
              marginBottom: 6,
              animation: 'houseBounce 0.6s 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
              filter: 'drop-shadow(0 6px 18px rgba(251,191,36,0.45))',
            }}>
              🏡
            </div>

            <div style={{
              fontFamily: 'Georgia, serif',
              fontWeight: 900,
              fontSize: 22,
              color: '#fef08a',
              letterSpacing: 1,
              marginBottom: 6,
              textShadow: '0 2px 8px rgba(251,191,36,0.4)',
              animation: 'fadeSlideUp 0.5s 0.7s both ease-out',
            }}>
              Land Unlocked!
            </div>

            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.65)',
              fontWeight: 700,
              lineHeight: 1.55,
              marginBottom: 16,
              animation: 'fadeSlideUp 0.5s 0.85s both ease-out',
            }}>
              You've unlocked purchasable land in your Town.<br />
              Use your wealth to buy a plot and build your empire! 🏗️
            </div>

            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.35), transparent)',
              marginBottom: 14,
            }} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              animation: 'fadeSlideUp 0.5s 1s both ease-out',
            }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '9px 6px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Your Wealth</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fbbf24' }}>₹{netWorth.toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(21,128,61,0.22)', borderRadius: 10, padding: '9px 6px', border: '1px solid rgba(74,222,128,0.18)' }}>
                <div style={{ fontSize: 9, color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Bonus</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#4ade80' }}>+₹{HOUSE_BONUS}</div>
              </div>
            </div>
          </div>
        </div>

        {bonusVisible && (
          <div style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            border: '3px solid #4ade80',
            borderRadius: 18,
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 0 32px rgba(74,222,128,0.35), 0 6px 0 #14532d',
            animation: 'bonusPop 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            marginBottom: 18,
            willChange: 'transform',
          }}>
            <span style={{ fontSize: 24 }}>💰</span>
            <div>
              <div style={{ fontSize: 10, color: '#86efac', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>Land Purchase Bonus</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'white', fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>+₹{HOUSE_BONUS} Coins!</div>
            </div>
            <span style={{ fontSize: 24 }}>🎉</span>
          </div>
        )}

        {phase === 'done' && (
          <button
            onClick={onDone}
            style={{
              padding: '14px 44px',
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#78350f',
              fontWeight: 900,
              fontSize: 16,
              fontFamily: '"Nunito", system-ui',
              boxShadow: '0 5px 0 #d97706, 0 7px 20px rgba(251,191,36,0.35)',
              letterSpacing: 1,
              animation: 'fadeSlideUp 0.5s ease-out',
            }}
          >
            🗺️ Go to Town Map!
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WIN MODAL
// ═══════════════════════════════════════════════════════════════════════════
function WinModal({ zenCoins, savings, scamsAvoided, interestEarned, onClaim }: { zenCoins: number; savings: number; scamsAvoided: number; interestEarned: number; onClaim: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ maxWidth: 360, width: '100%', animation: 'slideInBounce 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>

        <div style={{ background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)', borderRadius: 22, border: '3px solid #d97706', padding: '18px 20px 14px', textAlign: 'center', marginBottom: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 36, animation: 'pinBounce 1.5s ease-in-out infinite' }}>🏆</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 24, color: '#92400e', letterSpacing: 2, lineHeight: 1 }}>YOU WIN!</div>
              <div style={{ fontSize: 11, color: '#a16207', fontWeight: 700, marginTop: 2 }}>Goal reached · ₹{zenCoins.toLocaleString()} net worth</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.07)', border: '2px solid #d97706', borderRadius: 14, padding: '8px 14px', marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>🏡</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#92400e' }}>Purchasable land unlocked!</div>
              <div style={{ fontSize: 11, color: '#a16207', fontWeight: 700 }}>Head to Town Map to build your empire</div>
            </div>
            <div style={{ background: '#16a34a', borderRadius: 10, padding: '4px 9px', fontSize: 12, fontWeight: 900, color: 'white', whiteSpace: 'nowrap' }}>+₹{HOUSE_BONUS}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {[
              { icon: '💰', label: 'Saved', val: `₹${savings}` },
              { icon: '📈', label: 'Interest', val: `₹${interestEarned}` },
              { icon: '🛡️', label: 'Scams', val: `${scamsAvoided} dodged` },
            ].map(r => (
              <div key={r.label} style={{ background: 'rgba(0,0,0,0.07)', borderRadius: 10, padding: '7px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 14 }}>{r.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#92400e', marginTop: 2 }}>{r.val}</div>
                <div style={{ fontSize: 9, color: '#a16207', fontWeight: 700 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClaim} style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', fontWeight: 900, fontSize: 16, fontFamily: '"Nunito", system-ui', boxShadow: '0 5px 0 #14532d, 0 6px 18px rgba(21,128,61,0.4)', letterSpacing: 1 }}>
          🏡 Claim Land + ₹{HOUSE_BONUS} Bonus!
        </button>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontWeight: 600, textAlign: 'center' }}>Wealth saved to your Town — go build!</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOW TO PLAY
// ═══════════════════════════════════════════════════════════════════════════
function HowToPlay({ onClose }: { onClose: () => void }) {
  const steps = [
    { icon: '🎲', title: 'Roll the Dice',   desc: `Click GO or the dice to roll and move around the board!` },
    { icon: '🏁', title: 'Collect Salary',  desc: `Pass GO and collect ₹${GO_SALARY} ZenCoins — your paycheck!` },
    { icon: '🏦', title: 'Save Money',      desc: 'Land on SAVE tiles to put coins in your savings account.' },
    { icon: '💰', title: 'Earn Interest',   desc: 'Land on EARN — get 10% bonus on your total savings! Free money!' },
    { icon: '🏠', title: 'Buy Properties',  desc: 'Own properties and collect rent when you land on them again.' },
    { icon: '⚠️', title: 'Avoid Scams',    desc: 'SCAM tiles: never share OTPs! Ignore and earn ₹50 reward. 🎉' },
    { icon: '🏧', title: 'Use the ATM',     desc: 'Withdraw from savings anytime. PIN: 1234. Spend in multiples of ₹50.' },
    { icon: '🏆', title: 'Win!',            desc: `Build ₹${WIN_THRESHOLD.toLocaleString()} net worth to win and unlock a House in your Town!` },
  ];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 380, width: '100%', background: 'white', borderRadius: 24, border: '3px solid #e5e7eb', padding: '24px 22px', maxHeight: '85vh', overflowY: 'auto', animation: 'slideInBounce 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 36 }}>🎮</div>
          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 22, color: '#0f172a', marginTop: 6 }}>How To Play</div>
        </div>
        {steps.map(item => (
          <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start', padding: '10px 12px', background: '#f8fafc', borderRadius: 12, border: '2px solid #e2e8f0' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, fontFamily: '"Nunito", system-ui' }}>{item.title}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', marginTop: 4, padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#2563eb', color: 'white', fontWeight: 900, fontSize: 15, fontFamily: '"Nunito", system-ui', boxShadow: '0 4px 0 #1e40af' }}>
          Got it! Let&apos;s play! 🚀
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TURN SUMMARY STRIP — left panel
// ═══════════════════════════════════════════════════════════════════════════
function TurnSummary({ entries }: { entries: TurnEntry[] }) {
  return (
    <div style={{
      position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
      width: 168, display: 'flex', flexDirection: 'column', gap: 6,
      zIndex: 5,
    }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2, textAlign: 'center' }}>📋 Turn Log</div>
      {entries.length === 0 && (
        <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: 12, padding: '12px 10px', textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
          Roll the dice to start!
        </div>
      )}
      {entries.slice().reverse().map((e, i) => (
        <div key={e.id} style={{
          background: 'white', border: `2px solid ${i === 0 ? '#fbbf24' : '#e2e8f0'}`,
          borderRadius: 12, padding: '8px 10px',
          opacity: i === 0 ? 1 : Math.max(0.5, 1 - i * 0.18),
          animation: i === 0 ? 'slideInLeft 0.35s cubic-bezier(0.34,1.56,0.64,1)' : undefined,
          boxShadow: i === 0 ? '0 2px 8px rgba(251,191,36,0.2)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 14 }}>{e.tileIcon}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>{e.tile}</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 900, background: '#f1f5f9', borderRadius: 8, padding: '1px 6px', color: '#475569' }}>🎲{e.rolled}</div>
          </div>
          {e.changes.map((c, ci) => (
            <div key={ci} style={{ fontSize: 10, fontWeight: 700, color: c.startsWith('+') ? '#15803d' : c.startsWith('-') ? '#b91c1c' : '#64748b', lineHeight: 1.5 }}>{c}</div>
          ))}
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 900, color: e.netChange > 0 ? '#15803d' : e.netChange < 0 ? '#b91c1c' : '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: 3 }}>
            {e.netChange > 0 ? `+₹${e.netChange}` : e.netChange < 0 ? `-₹${Math.abs(e.netChange)}` : 'No change'}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ModalProps {
  tile: Tile;
  coins: number;
  savings: number;
  loanActive: boolean;
  loanRemaining: number;
  ownedTiles: number[];
  lapBonus: number | null;
  rentEarned: number | null;
  streak: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  setSavings: React.Dispatch<React.SetStateAction<number>>;
  setLoanActive: React.Dispatch<React.SetStateAction<boolean>>;
  setLoanRemaining: React.Dispatch<React.SetStateAction<number>>;
  setOwnedTiles: React.Dispatch<React.SetStateAction<number[]>>;
  onWalletShake: () => void;
  onScamAvoided: () => void;
  onInterestEarned: (n: number) => void;
  onClose: () => void;
  // ── NEW store callbacks (additive — nothing existing removed) ──
  onSaved: (amount: number) => void;
  onScamFailed: () => void;
  onLoanTaken: () => void;
}

function Modal({ tile, coins, savings, loanActive, loanRemaining, ownedTiles, lapBonus, rentEarned, streak, setCoins, setSavings, setLoanActive, setLoanRemaining, setOwnedTiles, onWalletShake, onScamAvoided, onInterestEarned, onClose, onSaved, onScamFailed, onLoanTaken }: ModalProps) {
  const c = COLORS[tile.type];
  const isOwned = ownedTiles.includes(tile.id);

  const [selectedSave, setSelectedSave] = useState(50);
  const [customSaveStr, setCustomSaveStr] = useState('');

  const Btn = ({ onClick, disabled = false, bg, shadow, children }: { onClick: () => void; disabled?: boolean; bg: string; shadow: string; children: React.ReactNode }) => (
    <button onClick={() => { if (disabled) { onWalletShake(); return; } onClick(); }} style={{ flex: 1, padding: '11px 8px', borderRadius: 14, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: disabled ? '#e2e8f0' : bg, color: disabled ? '#94a3b8' : 'white', fontWeight: 900, fontSize: 14, boxShadow: disabled ? 'none' : `0 4px 0 ${shadow}`, fontFamily: '"Nunito", system-ui', transition: 'all 0.1s', lineHeight: 1.4 }}>{children}</button>
  );
  const Info = ({ l, v, color }: { l: string; v: string; color?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ color: '#64748b', fontWeight: 600 }}>{l}</span>
      <strong style={{ color: color ?? '#0f172a', fontWeight: 800 }}>{v}</strong>
    </div>
  );
  const Box = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>{children}</div>
  );
  const Banner = ({ emoji, text, sub, bg, border }: { emoji: string; text: string; sub?: string; bg: string; border: string }) => (
    <div style={{ background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '11px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, animation: 'slideInBounce 0.3s ease' }}>
      <span style={{ fontSize: 26, flexShrink: 0 }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 900, fontSize: 16, color: border, lineHeight: 1.3 }}>{text}</div>
        {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );

  const pStyle: React.CSSProperties = { color: '#475569', fontSize: 14, lineHeight: 1.7, textAlign: 'center', margin: '0 0 14px', fontFamily: '"Nunito", system-ui' };

  const body = (): React.ReactNode => {
    switch (tile.type) {
      case 'start':
        return (
          <>
            {lapBonus !== null && <Banner emoji="🎉" text={`+₹${lapBonus} Salary!`} sub={streak >= 3 ? `🔥 ${streak} laps in a row! You're on fire!` : 'You completed a full lap!'} bg="#dcfce7" border="#16a34a" />}
            {streak >= 3 && <Banner emoji="🔥" text="Hot Streak Bonus!" sub={`You've done ${streak} laps! Keep going!`} bg="#fff7ed" border="#ea580c" />}
            <p style={pStyle}>Every time you pass GO, you collect <strong>₹{GO_SALARY} ZenCoins</strong>. Think of it as your salary! 🏁</p>
            <Box><div style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: c.text }}>₹{GO_SALARY} every lap!</div></Box>
            <Btn onClick={onClose} bg="#16a34a" shadow="#15803d">Let&apos;s roll! 🎲</Btn>
          </>
        );

      case 'save': {
        const customSaveInvalid = customSaveStr !== '' && (isNaN(parseInt(customSaveStr, 10)) || parseInt(customSaveStr, 10) <= 0);
        const effectiveSave = customSaveStr !== '' && !customSaveInvalid ? parseInt(customSaveStr, 10) : selectedSave;
        return (
          <>
            <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🏦</span>
              <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 700, lineHeight: 1.6 }}>
                <strong>What is a Savings Account?</strong><br />
                It's like a piggy bank at the bank that earns extra money (called <em>interest</em>) just for keeping it there!
              </div>
            </div>
            <p style={pStyle}>Move coins from your wallet into savings. They&apos;ll earn <strong>10% interest</strong> every time you land on an EARN tile!</p>
            <Box>
              <Info l="💰 Your wallet" v={`₹${coins}`} />
              <Info l="🏦 In savings"  v={`₹${savings}`} />
              {coins >= effectiveSave && effectiveSave > 0 && <Info l="✅ After saving" v={`₹${coins - effectiveSave} wallet · ₹${savings + effectiveSave} saved`} color="#2563eb" />}
            </Box>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Quick amounts:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
              {[50, 100, 500, 1000].map(amt => (
                <button key={amt} onClick={() => { setSelectedSave(amt); setCustomSaveStr(''); }}
                  style={{ padding: '10px 4px', borderRadius: 10, border: `2px solid ${selectedSave === amt && customSaveStr === '' ? '#2563eb' : '#e2e8f0'}`, cursor: 'pointer', background: selectedSave === amt && customSaveStr === '' ? '#dbeafe' : 'white', color: selectedSave === amt && customSaveStr === '' ? '#1e40af' : '#64748b', fontWeight: 900, fontSize: 13, fontFamily: '"Nunito", system-ui', transition: 'all 0.15s' }}>
                  ₹{amt}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Or type your own amount:</div>
            <input type="number" placeholder={`Max ₹${coins} (your wallet)`} value={customSaveStr} onChange={e => { setCustomSaveStr(e.target.value); setSelectedSave(0); }}
              style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: `2px solid ${customSaveInvalid ? '#fca5a5' : customSaveStr ? '#2563eb' : '#e2e8f0'}`, borderRadius: 10, padding: '10px 14px', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: '"Nunito", system-ui', marginBottom: 4 }} />
            {customSaveInvalid && <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 800, marginBottom: 8 }}>⚠️ Enter a number bigger than 0!</div>}
            {!customSaveInvalid && customSaveStr !== '' && parseInt(customSaveStr,10) > coins && <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 800, marginBottom: 8 }}>⚠️ You only have ₹{coins} in your wallet!</div>}
            <div style={{ marginBottom: 14 }} />
            <Btn onClick={() => {
              const amt = effectiveSave;
              if (amt > 0 && coins >= amt) {
                setCoins(coins - amt);
                setSavings(savings + amt);
                onSaved(amt); // ← NEW: record in store
              }
              onClose();
            }} disabled={effectiveSave <= 0 || coins < effectiveSave || customSaveInvalid} bg="#2563eb" shadow="#1e40af">
              {coins >= effectiveSave && effectiveSave > 0 ? `Save ₹${effectiveSave}! 🏦` : effectiveSave > coins ? `Not enough coins! 😅` : `Pick an amount first`}
            </Btn>
          </>
        );
      }

      case 'interest': {
        const bonus = Math.floor(savings * 0.1);
        return (
          <>
            <p style={pStyle}>Your money worked for you! You earn <strong>10% interest</strong> on your savings.</p>
            <Box>
              <div style={{ textAlign: 'center', padding: '6px 0' }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: bonus > 0 ? c.text : '#cbd5e1' }}>+₹{bonus}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 3, fontWeight: 600 }}>10% of your ₹{savings} savings</div>
              </div>
            </Box>
            {bonus === 0 && <p style={{ ...pStyle, color: '#dc2626', fontSize: 13, margin: '0 0 12px', fontWeight: 700 }}>💡 Save some coins first to earn interest!</p>}
            <Btn onClick={() => {
              if (bonus > 0) {
                setSavings(savings + bonus);
                onInterestEarned(bonus); // existing — also calls recordInterest via parent
              }
              onClose();
            }} bg="#0d9488" shadow="#0f766e" disabled={bonus === 0}>
              {bonus > 0 ? `Collect ₹${bonus} interest! 💰` : 'Save first, then earn!'}
            </Btn>
          </>
        );
      }

      case 'scam':
        return (
          <>
            <p style={pStyle}>Someone texted saying they&apos;re from your bank and need your OTP. What do you do? 🤔</p>
            <Box>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 2.1, fontWeight: 600 }}>
                ❌ <strong>Give OTP</strong> → You lose ₹100! Banks NEVER ask for OTPs!<br />
                ✅ <strong>Ignore &amp; Report</strong> → Bank rewards you ₹50 for being smart!
              </div>
            </Box>
            <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#92400e', fontWeight: 700, textAlign: 'center' }}>
              🛡️ Real banks NEVER ask for your OTP, PIN, or password!
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={() => {
                setCoins(Math.max(0, coins-100));
                onScamFailed(); // ← NEW: record failed encounter in store
                onClose();
              }} bg="#dc2626" shadow="#b91c1c">Give OTP<br /><span style={{ fontSize: 12 }}>LOSE ₹100 😱</span></Btn>
              <Btn onClick={() => {
                setCoins(coins+50);
                onScamAvoided(); // existing — also calls recordScamEncounter(true) via parent
                onClose();
              }} bg="#16a34a" shadow="#15803d">Ignore It!<br /><span style={{ fontSize: 12 }}>WIN ₹50 🎉</span></Btn>
            </div>
          </>
        );

      case 'budget':
        return (
          <>
            <p style={pStyle}>Time to make a smart money choice! Every rupee you spend wisely today helps you grow richer tomorrow. 💪</p>
            <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#166534', fontWeight: 700, lineHeight: 1.6 }}>
              💡 <strong>Need vs Want:</strong> A need is something you must have. A want is something nice but you can live without it.
            </div>
            <Box>
              <Info l="👛 Your wallet" v={`₹${coins}`} color={coins < 100 ? '#dc2626' : '#0f172a'} />
              <Info l="🏦 Your savings" v={`₹${savings}`} color="#2563eb" />
            </Box>
            {coins >= 100 && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => { setCoins(coins-100); onClose(); }} bg="#ea580c" shadow="#c2410c">🚲 New Bike<br /><span style={{ fontSize: 11 }}>₹100 (Want)</span></Btn>
                <Btn onClick={() => { setSavings(savings+50); onSaved(50); onClose(); }} bg="#9333ea" shadow="#7e22ce">📚 Save for School<br /><span style={{ fontSize: 11 }}>+₹50 Saved!</span></Btn>
              </div>
            )}
            {coins < 100 && (
              <>
                <div style={{ background: '#fef9c3', border: '2px solid #fbbf24', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, color: '#92400e', marginBottom: 4 }}>😅 You don&apos;t have ₹100 for the bike!</div>
                  <div style={{ fontSize: 12, color: '#78350f', fontWeight: 600, lineHeight: 1.6 }}>Sometimes we can&apos;t afford what we want. Great life lesson!</div>
                </div>
                {savings >= 100 && (
                  <button onClick={() => { setSavings(savings-100); onClose(); }} style={{ width: '100%', padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#2563eb', color: 'white', fontWeight: 900, fontSize: 13, fontFamily: '"Nunito", system-ui', boxShadow: '0 4px 0 #1e40af', marginBottom: 10 }}>
                    🏦 Withdraw from savings &amp; Buy Bike
                  </button>
                )}
                <Btn onClick={() => { setSavings(savings+50); onSaved(50); onClose(); }} bg="#9333ea" shadow="#7e22ce">📚 Smart move — Save for School!<br /><span style={{ fontSize: 11 }}>+₹50 into savings</span></Btn>
              </>
            )}
          </>
        );

      case 'property':
        if (isOwned) {
          return (
            <>
              <Banner emoji="🏠" text="Your Property!" sub={`You earn ₹${tile.rent} rent every visit!`} bg="#ffedd5" border="#ea580c" />
              {rentEarned !== null && rentEarned > 0 && <Banner emoji="💰" text={`Rent Collected: ₹${rentEarned}`} sub="Passive income — money while you sleep!" bg="#dcfce7" border="#16a34a" />}
              <Box><Info l="Property" v={tile.label} /><Info l="You paid" v={`₹${tile.price}`} /><Info l="Rent earned" v={`₹${tile.rent}`} color="#16a34a" /></Box>
              <Btn onClick={onClose} bg="#ea580c" shadow="#c2410c">My property! 🏠</Btn>
            </>
          );
        }
        return (
          <>
            <p style={pStyle}>Own <strong>{tile.label}</strong> and earn ₹{tile.rent} rent every time you land here — <strong>passive income</strong>! 🎯</p>
            <Box>
              <Info l="🏷️ Buy for"    v={`₹${tile.price}`} />
              <Info l="💵 Rent earned" v={`₹${tile.rent}/visit`} color="#16a34a" />
              <Info l="👛 Your wallet" v={`₹${coins}`} color={coins < tile.price ? '#dc2626' : '#0f172a'} />
              <Info l="🏦 Your savings" v={`₹${savings}`} color="#2563eb" />
            </Box>
            {coins >= tile.price && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => { setCoins(coins-tile.price); setOwnedTiles(prev => [...prev, tile.id]); onClose(); }} bg="#ea580c" shadow="#c2410c">🏠 Buy now!<br /><span style={{ fontSize: 12 }}>₹{tile.price} from wallet</span></Btn>
                <button onClick={onClose} style={{ flex: 1, padding: '11px 8px', borderRadius: 14, border: '2px solid #e2e8f0', cursor: 'pointer', background: 'white', color: '#94a3b8', fontWeight: 800, fontSize: 13 }}>Skip →</button>
              </div>
            )}
            {coins < tile.price && (
              <>
                <div style={{ background: '#fef9c3', border: '2px solid #fbbf24', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, color: '#92400e', marginBottom: 4 }}>😅 Your wallet is a bit short! You need ₹{tile.price - coins} more.</div>
                </div>
                {savings >= tile.price - coins && (
                  <button onClick={() => { const needed = tile.price - coins; setSavings(savings - needed); setCoins(0); setOwnedTiles(prev => [...prev, tile.id]); onClose(); }}
                    style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#2563eb', color: 'white', fontWeight: 900, fontSize: 14, fontFamily: '"Nunito", system-ui', boxShadow: '0 4px 0 #1e40af', marginBottom: 10 }}>
                    🏦 Withdraw ₹{tile.price - coins} from savings &amp; Buy!
                  </button>
                )}
                {!loanActive && (
                  <button onClick={() => {
                    setCoins(coins + LOAN_AMOUNT);
                    setLoanActive(true);
                    setLoanRemaining(LOAN_REPAY);
                    onLoanTaken(); // ← NEW: record in store
                    onClose();
                  }}
                    style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#d946ef', color: 'white', fontWeight: 900, fontSize: 14, fontFamily: '"Nunito", system-ui', boxShadow: '0 4px 0 #86198f', marginBottom: 10 }}>
                    📋 Take Loan of ₹{LOAN_AMOUNT} (repay ₹{LOAN_REPAY} later)
                  </button>
                )}
                <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '2px solid #e2e8f0', cursor: 'pointer', background: 'white', color: '#94a3b8', fontWeight: 800, fontSize: 13 }}>Skip for now →</button>
              </>
            )}
          </>
        );

      case 'loan':
        return (
          <>
            <div style={{ background: '#fdf4ff', border: '2px solid #e9d5ff', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🏛️</span>
              <div style={{ fontSize: 12, color: '#86198f', fontWeight: 700, lineHeight: 1.6 }}>
                <strong>What is a Bank Loan?</strong><br />
                You borrow now but pay back MORE later — the extra is called <em>interest</em>!
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'stretch' }}>
              <div style={{ flex: 1, background: '#dcfce7', border: '2px solid #86efac', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>😊 You receive NOW</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#15803d' }}>₹{LOAN_AMOUNT}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, fontWeight: 900, color: '#94a3b8' }}>⇒</div>
              <div style={{ flex: 1, background: '#fee2e2', border: '2px solid #fca5a5', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', marginBottom: 4 }}>😬 You repay at GO</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#b91c1c' }}>₹{LOAN_REPAY}</div>
              </div>
            </div>
            <Box><Info l="👛 Your wallet now" v={`₹${coins}`} />{loanActive && <Info l="⚠️ Current loan owed" v={`₹${loanRemaining}`} color="#dc2626" />}</Box>
            {loanActive
              ? <div style={{ background: '#fee2e2', border: '2px solid #fca5a5', borderRadius: 12, padding: '12px 14px', textAlign: 'center', fontSize: 13, color: '#b91c1c', fontWeight: 800 }}>⛔ You already have a loan of ₹{loanRemaining} to repay!</div>
              : <Btn onClick={() => {
                  setCoins(coins+LOAN_AMOUNT);
                  setLoanActive(true);
                  setLoanRemaining(LOAN_REPAY);
                  onLoanTaken(); // ← NEW: record in store
                  onClose();
                }} disabled={false} bg="#d946ef" shadow="#86198f">📋 Borrow ₹{LOAN_AMOUNT} (repay ₹{LOAN_REPAY} at GO)</Btn>
            }
          </>
        );

      default:
        return (
          <>
            <p style={pStyle}>Lucky you! Free space — rest, relax, and get ready for your next move! 😎</p>
            <Box><div style={{ textAlign: 'center', fontSize: 42, padding: '6px 0' }}>⭐</div></Box>
            <Btn onClick={onClose} bg="#4ade80" shadow="#16a34a">Nice! Keep rolling! 🎲</Btn>
          </>
        );
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: '28px 28px 0 0', padding: '0 22px 32px', animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)', maxHeight: '78vh', overflowY: 'auto', boxShadow: '0 -6px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 44, height: 5, background: '#cbd5e1', borderRadius: 3, margin: '12px auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: c.bg, border: `3px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{tile.icon}</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: '#0f172a', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>{tile.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>Tile #{tile.id+1} · Bankopoly{tile.type === 'property' && isOwned ? ' · ★ OWNED' : ''}</div>
          </div>
        </div>
        {body()}
        <button onClick={onClose} style={{ width: '100%', marginTop: 8, padding: 13, borderRadius: 12, border: '2px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc', color: '#94a3b8', fontWeight: 800, fontSize: 13 }}>Continue →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════════════════════
export default function BoardGame() {
  const claimReward  = useGameStore((s) => s.claimReward);
  const syncSavings  = useGameStore((s) => s.syncSavings);
  const resetGameRun = useGameStore((s) => s.resetGameRun);
  const wealth       = useGameStore((s) => s.wealth);
  // ── NEW store actions ──
  const earnProperty        = useGameStore((s) => s.earnProperty);
  const recordSave          = useGameStore((s) => s.recordSave);
  const recordInterest      = useGameStore((s) => s.recordInterest);
  const recordLoanTaken     = useGameStore((s) => s.recordLoanTaken);
  const recordLoanRepaid    = useGameStore((s) => s.recordLoanRepaid);
  const recordScamEncounter = useGameStore((s) => s.recordScamEncounter);

  const [coins, setCoins]               = useState(300);
  const [savings, setSavings]           = useState(0);
  const [loanActive, setLoanActive]     = useState(false);
  const [loanRemaining, setLoanRemaining] = useState(0);
  const [ownedTiles, setOwnedTiles]     = useState<number[]>([]);
  const [pos, setPos]                   = useState(0);
  const [diceVal, setDiceVal]           = useState(1);
  const [rolling, setRolling]           = useState(false);
  const [modal, setModal]               = useState<Tile | null>(null);
  const [lapBonus, setLapBonus]         = useState<number | null>(null);
  const [rentEarned, setRentEarned]     = useState<number | null>(null);
  const [laps, setLaps]                 = useState(0);
  const [streak, setStreak]             = useState(0);
  const [rollSeed, setRollSeed]         = useState(0);
  const [showATM, setShowATM]           = useState(false);
  const [showHowTo, setShowHowTo]       = useState(false);
  const [showWin, setShowWin]           = useState(false);
  const [showUnlock, setShowUnlock]     = useState(false);
  const [scamsAvoided, setScamsAvoided] = useState(0);
  const [interestEarned, setInterestEarned] = useState(0);
  const [floats, setFloats]             = useState<FloatingText[]>([]);
  const floatId                         = useRef(0);

  const [steppingPos, setSteppingPos]   = useState<number | null>(null);
  const [tileReaction, setTileReaction] = useState<TileReaction>(null);
  const [walletShake, setWalletShake]   = useState(false);
  const [turnLog, setTurnLog]           = useState<TurnEntry[]>([]);
  const turnId                          = useRef(0);
  const play                            = useSound();
  // ── NEW: prevent earnProperty firing more than once ──
  const winTriggered                    = useRef(false);

  const propValue = ownedTiles.reduce((s, id) => s + TILES[id].price, 0);
  const netWorth  = coins + savings + propValue - loanRemaining;

  useEffect(() => { syncSavings(savings); }, [savings, syncSavings]);

  // ── UPDATED: now also calls earnProperty() once on win ──
  useEffect(() => {
    if (netWorth >= WIN_THRESHOLD && !showWin && !winTriggered.current) {
      winTriggered.current = true;
      setShowWin(true);
      earnProperty();
    }
  }, [netWorth, showWin, earnProperty]);

  const spawnFloat = (text: string, color: string) => {
    const id = floatId.current++;
    const x = 38 + Math.random() * 24;
    const y = 35 + Math.random() * 25;
    setFloats(f => [...f, { id, text, color, x, y }]);
    setTimeout(() => setFloats(f => f.filter(ft => ft.id !== id)), 2000);
  };

  const triggerWalletShake = () => { setWalletShake(true); setTimeout(() => setWalletShake(false), 600); };

  const roll = () => {
    if (rolling || modal || showATM || showWin) return;
    setRolling(true);
    setLapBonus(null);
    setRentEarned(null);
    setTileReaction(null);
    play('roll');

    setTimeout(() => {
      const r = Math.floor(Math.random() * 6) + 1;
      const STEP_MS = 160;
      let step = 0;
      const stepInterval = setInterval(() => {
        step++;
        const stepPos = (pos + step) % 20;
        setSteppingPos(stepPos);
        try {
          const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
          const o = ac.createOscillator(); const g = ac.createGain();
          o.type = 'sine'; o.frequency.value = 300 + step * 30;
          g.gain.setValueAtTime(0.06, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);
          o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.06);
        } catch (_) {}
        if (step >= r) { clearInterval(stepInterval); setSteppingPos(null); finalizeLanding(r); }
      }, STEP_MS);
    }, 650);
  };

  const finalizeLanding = (r: number) => {
    const next = (pos + r) % 20;
    const crossedGo = (pos + r) >= 20;
    let newCoins = coins;
    const changes: string[] = [];
    let netChange = 0;

    if (crossedGo) {
      newCoins += GO_SALARY; netChange += GO_SALARY;
      changes.push(`+₹${GO_SALARY} salary (passed GO)`);
      setLapBonus(GO_SALARY); setLaps(l => l + 1); setStreak(s => s + 1);
      spawnFloat(`+₹${GO_SALARY} Salary!`, '#16a34a'); play('coin');
    } else {
      setStreak(0);
    }

    if (crossedGo && loanActive) {
      const repay = Math.min(newCoins, loanRemaining);
      newCoins -= repay; netChange -= repay;
      changes.push(`-₹${repay} loan repaid`);
      const rem = loanRemaining - repay;
      setLoanRemaining(rem);
      recordLoanRepaid(repay); // ← NEW: record repayment in store
      if (rem <= 0) { setLoanActive(false); spawnFloat('Loan Paid! 🎉', '#9333ea'); }
    }

    const landedTile = TILES[next];

    if (landedTile.type === 'property' && ownedTiles.includes(next)) {
      newCoins += landedTile.rent; netChange += landedTile.rent;
      changes.push(`+₹${landedTile.rent} rent collected`);
      setRentEarned(landedTile.rent);
      spawnFloat(`+₹${landedTile.rent} Rent!`, '#ea580c'); play('coin');
    }

    const reactionMap: Record<TileType, TileReaction> = {
      scam: 'scam', interest: 'coin', save: 'coin',
      property: ownedTiles.includes(next) ? 'firework' : null,
      start: 'firework', budget: null, loan: null, normal: null,
    };
    const rxn = reactionMap[landedTile.type] ?? null;
    setTimeout(() => {
      setTileReaction(rxn);
      if (rxn === 'scam') play('scam');
      else if (rxn === 'coin') play('coin');
      else if (rxn === 'firework') play('cheer');
      setTimeout(() => setTileReaction(null), 900);
    }, 50);

    setCoins(newCoins); setPos(next); setDiceVal(r); setRollSeed(s => s + 1);

    const entry: TurnEntry = {
      id: turnId.current++, rolled: r, tile: landedTile.label, tileIcon: landedTile.icon,
      changes: changes.length > 0 ? changes : ['Landed here'], netChange,
    };
    setTurnLog(prev => [entry, ...prev].slice(0, 6));
    setTimeout(() => { setRolling(false); setModal(TILES[next]); }, 900);
  };

  const handleWinClaim = () => {
    setCoins(c => c + HOUSE_BONUS);
    spawnFloat(`+₹${HOUSE_BONUS} House Bonus!`, '#16a34a');
    play('unlock');
    setShowWin(false);
    setShowUnlock(true);
  };

  const handleUnlockDone = () => {
    const finalNetWorth = netWorth + HOUSE_BONUS;
    claimReward(finalNetWorth, savings);
    resetGameRun();
    window.location.href = '/town';
  };

  const CORN = 76;
  const CELL = 62;
  const N    = 5;
  const BS   = CORN * 2 + CELL * N;
  const progressPct = Math.min(100, Math.round((netWorth / WIN_THRESHOLD) * 100));

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: '#f2e8d0',
      fontFamily: '"Nunito", system-ui, sans-serif',
      position: 'relative',
    }}>
      <Town3D />

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.18,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='18' fill='none' stroke='%23a16207' stroke-width='2'/%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='%23a16207' stroke-width='1'/%3E%3Cline x1='30' y1='12' x2='30' y2='48' stroke='%23a16207' stroke-width='1.5'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px' }} />

      {floats.map(ft => (
        <div key={ft.id} style={{ position: 'fixed', left: `${ft.x}%`, top: `${ft.y}%`, zIndex: 9999, pointerEvents: 'none', fontWeight: 900, fontSize: 18, color: ft.color, fontFamily: '"Nunito", system-ui', animation: 'floatUp 2s ease-out forwards', textShadow: '0 2px 4px rgba(0,0,0,0.15)', border: `2px solid ${ft.color}`, background: 'white', borderRadius: 20, padding: '4px 12px' }}>{ft.text}</div>
      ))}

      {/* ── TOP HUD ── */}
      <div style={{ flexShrink: 0, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', padding: '8px 14px', gap: 8, background: 'linear-gradient(180deg, #2d5a1b 0%, #1e4012 100%)', borderBottom: '3px solid #a16207', boxShadow: '0 3px 12px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fbbf24', border: '2px solid #d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏦</div>
          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 14, color: '#fbbf24', letterSpacing: 2, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>BANKOPOLY</div>
        </div>

        <div style={{ animation: walletShake ? 'walletShake 0.5s ease' : undefined, display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.35)', border: '2px solid #fbbf24', borderRadius: 20, padding: '5px 12px' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#78350f', fontFamily: 'Georgia, serif' }}>Z</div>
            <span style={{ fontWeight: 900, fontSize: 15, color: '#fef08a', fontFamily: '"Nunito", system-ui' }}>{coins.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.35)', border: '2px solid #4ade80', borderRadius: 20, padding: '5px 12px' }}>
          <span style={{ fontSize: 14 }}>🏦</span>
          <span style={{ fontWeight: 900, fontSize: 14, color: '#86efac' }}>{savings.toLocaleString()}</span>
          <span style={{ fontSize: 9, color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>saved</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.35)', border: '2px solid #c084fc', borderRadius: 20, padding: '5px 12px' }}>
          <span style={{ fontSize: 14 }}>💎</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: '#e9d5ff', lineHeight: 1 }}>{wealth.toLocaleString()}</div>
            <div style={{ fontSize: 8, color: '#c084fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>wealth</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.35)', border: '2px solid #fb923c', borderRadius: 20, padding: '5px 12px' }}>
          <span style={{ fontSize: 14 }}>🏠</span>
          <span style={{ fontWeight: 900, fontSize: 14, color: '#fed7aa' }}>{ownedTiles.length}</span>
          <span style={{ fontSize: 9, color: '#fb923c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>props</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 12px' }}>
          <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 800, whiteSpace: 'nowrap' }}>🏆</span>
          <div style={{ width: 80, height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, width: `${progressPct}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 11, color: '#fef08a', fontWeight: 900, whiteSpace: 'nowrap' }}>{progressPct}%</span>
        </div>

        {loanActive && <div style={{ background: 'rgba(220,38,38,0.85)', border: '2px solid #fca5a5', borderRadius: 16, padding: '5px 10px', fontSize: 11, fontWeight: 900, color: 'white' }}>⚠️ Loan ₹{loanRemaining}</div>}
        {streak >= 3 && <div style={{ background: 'rgba(234,88,12,0.85)', border: '2px solid #fb923c', borderRadius: 16, padding: '5px 10px', fontSize: 11, fontWeight: 900, color: 'white', animation: 'pinBounce 1s ease-in-out infinite' }}>🔥 {streak}x Streak!</div>}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: '4px 10px', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>Lap {laps+1} · {pos+1}/20</div>
          <button onClick={() => setShowATM(true)} style={{ width: 34, height: 34, borderRadius: 10, border: '2px solid #4ade80', background: 'rgba(0,0,0,0.4)', color: '#4ade80', fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="ATM">🏧</button>
          <button onClick={() => setShowHowTo(true)} style={{ width: 34, height: 34, borderRadius: 10, border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.4)', color: 'white', fontWeight: 900, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Help">❓</button>
          <button style={{ width: 34, height: 34, borderRadius: 10, border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.7)', fontWeight: 900, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Settings">⚙️</button>
        </div>
      </div>

      {/* ── MAIN BOARD AREA ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <TurnSummary entries={turnLog} />

        <div style={{ perspective: 1000, perspectiveOrigin: '50% 35%', flexShrink: 0, transform: 'translateY(-60px)' }}>
          <div style={{ width: BS, height: BS, transform: 'rotateX(40deg) rotateZ(-35deg)', transformStyle: 'preserve-3d', transformOrigin: 'center center', filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.25)) drop-shadow(0 6px 12px rgba(0,0,0,0.15))', animation: 'boardFloat 7s ease-in-out infinite' }}>
            <div style={{ position: 'relative', width: BS, height: BS, background: '#fef9c3', borderRadius: 12, outline: '4px solid #ca8a04', boxShadow: '0 0 0 10px #fbbf24, 0 0 0 13px #d97706' }}>
              <div style={{ position: 'absolute', top: CORN, left: CORN, width: BS-CORN*2, height: BS-CORN*2, background: '#16a34a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 4 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 13, color: 'white', letterSpacing: 3, textAlign: 'center', lineHeight: 1.4, background: 'rgba(0,0,0,0.2)', padding: '5px 14px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.2)' }}>🏦<br />BANKOPOLY</div>
                <div style={{ background: 'rgba(0,0,0,0.18)', border: '2px solid rgba(255,255,255,0.25)', borderRadius: 16, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#fde68a', fontWeight: 800 }}>🏆</span>
                  <div style={{ width: 55, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${progressPct}%`, background: '#fbbf24', transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{progressPct}%</span>
                </div>
                <div onClick={rolling || !!modal ? undefined : roll} style={{ cursor: rolling || !!modal ? 'default' : 'pointer' }}>
                  <Dice key={`d${rollSeed}`} value={diceVal} rolling={rolling} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{rolling ? '🎲 Rolling…' : 'Tap to roll!'}</div>
                {ownedTiles.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', maxWidth: 190, padding: '0 6px' }}>
                    {ownedTiles.map(id => (
                      <div key={id} style={{ background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.35)', borderRadius: 12, padding: '2px 7px', fontSize: 7, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.3px' }}>🏠 {TILES[id].label}</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'absolute', top: 0, left: CORN, width: BS-CORN*2, height: CORN, display: 'grid', gridTemplateColumns: `repeat(${N},1fr)`, gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {TOP.map(id => <BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="top" reaction={pos===id ? tileReaction : null} stepping={steppingPos===id && pos!==id} />)}
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: CORN, width: BS-CORN*2, height: CORN, display: 'grid', gridTemplateColumns: `repeat(${N},1fr)`, gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {BOT.map(id => <BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="bottom" reaction={pos===id ? tileReaction : null} stepping={steppingPos===id && pos!==id} />)}
              </div>
              <div style={{ position: 'absolute', right: 0, top: CORN, width: CORN, height: BS-CORN*2, display: 'grid', gridTemplateRows: `repeat(${N},1fr)`, gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {RIGHT.map(id => <BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="right" reaction={pos===id ? tileReaction : null} stepping={steppingPos===id && pos!==id} />)}
              </div>
              <div style={{ position: 'absolute', left: 0, top: CORN, width: CORN, height: BS-CORN*2, display: 'grid', gridTemplateRows: `repeat(${N},1fr)`, gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {LEFT.map(id => <BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="left" reaction={pos===id ? tileReaction : null} stepping={steppingPos===id && pos!==id} />)}
              </div>

              <div style={{ position: 'absolute', top:0, left:0, width:CORN, height:CORN, padding:2, boxSizing:'border-box' }}><Corner icon="🎲" top="Free Park" bg="#fefce8" border="#a16207" /></div>
              <div style={{ position: 'absolute', top:0, right:0, width:CORN, height:CORN, padding:2, boxSizing:'border-box' }}><Corner icon="❓" top="Chance" bg="#dbeafe" border="#1e40af" /></div>
              <div style={{ position: 'absolute', bottom:0, left:0, width:CORN, height:CORN, padding:2, boxSizing:'border-box' }}><Corner icon="🏁" top="Collect" bot="← GO" bg="#dcfce7" border="#15803d" /></div>
              <div style={{ position: 'absolute', bottom:0, right:0, width:CORN, height:CORN, padding:2, boxSizing:'border-box' }}><Corner icon="🚔" top="Jail" bg="#fee2e2" border="#b91c1c" /></div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button onClick={roll} disabled={rolling || !!modal} style={{ width: 96, height: 96, borderRadius: '50%', background: rolling || !!modal ? 'linear-gradient(135deg, #94a3b8, #64748b)' : 'linear-gradient(135deg, #ef4444, #dc2626)', border: '4px solid white', boxShadow: rolling || !!modal ? '0 4px 0 #475569, 0 0 0 3px rgba(148,163,184,0.3)' : '0 6px 0 #991b1b, 0 0 0 3px rgba(239,68,68,0.3)', cursor: rolling || !!modal ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: rolling ? 'translateY(5px)' : 'translateY(0)', transition: 'all 0.15s', outline: 'none' }}>
            <span style={{ fontSize: rolling ? 28 : 34, color: 'white', fontWeight: 900, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{rolling ? '🎲' : 'GO'}</span>
            {!rolling && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.9)', fontWeight: 900, marginTop: 2, letterSpacing: '1.5px' }}>ROLL!</span>}
          </button>

          {[
            { icon: 'Z', label: 'ZENCOINS', val: `₹${coins}`,   bg: 'linear-gradient(135deg,#fef9c3,#fef08a)', border: '#fbbf24', color: '#92400e', iconBg: '#fbbf24', iconColor: '#78350f', iconFont: true },
            { icon: '🏦', label: 'SAVINGS',  val: `₹${savings}`, bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', border: '#4ade80', color: '#15803d', iconBg: '#16a34a', iconColor: 'white', iconFont: false },
            { icon: '💎', label: 'WEALTH',   val: `₹${wealth}`,  bg: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)', border: '#c084fc', color: '#7e22ce', iconBg: '#9333ea', iconColor: 'white', iconFont: false },
            { icon: '🏠', label: 'PROPS',    val: `${ownedTiles.length}/4`, bg: 'linear-gradient(135deg,#ffedd5,#fed7aa)', border: '#fb923c', color: '#c2410c', iconBg: '#ea580c', iconColor: 'white', iconFont: false },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `2.5px solid ${s.border}`, borderRadius: 14, padding: '8px 10px', textAlign: 'center', width: 108, boxShadow: `0 3px 8px ${s.border}44` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: s.iconFont ? 12 : 16, fontWeight: 900, color: s.iconColor, fontFamily: s.iconFont ? 'Georgia, serif' : undefined }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: s.color, lineHeight: 1.2 }}>{s.val}</div>
              <div style={{ fontSize: 7, color: s.color, fontWeight: 800, marginTop: 1, letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.7 }}>{s.label}</div>
            </div>
          ))}

          <button onClick={() => setShowATM(true)} style={{ width: 108, padding: '9px 10px', borderRadius: 12, border: '2.5px solid #4ade80', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', color: '#15803d', fontWeight: 900, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, boxShadow: '0 3px 6px rgba(74,222,128,0.25)' }}>🏧 ATM</button>

          <div style={{ position: 'relative', width: 54, height: 54 }}>
            <svg width="54" height="54" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
              <circle cx="27" cy="27" r="21" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="5" />
              <circle cx="27" cy="27" r="21" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${2*Math.PI*21}`} strokeDashoffset={`${2*Math.PI*21*(1-(pos+1)/20)}`} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#92400e', lineHeight: 1 }}>{pos+1}</span>
              <span style={{ fontSize: 7, color: '#a16207', fontWeight: 700 }}>/20</span>
            </div>
          </div>
        </div>

        {modal && !showWin && (
          <Modal tile={modal} coins={coins} savings={savings} loanActive={loanActive} loanRemaining={loanRemaining} ownedTiles={ownedTiles} lapBonus={lapBonus} rentEarned={rentEarned} streak={streak}
            setCoins={setCoins} setSavings={setSavings} setLoanActive={setLoanActive} setLoanRemaining={setLoanRemaining} setOwnedTiles={setOwnedTiles}
            onWalletShake={triggerWalletShake}
            onScamAvoided={() => { setScamsAvoided(n => n + 1); recordScamEncounter(true); }}
            onInterestEarned={(n) => { setInterestEarned(t => t + n); recordInterest(n); }}
            onClose={() => setModal(null)}
            // ── NEW callbacks ──
            onSaved={(amt) => recordSave(amt)}
            onScamFailed={() => recordScamEncounter(false)}
            onLoanTaken={() => recordLoanTaken(LOAN_AMOUNT, LOAN_REPAY)}
          />
        )}
        {showATM   && <ATMModal savings={savings} onWithdraw={(amt) => { setSavings(s => s-amt); setCoins(c => c+amt); }} onClose={() => setShowATM(false)} />}
        {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}

        {showWin && !showUnlock && (
          <WinModal zenCoins={netWorth} savings={savings} scamsAvoided={scamsAvoided} interestEarned={interestEarned} onClaim={handleWinClaim} />
        )}

        {showUnlock && (
          <HouseUnlockOverlay netWorth={netWorth + HOUSE_BONUS} onDone={handleUnlockDone} />
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes fadeIn        { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp       { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes slideInBounce {
          0%   { transform:scale(0.88) translateY(12px); opacity:0 }
          65%  { transform:scale(1.03) translateY(-4px); opacity:1 }
          100% { transform:scale(1) translateY(0) }
        }
        @keyframes slideInLeft {
          0%   { transform:translateX(-20px); opacity:0 }
          100% { transform:translateX(0); opacity:1 }
        }
        @keyframes boardFloat {
          0%,100% { transform:rotateX(40deg) rotateZ(-35deg) translateZ(0) }
          50%     { transform:rotateX(40deg) rotateZ(-35deg) translateZ(8px) }
        }
        @keyframes pinBounce {
          0%,100% { transform:translateY(0) }
          50%     { transform:translateY(-5px) }
        }
        @keyframes diceRoll {
          0%   { transform:rotate(0deg) scale(1.08) }
          25%  { transform:rotate(90deg) scale(0.94) }
          50%  { transform:rotate(180deg) scale(1.08) }
          75%  { transform:rotate(270deg) scale(0.94) }
          100% { transform:rotate(360deg) scale(1.08) }
        }
        @keyframes diceLand {
          0%   { transform:scale(0.7) rotate(-10deg) }
          65%  { transform:scale(1.12) rotate(5deg) }
          85%  { transform:scale(0.95) rotate(-2deg) }
          100% { transform:scale(1) rotate(0deg) }
        }
        @keyframes floatUp {
          0%   { transform:translateY(0) scale(1); opacity:1 }
          100% { transform:translateY(-70px) scale(1.1); opacity:0 }
        }
        @keyframes walletShake {
          0%,100% { transform:translateX(0) }
          15%     { transform:translateX(-6px) rotate(-2deg) }
          30%     { transform:translateX(6px) rotate(2deg) }
          45%     { transform:translateX(-5px) rotate(-1deg) }
          60%     { transform:translateX(5px) rotate(1deg) }
          75%     { transform:translateX(-3px) }
          90%     { transform:translateX(3px) }
        }
        @keyframes tileShake {
          0%,100% { transform:translateX(0) }
          20%     { transform:translateX(-4px) }
          40%     { transform:translateX(4px) }
          60%     { transform:translateX(-3px) }
          80%     { transform:translateX(3px) }
        }
        @keyframes coinPop {
          0%   { transform:scale(0.7); opacity:0 }
          60%  { transform:scale(1.15); opacity:1 }
          100% { transform:scale(1); opacity:0 }
        }
        @keyframes tokenHop {
          0%   { transform:translateY(0) scale(1) }
          50%  { transform:translateY(-6px) scale(1.2) }
          100% { transform:translateY(0) scale(1) }
        }
        @keyframes houseUnlockReveal {
          0%   { transform:scale(0.6) translateY(40px); opacity:0 }
          65%  { transform:scale(1.04) translateY(-8px); opacity:1 }
          100% { transform:scale(1) translateY(0); opacity:1 }
        }
        @keyframes houseBounce {
          0%   { transform:scale(0) rotate(-20deg); opacity:0 }
          60%  { transform:scale(1.25) rotate(8deg); opacity:1 }
          80%  { transform:scale(0.9) rotate(-4deg) }
          100% { transform:scale(1) rotate(0deg) }
        }
        @keyframes bonusPop {
          0%   { transform:scale(0.5) translateY(20px); opacity:0 }
          65%  { transform:scale(1.08) translateY(-4px); opacity:1 }
          100% { transform:scale(1) translateY(0) }
        }
        @keyframes pulseRing {
          0%   { transform:scale(0.85); opacity:0.8 }
          100% { transform:scale(1.4);  opacity:0 }
        }
        @keyframes confettiFall {
          0%   { transform:translateY(-20px) rotate(0deg); opacity:1 }
          100% { transform:translateY(110vh) rotate(720deg); opacity:0 }
        }
        @keyframes fadeSlideDown {
          0%   { transform:translateY(-16px); opacity:0 }
          100% { transform:translateY(0); opacity:1 }
        }
        @keyframes fadeSlideUp {
          0%   { transform:translateY(16px); opacity:0 }
          100% { transform:translateY(0); opacity:1 }
        }
        input:focus { border-color: #4ade80 !important; outline:none; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input[type=number] { -moz-appearance: textfield; }
        input::-webkit-inner-spin-button, input::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
      `}</style>
    </div>
  );
}