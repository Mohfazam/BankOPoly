'use client';

import React, { useState } from 'react';
import { Town3D } from './Town3D';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
type TileType = 'start'|'save'|'interest'|'scam'|'budget'|'property'|'loan'|'normal';
interface Tile { id:number; type:TileType; label:string; icon:string; price:number; rent:number; }

const TILES: Tile[] = [
  {id:0,  type:'start',    label:'GO',       icon:'🏁', price:0,   rent:0 },
  {id:1,  type:'save',     label:'SAVE',     icon:'🏦', price:0,   rent:0 },
  {id:2,  type:'interest', label:'EARN',     icon:'💰', price:0,   rent:0 },
  {id:3,  type:'property', label:'PARK ST',  icon:'🏠', price:100, rent:25},
  {id:4,  type:'scam',     label:'SCAM',     icon:'⚠️', price:0,   rent:0 },
  {id:5,  type:'budget',   label:'BUDGET',   icon:'📚', price:0,   rent:0 },
  {id:6,  type:'loan',     label:'LOAN',     icon:'📋', price:0,   rent:0 },
  {id:7,  type:'property', label:'HILL RD',  icon:'🏠', price:120, rent:30},
  {id:8,  type:'interest', label:'EARN',     icon:'💰', price:0,   rent:0 },
  {id:9,  type:'normal',   label:'FREE',     icon:'⭐', price:0,   rent:0 },
  {id:10, type:'budget',   label:'BUDGET',   icon:'📚', price:0,   rent:0 },
  {id:11, type:'save',     label:'SAVE',     icon:'🏦', price:0,   rent:0 },
  {id:12, type:'loan',     label:'LOAN',     icon:'📋', price:0,   rent:0 },
  {id:13, type:'scam',     label:'SCAM',     icon:'⚠️', price:0,   rent:0 },
  {id:14, type:'property', label:'MG ROAD',  icon:'🏠', price:150, rent:40},
  {id:15, type:'interest', label:'EARN',     icon:'💰', price:0,   rent:0 },
  {id:16, type:'budget',   label:'BUDGET',   icon:'📚', price:0,   rent:0 },
  {id:17, type:'normal',   label:'FREE',     icon:'⭐', price:0,   rent:0 },
  {id:18, type:'save',     label:'SAVE',     icon:'🏦', price:0,   rent:0 },
  {id:19, type:'property', label:'MALL AVE', icon:'🏠', price:180, rent:50},
];

const GO_SALARY   = 200;
const LOAN_AMOUNT = 100;
const LOAN_REPAY  = 120;

const TOP   = [0,1,2,3,4];
const RIGHT = [5,6,7,8,9];
const BOT   = [14,13,12,11,10];
const LEFT  = [19,18,17,16,15];

const ACCENT: Record<TileType,string> = {
  start:'#16a34a', save:'#2563eb', interest:'#0d9488',
  scam:'#dc2626',  budget:'#7c3aed', property:'#ea580c',
  loan:'#db2777',  normal:'#64748b',
};
const FILL: Record<TileType,string> = {
  start:'#dcfce7', save:'#dbeafe', interest:'#ccfbf1',
  scam:'#fee2e2',  budget:'#ede9fe', property:'#ffedd5',
  loan:'#fce7f3',  normal:'#f8fafc',
};
const DARK: Record<TileType,string> = {
  start:'#15803d', property:'#b91c1c', loan:'#6b21a8', interest:'#1e40af',
  save:'#1d4ed8',  normal:'#374151',   budget:'#6b21a8', scam:'#991b1b',
};

// ═══════════════════════════════════════════════════════════════════════════
// CSS DICE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const F=false, T=true;
const FACES: Record<number, boolean[]> = {
  1: [F,F,F, F,T,F, F,F,F],
  2: [F,F,T, F,F,F, T,F,F],
  3: [F,F,T, F,T,F, T,F,F],
  4: [T,F,T, F,F,F, T,F,T],
  5: [T,F,T, F,T,F, T,F,T],
  6: [T,F,T, T,F,T, T,F,T],
};

