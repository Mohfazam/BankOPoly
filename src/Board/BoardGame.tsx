'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Town3D } from './Town3D';

// ═══════════════════════════════════════════════════════════════════════════
// SOUND ENGINE — Web Audio API, no external deps
// ═══════════════════════════════════════════════════════════════════════════
function useSound() {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx.current;
  };

  const play = useCallback((type: 'roll' | 'coin' | 'scam' | 'buy' | 'sad' | 'cheer') => {
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
const WIN_THRESHOLD = 5000;
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
// WIN MODAL
// ═══════════════════════════════════════════════════════════════════════════
function WinModal({ zenCoins, onClaim }: { zenCoins: number; onClaim: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 400, width: '90%', background: '#fefce8', borderRadius: 28, border: '4px solid #ca8a04', padding: '32px 28px', textAlign: 'center', animation: 'slideInBounce 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ fontSize: 64, marginBottom: 6, animation: 'pinBounce 1.5s ease-in-out infinite' }}>🏆</div>
        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 28, color: '#92400e', letterSpacing: 2, marginBottom: 8 }}>YOU WIN!</div>
        <div style={{ fontSize: 14, color: '#78350f', fontWeight: 600, marginBottom: 20, lineHeight: 1.8 }}>
          You grew to <strong>₹{zenCoins.toLocaleString()} ZenCoins</strong>!<br />
          You're a money master! 🎉
        </div>
        <div style={{ background: '#fef3c7', border: '3px solid #fbbf24', borderRadius: 16, padding: '16px 20px', marginBottom: 22 }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: '#d97706', lineHeight: 1 }}>⚡ {zenCoins.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 800, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>ZenCoins Earned</div>
        </div>
        <button onClick={onClaim} style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', cursor: 'pointer', background: '#d97706', color: 'white', fontWeight: 900, fontSize: 17, fontFamily: '"Nunito", system-ui', boxShadow: '0 5px 0 #92400e' }}>
          🗺️ Claim &amp; Go to Town Map!
        </button>
        <div style={{ fontSize: 11, color: '#a16207', marginTop: 10, fontWeight: 600 }}>Use ZenCoins to build your empire!</div>
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
    { icon: '🏆', title: 'Win!',            desc: `Build ₹${WIN_THRESHOLD.toLocaleString()} net worth to win and unlock the Town Map!` },
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
  onClose: () => void;
}

function Modal({ tile, coins, savings, loanActive, loanRemaining, ownedTiles, lapBonus, rentEarned, streak, setCoins, setSavings, setLoanActive, setLoanRemaining, setOwnedTiles, onWalletShake, onClose }: ModalProps) {
  const c = COLORS[tile.type];
  const isOwned = ownedTiles.includes(tile.id);

  // save amount selection — lifted to Modal scope so it works cleanly
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
            {/* what is savings? — child-friendly explainer */}
            <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🏦</span>
              <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 700, lineHeight: 1.6 }}>
                <strong>What is a Savings Account?</strong><br />
                It's like a piggy bank at the bank that earns extra money (called <em>interest</em>) just for keeping it there! The more you save, the more you earn — without doing anything!
              </div>
            </div>
            <p style={pStyle}>Move coins from your wallet into savings. They&apos;ll earn <strong>10% interest</strong> every time you land on an EARN tile!</p>
            <Box>
              <Info l="💰 Your wallet" v={`₹${coins}`} />
              <Info l="🏦 In savings"  v={`₹${savings}`} />
              {coins >= effectiveSave && effectiveSave > 0 && <Info l="✅ After saving" v={`₹${coins - effectiveSave} wallet · ₹${savings + effectiveSave} saved`} color="#2563eb" />}
            </Box>
            {/* preset chips */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Quick amounts:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
              {[50, 100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => { setSelectedSave(amt); setCustomSaveStr(''); }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 10,
                    border: `2px solid ${selectedSave === amt && customSaveStr === '' ? '#2563eb' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    background: selectedSave === amt && customSaveStr === '' ? '#dbeafe' : 'white',
                    color: selectedSave === amt && customSaveStr === '' ? '#1e40af' : '#64748b',
                    fontWeight: 900, fontSize: 13,
                    fontFamily: '"Nunito", system-ui', transition: 'all 0.15s',
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            {/* custom input */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Or type your own amount:</div>
            <input
              type="number"
              placeholder={`Max ₹${coins} (your wallet)`}
              value={customSaveStr}
              onChange={e => { setCustomSaveStr(e.target.value); setSelectedSave(0); }}
              style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: `2px solid ${customSaveInvalid ? '#fca5a5' : customSaveStr ? '#2563eb' : '#e2e8f0'}`, borderRadius: 10, padding: '10px 14px', color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: '"Nunito", system-ui', marginBottom: 4 }}
            />
            {customSaveInvalid && <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 800, marginBottom: 8 }}>⚠️ Enter a number bigger than 0!</div>}
            {!customSaveInvalid && customSaveStr !== '' && parseInt(customSaveStr,10) > coins && <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 800, marginBottom: 8 }}>⚠️ You only have ₹{coins} in your wallet!</div>}
            <div style={{ marginBottom: 14 }} />
            <Btn
              onClick={() => {
                const amt = effectiveSave;
                if (amt > 0 && coins >= amt) { setCoins(coins - amt); setSavings(savings + amt); }
                onClose();
              }}
              disabled={effectiveSave <= 0 || coins < effectiveSave || customSaveInvalid}
              bg="#2563eb"
              shadow="#1e40af"
            >
              {coins >= effectiveSave && effectiveSave > 0 ? `Save ₹${effectiveSave}! 🏦` : effectiveSave > coins ? `Not enough coins! 😅` : `Pick an amount first`}
            </Btn>
          </>
        );
      }

      case 'interest': {
        const bonus = Math.floor(savings * 0.1);
        return (
          <>
            <p style={pStyle}>Your money worked for you! You earn <strong>10% interest</strong> on your savings. That&apos;s why saving is powerful!</p>
            <Box>
              <div style={{ textAlign: 'center', padding: '6px 0' }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: bonus > 0 ? c.text : '#cbd5e1' }}>+₹{bonus}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 3, fontWeight: 600 }}>10% of your ₹{savings} savings</div>
              </div>
            </Box>
            {bonus === 0 && <p style={{ ...pStyle, color: '#dc2626', fontSize: 13, margin: '0 0 12px', fontWeight: 700 }}>💡 Save some coins first to earn interest!</p>}
            <Btn onClick={() => { if (bonus > 0) setSavings(savings + bonus); onClose(); }} bg="#0d9488" shadow="#0f766e" disabled={bonus === 0}>
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
              <Btn onClick={() => { setCoins(Math.max(0, coins-100)); onClose(); }} bg="#dc2626" shadow="#b91c1c">
                Give OTP<br /><span style={{ fontSize: 12 }}>LOSE ₹100 😱</span>
              </Btn>
              <Btn onClick={() => { setCoins(coins+50); onClose(); }} bg="#16a34a" shadow="#15803d">
                Ignore It!<br /><span style={{ fontSize: 12 }}>WIN ₹50 🎉</span>
              </Btn>
            </div>
          </>
        );

      case 'budget':
        return (
          <>
            <p style={pStyle}>Time to make a smart money choice! Every rupee you spend wisely today helps you grow richer tomorrow. 💪</p>
            <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#166534', fontWeight: 700, lineHeight: 1.6 }}>
              💡 <strong>Need vs Want:</strong> A need is something you must have (food, books, medicine). A want is something nice but you can live without (new games, fancy shoes). Always pay for needs first!
            </div>
            <Box>
              <Info l="👛 Your wallet" v={`₹${coins}`} color={coins < 100 ? '#dc2626' : '#0f172a'} />
              <Info l="🏦 Your savings" v={`₹${savings}`} color="#2563eb" />
            </Box>
            {/* Normal choice — can afford bike */}
            {coins >= 100 && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => { setCoins(coins-100); onClose(); }} bg="#ea580c" shadow="#c2410c">
                  🚲 New Bike<br /><span style={{ fontSize: 11 }}>₹100 (Want)</span>
                </Btn>
                <Btn onClick={() => { setSavings(savings+50); onClose(); }} bg="#9333ea" shadow="#7e22ce">
                  📚 Save for School<br /><span style={{ fontSize: 11 }}>+₹50 Saved!</span>
                </Btn>
              </div>
            )}
            {/* Short on cash — teach them they can use savings or skip */}
            {coins < 100 && (
              <>
                <div style={{ background: '#fef9c3', border: '2px solid #fbbf24', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, color: '#92400e', marginBottom: 4 }}>😅 You don&apos;t have ₹100 in your wallet for the bike!</div>
                  <div style={{ fontSize: 12, color: '#78350f', fontWeight: 600, lineHeight: 1.6 }}>
                    This is actually a great life lesson — sometimes we can&apos;t afford what we <em>want</em>. You have options:
                  </div>
                </div>
                {/* Use savings option */}
                <div style={{ background: '#eff6ff', border: `2px solid ${savings >= 100 ? '#2563eb' : '#bfdbfe'}`, borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, color: '#1e40af', marginBottom: 4 }}>🏦 Option 1 — Use Your Savings (Free!)</div>
                  <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600, lineHeight: 1.6, marginBottom: 10 }}>
                    You have <strong>₹{savings}</strong> saved. You could withdraw ₹100 to buy the bike — but is a new bike worth dipping into your savings? Think about it! 🤔
                  </div>
                  {savings >= 100 ? (
                    <button onClick={() => { setSavings(savings-100); onClose(); }} style={{ width: '100%', padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#2563eb', color: 'white', fontWeight: 900, fontSize: 13, fontFamily: '"Nunito", system-ui', boxShadow: '0 4px 0 #1e40af' }}>
                      🏦 Withdraw from savings &amp; Buy Bike
                    </button>
                  ) : (
                    <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 700, textAlign: 'center', background: '#dbeafe', borderRadius: 10, padding: '8px' }}>Not enough savings (₹{savings}) either!</div>
                  )}
                </div>
                {/* Wise choice */}
                <Btn onClick={() => { setSavings(savings+50); onClose(); }} bg="#9333ea" shadow="#7e22ce">
                  📚 Smart move — Save for School instead!<br /><span style={{ fontSize: 11 }}>+₹50 into savings</span>
                </Btn>
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
              <Box>
                <Info l="Property" v={tile.label} />
                <Info l="You paid" v={`₹${tile.price}`} />
                <Info l="Rent earned" v={`₹${tile.rent}`} color="#16a34a" />
              </Box>
              <Btn onClick={onClose} bg="#ea580c" shadow="#c2410c">My property! 🏠</Btn>
            </>
          );
        }
        return (
          <>
            <p style={pStyle}>Own <strong>{tile.label}</strong> and earn ₹{tile.rent} rent every time you land here again — even without working! That&apos;s called <strong>passive income</strong>! 🎯</p>
            <Box>
              <Info l="🏷️ Buy for"    v={`₹${tile.price}`} />
              <Info l="💵 Rent earned" v={`₹${tile.rent}/visit`} color="#16a34a" />
              <Info l="👛 Your wallet" v={`₹${coins}`} color={coins < tile.price ? '#dc2626' : '#0f172a'} />
              <Info l="🏦 Your savings" v={`₹${savings}`} color="#2563eb" />
            </Box>

            {/* Can afford with wallet — normal buy */}
            {coins >= tile.price && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => { setCoins(coins-tile.price); setOwnedTiles(prev => [...prev, tile.id]); onClose(); }} bg="#ea580c" shadow="#c2410c">
                  🏠 Buy now!<br /><span style={{ fontSize: 12 }}>₹{tile.price} from wallet</span>
                </Btn>
                <button onClick={onClose} style={{ flex: 1, padding: '11px 8px', borderRadius: 14, border: '2px solid #e2e8f0', cursor: 'pointer', background: 'white', color: '#94a3b8', fontWeight: 800, fontSize: 13 }}>Skip →</button>
              </div>
            )}

            {/* Can't afford with wallet alone — show funding options */}
            {coins < tile.price && (
              <>
                <div style={{ background: '#fef9c3', border: '2px solid #fbbf24', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, color: '#92400e', marginBottom: 4 }}>😅 Your wallet is a bit short! You need ₹{tile.price - coins} more.</div>
                  <div style={{ fontSize: 12, color: '#78350f', fontWeight: 600, lineHeight: 1.6 }}>You have <strong>₹{coins}</strong> in your wallet. You can get extra money in two ways — read carefully and choose wisely!</div>
                </div>

                {/* Option 1 — Use Savings */}
                <div style={{ background: '#eff6ff', border: `2px solid ${savings >= tile.price - coins ? '#2563eb' : '#bfdbfe'}`, borderRadius: 14, padding: '14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>🏦</span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: '#1e40af' }}>Option 1 — Use Your Savings</div>
                      <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>✅ FREE! No extra cost.</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600, lineHeight: 1.6, marginBottom: 10 }}>
                    Your savings account has <strong>₹{savings}</strong>. You can take money out to buy this. It&apos;s your own money — no extra charges! But remember: less savings = less interest earned later. 💡
                  </div>
                  {savings >= tile.price - coins ? (
                    <button
                      onClick={() => {
                        const needed = tile.price - coins;
                        setSavings(savings - needed);
                        setCoins(0);
                        setOwnedTiles(prev => [...prev, tile.id]);
                        onClose();
                      }}
                      style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#2563eb', color: 'white', fontWeight: 900, fontSize: 14, fontFamily: '"Nunito", system-ui', boxShadow: '0 4px 0 #1e40af' }}
                    >
                      🏦 Withdraw ₹{tile.price - coins} from savings &amp; Buy!
                    </button>
                  ) : (
                    <div style={{ background: '#dbeafe', borderRadius: 10, padding: '9px 12px', fontSize: 12, color: '#1e40af', fontWeight: 700, textAlign: 'center' }}>
                      Not enough savings (₹{savings}) — you need ₹{tile.price - coins} more.
                    </div>
                  )}
                </div>

                {/* Option 2 — Bank Loan */}
                <div style={{ background: '#fdf4ff', border: `2px solid ${!loanActive ? '#d946ef' : '#e9d5ff'}`, borderRadius: 14, padding: '14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>📋</span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: '#86198f' }}>Option 2 — Bank Loan</div>
                      <div style={{ fontSize: 11, color: '#d946ef', fontWeight: 700 }}>⚠️ You pay back MORE than you borrow!</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#86198f', fontWeight: 600, lineHeight: 1.6, marginBottom: 10 }}>
                    The bank gives you <strong>₹{LOAN_AMOUNT}</strong> now, but when you pass GO, you must pay back <strong>₹{LOAN_REPAY}</strong> — that&apos;s ₹{LOAN_REPAY - LOAN_AMOUNT} extra as <em>interest</em>. Banks charge you for lending money. Only borrow if you really need to!
                  </div>
                  <div style={{ display: 'flex', gap: 6, fontSize: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 900, color: '#15803d' }}>You get</div>
                      <div style={{ fontWeight: 900, fontSize: 16, color: '#15803d' }}>₹{LOAN_AMOUNT}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 18 }}>→</div>
                    <div style={{ flex: 1, background: '#fee2e2', border: '2px solid #fca5a5', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 900, color: '#b91c1c' }}>You repay</div>
                      <div style={{ fontWeight: 900, fontSize: 16, color: '#b91c1c' }}>₹{LOAN_REPAY}</div>
                    </div>
                  </div>
                  {loanActive ? (
                    <div style={{ background: '#fee2e2', borderRadius: 10, padding: '9px 12px', fontSize: 12, color: '#b91c1c', fontWeight: 700, textAlign: 'center' }}>
                      ⛔ You already have a loan! Pay it off first (₹{loanRemaining} owed).
                    </div>
                  ) : (
                    <button
                      onClick={() => { setCoins(coins + LOAN_AMOUNT); setLoanActive(true); setLoanRemaining(LOAN_REPAY); onClose(); }}
                      style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#d946ef', color: 'white', fontWeight: 900, fontSize: 14, fontFamily: '"Nunito", system-ui', boxShadow: '0 4px 0 #86198f' }}
                    >
                      📋 Take Loan of ₹{LOAN_AMOUNT} (repay ₹{LOAN_REPAY} later)
                    </button>
                  )}
                </div>

                <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '2px solid #e2e8f0', cursor: 'pointer', background: 'white', color: '#94a3b8', fontWeight: 800, fontSize: 13 }}>Skip for now →</button>
              </>
            )}
          </>
        );

      case 'loan':
        return (
          <>
            {/* What is a loan — child explainer */}
            <div style={{ background: '#fdf4ff', border: '2px solid #e9d5ff', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🏛️</span>
              <div style={{ fontSize: 12, color: '#86198f', fontWeight: 700, lineHeight: 1.6 }}>
                <strong>What is a Bank Loan?</strong><br />
                A loan is when the bank lends you money, but you have to pay it all back PLUS extra money called <em>interest</em>. It&apos;s like borrowing ₹10 from a friend and having to give back ₹12 — the ₹2 extra is the interest charge!
              </div>
            </div>
            <p style={pStyle}>Think carefully! Loans help in emergencies but they always cost more than you borrowed.</p>
            {/* Visual comparison */}
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
            <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#92400e', fontWeight: 700, textAlign: 'center' }}>
              📉 Interest cost = ₹{LOAN_REPAY - LOAN_AMOUNT} extra — that&apos;s money you lose! Only borrow when you REALLY need to.
            </div>
            <Box>
              <Info l="👛 Your wallet now" v={`₹${coins}`} />
              {loanActive && <Info l="⚠️ Current loan owed" v={`₹${loanRemaining}`} color="#dc2626" />}
            </Box>
            {loanActive ? (
              <div style={{ background: '#fee2e2', border: '2px solid #fca5a5', borderRadius: 12, padding: '12px 14px', textAlign: 'center', fontSize: 13, color: '#b91c1c', fontWeight: 800 }}>
                ⛔ You already have a loan of ₹{loanRemaining} to repay! Pay it off first before borrowing again. This is why loans can be dangerous — they pile up!
              </div>
            ) : (
              <Btn onClick={() => { setCoins(coins+LOAN_AMOUNT); setLoanActive(true); setLoanRemaining(LOAN_REPAY); onClose(); }} disabled={false} bg="#d946ef" shadow="#86198f">
                📋 Borrow ₹{LOAN_AMOUNT} (repay ₹{LOAN_REPAY} at GO)
              </Btn>
            )}
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
          <div style={{ width: 52, height: 52, borderRadius: 16, background: c.bg, border: `3px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            {tile.icon}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: '#0f172a', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>{tile.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>
              Tile #{tile.id+1} · Bankopoly{tile.type === 'property' && isOwned ? ' · ★ OWNED' : ''}
            </div>
          </div>
        </div>
        {body()}
        <button onClick={onClose} style={{ width: '100%', marginTop: 8, padding: 13, borderRadius: 12, border: '2px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc', color: '#94a3b8', fontWeight: 800, fontSize: 13 }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT PILL
// ═══════════════════════════════════════════════════════════════════════════
function Pill({ icon, val, label, bg, border, color }: { icon: string; val: string; label: string; bg: string; border: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: bg, border: `2px solid ${border}`, borderRadius: 24, padding: '5px 12px' }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 900, fontSize: 14, color, lineHeight: 1, fontFamily: '"Nunito", system-ui' }}>{val}</div>
        <div style={{ fontSize: 8, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════════════════════
export default function BoardGame() {
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
  const [floats, setFloats]             = useState<FloatingText[]>([]);
  const floatId                         = useRef(0);

  const [steppingPos, setSteppingPos]   = useState<number | null>(null);
  const [tileReaction, setTileReaction] = useState<TileReaction>(null);
  const [walletShake, setWalletShake]   = useState(false);
  const [turnLog, setTurnLog]           = useState<TurnEntry[]>([]);
  const turnId                          = useRef(0);
  const play                            = useSound();

  const propValue = ownedTiles.reduce((s, id) => s + TILES[id].price, 0);
  const netWorth  = coins + savings + propValue - loanRemaining;

  useEffect(() => {
    if (netWorth >= WIN_THRESHOLD && !showWin) setShowWin(true);
  }, [netWorth, showWin]);

  const spawnFloat = (text: string, color: string) => {
    const id = floatId.current++;
    const x = 38 + Math.random() * 24;
    const y = 35 + Math.random() * 25;
    setFloats(f => [...f, { id, text, color, x, y }]);
    setTimeout(() => setFloats(f => f.filter(ft => ft.id !== id)), 2000);
  };

  const triggerWalletShake = () => {
    setWalletShake(true);
    setTimeout(() => setWalletShake(false), 600);
  };

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
          g.gain.setValueAtTime(0.06, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);
          o.connect(g); g.connect(ac.destination);
          o.start(); o.stop(ac.currentTime + 0.06);
        } catch (_) {}

        if (step >= r) {
          clearInterval(stepInterval);
          setSteppingPos(null);
          finalizeLanding(r);
        }
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
      newCoins += GO_SALARY;
      netChange += GO_SALARY;
      changes.push(`+₹${GO_SALARY} salary (passed GO)`);
      setLapBonus(GO_SALARY);
      setLaps(l => l + 1);
      setStreak(s => s + 1);
      spawnFloat(`+₹${GO_SALARY} Salary!`, '#16a34a');
      play('coin');
    } else {
      setStreak(0);
    }

    if (crossedGo && loanActive) {
      const repay = Math.min(newCoins, loanRemaining);
      newCoins -= repay;
      netChange -= repay;
      changes.push(`-₹${repay} loan repaid`);
      const rem = loanRemaining - repay;
      setLoanRemaining(rem);
      if (rem <= 0) { setLoanActive(false); spawnFloat('Loan Paid! 🎉', '#9333ea'); }
    }

    const landedTile = TILES[next];

    if (landedTile.type === 'property' && ownedTiles.includes(next)) {
      newCoins += landedTile.rent;
      netChange += landedTile.rent;
      changes.push(`+₹${landedTile.rent} rent collected`);
      setRentEarned(landedTile.rent);
      spawnFloat(`+₹${landedTile.rent} Rent!`, '#ea580c');
      play('coin');
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

    setCoins(newCoins);
    setPos(next);
    setDiceVal(r);
    setRollSeed(s => s + 1);

    const entry: TurnEntry = {
      id: turnId.current++,
      rolled: r,
      tile: landedTile.label,
      tileIcon: landedTile.icon,
      changes: changes.length > 0 ? changes : ['Landed here'],
      netChange,
    };
    setTurnLog(prev => [entry, ...prev].slice(0, 6));

    setTimeout(() => { setRolling(false); setModal(TILES[next]); }, 900);
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
      background: '#f0f9ff',
      fontFamily: '"Nunito", system-ui, sans-serif',
      position: 'relative',
    }}>
      <Town3D />

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.4,
        backgroundImage: 'radial-gradient(circle, #bae6fd 1px, transparent 1px)',
        backgroundSize: '28px 28px' }} />

      {floats.map(ft => (
        <div key={ft.id} style={{
          position: 'fixed', left: `${ft.x}%`, top: `${ft.y}%`,
          zIndex: 9999, pointerEvents: 'none',
          fontWeight: 900, fontSize: 18, color: ft.color,
          fontFamily: '"Nunito", system-ui',
          animation: 'floatUp 2s ease-out forwards',
          textShadow: '0 2px 4px rgba(0,0,0,0.15)',
          border: `2px solid ${ft.color}`,
          background: 'white', borderRadius: 20, padding: '4px 12px',
        }}>{ft.text}</div>
      ))}

      {/* ── TOP HUD ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        padding: '7px 14px', gap: 8,
        background: 'white',
        borderBottom: '3px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1e40af', border: '2px solid #1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏦</div>
          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 15, color: '#1e40af', letterSpacing: 1 }}>BANKOPOLY</div>
        </div>

        <div style={{ animation: walletShake ? 'walletShake 0.5s ease' : undefined }}>
          <Pill icon="⚡" val={`₹${coins.toLocaleString()}`} label="ZenCoins" bg={walletShake ? '#fee2e2' : '#fefce8'} border={walletShake ? '#fca5a5' : '#fbbf24'} color="#92400e" />
        </div>
        <Pill icon="🏦" val={`₹${savings.toLocaleString()}`} label="Savings" bg="#dcfce7" border="#86efac" color="#15803d" />
        <Pill icon="🏠" val={`${ownedTiles.length}`} label="Props" bg="#ffedd5" border="#fb923c" color="#c2410c" />
        <Pill icon="📊" val={`₹${netWorth.toLocaleString()}`} label="Net Worth" bg="#f3e8ff" border="#c084fc" color="#7e22ce" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 20, padding: '5px 12px' }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>🏆 Goal</span>
          <div style={{ width: 90, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, width: `${progressPct}%`, background: '#fbbf24', transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 12, color: '#92400e', fontWeight: 800, whiteSpace: 'nowrap' }}>{progressPct}%</span>
        </div>

        {loanActive && (
          <div style={{ background: '#fee2e2', border: '2px solid #fca5a5', borderRadius: 16, padding: '5px 10px', fontSize: 11, fontWeight: 800, color: '#b91c1c' }}>
            ⚠️ Loan ₹{loanRemaining}
          </div>
        )}

        {streak >= 3 && (
          <div style={{ background: '#fff7ed', border: '2px solid #fb923c', borderRadius: 16, padding: '5px 10px', fontSize: 11, fontWeight: 800, color: '#c2410c', animation: 'pinBounce 1s ease-in-out infinite' }}>
            🔥 {streak} Lap Streak!
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setShowATM(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dcfce7', border: '2px solid #86efac', borderRadius: 16, padding: '6px 12px', color: '#15803d', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>🏧 ATM</button>
          <button onClick={() => setShowHowTo(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dbeafe', border: '2px solid #93c5fd', borderRadius: 16, padding: '6px 12px', color: '#1e40af', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>❓ Help</button>
          <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, padding: '5px 10px', fontSize: 11, fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center' }}>
            Round {laps+1} · Tile {pos+1}/20
          </div>
        </div>
      </div>

      {/* ── MAIN BOARD AREA ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        <TurnSummary entries={turnLog} />

        <div style={{ perspective: 1000, perspectiveOrigin: '50% 35%', flexShrink: 0 }}>
          <div style={{
            width: BS, height: BS,
            transform: 'rotateX(40deg) rotateZ(-35deg)',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.25)) drop-shadow(0 6px 12px rgba(0,0,0,0.15))',
            animation: 'boardFloat 7s ease-in-out infinite',
          }}>
            <div style={{
              position: 'relative', width: BS, height: BS,
              background: '#fef9c3',
              borderRadius: 12,
              outline: '4px solid #ca8a04',
              boxShadow: '0 0 0 10px #fbbf24, 0 0 0 13px #d97706',
            }}>
              <div style={{
                position: 'absolute', top: CORN, left: CORN,
                width: BS-CORN*2, height: BS-CORN*2,
                background: '#16a34a',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 8,
                borderRadius: 4,
              }}>
                <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 13, color: 'white', letterSpacing: 3, textAlign: 'center', lineHeight: 1.4, background: 'rgba(0,0,0,0.2)', padding: '5px 14px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.2)' }}>
                  🏦<br />BANKOPOLY
                </div>

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

                <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {rolling ? '🎲 Rolling…' : 'Tap to roll!'}
                </div>

                {ownedTiles.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', maxWidth: 190, padding: '0 6px' }}>
                    {ownedTiles.map(id => (
                      <div key={id} style={{ background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.35)', borderRadius: 12, padding: '2px 7px', fontSize: 7, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        🏠 {TILES[id].label}
                      </div>
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
        <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button onClick={roll} disabled={rolling || !!modal} style={{
            width: 100, height: 100, borderRadius: '50%',
            background: rolling || !!modal ? '#94a3b8' : '#dc2626',
            border: '4px solid white',
            boxShadow: rolling || !!modal ? '0 4px 0 #64748b' : '0 8px 0 #991b1b',
            cursor: rolling || !!modal ? 'not-allowed' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            transform: rolling ? 'translateY(6px)' : 'translateY(0)',
            transition: 'all 0.15s',
            outline: 'none',
          }}>
            <span style={{ fontSize: rolling ? 28 : 36, color: 'white', fontWeight: 900, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{rolling ? '🎲' : 'GO'}</span>
            {!rolling && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: 900, marginTop: 3, letterSpacing: '1px' }}>ROLL!</span>}
          </button>

          {[
            { icon: '⚡', label: 'ZENCOINS', val: `₹${coins}`,   bg: '#fefce8', border: '#fbbf24', color: '#92400e' },
            { icon: '🏦', label: 'SAVINGS',  val: `₹${savings}`, bg: '#dcfce7', border: '#86efac', color: '#15803d' },
            { icon: '🏠', label: 'PROPS',    val: `${ownedTiles.length}`, bg: '#ffedd5', border: '#fb923c', color: '#c2410c' },
            { icon: '📊', label: 'WORTH',    val: `₹${netWorth}`, bg: '#f3e8ff', border: '#c084fc', color: '#7e22ce' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 12, padding: '8px 10px', textAlign: 'center', width: 120 }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: s.color, lineHeight: 1.2, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 8, color: '#64748b', fontWeight: 800, marginTop: 1, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}

          <button onClick={() => setShowATM(true)} style={{ width: 120, padding: '9px 10px', borderRadius: 12, border: '2px solid #86efac', background: '#dcfce7', color: '#15803d', fontWeight: 900, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>🏧 ATM</button>

          <div style={{ position: 'relative', width: 58, height: 58 }}>
            <svg width="58" height="58" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
              <circle cx="29" cy="29" r="22" fill="none" stroke="#e2e8f0" strokeWidth="5" />
              <circle cx="29" cy="29" r="22" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*22}`}
                strokeDashoffset={`${2*Math.PI*22*(1-(pos+1)/20)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{pos+1}</span>
              <span style={{ fontSize: 7, color: '#94a3b8', fontWeight: 700 }}>/20</span>
            </div>
          </div>
        </div>

        {modal && !showWin && (
          <Modal tile={modal} coins={coins} savings={savings} loanActive={loanActive} loanRemaining={loanRemaining} ownedTiles={ownedTiles} lapBonus={lapBonus} rentEarned={rentEarned} streak={streak}
            setCoins={setCoins} setSavings={setSavings} setLoanActive={setLoanActive} setLoanRemaining={setLoanRemaining} setOwnedTiles={setOwnedTiles}
            onWalletShake={triggerWalletShake}
            onClose={() => setModal(null)} />
        )}
        {showATM   && <ATMModal savings={savings} onWithdraw={(amt) => { setSavings(s => s-amt); setCoins(c => c+amt); }} onClose={() => setShowATM(false)} />}
        {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
        {showWin   && <WinModal zenCoins={netWorth} onClaim={() => { window.location.href = '/'; }} />}
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
        input:focus { border-color: #4ade80 !important; outline:none; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input[type=number] { -moz-appearance: textfield; }
        input::-webkit-inner-spin-button, input::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
      `}</style>
    </div>
  );
}