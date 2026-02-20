// ═══════════════════════════════════════════════════════════════════════════════
// GameBook.tsx  —  Bankopoly Vault of Knowledge
// 4 Zone biomes · Hexagonal nodes · Animated trail · Stars · Full interactivity
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../Store/useGameStore';
import ChapterCard from './ChapterCard';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Chapter {
  id:          string;
  title:       string;
  subtitle:    string;
  icon:        string;
  color:       string;
  glow:        string;
  zone:        number;
  unlockHint:  string;
  content: {
    headline:    string;
    body:        string[];
    didYouKnow:  string;
    inGame:      string;
    tips:        string[];
  };
}

// ─── Zone definitions ──────────────────────────────────────────────────────────
const ZONES = [
  { id:1, name:'Foundation Fields',  icon:'⛏️', tagline:'Where every great journey begins',
    bg:'radial-gradient(ellipse at 50% 40%, rgba(180,83,9,0.14) 0%, transparent 70%)',
    border:'rgba(251,146,60,0.2)', color:'#fb923c', chapters:[0,1] },
  { id:2, name:'The Savings Forest', icon:'🌲', tagline:'Where small seeds grow into fortunes',
    bg:'radial-gradient(ellipse at 50% 40%, rgba(22,163,74,0.14) 0%, transparent 70%)',
    border:'rgba(74,222,128,0.15)', color:'#4ade80', chapters:[2,3] },
  { id:3, name:'The Loan Citadel',   icon:'🏰', tagline:'Master debt before debt masters you',
    bg:'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.14) 0%, transparent 70%)',
    border:'rgba(129,140,248,0.15)', color:'#818cf8', chapters:[4,5] },
  { id:4, name:'The Vault Summit',   icon:'⛰️', tagline:'Where true financial mastery lives',
    bg:'radial-gradient(ellipse at 50% 40%, rgba(251,191,36,0.14) 0%, transparent 70%)',
    border:'rgba(251,191,36,0.18)', color:'#fbbf24', chapters:[6,7] },
];

