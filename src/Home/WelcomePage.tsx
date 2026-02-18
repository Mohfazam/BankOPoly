'use client';

import React, { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPEWRITER HOOK — cycling (delete + retype)
// ═══════════════════════════════════════════════════════════════════════════
function useTypewriter(texts: string[], speed = 60, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(i => i + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(i => i - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx(i => (i + 1) % texts.length);
    }

    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  return displayed;
}

// ═══════════════════════════════════════════════════════════════════════════
// ONE-SHOT TYPEWRITER HOOK — types once, then holds (no delete)
// ═══════════════════════════════════════════════════════════════════════════
function useTypeOnce(text: string, speed = 90, startDelay = 300) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const init = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(init);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed]);

  const done = displayed.length === text.length;
  return { displayed, done };
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING COIN
// ═══════════════════════════════════════════════════════════════════════════
interface FloatingCoin {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  symbol: string;
}

function useFloatingCoins(count = 14) {
  const [coins] = useState<FloatingCoin[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 7 + Math.random() * 6,
      size: 16 + Math.random() * 18,
      symbol: ['₹', '💰', '🪙', '💎', '⭐'][Math.floor(Math.random() * 5)],
    }))
  );
  return coins;
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI BOARD PREVIEW (decorative)
// ═══════════════════════════════════════════════════════════════════════════
const MINI_TILES = [
  { icon: '🏁', color: '#16a34a' }, { icon: '🏦', color: '#2563eb' },
  { icon: '💰', color: '#0d9488' }, { icon: '🏠', color: '#ea580c' },
  { icon: '⚠️', color: '#dc2626' }, { icon: '🏠', color: '#ea580c' },
  { icon: '⭐', color: '#4ade80' }, { icon: '🏦', color: '#2563eb' },
  { icon: '💰', color: '#0d9488' }, { icon: '🏠', color: '#ea580c' },
  { icon: '⚠️', color: '#dc2626' }, { icon: '📋', color: '#db2777' },
];

