'use client';

import React, { useState } from 'react';
import { Town3D } from './Town3D';

// ═══════════════════════════════════════════════════════════════════════════
// GAME DATA
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

const COLORS: Record<TileType,{accent:string;fill:string;dark:string}> = {
  start:    {accent:'#22c55e', fill:'#dcfce7', dark:'#15803d'},
  save:     {accent:'#3b82f6', fill:'#dbeafe', dark:'#1e40af'},
  interest: {accent:'#14b8a6', fill:'#ccfbf1', dark:'#0f766e'},
  scam:     {accent:'#ef4444', fill:'#fee2e2', dark:'#b91c1c'},
  budget:   {accent:'#a855f7', fill:'#f3e8ff', dark:'#7e22ce'},
  property: {accent:'#f97316', fill:'#ffedd5', dark:'#c2410c'},
  loan:     {accent:'#ec4899', fill:'#fce7f3', dark:'#be185d'},
  normal:   {accent:'#64748b', fill:'#f8fafc', dark:'#475569'},
};

// ═══════════════════════════════════════════════════════════════════════════
// CSS DICE
// ═══════════════════════════════════════════════════════════════════════════
const F=false, T=true;
const FACES: Record<number, boolean[]> = {
  1: [F,F,F, F,T,F, F,F,F],
  2: [T,F,F, F,F,F, F,F,T],
  3: [T,F,F, F,T,F, F,F,T],
  4: [T,F,T, F,F,F, T,F,T],
  5: [T,F,T, F,T,F, T,F,T],
  6: [T,F,T, T,F,T, T,F,T],
};

