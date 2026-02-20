'use client';

/**
 * WinRewardFlow.tsx  — Frames 10–16
 *
 * Frames:
 *   10 — Win Reward Screen  (house unlocked + ₹500 bonus)
 *   11 — Return to Town Map (inventory card slides in)
 *   12 — Building Placement (tap an empty plot)
 *   13 — Town Updated       (coins rise, level up)
 *   14 — Next Goal          (Hospital → learn Scam Safety)
 *   15 — Banking Recap      (savings / interest / scams dashboard)
 *   16 — Continuous Loop    (learn → earn → build)
 *
 * Design: matches Bankopoly exactly — parchment bg #f2e8d0, dark-green HUD
 * (#2d5a1b→#1e4012), Georgia serif titles, "Nunito" sans, gold (#fbbf24/#d97706),
 * bottom-sheet modal rise, 3-D press buttons (box-shadow bottom edge).
 *
 * Store: useGameStore (wealth, unlockedBuildings, claimReward, unlockBuilding)
 */

import {
  useState, useEffect, useRef, useCallback, ReactNode, CSSProperties,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../Store/useGameStore';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS  (mirrors Bankopoly's exact palette)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  parchment:  '#f2e8d0',
  parchmentL: '#fef9c3',
  hudTop:     '#2d5a1b',
  hudBot:     '#1e4012',
  hudBorder:  '#a16207',
  gold:       '#fbbf24',
  goldD:      '#d97706',
  goldDD:     '#ca8a04',
  goldText:   '#78350f',
  green:      '#16a34a',
  greenD:     '#14532d',
  greenL:     '#dcfce7',
  blue:       '#2563eb',
  blueD:      '#1e40af',
  blueL:      '#dbeafe',
  purple:     '#9333ea',
  purpleD:    '#7e22ce',
  orange:     '#ea580c',
  orangeD:    '#c2410c',
  red:        '#dc2626',
  redD:       '#991b1b',
  teal:       '#0d9488',
  tealD:      '#0f766e',
  white:      '#ffffff',
  muted:      '#64748b',
  slate:      '#475569',
  bg:         '#f2e8d0',
  serif:      'Georgia, serif',
  sans:       '"Nunito", system-ui, sans-serif',
} as const;

// BUILDING DEFINITIONS — mirrors the 8 outer plots from PlotSystem
export interface BuildingDef {
  id:       string;
  icon:     string;
  label:    string;
  concept:  string;
  cost:     number;
  color:    string;
  colorD:   string;
  locked:   boolean;
  lessons:  string[];
  reward:   string;
  income:   number;
}

export const BUILDINGS: BuildingDef[] = [
  { id: 'house',    icon: '🏠', label: 'Starter House', concept: 'Savings Basics',  cost: 0,    color: C.orange,  colorD: C.orangeD, locked: false, lessons: ['Save regularly', 'Compound interest', 'Emergency funds'],     reward: '+₹200/round passive income', income: 200 },
  { id: 'hospital', icon: '🏥', label: 'Hospital',       concept: 'Scam Safety',    cost: 2000, color: C.blue,    colorD: C.blueD,   locked: true,  lessons: ['Spot phishing', 'Never share OTPs', 'Report fraud'],          reward: 'Unlock Healthcare district',  income: 300 },
  { id: 'school',   icon: '🏫', label: 'School',         concept: 'Budget Mastery', cost: 1500, color: C.purple,  colorD: C.purpleD, locked: true,  lessons: ['50-30-20 rule', 'Needs vs wants', 'Monthly planning'],        reward: 'Educate 500 citizens',        income: 250 },
  { id: 'park',     icon: '🌳', label: 'Public Park',    concept: 'Savings Goals',  cost: 800,  color: C.green,   colorD: C.greenD,  locked: true,  lessons: ['Goal-based saving', 'Auto-deposits', 'Wealth milestones'],    reward: '+20 Happiness per round',     income: 150 },
  { id: 'market',   icon: '🏪', label: 'Market',         concept: 'Smart Spending', cost: 2500, color: C.gold,    colorD: C.goldD,   locked: true,  lessons: ['Price comparison', 'Avoid impulse buys', 'Sale vs need'],     reward: 'Unlock trade routes',         income: 400 },
  { id: 'factory',  icon: '🏭', label: 'Factory',        concept: 'Investments',    cost: 4000, color: C.slate,   colorD: '#334155', locked: true,  lessons: ['Stocks basics', 'Diversify', 'Risk vs reward'],              reward: '+₹600/round dividends',       income: 600 },
  { id: 'library',  icon: '📚', label: 'Library',        concept: 'Loan Literacy',  cost: 1200, color: C.teal,    colorD: C.tealD,   locked: true,  lessons: ['When to borrow', 'Interest cost', 'Debt snowball'],          reward: 'Unlock advanced modules',     income: 180 },
  { id: 'bank_hq',  icon: '🏦', label: 'Bank HQ',        concept: 'Full Literacy',  cost: 8000, color: '#1e3a8a', colorD: '#1e40af', locked: true,  lessons: ['Complete all modules', 'Final assessment', 'Master banker'], reward: 'Unlock Town Hall + diploma',  income: 1000 },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: animated counter
// ─────────────────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1100): number {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES  (Bankopoly style)
// ─────────────────────────────────────────────────────────────────────────────

/** Full-screen parchment base with coin-pattern bg (same as BoardGame) */
function ParchmentScreen({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      background: C.parchment,
      fontFamily: C.sans,
      ...style,
    }}>
      {/* coin-pattern overlay — exact copy from BoardGame */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.18,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='18' fill='none' stroke='%23a16207' stroke-width='2'/%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='%23a16207' stroke-width='1'/%3E%3Cline x1='30' y1='12' x2='30' y2='48' stroke='%23a16207' stroke-width='1.5'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

/** Green HUD bar — same gradient/border as BoardGame's top HUD */
function HUDBar({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 14px',
      background: `linear-gradient(180deg, ${C.hudTop} 0%, ${C.hudBot} 100%)`,
      borderBottom: `3px solid ${C.hudBorder}`,
      boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: C.gold, border: `2px solid ${C.goldD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏦</div>
      <div>
        <div style={{ fontFamily: C.serif, fontWeight: 900, fontSize: 14, color: C.gold, letterSpacing: 2, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>BANKOPOLY</div>
        {subtitle && <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>{subtitle}</div>}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>{right}</div>
    </div>
  );
}

/** Pill badge — same as HUD badges in BoardGame */
function Pill({ icon, label, value, border }: { icon: string; label?: string; value: string; border: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.35)', border: `2px solid ${border}`, borderRadius: 20, padding: '5px 12px' }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontWeight: 900, fontSize: 14, color: border === C.gold ? '#fef08a' : '#fff' }}>{value}</span>
      {label && <span style={{ fontSize: 9, color: border, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>}
    </div>
  );
}

/** 3-D press button — exact Bankopoly style */
function BtnPrimary({
  onClick, children, disabled = false, color = C.green, shadow = C.greenD, style,
}: {
  onClick?: () => void; children: ReactNode; disabled?: boolean;
  color?: string; shadow?: string; style?: CSSProperties;
}) {
  const [down, setDown] = useState(false);
  return (
    <button
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      onClick={disabled ? undefined : onClick}
      style={{
        width: '100%', padding: '14px 12px', borderRadius: 14, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? '#e2e8f0' : `linear-gradient(135deg, ${color}, ${shadow})`,
        color: disabled ? C.muted : '#fff',
        fontWeight: 900, fontSize: 16, fontFamily: C.sans,
        boxShadow: disabled ? 'none' : down ? 'none' : `0 5px 0 ${shadow}, 0 8px 20px ${color}44`,
        transform: down ? 'translateY(4px)' : 'translateY(0)',
        transition: 'transform 0.08s, box-shadow 0.08s',
        letterSpacing: '0.5px', lineHeight: 1.4,
        ...style,
      }}
    >{children}</button>
  );
}

/** Gold button variant */
function BtnGold({ onClick, children, style }: { onClick?: () => void; children: ReactNode; style?: CSSProperties }) {
  return <BtnPrimary onClick={onClick} color={C.gold} shadow={C.goldD} style={{ color: C.goldText, ...style }}>{children}</BtnPrimary>;
}

/** Stat row — same as InfoRow in Modal */
function InfoRow({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{label}</span>
      </div>
      <strong style={{ fontSize: 13, color: color ?? '#0f172a', fontWeight: 900 }}>{value}</strong>
    </div>
  );
}

/** White card with coloured left-stripe — matches BTile/ThemedModalShell feel */
function Card({ children, accent, style }: { children: ReactNode; accent?: string; style?: CSSProperties }) {
  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${accent ? accent + '55' : '#e2e8f0'}`,
      borderLeft: accent ? `5px solid ${accent}` : undefined,
      borderRadius: 14,
      padding: '14px 16px',
      boxShadow: accent ? `0 4px 16px ${accent}22` : '0 2px 8px rgba(0,0,0,0.06)',
      ...style,
    }}>{children}</div>
  );
}