// ─── Chapter definitions ───────────────────────────────────────────────────────
const CHAPTERS: Chapter[] = [
  {
    id:'money', title:'Meet Your Coins', subtitle:'Chapter I', icon:'🪙', zone:1,
    color:'#fb923c', glow:'rgba(251,146,60,0.6)',
    unlockHint:'Your adventure starts here!',
    content:{
      headline:'What even IS money?',
      body:[
        'Money is a tool we all agreed to use instead of swapping things directly. Long ago, if you wanted bread, you had to give the baker something they wanted — maybe eggs. That\'s called barter, and it was messy!',
        'Coins, notes, and digital numbers in your bank account are all just promises. A ₹10 coin doesn\'t have ₹10 of metal in it — it works because everyone agrees it\'s worth ₹10.',
        'In Bankopoly, your ZenCoins work exactly like real money. You earn them, spend them, save them, and grow them. Every decision you make teaches you how real money flows.',
      ],
      didYouKnow:'The first coins were made in Lydia (modern Turkey) around 600 BCE. Before that, people used cattle, grain, and even shells as money!',
      inGame:'Every ZenCoin you collect on the board represents earning money in real life — from work, selling things, or smart decisions.',
      tips:['Money is a tool, not a goal','The earlier you learn about money, the richer your future','In Bankopoly, every coin counts!'],
    },
  },
  {
    id:'bank', title:"The Bank's Promise", subtitle:'Chapter II', icon:'🏦', zone:1,
    color:'#fb923c', glow:'rgba(251,146,60,0.6)',
    unlockHint:'Play a round to unlock',
    content:{
      headline:'Why does the Bank exist?',
      body:[
        'Imagine 100 people each have ₹1,000 they don\'t need right now. Instead of hiding it under their mattresses, they all give it to one safe place — the bank. Now the bank has ₹1,00,000!',
        'The bank lends that money to someone who needs it. That person pays back more than they borrowed — the extra is called interest. The bank keeps some, and shares some with you as a reward.',
        'Banks are the engine of an economy. Without them, nobody could borrow money to build homes, start businesses, or study.',
      ],
      didYouKnow:"The world's oldest bank still operating is Banca Monte dei Paschi di Siena in Italy, founded in 1472 — over 550 years ago!",
      inGame:'The Bank tile on your board game is your HQ. Landing there gives you coins — just like depositing money earns interest in real life.',
      tips:['Banks are safe places for your money','They pay you interest for keeping money there','RBI (Reserve Bank of India) watches over all banks in India'],
    },
  },
  {
    id:'saving', title:'The Saving Superpower', subtitle:'Chapter III', icon:'🐷', zone:2,
    color:'#4ade80', glow:'rgba(74,222,128,0.6)',
    unlockHint:'Save coins during a game round',
    content:{
      headline:'Saving is your secret weapon',
      body:[
        'Saving means keeping some of what you earn instead of spending it all. The trick is to save FIRST, then spend what\'s left — not the other way around.',
        'Even saving ₹50 a day adds up to ₹18,250 in a year. Put that in a bank at 7% interest, and after 10 years you\'d have nearly ₹36,000 — almost double — without doing anything extra!',
        'This magic is called compound interest. Your money earns interest, then that interest earns more interest. It snowballs over time.',
      ],
      didYouKnow:'If you save ₹500/month from age 15 and invest it, by age 60 you could have over ₹1 crore — just from being patient!',
      inGame:'Every time you deposit ZenCoins into savings during the board game, you\'re practicing the habit that builds real wealth.',
      tips:['Save at least 20% of everything you earn','Automate savings so you never forget','Never touch your savings for small wants — only true needs'],
    },
  },
  {
    id:'interest', title:'Interest Magic', subtitle:'Chapter IV', icon:'📈', zone:2,
    color:'#4ade80', glow:'rgba(74,222,128,0.6)',
    unlockHint:'Land on an EARN tile',
    content:{
      headline:'Your money working while you sleep',
      body:[
        'Interest is the cost of borrowing money OR the reward for lending it. When you put money in a bank, you\'re lending it to them — and they pay you back with interest.',
        'Simple interest: ₹1,000 at 10% per year = ₹100 every year. After 5 years: ₹1,500.',
        'Compound interest: ₹1,000 at 10%, compounded. After 5 years: ₹1,611! That extra ₹111 comes from earning interest ON your interest. Einstein reportedly called it "the eighth wonder of the world."',
      ],
      didYouKnow:'Rule of 72: divide 72 by your interest rate to find how many years to double your money. At 8% interest, money doubles every 9 years!',
      inGame:'EARN tiles on the board give you bonus ZenCoins — that\'s your interest reward for keeping money in the game\'s bank system.',
      tips:['Higher interest rate = faster growth','Start saving young — time is your biggest advantage','Compare bank rates before choosing where to save'],
    },
  },
  {
    id:'loans', title:'The Loan Deal', subtitle:'Chapter V', icon:'🤝', zone:3,
    color:'#818cf8', glow:'rgba(129,140,248,0.6)',
    unlockHint:'Take a loan during a game round',
    content:{
      headline:'Borrow smart, not often',
      body:[
        "A loan is when someone gives you money NOW, and you agree to pay it back LATER — with extra (interest). It's not free money, it's rented money.",
        'Good loans help you get something that grows in value: a home, education, or a business. Bad loans pay for things that lose value: fancy gadgets, parties, or things you don\'t really need.',
        'The golden rule: only borrow what you\'re sure you can repay. Missing payments hurts your credit score — a grade the bank gives your financial behavior.',
      ],
      didYouKnow:"In India, home loans can go up to 30 years! A ₹50 lakh loan at 8.5% means you'll repay nearly ₹1.1 crore — more than double what you borrowed.",
      inGame:'When you hit the Loan tile in Bankopoly, you get ZenCoins instantly but must pay them back at GO. That\'s exactly how real loans work!',
      tips:["Loans aren't bad — wrong loans are bad",'Always read the fine print','EMI = Equated Monthly Installment — your fixed monthly repayment'],
    },
  },
  {
    id:'repay', title:'Repay & Rise', subtitle:'Chapter VI', icon:'✅', zone:3,
    color:'#818cf8', glow:'rgba(129,140,248,0.6)',
    unlockHint:'Fully repay a loan in the game',
    content:{
      headline:'Debt is a guest, not a roommate',
      body:[
        'Repaying loans on time is one of the most powerful financial habits you can build. Every repayment raises your credit score, which unlocks better interest rates in the future.',
        'The faster you repay, the less total interest you pay. If you have a ₹10,000 loan at 12% annual interest, paying it back in 6 months costs much less than stretching it to 2 years.',
        'Debt snowball: repay your smallest loan first (feels like a win!). Debt avalanche: repay highest-interest loan first (saves more money). Both work — pick the one you\'ll actually stick to.',
      ],
      didYouKnow:'Indians collectively repay over ₹1 lakh crore in home loan EMIs every single month — that\'s how massive the banking system is!',
      inGame:'Crossing GO in Bankopoly automatically repays your loan. That satisfying moment of being debt-free? That\'s real — adults feel it too!',
      tips:['Never miss an EMI — set up auto-pay','Pay more than minimum whenever possible','Being debt-free feels like a superpower'],
    },
  },
  {
    id:'scam', title:'Scam Radar', subtitle:'Chapter VII', icon:'🛡️', zone:4,
    color:'#fbbf24', glow:'rgba(251,191,36,0.65)',
    unlockHint:'Encounter a scam tile in the game',
    content:{
      headline:'If it sounds too good... it is.',
      body:[
        'Financial scams have been around forever — and scammers are getting smarter. They target people of all ages, but often go after those who are new to money: teenagers and the elderly.',
        "The most common scams in India: fake UPI requests, 'KYC update' calls, lottery wins, investment schemes promising 40% returns, and fake job offers asking for a fee.",
        'The golden rule: NO bank, government office, or legitimate company will EVER ask for your OTP, PIN, or password over a call or message. Ever. No exceptions.',
      ],
      didYouKnow:'In 2023, Indians lost over ₹7,000 crore to cybercrime and financial fraud. That\'s about ₹19 crore every single day!',
      inGame:'The SCAM tile in Bankopoly gives you a choice: fall for it and lose coins, or "Report & Ignore" and stay safe. Real life works exactly the same.',
      tips:['Never share OTP with ANYONE','If someone pressures you to act fast — it\'s a scam','Report fraud to cybercrime.gov.in or call 1930'],
    },
  },
  {
    id:'build', title:'Build Your Future', subtitle:'Chapter VIII', icon:'🏗️', zone:4,
    color:'#fbbf24', glow:'rgba(251,191,36,0.65)',
    unlockHint:'Place a building on the town map',
    content:{
      headline:'Real wealth is what you build',
      body:[
        'Spending money on experiences and things that make you happy is fine — but building assets is how you create lasting wealth. An asset is something that puts money IN your pocket over time.',
        "Examples of assets: a house you rent out, stocks that pay dividends, a business, or even skills that let you earn more. Liabilities take money OUT: car loans, subscriptions you don't use.",
        'Robert Kiyosaki wrote "Rich Dad Poor Dad" — one of the most read money books ever. His big idea: rich people buy assets, poor people buy liabilities thinking they\'re assets.',
      ],
      didYouKnow:'Investing ₹5,000/month in an index fund from age 18 to 60 could grow to over ₹6 crore with a 12% average annual return.',
      inGame:'Every building you place on the Bankopoly town map is an asset! Just like in real life, it takes coins to build, but it makes your town (and wealth) grow.',
      tips:['Start investing as soon as possible, even small amounts','Diversify — don\'t put all money in one place','Learn about Mutual Funds, PPF, and Sukanya Samriddhi Yojana'],
    },
  },
];