function Dice({ value, rolling }: { value:number; rolling:boolean }) {
  const dots = FACES[value] ?? FACES[1];
  return (
    <div style={{
      width: 80, height: 80,
      borderRadius: 16,
      background: 'white',
      boxShadow: rolling
        ? '0 0 0 3px #fbbf24, 0 0 28px rgba(251,191,36,0.8), 0 6px 20px rgba(0,0,0,0.4)'
        : '0 6px 0 rgba(0,0,0,0.3), 0 10px 28px rgba(0,0,0,0.45)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      padding: 12,
      gap: 3,
      animation: rolling ? 'diceRoll 0.12s linear infinite' : 'diceLand 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      transition: 'box-shadow 0.25s ease',
      userSelect: 'none',
    }}>
      {dots.map((on, i) => (
        <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
          {on && (
            <div style={{
              width: 12, height: 12,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #374151, #0f172a)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.4)',
            }}/>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOARD TILE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
function BTile({ tile, active, owned, side }: {
  tile:Tile; active:boolean; owned:boolean; side:'top'|'bottom'|'left'|'right';
}) {
  const isH  = side === 'top' || side === 'bottom';
  const dark = (owned && tile.type === 'property') ? '#92400e' : DARK[tile.type];
  const bg   = (owned && tile.type === 'property') ? '#fef3c7' : FILL[tile.type];

  const stripPos: React.CSSProperties =
    side === 'top'    ? {top:0, left:0, right:0, height:6}  :
    side === 'bottom' ? {bottom:0, left:0, right:0, height:6} :
    side === 'left'   ? {left:0, top:0, bottom:0, width:6}  :
                        {right:0, top:0, bottom:0, width:6};

  const contentPad =
    side === 'top'    ? '9px 2px 3px' :
    side === 'bottom' ? '3px 2px 9px' :
    side === 'left'   ? '3px 3px 3px 9px' :
                        '3px 9px 3px 3px';

  return (
    <div style={{
      width:'100%', height:'100%',
      background: bg,
      border: `2px solid ${dark}`,
      borderRadius: 6,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      boxShadow: owned && tile.type === 'property'
        ? '0 0 0 1px rgba(217,119,6,0.3) inset'
        : undefined,
    }}>
      {/* Color strip */}
      <div style={{position:'absolute', background: dark, ...stripPos}}/>

      {/* Gold shimmer on owned properties */}
      {owned && tile.type === 'property' && (
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, transparent 55%)',
        }}/>
      )}

      {/* Content */}
      <div style={{
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        gap: 1,
        padding: contentPad,
        width:'100%', height:'100%',
        boxSizing:'border-box',
        writingMode: isH ? 'horizontal-tb' : 'vertical-lr',
        transform: side === 'left' ? 'scaleX(-1)' : 'none',
      }}>
        <span style={{
          fontSize: isH ? 28 : 24,
          lineHeight: 1,
          filter: active
            ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'
            : 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
        }}>{tile.icon}</span>
        <span style={{
          fontSize: isH ? 8 : 7,
          fontWeight: 800,
          color: dark,
          letterSpacing: '0.2px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.1,
          textTransform: 'uppercase',
        }}>{tile.label}</span>
        {owned && tile.type === 'property' && (
          <span style={{fontSize:5, fontWeight:800, color:'#b45309', lineHeight:1}}>★ MINE</span>
        )}
      </div>

      {/* Player location pin */}
      {active && (
        <div style={{
          position:'absolute', inset:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:20, pointerEvents:'none',
          background:'rgba(255,255,210,0.88)',
          backdropFilter:'blur(3px)',
          borderRadius: 5,
        }}>
          <div style={{
            animation:'pinPulse 1.4s ease-in-out infinite',
            filter:'drop-shadow(0 3px 8px rgba(220,38,38,0.5))',
            display:'flex', flexDirection:'column', alignItems:'center', gap:1,
          }}>
            <svg width="30" height="38" viewBox="0 0 22 30" fill="none">
              <ellipse cx="11" cy="28" rx="7" ry="2.5" fill="rgba(0,0,0,0.2)"/>
              <path d="M11 1C6.5 1 3 4.8 3 9.5C3 15.5 8 21 11 24.5C14 21 19 15.5 19 9.5C19 4.8 15.5 1 11 1Z" fill="#ef4444"/>
              <path d="M11 1C6.5 1 3 4.8 3 9.5C3 15.5 8 21 11 24.5C14 21 19 15.5 19 9.5C19 4.8 15.5 1 11 1Z" fill="url(#pG)"/>
              <defs><linearGradient id="pG" x1="6" y1="2" x2="15" y2="12"><stop offset="0%" stopColor="rgba(255,255,255,0.3)"/><stop offset="100%" stopColor="transparent"/></linearGradient></defs>
              <circle cx="11" cy="9.5" r="4" fill="white" opacity="0.95"/>
              <circle cx="11" cy="9.5" r="2.2" fill="#ef4444"/>
            </svg>
            <span style={{fontSize:6, fontWeight:900, color:'#dc2626', letterSpacing:'0.3px'}}>YOU</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CORNER TILE
// ═══════════════════════════════════════════════════════════════════════════
function Corner({ icon, top, bot, bg, border }: {
  icon:string; top:string; bot?:string; bg:string; border:string;
}) {
  return (
    <div style={{
      width:'100%', height:'100%', background:bg,
      border:`2px solid ${border}`, borderRadius:6,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:3, boxSizing:'border-box',
    }}>
      <span style={{fontSize:20}}>{icon}</span>
      <span style={{fontSize:7, fontWeight:900, color:border, textAlign:'center', fontFamily:'system-ui,sans-serif', lineHeight:1.3, textTransform:'uppercase'}}>{top}</span>
      {bot && <span style={{fontSize:9, fontWeight:900, color:border, fontFamily:'Georgia,serif'}}>{bot}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL (TILE INTERACTION)
// ═══════════════════════════════════════════════════════════════════════════
const P: React.CSSProperties = {
  color:'#4b5563', fontSize:14, lineHeight:1.65, textAlign:'center',
  margin:'0 0 14px', fontFamily:'system-ui, sans-serif',
};

interface ModalProps {
  tile:Tile; coins:number; savings:number;
  loanActive:boolean; loanRemaining:number; ownedTiles:number[];
  lapBonus:number|null; rentEarned:number|null;
  setCoins:(n:number)=>void; setSavings:(n:number)=>void;
  setLoanActive:(b:boolean)=>void; setLoanRemaining:(n:number)=>void;
  setOwnedTiles:(ids:number[])=>void; onClose:()=>void;
}

function Modal({
  tile, coins, savings, loanActive, loanRemaining, ownedTiles,
  lapBonus, rentEarned,
  setCoins, setSavings, setLoanActive, setLoanRemaining, setOwnedTiles, onClose,
}: ModalProps) {
  const ac      = ACCENT[tile.type];
  const bg      = FILL[tile.type];
  const isOwned = ownedTiles.includes(tile.id);

  const Btn = ({ onClick, disabled, color, children }: any) => (
    <button onClick={onClick} disabled={disabled} style={{
      flex:1, padding:'14px 10px', borderRadius:14, border:'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#e5e7eb' : color,
      color: disabled ? '#9ca3af' : 'white',
      fontWeight:800, fontSize:14, lineHeight:1.3,
      boxShadow: disabled ? 'none' : `0 4px 0 rgba(0,0,0,0.2)`,
      fontFamily:'system-ui, sans-serif',
      transition:'all 0.12s ease',
    }}>{children}</button>
  );

  const Info = ({ l, v, c }: {l:string; v:string; c?:string}) => (
    <div style={{display:'flex', justifyContent:'space-between', fontSize:14, padding:'5px 0', borderBottom:'1px solid rgba(0,0,0,0.05)'}}>
      <span style={{color:'#6b7280'}}>{l}</span>
      <strong style={{color: c||'#111'}}>{v}</strong>
    </div>
  );

  const Box = ({ children }: any) => (
    <div style={{background:bg, border:`1px solid ${ac}22`, borderRadius:12, padding:'12px 14px', marginBottom:14}}>
      {children}
    </div>
  );

  const Banner = ({ emoji, text, sub, color }: {emoji:string; text:string; sub?:string; color:string}) => (
    <div style={{
      background:`${color}14`, border:`1.5px solid ${color}3a`,
      borderRadius:12, padding:'11px 14px', marginBottom:14,
      display:'flex', alignItems:'center', gap:12,
    }}>
      <span style={{fontSize:24, flexShrink:0}}>{emoji}</span>
      <div>
        <div style={{fontWeight:800, fontSize:15, color}}>{text}</div>
        {sub && <div style={{fontSize:11, color:'#6b7280', marginTop:2}}>{sub}</div>}
      </div>
    </div>
  );

  const body = () => {
    switch (tile.type) {
      case 'start':
        return (<>
          {lapBonus !== null && (
            <Banner emoji="🎉" text={`+₹${lapBonus} salary collected!`} sub="You completed a lap — payday!" color="#16a34a"/>
          )}
          <p style={P}>Every time you pass or land on GO you collect your ₹{GO_SALARY} salary. Keep lapping to build wealth!</p>
          <Box><div style={{textAlign:'center', fontSize:22, fontWeight:900, color:ac}}>₹{GO_SALARY} salary per lap 🏁</div></Box>
          <Btn onClick={onClose} color={ac}>Collect &amp; Roll →</Btn>
        </>);

      case 'save':
        return (<>
          <p style={P}>Deposit ₹50 into savings. It stays safe and earns you 10% interest each time you land on EARN tiles!</p>
          <Box>
            <Info l="Wallet" v={`₹${coins}`}/>
            <Info l="Savings" v={`₹${savings}`}/>
            {coins >= 50 && <Info l="After deposit" v={`₹${coins-50} wallet · ₹${savings+50} saved`} c="#2563eb"/>}
          </Box>
          <Btn onClick={()=>{if(coins>=50){setCoins(coins-50); setSavings(savings+50);} onClose();}} disabled={coins<50} color={ac}>
            {coins>=50 ? 'Deposit ₹50 🏦' : 'Not Enough Coins ✗'}
          </Btn>
        </>);

      case 'interest': {
        const b = Math.floor(savings * 0.1);
        return (<>
          <p style={P}>Your savings earned <strong>10% interest</strong> — money growing while you do nothing. That's the power of saving!</p>
          <Box>
            <div style={{textAlign:'center', padding:'6px 0'}}>
              <div style={{fontSize:36, fontWeight:900, color: b>0 ? ac : '#9ca3af'}}>+₹{b}</div>
              <div style={{fontSize:12, color:'#6b7280', marginTop:3}}>10% of ₹{savings} in savings</div>
            </div>
          </Box>
          {b === 0 && <p style={{...P, color:'#dc2626', fontSize:12, margin:'0 0 10px'}}>⚠️ Save some coins first on a SAVE tile to earn interest!</p>}
          <Btn onClick={()=>{if(b>0) setSavings(savings+b); onClose();}} color={ac} disabled={b===0}>
            {b > 0 ? 'Collect Interest 💰' : 'Nothing yet — save first'}
          </Btn>
        </>);
      }

      case 'scam':
        return (<>
          <p style={P}>A stranger called asking for your bank OTP and account number. What do you do?</p>
          <Box>
            <div style={{fontSize:13, color:'#6b7280', lineHeight:1.9}}>
              ⚠️ <strong>Share OTP</strong> → Scammer drains ₹100<br/>
              ✅ <strong>Ignore &amp; report</strong> → ₹50 reward from bank
            </div>
          </Box>
          <div style={{display:'flex', gap:10}}>
            <Btn onClick={()=>{setCoins(Math.max(0, coins-100)); onClose();}} color="#dc2626">
              Share OTP<br/><span style={{fontSize:11,fontWeight:500}}>-₹100 😱</span>
            </Btn>
            <Btn onClick={()=>{setCoins(coins+50); onClose();}} color="#16a34a">
              Ignore &amp; Report<br/><span style={{fontSize:11,fontWeight:500}}>+₹50 ✅</span>
            </Btn>
          </div>
        </>);

      case 'budget':
        return (<>
          <p style={P}>Smart budgeting — choose between a <strong>Want</strong> and a <strong>Need</strong>!</p>
          <Box><Info l="Your wallet" v={`₹${coins}`}/></Box>
          <div style={{display:'flex', gap:10}}>
            <Btn onClick={()=>{if(coins>=100) setCoins(coins-100); onClose();}} disabled={coins<100} color="#ea580c">
              🚲 Buy Toy<br/><span style={{fontSize:11,fontWeight:500}}>-₹100 (Want)</span>
            </Btn>
            <Btn onClick={()=>{setSavings(savings+50); onClose();}} color="#7c3aed">
              📚 School Fund<br/><span style={{fontSize:11,fontWeight:500}}>+₹50 Saved ✅</span>
            </Btn>
          </div>
        </>);

      case 'property':
        if (isOwned) return (<>
          <Banner emoji="🏠" text="You own this property!" sub={`Earns ₹${tile.rent} rent each re-visit`} color="#ea580c"/>
          {rentEarned !== null && rentEarned > 0 && (
            <Banner emoji="💰" text={`Collected ₹${rentEarned} rent!`} sub="Your property is paying off" color="#16a34a"/>
          )}
          <Box>
            <Info l="Property" v={tile.label}/>
            <Info l="Paid" v={`₹${tile.price}`}/>
            <Info l="Rent per visit" v={`₹${tile.rent}`} c="#16a34a"/>
          </Box>
          <Btn onClick={onClose} color={ac}>My property! 🏠</Btn>
        </>);
        return (<>
          <p style={P}>Buy <strong>{tile.label}</strong> to earn ₹{tile.rent} rent every future visit — own property, build wealth!</p>
          <Box>
            <Info l="Price" v={`₹${tile.price}`}/>
            <Info l="Rent per visit" v={`₹${tile.rent}`} c="#16a34a"/>
            <Info l="Your wallet" v={`₹${coins}`}/>
            {loanActive && <div style={{fontSize:11, color:'#dc2626', marginTop:7, fontWeight:600}}>⚠️ Active loan: ₹{loanRemaining} still owed</div>}
          </Box>
          <div style={{display:'flex', gap:10}}>
            <Btn onClick={()=>{
              if(coins >= tile.price){setCoins(coins-tile.price); setOwnedTiles([...ownedTiles, tile.id]);}
              onClose();
            }} disabled={coins < tile.price} color="#ea580c">
              🏠 Buy Now<br/><span style={{fontSize:11,fontWeight:500}}>-₹{tile.price}</span>
            </Btn>
            <Btn onClick={()=>{
              if(!loanActive){setCoins(coins+LOAN_AMOUNT); setLoanActive(true); setLoanRemaining(LOAN_REPAY);}
              onClose();
            }} disabled={loanActive} color="#db2777">
              🏦 Take Loan<br/><span style={{fontSize:11,fontWeight:500}}>+₹{LOAN_AMOUNT}, repay ₹{LOAN_REPAY}</span>
            </Btn>
          </div>
          <button onClick={onClose} style={{width:'100%',marginTop:8,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',background:'#f3f4f6',color:'#9ca3af',fontWeight:700,fontSize:13}}>
            Skip — don't buy
          </button>
        </>);

      case 'loan':
        return (<>
          <p style={P}>Take ₹{LOAN_AMOUNT} now, but you'll repay ₹{LOAN_REPAY} on your next lap. Loans always cost more than you borrow!</p>
          <Box>
            <Info l="You receive now" v={`+₹${LOAN_AMOUNT}`} c="#2563eb"/>
            <Info l="You repay next lap" v={`₹${LOAN_REPAY}`} c="#dc2626"/>
            <Info l="Interest cost" v={`₹${LOAN_REPAY - LOAN_AMOUNT}`} c="#dc2626"/>
            {loanActive && <div style={{marginTop:7, fontSize:12, color:'#dc2626', fontWeight:700}}>⚠️ Already have loan: ₹{loanRemaining} remaining</div>}
          </Box>
          <Btn onClick={()=>{
            if(!loanActive){setCoins(coins+LOAN_AMOUNT); setLoanActive(true); setLoanRemaining(LOAN_REPAY);}
            onClose();
          }} disabled={loanActive} color={ac}>
            {loanActive ? 'Loan Already Active 🚫' : 'Take Loan 💳'}
          </Btn>
        </>);

      default:
        return (<>
          <p style={P}>Free space — relax! No costs, no penalties. Take a breath and keep rolling!</p>
          <Box><div style={{textAlign:'center', fontSize:44, padding:'6px 0'}}>🌟</div></Box>
          <Btn onClick={onClose} color={ac}>Keep Going →</Btn>
        </>);
    }
  };

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(12px)',display:'flex',alignItems:'flex-end',justifyContent:'center',animation:'fi 0.2s ease'}}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{width:'100%',maxWidth:460,background:'white',borderRadius:'28px 28px 0 0',padding:'0 22px 36px',animation:'su 0.35s cubic-bezier(0.34,1.56,0.64,1)',maxHeight:'85vh',overflowY:'auto'}}
      >
        <div style={{width:44,height:4,background:'#e5e7eb',borderRadius:2,margin:'12px auto 20px'}}/>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
          <div style={{width:54,height:54,borderRadius:18,background:ac,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,boxShadow:`0 6px 20px ${ac}55`,flexShrink:0}}>
            {tile.icon}
          </div>
          <div>
            <div style={{fontWeight:900,fontSize:22,color:'#111',fontFamily:'Georgia,serif'}}>{tile.label}</div>
            <div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>
              Tile #{tile.id+1} · Bankopoly{tile.type==='property'&&isOwned?' · ★ Owned':''}
            </div>
          </div>
        </div>
        {body()}
        <button onClick={onClose} style={{width:'100%',marginTop:12,padding:14,borderRadius:14,border:'none',cursor:'pointer',background:'#f3f4f6',color:'#9ca3af',fontWeight:700,fontSize:13,letterSpacing:'0.3px'}}>
          Continue
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════════════════════
export default function BoardGame() {
  const [coins, setCoins]                = useState(300);
  const [savings, setSavings]            = useState(0);
  const [loanActive, setLoanActive]      = useState(false);
  const [loanRemaining, setLoanRemaining]= useState(0);
  const [ownedTiles, setOwnedTiles]      = useState<number[]>([]);
  const [pos, setPos]                    = useState(0);
  const [diceVal, setDiceVal]            = useState(1);
  const [rolling, setRolling]            = useState(false);
  const [modal, setModal]                = useState<Tile|null>(null);
  const [lapBonus, setLapBonus]          = useState<number|null>(null);
  const [rentEarned, setRentEarned]      = useState<number|null>(null);
  const [laps, setLaps]                  = useState(0);
  const [rollSeed, setRollSeed]          = useState(0);

  const roll = () => {
    if (rolling || modal) return;
    setRolling(true);
    setLapBonus(null);
    setRentEarned(null);

    setTimeout(() => {
      const r    = Math.floor(Math.random() * 6) + 1;
      const next = (pos + r) % 20;
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
    }, 600);
  };

  const CORN = 80;
  const CELL = 70;
  const N    = 5;
  const BS   = CORN * 2 + CELL * N;

  const propCount = ownedTiles.length;
  const propValue = ownedTiles.reduce((s, id) => s + TILES[id].price, 0);
  const netWorth  = coins + savings + propValue - loanRemaining;

  return (
    <div style={{
      width:'100vw', height:'100vh', overflow:'hidden',
      display:'flex', flexDirection:'column',
      background:'#0a1410', fontFamily:'system-ui, sans-serif',
      position:'relative',
    }}>
      <Town3D />

      {/* HUD */}
      <div style={{
        flexShrink:0, position:'relative', zIndex:10,
        display:'flex', alignItems:'center', flexWrap:'wrap',
        padding:'7px 16px', gap:7,
        background:'rgba(0,0,0,0.6)', backdropFilter:'blur(14px)',
        borderBottom:'1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          width:36, height:36, borderRadius:'50%', flexShrink:0,
          background:'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          border:'2px solid rgba(255,255,255,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:17, boxShadow:'0 2px 10px rgba(59,130,246,0.4)',
        }}>🐠</div>

        {[
          {icon:'💵', val:`₹${coins.toLocaleString()}`,       bg:'rgba(251,191,36,0.12)',  bd:'rgba(251,191,36,0.25)',  c:'#fde68a' },
          {icon:'🏦', val:`₹${savings.toLocaleString()}`,     bg:'rgba(52,211,153,0.12)',  bd:'rgba(52,211,153,0.25)',  c:'#6ee7b7' },
          {icon:'🏠', val:`${propCount} prop${propCount!==1?'s':''}`, bg:'rgba(251,146,60,0.12)',  bd:'rgba(251,146,60,0.25)',  c:'#fdba74' },
          {icon:'📊', val:`NW ₹${netWorth.toLocaleString()}`, bg:'rgba(167,139,250,0.12)', bd:'rgba(167,139,250,0.25)', c:'#c4b5fd' },
        ].map(s => (
          <div key={s.icon} style={{
            display:'flex', alignItems:'center', gap:5,
            background:s.bg, border:`1px solid ${s.bd}`,
            borderRadius:28, padding:'4px 11px',
          }}>
            <span style={{fontSize:12}}>{s.icon}</span>
            <span style={{fontWeight:800, fontSize:12, color:s.c}}>{s.val}</span>
          </div>
        ))}

        <div style={{marginLeft:'auto', display:'flex', gap:7, alignItems:'center'}}>
          {loanActive && (
            <div style={{
              background:'rgba(220,38,38,0.18)', border:'1px solid rgba(220,38,38,0.3)',
              borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#fca5a5',
            }}>⚠️ Loan ₹{loanRemaining}</div>
          )}
          <div style={{
            background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)',
          }}>Round {laps+1} · Tile {pos+1}/20</div>
        </div>
      </div>

      {/* MAIN — FIX: proper flex layout, board on left, panel on right */}
      <div style={{
        flex:1, display:'flex', alignItems:'center',
        justifyContent:'space-between',
        padding:'0 40px', overflow:'hidden',
        position:'relative', zIndex:1,
      }}>

        {/* BOARD (LEFT) */}
        <div style={{
          perspective:1100, perspectiveOrigin:'50% 38%',
          flexShrink:0,
        }}>
          <div style={{
            width:BS, height:BS,
            transform:'rotateX(46deg) rotateZ(-38deg)',
            transformStyle:'preserve-3d',
            transformOrigin:'center center',
            filter:'drop-shadow(0 26px 40px rgba(0,0,0,0.85)) drop-shadow(0 8px 14px rgba(0,0,0,0.5))',
            animation:'boardFloat 7s ease-in-out infinite',
          }}>
            <div style={{
              position:'relative', width:BS, height:BS,
              background:'#f5ede0',
              borderRadius:14,
              outline:'5px solid #7c5c32',
              boxShadow:'0 0 0 11px #a87843, 0 0 0 16px #1a1a0e, 0 0 0 18px rgba(255,255,255,0.04), 0 28px 70px rgba(0,0,0,0.9)',
            }}>

              {/* BOARD CENTER */}
              <div style={{
                position:'absolute', top:CORN, left:CORN,
                width:BS-CORN*2, height:BS-CORN*2,
                background:'radial-gradient(ellipse at 38% 32%, #27ae60 0%, #1e8449 45%, #145a32 100%)',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:10, overflow:'hidden',
                boxShadow:'inset 0 0 40px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  position:'absolute', inset:10,
                  border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:6, pointerEvents:'none',
                }}/>
                {['TL','TR','BL','BR'].map(c => (
                  <div key={c} style={{
                    position:'absolute',
                    ...(c==='TL'?{top:14,left:14}:c==='TR'?{top:14,right:14}:c==='BL'?{bottom:14,left:14}:{bottom:14,right:14}),
                    width:10, height:10,
                    borderTop:    c.startsWith('T')?'2px solid rgba(255,255,255,0.18)':'none',
                    borderBottom: c.startsWith('B')?'2px solid rgba(255,255,255,0.18)':'none',
                    borderLeft:   c.endsWith('L')?'2px solid rgba(255,255,255,0.18)':'none',
                    borderRight:  c.endsWith('R')?'2px solid rgba(255,255,255,0.18)':'none',
                    pointerEvents:'none',
                  }}/>
                ))}

                <div style={{
                  fontFamily:'Georgia, serif', fontWeight:900, fontSize:13,
                  color:'rgba(255,255,255,0.95)',
                  textShadow:'0 2px 12px rgba(0,0,0,0.7), 0 0 24px rgba(255,255,255,0.1)',
                  letterSpacing:3.5, textAlign:'center', lineHeight:1.35,
                  background:'rgba(0,0,0,0.25)',
                  padding:'5px 14px', borderRadius:8,
                  border:'1px solid rgba(255,255,255,0.12)',
                }}>🏦<br/>BANKOPOLY</div>

                <div
                  onClick={rolling || !!modal ? undefined : roll}
                  style={{
                    cursor: rolling || !!modal ? 'default' : 'pointer',
                    filter: rolling
                      ? 'drop-shadow(0 0 20px rgba(251,191,36,0.9))'
                      : 'drop-shadow(0 5px 14px rgba(0,0,0,0.55))',
                    transition:'filter 0.3s',
                  }}
                  title={rolling ? 'Rolling…' : 'Click to roll'}
                >
                  <Dice key={`d${rollSeed}`} value={diceVal} rolling={rolling}/>
                </div>

                <div style={{
                  fontSize:9, fontWeight:700, letterSpacing:'0.5px',
                  color:'rgba(255,255,255,0.75)',
                  textShadow:'0 1px 4px rgba(0,0,0,0.5)',
                  textTransform:'uppercase',
                }}>
                  {rolling ? '🎲 Rolling…' : `Rolled ${diceVal} — tap to roll`}
                </div>

                {propCount > 0 && (
                  <div style={{
                    display:'flex', flexWrap:'wrap', gap:3,
                    justifyContent:'center', maxWidth:190, padding:'0 8px',
                  }}>
                    {ownedTiles.map(id => (
                      <div key={id} style={{
                        background:'rgba(255,255,255,0.15)',
                        border:'1px solid rgba(255,255,255,0.22)',
                        borderRadius:18, padding:'2px 8px',
                        fontSize:8, fontWeight:800, color:'white',
                        display:'flex', alignItems:'center', gap:2,
                        textTransform:'uppercase', letterSpacing:'0.2px',
                      }}>🏠 {TILES[id].label}</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{position:'absolute',top:0,left:CORN,width:BS-CORN*2,height:CORN,display:'grid',gridTemplateColumns:`repeat(${N},1fr)`,gap:2,padding:2,boxSizing:'border-box'}}>
                {TOP.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="top"/>)}
              </div>
              <div style={{position:'absolute',bottom:0,left:CORN,width:BS-CORN*2,height:CORN,display:'grid',gridTemplateColumns:`repeat(${N},1fr)`,gap:2,padding:2,boxSizing:'border-box'}}>
                {BOT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="bottom"/>)}
              </div>
              <div style={{position:'absolute',right:0,top:CORN,width:CORN,height:BS-CORN*2,display:'grid',gridTemplateRows:`repeat(${N},1fr)`,gap:2,padding:2,boxSizing:'border-box'}}>
                {RIGHT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="right"/>)}
              </div>
              <div style={{position:'absolute',left:0,top:CORN,width:CORN,height:BS-CORN*2,display:'grid',gridTemplateRows:`repeat(${N},1fr)`,gap:2,padding:2,boxSizing:'border-box'}}>
                {LEFT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="left"/>)}
              </div>

              <div style={{position:'absolute',top:0,left:0,width:CORN,height:CORN,padding:2,boxSizing:'border-box'}}><Corner icon="🎲" top="Free Parking" bg="#fefce8" border="#a16207"/></div>
              <div style={{position:'absolute',top:0,right:0,width:CORN,height:CORN,padding:2,boxSizing:'border-box'}}><Corner icon="❓" top="Chance" bg="#eff6ff" border="#1d4ed8"/></div>
              <div style={{position:'absolute',bottom:0,left:0,width:CORN,height:CORN,padding:2,boxSizing:'border-box'}}><Corner icon="🏁" top="Collect" bot="← GO" bg="#f0fdf4" border="#15803d"/></div>
              <div style={{position:'absolute',bottom:0,right:0,width:CORN,height:CORN,padding:2,boxSizing:'border-box'}}><Corner icon="🚔" top="Jail" bg="#fef2f2" border="#b91c1c"/></div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          display:'flex', flexDirection:'column',
          alignItems:'center', gap:11, flexShrink:0,
        }}>
          <button
            onClick={roll}
            disabled={rolling || !!modal}
            style={{
              width:126, height:126, borderRadius:'50%',
              background: rolling || modal
                ? 'linear-gradient(135deg, #4b5563, #374151)'
                : 'linear-gradient(145deg, #f87171, #dc2626)',
              border:'5px solid white',
              boxShadow: rolling || modal
                ? '0 4px 0 #111, 0 8px 20px rgba(0,0,0,0.4)'
                : '0 10px 0 #7f1d1d, 0 14px 40px rgba(220,38,38,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
              cursor: rolling || modal ? 'not-allowed' : 'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              transform: rolling ? 'translateY(7px)' : 'translateY(0)',
              transition:'all 0.14s cubic-bezier(0.34,1.56,0.64,1)',
              outline:'none', position:'relative', overflow:'hidden',
            }}
          >
            {!rolling && (
              <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), transparent 60%)',pointerEvents:'none'}}/>
            )}
            <span style={{
              fontSize: rolling ? 30 : 38,
              fontWeight:900, color:'white',
              textShadow:'0 3px 10px rgba(0,0,0,0.5)',
              fontFamily:'Georgia, serif', lineHeight:1,
              position:'relative', zIndex:1,
            }}>
              {rolling ? '🎲' : 'GO'}
            </span>
            {!rolling && (
              <span style={{fontSize:12, color:'rgba(255,255,255,0.9)', fontWeight:800, position:'relative', zIndex:1, marginTop:3, letterSpacing:'0.8px'}}>
                ROLL
              </span>
            )}
          </button>

          {[
            {icon:'💵', label:'WALLET',     val:`₹${coins}`,          color:'#fbbf24'},
            {icon:'🏦', label:'SAVINGS',    val:`₹${savings}`,        color:'#34d399'},
            {icon:'🏠', label:'PROPERTIES', val:`${propCount} owned`, color:'#fb923c'},
            {icon:'📊', label:'NET WORTH',  val:`₹${netWorth}`,       color:'#a78bfa'},
          ].map(s => (
            <div key={s.label} style={{
              background:'rgba(255,255,255,0.07)',
              border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:14, padding:'9px 12px',
              textAlign:'center', width:140,
              backdropFilter:'blur(10px)',
              boxShadow:'0 2px 12px rgba(0,0,0,0.25)',
            }}>
              <div style={{fontSize:16}}>{s.icon}</div>
              <div style={{fontSize:13, fontWeight:900, color:s.color, lineHeight:1.2, marginTop:2}}>{s.val}</div>
              <div style={{fontSize:8, color:'rgba(255,255,255,0.45)', fontWeight:700, marginTop:2, letterSpacing:'0.6px', textTransform:'uppercase'}}>{s.label}</div>
            </div>
          ))}

          <div style={{position:'relative', width:62, height:62}}>
            <svg width="62" height="62" style={{transform:'rotate(-90deg)', position:'absolute', top:0, left:0}}>
              <circle cx="31" cy="31" r="24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5"/>
              <circle cx="31" cy="31" r="24" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*24}`}
                strokeDashoffset={`${2*Math.PI*24*(1 - (pos+1)/20)}`}
                style={{transition:'stroke-dashoffset 0.5s ease'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:14, fontWeight:900, color:'white', lineHeight:1}}>{pos+1}</span>
              <span style={{fontSize:7, color:'rgba(255,255,255,0.4)', fontWeight:600, lineHeight:1}}>/20</span>
            </div>
          </div>
        </div>

        {modal && (
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
      </div>

      <style>{`
        @keyframes fi {
          from { opacity:0 } to { opacity:1 }
        }
        @keyframes su {
          from { transform:translateY(100%) } to { transform:translateY(0) }
        }
        @keyframes boardFloat {
          0%,100% { transform:rotateX(46deg) rotateZ(-38deg) translateZ(0) }
          50%      { transform:rotateX(46deg) rotateZ(-38deg) translateZ(10px) }
        }
        @keyframes pinPulse {
          0%,100% { transform:translateY(0)   scale(1)    }
          50%     { transform:translateY(-3px) scale(1.06) }
        }
        @keyframes diceRoll {
          0%   { transform:rotate(0deg)   scale(1.04) }
          25%  { transform:rotate(90deg)  scale(0.95) }
          50%  { transform:rotate(180deg) scale(1.04) }
          75%  { transform:rotate(270deg) scale(0.95) }
          100% { transform:rotate(360deg) scale(1.04) }
        }
        @keyframes diceLand {
          0%   { transform:scale(0.8) rotate(-10deg) }
          60%  { transform:scale(1.1) rotate(5deg)   }
          80%  { transform:scale(0.96) rotate(-2deg) }
          100% { transform:scale(1)   rotate(0deg)   }
        }
      `}</style>
    </div>
  );
}