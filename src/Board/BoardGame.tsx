'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

type TileType = 'start'|'save'|'interest'|'scam'|'budget'|'property'|'loan'|'normal';
interface Tile { id:number; type:TileType; label:string; icon:string; }

const TILES: Tile[] = [
  {id:0,  type:'start',    label:'GO',      icon:'🏁'},
  {id:1,  type:'save',     label:'SAVE',    icon:'🏦'},
  {id:2,  type:'normal',   label:'PASS',    icon:'⭐'},
  {id:3,  type:'interest', label:'EARN',    icon:'💰'},
  {id:4,  type:'scam',     label:'SCAM',    icon:'⚠️'},
  {id:5,  type:'budget',   label:'BUDGET',  icon:'📚'},
  {id:6,  type:'property', label:'HOUSE',   icon:'🏠'},
  {id:7,  type:'loan',     label:'LOAN',    icon:'📋'},
  {id:8,  type:'normal',   label:'PASS',    icon:'⭐'},
  {id:9,  type:'interest', label:'EARN',    icon:'💰'},
  {id:10, type:'save',     label:'SAVE',    icon:'🏦'},
  {id:11, type:'normal',   label:'PASS',    icon:'⭐'},
  {id:12, type:'scam',     label:'SCAM',    icon:'⚠️'},
  {id:13, type:'budget',   label:'BUDGET',  icon:'📚'},
  {id:14, type:'normal',   label:'PASS',    icon:'⭐'},
  {id:15, type:'property', label:'HOUSE',   icon:'🏠'},
  {id:16, type:'loan',     label:'LOAN',    icon:'📋'},
  {id:17, type:'scam',     label:'SCAM',    icon:'⚠️'},
  {id:18, type:'interest', label:'EARN',    icon:'💰'},
  {id:19, type:'save',     label:'SAVE',    icon:'🏦'},
  {id:20, type:'normal',   label:'PASS',    icon:'⭐'},
  {id:21, type:'budget',   label:'BUDGET',  icon:'📚'},
  {id:22, type:'property', label:'HOUSE',   icon:'🏠'},
  {id:23, type:'normal',   label:'PASS',    icon:'⭐'},
];

const TOP   = [0,1,2,3,4,5];
const RIGHT = [6,7,8,9,10,11];
const BOT   = [17,16,15,14,13,12];
const LEFT  = [23,22,21,20,19,18];

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

function DiceMesh({ rolling, value }:{ rolling:boolean; value:number }) {
  const ref = useRef<THREE.Group>(null);
  const tgt = useRef(new THREE.Euler());
  const t   = useRef(0);
  useEffect(()=>{
    const m:Record<number,[number,number,number]> = {
      1:[0,0,0], 2:[0,Math.PI/2,0], 3:[-Math.PI/2,0,0],
      4:[Math.PI/2,0,0], 5:[0,-Math.PI/2,0], 6:[0,Math.PI,0],
    };
    const [x,y,z]=m[value]??[0,0,0]; tgt.current.set(x,y,z);
  },[value]);
  useFrame((_,dt)=>{
    if(!ref.current) return; t.current+=dt;
    if(rolling){ ref.current.rotation.x+=dt*20; ref.current.rotation.y+=dt*25; ref.current.position.y=Math.abs(Math.sin(t.current*14))*0.5; }
    else{ ref.current.rotation.x+=(tgt.current.x-ref.current.rotation.x)*0.15; ref.current.rotation.y+=(tgt.current.y-ref.current.rotation.y)*0.15; ref.current.rotation.z+=(tgt.current.z-ref.current.rotation.z)*0.15; ref.current.position.y+=(0-ref.current.position.y)*0.15; }
  });
  const dot=(p:[number,number,number])=>(<mesh key={p.join()} position={p}><sphereGeometry args={[0.14,12,12]}/><meshStandardMaterial color="#111" roughness={0.3}/></mesh>);
  const d=0.44,f=0.93;
  return (<group ref={ref}><RoundedBox args={[1.85,1.85,1.85]} radius={0.16} smoothness={4} castShadow><meshStandardMaterial color="#fff" roughness={0.18} metalness={0.07}/></RoundedBox>{dot([0,0,f])}{dot([f,d,-d])}{dot([f,-d,d])}{dot([-d,f,d])}{dot([0,f,0])}{dot([d,f,-d])}{dot([-d,-f,-d])}{dot([d,-f,-d])}{dot([-d,-f,d])}{dot([d,-f,d])}{dot([-f,d,d])}{dot([-f,-d,d])}{dot([-f,0,0])}{dot([-f,d,-d])}{dot([-f,-d,-d])}{dot([-d,d,-f])}{dot([d,d,-f])}{dot([-d,0,-f])}{dot([d,0,-f])}{dot([-d,-d,-f])}{dot([d,-d,-f])}</group>);
}