// ─── Hex node ──────────────────────────────────────────────────────────────────
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

function HexNode({ chapter, unlocked, stars, chapterIndex, onClick }: {
  chapter: Chapter; unlocked: boolean; stars: number; chapterIndex: number; onClick: ()=>void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={()=>unlocked&&onClick()}
      onMouseEnter={()=>unlocked&&setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        display:'flex', flexDirection:'column', alignItems:'center', gap:10,
        cursor: unlocked?'pointer':'default',
        animation:`nodeReveal 0.5s ${chapterIndex*0.1}s both ease-out`,
      }}
    >
      <div style={{ position:'relative', width:88, height:88 }}>
        {/* Pulse halo */}
        {unlocked && (
          <div style={{
            position:'absolute', inset:-12, clipPath:HEX_CLIP,
            background:chapter.color,
            opacity: hovered ? 0.22 : 0.09,
            animation:'hexPulse 2.4s ease-in-out infinite',
            animationDelay:`${chapterIndex*0.3}s`,
            transition:'opacity 0.2s',
          }} />
        )}
        {/* Main hex face */}
        <div style={{
          width:'100%', height:'100%', clipPath:HEX_CLIP,
          background: unlocked
            ? `linear-gradient(145deg, ${chapter.color}55, rgba(0,0,0,0.75))`
            : 'linear-gradient(145deg, rgba(55,55,55,0.5), rgba(15,15,15,0.9))',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          position:'relative',
        }}>
          <div style={{
            position:'absolute', inset:5, clipPath:HEX_CLIP,
            background: unlocked
              ? `radial-gradient(circle at 35% 28%, ${chapter.color}35, rgba(0,0,0,0.88))`
              : 'rgba(8,8,8,0.92)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
          }}>
            {/* Top sheen */}
            <div style={{
              position:'absolute', top:7, left:'18%', right:'40%', height:16,
              background:'rgba(255,255,255,0.06)', borderRadius:'50%', filter:'blur(3px)',
            }} />
            <div style={{ fontSize: unlocked?28:22, filter:unlocked?'none':'grayscale(1) brightness(0.28)', zIndex:1 }}>
              {unlocked ? chapter.icon : '🔒'}
            </div>
            <div style={{
              fontSize:8, letterSpacing:1, textTransform:'uppercase', zIndex:1,
              color: unlocked?chapter.color:'rgba(255,255,255,0.18)', fontWeight:900,
            }}>{chapterIndex+1}</div>
          </div>
        </div>
        {/* Stars badge */}
        {unlocked && stars>0 && (
          <div style={{
            position:'absolute', bottom:-8, left:'50%', transform:'translateX(-50%)',
            display:'flex', gap:1, zIndex:10,
            background:'rgba(0,0,0,0.75)', borderRadius:99, padding:'2px 7px',
            border:`1px solid ${chapter.color}35`,
          }}>
            {[0,1,2].map(i=>(
              <span key={i} style={{ fontSize:9, filter:i<stars?'none':'grayscale(1) brightness(0.25)' }}>⭐</span>
            ))}
          </div>
        )}
        {/* Perfect badge */}
        {unlocked && stars===3 && (
          <div style={{
            position:'absolute', top:-5, right:-5,
            width:20, height:20, borderRadius:'50%',
            background:'linear-gradient(135deg,#4ade80,#16a34a)',
            border:'2px solid rgba(0,0,0,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:10, fontWeight:900, color:'#052e16',
            boxShadow:'0 2px 10px rgba(74,222,128,0.55)',
          }}>✓</div>
        )}
      </div>
      {/* Label */}
      <div style={{ textAlign:'center', maxWidth:90 }}>
        <div style={{ fontSize:11, fontWeight:900, lineHeight:1.3, color:unlocked?'#fff':'rgba(255,255,255,0.2)' }}>
          {chapter.title}
        </div>
        <div style={{
          fontSize:9, fontWeight:700, marginTop:2, lineHeight:1.4,
          color: unlocked ? chapter.color : 'rgba(255,255,255,0.15)',
          opacity: unlocked && !hovered ? 0.7 : 1, transition:'opacity 0.2s',
        }}>
          {unlocked ? (stars>0 ? `${stars}/3 ⭐` : 'Tap to explore') : chapter.unlockHint}
        </div>
      </div>
    </div>
  );
}

