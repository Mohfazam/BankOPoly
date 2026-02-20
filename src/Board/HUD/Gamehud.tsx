// GameHUD.tsx
// Frame 11 — shows "House Unlocked!" banner when player has wealth to spend.
// Frame 13 — live wealth + buildings-placed counter in the top bar.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../Store/useGameStore';

export default function GameHUD() {
  const navigate           = useNavigate();
  const wealth             = useGameStore(s => s.wealth);
  const unlockedBuildings  = useGameStore(s => s.unlockedBuildings);

  // Show the "reward arrived" banner only once per session when wealth > 0
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (wealth > 0 && !bannerDismissed) setShowBanner(true);
  }, [wealth, bannerDismissed]);

  const builtCount  = unlockedBuildings.length;
  const totalPlots  = 8;
  const progressPct = Math.round((builtCount / totalPlots) * 100);

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          TOP BAR — Frame 13: live wealth + progress
      ══════════════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px',
        background: 'linear-gradient(180deg,#2d5a1b 0%,#1e4012 100%)',
        borderBottom: '3px solid #a16207',
        boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
        fontFamily: '"Nunito",system-ui,sans-serif',
        flexWrap: 'wrap',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:8 }}>
          <div style={{
            width:34, height:34, borderRadius:9,
            background:'#fbbf24', border:'2px solid #d97706',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
          }}>🏦</div>
          <div style={{
            fontFamily:'Georgia,serif', fontWeight:900, fontSize:15,
            color:'#fbbf24', letterSpacing:2,
            textShadow:'0 1px 3px rgba(0,0,0,0.5)',
          }}>BANKOPOLY</div>
        </div>

        {/* Town label */}
        <div style={{ display:'flex', alignItems:'center', gap:6,
          background:'rgba(0,0,0,0.35)', border:'2px solid #fb923c',
          borderRadius:20, padding:'5px 14px' }}>
          <span style={{ fontSize:15 }}>🗺️</span>
          <span style={{ fontWeight:900, fontSize:14, color:'#fed7aa' }}>Town Map</span>
        </div>

        {/* Wealth pill — Frame 13 */}
        <div style={{ display:'flex', alignItems:'center', gap:6,
          background:'rgba(0,0,0,0.35)', border:'2px solid #c084fc',
          borderRadius:20, padding:'5px 14px' }}>
          <span style={{ fontSize:14 }}>💎</span>
          <span style={{ fontWeight:900, fontSize:14, color:'#e9d5ff' }}>₹{wealth.toLocaleString()}</span>
          <span style={{ fontSize:9, color:'#c084fc', fontWeight:800, textTransform:'uppercase', letterSpacing:1 }}>wealth</span>
        </div>

        {/* Buildings placed pill — Frame 13 */}
        <div style={{ display:'flex', alignItems:'center', gap:8,
          background:'rgba(0,0,0,0.35)', border:'2px solid #4ade80',
          borderRadius:20, padding:'5px 14px' }}>
          <span style={{ fontSize:14 }}>🏠</span>
          <span style={{ fontWeight:900, fontSize:14, color:'#86efac' }}>{builtCount}/{totalPlots}</span>
          {/* Progress bar */}
          <div style={{ width:50, height:7, background:'rgba(255,255,255,0.15)', borderRadius:4, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:4,
              width:`${progressPct}%`,
              background:'linear-gradient(90deg,#4ade80,#16a34a)',
              transition:'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Play button + test wealth button */}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {/* TEST BUTTON — remove before final demo */}
          <button
            onClick={() => useGameStore.getState().claimReward(2000, 0)}
            style={{
              display:'flex', alignItems:'center', gap:6,
              background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
              border:'2px solid #a78bfa', borderRadius:14, padding:'7px 16px',
              cursor:'pointer', color:'white', fontWeight:900, fontSize:13,
              boxShadow:'0 4px 0 #4c1d95',
              fontFamily:'"Nunito",system-ui,sans-serif',
            }}
          >💎 +₹2000 Test</button>
          <button
            onClick={() => navigate('/board')}
            style={{
              display:'flex', alignItems:'center', gap:6,
              background:'linear-gradient(135deg,#16a34a,#15803d)',
              border:'2px solid #4ade80', borderRadius:14, padding:'7px 16px',
              cursor:'pointer', color:'white', fontWeight:900, fontSize:13,
              boxShadow:'0 4px 0 #14532d',
              fontFamily:'"Nunito",system-ui,sans-serif',
            }}
          >🎲 Play Board Game</button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FRAME 11 — "House Unlocked!" inventory banner
          Appears when player returns from board game with wealth.
      ══════════════════════════════════════════════════════ */}
      {showBanner && (
        <div style={{
          position:'fixed', top:70, left:'50%', transform:'translateX(-50%)',
          zIndex:100,
          animation:'bannerDrop 0.45s cubic-bezier(0.34,1.56,0.64,1)',
          maxWidth:420, width:'calc(100% - 32px)',
          fontFamily:'"Nunito",system-ui,sans-serif',
        }}>
          <div style={{
            background:'linear-gradient(135deg,#fef9c3,#fef08a)',
            border:'4px solid #d97706',
            borderRadius:20,
            padding:'16px 20px',
            boxShadow:'0 12px 40px rgba(0,0,0,0.4), 0 0 0 6px rgba(251,191,36,0.2)',
            display:'flex', alignItems:'center', gap:14,
          }}>
            {/* Bouncing house icon */}
            <div style={{ fontSize:44, animation:'houseBounce 1.2s ease-in-out infinite', flexShrink:0 }}>🏠</div>

            <div style={{ flex:1 }}>
              <div style={{ fontWeight:900, fontSize:16, color:'#92400e', marginBottom:3 }}>
                House Card Unlocked!
              </div>
              <div style={{ fontSize:12, color:'#78350f', fontWeight:700, lineHeight:1.5 }}>
                You earned <strong>₹{wealth.toLocaleString()}</strong> wealth from the board game.
                Tap any empty plot on the map to place your house! 🏗️
              </div>
              {/* Wealth bar */}
              <div style={{ marginTop:8, height:7, background:'rgba(0,0,0,0.12)', borderRadius:4, overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:4,
                  width:'100%',
                  background:'linear-gradient(90deg,#fbbf24,#f59e0b)',
                  animation:'fillBar 1s ease-out 0.3s both',
                }} />
              </div>
            </div>

            {/* Dismiss X */}
            <button
              onClick={() => { setShowBanner(false); setBannerDismissed(true); }}
              style={{
                width:30, height:30, borderRadius:8,
                border:'2px solid #d97706', background:'rgba(255,255,255,0.6)',
                color:'#92400e', fontWeight:900, fontSize:14,
                cursor:'pointer', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
            >✕</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          BOTTOM HINT — updates once all plots are built
      ══════════════════════════════════════════════════════ */}
      <div style={{
        position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
        zIndex:50, fontFamily:'"Nunito",system-ui,sans-serif',
      }}>
        <div style={{
          background:'linear-gradient(135deg,#fef9c3,#fef08a)',
          border:'3px solid #d97706', borderRadius:28,
          padding:'12px 28px',
          boxShadow:'0 8px 28px rgba(0,0,0,0.35),0 0 0 4px rgba(251,191,36,0.2)',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <span style={{ fontSize:22 }}>
            {builtCount === totalPlots ? '🏆' : '🏦'}
          </span>
          <div>
            {builtCount === totalPlots ? (
              <>
                <div style={{ fontWeight:900, fontSize:14, color:'#92400e' }}>
                  Town Complete! 🎉 You built everything!
                </div>
                <div style={{ fontSize:12, color:'#a16207', fontWeight:700, marginTop:1 }}>
                  Your town is fully upgraded — amazing work!
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight:900, fontSize:14, color:'#92400e' }}>
                  {wealth > 0
                    ? 'Tap an empty plot to place a building!'
                    : 'Click the Bank to play Bankopoly · Hover plots to inspect'}
                </div>
                <div style={{ fontSize:12, color:'#a16207', fontWeight:700, marginTop:1 }}>
                  Drag to rotate · Scroll to zoom · {totalPlots - builtCount} plots left
                </div>
              </>
            )}
          </div>
          <span style={{ fontSize:22 }}>
            {builtCount === totalPlots ? '✨' : '🎲'}
          </span>
        </div>
      </div>

      {/* ── Global CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');

        @keyframes plotPop {
          0%   { transform:scale(0.8) translateY(6px); opacity:0  }
          65%  { transform:scale(1.07) translateY(-2px); opacity:1 }
          100% { transform:scale(1) translateY(0);    opacity:1  }
        }
        @keyframes bannerDrop {
          0%   { transform:translateX(-50%) translateY(-30px) scale(0.9); opacity:0 }
          65%  { transform:translateX(-50%) translateY(4px) scale(1.02);  opacity:1 }
          100% { transform:translateX(-50%) translateY(0) scale(1);       opacity:1 }
        }
        @keyframes houseBounce {
          0%,100% { transform:translateY(0) rotate(-4deg); }
          50%     { transform:translateY(-8px) rotate(4deg); }
        }
        @keyframes fillBar {
          from { width:0; }
          to   { width:100%; }
        }

        * { box-sizing: border-box; }
        body { margin: 0; overflow: hidden; }
      `}</style>
    </>
  );
}