/** Coloured banner — same as Banner inside Modal */
function Banner({ emoji, text, sub, bg, border }: { emoji: string; text: string; sub?: string; bg: string; border: string }) {
  return (
    <div style={{
      background: bg, border: `2px solid ${border}`, borderRadius: 14,
      padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12,
      animation: 'bannerPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: `0 4px 16px ${border}33`,
    }}>
      <span style={{ fontSize: 28, flexShrink: 0, animation: 'iconPulse 2s ease-in-out infinite' }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 900, fontSize: 16, color: border, lineHeight: 1.3 }}>{text}</div>
        {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );
}

/** Progress bar */
function ProgressBar({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const animated = useCountUp(pct, 1200);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 900, color }}>{pct}%</span>
      </div>
      <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 5, background: `linear-gradient(90deg, ${color}, ${color}bb)`, width: `${animated}%`, transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)', boxShadow: `0 0 6px ${color}66` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3-D HOUSE MESH  (Three.js, used in Frame 10 canvas)
// ─────────────────────────────────────────────────────────────────────────────
function HouseMesh({ position = [0, 0, 0] as [number, number, number], scale = 1, spin = false }) {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (!g.current) return;
    if (spin) { g.current.rotation.y += dt * 0.7; }
    else       { g.current.rotation.y = Math.sin(Date.now() / 3000) * 0.15; }
  });
  return (
    <group ref={g} position={position} scale={scale}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 1, 1.4]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <coneGeometry args={[1.06, 0.88, 4]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.22, 0.71]}>
        <boxGeometry args={[0.28, 0.5, 0.04]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {([ [-0.38, 0.1, 0.71], [0.38, 0.1, 0.71] ] as [number,number,number][]).map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.22, 0.22, 0.04]} />
          <meshStandardMaterial color="#bfdbfe" emissive="#60a5fa" emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh position={[0.35, 1.1, -0.26]}>
        <boxGeometry args={[0.14, 0.48, 0.14]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  );
}

function FloatingCoin({ offset }: { offset: number }) {
  const m = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + offset;
    m.current.position.y  = Math.sin(t * 1.5) * 0.4 + 0.6;
    m.current.rotation.y  = t * 2.2;
    m.current.rotation.z  = Math.sin(t) * 0.18;
  });
  const x = Math.cos(offset * 2.1) * 2.6;
  const z = Math.sin(offset * 2.1) * 2.6;
  return (
    <mesh ref={m} position={[x, 0.6, z]} castShadow>
      <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
      <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} emissive="#fbbf24" emissiveIntensity={0.3} />
    </mesh>
  );
}

