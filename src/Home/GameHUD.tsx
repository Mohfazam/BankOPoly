import { useNavigate } from 'react-router-dom';
import PropertyInventory from './Propertyinventory';
import GameDashboard from './GameDashboard'; // ← NEW

export default function GameHUD() {
  const navigate = useNavigate();

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div style={{
        position   : 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display    : 'flex', alignItems: 'center', gap: 10,
        padding    : '10px 18px',
        background : 'linear-gradient(180deg,#2d5a1b 0%,#1e4012 100%)',
        borderBottom: '3px solid #a16207',
        boxShadow  : '0 3px 12px rgba(0,0,0,0.3)',
        fontFamily : '"Nunito",system-ui,sans-serif',
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

        {/* Status pills */}
        <div style={{ display:'flex', alignItems:'center', gap:6,
          background:'rgba(0,0,0,0.35)', border:'2px solid #fb923c',
          borderRadius:20, padding:'5px 14px' }}>
          <span style={{ fontSize:15 }}>🗺️</span>
          <span style={{ fontWeight:900, fontSize:14, color:'#fed7aa' }}>Town Map</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6,
          background:'rgba(0,0,0,0.35)', border:'2px solid #4ade80',
          borderRadius:20, padding:'5px 14px' }}>
          <span style={{ fontSize:15 }}>🏗️</span>
          <span style={{ fontWeight:900, fontSize:14, color:'#86efac' }}>8 Plots Available</span>
        </div>

        {/* Property Inventory button */}
        <PropertyInventory />

        {/* ── NEW: Financial Dashboard button ── */}
        <GameDashboard />

        {/* CTA button */}
        <div style={{ marginLeft:'auto' }}>
          <button
            onClick={() => navigate('/board')}
            style={{
              display    : 'flex', alignItems:'center', gap:6,
              background : 'linear-gradient(135deg,#16a34a,#15803d)',
              border     : '2px solid #4ade80',
              borderRadius: 14, padding: '7px 16px',
              cursor     : 'pointer', color:'white',
              fontWeight : 900, fontSize:13,
              boxShadow  : '0 4px 0 #14532d',
              fontFamily : '"Nunito",system-ui,sans-serif',
            }}
          >🎲 Play Board Game</button>
        </div>
      </div>

      {/* ── Bottom hint ─────────────────────────────────────── */}
      <div style={{
        position  : 'fixed', bottom: 24,
        left: '50%', transform: 'translateX(-50%)',
        zIndex    : 50,
        fontFamily: '"Nunito",system-ui,sans-serif',
      }}>
        <div style={{
          background : 'linear-gradient(135deg,#fef9c3,#fef08a)',
          border     : '3px solid #d97706',
          borderRadius: 28,
          padding    : '12px 28px',
          boxShadow  : '0 8px 28px rgba(0,0,0,0.35),0 0 0 4px rgba(251,191,36,0.2)',
          display    : 'flex', alignItems:'center', gap:12,
        }}>
          <span style={{ fontSize:22 }}>🏦</span>
          <div>
            <div style={{ fontWeight:900, fontSize:14, color:'#92400e' }}>
              Click the Bank to start playing · Hover plots to inspect
            </div>
            <div style={{ fontSize:12, color:'#a16207', fontWeight:700, marginTop:1 }}>
              Drag to rotate · Scroll to zoom
            </div>
          </div>
          <span style={{ fontSize:22 }}>🎲</span>
        </div>
      </div>

      {/* ── Global CSS ──────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes plotPop {
          0%   { transform:scale(0.8) translateY(6px); opacity:0  }
          65%  { transform:scale(1.07) translateY(-2px); opacity:1 }
          100% { transform:scale(1) translateY(0);    opacity:1  }
        }
        * { box-sizing: border-box; }
        body { margin: 0; overflow: hidden; }
      `}</style>
    </>
  );
}