function MiniBoardPreview() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % MINI_TILES.length), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: 4,
      width: 160,
      height: 120,
      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
    }}>
      {MINI_TILES.map((t, i) => (
        <div
          key={i}
          style={{
            borderRadius: 6,
            background: i === activeIdx ? t.color : 'rgba(255,255,255,0.12)',
            border: `2px solid ${i === activeIdx ? 'white' : t.color}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: i === activeIdx ? 16 : 12,
            transition: 'all 0.3s ease',
            boxShadow: i === activeIdx ? `0 0 12px ${t.color}88` : 'none',
            transform: i === activeIdx ? 'scale(1.12)' : 'scale(1)',
          }}
        >
          {t.icon}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE CARD
// ═══════════════════════════════════════════════════════════════════════════
function FeatureCard({ icon, title, desc, color, border, delay }: {
  icon: string; title: string; desc: string;
  color: string; border: string; delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: `2px solid ${border}`,
      borderRadius: 16,
      padding: '18px 16px',
      backdropFilter: 'blur(8px)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: `0 4px 20px ${border}33`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 10,
        boxShadow: `0 4px 12px ${color}66`,
      }}>
        {icon}
      </div>
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 8,
        color: 'white',
        marginBottom: 6,
        lineHeight: 1.6,
        letterSpacing: 0.5,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: '"Nunito", system-ui',
        fontSize: 12,
        color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.6,
        fontWeight: 600,
      }}>
        {desc}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT BADGE
// ═══════════════════════════════════════════════════════════════════════════
function StatBadge({ icon, value, label, color }: {
  icon: string; value: string; label: string; color: string;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 4,
      background: 'rgba(0,0,0,0.3)',
      border: `2px solid ${color}55`,
      borderRadius: 16,
      padding: '12px 18px',
      minWidth: 80,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: '"Nunito", system-ui', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WELCOME PAGE — MAIN
// ═══════════════════════════════════════════════════════════════════════════
export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [diceAnim, setDiceAnim] = useState(false);
  const [diceVal, setDiceVal] = useState('🎲');
  const diceEmojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  const coins = useFloatingCoins(14);

  const typewriterText = useTypewriter([
    'SAVE SMART 🏦',
    'AVOID SCAMS 🛡️',
    'BUILD WEALTH 💎',
    'OWN PROPERTY 🏠',
    'EARN INTEREST 💰',
    'LEVEL UP! 🏆',
  ], 65, 1600);

  // One-shot typewriter for the hero title and subtitle
  const { displayed: titleTyped, done: titleDone } = useTypeOnce('BANKOPOLY', 110, 500);
  const { displayed: subtitleTyped } = useTypeOnce('THE MONEY MASTERY BOARD GAME', 55, titleDone ? 200 : 99999);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setLogoVisible(true), 150);
    // Delay CTA until title has had time to finish (9 chars × 110ms ≈ 1s + buffer)
    setTimeout(() => setCtaVisible(true), 2200);
  }, []);

  const rollDice = () => {
    if (diceAnim) return;
    setDiceAnim(true);
    let ticks = 0;
    const t = setInterval(() => {
      setDiceVal(diceEmojis[Math.floor(Math.random() * 6)]);
      ticks++;
      if (ticks > 10) { clearInterval(t); setDiceAnim(false); }
    }, 80);
  };

  const features = [
    { icon: '🎲', title: 'ROLL & LEARN',   desc: 'Roll dice, move around the board, and discover real-world money lessons with every tile!', color: '#dc2626', border: '#fca5a5', delay: 1200 },
    { icon: '🏦', title: 'SAVE & EARN',    desc: 'Build your savings account and watch it grow with 10% interest — just like a real bank!', color: '#2563eb', border: '#93c5fd', delay: 1400 },
    { icon: '🛡️', title: 'SCAM PATROL',   desc: 'Spot fake OTP requests and protect your coins. Real banks NEVER ask for your password!', color: '#9333ea', border: '#c084fc', delay: 1600 },
    { icon: '🏠', title: 'OWN IT ALL',     desc: 'Buy properties and collect passive rent income — become a real estate tycoon!', color: '#ea580c', border: '#fb923c', delay: 1800 },
    { icon: '📋', title: 'LOAN LESSONS',   desc: 'Learn how bank loans work — borrow ₹100 but pay back ₹120. Interest costs real money!', color: '#db2777', border: '#f9a8d4', delay: 2000 },
    { icon: '🏆', title: 'WIN THE TOWN',   desc: 'Reach ₹5,000 net worth and unlock the full 3D Town Map. Your wealth builds the city!', color: '#d97706', border: '#fbbf24', delay: 2200 },
  ];

  if (!mounted) return null;

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a1628 0%, #0f2419 35%, #1a0a2e 65%, #0a1628 100%)',
      fontFamily: '"Nunito", system-ui, sans-serif',
      overflowX: 'hidden',
      position: 'relative',
    }}>

      {/* ── COIN PATTERN BG ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.07,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='18' fill='none' stroke='%23a16207' stroke-width='2'/%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='%23a16207' stroke-width='1'/%3E%3Cline x1='30' y1='12' x2='30' y2='48' stroke='%23a16207' stroke-width='1.5'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />

      {/* ── FLOATING COINS ── */}
      {coins.map(coin => (
        <div
          key={coin.id}
          style={{
            position: 'fixed',
            left: `${coin.x}%`,
            bottom: '-40px',
            zIndex: 1,
            pointerEvents: 'none',
            fontSize: coin.size,
            opacity: 0.18,
            animation: `coinFloat ${coin.duration}s ease-in-out ${coin.delay}s infinite`,
          }}
        >
          {coin.symbol}
        </div>
      ))}

      {/* ── RADIAL GLOWS ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 60, paddingBottom: 40, paddingLeft: 20, paddingRight: 20,
      }}>

        {/* ── TOP BADGE ── */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(251,191,36,0.1)',
          border: '2px solid rgba(251,191,36,0.35)',
          borderRadius: 40,
          padding: '6px 18px',
          marginBottom: 32,
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'all 0.6s ease',
        }}>
          <span style={{ fontSize: 14 }}>🎓</span>
          <span style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 7,
            color: '#fbbf24',
            letterSpacing: 1,
          }}>
            FINANCIAL LITERACY GAME
          </span>
          <span style={{ fontSize: 14 }}>🎓</span>
        </div>

        {/* ── LOGO LOCKUP ── */}
        <div style={{
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(20px)',
          transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          textAlign: 'center',
          marginBottom: 10,
        }}>
          {/* Icon Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #fbbf24, #d97706)',
              border: '3px solid #fef08a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
              boxShadow: '0 8px 24px rgba(251,191,36,0.4), 0 0 0 6px rgba(251,191,36,0.12)',
              animation: 'logoPulse 3s ease-in-out infinite',
            }}>
              🏦
            </div>
          </div>

          {/* BANKOPOLY wordmark — typed letter by letter */}
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(32px, 6.5vw, 58px)',
            color: '#fbbf24',
            letterSpacing: 6,
            textShadow: '0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.2), 0 4px 12px rgba(0,0,0,0.7)',
            lineHeight: 1.2,
            marginBottom: 10,
            minHeight: '1.2em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {titleTyped}
            {/* blinking cursor — only shown while typing */}
            {!titleDone && (
              <span style={{
                display: 'inline-block',
                width: '3px',
                height: '0.85em',
                background: '#fbbf24',
                marginLeft: 4,
                verticalAlign: 'middle',
                animation: 'blink 0.7s step-end infinite',
                boxShadow: '0 0 8px rgba(251,191,36,0.8)',
              }} />
            )}
            {/* After title is done, add a tiny golden glow pulse instead */}
            {titleDone && (
              <span style={{
                display: 'inline-block',
                width: 10, height: 10,
                borderRadius: '50%',
                background: '#fbbf24',
                marginLeft: 10,
                verticalAlign: 'middle',
                animation: 'logoPulse 1.5s ease-in-out infinite',
                boxShadow: '0 0 12px rgba(251,191,36,0.9)',
              }} />
            )}
          </div>

          {/* Subtitle — typed after title finishes */}
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(7px, 1.4vw, 10px)',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: 3,
            marginBottom: 28,
            minHeight: '1.6em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {subtitleTyped}
            {titleDone && subtitleTyped.length < 'THE MONEY MASTERY BOARD GAME'.length && (
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '0.8em',
                background: 'rgba(255,255,255,0.45)',
                marginLeft: 3,
                verticalAlign: 'middle',
                animation: 'blink 0.7s step-end infinite',
              }} />
            )}
          </div>
        </div>

        {/* ── TYPEWRITER STRIP ── */}
        <div style={{
          opacity: ctaVisible ? 1 : 0,
          transition: 'opacity 0.6s ease',
          marginBottom: 36,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'rgba(0,0,0,0.45)',
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '14px 24px',
            minWidth: 280,
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ fontSize: 16, color: '#4ade80', fontWeight: 900, fontFamily: '"Nunito", system-ui' }}>▶</span>
            <span style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 'clamp(9px, 1.8vw, 13px)',
              color: '#fef08a',
              letterSpacing: 1,
              minWidth: 200,
              textAlign: 'left',
            }}>
              {typewriterText}
              <span style={{ animation: 'blink 1s step-end infinite', color: '#fbbf24' }}>|</span>
            </span>
          </div>
        </div>

        {/* ── HERO VISUALS ROW ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 40, flexWrap: 'wrap',
          marginBottom: 44,
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s ease 0.3s',
        }}>
          {/* Stat badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <StatBadge icon="🎲" value="20" label="TILES" color="#fbbf24" />
            <StatBadge icon="🏠" value="4" label="PROPS" color="#fb923c" />
            <StatBadge icon="💰" value="5K" label="GOAL" color="#4ade80" />
            <StatBadge icon="🏆" value="3D" label="TOWN" color="#c084fc" />
          </div>

          {/* Divider */}
          <div style={{ width: 2, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: 1, flexShrink: 0 }} className="hide-mobile" />

          {/* Mini board preview */}
          <div style={{ animation: 'boardFloat 5s ease-in-out infinite' }}>
            <MiniBoardPreview />
          </div>
        </div>

        {/* ── CTA BUTTONS ── */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 20,
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.5s',
        }}>
          {/* PRIMARY — Play Now */}
          <a href="/town" style={{ textDecoration: 'none' }}>
            <button
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '18px 36px',
                borderRadius: 20,
                border: 'none',
                background: btnHover
                  ? 'linear-gradient(135deg, #fef08a, #fbbf24)'
                  : 'linear-gradient(135deg, #fbbf24, #d97706)',
                color: '#78350f',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 12,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: btnHover
                  ? '0 8px 0 #92400e, 0 12px 32px rgba(251,191,36,0.5)'
                  : '0 6px 0 #92400e, 0 8px 24px rgba(251,191,36,0.35)',
                transform: btnHover ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'all 0.18s ease',
                letterSpacing: 1,
              }}
            >
              <span style={{ fontSize: 20 }}>🏁</span>
              PLAY NOW!
            </button>
          </a>

          {/* SECONDARY — Roll Dice (interactive) */}
          <button
            onClick={rollDice}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '18px 28px',
              borderRadius: 20,
              border: '3px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.07)',
              color: 'white',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 11,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 0 rgba(0,0,0,0.4)',
              transition: 'all 0.15s ease',
              animation: diceAnim ? 'diceRoll 0.12s linear infinite' : undefined,
              letterSpacing: 1,
            }}
          >
            <span style={{ fontSize: 20 }}>{diceVal}</span>
            TRY LUCK
          </button>
        </div>

        {/* Hint line */}
        <div style={{
          fontFamily: '"Nunito", system-ui',
          fontSize: 12, color: 'rgba(255,255,255,0.35)',
          fontWeight: 700, letterSpacing: 1,
          marginBottom: 60,
          opacity: ctaVisible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.8s',
        }}>
          🎮 No sign-up needed · Free to play · Learn by doing
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DIVIDER
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, marginBottom: 48, padding: '0 24px', boxSizing: 'border-box',
      }}>
        <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.3))' }} />
        <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: '#fbbf24', letterSpacing: 2, whiteSpace: 'nowrap' }}>⬡ WHAT YOU LEARN ⬡</div>
        <div style={{ flex: 1, height: 2, background: 'linear-gradient(to left, transparent, rgba(251,191,36,0.3))' }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 24px',
        marginBottom: 64,
        boxSizing: 'border-box',
      }}>
        {features.map(f => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS STRIP
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: 'linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(37,99,235,0.12) 100%)',
        border: '2px solid rgba(255,255,255,0.08)',
        margin: '0 24px 64px',
        borderRadius: 24,
        padding: '36px 32px',
        maxWidth: 900,
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
      }}>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 10,
          color: 'white',
          textAlign: 'center',
          marginBottom: 32,
          letterSpacing: 2,
        }}>
          🗺️ HOW TO WIN
        </div>
        <div style={{
          display: 'flex', gap: 0,
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative',
        }}>
          {[
            { step: '01', icon: '🎲', label: 'ROLL DICE', desc: 'Tap to roll and move your token across 20 tiles', color: '#fbbf24' },
            { step: '02', icon: '🏦', label: 'BANK IT', desc: 'Save coins & collect interest on every EARN tile', color: '#4ade80' },
            { step: '03', icon: '🛡️', label: 'STAY SAFE', desc: 'Ignore scam OTP requests — report & earn ₹50!', color: '#c084fc' },
            { step: '04', icon: '🏆', label: 'WIN TOWN', desc: 'Hit ₹5,000 net worth to unlock your 3D town!', color: '#fb923c' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.step}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', flex: '1 1 160px', maxWidth: 200, padding: '0 8px',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `radial-gradient(circle, ${item.color}33, ${item.color}11)`,
                  border: `3px solid ${item.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 12,
                  boxShadow: `0 0 16px ${item.color}44`,
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 6, color: item.color,
                  marginBottom: 6, letterSpacing: 1,
                }}>
                  STEP {item.step}
                </div>
                <div style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 7, color: 'white',
                  marginBottom: 8, lineHeight: 1.6,
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: '"Nunito", system-ui',
                  fontSize: 12, color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.6, fontWeight: 600,
                }}>
                  {item.desc}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{
                  alignSelf: 'center',
                  fontSize: 18, color: 'rgba(255,255,255,0.2)',
                  fontWeight: 900, padding: '0 4px',
                  flexShrink: 0,
                }}>
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '0 24px 80px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(234,88,12,0.08))',
          border: '2px solid rgba(251,191,36,0.2)',
          borderRadius: 24,
          padding: '40px 32px',
          maxWidth: 540, margin: '0 auto',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12, animation: 'pinBounce 1.4s ease-in-out infinite' }}>🏆</div>
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(10px, 2.5vw, 16px)',
            color: 'white', marginBottom: 10, lineHeight: 1.6, letterSpacing: 1,
          }}>
            READY TO BECOME A<br />
            <span style={{ color: '#fbbf24' }}>MONEY MASTER?</span>
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui',
            fontSize: 14, color: 'rgba(255,255,255,0.55)',
            marginBottom: 28, lineHeight: 1.6, fontWeight: 600,
          }}>
            Join thousands of young players learning real financial skills through play. Save, invest, avoid scams — and build your dream town!
          </div>
          <a href="/town" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '16px 40px',
              borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 12, cursor: 'pointer', letterSpacing: 1,
              boxShadow: '0 6px 0 #14532d, 0 8px 24px rgba(22,163,74,0.4)',
              transition: 'all 0.15s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 0 #14532d, 0 12px 32px rgba(22,163,74,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 #14532d, 0 8px 24px rgba(22,163,74,0.4)';
              }}
            >
              🏁 START PLAYING FREE
            </button>
          </a>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        borderTop: '2px solid rgba(255,255,255,0.06)',
        padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#fbbf24', border: '2px solid #d97706',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>🏦</div>
          <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#fbbf24', letterSpacing: 2 }}>BANKOPOLY</span>
        </div>
        <div style={{
          fontFamily: '"Nunito", system-ui',
          fontSize: 11, color: 'rgba(255,255,255,0.25)',
          fontWeight: 700,
        }}>
          🎓 Financial literacy for the next generation
        </div>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 6, color: 'rgba(255,255,255,0.15)', letterSpacing: 1,
        }}>
          v1.0.0 · BANKOPOLY © 2025
        </div>
      </div>

      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@600;700;800;900&display=swap');

        @keyframes coinFloat {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0.18; }
          10%  { opacity: 0.18; }
          90%  { opacity: 0.18; }
          100% { transform: translateY(-105vh) rotate(360deg); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes boardFloat {
          0%, 100% { transform: translateY(0) rotateX(6deg); }
          50%       { transform: translateY(-10px) rotateX(6deg); }
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 8px 24px rgba(251,191,36,0.4), 0 0 0 6px rgba(251,191,36,0.12); }
          50%       { box-shadow: 0 8px 36px rgba(251,191,36,0.65), 0 0 0 10px rgba(251,191,36,0.18); }
        }
        @keyframes pinBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes diceRoll {
          0%   { transform: rotate(0deg) scale(1.08); }
          25%  { transform: rotate(90deg) scale(0.94); }
          50%  { transform: rotate(180deg) scale(1.08); }
          75%  { transform: rotate(270deg) scale(0.94); }
          100% { transform: rotate(360deg) scale(1.08); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        ::-webkit-scrollbar-thumb { background: rgba(251,191,36,0.4); border-radius: 3px; }
      `}</style>
    </div>
  );
}