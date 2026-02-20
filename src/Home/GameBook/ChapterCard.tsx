// ═══════════════════════════════════════════════════════════════════════════════
// ChapterCard.tsx  —  Bankopoly Chapter Modal
// 4 tabs: Story · Learn · Quiz · Badge
// Quiz answers are persisted in localStorage per chapter.
// Stars (0–3) earned based on quiz score.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import type { Chapter } from './GameBook';

// ─── Quiz data ────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  q:       string;
  options: string[];
  correct: number; // 0-based index
  explanation: string;
}

export const CHAPTER_QUIZZES: Record<string, QuizQuestion[]> = {
  money: [
    { q: 'Before money existed, how did people get things they needed?',
      options: ['They stole from each other', 'They swapped goods directly (barter)', 'They used credit cards', 'They worked for free'],
      correct: 1, explanation: 'Barter meant trading goods directly — bread for eggs, for example. It worked but was messy when nobody wanted what you had.' },
    { q: 'Why does a ₹10 coin actually work as money?',
      options: ['It has ₹10 worth of metal inside', 'The government forces you to accept it', 'Everyone agrees it is worth ₹10', 'It was blessed by the RBI'],
      correct: 2, explanation: 'Money is a shared agreement. The coin itself might cost ₹1 to make — it\'s the collective trust that gives it value.' },
    { q: 'In Bankopoly, ZenCoins represent:',
      options: ['Fantasy tokens with no real meaning', 'Real money and financial decisions', 'Cheat codes', 'The developer\'s imagination'],
      correct: 1, explanation: 'Every ZenCoin decision mirrors a real financial choice — earn, save, borrow, or lose. That\'s the whole point!' },
  ],
  bank: [
    { q: 'What does a bank do with the money you deposit?',
      options: ['Locks it in a vault and never touches it', 'Burns it for heat', 'Lends it to others and pays you interest', 'Invests it in space rockets'],
      correct: 2, explanation: 'Your deposit becomes someone else\'s loan. The bank earns interest on that loan and shares some with you — that\'s the banking loop.' },
    { q: 'What is "interest" in banking?',
      options: ['How exciting a bank is', 'Extra money paid for borrowing or earned for saving', 'A secret bank fee', 'The bank\'s monthly newsletter'],
      correct: 1, explanation: 'Interest works two ways: you EARN it when you save, and you PAY it when you borrow. Same concept, opposite direction.' },
    { q: 'Which body oversees all banks in India?',
      options: ['SEBI', 'Ministry of Finance', 'Reserve Bank of India (RBI)', 'Google Pay'],
      correct: 2, explanation: 'The RBI is India\'s central bank. It sets rules, controls money supply, and makes sure banks don\'t behave badly.' },
  ],
  saving: [
    { q: 'What is the golden rule of saving?',
      options: ['Save whatever is left after spending', 'Save first, then spend what is left', 'Spend everything — you only live once', 'Save only when you feel like it'],
      correct: 1, explanation: 'Saving first (called "paying yourself first") is the single most powerful habit. What you never see, you never miss.' },
    { q: 'What is "compound interest"?',
      options: ['Interest from two banks at once', 'Interest that gets complicated', 'Earning interest on your interest', 'A type of bank account'],
      correct: 2, explanation: 'When your interest earns interest, the growth accelerates. Over decades, this effect is astonishing — Einstein reportedly called it the 8th wonder.' },
    { q: 'Saving ₹50 every single day for a full year gives you:',
      options: ['₹5,000', '₹9,600', '₹18,250', '₹36,500'],
      correct: 2, explanation: '₹50 × 365 days = ₹18,250. Small daily habits create surprising totals — and that\'s before any interest on top.' },
  ],
  interest: [
    { q: 'The "Rule of 72" tells you:',
      options: ['The maximum interest rate allowed by law', 'How many years to double your money at a given rate', 'The bank\'s opening hours', 'How much tax you owe'],
      correct: 1, explanation: 'Divide 72 by your interest rate to get years to double. At 8%: 72÷8 = 9 years. A brilliant mental shortcut.' },
    { q: 'At 8% annual interest, money doubles in approximately:',
      options: ['4 years', '16 years', '9 years', '24 years'],
      correct: 2, explanation: '72 ÷ 8 = 9. In 9 years, ₹10,000 becomes ₹20,000. Wait another 9, and it becomes ₹40,000. The snowball grows!' },
    { q: 'Simple interest on ₹1,000 at 10%/year for 5 years gives you:',
      options: ['₹1,100', '₹1,500', '₹1,611', '₹2,000'],
      correct: 1, explanation: 'Simple interest = principal × rate × time = ₹1,000 × 10% × 5 = ₹500 interest. Total = ₹1,500.' },
  ],
  loans: [
    { q: 'A "good loan" is best described as:',
      options: ['Any loan with a low interest rate', 'A loan for something that grows in value', 'A loan you forget to repay', 'A loan from a friend'],
      correct: 1, explanation: 'Home loans, education loans, business loans — these fund things that can increase your earning power or net worth over time.' },
    { q: 'What does "EMI" stand for?',
      options: ['Electronic Money Investment', 'Equated Monthly Installment', 'Extra Money Interest', 'Emergency Money Input'],
      correct: 1, explanation: 'An EMI is the fixed amount you pay the bank every month to repay a loan, combining both principal and interest.' },
    { q: 'Missing loan repayments will:',
      options: ['Be forgiven after 30 days', 'Hurt your credit score', 'Make your loan disappear', 'Give you bonus ZenCoins'],
      correct: 1, explanation: 'Your credit score is like a financial report card. Missed payments damage it, making future loans more expensive or impossible to get.' },
  ],
  repay: [
    { q: 'The "debt snowball" method means:',
      options: ['Making the bank very cold', 'Repaying the largest loan first', 'Repaying the smallest loan first for quick wins', 'Freezing all loan payments'],
      correct: 2, explanation: 'Paying off small loans first gives you a psychological "win" and motivation to tackle bigger ones. It\'s about behavior, not just math.' },
    { q: 'The "debt avalanche" method saves the most money because:',
      options: ['It uses snow to cool interest rates', 'You repay the highest-interest loan first', 'You take out more loans to cover old ones', 'You pay all loans equally'],
      correct: 1, explanation: 'High-interest loans cost more per rupee per day. Eliminating them first minimizes the total interest you pay over time.' },
    { q: 'The fastest way to pay LESS total interest is:',
      options: ['Repay as slowly as possible', 'Pay the minimum every month', 'Repay as quickly as possible', 'Switch banks frequently'],
      correct: 2, explanation: 'Interest accrues on the outstanding balance. The faster you reduce that balance, the less time interest has to grow.' },
  ],
  scam: [
    { q: 'A bank or government will NEVER ask you for:',
      options: ['Your account number', 'Your name and address', 'Your OTP over a phone call', 'Your loan application details'],
      correct: 2, explanation: 'OTPs are one-time passwords meant ONLY for you. Any request for your OTP is a scam — 100% of the time, no exceptions.' },
    { q: 'If someone pressures you to act immediately with your money, it is most likely:',
      options: ['A great investment opportunity', 'A scam using urgency to stop you from thinking', 'A loyal bank employee', 'A government scheme'],
      correct: 1, explanation: 'Scammers create panic and urgency deliberately. Legitimate offers don\'t expire in 5 minutes. Always pause and verify.' },
    { q: 'To report financial fraud in India, the helpline number is:',
      options: ['100', '1930', '112', '1800-11-0001'],
      correct: 1, explanation: 'Dial 1930 (National Cyber Crime Helpline) immediately if you\'ve been scammed or suspect fraud. Speed matters!' },
  ],
  build: [
    { q: 'An "asset" is best defined as:',
      options: ['Anything you own that looks impressive', 'Something that puts money INTO your pocket over time', 'A large bank account', 'Property you can\'t sell'],
      correct: 1, explanation: 'True assets generate income or appreciate in value — rental property, stocks, businesses. A car you drive is usually a liability.' },
    { q: 'The idea "rich people buy assets, middle class buy liabilities thinking they\'re assets" comes from:',
      options: ['Warren Buffett\'s autobiography', 'Rich Dad Poor Dad by Robert Kiyosaki', 'The Indian Income Tax Act', 'A TED Talk'],
      correct: 1, explanation: 'Robert Kiyosaki\'s "Rich Dad Poor Dad" (1997) reshaped how millions think about wealth. One of the most read personal finance books ever.' },
    { q: 'Investing ₹5,000/month from age 18 could grow to ₹6+ crore by age 60 — this is the power of:',
      options: ['Getting a government job', 'Long-term compound investing', 'Winning the lottery', 'Borrowing at low rates'],
      correct: 1, explanation: 'At ~12% average returns (Indian equity mutual funds have historically achieved this), patience and consistency create extraordinary wealth.' },
  ],
};