function BTile({ tile, active, side }:{ tile:Tile; active:boolean; side:'top'|'bottom'|'left'|'right' }) {
  const ac=ACCENT[tile.type]; const bg=active?'#fffbeb':FILL[tile.type];
  const isH=side==='top'||side==='bottom';
  const strip: React.CSSProperties = side==='top'?{top:0,left:0,right:0,height:8,borderRadius:'5px 5px 0 0'}:side==='bottom'?{bottom:0,left:0,right:0,height:8,borderRadius:'0 0 5px 5px'}:side==='left'?{left:0,top:0,bottom:0,width:8,borderRadius:'5px 0 0 5px'}:{right:0,top:0,bottom:0,width:8,borderRadius:'0 5px 5px 0'};
  const pad=side==='top'?'11px 3px 3px':side==='bottom'?'3px 3px 11px':side==='left'?'3px 3px 3px 11px':'3px 11px 3px 3px';
  return (
    <div style={{width:'100%',height:'100%',background:bg,border:`2px solid ${active?'#f59e0b':'#e2e8f0'}`,borderRadius:6,boxShadow:active?`0 0 0 2px #f59e0b`:'none',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxSizing:'border-box'}}>
      <div style={{position:'absolute',background:ac,...strip}}/>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,padding:pad,width:'100%',height:'100%',boxSizing:'border-box',writingMode:isH?'horizontal-tb':'vertical-rl',transform:side==='left'?'rotate(180deg)':'none'}}>
        <span style={{fontSize:isH?18:14,lineHeight:1}}>{tile.icon}</span>
        <span style={{fontSize:7,fontWeight:800,color:ac,letterSpacing:'0.3px',textAlign:'center',fontFamily:'system-ui,sans-serif',lineHeight:1.1}}>{tile.label}</span>
        <span style={{fontSize:6,color:'#d1d5db',fontFamily:'monospace'}}>#{tile.id+1}</span>
      </div>
      {active&&(
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:20,pointerEvents:'none',background:'rgba(255,251,235,0.45)'}}>
          <div style={{animation:'bob 0.65s ease-in-out infinite alternate',filter:'drop-shadow(0 3px 8px rgba(0,0,0,0.5))'}}>
            <svg width="18" height="26" viewBox="0 0 22 30" fill="none">
              <ellipse cx="11" cy="28" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
              <path d="M11 1C6.5 1 3 4.8 3 9.5C3 15.5 8 21 11 24.5C14 21 19 15.5 19 9.5C19 4.8 15.5 1 11 1Z" fill="#ef4444"/>
              <circle cx="11" cy="9.5" r="4.5" fill="white" opacity="0.95"/>
              <circle cx="11" cy="9.5" r="2.8" fill="#ef4444"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function Corner({ icon,top,bot,bg,border }:{ icon:string;top:string;bot?:string;bg:string;border:string }) {
  return (
    <div style={{width:'100%',height:'100%',background:bg,border:`2px solid ${border}`,borderRadius:6,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,boxSizing:'border-box'}}>
      <span style={{fontSize:16}}>{icon}</span>
      <span style={{fontSize:7,fontWeight:900,color:border,textAlign:'center',fontFamily:'system-ui,sans-serif',lineHeight:1.3}}>{top}</span>
      {bot&&<span style={{fontSize:8,fontWeight:900,color:border,fontFamily:'Georgia,serif'}}>{bot}</span>}
    </div>
  );
}

