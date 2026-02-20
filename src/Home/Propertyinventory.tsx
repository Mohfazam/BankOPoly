// ═══════════════════════════════════════════════════════════════════════════
// PropertyInventory.tsx
//
// USAGE — add two lines to GameHUD.tsx:
//
//   import PropertyInventory from './PropertyInventory';
//   ...
//   <PropertyInventory />   ← drop anywhere in the HUD JSX
//
// Nothing else needs to change. This component is fully self-contained.
// It reads `wealth` from the store itself and manages its own open/toast state.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../Store/useGameStore';

// ─── Property catalogue ───────────────────────────────────────────────────────
interface PropertyDef {
  id:          string;
  name:        string;
  emoji:       string;
  tagline:     string;       // shown inside the locked progress bar
  flavour:     string;       // italic quote shown when unlocked
  wealthReq:   number;
  accent:      string;       // border / badge colour
  glow:        string;       // box-shadow colour (with alpha)
  cardBg:      string;       // gradient for the emoji badge
}

const PROPERTIES: PropertyDef[] = [
  {
    id:        'home',
    name:      'Home',
    emoji:     '🏠',
    tagline:   'A cozy family home — your first step to building an empire.',
    flavour:   'Every great empire starts with a front door.',
    wealthReq: 5_000,
    accent:    '#f59e0b',
    glow:      'rgba(251,191,36,0.30)',
    cardBg:    'linear-gradient(135deg,#fef9c3,#fef08a)',
  },
  {
    id:        'school',
    name:      'School',
    emoji:     '🏫',
    tagline:   'Educate the community and boost your town\'s prosperity.',
    flavour:   'Knowledge compounds faster than interest.',
    wealthReq: 12_000,
    accent:    '#3b82f6',
    glow:      'rgba(59,130,246,0.28)',
    cardBg:    'linear-gradient(135deg,#dbeafe,#bfdbfe)',
  },
  {
    id:        'hospital',
    name:      'Hospital',
    emoji:     '🏥',
    tagline:   'A full-service hospital that keeps your citizens healthy.',
    flavour:   'A wealthy town is a healthy town.',
    wealthReq: 25_000,
    accent:    '#ef4444',
    glow:      'rgba(239,68,68,0.28)',
    cardBg:    'linear-gradient(135deg,#fee2e2,#fecaca)',
  },
];

// ─── localStorage helpers (persist "already toasted" set) ─────────────────────
const LS_KEY = 'bankopoly-inv-notified';