// ─── Confetti particle ────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const colors = ['#fbbf24','#4ade80','#818cf8','#f87171','#22d3ee','#fb923c'];
  const particles = Array.from({ length: 48 }, (_, i) => ({
    id: i, color: colors[i % colors.length],
    x: Math.random() * 100, delay: Math.random() * 0.8,
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
    shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'triangle',
  }));

  if (!active) return null;
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:20 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.x}%`, top:'-20px',
          width: p.size, height: p.size,
          background: p.shape !== 'triangle' ? p.color : 'transparent',
          borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0',
          borderLeft:  p.shape === 'triangle' ? `${p.size/2}px solid transparent` : undefined,
          borderRight: p.shape === 'triangle' ? `${p.size/2}px solid transparent` : undefined,
          borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : undefined,
          animation: `confettiFall 1.6s ${p.delay}s ease-in forwards`,
          transform: `rotate(${p.rotation}deg)`,
        }} />
      ))}
    </div>
  );
}

// ─── Star rating display ──────────────────────────────────────────────────────
function Stars({ count, size = 22, animate = false }: { count: number; size?: number; animate?: boolean }) {
  return (
    <div style={{ display:'flex', gap: 4 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          fontSize: size,
          filter: i < count ? 'none' : 'grayscale(1) brightness(0.3)',
          animation: animate && i < count ? `starPop 0.35s ${i * 0.12}s cubic-bezier(0.34,1.8,0.64,1) both` : 'none',
        }}>⭐</span>
      ))}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function Tab({ label, icon, active, onClick, disabled }: {
  label: string; icon: string; active: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, display:'flex', flexDirection:'column', alignItems:'center', gap: 3,
      padding:'9px 6px 8px',
      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      border: 'none',
      borderBottom: active ? '2.5px solid #fbbf24' : '2.5px solid transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.3 : 1,
      transition: 'all 0.18s',
      fontFamily: '"Nunito",system-ui,sans-serif',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform:'uppercase',
        color: active ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
        {label}
      </span>
    </button>
  );
}

// ─── Quiz Tab ─────────────────────────────────────────────────────────────────
function QuizTab({ chapterId, color, glow, onComplete }: {
  chapterId: string; color: string; glow: string;
  onComplete: (stars: number) => void;
}) {
  const questions   = CHAPTER_QUIZZES[chapterId] || [];
  const [qIdx, setQIdx]         = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers]   = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [done, setDone]         = useState(false);
  const [animIn, setAnimIn]     = useState(true);

  const q = questions[qIdx];
  const correctCount = answers.filter((a, i) => a === questions[i]?.correct).length;
  const stars = correctCount === 3 ? 3 : correctCount === 2 ? 2 : correctCount === 1 ? 1 : 0;

  function choose(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function confirm() {
    if (selected === null) return;
    const next = [...answers];
    next[qIdx] = selected;
    setAnswers(next);
    setRevealed(true);
  }

  function advance() {
    if (qIdx < questions.length - 1) {
      setAnimIn(false);
      setTimeout(() => {
        setQIdx(q => q + 1);
        setSelected(null);
        setRevealed(false);
        setAnimIn(true);
      }, 220);
    } else {
      const sc = answers.filter((a,i)=>a===questions[i]?.correct).length + (selected===q.correct ? 1 : 0);
      const s  = sc === 3 ? 3 : sc === 2 ? 2 : sc === 1 ? 1 : 0;
      setDone(true);
      onComplete(s);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign:'center', padding:'32px 20px', animation:'fadeUp 0.4s ease' }}>
        <div style={{ fontSize: 56, marginBottom: 12, animation:'floatIcon 2s ease-in-out infinite' }}>
          {stars === 3 ? '🎉' : stars >= 2 ? '🥳' : '💪'}
        </div>
        <div style={{ fontFamily:'Georgia,serif', fontSize: 22, fontWeight:900, color:'#fff', marginBottom: 8 }}>
          {stars === 3 ? 'Perfect Score!' : stars >= 2 ? 'Great Job!' : 'Keep Learning!'}
        </div>
        <div style={{ marginBottom: 16 }}><Stars count={stars} size={30} animate /></div>
        <div style={{ fontSize: 14, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>
          {correctCount}/{questions.length} correct — head to the Badge tab!
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 4px' }}>
      {/* Progress bar */}
      <div style={{ display:'flex', gap: 6, marginBottom: 18 }}>
        {questions.map((_, i) => (
          <div key={i} style={{
            flex:1, height:4, borderRadius:99,
            background: i < qIdx ? color : i === qIdx ? `${color}60` : 'rgba(255,255,255,0.07)',
            transition:'background 0.3s',
          }} />
        ))}
      </div>

      {/* Question number */}
      <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:`${color}80`, fontWeight:800, marginBottom:10 }}>
        Question {qIdx+1} of {questions.length}
      </div>

      {/* Question text */}
      <div style={{
        fontSize:16, fontWeight:900, color:'#fff', lineHeight:1.45,
        marginBottom:18, minHeight:52,
        animation: animIn ? 'slideQ 0.25s ease' : 'slideQOut 0.2s ease',
      }}>
        {q.q}
      </div>

      {/* Options */}
      <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:16 }}>
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect  = i === q.correct;
          let bg    = 'rgba(255,255,255,0.04)';
          let border = 'rgba(255,255,255,0.1)';
          let textColor = 'rgba(255,255,255,0.7)';
          if (revealed) {
            if (isCorrect)              { bg='rgba(74,222,128,0.15)'; border='rgba(74,222,128,0.7)'; textColor='#4ade80'; }
            else if (isSelected)        { bg='rgba(248,113,113,0.15)'; border='rgba(248,113,113,0.7)'; textColor='#f87171'; }
          } else if (isSelected) {
            bg=`${color}20`; border=color; textColor='#fff';
          }
          return (
            <button key={i} onClick={() => choose(i)} style={{
              padding:'11px 14px', borderRadius:12,
              background:bg, border:`1.5px solid ${border}`,
              color:textColor, fontWeight:800, fontSize:13, textAlign:'left',
              cursor: revealed ? 'default' : 'pointer',
              fontFamily:'"Nunito",system-ui,sans-serif',
              display:'flex', alignItems:'center', gap:10,
              transition:'all 0.15s',
            }}>
              <div style={{
                width:24, height:24, borderRadius:6, flexShrink:0,
                background: isSelected && !revealed ? color : revealed && isCorrect ? '#4ade80' : revealed && isSelected ? '#f87171' : 'rgba(255,255,255,0.08)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:900, color:'#000',
              }}>
                {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : String.fromCharCode(65+i)}
              </div>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation box */}
      {revealed && (
        <div style={{
          background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:12, padding:'12px 14px', marginBottom:14,
          animation:'fadeUp 0.3s ease',
        }}>
          <div style={{ fontSize:10, letterSpacing:1.5, textTransform:'uppercase', color:'rgba(255,255,255,0.3)', fontWeight:800, marginBottom:4 }}>
            💡 Why?
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', fontWeight:700, lineHeight:1.6 }}>
            {q.explanation}
          </div>
        </div>
      )}

      {/* Action button */}
      {!revealed ? (
        <button onClick={confirm} disabled={selected===null} style={{
          width:'100%', padding:'12px',
          background: selected!==null ? `linear-gradient(135deg,${color},${color}aa)` : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${selected!==null ? color : 'rgba(255,255,255,0.1)'}`,
          borderRadius:12, color: selected!==null ? '#000' : 'rgba(255,255,255,0.3)',
          fontWeight:900, fontSize:14, cursor: selected!==null ? 'pointer' : 'not-allowed',
          fontFamily:'"Nunito",system-ui,sans-serif',
          transition:'all 0.2s',
          boxShadow: selected!==null ? `0 4px 20px ${glow}60` : 'none',
        }}>
          CHECK ANSWER
        </button>
      ) : (
        <button onClick={advance} style={{
          width:'100%', padding:'12px',
          background:'linear-gradient(135deg,#4ade80,#16a34a)',
          border:'1.5px solid #4ade80', borderRadius:12,
          color:'#052e16', fontWeight:900, fontSize:14, cursor:'pointer',
          fontFamily:'"Nunito",system-ui,sans-serif',
          boxShadow:'0 4px 20px rgba(74,222,128,0.4)',
          animation:'fadeUp 0.3s ease',
        }}>
          {qIdx < questions.length-1 ? 'NEXT QUESTION →' : 'SEE MY SCORE ✦'}
        </button>
      )}
    </div>
  );
}