function Modal({ tile,coins,savings,loanActive,loanRemaining,setCoins,setSavings,setLoanActive,setLoanRemaining,onClose }:any) {
  const ac=ACCENT[tile.type as TileType]; const bg=FILL[tile.type as TileType];
  const Btn=({onClick,disabled,color,children}:any)=>(<button onClick={onClick} disabled={disabled} style={{flex:1,padding:'14px 10px',borderRadius:14,border:'none',cursor:disabled?'not-allowed':'pointer',background:disabled?'#e5e7eb':color,color:disabled?'#9ca3af':'white',fontWeight:800,fontSize:14,lineHeight:1.3,boxShadow:disabled?'none':`0 4px 0 rgba(0,0,0,0.2)`,fontFamily:'system-ui,sans-serif'}}>{children}</button>);
  const Info=({l,v,c}:{l:string;v:string;c?:string})=>(<div style={{display:'flex',justifyContent:'space-between',fontSize:14,padding:'3px 0'}}><span style={{color:'#6b7280'}}>{l}</span><strong style={{color:c||'#111'}}>{v}</strong></div>);
  const Box=({children}:any)=>(<div style={{background:bg,borderRadius:12,padding:'12px 14px',marginBottom:12}}>{children}</div>);
  const body=()=>{
    switch(tile.type as TileType){
      case 'start':return(<><p style={P}>You landed on GO! Collect your salary and keep growing your wealth!</p><Box><div style={{textAlign:'center',fontSize:24,fontWeight:900,color:ac}}>+₹200 Collected! 🎉</div></Box><Btn onClick={onClose} color={ac}>Collect & Continue!</Btn></>);
      case 'save':return(<><p style={P}>Deposit ₹50 into savings. Banks keep your money safe and growing!</p><Box><Info l="Wallet" v={`₹${coins}`}/><Info l="Savings" v={`₹${savings}`}/></Box><Btn onClick={()=>{if(coins>=50){setCoins(coins-50);setSavings(savings+50);}onClose();}} disabled={coins<50} color={ac}>{coins>=50?'Deposit ₹50 🏦':'Not Enough Coins'}</Btn></>);
      case 'interest':{const b=Math.floor(savings*0.1);return(<><p style={P}>Your savings earned 10% interest — this is how money grows!</p><Box><div style={{textAlign:'center'}}><div style={{fontSize:32,fontWeight:900,color:ac}}>+₹{b}</div><div style={{fontSize:12,color:'#6b7280'}}>10% on ₹{savings} saved</div></div></Box><Btn onClick={()=>{setSavings(savings+b);onClose();}} color={ac}>Collect Interest 💰</Btn></>);}
      case 'scam':return(<><p style={P}>Someone asked for your OTP! Choose wisely — scammers steal your money!</p><Box><div style={{fontSize:13,color:'#6b7280',lineHeight:1.7}}>⚠️ Share OTP → Lose ₹100<br/>✅ Ignore → Earn ₹50</div></Box><div style={{display:'flex',gap:10}}><Btn onClick={()=>{setCoins(Math.max(0,coins-100));onClose();}} color="#dc2626">Share OTP<br/><span style={{fontSize:11,fontWeight:500}}>-₹100 😱</span></Btn><Btn onClick={()=>{setCoins(coins+50);onClose();}} color="#16a34a">Ignore Scam<br/><span style={{fontSize:11,fontWeight:500}}>+₹50 ✅</span></Btn></div></>);
      case 'budget':return(<><p style={P}>Need vs Want — make the smart money decision!</p><Box><Info l="Your Wallet" v={`₹${coins}`}/></Box><div style={{display:'flex',gap:10}}><Btn onClick={()=>{if(coins>=100)setCoins(coins-100);onClose();}} disabled={coins<100} color="#ea580c">🚲 Buy Toy<br/><span style={{fontSize:11,fontWeight:500}}>-₹100 (Want)</span></Btn><Btn onClick={()=>{setSavings(savings+50);onClose();}} color="#7c3aed">📚 School Fund<br/><span style={{fontSize:11,fontWeight:500}}>+₹50 Saved</span></Btn></div></>);
      case 'property':return(<><p style={P}>A property for ₹150! Buy outright or take a loan.</p><Box><Info l="Cost" v="₹150"/><Info l="Wallet" v={`₹${coins}`}/>{loanActive&&<div style={{fontSize:11,color:'#dc2626',marginTop:6}}>⚠️ Loan already active</div>}</Box><div style={{display:'flex',gap:10}}><Btn onClick={()=>{if(coins>=150)setCoins(coins-150);onClose();}} disabled={coins<150} color="#ea580c">🏠 Buy Now<br/><span style={{fontSize:11,fontWeight:500}}>-₹150</span></Btn><Btn onClick={()=>{if(!loanActive){setCoins(coins+100);setLoanActive(true);setLoanRemaining(120);}onClose();}} disabled={loanActive} color="#db2777">💳 Take Loan<br/><span style={{fontSize:11,fontWeight:500}}>+₹100</span></Btn></div></>);
      case 'loan':return(<><p style={P}>Borrow ₹100 now, repay ₹120 later. Loans always cost more!</p><Box><Info l="You Borrow" v="+₹100" c="#2563eb"/><Info l="You Repay" v="₹120" c="#dc2626"/></Box><Btn onClick={()=>{if(!loanActive){setCoins(coins+100);setLoanActive(true);setLoanRemaining(120);}onClose();}} disabled={loanActive} color={ac}>{loanActive?'Loan Already Active':'Take Loan 💳'}</Btn></>);
      default:return(<><p style={P}>Nothing here — keep rolling and grow your wealth!</p><Box><div style={{textAlign:'center',fontSize:32}}>🌟</div></Box><Btn onClick={onClose} color={ac}>Keep Going →</Btn></>);
    }
  };
  return(
    <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center',animation:'fi 0.2s ease'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:440,background:'white',borderRadius:'24px 24px 0 0',padding:'0 20px 32px',animation:'su 0.3s cubic-bezier(0.34,1.56,0.64,1)',maxHeight:'80vh',overflowY:'auto'}}>
        <div style={{width:40,height:4,background:'#e5e7eb',borderRadius:2,margin:'10px auto 16px'}}/>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
          <div style={{width:50,height:50,borderRadius:16,background:ac,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 6px 20px ${ac}55`,flexShrink:0}}>{tile.icon}</div>
          <div><div style={{fontWeight:900,fontSize:20,color:'#111',fontFamily:'Georgia,serif'}}>{tile.label}</div><div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>Tile #{tile.id+1} · Bankopoly</div></div>
        </div>
        {body()}
        <button onClick={onClose} style={{width:'100%',marginTop:10,padding:13,borderRadius:12,border:'none',cursor:'pointer',background:'#f3f4f6',color:'#9ca3af',fontWeight:700,fontSize:13}}>Continue</button>
      </div>
    </div>
  );
}

const P:React.CSSProperties={color:'#4b5563',fontSize:14,lineHeight:1.65,textAlign:'center',margin:'0 0 12px',fontFamily:'system-ui,sans-serif'};

export default function BoardGame() {
  const [coins,setCoins]               = useState(200);
  const [savings,setSavings]           = useState(0);
  const [loanActive,setLoanActive]     = useState(false);
  const [loanRemaining,setLoanRemaining]= useState(0);
  const [pos,setPos]                   = useState(0);
  const [diceVal,setDiceVal]           = useState(1);
  const [rolling,setRolling]           = useState(false);
  const [modal,setModal]               = useState<Tile|null>(null);

  const roll=()=>{
    if(rolling||modal) return;
    setRolling(true);
    setTimeout(()=>{
      const r=Math.floor(Math.random()*6)+1; setDiceVal(r);
      const next=(pos+r)%24;
      if(next<pos&&loanActive){const rem=Math.max(0,loanRemaining-40);setLoanRemaining(rem);setCoins(c=>Math.max(0,c-40));if(rem<=0)setLoanActive(false);}
      setPos(next);
      setTimeout(()=>{setRolling(false);setModal(TILES[next]);},900);
    },450);
  };

  const CORN=62, CELL=54, N=6;
  const BS=CORN*2+CELL*N; // 124+324 = 448px

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',display:'flex',flexDirection:'column',background:'linear-gradient(145deg,#0f1f13 0%,#1a3320 50%,#0f1a0f 100%)',fontFamily:'system-ui,sans-serif',position:'relative'}}>
      {/* bg dots */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:'radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)',backgroundSize:'26px 26px'}}/>
      {/* center glow */}
      <div style={{position:'absolute',top:'45%',left:'45%',transform:'translate(-50%,-50%)',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 65%)',pointerEvents:'none'}}/>

      {/* HUD */}
      <div style={{flexShrink:0,display:'flex',alignItems:'center',padding:'9px 16px',gap:9,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'relative',zIndex:10}}>
        <div style={{width:40,height:40,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,#38bdf8,#2563eb)',border:'2.5px solid rgba(255,255,255,0.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>🐠</div>
        <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:30,padding:'5px 13px'}}>
          <span style={{fontSize:16}}>💵</span>
          <span style={{fontWeight:800,fontSize:17,color:'white'}}>{coins.toLocaleString()}</span>
        </div>
        {savings>0&&(<div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(22,163,74,0.15)',border:'1px solid rgba(22,163,74,0.25)',borderRadius:30,padding:'5px 11px'}}>
          <span style={{fontSize:12}}>🏦</span><span style={{fontWeight:700,fontSize:12,color:'#86efac'}}>₹{savings}</span>
        </div>)}
        <div style={{marginLeft:'auto',display:'flex',gap:7,alignItems:'center'}}>
          {loanActive&&(<div style={{background:'rgba(220,38,38,0.18)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:20,padding:'4px 9px',fontSize:11,fontWeight:700,color:'#fca5a5'}}>⚠️ ₹{loanRemaining}</div>)}
          <div style={{background:'rgba(255,255,255,0.09)',borderRadius:20,padding:'4px 9px',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)'}}>{pos+1}/24</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:22,padding:'12px 18px',overflow:'hidden',position:'relative',zIndex:1}}>

        {/* BOARD */}
        <div style={{perspective:980,perspectiveOrigin:'50% 42%',flexShrink:0}}>
          <div style={{width:BS,height:BS,transform:'rotateX(50deg) rotateZ(-42deg)',transformStyle:'preserve-3d',transformOrigin:'center center',filter:'drop-shadow(0 22px 32px rgba(0,0,0,0.75)) drop-shadow(0 6px 10px rgba(0,0,0,0.5))',animation:'float 5s ease-in-out infinite'}}>
            <div style={{position:'relative',width:BS,height:BS,background:'white',borderRadius:8,outline:'5px solid #7a6040',boxShadow:'0 0 0 9px #9a7d50'}}>

              {/* felt */}
              <div style={{position:'absolute',top:CORN,left:CORN,width:BS-CORN*2,height:BS-CORN*2,background:'linear-gradient(135deg,#4ade80 0%,#22c55e 55%,#15803d 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}>
                <div style={{fontFamily:'Georgia,serif',fontWeight:900,fontSize:15,color:'white',textShadow:'1px 2px 10px rgba(0,0,0,0.5)',letterSpacing:1.5,textAlign:'center',lineHeight:1.3}}>🏦<br/>BANKOPOLY</div>
                <div style={{width:82,height:82,borderRadius:13,background:'radial-gradient(circle at 30% 30%,#6d28d9,#2e1065)',overflow:'hidden',cursor:'pointer',boxShadow:rolling?'0 0 28px rgba(167,139,250,0.85),0 6px 20px rgba(0,0,0,0.5)':'0 6px 20px rgba(0,0,0,0.5)',transition:'box-shadow 0.3s',flexShrink:0}} onClick={roll}>
                  <Canvas camera={{position:[0,2.5,4.5],fov:32}} shadows>
                    <color attach="background" args={['#3b0764']}/><ambientLight intensity={0.65}/><directionalLight position={[4,5,4]} intensity={1.3} castShadow/><pointLight position={[-3,2,-2]} intensity={0.3} color="#fbbf24"/><DiceMesh rolling={rolling} value={diceVal}/>
                  </Canvas>
                </div>
                {!rolling&&(<div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#fbbf24,#f59e0b)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14,color:'white',boxShadow:'0 3px 10px rgba(251,191,36,0.5),0 0 0 3px white'}}>{diceVal}</div>)}
              </div>

              {/* TOP */}
              <div style={{position:'absolute',top:0,left:CORN,width:BS-CORN*2,height:CORN,display:'grid',gridTemplateColumns:`repeat(${N},1fr)`,gap:3,padding:3,boxSizing:'border-box'}}>
                {TOP.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} side="top"/>)}
              </div>
              {/* BOTTOM */}
              <div style={{position:'absolute',bottom:0,left:CORN,width:BS-CORN*2,height:CORN,display:'grid',gridTemplateColumns:`repeat(${N},1fr)`,gap:3,padding:3,boxSizing:'border-box'}}>
                {BOT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} side="bottom"/>)}
              </div>
              {/* RIGHT */}
              <div style={{position:'absolute',right:0,top:CORN,width:CORN,height:BS-CORN*2,display:'grid',gridTemplateRows:`repeat(${N},1fr)`,gap:3,padding:3,boxSizing:'border-box'}}>
                {RIGHT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} side="right"/>)}
              </div>
              {/* LEFT */}
              <div style={{position:'absolute',left:0,top:CORN,width:CORN,height:BS-CORN*2,display:'grid',gridTemplateRows:`repeat(${N},1fr)`,gap:3,padding:3,boxSizing:'border-box'}}>
                {LEFT.map(id=><BTile key={id} tile={TILES[id]} active={pos===id} side="left"/>)}
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
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18,flexShrink:0}}>
          {/* GO */}
          <button onClick={roll} disabled={rolling||!!modal} style={{width:108,height:108,borderRadius:'50%',background:rolling||modal?'linear-gradient(145deg,#6b7280,#4b5563)':'linear-gradient(145deg,#fb923c,#dc2626)',border:'4px solid rgba(255,255,255,0.22)',boxShadow:rolling||modal?'0 4px 0 #1f2937':'0 7px 0 #7f1d1d,0 10px 28px rgba(220,38,38,0.55)',cursor:rolling||modal?'not-allowed':'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transform:rolling?'translateY(4px)':'translateY(0)',transition:'all 0.12s ease',outline:'none'}}
            onMouseDown={e=>{if(!rolling&&!modal)e.currentTarget.style.transform='translateY(5px)';}} onMouseUp={e=>{e.currentTarget.style.transform='translateY(0)';}}>
            <span style={{fontSize:27,fontWeight:900,color:'white',textShadow:'0 2px 6px rgba(0,0,0,0.4)',fontFamily:'Georgia,serif',lineHeight:1}}>{rolling?'🎲':'GO'}</span>
            {!rolling&&<span style={{fontSize:13,color:'rgba(255,255,255,0.8)',fontWeight:700}}>→</span>}
          </button>

          {/* Stats */}
          {[{icon:'💵',label:'Coins',val:`₹${coins}`,color:'#fbbf24'},{icon:'🏦',label:'Savings',val:`₹${savings}`,color:'#34d399'}].map(s=>(
            <div key={s.label} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'10px 14px',textAlign:'center',width:104,backdropFilter:'blur(8px)'}}>
              <div style={{fontSize:17}}>{s.icon}</div>
              <div style={{fontSize:15,fontWeight:900,color:s.color,lineHeight:1.2}}>{s.val}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',fontWeight:600,marginTop:2}}>{s.label}</div>
            </div>
          ))}

          {/* Progress ring */}
          <div style={{textAlign:'center',position:'relative',width:68,height:68}}>
            <svg width="68" height="68" style={{transform:'rotate(-90deg)',position:'absolute',top:0,left:0}}>
              <circle cx="34" cy="34" r="27" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
              <circle cx="34" cy="34" r="27" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*27}`}
                strokeDashoffset={`${2*Math.PI*27*(1-(pos+1)/24)}`}
                style={{transition:'stroke-dashoffset 0.5s ease'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:13,fontWeight:900,color:'white',lineHeight:1}}>{pos+1}</span>
              <span style={{fontSize:8,color:'rgba(255,255,255,0.4)',fontWeight:600,lineHeight:1}}>/24</span>
            </div>
          </div>
        </div>
      </div>

      {modal&&<Modal tile={modal} coins={coins} savings={savings} loanActive={loanActive} loanRemaining={loanRemaining} setCoins={setCoins} setSavings={setSavings} setLoanActive={setLoanActive} setLoanRemaining={setLoanRemaining} onClose={()=>setModal(null)}/>}

      <style>{`
        @keyframes fi  {from{opacity:0}to{opacity:1}}
        @keyframes su  {from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes bob {from{transform:translateY(0)}to{transform:translateY(-6px)}}
        @keyframes float{0%,100%{transform:rotateX(50deg) rotateZ(-42deg) translateZ(0);}50%{transform:rotateX(50deg) rotateZ(-42deg) translateZ(8px);}}
      `}</style>
    </div>
  );
}