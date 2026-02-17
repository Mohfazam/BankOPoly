'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Town3D } from './Town3D';

type TileType = 'start'|'save'|'interest'|'scam'|'budget'|'property'|'loan'|'normal';
interface Tile { id:number; type:TileType; label:string; icon:string; price:number; rent:number; }

// Each property has a price to buy and rent charged when you land on it again
const TILES: Tile[] = [
  {id:0,  type:'start',    label:'GO',      icon:'🏁', price:0,   rent:0},
  {id:1,  type:'save',     label:'SAVE',    icon:'🏦', price:0,   rent:0},
  {id:2,  type:'interest', label:'EARN',    icon:'💰', price:0,   rent:0},
  {id:3,  type:'property', label:'PARK ST', icon:'🏠', price:100, rent:25},
  {id:4,  type:'scam',     label:'SCAM',    icon:'⚠️', price:0,   rent:0},
  {id:5,  type:'budget',   label:'BUDGET',  icon:'📚', price:0,   rent:0},
  {id:6,  type:'loan',     label:'LOAN',    icon:'📋', price:0,   rent:0},
  {id:7,  type:'property', label:'HILL RD', icon:'🏠', price:120, rent:30},
  {id:8,  type:'interest', label:'EARN',    icon:'💰', price:0,   rent:0},
  {id:9,  type:'normal',   label:'FREE',    icon:'⭐', price:0,   rent:0},
  {id:10, type:'budget',   label:'BUDGET',  icon:'📚', price:0,   rent:0},
  {id:11, type:'save',     label:'SAVE',    icon:'🏦', price:0,   rent:0},
  {id:12, type:'loan',     label:'LOAN',    icon:'📋', price:0,   rent:0},
  {id:13, type:'scam',     label:'SCAM',    icon:'⚠️', price:0,   rent:0},
  {id:14, type:'property', label:'MG ROAD', icon:'🏠', price:150, rent:40},
  {id:15, type:'interest', label:'EARN',    icon:'💰', price:0,   rent:0},
  {id:16, type:'budget',   label:'BUDGET',  icon:'📚', price:0,   rent:0},
  {id:17, type:'normal',   label:'FREE',    icon:'⭐', price:0,   rent:0},
  {id:18, type:'save',     label:'SAVE',    icon:'🏦', price:0,   rent:0},
  {id:19, type:'property', label:'MALL AVE',icon:'🏠', price:180, rent:50},
];

const GO_SALARY   = 200; // collected every time you pass or land on GO
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
  start:'#b8860b', property:'#c41e3a', loan:'#6a0572', interest:'#0047ab',
  save:'#006994',  normal:'#2d5016',   budget:'#9b1d20', scam:'#8b0000',
};

// ─── DICE ────────────────────────────────────────────────────────────────────
function DiceMesh({ rolling, value }:{ rolling:boolean; value:number }) {
  const ref = useRef<THREE.Group>(null);
  const tgt = useRef(new THREE.Euler());
  const t   = useRef(0);
  useEffect(()=>{
    const m:Record<number,[number,number,number]> = {
      1:[0,0,0],2:[0,Math.PI/2,0],3:[-Math.PI/2,0,0],
      4:[Math.PI/2,0,0],5:[0,-Math.PI/2,0],6:[0,Math.PI,0],
    };
    const [x,y,z]=m[value]??[0,0,0]; tgt.current.set(x,y,z);
  },[value]);
  useFrame((_,dt)=>{
    if(!ref.current) return; t.current+=dt;
    if(rolling){
      ref.current.rotation.x+=dt*20; ref.current.rotation.y+=dt*25;
      ref.current.position.y=Math.abs(Math.sin(t.current*14))*0.5;
    } else {
      ref.current.rotation.x+=(tgt.current.x-ref.current.rotation.x)*0.15;
      ref.current.rotation.y+=(tgt.current.y-ref.current.rotation.y)*0.15;
      ref.current.rotation.z+=(tgt.current.z-ref.current.rotation.z)*0.15;
      ref.current.position.y+=(0-ref.current.position.y)*0.15;
    }
  });
  const dot=(p:[number,number,number])=>(<mesh key={p.join()} position={p}><sphereGeometry args={[0.14,12,12]}/><meshStandardMaterial color="#111" roughness={0.3}/></mesh>);
  const d=0.44,f=0.93;
  return (<group ref={ref}><RoundedBox args={[1.85,1.85,1.85]} radius={0.16} smoothness={4} castShadow><meshStandardMaterial color="#fff" roughness={0.18} metalness={0.07}/></RoundedBox>{dot([0,0,f])}{dot([f,d,-d])}{dot([f,-d,d])}{dot([-d,f,d])}{dot([0,f,0])}{dot([d,f,-d])}{dot([-d,-f,-d])}{dot([d,-f,-d])}{dot([-d,-f,d])}{dot([d,-f,d])}{dot([-f,d,d])}{dot([-f,-d,d])}{dot([-f,0,0])}{dot([-f,d,-d])}{dot([-f,-d,-d])}{dot([-d,d,-f])}{dot([d,d,-f])}{dot([-d,0,-f])}{dot([d,0,-f])}{dot([-d,-d,-f])}{dot([d,-d,-f])}</group>);
}