// ─── Badge tab ────────────────────────────────────────────────────────────────
function BadgeTab({ chapter, stars, earned }: { chapter: Chapter; stars: number; earned: boolean }) {
  const [confetti, setConfetti] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (earned && !shown.current) {
      shown.current = true;
      setTimeout(() => setConfetti(true), 300);
      setTimeout(() => setConfetti(false), 2200);
    }
  }, [earned]);

  if (!earned) {
    return (
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ fontSize:48, marginBottom:12, filter:'grayscale(1) brightness(0.3)' }}>🏅</div>
        <div style={{ fontSize:15, fontWeight:800, color:'rgba(255,255,255,0.25)', lineHeight:1.6 }}>
          Complete the quiz to<br/>earn your badge
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:'relative', textAlign:'center', padding:'24px 16px 20px', overflow:'hidden' }}>
      <Confetti active={confetti} />

      {/* Badge coin */}
      <div style={{
        position:'relative', display:'inline-block', marginBottom:20,
        animation:'badgeDrop 0.6s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Outer glow ring */}
        <div style={{
          position:'absolute', inset:-16, borderRadius:'50%',
          background:`radial-gradient(circle, ${chapter.glow} 0%, transparent 70%)`,
          animation:'badgeGlow 2s ease-in-out infinite',
        }} />
        {/* Badge */}
        <div style={{
          width:130, height:130, borderRadius:'50%',
          background:`conic-gradient(from 0deg, ${chapter.color}, ${chapter.color}80, ${chapter.color})`,
          border:`4px solid ${chapter.color}`,
          boxShadow:`0 0 0 6px rgba(0,0,0,0.5), 0 0 0 8px ${chapter.color}40, 0 20px 60px ${chapter.glow}`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          position:'relative',
        }}>
          <div style={{
            width:114, height:114, borderRadius:'50%',
            background:'linear-gradient(145deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))',
            border:`2px solid rgba(255,255,255,0.1)`,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:4,
          }}>
            <div style={{ fontSize:42 }}>{chapter.icon}</div>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:chapter.color, fontWeight:900 }}>
              MASTERED
            </div>
          </div>
        </div>
      </div>

      {/* Chapter name */}
      <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:`${chapter.color}80`, fontWeight:800, marginBottom:4 }}>
        {chapter.subtitle}
      </div>
      <div style={{ fontFamily:'Georgia,serif', fontWeight:900, fontSize:22, color:'#fff', marginBottom:12 }}>
        {chapter.title}
      </div>

      {/* Stars */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
        <Stars count={stars} size={28} animate />
      </div>

      {/* Score message */}
      <div style={{
        background:`${chapter.color}12`, border:`1.5px solid ${chapter.color}30`,
        borderRadius:14, padding:'12px 16px',
        fontSize:13, color:'rgba(255,255,255,0.6)', fontWeight:700, lineHeight:1.6,
      }}>
        {stars===3 && '🌟 Flawless! You\'re a banking genius. All 3 answers correct!'}
        {stars===2 && '✨ Solid knowledge! 2 out of 3 — you\'ve got this concept.'}
        {stars===1 && '📚 A good start! 1 out of 3 — re-read the lesson to master it.'}
        {stars===0 && '💪 No worries! Read the Story and Learn tabs again — you\'ll ace it.'}
      </div>
    </div>
  );
}