// ─── Zone section ──────────────────────────────────────────────────────────────
function ZoneSection({ zone, chapters, unlockedFn, starsFn, onChapterClick, zoneIdx }: {
  zone: typeof ZONES[0]; chapters: Chapter[];
  unlockedFn:(id:string)=>boolean; starsFn:(id:string)=>number;
  onChapterClick:(c:Chapter)=>void; zoneIdx:number;
}) {
  const allMastered = chapters.every(c=>starsFn(c.id)===3);
  const c0 = chapters[0], c1 = chapters[1];

  return (
    <div style={{ animation:`zoneReveal 0.55s ${zoneIdx*0.12}s both ease-out` }}>
      {/* Zone header card */}
      <div style={{
        margin:'0 16px 22px', position:'relative', overflow:'hidden',
        background: zone.bg,
        border:`1.5px solid ${zone.border}`,
        borderRadius:18, padding:'15px 18px',
        display:'flex', alignItems:'center', gap:14,
        boxShadow: allMastered ? `0 0 30px ${zone.color}25` : 'none',
      }}>
        <div style={{
          position:'absolute', right:-10, top:'50%', transform:'translateY(-50%)',
          fontSize:84, opacity:0.035, pointerEvents:'none', userSelect:'none',
        }}>{zone.icon}</div>
        <div style={{
          width:44, height:44, borderRadius:13, flexShrink:0,
          background:`${zone.color}20`, border:`2px solid ${zone.color}35`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20, boxShadow:`0 0 14px ${zone.color}25`,
        }}>{zone.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:`${zone.color}70`, fontWeight:800, marginBottom:1 }}>
            Zone {zone.id}
          </div>
          <div style={{ fontFamily:'Georgia,serif', fontWeight:900, fontSize:15, color:'#fff', lineHeight:1.15, marginBottom:2 }}>
            {zone.name}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.32)', fontWeight:700 }}>{zone.tagline}</div>
        </div>
        {allMastered && (
          <div style={{
            flexShrink:0, fontSize:9, fontWeight:900, padding:'3px 10px', borderRadius:20,
            background:`${zone.color}18`, border:`1px solid ${zone.color}45`, color:zone.color,
            letterSpacing:1, textTransform:'uppercase',
          }}>✓ Mastered</div>
        )}
      </div>

      {/* Two hex nodes with connecting line */}
      <div style={{ position:'relative', display:'flex', justifyContent:'center', alignItems:'flex-start', gap:0, padding:'0 20px 8px' }}>
        {/* Connector beam */}
        <div style={{
          position:'absolute', top:44, left:'50%', transform:'translateX(-50%)',
          width:'34%', height:3, borderRadius:99,
          background:`linear-gradient(90deg, ${c0.color}50, ${c1.color}50)`,
          boxShadow:`0 0 10px ${zone.color}30`,
        }} />
        <div style={{ flex:1, display:'flex', justifyContent:'flex-end', paddingRight:8 }}>
          <HexNode chapter={c0} unlocked={unlockedFn(c0.id)} stars={starsFn(c0.id)} chapterIndex={zone.chapters[0]} onClick={()=>onChapterClick(c0)} />
        </div>
        <div style={{ flex:1, display:'flex', justifyContent:'flex-start', paddingLeft:8 }}>
          <HexNode chapter={c1} unlocked={unlockedFn(c1.id)} stars={starsFn(c1.id)} chapterIndex={zone.chapters[1]} onClick={()=>onChapterClick(c1)} />
        </div>
      </div>
    </div>
  );
}