// ─── BOARD TILE ──────────────────────────────────────────────────────────────
function BTile({ tile, active, owned, side }:{ tile:Tile; active:boolean; owned:boolean; side:'top'|'bottom'|'left'|'right' }) {
  const bg   = FILL[tile.type];
  const dark = DARK[tile.type];
  const isH  = side==='top'||side==='bottom';
  const strip: React.CSSProperties =
    side==='top'    ? {top:0,left:0,right:0,height:7,background:dark} :
    side==='bottom' ? {bottom:0,left:0,right:0,height:7,background:dark} :
    side==='left'   ? {left:0,top:0,bottom:0,width:7,background:dark} :
                      {right:0,top:0,bottom:0,width:7,background:dark};
  const pad = side==='top'?'11px 3px 3px':side==='bottom'?'3px 3px 11px':side==='left'?'3px 3px 3px 11px':'3px 11px 3px 3px';

  return (
    <div style={{width:'100%',height:'100%',background:owned?'#fef9c3':bg,border:`2.5px solid ${owned?'#ca8a04':dark}`,borderRadius:7,boxShadow:`inset 0 1px 3px rgba(255,255,255,0.6),0 3px 8px rgba(0,0,0,0.2)`,position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxSizing:'border-box',transition:'all 0.2s ease'}}>
      <div style={{position:'absolute',background:owned?'#ca8a04':dark,...strip}}/>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:0.5,padding:pad,width:'100%',height:'100%',boxSizing:'border-box',writingMode:isH?'horizontal-tb':'vertical-lr',transform:side==='left'?'scaleX(-1)':'none'}}>
        <span style={{fontSize:isH?32:27,lineHeight:1,filter:active?'drop-shadow(0 2px 5px rgba(0,0,0,0.4))':'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'}}>{tile.icon}</span>
        <span style={{fontSize:isH?9:8,fontWeight:900,color:owned?'#92400e':dark,letterSpacing:'0.3px',textAlign:'center',fontFamily:'system-ui,sans-serif',lineHeight:1.1,textTransform:'uppercase'}}>{tile.label}</span>
        {owned&&tile.type==='property'&&<span style={{fontSize:isH?7:7,fontWeight:700,color:'#ca8a04',lineHeight:1}}>★ YOURS</span>}
      </div>
      {/* Current position pin */}
      {active&&(
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:20,pointerEvents:'none',background:'rgba(255,255,200,0.82)',borderRadius:6,backdropFilter:'blur(2px)'}}>
          <div style={{animation:'pinPulse 1.5s ease-in-out infinite',filter:'drop-shadow(0 3px 8px rgba(0,0,0,0.4))',display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
            <svg width="36" height="44" viewBox="0 0 22 30" fill="none">
              <ellipse cx="11" cy="28" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
              <path d="M11 1C6.5 1 3 4.8 3 9.5C3 15.5 8 21 11 24.5C14 21 19 15.5 19 9.5C19 4.8 15.5 1 11 1Z" fill="#ff0000"/>
              <circle cx="11" cy="9.5" r="4.5" fill="white" opacity="0.99"/>
              <circle cx="11" cy="9.5" r="2.5" fill="#ff0000"/>
            </svg>
            <span style={{fontSize:7,fontWeight:900,color:'#c41e3a'}}>YOU</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CORNER ──────────────────────────────────────────────────────────────────
function Corner({ icon,top,bot,bg,border }:{ icon:string;top:string;bot?:string;bg:string;border:string }) {
  return (
    <div style={{width:'100%',height:'100%',background:bg,border:`2px solid ${border}`,borderRadius:6,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,boxSizing:'border-box'}}>
      <span style={{fontSize:16}}>{icon}</span>
      <span style={{fontSize:7,fontWeight:900,color:border,textAlign:'center',fontFamily:'system-ui,sans-serif',lineHeight:1.3}}>{top}</span>
      {bot&&<span style={{fontSize:8,fontWeight:900,color:border,fontFamily:'Georgia,serif'}}>{bot}</span>}
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const P: React.CSSProperties = {color:'#4b5563',fontSize:14,lineHeight:1.65,textAlign:'center',margin:'0 0 12px',fontFamily:'system-ui,sans-serif'};

// ─── MODAL ───────────────────────────────────────────────────────────────────
interface ModalProps {
  tile: Tile;
  coins: number;
  savings: number;
  loanActive: boolean;
  loanRemaining: number;
  ownedTiles: number[];
  lapBonus: number | null;
  rentPaid: number | null;
  setCoins: (n:number)=>void;
  setSavings: (n:number)=>void;
  setLoanActive: (b:boolean)=>void;
  setLoanRemaining: (n:number)=>void;
  setOwnedTiles: (ids:number[])=>void;
  onClose: ()=>void;
}

function Modal({ tile,coins,savings,loanActive,loanRemaining,ownedTiles,lapBonus,rentPaid,setCoins,setSavings,setLoanActive,setLoanRemaining,setOwnedTiles,onClose }:ModalProps) {
  const ac = ACCENT[tile.type];
  const bg = FILL[tile.type];
  const isOwned = ownedTiles.includes(tile.id);

  const Btn=({onClick,disabled,color,children}:any)=>(
    <button onClick={onClick} disabled={disabled} style={{flex:1,padding:'14px 10px',borderRadius:14,border:'none',cursor:disabled?'not-allowed':'pointer',background:disabled?'#e5e7eb':color,color:disabled?'#9ca3af':'white',fontWeight:800,fontSize:14,lineHeight:1.3,boxShadow:disabled?'none':`0 4px 0 rgba(0,0,0,0.2)`,fontFamily:'system-ui,sans-serif'}}>{children}</button>
  );
  const Info=({l,v,c}:{l:string;v:string;c?:string})=>(
    <div style={{display:'flex',justifyContent:'space-between',fontSize:14,padding:'3px 0'}}>
      <span style={{color:'#6b7280'}}>{l}</span><strong style={{color:c||'#111'}}>{v}</strong>
    </div>
  );
  const Box=({children}:any)=>(
    <div style={{background:bg,borderRadius:12,padding:'12px 14px',marginBottom:12}}>{children}</div>
  );
  const Banner=({emoji,text,sub,color}:{emoji:string;text:string;sub?:string;color:string})=>(
    <div style={{background:color+'18',border:`1.5px solid ${color}44`,borderRadius:10,padding:'10px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
      <span style={{fontSize:22}}>{emoji}</span>
      <div><div style={{fontWeight:800,fontSize:14,color}}>{text}</div>{sub&&<div style={{fontSize:11,color:'#6b7280'}}>{sub}</div>}</div>
    </div>
  );

  const body=()=>{
    switch(tile.type){

      // ── GO ──────────────────────────────────────────────────────────────────
      case 'start':
        return(<>
          {lapBonus!==null&&<Banner emoji="🎉" text={`Collected ₹${lapBonus} salary!`} sub="You passed GO — payday!" color="#16a34a"/>}
          <p style={P}>Every time you pass or land on GO you collect your salary. Keep lapping to grow your wealth!</p>
          <Box><div style={{textAlign:'center',fontSize:22,fontWeight:900,color:ac}}>+₹{GO_SALARY} every lap 🏁</div></Box>
          <Btn onClick={onClose} color={ac}>Nice! Keep rolling →</Btn>
        </>);

      // ── SAVE ────────────────────────────────────────────────────────────────
      case 'save':
        return(<>
          <p style={P}>Deposit ₹50 into savings. Banks keep your money safe and growing!</p>
          <Box><Info l="Wallet" v={`₹${coins}`}/><Info l="Savings" v={`₹${savings}`}/></Box>
          <Btn onClick={()=>{if(coins>=50){setCoins(coins-50);setSavings(savings+50);}onClose();}} disabled={coins<50} color={ac}>
            {coins>=50?'Deposit ₹50 🏦':'Not Enough Coins'}
          </Btn>
        </>);

      // ── INTEREST ────────────────────────────────────────────────────────────
      case 'interest':{
        const b=Math.floor(savings*0.1);
        return(<>
          <p style={P}>Your savings earned 10% interest — this is how money grows while you sleep!</p>
          <Box>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:32,fontWeight:900,color:ac}}>+₹{b}</div>
              <div style={{fontSize:12,color:'#6b7280'}}>10% on ₹{savings} saved</div>
            </div>
          </Box>
          {b===0&&<p style={{...P,color:'#dc2626',fontSize:12}}>⚠️ No savings yet — deposit first to earn interest!</p>}
          <Btn onClick={()=>{setSavings(savings+b);onClose();}} color={ac} disabled={b===0}>
            {b>0?'Collect Interest 💰':'Nothing to collect'}
          </Btn>
        </>);
      }

      // ── SCAM ────────────────────────────────────────────────────────────────
      case 'scam':
        return(<>
          <p style={P}>A stranger called asking for your OTP and bank details. What do you do?</p>
          <Box><div style={{fontSize:13,color:'#6b7280',lineHeight:1.7}}>⚠️ Share details → Lose ₹100<br/>✅ Ignore &amp; report → Earn ₹50 reward</div></Box>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={()=>{setCoins(Math.max(0,coins-100));onClose();}} color="#dc2626">
              Share Details<br/><span style={{fontSize:11,fontWeight:500}}>-₹100 😱</span>
            </Btn>
            <Btn onClick={()=>{setCoins(coins+50);onClose();}} color="#16a34a">
              Ignore &amp; Report<br/><span style={{fontSize:11,fontWeight:500}}>+₹50 ✅</span>
            </Btn>
          </div>
        </>);

      // ── BUDGET ──────────────────────────────────────────────────────────────
      case 'budget':
        return(<>
          <p style={P}>Time to make a smart money choice — <strong>Need</strong> vs <strong>Want</strong>!</p>
          <Box><Info l="Your Wallet" v={`₹${coins}`}/></Box>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={()=>{if(coins>=100)setCoins(coins-100);onClose();}} disabled={coins<100} color="#ea580c">
              🚲 Buy Toy<br/><span style={{fontSize:11,fontWeight:500}}>-₹100 (Want)</span>
            </Btn>
            <Btn onClick={()=>{setSavings(savings+50);onClose();}} color="#7c3aed">
              📚 School Fund<br/><span style={{fontSize:11,fontWeight:500}}>+₹50 Saved ✅</span>
            </Btn>
          </div>
        </>);

      // ── PROPERTY ────────────────────────────────────────────────────────────
      case 'property':
        // Already owned by YOU — just show info
        if(isOwned){
          return(<>
            <Banner emoji="🏠" text="You own this property!" sub={`Rent ₹${tile.rent} charged to others`} color="#ea580c"/>
            <p style={P}>This is your property — <strong>{tile.label}</strong>. Other players pay you ₹{tile.rent} rent when they land here.</p>
            <Box>
              <Info l="Property value" v={`₹${tile.price}`}/>
              <Info l="Rent earned per visit" v={`₹${tile.rent}`} c="#16a34a"/>
            </Box>
            <Btn onClick={onClose} color={ac}>Nice! 🏠</Btn>
          </>);
        }
        // You land here and rent is due — would be opponent in multiplayer, but for solo we skip rent
        return(<>
          <p style={P}>A property is available — buy it to earn rent every time you land here again!</p>
          <Box>
            <Info l="Property" v={tile.label}/>
            <Info l="Price" v={`₹${tile.price}`}/>
            <Info l="Rent (per visit)" v={`₹${tile.rent}`} c="#16a34a"/>
            <Info l="Your wallet" v={`₹${coins}`}/>
            {loanActive&&<div style={{fontSize:11,color:'#dc2626',marginTop:6}}>⚠️ Active loan: ₹{loanRemaining} remaining</div>}
          </Box>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={()=>{
              if(coins>=tile.price){
                setCoins(coins-tile.price);
                setOwnedTiles([...ownedTiles, tile.id]);
              }
              onClose();
            }} disabled={coins<tile.price} color="#ea580c">
              🏠 Buy Now<br/><span style={{fontSize:11,fontWeight:500}}>-₹{tile.price}</span>
            </Btn>
            <Btn onClick={()=>{
              if(!loanActive){
                setCoins(coins+LOAN_AMOUNT);
                setLoanActive(true);
                setLoanRemaining(LOAN_REPAY);
              }
              onClose();
            }} disabled={loanActive} color="#db2777">
              🏦 Take Loan<br/><span style={{fontSize:11,fontWeight:500}}>+₹{LOAN_AMOUNT} (repay ₹{LOAN_REPAY})</span>
            </Btn>
          </div>
          <button onClick={onClose} style={{width:'100%',marginTop:8,padding:'10px',borderRadius:12,border:'none',cursor:'pointer',background:'#f3f4f6',color:'#9ca3af',fontWeight:700,fontSize:13}}>
            Skip — don't buy
          </button>
        </>);

      // ── LOAN ────────────────────────────────────────────────────────────────
      case 'loan':
        return(<>
          <p style={P}>You can borrow ₹{LOAN_AMOUNT} now, but you'll repay ₹{LOAN_REPAY} next lap. Loans always cost more!</p>
          <Box>
            <Info l="Borrow now" v={`+₹${LOAN_AMOUNT}`} c="#2563eb"/>
            <Info l="Repay next lap" v={`₹${LOAN_REPAY}`} c="#dc2626"/>
            <Info l="Interest cost" v={`₹${LOAN_REPAY-LOAN_AMOUNT}`} c="#dc2626"/>
            {loanActive&&<div style={{marginTop:6,fontSize:12,color:'#dc2626',fontWeight:700}}>⚠️ You already have an active loan of ₹{loanRemaining}</div>}
          </Box>
          <Btn onClick={()=>{
            if(!loanActive){setCoins(coins+LOAN_AMOUNT);setLoanActive(true);setLoanRemaining(LOAN_REPAY);}
            onClose();
          }} disabled={loanActive} color={ac}>
            {loanActive?'Loan Already Active 🚫':'Take Loan 💳'}
          </Btn>
        </>);

      // ── FREE / NORMAL ────────────────────────────────────────────────────────
      default:
        return(<>
          <p style={P}>Free space — take a breath! No penalties, no costs. Keep rolling!</p>
          <Box><div style={{textAlign:'center',fontSize:32}}>🌟</div></Box>
          <Btn onClick={onClose} color={ac}>Keep Going →</Btn>
        </>);
    }
  };

  return(
    <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center',animation:'fi 0.2s ease'}} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{width:'100%',maxWidth:440,background:'white',borderRadius:'24px 24px 0 0',padding:'0 20px 32px',animation:'su 0.3s cubic-bezier(0.34,1.56,0.64,1)',maxHeight:'82vh',overflowY:'auto'}}>
        <div style={{width:40,height:4,background:'#e5e7eb',borderRadius:2,margin:'10px auto 16px'}}/>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
          <div style={{width:50,height:50,borderRadius:16,background:ac,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 6px 20px ${ac}55`,flexShrink:0}}>{tile.icon}</div>
          <div>
            <div style={{fontWeight:900,fontSize:20,color:'#111',fontFamily:'Georgia,serif'}}>{tile.label}</div>
            <div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>
              Tile #{tile.id+1} · Bankopoly
              {tile.type==='property'&&isOwned&&' · 🌟 OWNED'}
            </div>
          </div>
        </div>
        {/* Rent paid notice */}
        {rentPaid!==null&&rentPaid>0&&(
          <div style={{background:'#fee2e2',border:'1.5px solid #fca5a5',borderRadius:10,padding:'10px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:20}}>💸</span>
            <div><div style={{fontWeight:800,fontSize:14,color:'#dc2626'}}>Rent paid: ₹{rentPaid}</div><div style={{fontSize:11,color:'#6b7280'}}>This property is owned — you owe rent</div></div>
          </div>
        )}
        {body()}
        <button onClick={onClose} style={{width:'100%',marginTop:10,padding:13,borderRadius:12,border:'none',cursor:'pointer',background:'#f3f4f6',color:'#9ca3af',fontWeight:700,fontSize:13}}>Continue</button>
      </div>
    </div>
  );
}

// ─── MAIN GAME ───────────────────────────────────────────────────────────────
export default function BoardGame() {
  const [coins,setCoins]                = useState(300);           // start with 300
  const [savings,setSavings]            = useState(0);
  const [loanActive,setLoanActive]      = useState(false);
  const [loanRemaining,setLoanRemaining]= useState(0);
  const [ownedTiles,setOwnedTiles]      = useState<number[]>([]);  // tile IDs owned
  const [pos,setPos]                    = useState(0);
  const [diceVal,setDiceVal]            = useState(1);
  const [rolling,setRolling]            = useState(false);
  const [modal,setModal]                = useState<Tile|null>(null);
  const [lapBonus,setLapBonus]          = useState<number|null>(null);  // salary collected this turn
  const [rentPaid,setRentPaid]          = useState<number|null>(null);  // rent paid this turn

  const roll=()=>{
    if(rolling||modal) return;
    setRolling(true);
    setLapBonus(null);
    setRentPaid(null);

    setTimeout(()=>{
      const r   = Math.floor(Math.random()*6)+1;
      setDiceVal(r);
      const cur = pos;
      const next= (cur+r)%20;
      const passedGo = next < cur || (cur===0 && r>0);   // wrapped around or started on GO

      let newCoins = coins;

      // ── Passed / landed on GO → collect salary ──────────────────────────
      if(passedGo || next===0){
        newCoins += GO_SALARY;
        setLapBonus(GO_SALARY);
      }

      // ── Loan repayment on lap completion ────────────────────────────────
      if(passedGo && loanActive){
        const repay = Math.min(newCoins, loanRemaining);
        newCoins   -= repay;
        const rem   = loanRemaining - repay;
        setLoanRemaining(rem);
        if(rem<=0) setLoanActive(false);
        else       setLoanRemaining(rem);
      }

      // ── Rent: if landing on a property owned by player → collect rent ───
      // (In solo play, owning your own property earns rent on re-visit)
      const landedTile = TILES[next];
      let rent = 0;
      if(landedTile.type==='property' && ownedTiles.includes(next)){
        rent      = landedTile.rent;
        newCoins += rent;   // solo: you collect your own rent (reward for owning)
        setRentPaid(rent);
      }

      setCoins(newCoins);
      setPos(next);
      setTimeout(()=>{
        setRolling(false);
        setModal(TILES[next]);
      },900);
    },450);
  };

  const CORN=75, CELL=75, N=5;
  const BS=CORN*2+CELL*N; // 525px

  const propCount  = ownedTiles.length;
  const propValue  = ownedTiles.reduce((sum,id)=>sum+TILES[id].price,0);
  const netWorth   = coins + savings + propValue - loanRemaining;

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',display:'flex',flexDirection:'column',background:'#1a2d1f',fontFamily:'system-ui,sans-serif',position:'relative'}}>
      <Town3D />

      {/* ── HUD ─────────────────────────────────────────────────────────── */}
      <div style={{flexShrink:0,display:'flex',alignItems:'center',padding:'9px 14px',gap:8,background:'#0f1a14',borderBottom:'1px solid rgba(255,255,255,0.1)',position:'relative',zIndex:10,flexWrap:'wrap'}}>
        {/* Avatar */}
        <div style={{width:38,height:38,borderRadius:'50%',flexShrink:0,background:'#2563eb',border:'2.5px solid rgba(255,255,255,0.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🐠</div>

        {/* Coins */}
        <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:30,padding:'4px 11px'}}>
          <span style={{fontSize:14}}>💵</span>
          <span style={{fontWeight:800,fontSize:15,color:'white'}}>₹{coins.toLocaleString()}</span>
        </div>

        {/* Savings */}
        {savings>0&&(
          <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(22,163,74,0.15)',border:'1px solid rgba(22,163,74,0.25)',borderRadius:30,padding:'4px 10px'}}>
            <span style={{fontSize:12}}>🏦</span>
            <span style={{fontWeight:700,fontSize:12,color:'#86efac'}}>₹{savings}</span>
          </div>
        )}

        {/* Properties owned */}
        {propCount>0&&(
          <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(234,88,12,0.15)',border:'1px solid rgba(234,88,12,0.3)',borderRadius:30,padding:'4px 10px'}}>
            <span style={{fontSize:12}}>🏠</span>
            <span style={{fontWeight:700,fontSize:12,color:'#fdba74'}}>{propCount} {propCount===1?'property':'properties'}</span>
          </div>
        )}

        {/* Net worth */}
        <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(251,191,36,0.12)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:30,padding:'4px 10px'}}>
          <span style={{fontSize:11}}>📊</span>
          <span style={{fontWeight:700,fontSize:11,color:'#fde68a'}}>NW ₹{netWorth.toLocaleString()}</span>
        </div>

        <div style={{marginLeft:'auto',display:'flex',gap:7,alignItems:'center'}}>
          {loanActive&&(
            <div style={{background:'rgba(220,38,38,0.18)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:20,padding:'4px 9px',fontSize:11,fontWeight:700,color:'#fca5a5'}}>⚠️ Loan ₹{loanRemaining}</div>
          )}
          <div style={{background:'rgba(255,255,255,0.09)',borderRadius:20,padding:'4px 9px',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)'}}>{pos+1}/20</div>
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'flex-start',gap:24,padding:'0 24px',overflow:'hidden',position:'relative',zIndex:1}}>

        {/* BOARD */}
        <div style={{perspective:980,perspectiveOrigin:'50% 42%',flexShrink:0,marginLeft:"30%",marginRight:'auto',marginTop:'-100px'}}>
          <div style={{width:BS,height:BS,transform:'rotateX(50deg) rotateZ(-42deg)',transformStyle:'preserve-3d',transformOrigin:'center center',filter:'drop-shadow(0 22px 32px rgba(0,0,0,0.75)) drop-shadow(0 6px 10px rgba(0,0,0,0.5))',animation:'float 5s ease-in-out infinite'}}>
            <div style={{position:'relative',width:BS,height:BS,background:'white',borderRadius:12,outline:'4px solid #8b7355',boxShadow:'0 0 0 8px #b8956a, 0 0 0 12px #1a2d1f, 0 20px 50px rgba(0,0,0,0.8)'}}>

              {/* felt */}
              <div style={{position:'absolute',top:CORN,left:CORN,width:BS-CORN*2,height:BS-CORN*2,background:'#22c55e',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'inset 0 2px 8px rgba(0,0,0,0.15)'}}>
                <div style={{fontFamily:'Georgia,serif',fontWeight:900,fontSize:16,color:'white',textShadow:'2px 3px 12px rgba(0,0,0,0.5)',letterSpacing:2,textAlign:'center',lineHeight:1.2}}>🏦<br/>BANKOPOLY</div>
                {/* Dice */}
                <div style={{width:80,height:80,borderRadius:13,background:'#4c1d95',overflow:'hidden',cursor:'pointer',boxShadow:rolling?'0 0 28px rgba(167,139,250,0.85),0 6px 20px rgba(0,0,0,0.5)':'0 6px 20px rgba(0,0,0,0.5)',transition:'box-shadow 0.3s',flexShrink:0}} onClick={roll}>
                  <Canvas camera={{position:[0,2.5,4.5],fov:32}} shadows>
                    <color attach="background" args={['#3b0764']}/>
                    <ambientLight intensity={0.65}/>
                    <directionalLight position={[4,5,4]} intensity={1.3} castShadow/>
                    <pointLight position={[-3,2,-2]} intensity={0.3} color="#fbbf24"/>
                    <DiceMesh rolling={rolling} value={diceVal}/>
                  </Canvas>
                </div>
                {!rolling&&(
                  <div style={{width:26,height:26,borderRadius:'50%',background:'#fbbf24',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:13,color:'#1f2937',boxShadow:'0 3px 10px rgba(251,191,36,0.5),0 0 0 3px white'}}>{diceVal}</div>
                )}
                {/* Mini property list on board */}
                {propCount>0&&(
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.85)',fontWeight:700,textAlign:'center',lineHeight:1.6}}>
                    {ownedTiles.map(id=><div key={id}>🏠 {TILES[id].label}</div>)}
                  </div>
                )}
              </div>

              {/* TOP */}
              <div style={{position:'absolute',top:0,left:CORN,width:BS-CORN*2,height:CORN,display:'grid',gridTemplateColumns:`repeat(${N},1fr)`,gap:3,padding:3,boxSizing:'border-box'}}>
                {TOP.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="top"/>)}
              </div>
              {/* BOTTOM */}
              <div style={{position:'absolute',bottom:0,left:CORN,width:BS-CORN*2,height:CORN,display:'grid',gridTemplateColumns:`repeat(${N},1fr)`,gap:3,padding:3,boxSizing:'border-box'}}>
                {BOT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="bottom"/>)}
              </div>
              {/* RIGHT */}
              <div style={{position:'absolute',right:0,top:CORN,width:CORN,height:BS-CORN*2,display:'grid',gridTemplateRows:`repeat(${N},1fr)`,gap:3,padding:3,boxSizing:'border-box'}}>
                {RIGHT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="right"/>)}
              </div>
              {/* LEFT */}
              <div style={{position:'absolute',left:0,top:CORN,width:CORN,height:BS-CORN*2,display:'grid',gridTemplateRows:`repeat(${N},1fr)`,gap:3,padding:3,boxSizing:'border-box'}}>
                {LEFT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} owned={ownedTiles.includes(id)} side="left"/>)}
              </div>

              {/* CORNERS */}
              <div style={{position:'absolute',top:0,left:0,width:CORN,height:CORN,padding:3,boxSizing:'border-box'}}><Corner icon="🎲" top="FREE" bg="#fefce8" border="#a16207"/></div>
              <div style={{position:'absolute',top:0,right:0,width:CORN,height:CORN,padding:3,boxSizing:'border-box'}}><Corner icon="❓" top="CHANCE" bg="#eff6ff" border="#1d4ed8"/></div>
              <div style={{position:'absolute',bottom:0,left:0,width:CORN,height:CORN,padding:3,boxSizing:'border-box'}}><Corner icon="🏁" top="COLLECT" bot="← GO" bg="#f0fdf4" border="#15803d"/></div>
              <div style={{position:'absolute',bottom:0,right:0,width:CORN,height:CORN,padding:3,boxSizing:'border-box'}}><Corner icon="🚔" top="JAIL" bg="#fef2f2" border="#b91c1c"/></div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,flexShrink:0}}>
          {/* ROLL BUTTON */}
          <button onClick={roll} disabled={rolling||!!modal} style={{width:120,height:120,borderRadius:'50%',background:rolling||modal?'#6b7280':'#dc2626',border:'5px solid #fff',boxShadow:rolling||modal?'0 6px 0 #1f2937':'0 10px 0 #7f1d1d,0 4px 0 rgba(0,0,0,0.3),0 14px 36px rgba(220,38,38,0.7)',cursor:rolling||modal?'not-allowed':'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transform:rolling?'translateY(6px)':'translateY(0)',transition:'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',outline:'none',position:'relative',overflow:'hidden'}}>
            {!rolling&&<div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18), transparent 65%)',pointerEvents:'none'}}/>}
            <span style={{fontSize:34,fontWeight:900,color:'white',textShadow:'0 3px 8px rgba(0,0,0,0.6)',fontFamily:'Georgia,serif',lineHeight:1,position:'relative',zIndex:1}}>{rolling?'🎲':'GO'}</span>
            {!rolling&&<span style={{fontSize:14,color:'white',fontWeight:800,position:'relative',zIndex:1,marginTop:2}}>ROLL</span>}
          </button>

          {/* Stat cards */}
          {[
            {icon:'💵',label:'WALLET',   val:`₹${coins}`,   color:'#fbbf24'},
            {icon:'🏦',label:'SAVINGS',  val:`₹${savings}`, color:'#34d399'},
            {icon:'🏠',label:'PROPERTIES',val:`${propCount} owned`,color:'#fb923c'},
            {icon:'📊',label:'NET WORTH', val:`₹${netWorth}`,color:'#a78bfa'},
          ].map(s=>(
            <div key={s.label} style={{background:'rgba(255,255,255,0.11)',border:'2px solid rgba(255,255,255,0.2)',borderRadius:16,padding:'11px 14px',textAlign:'center',width:'100%',minWidth:122,backdropFilter:'blur(12px)',boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
              <div style={{fontSize:18}}>{s.icon}</div>
              <div style={{fontSize:14,fontWeight:900,color:s.color,lineHeight:1.2,marginTop:2}}>{s.val}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.6)',fontWeight:700,marginTop:3,letterSpacing:'0.5px',textTransform:'uppercase'}}>{s.label}</div>
            </div>
          ))}

          {/* Progress ring */}
          <div style={{textAlign:'center',position:'relative',width:70,height:70}}>
            <svg width="70" height="70" style={{transform:'rotate(-90deg)',position:'absolute',top:0,left:0}}>
              <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
              <circle cx="35" cy="35" r="28" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*28}`}
                strokeDashoffset={`${2*Math.PI*28*(1-(pos+1)/20)}`}
                style={{transition:'stroke-dashoffset 0.5s ease'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:14,fontWeight:900,color:'white',lineHeight:1}}>{pos+1}</span>
              <span style={{fontSize:8,color:'rgba(255,255,255,0.5)',fontWeight:600,lineHeight:1}}>/20</span>
            </div>
          </div>
        </div>

        {/* MODAL */}
        {modal&&(
          <Modal
            tile={modal}
            coins={coins}
            savings={savings}
            loanActive={loanActive}
            loanRemaining={loanRemaining}
            ownedTiles={ownedTiles}
            lapBonus={lapBonus}
            rentPaid={rentPaid}
            setCoins={setCoins}
            setSavings={setSavings}
            setLoanActive={setLoanActive}
            setLoanRemaining={setLoanRemaining}
            setOwnedTiles={setOwnedTiles}
            onClose={()=>setModal(null)}
          />
        )}
      </div>{/* end MAIN */}

      <style>{`
        @keyframes fi       { from{opacity:0} to{opacity:1} }
        @keyframes su       { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes bob      { from{transform:translateY(0)} to{transform:translateY(-6px)} }
        @keyframes float    { 0%,100%{transform:rotateX(50deg) rotateZ(-42deg) translateZ(0)}
                              50%    {transform:rotateX(50deg) rotateZ(-42deg) translateZ(8px)} }
        @keyframes pinPulse { 0%,100%{transform:translateY(0) scale(1)}
                              50%    {transform:translateY(-4px) scale(1.08)} }
      `}</style>
    </div>
  );
}