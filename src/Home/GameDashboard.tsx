// ═══════════════════════════════════════════════════════════════════════════
// GameDashboard.tsx  —  Bankopoly Premium Financial Dashboard
// ═══════════════════════════════════════════════════════════════════════════

import{ useState, useEffect} from 'react';
import { JSX } from 'react';
import { useGameStats, deriveDashboardData } from '../Store/useGameStore';

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active, duration]);
  return val;
}

const fmt = (n: number) => n.toLocaleString();
const TAB_IDS = ['wealth', 'loans', 'scams'] as const;
type TabId = typeof TAB_IDS[number];

// ─── Tab data ─────────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'wealth', label: 'Savings',  icon: '💰' },
  { id: 'loans',  label: 'Loans',    icon: '🏛️' },
  { id: 'scams',  label: 'Security', icon: '🛡️' },
];

// ─── Circular progress ring ───────────────────────────────────────────────────
function Ring({ pct, size = 120, stroke = 10, color }: { pct: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

// ─── Loan deed card ───────────────────────────────────────────────────────────
function LoanDeed({ loan, index }: { loan: ReturnType<typeof deriveDashboardData>['loansHistory'][0]; index: number }) {
  const progress = Math.min(100, Math.round((loan.repaidAmount / loan.totalOwed) * 100));
  return (
    <div style={{
      position: 'relative',
      background: loan.fullyRepaid
        ? 'linear-gradient(135deg, rgba(20,60,20,0.9) 0%, rgba(10,40,10,0.95) 100%)'
        : 'linear-gradient(135deg, rgba(60,30,10,0.9) 0%, rgba(40,15,5,0.95) 100%)',
      border: `1.5px solid ${loan.fullyRepaid ? 'rgba(74,222,128,0.35)' : 'rgba(251,146,60,0.35)'}`,
      borderRadius: 14,
      padding: '14px 16px 12px',
      animation: `deckSlide 0.35s ${index * 0.07}s both ease-out`,
      overflow: 'hidden',
    }}>
      {/* Watermark */}
      <div style={{
        position:'absolute', right: 12, top: '50%', transform:'translateY(-50%)',
        fontSize: 52, opacity: 0.04, pointerEvents:'none', userSelect:'none',
        fontFamily: 'Georgia, serif', fontWeight: 900,
      }}>🏛️</div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform:'uppercase', color:'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 2 }}>
            Loan #{String(index + 1).padStart(2,'0')} · {new Date(loan.takenAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color:'#fbbf24', fontFamily:'Georgia,serif', lineHeight:1 }}>
            🪙 {fmt(loan.borrowedAmount)}
          </div>
          <div style={{ fontSize: 11, color:'rgba(255,255,255,0.4)', marginTop: 3 }}>
            Total owed: <span style={{ color:'#f87171' }}>🪙 {fmt(loan.totalOwed)}</span>
          </div>
        </div>
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 6,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 900, padding:'3px 10px', borderRadius: 20,
            background: loan.fullyRepaid ? 'rgba(74,222,128,0.15)' : 'rgba(251,146,60,0.15)',
            color: loan.fullyRepaid ? '#4ade80' : '#fb923c',
            border: `1px solid ${loan.fullyRepaid ? 'rgba(74,222,128,0.5)' : 'rgba(251,146,60,0.5)'}`,
            letterSpacing: 1, textTransform:'uppercase',
          }}>
            {loan.fullyRepaid ? '✓ SETTLED' : '⏳ OPEN'}
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize: 10, color:'rgba(255,255,255,0.3)', marginBottom: 1 }}>Repaid</div>
            <div style={{ fontSize: 16, fontWeight: 900, color:'#4ade80' }}>🪙 {fmt(loan.repaidAmount)}</div>
          </div>
        </div>
      </div>

      {/* Progress track */}
      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
        <div style={{ flex: 1, height: 6, background:'rgba(255,255,255,0.07)', borderRadius: 99, overflow:'hidden' }}>
          <div style={{
            height:'100%',
            width:`${progress}%`,
            background: loan.fullyRepaid
              ? 'linear-gradient(90deg, #4ade80, #22d3ee)'
              : 'linear-gradient(90deg, #fb923c, #f59e0b)',
            borderRadius: 99,
            boxShadow: loan.fullyRepaid ? '0 0 8px rgba(74,222,128,0.6)' : '0 0 8px rgba(251,146,60,0.6)',
            transition: 'width 1s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 900, color:'rgba(255,255,255,0.5)', minWidth: 34, textAlign:'right' }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function GameDashboard() {
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState<TabId>('wealth');
  const [animKey, setAnimKey] = useState(0);
  const stats = useGameStats();
  const d     = deriveDashboardData(stats);

  const savedCount    = useCountUp(d.totalAmountSaved,    1400, open);
  const interestCount = useCountUp(d.totalInterestEarned, 1200, open);
  const avoidRate     = useCountUp(d.scamAvoidRate,       1000, open);

  function openDash() {
    setOpen(true);
    setAnimKey(k => k + 1);
    setTab('wealth');
  }

  // ── Wealth tab ──────────────────────────────────────────────────────────────
  const WealthTab = () => (
    <div key={animKey + 'w'} style={{ animation: 'tabFade 0.3s ease' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.04) 100%)',
        border: '1.5px solid rgba(251,191,36,0.25)',
        borderRadius: 18,
        padding: '28px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        <div style={{
          position:'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.12) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform:'uppercase', color:'rgba(251,191,36,0.6)', fontWeight: 800, marginBottom: 8 }}>
          Total Deposited
        </div>
        <div style={{
          fontSize: 52, fontWeight: 900, fontFamily: 'Georgia, serif',
          color: '#fbbf24', lineHeight: 1,
          textShadow: '0 0 40px rgba(251,191,36,0.5), 0 4px 0 rgba(0,0,0,0.4)',
        }}>
          🪙 {fmt(savedCount)}
        </div>
        <div style={{ fontSize: 13, color:'rgba(255,255,255,0.3)', marginTop: 6, fontWeight: 700 }}>
          across all savings runs
        </div>
      </div>

      {/* Interest card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(34,197,94,0.05))',
        border: '1.5px solid rgba(74,222,128,0.25)',
        borderRadius: 16,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform:'uppercase', color:'rgba(74,222,128,0.6)', fontWeight: 800, marginBottom: 4 }}>
            Interest Earned
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, fontFamily:'Georgia,serif', color:'#4ade80', lineHeight:1,
            textShadow:'0 0 20px rgba(74,222,128,0.4)' }}>
            🪙 {fmt(interestCount)}
          </div>
          <div style={{ fontSize: 12, color:'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: 700 }}>
            from EARN tiles
          </div>
        </div>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: 28, boxShadow: '0 8px 24px rgba(22,163,74,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}>📈</div>
      </div>

      {d.totalAmountSaved === 0 && d.totalInterestEarned === 0 && (
        <EmptySlate icon="🏦" msg="Play a round and save coins to see your wealth grow." />
      )}
    </div>
  );

  // ── Loans tab ───────────────────────────────────────────────────────────────
  const LoansTab = () => (
    <div key={animKey + 'l'} style={{ animation: 'tabFade 0.3s ease' }}>
      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14,
      }}>
        {[
          { label: 'Taken',    val: fmt(d.totalLoansTaken),  color:'#818cf8', icon:'📋' },
          { label: 'Borrowed', val: `🪙${fmt(d.totalBorrowed)}`, color:'#fb923c', icon:'⬇️' },
          { label: 'Repaid',   val: `🪙${fmt(d.totalRepaid)}`,   color:'#4ade80', icon:'✅' },
        ].map(({ label, val, color, icon }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${color}28`,
            borderRadius: 14,
            padding: '14px 10px 12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 17, fontWeight: 900, color, fontFamily:'Georgia,serif', lineHeight:1, marginBottom: 3 }}>
              {val}
            </div>
            <div style={{ fontSize: 10, textTransform:'uppercase', letterSpacing: 1, color:'rgba(255,255,255,0.3)', fontWeight: 800 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Active loans indicator */}
      {d.activeLoans > 0 && (
        <div style={{
          background: 'rgba(248,113,113,0.1)',
          border: '1.5px solid rgba(248,113,113,0.35)',
          borderRadius: 12,
          padding: '10px 16px',
          display:'flex', alignItems:'center', gap: 10,
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 13, fontWeight: 800, color:'#fca5a5' }}>
            {d.activeLoans} active loan{d.activeLoans > 1 ? 's' : ''} outstanding
          </span>
        </div>
      )}

      {/* Loan deeds */}
      {d.loansHistory.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
          <div style={{ fontSize: 10, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,0.25)', fontWeight:800, marginBottom: 2 }}>
            Loan History
          </div>
          {[...d.loansHistory].reverse().map((loan, i) => (
            <LoanDeed key={loan.id} loan={loan} index={i} />
          ))}
        </div>
      ) : (
        <EmptySlate icon="🏛️" msg="No loans taken yet. Borrow from the bank during gameplay." />
      )}
    </div>
  );

  // ── Scams tab ───────────────────────────────────────────────────────────────
  const ScamsTab = () => {
    const shieldColor = d.scamAvoidRate >= 80 ? '#4ade80' : d.scamAvoidRate >= 50 ? '#fbbf24' : '#f87171';
    const rating      = d.scamAvoidRate >= 80 ? 'GUARDIAN' : d.scamAvoidRate >= 50 ? 'AWARE' : 'AT RISK';

    return (
      <div key={animKey + 's'} style={{ animation: 'tabFade 0.3s ease' }}>
        {/* Shield meter hero */}
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          border: `1.5px solid ${shieldColor}22`,
          borderRadius: 18,
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position:'absolute', inset:0,
            background: `radial-gradient(circle at 20% 50%, ${shieldColor}0f 0%, transparent 60%)`,
            pointerEvents:'none',
          }}/>
          <div style={{ position:'relative', flexShrink: 0 }}>
            <Ring pct={d.scamsEncountered > 0 ? avoidRate : 0} size={110} stroke={9} color={shieldColor} />
            <div style={{
              position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily:'Georgia,serif', color: shieldColor, lineHeight:1 }}>
                {d.scamsEncountered > 0 ? `${avoidRate}%` : '—'}
              </div>
              <div style={{ fontSize: 9, letterSpacing:1, color:'rgba(255,255,255,0.4)', fontWeight:800 }}>
                AVOIDED
              </div>
            </div>
          </div>
          <div>
            <div style={{
              display:'inline-block',
              fontSize: 10, letterSpacing: 2, textTransform:'uppercase',
              color: shieldColor, fontWeight: 900, marginBottom: 6,
              background: `${shieldColor}18`, border:`1px solid ${shieldColor}40`,
              borderRadius: 20, padding:'3px 10px',
            }}>
              🛡️ {rating}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily:'Georgia,serif', color:'#fff', lineHeight:1, marginBottom: 6 }}>
              {d.scamsAvoided} / {d.scamsEncountered}
            </div>
            <div style={{ fontSize: 12, color:'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              scams successfully reported
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          <div style={{
            background: 'rgba(248,113,113,0.08)', border:'1.5px solid rgba(248,113,113,0.2)',
            borderRadius: 14, padding: '16px',
          }}>
            <div style={{ fontSize: 26, marginBottom: 2 }}>⚠️</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily:'Georgia,serif', color:'#f87171', lineHeight:1 }}>
              {d.scamsEncountered}
            </div>
            <div style={{ fontSize: 10, textTransform:'uppercase', letterSpacing:1, color:'rgba(255,255,255,0.35)', fontWeight:800, marginTop: 4 }}>
              Encountered
            </div>
          </div>
          <div style={{
            background: 'rgba(74,222,128,0.08)', border:'1.5px solid rgba(74,222,128,0.2)',
            borderRadius: 14, padding: '16px',
          }}>
            <div style={{ fontSize: 26, marginBottom: 2 }}>🚫</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily:'Georgia,serif', color:'#4ade80', lineHeight:1 }}>
              {d.scamsAvoided}
            </div>
            <div style={{ fontSize: 10, textTransform:'uppercase', letterSpacing:1, color:'rgba(255,255,255,0.35)', fontWeight:800, marginTop: 4 }}>
              Reported Safe
            </div>
          </div>
        </div>

        {d.scamsEncountered === 0 && (
          <EmptySlate icon="🛡️" msg="No scam tiles encountered yet. Stay vigilant!" />
        )}
      </div>
    );
  };

  const TAB_CONTENT: Record<TabId, () => JSX.Element> = {
    wealth: WealthTab,
    loans:  LoansTab,
    scams:  ScamsTab,
  };

  return (
    <>
      {/* ── HUD trigger button ────────────────────────────────────────── */}
      <button
        onClick={openDash}
        style={{
          display:'flex', alignItems:'center', gap: 7,
          background:'rgba(0,0,0,0.4)',
          border:'2px solid rgba(129,140,248,0.7)',
          borderRadius: 20, padding:'5px 15px',
          cursor:'pointer', fontFamily:'"Nunito",system-ui,sans-serif',
          fontWeight: 900, fontSize: 14, color:'#c7d2fe',
          transition:'all 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(129,140,248,0.2)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#818cf8';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.4)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129,140,248,0.7)';
        }}
      >
        <span style={{ fontSize: 15 }}>📊</span>
        Dashboard
      </button>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:'fixed', inset: 0, zIndex: 999,
            background:'rgba(0,0,0,0.85)',
            backdropFilter:'blur(8px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding: 16,
            animation:'bkDrop 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width:'100%', maxWidth: 520,
              maxHeight:'88vh',
              display:'flex', flexDirection:'column',
              animation:'panelRise 0.28s cubic-bezier(0.34,1.4,0.64,1)',
              fontFamily:'"Nunito",system-ui,sans-serif',
            }}
          >
            {/* ── Outer ornate frame ── */}
            <div style={{
              background:'linear-gradient(170deg, #1c3d0d 0%, #0e2207 50%, #0a1a05 100%)',
              border:'2px solid #4a7c2a',
              borderRadius: 24,
              boxShadow:[
                '0 0 0 1px rgba(74,222,128,0.08)',
                '0 0 0 4px rgba(20,40,10,0.9)',
                '0 0 0 5px rgba(74,124,42,0.3)',
                '0 40px 100px rgba(0,0,0,0.8)',
                'inset 0 1px 0 rgba(255,255,255,0.06)',
                'inset 0 0 60px rgba(0,0,0,0.3)',
              ].join(','),
              overflow:'hidden',
              display:'flex', flexDirection:'column',
              maxHeight:'88vh',
            }}>

              {/* ── Inner top accent line ── */}
              <div style={{
                height: 3,
                background:'linear-gradient(90deg, transparent, #4ade80, #fbbf24, #4ade80, transparent)',
                opacity: 0.6,
              }} />

              {/* ── Header ── */}
              <div style={{
                padding:'18px 22px 0',
                display:'flex', alignItems:'center', justifyContent:'space-between',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                  {/* Crest */}
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background:'linear-gradient(135deg,#b45309,#92400e)',
                    border:'2px solid #d97706',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize: 22,
                    boxShadow:'0 4px 16px rgba(180,83,9,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}>🏦</div>
                  <div>
                    <div style={{
                      fontSize: 9, letterSpacing: 3, textTransform:'uppercase',
                      color:'rgba(251,191,36,0.5)', fontWeight: 800, marginBottom: 1,
                    }}>Bankopoly</div>
                    <div style={{
                      fontFamily:'Georgia,serif', fontWeight: 900, fontSize: 20,
                      color:'#fbbf24', lineHeight:1,
                      textShadow:'0 2px 8px rgba(251,191,36,0.3)',
                    }}>Financial Report</div>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background:'rgba(0,0,0,0.4)',
                    border:'1.5px solid rgba(255,255,255,0.1)',
                    color:'rgba(255,255,255,0.5)', fontSize: 20,
                    cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    lineHeight: 1, transition:'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >×</button>
              </div>

              {/* ── Tab bar ── */}
              <div style={{ padding:'14px 22px 0', display:'flex', gap: 6 }}>
                {TABS.map(({ id, label, icon }) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      style={{
                        flex: 1, display:'flex', alignItems:'center', justifyContent:'center', gap: 6,
                        padding:'9px 8px',
                        background: active
                          ? 'linear-gradient(180deg, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.08) 100%)'
                          : 'rgba(0,0,0,0.25)',
                        border: `1.5px solid ${active ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        borderBottom: active ? '1.5px solid rgba(251,191,36,0.2)' : '1.5px solid rgba(255,255,255,0.05)',
                        borderRadius:'11px 11px 0 0',
                        cursor:'pointer',
                        color: active ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                        fontWeight: 900, fontSize: 13,
                        fontFamily:'"Nunito",system-ui,sans-serif',
                        transition:'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* ── Tab separator line ── */}
              <div style={{ height: 1, background:'rgba(255,255,255,0.05)', margin:'0 22px' }} />

              {/* ── Tab content ── */}
              <div style={{
                overflowY:'auto', padding:'18px 22px 22px',
                flex: 1,
                scrollbarWidth:'thin',
                scrollbarColor:'rgba(255,255,255,0.1) transparent',
              }}>
                {TAB_CONTENT[tab]()}
              </div>

              {/* ── Bottom accent line ── */}
              <div style={{
                height: 3,
                background:'linear-gradient(90deg, transparent, #4a7c2a, transparent)',
                opacity: 0.5,
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes bkDrop  { from{opacity:0} to{opacity:1} }
        @keyframes panelRise {
          from { opacity:0; transform:translateY(32px) scale(0.96) }
          to   { opacity:1; transform:none }
        }
        @keyframes tabFade {
          from { opacity:0; transform:translateY(8px) }
          to   { opacity:1; transform:none }
        }
        @keyframes deckSlide {
          from { opacity:0; transform:translateX(-12px) }
          to   { opacity:1; transform:none }
        }
      `}</style>
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptySlate({ icon, msg }: { icon: string; msg: string }) {
  return (
    <div style={{
      textAlign:'center', padding:'30px 20px',
      border:'1.5px dashed rgba(255,255,255,0.08)',
      borderRadius: 14, marginTop: 14,
    }}>
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontSize: 13, color:'rgba(255,255,255,0.3)', fontWeight: 700, lineHeight: 1.5 }}>{msg}</div>
    </div>
  );
}