function WinCanvas() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow color="#fef3c7" />
      <pointLight position={[-3, 3, -3]} intensity={0.8} color="#f59e0b" />
      <pointLight position={[3, 1, 3]} intensity={0.5} color="#86efac" />
      <Stars radius={80} depth={50} count={2500} factor={3} saturation={0.3} fade />
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.55}>
        <HouseMesh scale={1.35} position={[0, -0.4, 0]} spin />
      </Float>
      {[0,1,2,3,4,5,6].map(i => <FloatingCoin key={i} offset={i * (Math.PI * 2 / 7)} />)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <circleGeometry args={[4.5, 48]} />
        <meshStandardMaterial color="#14532d" opacity={0.6} transparent />
      </mesh>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING TEXT  (same pattern as BoardGame's spawnFloat)
// ─────────────────────────────────────────────────────────────────────────────
interface FloatMsg { id: number; text: string; color: string; x: number; y: number; }

function FloatingTexts({ msgs }: { msgs: FloatMsg[] }) {
  return (
    <>
      {msgs.map(f => (
        <div key={f.id} style={{
          position: 'fixed', left: `${f.x}%`, top: `${f.y}%`,
          zIndex: 9999, pointerEvents: 'none',
          fontWeight: 900, fontSize: 18, color: f.color, fontFamily: C.sans,
          animation: 'floatUp 2s ease-out forwards',
          textShadow: '0 2px 4px rgba(0,0,0,0.15)',
          border: `2px solid ${f.color}`, background: 'white',
          borderRadius: 20, padding: '4px 12px',
        }}>{f.text}</div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAME 10 — WIN REWARD SCREEN
// Matches the existing WinModal aesthetic but extended as a full screen.
// ─────────────────────────────────────────────────────────────────────────────
interface Frame10Props {
  netWorth: number;
  savings: number;
  interest: number;
  scamsAvoided: number;
  properties: number;
  onContinue: () => void;
}

export function Frame10_WinReward({ netWorth, savings, interest, scamsAvoided, properties, onContinue }: Frame10Props) {
  const [phase, setPhase] = useState<'enter' | 'reveal' | 'ready'>('enter');
  const [floats, setFloats] = useState<FloatMsg[]>([]);
  const fid = useRef(0);
  const displayCoins = useCountUp(phase !== 'enter' ? netWorth + 500 : 0, 1400);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('reveal');
      // burst floating +₹500 texts
      const msgs: FloatMsg[] = Array.from({ length: 5 }, (_, i) => ({
        id: fid.current++,
        text: '+₹500',
        color: C.green,
        x: 20 + i * 14,
        y: 35 + Math.random() * 20,
      }));
      setFloats(msgs);
      setTimeout(() => setFloats([]), 2200);
    }, 700);
    const t2 = setTimeout(() => setPhase('ready'), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <ParchmentScreen>
      <FloatingTexts msgs={floats} />

      {/* 3-D Canvas — fills top half */}
      <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }} shadows gl={{ antialias: true }}>
          <WinCanvas />
        </Canvas>
        {/* gradient fade into parchment */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to bottom, transparent, ${C.parchment})`, pointerEvents: 'none' }} />
        {/* floating bill badges — same as WinModal */}
        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {['₹500','₹500','₹500','₹500'].map((v, i) => (
            <div key={i} style={{ background: C.gold, border: `2px solid ${C.goldD}`, borderRadius: 12, padding: '3px 8px', fontSize: 11, fontWeight: 900, color: C.goldText, animation: `floatUp 2s ease-out ${i * 0.2}s infinite` }}>+{v}</div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 18px 32px', maxWidth: 480, margin: '0 auto' }}>
        {/* Trophy + title — same as WinModal */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 56, animation: 'pinBounce 1.5s ease-in-out infinite', display: 'inline-block' }}>🏆</div>
          <div style={{ fontFamily: C.serif, fontWeight: 900, fontSize: 34, color: '#92400e', letterSpacing: 3, textShadow: '0 2px 4px rgba(0,0,0,0.15)', marginTop: 4 }}>YOU WIN!</div>
        </div>

        {/* House unlock card */}
        <div style={{
          background: `linear-gradient(135deg, ${C.parchmentL} 0%, #fef08a 100%)`,
          border: `4px solid ${C.goldD}`,
          borderRadius: 20,
          padding: '20px 18px',
          marginBottom: 14,
          boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 0 0 8px rgba(251,191,36,0.15)`,
          animation: phase !== 'enter' ? 'slideInBounce 0.5s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 52, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))', animation: 'pinBounce 2s ease-in-out infinite' }}>🏠</div>
            <div>
              <div style={{ display: 'inline-flex', background: `${C.green}22`, border: `1px solid ${C.green}66`, borderRadius: 20, padding: '3px 10px', marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: C.green, letterSpacing: 2, textTransform: 'uppercase' }}>UNLOCKED!</span>
              </div>
              <div style={{ fontFamily: C.serif, fontSize: 22, fontWeight: 900, color: '#92400e' }}>You got a House!</div>
              <div style={{ fontSize: 13, color: C.muted, fontWeight: 700, marginTop: 2 }}>Smart banking earns real rewards 🎉</div>
            </div>
          </div>

          {/* +₹500 bonus row */}
          <div style={{ background: 'rgba(255,255,255,0.6)', border: `2px solid ${C.goldD}`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>💵</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 14, color: '#92400e' }}>House Placement Bonus</div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Added to your ZenCoins</div>
              </div>
            </div>
            <div style={{ fontFamily: C.serif, fontSize: 28, fontWeight: 900, color: C.green }}>+₹500</div>
          </div>

          {/* Stats — same format as WinModal Banking Recap */}
          <div style={{ background: '#fff', borderRadius: 14, border: `3px solid ${C.goldD}`, padding: '14px 16px' }}>
            <div style={{ fontWeight: 900, fontSize: 14, color: '#0f172a', textAlign: 'center', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>🏦 Banking Recap</div>
            <InfoRow icon="💰" label="Coins Saved"     value={`${savings.toLocaleString()} Coins`}      color={C.green} />
            <InfoRow icon="📈" label="Interest Earned"  value={`₹${interest.toLocaleString()} Earned`}    color={C.blue} />
            <InfoRow icon="🛡️" label="Scams Avoided"   value={`${scamsAvoided} Scams Avoided`}           color={C.purple} />
            <InfoRow icon="🏠" label="Properties Owned" value={`${properties} plots`}                     color={C.orange} />
          </div>
        </div>

        {/* Animated total */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Your Total ZenCoins</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.gold, border: `2px solid ${C.goldD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: C.goldText, fontFamily: C.serif }}>Z</div>
            <span style={{ fontFamily: C.serif, fontSize: 42, fontWeight: 900, color: '#92400e' }}>{displayCoins.toLocaleString()}</span>
          </div>
        </div>

        <BtnGold onClick={onContinue}>🗺️ Return to Town Map →</BtnGold>
      </div>
    </ParchmentScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAME 11 — INVENTORY CARD REVEAL
// ─────────────────────────────────────────────────────────────────────────────
export function Frame11_Inventory({ onContinue }: { onContinue: () => void }) {
  const unlockedBuildings = useGameStore(s => s.unlockedBuildings);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setCardVisible(true), 350); return () => clearTimeout(t); }, []);

  return (
    <ParchmentScreen>
      <HUDBar title="BANKOPOLY" subtitle="Town Map — Inventory" />

      <div style={{ padding: '20px 18px 32px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: C.serif, fontWeight: 900, fontSize: 26, color: '#0f172a' }}>🏗️ Your Building Cards</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, fontWeight: 600 }}>Drag a card onto an empty plot to build</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {BUILDINGS.map((b, i) => {
            const owned = unlockedBuildings.includes(b.id);
            const isNew = b.id === 'house' && cardVisible;
            return (
              <div key={b.id} style={{
                background: owned ? `${b.color}18` : '#f8fafc',
                border: `2.5px solid ${owned ? b.color + (isNew ? 'cc' : '55') : '#e2e8f0'}`,
                borderRadius: 16, padding: '16px 14px',
                animation: isNew ? 'slideInBounce 0.6s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                boxShadow: isNew ? `0 0 24px ${b.color}44` : 'none',
                opacity: owned ? 1 : 0.45,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}>
                {isNew && (
                  <div style={{ position: 'absolute', top: -1, right: -1, background: `linear-gradient(135deg, ${C.green}, ${C.greenD})`, color: '#fff', fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: '0 14px 0 8px', letterSpacing: 1, textTransform: 'uppercase' }}>NEW ✓</div>
                )}
                <div style={{ fontSize: 32, marginBottom: 8, filter: !owned ? 'grayscale(1) opacity(0.4)' : 'none' }}>{owned ? b.icon : '🔒'}</div>
                <div style={{ fontWeight: 900, fontSize: 14, color: owned ? '#0f172a' : C.muted }}>{b.label}</div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 3, lineHeight: 1.5 }}>
                  {owned ? b.concept : b.cost > 0 ? `Unlock for ₹${b.cost.toLocaleString()}` : 'Coming soon'}
                </div>
              </div>
            );
          })}
        </div>

        <BtnPrimary onClick={onContinue} color={C.orange} shadow={C.orangeD}>
          🏠 Place House on Town Map →
        </BtnPrimary>
      </div>
    </ParchmentScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAME 12 — BUILDING PLACEMENT (tap an empty plot on mini-map)
// ─────────────────────────────────────────────────────────────────────────────

/** Visual grid of the 3×3 plot system (bank at centre, 8 outer plots) */
function PlotGrid({ occupied, onPlace }: { occupied: boolean[]; onPlace: (idx: number) => void }) {
  // PlotSystem layout: indices 0-7 = outer 8 plots (bank is centre = index 4 of 3×3)
  // We render a 3×3 grid. Centre = bank, others = plot[i].
  const cells = [0, 1, 2, 3, 'BANK', 4, 5, 6, 7];
  const BUILDING = BUILDINGS[0]; // house

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8, padding: 12,
      background: '#1a3310', borderRadius: 16,
      border: '3px solid #2d5a1b',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    }}>
      {cells.map((cell, i) => {
        if (cell === 'BANK') {
          return (
            <div key="bank" style={{ aspectRatio: '1', background: '#1e3a8a', border: '2px solid #3b82f6', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <span style={{ fontSize: 20 }}>🏦</span>
              <span style={{ fontSize: 8, fontWeight: 900, color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: 0.5 }}>Bank</span>
            </div>
          );
        }
        const idx = cell as number;
        const isOccupied = occupied[idx];
        return (
          <div
            key={i}
            onClick={() => !isOccupied && onPlace(idx)}
            style={{
              aspectRatio: '1',
              background: isOccupied ? `${BUILDING.color}33` : 'rgba(255,255,255,0.06)',
              border: `2px solid ${isOccupied ? BUILDING.color + '88' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              cursor: isOccupied ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              animation: !isOccupied ? 'plotPulse 2s ease-in-out infinite' : 'none',
            }}
          >
            {isOccupied ? (
              <>
                <span style={{ fontSize: 22 }}>{BUILDING.icon}</span>
                <span style={{ fontSize: 7, fontWeight: 800, color: BUILDING.color, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.4 }}>House</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 16, color: 'rgba(74,222,128,0.6)' }}>＋</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Empty</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Frame12_Placement({ onPlaced }: { onPlaced: () => void }) {
  const unlockBuilding = useGameStore(s => s.unlockBuilding);
  const [occupied, setOccupied] = useState<boolean[]>(Array(8).fill(false));
  const [placed, setPlaced] = useState(false);
  const [floats, setFloats] = useState<FloatMsg[]>([]);
  const fid = useRef(0);

  const handlePlace = (idx: number) => {
    if (placed) return;
    // Register in global store (cost=0 since it's the earned house)
    unlockBuilding('house', 0);

    const next = [...occupied];
    next[idx] = true;
    setOccupied(next);
    setPlaced(true);

    const msgs: FloatMsg[] = [
      { id: fid.current++, text: '🏠 House Built!', color: C.orange, x: 30, y: 40 },
      { id: fid.current++, text: '+₹200 Income', color: C.green, x: 50, y: 35 },
      { id: fid.current++, text: '+5 Town Level', color: C.gold, x: 60, y: 45 },
    ];
    setFloats(msgs);
    setTimeout(() => setFloats([]), 2200);
    setTimeout(onPlaced, 2400);
  };

  return (
    <ParchmentScreen>
      <FloatingTexts msgs={floats} />
      <HUDBar title="BANKOPOLY" subtitle="Building Placement" />

      <div style={{ padding: '20px 18px 32px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: C.serif, fontWeight: 900, fontSize: 24, color: '#0f172a' }}>
            {placed ? '🎉 House Placed!' : '🏗️ Tap an empty plot'}
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, fontWeight: 600 }}>
            {placed ? 'Your town is growing!' : 'Choose where to build your house on the town grid'}
          </div>
        </div>

        {/* Mini town grid */}
        <div style={{ marginBottom: 20 }}>
          <PlotGrid occupied={occupied} onPlace={handlePlace} />
        </div>

        {/* Building card (inventory) — same card style as BTile / Modal */}
        {!placed ? (
          <Card accent={C.orange} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: `linear-gradient(135deg, #7c2d12, ${C.orange})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: `0 4px 12px ${C.orange}44`, flexShrink: 0 }}>🏠</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>Starter House</div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>Earned from Board Game win · FREE to place</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                  {['🏘️ Residential', '+5 Town Level', '+₹200 Income'].map(tag => (
                    <span key={tag} style={{ fontSize: 9, background: `${C.orange}18`, border: `1px solid ${C.orange}44`, borderRadius: 8, padding: '2px 7px', color: C.orangeD, fontWeight: 800 }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 26, animation: 'arrowBounce 1s ease-in-out infinite', flexShrink: 0 }}>☝️</div>
            </div>
          </Card>
        ) : (
          <Banner emoji="🏠" text="House successfully placed!" sub="Your ZenCoins are growing passively" bg={C.greenL} border={C.green} />
        )}

        {placed && (
          <div style={{ opacity: 0, animation: 'slideInBounce 0.5s 0.5s ease both', animationFillMode: 'forwards' }}>
            <BtnPrimary color={C.green} shadow={C.greenD}>Proceeding to Town Update… ⏳</BtnPrimary>
          </div>
        )}
      </div>

      <style>{`
        @keyframes plotPulse { 0%,100% { border-color: rgba(74,222,128,0.3); } 50% { border-color: rgba(74,222,128,0.7); box-shadow: 0 0 12px rgba(74,222,128,0.3); } }
        @keyframes arrowBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </ParchmentScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAME 13 — TOWN UPDATED
// ─────────────────────────────────────────────────────────────────────────────
interface Frame13Props { netWorth: number; townLevel?: number; onContinue: () => void; }

export function Frame13_TownUpdated({ netWorth, townLevel = 4, onContinue }: Frame13Props) {
  const wealth = useGameStore(s => s.wealth);
  const [fired, setFired] = useState(false);
  const displayCoins = useCountUp(fired ? wealth + 700 : wealth, 1400);
  const displayLevel = useCountUp(fired ? townLevel + 1 : townLevel, 900);

  useEffect(() => { const t = setTimeout(() => setFired(true), 400); return () => clearTimeout(t); }, []);

  const growthItems = [
    { icon: '🏠', label: 'House Built',        desc: '1 new building placed on your town',  color: C.orange, delay: 0 },
    { icon: '📈', label: '+5 Town Level',       desc: 'Your town is growing!',               color: C.gold,   delay: 120 },
    { icon: '💰', label: '+₹200 Passive Income',desc: 'Rent from your house, every round',   color: C.green,  delay: 240 },
    { icon: '👨‍👩‍👧', label: '+50 Population',  desc: 'New citizens moving in',              color: C.blue,   delay: 360 },
  ];

  return (
    <ParchmentScreen>
      <HUDBar title="BANKOPOLY" subtitle="Town Updated!" right={
        <Pill icon="💎" label="wealth" value={`₹${displayCoins.toLocaleString()}`} border={C.gold} />
      } />

      <div style={{ padding: '24px 18px 32px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 52, animation: 'townCelebrate 0.8s cubic-bezier(0.34,1.56,0.64,1)', display: 'inline-block' }}>🏙️</div>
          <div style={{ fontFamily: C.serif, fontWeight: 900, fontSize: 28, color: '#0f172a', marginTop: 6 }}>Town Updated!</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, fontWeight: 600 }}>Your financial smarts built something real</div>
        </div>

        {/* Level-up card — gold */}
        <div style={{
          background: `linear-gradient(135deg, ${C.parchmentL}, #fef08a)`,
          border: `3px solid ${C.goldD}`,
          borderRadius: 18, padding: '16px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: `0 4px 20px ${C.gold}33`,
          animation: 'levelUp 0.55s 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: C.goldD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Town Level</div>
            <div style={{ fontFamily: C.serif, fontSize: 48, fontWeight: 900, color: '#92400e', lineHeight: 1 }}>{displayLevel}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 4 }}>Previous: Lv. {townLevel}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.green }}>⬆ Level Up!</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>New buildings unlocked</div>
          </div>
        </div>

        {/* Growth items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {growthItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: `${item.color}12`,
              border: `2px solid ${item.color}33`,
              borderRadius: 14, padding: '12px 16px',
              animation: `growthSlide 0.5s ease-out ${item.delay}ms both`,
            }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: '#0f172a' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{item.desc}</div>
              </div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
            </div>
          ))}
        </div>

        <BtnPrimary onClick={onContinue} color={C.green} shadow={C.greenD}>
          See Your Next Goal 🎯
        </BtnPrimary>
      </div>

      <style>{`
        @keyframes townCelebrate { 0% { transform: scale(0) rotate(-10deg); } 70% { transform: scale(1.15) rotate(5deg); } 100% { transform: scale(1) rotate(0); } }
        @keyframes levelUp { 0% { transform: scale(0.9) translateX(-16px); opacity: 0; } 100% { transform: scale(1) translateX(0); opacity: 1; } }
        @keyframes growthSlide { 0% { transform: translateX(-14px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
      `}</style>
    </ParchmentScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAME 14 — NEXT GOAL MOTIVATION
// ─────────────────────────────────────────────────────────────────────────────
export function Frame14_NextGoal({ onContinue }: { onContinue: () => void }) {
  const wealth = useGameStore(s => s.wealth);
  const unlockedBuildings = useGameStore(s => s.unlockedBuildings);
  const [selected, setSelected] = useState(0);

  // Show only locked buildings (next goals)
  const goals = BUILDINGS.filter(b => !unlockedBuildings.includes(b.id)).slice(0, 3);
  if (!goals.length) { onContinue(); return null; }
  const active = goals[selected] ?? goals[0];
  const canAfford = wealth >= active.cost;

  return (
    <ParchmentScreen>
      <HUDBar title="BANKOPOLY" subtitle="Next Goal" right={
        <Pill icon="💎" label="balance" value={`₹${wealth.toLocaleString()}`} border={C.gold} />
      } />

      <div style={{ padding: '20px 18px 32px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: C.goldD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>Your Next Adventure</div>
          <div style={{ fontFamily: C.serif, fontWeight: 900, fontSize: 26, color: '#0f172a' }}>Choose a Goal 🎯</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, fontWeight: 600 }}>Each building teaches a financial skill. Learn → Earn → Build.</div>
        </div>

        {/* Goal tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {goals.map((g, i) => (
            <button key={g.id} onClick={() => setSelected(i)} style={{
              flex: 1, padding: '12px 6px', borderRadius: 14,
              border: `2.5px solid ${selected === i ? g.color + 'cc' : '#e2e8f0'}`,
              background: selected === i ? `${g.color}18` : '#f8fafc',
              cursor: 'pointer', fontWeight: 900, fontSize: 12, fontFamily: C.sans,
              transition: 'all 0.2s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: selected === i ? '#0f172a' : C.muted,
            }}>
              <span style={{ fontSize: 22, filter: selected === i ? 'none' : 'grayscale(0.6) opacity(0.7)' }}>🔒</span>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', color: selected === i ? g.color : C.muted }}>{g.label}</span>
            </button>
          ))}
        </div>

        {/* Active goal detail card */}
        <Card accent={active.color} key={active.id} style={{ marginBottom: 16, animation: 'goalReveal 0.35s ease' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${active.color}88, ${active.color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: `0 4px 14px ${active.color}44`, flexShrink: 0 }}>🔒</div>
            <div>
              <div style={{ display: 'inline-flex', background: `${active.color}18`, border: `1px solid ${active.color}44`, borderRadius: 20, padding: '3px 10px', marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: active.color, letterSpacing: 1.5, textTransform: 'uppercase' }}>Financial Concept</span>
              </div>
              <div style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{active.concept}</div>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{active.label} — ₹{active.cost.toLocaleString()} to unlock</div>
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar label="Module Progress" value={35} max={100} color={active.color} icon="📚" />

          {/* Lessons */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 9 }}>What You'll Learn</div>
            {active.lessons.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: `${active.color}22`, border: `1.5px solid ${active.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: active.color, flexShrink: 0, fontWeight: 900 }}>✓</div>
                <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Reward */}
          <div style={{ background: `${active.color}0e`, border: `1.5px solid ${active.color}33`, borderRadius: 11, padding: '10px 13px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>🏆</span>
            <div>
              <div style={{ fontSize: 10, color: active.color, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>Building Reward</div>
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>{active.reward}</div>
            </div>
          </div>
        </Card>

        {/* Afford check */}
        {!canAfford && (
          <div style={{ background: '#fef9c3', border: `2px solid ${C.gold}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#92400e', fontWeight: 700, textAlign: 'center' }}>
            💡 You need ₹{(active.cost - wealth).toLocaleString()} more ZenCoins. Keep playing to earn!
          </div>
        )}

        <BtnPrimary
          onClick={onContinue}
          color={active.color} shadow={active.colorD}
          disabled={!canAfford}
        >
          {canAfford ? `Start ${active.label} Module 🚀` : `Need ₹${(active.cost - wealth).toLocaleString()} more coins`}
        </BtnPrimary>

        <button onClick={onContinue} style={{ width: '100%', marginTop: 10, padding: '12px', borderRadius: 12, border: '2px solid #e2e8f0', cursor: 'pointer', background: 'transparent', color: C.muted, fontWeight: 800, fontSize: 13, fontFamily: C.sans }}>
          Skip for now → See Recap
        </button>
      </div>

      <style>{`@keyframes goalReveal { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </ParchmentScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAME 15 — BANKING RECAP DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
interface Frame15Props {
  savings: number; interest: number; scamsAvoided: number;
  loans: number;   properties: number;   onContinue: () => void;
}

export function Frame15_BankingRecap({ savings, interest, scamsAvoided, loans, properties, onContinue }: Frame15Props) {
  const wealth = useGameStore(s => s.wealth);
  const [visible, setVisible] = useState(false);
  const savAnim  = useCountUp(visible ? savings  : 0, 1400);
  const intAnim  = useCountUp(visible ? interest : 0, 1600);
  const wAnim    = useCountUp(visible ? wealth   : 0, 1200);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);

  const grade = scamsAvoided >= 3 ? 'A+' : scamsAvoided >= 1 ? 'A' : 'B+';
  const gradeColor = grade === 'A+' ? C.gold : grade === 'A' ? C.green : C.blue;

  const skills = [
    { label: 'Savings Habit',   value: Math.min(100, (savings / 2000) * 100),   color: C.green,  icon: '🏦' },
    { label: 'Scam Awareness',  value: scamsAvoided >= 3 ? 95 : scamsAvoided * 25, color: C.purple, icon: '🛡️' },
    { label: 'Budget Control',  value: properties >= 2 ? 80 : 50,               color: C.blue,   icon: '📊' },
    { label: 'Investment IQ',   value: Math.min(100, interest / 5),             color: C.teal,   icon: '📈' },
  ];

  const insights = [
    { icon: '💡', text: 'Saving regularly builds compound interest over time',                        positive: true },
    { icon: '🛡️', text: `You avoided ${scamsAvoided} scam${scamsAvoided !== 1 ? 's' : ''} — that's ₹${scamsAvoided * 100} protected!`, positive: true },
    loans > 0
      ? { icon: '⚠️', text: 'You took a loan — remember, borrowing costs extra!',                   positive: false }
      : { icon: '✅', text: 'Zero debt! You managed without loans this round',                        positive: true },
    { icon: '📈', text: `Your savings earned ₹${interest.toLocaleString()} in passive interest!`,    positive: true },
  ];

  return (
    <ParchmentScreen>
      <HUDBar title="BANKOPOLY" subtitle="End of Round — Banking Recap" right={
        <Pill icon="💎" label="wealth" value={`₹${wAnim.toLocaleString()}`} border={C.gold} />
      } />

      <div style={{ padding: '20px 18px 32px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: C.serif, fontWeight: 900, fontSize: 26, color: '#0f172a' }}>📊 Banking Recap</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, fontWeight: 600 }}>Here's how you did this round</div>
        </div>

        {/* Grade card */}
        <div style={{
          background: `linear-gradient(135deg, ${gradeColor}18, ${gradeColor}06)`,
          border: `3px solid ${gradeColor}66`,
          borderRadius: 20, padding: '18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 16,
          animation: 'gradeReveal 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: `0 4px 20px ${gradeColor}22`,
        }}>
          <div style={{ width: 70, height: 70, borderRadius: 18, background: `linear-gradient(135deg, ${gradeColor}, ${gradeColor}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.serif, fontSize: 36, fontWeight: 900, color: '#fff', boxShadow: `0 4px 18px ${gradeColor}55`, flexShrink: 0 }}>{grade}</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: '#0f172a' }}>Financial Grade</div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginTop: 3, lineHeight: 1.65 }}>
              {grade === 'A+' ? '🌟 Excellent! You\'re a natural banker.' : grade === 'A' ? '🎯 Great work! Solid financial habits.' : '👍 Good start — keep learning!'}
            </div>
          </div>
        </div>

        {/* Stats 3-up */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { icon: '🏦', label: 'Savings', val: `₹${savAnim.toLocaleString()}`, color: C.green },
            { icon: '📈', label: 'Interest', val: `+₹${intAnim.toLocaleString()}`, color: C.teal },
            { icon: '🛡️', label: 'Scams OK', val: `${scamsAvoided}x`, color: C.purple },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', border: `2px solid ${s.color}44`, borderTop: `4px solid ${s.color}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center', boxShadow: `0 3px 10px ${s.color}18` }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: s.color, fontFamily: C.serif }}>{s.val}</div>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Loan + props */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '📋', label: 'Loans Taken', val: `${loans}x`, color: loans > 0 ? C.red : C.green },
            { icon: '🏠', label: 'Properties',  val: `${properties}`,  color: C.orange },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', border: `2px solid ${s.color}44`, borderTop: `4px solid ${s.color}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: s.color, fontFamily: C.serif }}>{s.val}</div>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Skill bars */}
        <Card style={{ marginBottom: 16, padding: '16px' }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>Skill Progress</div>
          {visible && skills.map(sk => <ProgressBar key={sk.label} {...sk} max={100} />)}
        </Card>

        {/* Insights */}
        <div style={{ marginBottom: 20 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              background: ins.positive ? C.greenL : '#fee2e2',
              border: `2px solid ${ins.positive ? C.green + '55' : C.red + '55'}`,
              borderRadius: 12, padding: '10px 14px', marginBottom: 8,
              animation: `growthSlide 0.4s ease-out ${i * 80}ms both`,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{ins.icon}</span>
              <span style={{ fontSize: 12, color: '#334155', fontWeight: 600, lineHeight: 1.6 }}>{ins.text}</span>
            </div>
          ))}
        </div>

        <BtnGold onClick={onContinue}>Continue the Journey 🔄</BtnGold>
      </div>

      <style>{`@keyframes gradeReveal { 0% { transform: scale(0.8) rotate(-4deg); opacity: 0; } 70% { transform: scale(1.04) rotate(1deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }`}</style>
    </ParchmentScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAME 16 — CONTINUOUS LEARNING LOOP
// ─────────────────────────────────────────────────────────────────────────────
export function Frame16_LearningLoop({ onRestart }: { onRestart: () => void }) {
  const unlockedBuildings = useGameStore(s => s.unlockedBuildings);
  const [activeLoop, setActiveLoop] = useState(0);
  const [activePillar, setActivePillar] = useState<number | null>(null);

  // cycle through loop phases automatically
  useEffect(() => {
    const iv = setInterval(() => setActiveLoop(p => (p + 1) % 3), 1800);
    return () => clearInterval(iv);
  }, []);

  const pillars = [
    { icon: '📚', label: 'Learn',   color: C.blue,   desc: 'Financial concepts through gameplay', examples: ['Savings & Interest', 'Scam Safety', 'Budgeting', 'Loans & Debt'] },
    { icon: '💰', label: 'Earn',    color: C.gold,   desc: 'Make smart decisions to grow wealth', examples: ['Roll dice to play', 'Avoid scams', 'Collect salary', 'Invest wisely'] },
    { icon: '🏗️', label: 'Build',  color: C.green,  desc: 'Turn knowledge into a growing town',  examples: ['Place buildings', 'Level up town', 'Unlock areas', 'Grow population'] },
  ];

  return (
    <ParchmentScreen>
      <HUDBar title="BANKOPOLY" subtitle="The Learning Loop" />

      <div style={{ padding: '20px 18px 32px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: C.goldD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>The Bankopoly Loop</div>
          <div style={{ fontFamily: C.serif, fontWeight: 900, fontSize: 26, color: '#0f172a' }}>Learn. Earn. Build.</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, fontWeight: 600 }}>Every round makes you smarter and your town bigger</div>
        </div>

        {/* Loop pillars */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 6 }}>
          {pillars.map((p, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div
                onClick={() => setActivePillar(activePillar === i ? null : i)}
                style={{
                  padding: '18px 10px', textAlign: 'center', cursor: 'pointer',
                  background: activePillar === i ? `${p.color}22` : activeLoop === i ? `${p.color}14` : '#fff',
                  border: `2.5px solid ${activePillar === i ? p.color + 'cc' : activeLoop === i ? p.color + '66' : '#e2e8f0'}`,
                  borderRadius: i === 0 ? '14px 0 0 14px' : i === 2 ? '0 14px 14px 0' : '0',
                  transition: 'all 0.3s ease',
                  transform: activeLoop === i ? 'translateY(-5px)' : 'none',
                  boxShadow: activeLoop === i ? `0 8px 20px ${p.color}33` : 'none',
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 6, transition: 'transform 0.3s', transform: activeLoop === i ? 'scale(1.18)' : 'scale(1)' }}>{p.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 13, color: activePillar === i || activeLoop === i ? '#0f172a' : C.muted, fontFamily: C.sans }}>{p.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>↩ Loops forever — each run unlocks more!</div>

        {/* Expanded pillar detail */}
        {activePillar !== null && (
          <div style={{
            marginBottom: 14,
            background: `${pillars[activePillar].color}10`,
            border: `1.5px solid ${pillars[activePillar].color}44`,
            borderRadius: 14, padding: '14px 16px',
            animation: 'goalReveal 0.3s ease-out',
          }}>
            <div style={{ fontSize: 12, color: pillars[activePillar].color, fontWeight: 800, marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1 }}>{pillars[activePillar].desc}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pillars[activePillar].examples.map(ex => (
                <span key={ex} style={{ fontSize: 11, background: `${pillars[activePillar].color}18`, border: `1px solid ${pillars[activePillar].color}44`, borderRadius: 8, padding: '3px 9px', color: '#334155', fontWeight: 700 }}>{ex}</span>
              ))}
            </div>
          </div>
        )}

        {/* Town roadmap */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>🏙️ Town Building Roadmap</div>
          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 4, gap: 0 }}>
            {BUILDINGS.map((b, i) => {
              const owned = unlockedBuildings.includes(b.id);
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '4px 7px' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 11,
                      background: owned ? `${b.color}28` : 'rgba(0,0,0,0.05)',
                      border: `2px solid ${owned ? b.color + 'bb' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      filter: !owned ? 'grayscale(1) opacity(0.4)' : 'none',
                      position: 'relative',
                    }}>
                      {owned ? b.icon : '🔒'}
                      {owned && <div style={{ position: 'absolute', top: -5, right: -5, width: 14, height: 14, borderRadius: '50%', background: C.green, border: `2px solid #fff`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 900 }}>✓</div>}
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 800, color: owned ? '#334155' : C.muted, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{b.label.split(' ')[0]}</span>
                  </div>
                  {i < BUILDINGS.length - 1 && <div style={{ width: 14, height: 2, background: owned ? C.green : '#e2e8f0', flexShrink: 0, marginBottom: 14 }} />}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quote */}
        <div style={{ textAlign: 'center', marginBottom: 20, padding: '0 8px' }}>
          <div style={{ fontFamily: C.serif, fontSize: 14, color: C.muted, fontStyle: 'italic', lineHeight: 1.9 }}>
            "Financial literacy isn't taught in schools — but it is taught in{' '}
            <span style={{ color: C.goldD, fontStyle: 'normal', fontWeight: 900 }}>Bankopoly</span>."
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onRestart} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `2.5px solid ${C.gold}`, background: 'transparent', color: C.goldD, fontWeight: 900, fontSize: 14, cursor: 'pointer', fontFamily: C.sans }}>
            🎲 Play Again
          </button>
          <BtnGold onClick={onRestart} style={{ flex: 2 }}>
            🗺️ Back to Town Map
          </BtnGold>
        </div>
      </div>
    </ParchmentScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ORCHESTRATOR — WinRewardFlow
// Drop this where your existing WinModal's "Continue to Town Map" button goes.
// ─────────────────────────────────────────────────────────────────────────────
interface WinRewardFlowProps {
  /** All values come straight from BoardGame's state */
  netWorth:     number;
  savings:      number;
  interest:     number;
  scamsAvoided: number;
  loans:        number;
  properties:   number;
  /** Called after Frame 16 when the player returns to the town map */
  onComplete: () => void;
}

export default function WinRewardFlow({
  netWorth, savings, interest, scamsAvoided, loans, properties, onComplete,
}: WinRewardFlowProps) {
  const [frame, setFrame] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const advance = useCallback((skip?: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setFrame(f => skip !== undefined ? skip : f + 1);
      setTransitioning(false);
    }, 220);
  }, []);

  const screens = [
    <Frame10_WinReward key={0} netWorth={netWorth} savings={savings} interest={interest} scamsAvoided={scamsAvoided} properties={properties} onContinue={() => advance()} />,
    <Frame11_Inventory key={1} onContinue={() => advance()} />,
    <Frame12_Placement key={2} onPlaced={() => advance()} />,
    <Frame13_TownUpdated key={3} netWorth={netWorth} onContinue={() => advance()} />,
    <Frame14_NextGoal key={4} onContinue={() => advance()} />,
    <Frame15_BankingRecap key={5} savings={savings} interest={interest} scamsAvoided={scamsAvoided} loans={loans} properties={properties} onContinue={() => advance()} />,
    <Frame16_LearningLoop key={6} onRestart={onComplete} />,
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
      <div style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'scale(0.97)' : 'scale(1)', transition: 'opacity 0.2s ease, transform 0.2s ease', width: '100%', height: '100%' }}>
        {screens[Math.min(frame, screens.length - 1)]}
      </div>

      {/* ── Global keyframes (Bankopoly-matching) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');

        @keyframes bannerPop {
          0%   { transform: scale(0.88) translateX(-8px); opacity: 0; }
          70%  { transform: scale(1.03) translateX(2px); opacity: 1; }
          100% { transform: scale(1) translateX(0); opacity: 1; }
        }
        @keyframes iconPulse {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.12); }
        }
        @keyframes slideInBounce {
          0%   { transform: scale(0.88) translateY(14px); opacity: 0; }
          65%  { transform: scale(1.03) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes pinBounce {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-7px); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-70px) scale(1.1); opacity: 0; }
        }
        @keyframes goalReveal {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes growthSlide {
          0%   { transform: translateX(-14px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes gradeReveal {
          0%   { transform: scale(0.8) rotate(-4deg); opacity: 0; }
          70%  { transform: scale(1.04) rotate(1deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }

        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
        ::-webkit-scrollbar-thumb { background: ${C.goldD}88; border-radius: 4px; }
      `}</style>
    </div>
  );
}