// ─── Learn Tab — visual infographic ──────────────────────────────────────────
function LearnTab({ chapter }: { chapter: Chapter }) {
  const [visIdx, setVisIdx] = useState(0);
  const items = chapter.content.body;

  return (
    <div>
      {/* Card navigator */}
      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        {items.map((_,i) => (
          <button key={i} onClick={()=>setVisIdx(i)} style={{
            flex:1, height:5, borderRadius:99, border:'none', cursor:'pointer',
            background: i===visIdx ? chapter.color : 'rgba(255,255,255,0.1)',
            transition:'background 0.2s',
            padding:0,
          }} />
        ))}
      </div>

      {/* Content card */}
      <div key={visIdx} style={{
        background:`linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.35))`,
        border:`1.5px solid ${chapter.color}25`,
        borderRadius:18, padding:'20px 18px 18px',
        minHeight:110,
        boxShadow:`inset 0 0 40px ${chapter.glow}08`,
        animation:'slideQ 0.25s ease',
        marginBottom:14,
      }}>
        <div style={{
          fontSize:10, letterSpacing:2, textTransform:'uppercase',
          color:`${chapter.color}80`, fontWeight:800, marginBottom:10,
        }}>
          Point {visIdx+1} of {items.length}
        </div>
        <p style={{ margin:0, fontSize:14, lineHeight:1.75, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>
          {items[visIdx]}
        </p>
      </div>

      {/* Did you know */}
      <div style={{
        background:'rgba(251,191,36,0.07)', border:'1.5px solid rgba(251,191,36,0.25)',
        borderRadius:14, padding:'13px 16px',
        display:'flex', gap:12, alignItems:'flex-start', marginBottom:14,
      }}>
        <span style={{ fontSize:20, flexShrink:0 }}>💡</span>
        <div>
          <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'rgba(251,191,36,0.6)', fontWeight:800, marginBottom:4 }}>
            Did You Know?
          </div>
          <div style={{ fontSize:12.5, color:'#fef3c7', fontWeight:700, lineHeight:1.65 }}>
            {chapter.content.didYouKnow}
          </div>
        </div>
      </div>

      {/* In game */}
      <div style={{
        background:`${chapter.color}0a`, border:`1.5px solid ${chapter.color}22`,
        borderRadius:14, padding:'13px 16px',
        display:'flex', gap:12, alignItems:'flex-start',
      }}>
        <span style={{ fontSize:20, flexShrink:0 }}>🎲</span>
        <div>
          <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:`${chapter.color}80`, fontWeight:800, marginBottom:4 }}>
            In Your Game
          </div>
          <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.7)', fontWeight:700, lineHeight:1.65 }}>
            {chapter.content.inGame}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export interface ChapterCardProps {
  chapter: Chapter;
  onClose: () => void;
}