// ─── Zone-to-zone connector ───────────────────────────────────────────────────
function ZoneConnector({ nextColor, flip }: { nextColor:string; flip:boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', height:56, alignItems:'center' }}>
      <svg width={180} height={56} style={{ overflow:'visible' }}>
        <defs>
          <linearGradient id={`cg_${nextColor.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={nextColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={nextColor} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d={flip ? 'M 140 5 C 140 30, 40 26, 40 51' : 'M 40 5 C 40 30, 140 26, 140 51'}
          fill="none"
          stroke={`url(#cg_${nextColor.replace('#','')})`}
          strokeWidth="3"
          strokeDasharray="8 6"
          strokeLinecap="round"
          style={{ animation:'dashMarch 1.3s linear infinite' }}
        />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default function GameBook() {
  const navigate      = useNavigate();
  const store         = useGameStore();
  const [activeChapter, setActiveChapter] = useState<Chapter|null>(null);
  const [quizStars, setQuizStars]         = useState<Record<string,number>>({});

  // Re-load stars after modal closes
  useEffect(() => {
    const map: Record<string,number> = {};
    CHAPTERS.forEach(c => {
      try { const s=localStorage.getItem(`bkp_quiz_${c.id}`); if(s) map[c.id]=JSON.parse(s).stars; } catch {}
    });
    setQuizStars(map);
  }, [activeChapter]);

  const placedCount   = Object.keys(store.placedProperties).length;
  const anyRepaid     = store.stats.loansHistory.some(l=>l.fullyRepaid);

  function isUnlocked(id:string): boolean {
    switch(id) {
      case 'money':    return true;
      case 'bank':     return store.wealth>0;
      case 'saving':   return store.stats.totalAmountSaved>0;
      case 'interest': return store.stats.totalInterestEarned>0;
      case 'loans':    return store.stats.loansHistory.length>0;
      case 'repay':    return anyRepaid;
      case 'scam':     return store.stats.scamsEncountered>0;
      case 'build':    return placedCount>0;
      default: return false;
    }
  }

  const unlockedCount = CHAPTERS.filter(c=>isUnlocked(c.id)).length;
  const masteredCount = CHAPTERS.filter(c=>(quizStars[c.id]||0)===3).length;
  const totalStars    = CHAPTERS.reduce((a,c)=>a+(quizStars[c.id]||0),0);
  const progressPct   = Math.round((unlockedCount/CHAPTERS.length)*100);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:60,
      background:'#070d04',
      fontFamily:'"Nunito",system-ui,sans-serif',
      overflowY:'auto', overflowX:'hidden',
    }}>

      {/* Background layers */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'radial-gradient(circle, rgba(74,222,128,0.06) 1px, transparent 1px)',
          backgroundSize:'30px 30px' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'30vh',
          background:'radial-gradient(ellipse at 50% 0%, rgba(251,146,60,0.09), transparent)' }} />
        <div style={{ position:'absolute', top:'28%', left:0, right:0, height:'25vh',
          background:'radial-gradient(ellipse at 50% 50%, rgba(74,222,128,0.07), transparent)' }} />
        <div style={{ position:'absolute', top:'54%', left:0, right:0, height:'25vh',
          background:'radial-gradient(ellipse at 50% 50%, rgba(129,140,248,0.07), transparent)' }} />
        <div style={{ position:'absolute', top:'78%', left:0, right:0, height:'25vh',
          background:'radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.07), transparent)' }} />
      </div>

      {/* Sticky nav */}
      <div style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(7,13,4,0.92)', borderBottom:'1.5px solid rgba(74,124,42,0.3)',
        backdropFilter:'blur(16px)', padding:'10px 16px',
        display:'flex', alignItems:'center', gap:12,
      }}>
        <button onClick={()=>navigate('/')} style={{
          display:'flex', alignItems:'center', gap:5,
          background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)',
          borderRadius:11, padding:'7px 12px', cursor:'pointer',
          color:'rgba(255,255,255,0.5)', fontWeight:800, fontSize:12,
          fontFamily:'"Nunito",system-ui,sans-serif', flexShrink:0,
        }}>← Town Map</button>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:'uppercase', color:'rgba(251,191,36,0.45)', fontWeight:800 }}>Bankopoly</div>
          <div style={{ fontFamily:'Georgia,serif', fontWeight:900, fontSize:16, color:'#fbbf24', lineHeight:1 }}>
            Vault of Knowledge
          </div>
        </div>

        <div style={{ display:'flex', gap:7, flexShrink:0 }}>
          {[
            { val:`${totalStars}/24`, label:'Stars', color:'#fbbf24', border:'rgba(251,191,36,0.3)' },
            { val:`${unlockedCount}/8`, label:'Unlocked', color:'#4ade80', border:'rgba(74,222,128,0.3)' },
          ].map(s=>(
            <div key={s.label} style={{
              background:'rgba(0,0,0,0.5)', border:`1.5px solid ${s.border}`,
              borderRadius:11, padding:'5px 10px', textAlign:'center',
            }}>
              <div style={{ fontSize:12, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:8, letterSpacing:1, textTransform:'uppercase', color:'rgba(255,255,255,0.25)', fontWeight:800, marginTop:1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'26px 20px 18px' }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:7,
          background:'rgba(251,191,36,0.07)', border:'1.5px solid rgba(251,191,36,0.22)',
          borderRadius:20, padding:'5px 16px', marginBottom:14,
        }}>
          <span style={{ fontSize:13 }}>📖</span>
          <span style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#fbbf24', fontWeight:900 }}>
            Your Learning Journey
          </span>
        </div>
        <div style={{
          fontFamily:'Georgia,serif', fontWeight:900, fontSize:26, color:'#fff', lineHeight:1.2, marginBottom:8,
          textShadow:'0 2px 18px rgba(251,191,36,0.15)',
        }}>
          Every coin<br/>teaches a lesson.
        </div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.38)', fontWeight:700, maxWidth:300, margin:'0 auto 18px', lineHeight:1.65 }}>
          Play Bankopoly to unlock chapters. Read, learn, quiz — earn your stars.
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth:290, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:10, fontWeight:800, letterSpacing:1, textTransform:'uppercase', color:'rgba(255,255,255,0.28)' }}>Journey Progress</span>
            <span style={{ fontSize:10, fontWeight:900, color:'#4ade80' }}>{progressPct}%</span>
          </div>
          <div style={{ height:7, background:'rgba(255,255,255,0.07)', borderRadius:99, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:99, width:`${progressPct}%`,
              background:'linear-gradient(90deg,#fb923c,#4ade80,#818cf8,#fbbf24)',
              boxShadow:'0 0 14px rgba(74,222,128,0.35)',
              transition:'width 1.2s cubic-bezier(0.34,1.1,0.64,1)',
            }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
            {ZONES.map(z=>(
              <span key={z.id} style={{ fontSize:8, color:z.color, fontWeight:800, opacity:0.55 }}>
                {z.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Zone map */}
      <div style={{ position:'relative', zIndex:1, maxWidth:520, margin:'0 auto', padding:'0 0 80px' }}>
        {ZONES.map((zone, zIdx) => {
          const zoneChapters = zone.chapters.map(ci=>CHAPTERS[ci]);
          return (
            <div key={zone.id}>
              <ZoneSection
                zone={zone} chapters={zoneChapters}
                unlockedFn={isUnlocked}
                starsFn={(id)=>quizStars[id]||0}
                onChapterClick={setActiveChapter}
                zoneIdx={zIdx}
              />
              {zIdx < ZONES.length-1 && (
                <ZoneConnector nextColor={ZONES[zIdx+1].color} flip={zIdx%2===0} />
              )}
            </div>
          );
        })}

        {/* Trophy */}
        <div style={{ textAlign:'center', padding:'18px 0 0' }}>
          <div style={{
            display:'inline-block',
            background: masteredCount===8
              ? 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(251,146,60,0.1))'
              : 'rgba(255,255,255,0.03)',
            border:`2px solid ${masteredCount===8?'rgba(251,191,36,0.45)':'rgba(255,255,255,0.07)'}`,
            borderRadius:20, padding:'18px 28px',
          }}>
            <div style={{
              fontSize:46,
              filter:masteredCount===8?'none':'grayscale(1) brightness(0.2)',
              animation:masteredCount===8?'floatIcon 2.5s ease-in-out infinite':'none',
              marginBottom:6,
            }}>🏆</div>
            <div style={{ fontFamily:'Georgia,serif', fontWeight:900, fontSize:15,
              color:masteredCount===8?'#fbbf24':'rgba(255,255,255,0.18)' }}>
              {masteredCount===8 ? 'Master Banker!' : 'Complete all chapters'}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.22)', fontWeight:700, marginTop:3 }}>
              {masteredCount===8 ? '3★ on every chapter — you\'re legendary!' : `${masteredCount}/8 mastered`}
            </div>
          </div>
        </div>
      </div>

      {activeChapter && <ChapterCard chapter={activeChapter} onClose={()=>setActiveChapter(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes nodeReveal { from{opacity:0;transform:translateY(18px) scale(0.88)} to{opacity:1;transform:none} }
        @keyframes zoneReveal { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes hexPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.22)} }
        @keyframes dashMarch  { from{stroke-dashoffset:0} to{stroke-dashoffset:-28} }
        @keyframes floatIcon  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px }
      `}</style>
    </div>
  );
}