function Dice({ value, rolling }: { value:number; rolling:boolean }) {
  const dots = FACES[value] ?? FACES[1];
  return (
    <div style={{
      width: 90, height: 90,
      borderRadius: 18,
      background: 'white',
      boxShadow: rolling
        ? '0 0 0 4px #fbbf24, 0 0 32px rgba(251,191,36,0.9), 0 8px 24px rgba(0,0,0,0.5)'
        : '0 8px 0 rgba(0,0,0,0.35), 0 12px 32px rgba(0,0,0,0.5)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      padding: 14,
      gap: 4,
      animation: rolling ? 'diceRoll 0.11s linear infinite' : 'diceLand 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      transition: 'box-shadow 0.3s ease',
      userSelect: 'none',
      cursor: rolling ? 'wait' : 'pointer',
    }}>
      {dots.map((on, i) => (
        <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
          {on && (
            <div style={{
              width: 14, height: 14,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #374151, #0f172a)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 1px 4px rgba(0,0,0,0.5)',
            }}/>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOARD TILE
// ═══════════════════════════════════════════════════════════════════════════
function BTile({ tile, active, owned, side }: {
  tile:Tile; active:boolean; owned:boolean; side:'top'|'bottom'|'left'|'right';
}) {
  const c = COLORS[tile.type];
  const isH = side === 'top' || side === 'bottom';
  const dark = owned && tile.type === 'property' ? '#92400e' : c.dark;
  const bg = owned && tile.type === 'property' ? '#fef3c7' : c.fill;

  const stripPos: React.CSSProperties =
    side === 'top'    ? {top:0, left:0, right:0, height:7} :
    side === 'bottom' ? {bottom:0, left:0, right:0, height:7} :
    side === 'left'   ? {left:0, top:0, bottom:0, width:7} :
                        {right:0, top:0, bottom:0, width:7};

  const contentPad =
    side === 'top'    ? '10px 3px 4px' :
    side === 'bottom' ? '4px 3px 10px' :
    side === 'left'   ? '4px 4px 4px 10px' :
                        '4px 10px 4px 4px';

  return (
    <div style={{
      width:'100%', height:'100%',
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
      <div style={{position:'absolute', background: dark, ...stripPos}}/>

      {owned && tile.type === 'property' && (
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, transparent 60%)',
        }}/>
      )}

      <div style={{
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        gap: 2,
        padding: contentPad,
        width:'100%', height:'100%',
        boxSizing:'border-box',
        writingMode: isH ? 'horizontal-tb' : 'vertical-lr',
        transform: side === 'left' ? 'scaleX(-1)' : 'none',
      }}>
        <span style={{
          fontSize: isH ? 32 : 28,
          lineHeight: 1,
          filter: active
            ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))'
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}>{tile.icon}</span>
        <span style={{
          fontSize: isH ? 9 : 8,
          fontWeight: 900,
          color: dark,
          letterSpacing: '0.3px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.2,
          textTransform: 'uppercase',
        }}>{tile.label}</span>
        {owned && tile.type === 'property' && (
          <span style={{fontSize:6, fontWeight:900, color:'#d97706', lineHeight:1}}>★ YOURS</span>
        )}
      </div>

      {active && (
        <div style={{
          position:'absolute', inset:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:20, pointerEvents:'none',
          background:'rgba(255,248,220,0.92)',
          backdropFilter:'blur(4px)',
          borderRadius: 6,
        }}>
          <div style={{
            animation:'pinBounce 1.2s ease-in-out infinite',
            filter:'drop-shadow(0 4px 10px rgba(239,68,68,0.6))',
            display:'flex', flexDirection:'column', alignItems:'center', gap:1,
          }}>
            <svg width="32" height="40" viewBox="0 0 22 30" fill="none">
              <ellipse cx="11" cy="28" rx="7" ry="2.5" fill="rgba(0,0,0,0.25)"/>
              <path d="M11 1C6.5 1 3 4.8 3 9.5C3 15.5 8 21 11 24.5C14 21 19 15.5 19 9.5C19 4.8 15.5 1 11 1Z" fill="#ef4444"/>
              <path d="M11 1C6.5 1 3 4.8 3 9.5C3 15.5 8 21 11 24.5C14 21 19 15.5 19 9.5C19 4.8 15.5 1 11 1Z" fill="url(#pGrad)"/>
              <defs><linearGradient id="pGrad" x1="6" y1="2" x2="15" y2="12"><stop offset="0%" stopColor="rgba(255,255,255,0.35)"/><stop offset="100%" stopColor="transparent"/></linearGradient></defs>
              <circle cx="11" cy="9.5" r="4.2" fill="white" opacity="0.96"/>
              <circle cx="11" cy="9.5" r="2.4" fill="#ef4444"/>
            </svg>
            <span style={{fontSize:7, fontWeight:900, color:'#dc2626', letterSpacing:'0.4px'}}>YOU</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CORNER
// ═══════════════════════════════════════════════════════════════════════════
function Corner({ icon, top, bot, bg, border }: {
  icon:string; top:string; bot?:string; bg:string; border:string;
}) {
  return (
    <div style={{
      width:'100%', height:'100%', background:bg,
      border:`3px solid ${border}`, borderRadius:8,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:4, boxSizing:'border-box',
      boxShadow:'0 2px 6px rgba(0,0,0,0.15)',
    }}>
      <span style={{fontSize:24}}>{icon}</span>
      <span style={{fontSize:8, fontWeight:900, color:border, textAlign:'center', fontFamily:'system-ui,sans-serif', lineHeight:1.3, textTransform:'uppercase'}}>{top}</span>
      {bot && <span style={{fontSize:10, fontWeight:900, color:border, fontFamily:'Georgia,serif'}}>{bot}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════
const P: React.CSSProperties = {
  color:'#475569', fontSize:15, lineHeight:1.7, textAlign:'center',
  margin:'0 0 16px', fontFamily:'system-ui, sans-serif',
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
  const c = COLORS[tile.type];
  const isOwned = ownedTiles.includes(tile.id);

  const Btn = ({ onClick, disabled, color, children }: any) => (
    <button onClick={onClick} disabled={disabled} style={{
      flex:1, padding:'16px 12px', borderRadius:16, border:'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#e5e7eb' : color,
      color: disabled ? '#9ca3af' : 'white',
      fontWeight:900, fontSize:15, lineHeight:1.4,
      boxShadow: disabled ? 'none' : `0 5px 0 rgba(0,0,0,0.25)`,
      fontFamily:'system-ui, sans-serif',
      transition:'all 0.15s ease',
      transform: disabled ? 'none' : 'translateY(0)',
    }}
    onMouseDown={(e: any) => !disabled && (e.currentTarget.style.transform = 'translateY(3px)')}
    onMouseUp={(e: any) => !disabled && (e.currentTarget.style.transform = 'translateY(0)')}
    onMouseLeave={(e: any) => !disabled && (e.currentTarget.style.transform = 'translateY(0)')}
    >{children}</button>
  );

  const Info = ({ l, v, color }: {l:string; v:string; color?:string}) => (
    <div style={{display:'flex', justifyContent:'space-between', fontSize:15, padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.06)'}}>
      <span style={{color:'#64748b', fontWeight:600}}>{l}</span>
      <strong style={{color: color||'#0f172a', fontWeight:800}}>{v}</strong>
    </div>
  );

  const Box = ({ children }: any) => (
    <div style={{background:c.fill, border:`2px solid ${c.accent}33`, borderRadius:14, padding:'14px 16px', marginBottom:16}}>
      {children}
    </div>
  );

  const Banner = ({ emoji, text, sub, color }: {emoji:string; text:string; sub?:string; color:string}) => (
    <div style={{
      background:`${color}18`, border:`2px solid ${color}40`,
      borderRadius:14, padding:'13px 16px', marginBottom:16,
      display:'flex', alignItems:'center', gap:14,
      animation:'slideInBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <span style={{fontSize:28, flexShrink:0}}>{emoji}</span>
      <div>
        <div style={{fontWeight:900, fontSize:17, color, lineHeight:1.3}}>{text}</div>
        {sub && <div style={{fontSize:13, color:'#64748b', marginTop:3, fontWeight:600}}>{sub}</div>}
      </div>
    </div>
  );

  const body = () => {
    switch (tile.type) {
      case 'start':
        return (<>
          {lapBonus !== null && (
            <Banner emoji="🎉" text={`You got ₹${lapBonus}!`} sub="Nice! You completed a lap around the board!" color="#22c55e"/>
          )}
          <p style={P}>Every time you pass GO, you collect ₹{GO_SALARY}. That's your salary for playing smart! Keep going around to stack up more cash! 💪</p>
          <Box><div style={{textAlign:'center', fontSize:26, fontWeight:900, color:c.accent}}>₹{GO_SALARY} every lap! 🏁</div></Box>
          <Btn onClick={onClose} color={c.accent}>Sweet! Let's roll! 🎲</Btn>
        </>);

      case 'save':
        return (<>
          <p style={P}>Put ₹50 in your savings account! The bank keeps it safe, and you'll earn 10% interest whenever you land on EARN tiles. Smart move! 🧠</p>
          <Box>
            <Info l="Your wallet" v={`₹${coins}`}/>
            <Info l="In savings" v={`₹${savings}`}/>
            {coins >= 50 && <Info l="After saving" v={`₹${coins-50} wallet, ₹${savings+50} saved`} color="#3b82f6"/>}
          </Box>
          <Btn onClick={()=>{if(coins>=50){setCoins(coins-50); setSavings(savings+50);} onClose();}} disabled={coins<50} color={c.accent}>
            {coins>=50 ? 'Save ₹50! 🏦' : 'Need more coins first!'}
          </Btn>
        </>);

      case 'interest': {
        const bonus = Math.floor(savings * 0.1);
        return (<>
          <p style={P}>Your savings just earned you money! You get <strong>10% interest</strong> on whatever you saved. This is how money grows by itself! 🌱</p>
          <Box>
            <div style={{textAlign:'center', padding:'8px 0'}}>
              <div style={{fontSize:42, fontWeight:900, color: bonus>0 ? c.accent : '#cbd5e1'}}>+₹{bonus}</div>
              <div style={{fontSize:14, color:'#64748b', marginTop:4, fontWeight:600}}>10% of your ₹{savings} savings</div>
            </div>
          </Box>
          {bonus === 0 && <p style={{...P, color:'#ef4444', fontSize:13, margin:'0 0 12px', fontWeight:700}}>⚠️ You need to save some money first to earn interest!</p>}
          <Btn onClick={()=>{if(bonus>0) setSavings(savings+bonus); onClose();}} color={c.accent} disabled={bonus===0}>
            {bonus > 0 ? 'Collect my money! 💰' : 'Nothing yet — save first!'}
          </Btn>
        </>);
      }

      case 'scam':
        return (<>
          <p style={P}>Oh no! Someone's trying to scam you! They're asking for your bank OTP (that secret code). What should you do? 🤔</p>
          <Box>
            <div style={{fontSize:14, color:'#475569', lineHeight:2, fontWeight:600}}>
              ⚠️ <strong>Give them the code</strong> → They steal ₹100! 😱<br/>
              ✅ <strong>Ignore them &amp; report</strong> → Bank rewards you ₹50! ✨
            </div>
          </Box>
          <div style={{display:'flex', gap:12}}>
            <Btn onClick={()=>{setCoins(Math.max(0, coins-100)); onClose();}} color="#ef4444">
              Give Code<br/><span style={{fontSize:13,fontWeight:600}}>LOSE ₹100 😭</span>
            </Btn>
            <Btn onClick={()=>{setCoins(coins+50); onClose();}} color="#22c55e">
              Ignore It!<br/><span style={{fontSize:13,fontWeight:600}}>GET ₹50 🎉</span>
            </Btn>
          </div>
        </>);

      case 'budget':
        return (<>
          <p style={P}>Time to make a choice! Do you <strong>spend</strong> money on something fun, or <strong>save</strong> it for something important? Choose wisely! 🤓</p>
          <Box><Info l="Your wallet" v={`₹${coins}`}/></Box>
          <div style={{display:'flex', gap:12}}>
            <Btn onClick={()=>{if(coins>=100) setCoins(coins-100); onClose();}} disabled={coins<100} color="#f97316">
              🚲 New Bike<br/><span style={{fontSize:13,fontWeight:600}}>₹100 (Want)</span>
            </Btn>
            <Btn onClick={()=>{setSavings(savings+50); onClose();}} color="#a855f7">
              📚 Save for School<br/><span style={{fontSize:13,fontWeight:600}}>+₹50 Saved!</span>
            </Btn>
          </div>
        </>);

      case 'property':
        if (isOwned) return (<>
          <Banner emoji="🏠" text="This is YOUR property!" sub={`You earn ₹${tile.rent} every time you land here!`} color="#f97316"/>
          {rentEarned !== null && rentEarned > 0 && (
            <Banner emoji="💰" text={`You collected ₹${rentEarned}!`} sub="Your property is making you money!" color="#22c55e"/>
          )}
          <Box>
            <Info l="Property name" v={tile.label}/>
            <Info l="You paid" v={`₹${tile.price}`}/>
            <Info l="Rent you collect" v={`₹${tile.rent}`} color="#22c55e"/>
          </Box>
          <Btn onClick={onClose} color={c.accent}>That's my place! 🏠</Btn>
        </>);
        return (<>
          <p style={P}>Want to buy <strong>{tile.label}</strong>? Once you own it, you'll collect ₹{tile.rent} rent every time you land here! Properties make you richer! 💎</p>
          <Box>
            <Info l="Property cost" v={`₹${tile.price}`}/>
            <Info l="Rent per visit" v={`₹${tile.rent}`} color="#22c55e"/>
            <Info l="Your wallet" v={`₹${coins}`}/>
            {loanActive && <div style={{fontSize:12, color:'#ef4444', marginTop:8, fontWeight:700}}>⚠️ You have a loan! Still owe ₹{loanRemaining}</div>}
          </Box>
          <div style={{display:'flex', gap:12}}>
            <Btn onClick={()=>{
              if(coins >= tile.price){setCoins(coins-tile.price); setOwnedTiles([...ownedTiles, tile.id]);}
              onClose();
            }} disabled={coins < tile.price} color="#f97316">
              🏠 Buy It!<br/><span style={{fontSize:13,fontWeight:600}}>₹{tile.price}</span>
            </Btn>
            <Btn onClick={()=>{
              if(!loanActive){setCoins(coins+LOAN_AMOUNT); setLoanActive(true); setLoanRemaining(LOAN_REPAY);}
              onClose();
            }} disabled={loanActive} color="#ec4899">
              🏦 Get Loan<br/><span style={{fontSize:13,fontWeight:600}}>₹{LOAN_AMOUNT} now</span>
            </Btn>
          </div>
          <button onClick={onClose} style={{width:'100%',marginTop:10,padding:'13px',borderRadius:14,border:'none',cursor:'pointer',background:'#f1f5f9',color:'#94a3b8',fontWeight:800,fontSize:14}}>
            Skip — don't buy
          </button>
        </>);

      case 'loan':
        return (<>
          <p style={P}>Need cash now? You can borrow ₹{LOAN_AMOUNT} from the bank, but you'll have to pay back ₹{LOAN_REPAY} next time you pass GO. That's ₹{LOAN_REPAY-LOAN_AMOUNT} extra! 😬</p>
          <Box>
            <Info l="You get now" v={`₹${LOAN_AMOUNT}`} color="#3b82f6"/>
            <Info l="You pay back later" v={`₹${LOAN_REPAY}`} color="#ef4444"/>
            <Info l="Extra cost (interest)" v={`₹${LOAN_REPAY - LOAN_AMOUNT}`} color="#ef4444"/>
            {loanActive && <div style={{marginTop:8, fontSize:13, color:'#ef4444', fontWeight:700}}>⚠️ You already have a loan! Pay it back first!</div>}
          </Box>
          <Btn onClick={()=>{
            if(!loanActive){setCoins(coins+LOAN_AMOUNT); setLoanActive(true); setLoanRemaining(LOAN_REPAY);}
            onClose();
          }} disabled={loanActive} color={c.accent}>
            {loanActive ? 'Already have loan! ⛔' : 'Borrow money 💳'}
          </Btn>
        </>);

      default:
        return (<>
          <p style={P}>Lucky you! This is a free space. Nothing to pay, nothing to do. Just chill and enjoy the break! 😎</p>
          <Box><div style={{textAlign:'center', fontSize:48, padding:'8px 0'}}>🌟</div></Box>
          <Btn onClick={onClose} color={c.accent}>Nice! Keep rolling! 🎲</Btn>
        </>);
    }
  };

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(16px)',display:'flex',alignItems:'flex-end',justifyContent:'center',animation:'fadeIn 0.2s ease'}}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{width:'100%',maxWidth:480,background:'white',borderRadius:'32px 32px 0 0',padding:'0 24px 40px',animation:'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',maxHeight:'87vh',overflowY:'auto',boxShadow:'0 -10px 60px rgba(0,0,0,0.3)'}}
      >
        <div style={{width:48,height:5,background:'#cbd5e1',borderRadius:3,margin:'14px auto 24px'}}/>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
          <div style={{width:60,height:60,borderRadius:20,background:c.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,boxShadow:`0 8px 24px ${c.accent}66`,flexShrink:0}}>
            {tile.icon}
          </div>
          <div>
            <div style={{fontWeight:900,fontSize:24,color:'#0f172a',fontFamily:'Georgia,serif',lineHeight:1.2}}>{tile.label}</div>
            <div style={{fontSize:13,color:'#94a3b8',fontWeight:700,marginTop:2}}>
              Tile #{tile.id+1} · Bankopoly{tile.type==='property'&&isOwned?' · ★ OWNED':''}
            </div>
          </div>
        </div>
        {body()}
        <button onClick={onClose} style={{width:'100%',marginTop:14,padding:16,borderRadius:16,border:'none',cursor:'pointer',background:'#f1f5f9',color:'#94a3b8',fontWeight:800,fontSize:14,letterSpacing:'0.4px',transition:'all 0.15s'}}>
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
      const r = Math.floor(Math.random() * 6) + 1;
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
        newCoins -= repay;
        const rem = loanRemaining - repay;
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

  // Emergency withdraw from savings
  const withdrawFromSavings = (amount: number) => {
    if (savings >= amount) {
      setSavings(savings - amount);
      setCoins(coins + amount);
    }
  };

  const CORN = 85;
  const CELL = 75;
  const N = 5;
  const BS = CORN * 2 + CELL * N;

  const propCount = ownedTiles.length;
  const propValue = ownedTiles.reduce((s, id) => s + TILES[id].price, 0);
  const netWorth = coins + savings + propValue - loanRemaining;
  const lowOnCash = coins < 50 && savings >= 50;

  return (
    <div style={{
      width:'100vw', height:'100vh', overflow:'hidden',
      display:'flex', flexDirection:'column',
      background:'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily:'system-ui, sans-serif',
      position:'relative',
    }}>
      <Town3D />

      {/* HUD */}
      <div style={{
        flexShrink:0, position:'relative', zIndex:10,
        display:'flex', alignItems:'center', flexWrap:'wrap',
        padding:'10px 20px', gap:10,
        background:'rgba(0,0,0,0.65)', backdropFilter:'blur(20px)',
        borderBottom:'2px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width:42, height:42, borderRadius:'50%', flexShrink:0,
          background:'linear-gradient(135deg, #3b82f6, #1e40af)',
          border:'3px solid rgba(255,255,255,0.35)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20, boxShadow:'0 4px 16px rgba(59,130,246,0.5)',
        }}>🐠</div>

        {[
          {icon:'💵', val:`₹${coins.toLocaleString()}`, label:'Cash', bg:'rgba(251,191,36,0.15)', bd:'rgba(251,191,36,0.3)', c:'#fde68a'},
          {icon:'🏦', val:`₹${savings.toLocaleString()}`, label:'Saved', bg:'rgba(52,211,153,0.15)', bd:'rgba(52,211,153,0.3)', c:'#6ee7b7'},
          {icon:'🏠', val:`${propCount}`, label:'Properties', bg:'rgba(251,146,60,0.15)', bd:'rgba(251,146,60,0.3)', c:'#fdba74'},
          {icon:'📊', val:`₹${netWorth.toLocaleString()}`, label:'Worth', bg:'rgba(167,139,250,0.15)', bd:'rgba(167,139,250,0.3)', c:'#c4b5fd'},
        ].map(s => (
          <div key={s.label} style={{
            display:'flex', alignItems:'center', gap:8,
            background:s.bg, border:`2px solid ${s.bd}`,
            borderRadius:30, padding:'6px 14px',
          }}>
            <span style={{fontSize:16}}>{s.icon}</span>
            <div>
              <div style={{fontWeight:900, fontSize:15, color:s.c, lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:9, color:'rgba(255,255,255,0.5)', fontWeight:700, textTransform:'uppercase'}}>{s.label}</div>
            </div>
          </div>
        ))}

        {lowOnCash && (
          <button
            onClick={() => withdrawFromSavings(50)}
            style={{
              background:'rgba(34,197,94,0.2)', border:'2px solid rgba(34,197,94,0.4)',
              borderRadius:30, padding:'6px 14px',
              color:'#6ee7b7', fontWeight:800, fontSize:13,
              cursor:'pointer', display:'flex', alignItems:'center', gap:6,
              transition:'all 0.2s',
            }}
          >
            <span>💸</span>
            <span>Get ₹50 from savings</span>
          </button>
        )}

        <div style={{marginLeft:'auto', display:'flex', gap:10, alignItems:'center'}}>
          {loanActive && (
            <div style={{
              background:'rgba(239,68,68,0.2)', border:'2px solid rgba(239,68,68,0.4)',
              borderRadius:24, padding:'6px 14px', fontSize:12, fontWeight:800, color:'#fca5a5',
            }}>⚠️ Loan ₹{loanRemaining}</div>
          )}
          <div style={{
            background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.12)',
            borderRadius:24, padding:'6px 14px', fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.5)',
          }}>Round {laps+1} · Tile {pos+1}/20</div>
        </div>
      </div>

      {/* MAIN — Board centered, stats panel on right */}
      <div style={{
        flex:1, display:'flex', alignItems:'center',
        justifyContent:'center',
        padding:'0 20px', overflow:'hidden',
        position:'relative', zIndex:1,
      }}>

        {/* CENTERED BOARD */}
        <div style={{
          perspective:1200, perspectiveOrigin:'50% 40%',
          flexShrink:0,
        }}>
          <div style={{
            width:BS, height:BS,
            transform:'rotateX(48deg) rotateZ(-40deg)',
            transformStyle:'preserve-3d',
            transformOrigin:'center center',
            filter:'drop-shadow(0 30px 50px rgba(0,0,0,0.9)) drop-shadow(0 10px 20px rgba(0,0,0,0.6))',
            animation:'boardFloat 8s ease-in-out infinite',
          }}>
            <div style={{
              position:'relative', width:BS, height:BS,
              background:'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius:16,
              outline:'6px solid #92400e',
              boxShadow:'0 0 0 14px #d97706, 0 0 0 18px #78350f, 0 0 0 22px rgba(255,255,255,0.05), 0 35px 80px rgba(0,0,0,0.95)',
            }}>

              {/* BOARD CENTER */}
              <div style={{
                position:'absolute', top:CORN, left:CORN,
                width:BS-CORN*2, height:BS-CORN*2,
                background:'radial-gradient(ellipse at 40% 35%, #10b981 0%, #059669 50%, #047857 100%)',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:14, overflow:'hidden',
                boxShadow:'inset 0 0 50px rgba(0,0,0,0.4), inset 0 3px 0 rgba(255,255,255,0.1)',
                borderRadius:4,
              }}>
                <div style={{
                  position:'absolute', inset:12,
                  border:'2px solid rgba(255,255,255,0.1)',
                  borderRadius:8, pointerEvents:'none',
                }}/>

                <div style={{
                  fontFamily:'Georgia, serif', fontWeight:900, fontSize:16,
                  color:'rgba(255,255,255,0.98)',
                  textShadow:'0 3px 15px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.15)',
                  letterSpacing:4, textAlign:'center', lineHeight:1.4,
                  background:'rgba(0,0,0,0.3)',
                  padding:'8px 20px', borderRadius:10,
                  border:'2px solid rgba(255,255,255,0.15)',
                }}>🏦<br/>BANKOPOLY</div>

                <div
                  onClick={rolling || !!modal ? undefined : roll}
                  style={{
                    filter: rolling
                      ? 'drop-shadow(0 0 24px rgba(251,191,36,1))'
                      : 'drop-shadow(0 6px 16px rgba(0,0,0,0.6))',
                    transition:'filter 0.3s',
                  }}
                  title={rolling ? 'Rolling…' : 'Click to roll!'}
                >
                  <Dice key={`d${rollSeed}`} value={diceVal} rolling={rolling}/>
                </div>

                <div style={{
                  fontSize:11, fontWeight:800, letterSpacing:'0.6px',
                  color:'rgba(255,255,255,0.85)',
                  textShadow:'0 2px 6px rgba(0,0,0,0.6)',
                  textTransform:'uppercase',
                }}>
                  {rolling ? '🎲 Rolling the dice…' : `Rolled ${diceVal} — Tap to roll!`}
                </div>

                {propCount > 0 && (
                  <div style={{
                    display:'flex', flexWrap:'wrap', gap:4,
                    justifyContent:'center', maxWidth:210, padding:'0 10px',
                  }}>
                    {ownedTiles.map(id => (
                      <div key={id} style={{
                        background:'rgba(255,255,255,0.2)',
                        border:'2px solid rgba(255,255,255,0.3)',
                        borderRadius:20, padding:'3px 10px',
                        fontSize:9, fontWeight:900, color:'white',
                        display:'flex', alignItems:'center', gap:3,
                        textTransform:'uppercase', letterSpacing:'0.3px',
                        textShadow:'0 1px 3px rgba(0,0,0,0.5)',
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

              <div style={{position:'absolute',top:0,left:0,width:CORN,height:CORN,padding:2,boxSizing:'border-box'}}><Corner icon="🎲" top="Free Park" bg="#fefce8" border="#a16207"/></div>
              <div style={{position:'absolute',top:0,right:0,width:CORN,height:CORN,padding:2,boxSizing:'border-box'}}><Corner icon="❓" top="Chance" bg="#dbeafe" border="#1e40af"/></div>
              <div style={{position:'absolute',bottom:0,left:0,width:CORN,height:CORN,padding:2,boxSizing:'border-box'}}><Corner icon="🏁" top="Collect" bot="← GO" bg="#dcfce7" border="#15803d"/></div>
              <div style={{position:'absolute',bottom:0,right:0,width:CORN,height:CORN,padding:2,boxSizing:'border-box'}}><Corner icon="🚔" top="Jail" bg="#fee2e2" border="#b91c1c"/></div>
            </div>
          </div>
        </div>

        {/* RIGHT STATS PANEL */}
        <div style={{
          position:'absolute', right:30, top:'50%', transform:'translateY(-50%)',
          display:'flex', flexDirection:'column',
          alignItems:'center', gap:12, flexShrink:0,
        }}>
          <button
            onClick={roll}
            disabled={rolling || !!modal}
            style={{
              width:120, height:120, borderRadius:'50%',
              background: rolling || modal
                ? 'linear-gradient(145deg, #64748b, #475569)'
                : 'linear-gradient(145deg, #f87171, #ef4444)',
              border:'6px solid white',
              boxShadow: rolling || modal
                ? '0 5px 0 #1e293b, 0 10px 25px rgba(0,0,0,0.5)'
                : '0 12px 0 #991b1b, 0 18px 45px rgba(239,68,68,0.65), inset 0 2px 0 rgba(255,255,255,0.3)',
              cursor: rolling || modal ? 'not-allowed' : 'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              transform: rolling ? 'translateY(8px)' : 'translateY(0)',
              transition:'all 0.16s cubic-bezier(0.34,1.56,0.64,1)',
              outline:'none', position:'relative', overflow:'hidden',
            }}
          >
            {!rolling && (
              <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25), transparent 65%)',pointerEvents:'none'}}/>
            )}
            <span style={{
              fontSize: rolling ? 34 : 44,
              fontWeight:900, color:'white',
              textShadow:'0 4px 12px rgba(0,0,0,0.6)',
              fontFamily:'Georgia, serif', lineHeight:1,
              position:'relative', zIndex:1,
            }}>
              {rolling ? '🎲' : 'GO'}
            </span>
            {!rolling && (
              <span style={{fontSize:14, color:'rgba(255,255,255,0.95)', fontWeight:900, position:'relative', zIndex:1, marginTop:5, letterSpacing:'1.2px', textShadow:'0 2px 6px rgba(0,0,0,0.5)'}}>
                ROLL!
              </span>
            )}
          </button>

          {[
            {icon:'💵', label:'WALLET', val:`₹${coins}`, color:'#fbbf24'},
            {icon:'🏦', label:'SAVINGS', val:`₹${savings}`, color:'#34d399'},
            {icon:'🏠', label:'PROPS', val:`${propCount}`, color:'#fb923c'},
            {icon:'📊', label:'WORTH', val:`₹${netWorth}`, color:'#a78bfa'},
          ].map(s => (
            <div key={s.label} style={{
              background:'rgba(255,255,255,0.08)',
              border:'2px solid rgba(255,255,255,0.15)',
              borderRadius:16, padding:'11px 14px',
              textAlign:'center', width:150,
              backdropFilter:'blur(12px)',
              boxShadow:'0 4px 16px rgba(0,0,0,0.3)',
            }}>
              <div style={{fontSize:20}}>{s.icon}</div>
              <div style={{fontSize:15, fontWeight:900, color:s.color, lineHeight:1.2, marginTop:3}}>{s.val}</div>
              <div style={{fontSize:9, color:'rgba(255,255,255,0.5)', fontWeight:800, marginTop:3, letterSpacing:'0.7px', textTransform:'uppercase'}}>{s.label}</div>
            </div>
          ))}

          <div style={{position:'relative', width:70, height:70}}>
            <svg width="70" height="70" style={{transform:'rotate(-90deg)', position:'absolute', top:0, left:0}}>
              <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
              <circle cx="35" cy="35" r="28" fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*28}`}
                strokeDashoffset={`${2*Math.PI*28*(1 - (pos+1)/20)}`}
                style={{transition:'stroke-dashoffset 0.6s ease'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:16, fontWeight:900, color:'white', lineHeight:1, textShadow:'0 2px 6px rgba(0,0,0,0.5)'}}>{pos+1}</span>
              <span style={{fontSize:8, color:'rgba(255,255,255,0.45)', fontWeight:700, lineHeight:1}}>/20</span>
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
        @keyframes fadeIn {
          from { opacity:0 } to { opacity:1 }
        }
        @keyframes slideUp {
          from { transform:translateY(100%) } to { transform:translateY(0) }
        }
        @keyframes slideInBounce {
          0% { transform:translateX(-20px); opacity:0 }
          60% { transform:translateX(5px); opacity:1 }
          100% { transform:translateX(0) }
        }
        @keyframes boardFloat {
          0%,100% { transform:rotateX(48deg) rotateZ(-40deg) translateZ(0) }
          50% { transform:rotateX(48deg) rotateZ(-40deg) translateZ(12px) }
        }
        @keyframes pinBounce {
          0%,100% { transform:translateY(0) scale(1) }
          50% { transform:translateY(-5px) scale(1.08) }
        }
        @keyframes diceRoll {
          0% { transform:rotate(0deg) scale(1.06) }
          25% { transform:rotate(90deg) scale(0.94) }
          50% { transform:rotate(180deg) scale(1.06) }
          75% { transform:rotate(270deg) scale(0.94) }
          100% { transform:rotate(360deg) scale(1.06) }
        }
        @keyframes diceLand {
          0% { transform:scale(0.75) rotate(-12deg) }
          60% { transform:scale(1.15) rotate(6deg) }
          80% { transform:scale(0.95) rotate(-3deg) }
          100% { transform:scale(1) rotate(0deg) }
        }
      `}</style>
    </div>
  );
}