function getNotified(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function addNotified(id: string) {
  try {
    const s = getNotified();
    s.add(id);
    localStorage.setItem(LS_KEY, JSON.stringify([...s]));
  } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════
// UNLOCK TOAST — slides down from the top, auto-dismisses after ~3.5 s
// ═══════════════════════════════════════════════════════════════════════════
function UnlockToast({
  prop,
  onDone,
}: {
  prop:   PropertyDef;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Frame 1: mount invisible → frame 2: slide in
    const t1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    const t2 = setTimeout(() => setVisible(false), 3_000);
    const t3 = setTimeout(() => onDone(),          3_600);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <>
      {/* Dim backdrop */}
      <div style={{
        position:   'fixed', inset: 0, zIndex: 8998,
        background: 'rgba(0,0,0,0.38)',
        opacity:    visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      {/* Toast card */}
      <div style={{
        position:   'fixed',
        top:        visible ? 80 : -260,
        left:       '50%',
        transform:  'translateX(-50%)',
        zIndex:     8999,
        transition: 'top 0.55s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
        opacity:    visible ? 1 : 0,
        pointerEvents: 'none',
        minWidth:   300,
        textAlign:  'center',
      }}>
        <div style={{
          display:      'inline-block',
          background:   'linear-gradient(160deg,#1e3a5f 0%,#0f2040 100%)',
          border:       `3px solid ${prop.accent}`,
          borderRadius: 26,
          padding:      '26px 38px 22px',
          boxShadow:    `0 0 60px ${prop.glow}, 0 20px 60px rgba(0,0,0,0.65)`,
          fontFamily:   '"Nunito",system-ui,sans-serif',
          position:     'relative',
          overflow:     'hidden',
        }}>
          {/* Shimmer top bar */}
          <div style={{
            position:     'absolute', top: 0, left: 0, right: 0, height: 4,
            borderRadius: '26px 26px 0 0',
            background:   `linear-gradient(90deg,transparent,${prop.accent},transparent)`,
          }} />

          {/* Eyebrow */}
          <div style={{
            fontSize: 10, fontWeight: 900, color: prop.accent,
            letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10,
          }}>
            🔓 Property Unlocked
          </div>

          {/* Emoji */}
          <div style={{
            fontSize: 64, lineHeight: 1, marginBottom: 10,
            filter:    `drop-shadow(0 4px 18px ${prop.glow})`,
            animation: visible ? 'invEmojiPop 0.55s 0.2s cubic-bezier(0.34,1.56,0.64,1) both' : undefined,
          }}>
            {prop.emoji}
          </div>

          {/* Name */}
          <div style={{
            fontFamily:   'Georgia,serif', fontWeight: 900, fontSize: 26,
            color:        '#fef08a', letterSpacing: 1, marginBottom: 8,
            textShadow:   `0 2px 12px ${prop.glow}`,
          }}>
            {prop.name}
          </div>

          {/* Flavour */}
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.55)',
            fontWeight: 700, lineHeight: 1.6, fontStyle: 'italic',
          }}>
            "{prop.flavour}"
          </div>

          {/* Wealth badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            marginTop: 16, background: 'rgba(255,255,255,0.07)',
            borderRadius: 40, padding: '6px 18px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <span style={{ fontSize: 14 }}>💎</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: 'rgba(255,255,255,0.75)' }}>
              Unlocked at ₹{prop.wealthReq.toLocaleString()} wealth
            </span>
          </div>

          {/* Hint */}
          <div style={{
            marginTop: 10, fontSize: 10,
            color: 'rgba(255,255,255,0.3)', fontWeight: 700,
          }}>
            Open your Property Inventory to view it 🏗️
          </div>
        </div>
      </div>

      <style>{`
        @keyframes invEmojiPop {
          0%   { transform: scale(0.4) rotate(-12deg); opacity: 0 }
          60%  { transform: scale(1.22) rotate(6deg);  opacity: 1 }
          80%  { transform: scale(0.92) rotate(-3deg) }
          100% { transform: scale(1)   rotate(0deg) }
        }
      `}</style>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY PANEL — slides in from the right
// ═══════════════════════════════════════════════════════════════════════════
function InventoryPanel({ onClose }: { onClose: () => void }) {
  const wealth = useGameStore((s) => s.wealth);
  const unlocked = PROPERTIES.filter((p) => wealth >= p.wealthReq).length;

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position:       'fixed', inset: 0, zIndex: 900,
        background:     'rgba(8,14,28,0.70)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display:        'flex', alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingTop:     70, paddingRight: 16,
      }}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:        348,
          background:   'linear-gradient(170deg,#0f172a 0%,#1a2744 100%)',
          borderRadius: 24,
          border:       '2px solid rgba(251,191,36,0.22)',
          boxShadow:    '0 28px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(251,191,36,0.08)',
          overflow:     'hidden',
          fontFamily:   '"Nunito",system-ui,sans-serif',
          animation:    'invPanelIn 0.38s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background:   'linear-gradient(135deg,#162944 0%,#0f1f35 100%)',
          padding:      '18px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display:      'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13,
              background: 'linear-gradient(135deg,#fbbf24,#d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 4px 14px rgba(251,191,36,0.38)',
            }}>🏗️</div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: 16,
                color: '#fef08a', letterSpacing: 0.8,
              }}>
                Property Inventory
              </div>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.38)',
                fontWeight: 700, marginTop: 2,
              }}>
                {unlocked} / {PROPERTIES.length} unlocked
              </div>
            </div>
          </div>

          {/* Wealth pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(251,191,36,0.28)',
            borderRadius: 30, padding: '5px 12px',
          }}>
            <span style={{ fontSize: 13 }}>💎</span>
            <span style={{
              fontWeight: 900, fontSize: 13, color: '#fbbf24',
            }}>
              ₹{wealth.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Collection progress bar ── */}
        <div style={{
          padding: '12px 20px 8px',
          background: 'rgba(0,0,0,0.18)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: 1,
              color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            }}>
              Collection Progress
            </span>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#fbbf24' }}>
              {Math.round((unlocked / PROPERTIES.length) * 100)}%
            </span>
          </div>
          <div style={{
            height: 5, background: 'rgba(255,255,255,0.07)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${(unlocked / PROPERTIES.length) * 100}%`,
              background: 'linear-gradient(90deg,#fbbf24,#f59e0b)',
              transition: 'width 0.7s ease',
            }} />
          </div>
        </div>

        {/* ── Property cards ── */}
        <div style={{
          padding: '14px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: 10,
          maxHeight: 'calc(100vh - 230px)',
          overflowY: 'auto',
        }}>
          {PROPERTIES.map((prop, idx) => {
            const isUnlocked = wealth >= prop.wealthReq;
            const pct = isUnlocked
              ? 100
              : Math.min(99, Math.round((wealth / prop.wealthReq) * 100));

            return (
              <div
                key={prop.id}
                style={{
                  borderRadius: 18,
                  border:       isUnlocked
                    ? `2px solid ${prop.accent}`
                    : '2px solid rgba(255,255,255,0.07)',
                  background:   isUnlocked
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,255,255,0.016)',
                  overflow:     'hidden',
                  boxShadow:    isUnlocked ? `0 0 22px ${prop.glow}` : 'none',
                  animation:    `invCardIn 0.38s ${idx * 0.09 + 0.05}s both ease-out`,
                  transition:   'box-shadow 0.25s ease',
                }}
              >
                {/* Card body */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 13, padding: '13px 15px',
                }}>
                  {/* Emoji badge */}
                  <div style={{
                    width:          54, height: 54, borderRadius: 15, flexShrink: 0,
                    background:     isUnlocked ? prop.cardBg : 'rgba(255,255,255,0.04)',
                    border:         isUnlocked
                      ? `2px solid ${prop.accent}`
                      : '2px solid rgba(255,255,255,0.07)',
                    display:        'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize:       isUnlocked ? 28 : 22,
                    filter:         isUnlocked ? 'none' : 'grayscale(1) brightness(0.35)',
                    boxShadow:      isUnlocked ? `0 4px 16px ${prop.glow}` : 'none',
                    transition:     'all 0.3s ease',
                  }}>
                    {isUnlocked ? prop.emoji : '🔒'}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 7, marginBottom: 3, flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontWeight: 900, fontSize: 15,
                        color: isUnlocked ? '#f8fafc' : 'rgba(255,255,255,0.28)',
                      }}>
                        {prop.name}
                      </span>

                      {isUnlocked && (
                        <span style={{
                          fontSize: 9, fontWeight: 900, letterSpacing: 1,
                          color: prop.accent,
                          background: `${prop.accent}1a`,
                          border: `1px solid ${prop.accent}44`,
                          borderRadius: 20, padding: '2px 8px',
                          textTransform: 'uppercase',
                        }}>
                          ✓ Unlocked
                        </span>
                      )}

                      {!isUnlocked && (
                        <span style={{
                          fontSize: 9, fontWeight: 800,
                          color: 'rgba(255,255,255,0.25)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 20, padding: '2px 8px',
                        }}>
                          Locked
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontSize: 11, lineHeight: 1.45, fontWeight: 600,
                      color: isUnlocked
                        ? 'rgba(255,255,255,0.48)'
                        : 'rgba(255,255,255,0.2)',
                      marginBottom: isUnlocked ? 0 : 8,
                    }}>
                      {isUnlocked
                        ? prop.tagline
                        : `Requires ₹${prop.wealthReq.toLocaleString()} wealth`}
                    </div>

                    {/* Progress bar — locked only */}
                    {!isUnlocked && (
                      <>
                        <div style={{
                          height: 5, background: 'rgba(255,255,255,0.08)',
                          borderRadius: 3, overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', borderRadius: 3,
                            width: `${pct}%`,
                            background: `linear-gradient(90deg,${prop.accent}77,${prop.accent})`,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginTop: 5,
                        }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700,
                            color: 'rgba(255,255,255,0.22)',
                          }}>
                            ₹{wealth.toLocaleString()} / ₹{prop.wealthReq.toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 900, color: prop.accent,
                          }}>
                            {pct}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Flavour strip — unlocked only */}
                {isUnlocked && (
                  <div style={{
                    borderTop:  `1px solid ${prop.accent}22`,
                    padding:    '7px 15px',
                    background: `${prop.accent}0c`,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: prop.accent, fontStyle: 'italic',
                    }}>
                      "{prop.flavour}"
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding:   '11px 20px',
          textAlign: 'center',
          fontSize:  10, fontWeight: 700,
          color:     'rgba(255,255,255,0.2)',
        }}>
          Play the Board Game to earn wealth · Properties unlock automatically
        </div>
      </div>

      <style>{`
        @keyframes invPanelIn {
          0%   { transform: translateX(44px) scale(0.96); opacity: 0 }
          65%  { transform: translateX(-3px) scale(1.01); opacity: 1 }
          100% { transform: translateX(0)   scale(1);     opacity: 1 }
        }
        @keyframes invCardIn {
          0%   { transform: translateY(14px); opacity: 0 }
          100% { transform: translateY(0);    opacity: 1 }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// Drop <PropertyInventory /> anywhere in GameHUD — it renders:
//   • the trigger button (with unlocked-count badge)
//   • the slide-in inventory panel
//   • the unlock toast queue (one at a time)
// ═══════════════════════════════════════════════════════════════════════════
export default function PropertyInventory() {
  const wealth         = useGameStore((s) => s.wealth);
  const [open, setOpen]              = useState(false);
  const [toastQueue, setToastQueue]  = useState<PropertyDef[]>([]);
  const prevWealth                   = useRef<number | null>(null);

  const unlockedCount = PROPERTIES.filter((p) => wealth >= p.wealthReq).length;

  // Fire toast the moment wealth crosses a threshold (upward only)
  // Also fires on first mount for already-unlocked ones that haven't been toasted.
  useEffect(() => {
    const notified = getNotified();
    PROPERTIES.forEach((prop) => {
      if (wealth < prop.wealthReq) return;             // not yet unlocked
      if (notified.has(prop.id))   return;             // already toasted
      // New unlock — queue toast
      addNotified(prop.id);
      setToastQueue((q) => {
        if (q.find((p) => p.id === prop.id)) return q; // guard dup
        return [...q, prop];
      });
    });
    prevWealth.current = wealth;
  }, [wealth]);

  const dismissToast = useCallback(() => {
    setToastQueue((q) => q.slice(1));
  }, []);

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Property Inventory"
        style={{
          position:     'relative',
          display:      'flex', alignItems: 'center', gap: 7,
          background:   open
            ? 'linear-gradient(135deg,#fbbf24,#d97706)'
            : 'rgba(0,0,0,0.40)',
          border:       `2px solid ${open ? '#fbbf24' : 'rgba(251,191,36,0.50)'}`,
          borderRadius: 14, padding: '7px 14px',
          cursor:       'pointer',
          color:        open ? '#78350f' : '#fef08a',
          fontWeight:   900, fontSize: 13,
          fontFamily:   '"Nunito",system-ui,sans-serif',
          boxShadow:    open
            ? '0 4px 0 #d97706, 0 0 18px rgba(251,191,36,0.38)'
            : '0 2px 8px rgba(0,0,0,0.30)',
          transition:   'all 0.18s ease',
          whiteSpace:   'nowrap',
        }}
      >
        <span style={{ fontSize: 16 }}>🏗️</span>
        <span>Properties</span>

        {/* Unlocked-count badge */}
        <div style={{
          position:       'absolute', top: -8, right: -8,
          width: 20, height: 20, borderRadius: '50%',
          background:     'linear-gradient(135deg,#16a34a,#15803d)',
          border:         '2px solid #0f172a',
          display:        'flex', alignItems: 'center', justifyContent: 'center',
          fontSize:       10, fontWeight: 900, color: 'white',
          boxShadow:      '0 2px 6px rgba(0,0,0,0.45)',
          pointerEvents:  'none',
        }}>
          {unlockedCount}
        </div>
      </button>

      {/* ── Inventory panel ── */}
      {open && <InventoryPanel onClose={() => setOpen(false)} />}

      {/* ── Toast queue — one at a time ── */}
      {toastQueue.length > 0 && (
        <UnlockToast
          key={toastQueue[0].id}
          prop={toastQueue[0]}
          onDone={dismissToast}
        />
      )}
    </>
  );
}