export default function ChapterCard({ chapter, onClose }: ChapterCardProps) {
  const lsKey       = `bkp_quiz_${chapter.id}`;
  const [tab, setTab]       = useState<'story'|'learn'|'quiz'|'badge'>('story');
  const [quizDone, setQuizDone]   = useState(false);
  const [stars, setStars]         = useState(0);

  // Load persisted stars
  useEffect(() => {
    try {
      const saved = localStorage.getItem(lsKey);
      if (saved) { const d = JSON.parse(saved); setStars(d.stars); setQuizDone(true); }
    } catch {}
  }, [lsKey]);

  function handleQuizComplete(s: number) {
    setStars(s); setQuizDone(true);
    try { localStorage.setItem(lsKey, JSON.stringify({ stars: s, completedAt: Date.now() })); } catch {}
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:500,
        background:'rgba(0,0,0,0.92)',
        backdropFilter:'blur(14px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:16,
        animation:'bkFade 0.2s ease',
        fontFamily:'"Nunito",system-ui,sans-serif',
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          width:'100%', maxWidth:520,
          maxHeight:'92vh',
          display:'flex', flexDirection:'column',
          background:'linear-gradient(170deg,#1c3d0d 0%,#0e2207 55%,#0a1a05 100%)',
          border:'2px solid #4a7c2a',
          borderRadius:24,
          boxShadow:[
            '0 0 0 1px rgba(74,222,128,0.07)',
            '0 0 0 5px rgba(10,26,5,0.96)',
            '0 0 0 6px rgba(74,124,42,0.2)',
            '0 50px 120px rgba(0,0,0,0.9)',
          ].join(','),
          animation:'modalPop 0.3s cubic-bezier(0.34,1.4,0.64,1)',
          overflow:'hidden',
        }}
      >
        {/* Top color bar */}
        <div style={{ height:4, background:`linear-gradient(90deg,transparent,${chapter.color},transparent)`, opacity:0.9 }} />

        {/* Hero header */}
        <div style={{
          padding:'20px 22px 14px',
          background:`radial-gradient(ellipse at 50% -20%, ${chapter.color}18 0%, transparent 70%)`,
          display:'flex', alignItems:'center', gap:14, flexShrink:0,
        }}>
          {/* Icon */}
          <div style={{
            width:60, height:60, borderRadius:16, flexShrink:0,
            background:`radial-gradient(circle at 35% 30%, ${chapter.color}50, rgba(0,0,0,0.6))`,
            border:`2.5px solid ${chapter.color}70`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
            boxShadow:`0 0 24px ${chapter.glow}60, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}>{chapter.icon}</div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:`${chapter.color}80`, fontWeight:800, marginBottom:2 }}>
              {chapter.subtitle}
            </div>
            <div style={{ fontFamily:'Georgia,serif', fontWeight:900, fontSize:20, color:chapter.color, lineHeight:1.1,
              textShadow:`0 0 20px ${chapter.glow}` }}>
              {chapter.title}
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:700, marginTop:3 }}>
              {chapter.content.headline}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
            {quizDone && <Stars count={stars} size={14} />}
            <button onClick={onClose} style={{
              width:30, height:30, borderRadius:8,
              background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)',
              color:'rgba(255,255,255,0.5)', fontSize:18, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
            }}>×</button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <Tab label="Story"  icon="📖" active={tab==='story'}  onClick={()=>setTab('story')} />
          <Tab label="Learn"  icon="🧠" active={tab==='learn'}  onClick={()=>setTab('learn')} />
          <Tab label="Quiz"   icon="❓" active={tab==='quiz'}   onClick={()=>setTab('quiz')} />
          <Tab label="Badge"  icon="🏅" active={tab==='badge'}  onClick={()=>setTab('badge')} disabled={false} />
        </div>

        {/* Tab content */}
        <div style={{
          flex:1, overflowY:'auto', padding:'18px 20px 22px',
          scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.08) transparent',
        }}>
          {tab==='story' && (
            <div key="story" style={{ animation:'tabFade 0.28s ease' }}>
              {chapter.content.body.map((para,i) => (
                <p key={i} style={{
                  margin:`0 0 ${i<chapter.content.body.length-1?'14px':'0'}`,
                  fontSize:14, lineHeight:1.75, color:'rgba(255,255,255,0.75)', fontWeight:600,
                  borderLeft: i===0 ? `3px solid ${chapter.color}50` : 'none',
                  paddingLeft: i===0 ? 14 : 0,
                  animation:`paraSlide 0.3s ${i*0.07}s both ease-out`,
                }}>{para}</p>
              ))}
              {/* Tips */}
              <div style={{ marginTop:18, borderRadius:14, overflow:'hidden', border:'1.5px solid rgba(255,255,255,0.07)' }}>
                <div style={{ background:'rgba(0,0,0,0.3)', padding:'8px 16px',
                  fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,0.25)', fontWeight:800 }}>
                  🌟 Key Takeaways
                </div>
                {chapter.content.tips.map((tip,i)=>(
                  <div key={i} style={{ padding:'10px 16px', borderTop:'1px solid rgba(255,255,255,0.05)',
                    display:'flex', gap:10, alignItems:'flex-start',
                    background: i%2===0?'rgba(255,255,255,0.02)':'transparent' }}>
                    <span style={{ color:chapter.color, fontSize:14, flexShrink:0, marginTop:1 }}>›</span>
                    <span style={{ fontSize:12.5, color:'rgba(255,255,255,0.6)', fontWeight:700, lineHeight:1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>setTab('learn')} style={{
                width:'100%', marginTop:16, padding:'11px',
                background:`${chapter.color}18`, border:`1.5px solid ${chapter.color}40`,
                borderRadius:12, color:chapter.color, fontWeight:900, fontSize:13,
                cursor:'pointer', fontFamily:'"Nunito",system-ui,sans-serif',
              }}>
                CONTINUE TO LEARN 🧠
              </button>
            </div>
          )}
          {tab==='learn' && <div key="learn" style={{ animation:'tabFade 0.28s ease' }}><LearnTab chapter={chapter} /></div>}
          {tab==='quiz'  && (
            <div key="quiz" style={{ animation:'tabFade 0.28s ease' }}>
              <QuizTab
                chapterId={chapter.id} color={chapter.color} glow={chapter.glow}
                onComplete={handleQuizComplete}
              />
            </div>
          )}
          {tab==='badge' && (
            <div key="badge" style={{ animation:'tabFade 0.28s ease' }}>
              <BadgeTab chapter={chapter} stars={stars} earned={quizDone} />
            </div>
          )}
        </div>

        {/* Bottom color bar */}
        <div style={{ height:3, background:`linear-gradient(90deg,transparent,${chapter.color}50,transparent)`, flexShrink:0 }} />
      </div>

      <style>{`
        @keyframes bkFade     { from{opacity:0} to{opacity:1} }
        @keyframes modalPop   { from{opacity:0;transform:scale(0.93) translateY(20px)} to{opacity:1;transform:none} }
        @keyframes tabFade    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes slideQ     { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:none} }
        @keyframes slideQOut  { from{opacity:1;transform:none} to{opacity:0;transform:translateX(-16px)} }
        @keyframes paraSlide  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes starPop    { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes badgeDrop  { from{opacity:0;transform:scale(0.5) rotate(-20deg)} to{opacity:1;transform:none} }
        @keyframes badgeGlow  { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes floatIcon  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes confettiFall {
          0%   { transform:translateY(0) rotate(0deg); opacity:1 }
          100% { transform:translateY(110vh) rotate(540deg); opacity:0 }
        }
        ::-webkit-scrollbar { width:5px }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px }
      `}</style>
    </div>
  );
}