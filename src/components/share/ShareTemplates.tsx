import React, { useEffect, useRef, useState } from 'react';
import { LoveCode } from './LoveCode';
import { ScoreRing } from '../ui/ScoreRing';
import { Sparkles, MapPin, Flame, TrendingUp, TrendingDown } from 'lucide-react';

export type ShareFormat = 'story' | 'square';
export type ShareTemplateTheme =
  | 'brutal-truth'
  | 'wrapped'
  | 'daily-fond'
  | 'constellation'
  | 'aura'
  | 'receipt'
  | 'hall-of-fame'
  | 'podium'
  | 'fond-rating'
  | 'membership'
  | 'player-stats'
  | 'profile-card'
  | 'profile-page'
  | 'verdict-card'
  | 'leaderboard-card'
  | 'fond-identity';

type C = {
  username: string;
  partnerName?: string;
  avatarUrl?: string | null;
  headline?: string;
  verdict?: string;
  score?: number;
  rank?: number;
  city?: string;
  date?: string;
  streak?: number;
  bestScore?: number;
  totalPosts?: number;
  bio?: string|null;
  age?: string|null;
  gender?: string|null;
  occupation?: string|null;
  country?: string|null;
};

interface TP { content: C; format: ShareFormat; }

// ═══════════════════════════════════════════════════════════════
// TIERS
// ═══════════════════════════════════════════════════════════════
type TK = 'still-dating'|'its-complicated'|'officially-exclusive'|'relationship-goals'|'certified-partner-material'|'gold-standard'|'legendary'|'algorithm-has-no-words';
const TIERS: Record<TK,{name:string;color:string;desc:string}> = {
  'still-dating':              {name:'Still Dating',              color:'#EB6E73',desc:'The algorithm sees potential. Somewhere.'},
  'its-complicated':           {name:"It's Complicated",          color:'#EB6E73',desc:'Mixed signals detected. Proceed with caution.'},
  'officially-exclusive':      {name:'Officially Exclusive',      color:'#EBA564',desc:'Steady. Reliable. Above average — barely.'},
  'relationship-goals':        {name:'Relationship Goals',        color:'#EBA564',desc:'Other couples are taking notes. Quietly.'},
  'certified-partner-material':{name:'Certified Partner Material',color:'#64B491',desc:'The algorithm is impressed. Genuinely.'},
  'gold-standard':             {name:'Gold Standard',             color:'#DCBE78',desc:'Elite tier. The bar has been relocated.'},
  'legendary':                 {name:'Legendary',                 color:'#DCBE78',desc:'Your grandchildren will hear this story.'},
  'algorithm-has-no-words':    {name:'The Algorithm Has No Words',color:'#DCBE78',desc:'The AI has stopped taking notes and started taking lessons.'},
};
function tier(s:number){return s>=97?TIERS['algorithm-has-no-words']:s>=92?TIERS['legendary']:s>=85?TIERS['gold-standard']:s>=75?TIERS['certified-partner-material']:s>=65?TIERS['relationship-goals']:s>=55?TIERS['officially-exclusive']:s>=40?TIERS['its-complicated']:TIERS['still-dating'];}
function sHex(s:number){return s>=92?'#DCBE78':s>=75?'#64B491':s>=55?'#EBA564':'#EB6E73';}

// ═══════════════════════════════════════════════════════════════
// 1. THE BRUTAL TRUTH — Red menace, verdict is king
// ═══════════════════════════════════════════════════════════════
function BrutalTruthTemplate({content}:TP){const s=content.score||0;const c=sHex(s);const t=tier(s);return(
<div className="relative w-full h-full flex flex-col bg-[#0a0406] overflow-hidden">
  <div className="absolute top-0 left-0 w-full h-[50%] bg-[radial-gradient(ellipse_at_50%_0%,#E8456B_0%,transparent_70%)] opacity-[0.12]"/>
  <div className="absolute bottom-0 left-0 w-full h-[35%] bg-[radial-gradient(ellipse_at_50%_100%,#E8456B_0%,transparent_70%)] opacity-[0.06]"/>
  <div className="relative z-10 flex items-center justify-between px-12 pt-14">
    <div className="flex items-center gap-3"><div className="h-2.5 w-2.5 bg-[#E8456B] rounded-full"/><span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#E8456B]">The Brutal Truth</span></div>
    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#E8456B]/25">classified</span>
  </div>
  <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-12">
    {/* Partner × username */}
    {content.partnerName&&<div className="flex items-center gap-2 text-sm mb-6"><span className="text-white/30">@{content.username.replace('@','')}</span><span className="text-white/15">×</span><span className="text-white/40 font-medium">{content.partnerName}</span></div>}
    {/* Quote */}
    <h2 className="font-display italic text-[2.75rem] sm:text-[3.5rem] leading-[1.06] text-white/95 max-w-[85%]">"{content.verdict||content.headline||'The AI has spoken.'}"</h2>
    {/* Score — in a circle with glow, like ScoreRing */}
    <div className="mt-12 relative">
      <div className="w-44 h-44 rounded-full flex flex-col items-center justify-center" style={{border:`3px solid ${c}60`,boxShadow:`0 0 60px -10px ${c}40, inset 0 0 30px -10px ${c}20`}}>
        <span className="font-score text-[4.5rem] leading-none text-white">{s}</span>
        <span className="text-xs text-white/30 mt-1 font-bold uppercase tracking-wider">of 100</span>
      </div>
    </div>
    {/* Tier badge under score */}
    {t&&<div className="mt-4 px-4 py-1 rounded-full border border-[#E8456B]/20 bg-[#E8456B]/[0.06] inline-flex items-center gap-1.5"><span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#E8456B]">{t.name}</span></div>}
  </div>
  <div className="relative z-10 flex items-end justify-between px-12 pb-10"><LoveCode username={content.username} theme="dark"/>{content.partnerName&&<span className="text-[10px] uppercase tracking-[0.15em] text-white/15 font-medium">subject: {content.partnerName}</span>}</div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 2. WRAPPED — Full-page data story, Spotify DNA
// ═══════════════════════════════════════════════════════════════
function WrappedTemplate({content}:TP){const s=content.score||0;const t=tier(s);const g=s>=85?{bg:'#0d1a12',mid:'#0f1f18',end:'#0a1510',accent:'#3ab870'}:s>=65?{bg:'#1a120a',mid:'#1f1810',end:'#15100a',accent:'#e8a840'}:{bg:'#140a0a',mid:'#1a1010',end:'#100a0a',accent:'#e87070'};return(
<div className="relative w-full h-full flex flex-col overflow-hidden" style={{background:`linear-gradient(180deg,${g.bg} 0%,${g.mid} 50%,${g.end} 100%)`}}>
  <div className="absolute top-[-8%] right-[-8%] w-[50%] aspect-square rounded-full opacity-[0.12] blur-[80px]" style={{backgroundColor:g.accent}}/>
  <div className="absolute bottom-[8%] left-[-5%] w-[40%] aspect-square rounded-full opacity-[0.06] blur-[100px]" style={{backgroundColor:g.accent}}/>
  <div className="relative z-10 flex flex-col h-full px-14">
    {/* Year header */}
    <div className="pt-16"><span className="text-white font-black text-[1.75rem] tracking-tighter block leading-none">2026</span><span className="text-white/70 font-black text-[1.75rem] tracking-tighter block leading-none">Wrapped</span></div>
    {/* Section 1: gesture */}
    <div className="mt-16"><p className="text-white/25 text-[10px] uppercase tracking-[0.25em] font-bold mb-3">Your Top Gesture</p><h2 className="font-display italic text-[2.5rem] sm:text-[3.25rem] leading-[1.1] text-white max-w-[85%]">"{content.headline||content.verdict||'The one that defined your year'}"</h2></div>
    {/* Section 2: score + tier */}
    <div className="mt-14 flex items-center gap-10"><div className="flex items-baseline gap-1.5"><span className="font-score text-[7rem] leading-none text-white">{s}</span><span className="text-xl text-white/25 font-bold">/100</span></div><div className="flex flex-col"><span className="text-white/15 text-[9px] uppercase tracking-[0.2em] font-bold mb-1.5">Tier Earned</span><span className="text-white/80 font-bold text-xl">{t.name}</span></div></div>
    {/* Section 3: stats grid */}
    <div className="mt-14 grid grid-cols-3 gap-4">
      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5"><div className="text-white/20 text-[9px] uppercase tracking-[0.15em] font-bold mb-2">Top Partner</div><div className="text-white/80 font-semibold text-base truncate">{content.partnerName||'Unknown'}</div></div>
      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5"><div className="text-white/20 text-[9px] uppercase tracking-[0.15em] font-bold mb-2">Streak</div><div className="text-white/80 font-semibold text-base flex items-center gap-1.5"><Flame className="h-4 w-4 text-orange-400"/>{content.streak||1}</div></div>
      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5"><div className="text-white/20 text-[9px] uppercase tracking-[0.15em] font-bold mb-2">Genre</div><div className="text-white/80 font-semibold text-base truncate">{t.name}</div></div>
    </div>
    {/* Section 4: AI message */}
    {content.verdict&&<div className="mt-12 pt-8 border-t border-white/[0.05]"><p className="text-white/15 text-[9px] uppercase tracking-[0.25em] font-bold mb-3">A Message From Your AI</p><p className="font-display italic text-xl text-white/45 leading-relaxed max-w-[85%]">"{content.verdict}"</p></div>}
    <div className="flex-1"/>
    <div className="pb-12 flex justify-between items-end"><LoveCode username={content.username} theme="gold"/><span className="text-white/[0.08] text-[10px] font-mono uppercase tracking-[0.15em]">wrapped.fond.app</span></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 3. DAILY FOND — Newspaper front page
// ═══════════════════════════════════════════════════════════════
function DailyFondTemplate({content}:TP){const s=content.score||0;const c=sHex(s);const d=content.date||new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});return(
<div className="relative w-full h-full flex flex-col bg-[#f9f7f2] overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(0,0,0,0.03),transparent)]"/>
  <div className="relative z-10 flex flex-col h-full px-14">
    {/* Masthead */}
    <div className="text-center pt-12 pb-4 border-b-[3px] border-black/80">
      <h1 className="font-display text-[2.5rem] sm:text-[3rem] tracking-[0.05em] font-bold text-black/90 leading-none">THE DAILY FOND</h1>
      <div className="flex justify-center items-center gap-4 mt-2">
        <span className="text-[10px] text-black/30 uppercase tracking-[0.2em] font-medium">{d}</span>
        <span className="text-[10px] text-black/15">·</span>
        <span className="text-[10px] text-black/30 uppercase tracking-[0.2em] font-medium">Special Edition</span>
      </div>
    </div>
    {/* Headline — the verdict */}
    <div className="flex-1 flex flex-col justify-center py-10">
      <h2 className="font-display text-[3.25rem] sm:text-[4rem] leading-[1.08] text-black/90 font-bold max-w-[90%]">{(content.verdict||'A Gesture Worth Recording').toUpperCase()}</h2>
      {/* Subhead — the gesture */}
      <p className="mt-6 font-display italic text-xl text-black/45 leading-relaxed max-w-[80%]">"{content.headline||content.verdict||'The details remain classified.'}"{content.partnerName&&<span className="not-italic text-black/25"> — with {content.partnerName}</span>}</p>
      {/* Divider */}
      <div className="w-full h-px bg-black/[0.06] my-8"/>
      {/* Market Watch box */}
      <div className="border border-black/[0.08] p-5 max-w-[280px]">
        <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-black/25 block mb-3">Market Watch</span>
        <div className="flex items-baseline gap-2 mb-2"><span className="font-score text-[3rem] leading-none text-black/80">{s}</span><span className="text-sm text-black/30">/100</span></div>
        <span className={`text-[10px] uppercase tracking-[0.15em] font-bold ${s>=75?'text-emerald-700':s>=55?'text-amber-700':'text-red-700'}`}>{s>=75?'▲ Romance Index Rising':s>=55?'■ Romance Index Stable':'▼ Romance Index Declining'}</span>
        <p className="text-[9px] text-black/25 leading-relaxed mt-2 italic">{tier(s).name} · {tier(s).desc}</p>
      </div>
    </div>
    {/* Footer */}
    <div className="pb-8 flex justify-between items-end"><LoveCode username={content.username} theme="light"/><span className="text-[9px] text-black/15 font-mono uppercase tracking-[0.15em]">fond.app/daily · Vol. I · Page A1</span></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 4. CONSTELLATION — Written in the stars
// ═══════════════════════════════════════════════════════════════
function ConstellationTemplate({content}:TP){const s=content.score||0;const c=sHex(s);const count=Math.max(5,Math.min(12,Math.floor(s/10)));const stars=Array.from({length:count},(_,i)=>({x:15+Math.random()*70,y:15+Math.random()*55,size:Math.random()*2+1.5}));return(
<div className="relative w-full h-full flex flex-col overflow-hidden" style={{background:`radial-gradient(ellipse_at_50%_50%,${c}08,transparent 70%), linear-gradient(180deg,#0a0f1a 0%,#0d1225 50%,#0a0f1a 100%)`}}>
  {/* The constellation */}
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
    {stars.map((st,i)=><React.Fragment key={i}><circle cx={st.x} cy={st.y} r={st.size*0.15} fill={i===0?c:'rgba(255,255,255,0.4)'} style={{filter:i===0?`drop-shadow(0 0 8px ${c})`:undefined}}/>{i>0&&<line x1={stars[i-1].x} y1={stars[i-1].y} x2={st.x} y2={st.y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.08"/>}</React.Fragment>)}
  </svg>
  {/* Content */}
  <div className="relative z-10 flex flex-col h-full px-14">
    <div className="pt-14"><span className="text-[10px] uppercase tracking-[0.35em] font-bold text-white/15">Your Romance, in the Stars</span></div>
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      {/* Score as brightest star */}
      <div className="flex items-baseline gap-3 mb-8"><span className="font-score text-[7rem] sm:text-[8.5rem] leading-none" style={{color:c,textShadow:`0 0 80px ${c}40`}}>{s}</span><span className="text-lg text-white/20 font-medium">/100</span></div>
      {/* Verdict as fortune */}
      <p className="font-display italic text-[1.75rem] sm:text-[2.25rem] leading-[1.15] text-white/50 max-w-[75%]">"{content.verdict||content.headline||'The stars have spoken.'}"</p>
      {/* Partner as constellation name */}
      {content.partnerName&&<div className="mt-10"><span className="text-[9px] uppercase tracking-[0.3em] text-white/15 font-bold block mb-1">Officially Named</span><span className="text-white/60 text-lg font-medium">{content.partnerName}</span></div>}
    </div>
    <div className="pb-10 flex justify-center"><LoveCode username={content.username} theme="gold"/></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 5. AURA — Full-bleed dreamlike gradient, anti-design
// ═══════════════════════════════════════════════════════════════
function AuraTemplate({content}:TP){const s=content.score||0;const c=sHex(s);return(
<div className="relative w-full h-full flex flex-col overflow-hidden" style={{background:`radial-gradient(ellipse at 30% 20%,${c}15 0%,transparent 50%), radial-gradient(ellipse at 70% 80%,rgb(var(--gold)/0.10) 0%,transparent 50%), radial-gradient(ellipse at 50% 50%,rgb(var(--primary)/0.08) 0%,transparent 70%), linear-gradient(180deg,#0e0a14 0%,#120e18 50%,#0e0a14 100%)`}}>
  <div className="relative z-10 flex flex-col h-full px-10">
    <div className="pt-12"><span className="text-[9px] uppercase tracking-[0.35em] text-white/12 font-bold block text-center">your aura, scored</span></div>
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      {/* Massive translucent score */}
      <span className="font-score text-[11rem] sm:text-[14rem] leading-[0.82] tracking-tight select-none" style={{color:c,opacity:0.45,textShadow:`0 0 120px ${c}30`}}>{s}</span>
      {/* Partner */}
      {content.partnerName&&<p className="mt-6 text-white/30 text-lg font-medium tracking-wide">with {content.partnerName}</p>}
      {/* Verdict — barely there */}
      {content.verdict&&<p className="mt-8 font-display italic text-base text-white/18 leading-relaxed max-w-[70%]">"{content.verdict}"</p>}
    </div>
    <div className="pb-10 flex justify-center opacity-50"><LoveCode username={content.username} theme="gold"/></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 6. THE RECEIPT — Post content above, itemized below
// ═══════════════════════════════════════════════════════════════
function ReceiptTemplate({content}:TP){const s=content.score||0;const d=content.date||new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});const tm=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});return(
<div className="relative w-full h-full flex flex-col bg-[#f7f5f0] overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,0,0,0.015),transparent)]"/>
  <div className="relative z-10 flex flex-col h-full px-14">
    {/* Statement header */}
    <div className="pt-12 pb-6 border-b-2 border-dashed border-black/10">
      <h2 className="font-sans text-base font-bold tracking-[0.3em] uppercase text-black/75">Fond</h2>
      <p className="text-[9px] text-black/30 uppercase tracking-[0.2em] mt-1">Official Romance Assessment</p>
      <div className="flex gap-4 mt-2"><span className="text-[9px] text-black/20 font-mono">{d} {tm}</span></div>
    </div>
    {/* Statement body: post content */}
    <div className="py-6 border-b border-dashed border-black/[0.06]">
      <p className="text-[10px] text-black/25 uppercase tracking-[0.2em] font-bold mb-2">Statement For</p>
      <p className="text-black/70 text-xl font-semibold">{content.partnerName||'someone'}</p>
      {content.headline&&<p className="mt-3 text-black/45 text-base italic leading-relaxed font-serif">"{content.headline}"</p>}
      {content.verdict&&<p className="mt-2 text-black/35 text-sm leading-relaxed font-serif">{content.verdict}</p>}
    </div>
    {/* Line items */}
    <div className="flex-1 flex flex-col justify-center space-y-5 py-8">
      {[{l:'Thoughtfulness',v:Math.min(s+8,100)},{l:'Effort',v:Math.max(s-5,1)},{l:'Creativity',v:Math.min(s+3,100)},{l:'Emotional Weight',v:s},{l:'Authenticity Tax',v:-3}].map((li,i)=><div key={i} className="flex justify-between items-center"><span className="text-black/45 text-[11px] uppercase tracking-[0.12em] font-medium">{li.l}</span><span className={`font-mono text-[11px] tabular-nums ${li.v<0?'text-amber-600/70':'text-black/65'}`}>{li.v}</span></div>)}
      <div className="border-t-2 border-dashed border-black/10 pt-5"><div className="flex justify-between items-end"><span className="text-black/80 font-bold text-sm uppercase tracking-[0.15em]">Total</span><div className="flex items-baseline gap-1"><span className="font-score text-[3rem] leading-none text-black">{s}</span><span className="text-black/25 text-xs font-medium">/100</span></div></div></div>
      {content.verdict&&<div className="pt-3 border-t border-black/[0.03]"><p className="text-[8px] text-black/20 uppercase tracking-[0.2em] font-bold mb-1">AI Notes</p><p className="text-black/35 text-[11px] italic leading-relaxed font-serif">"{content.verdict}"</p></div>}
    </div>
    {/* Footer */}
    <div className="border-t-2 border-dashed border-black/10 pt-6 pb-8 flex justify-between items-end"><LoveCode username={content.username} theme="light"/><div className="flex flex-col items-end"><div className="flex gap-[1.5px] mb-2">{[...Array(22)].map((_,i)=><div key={i} className="bg-black/10" style={{width:`${Math.random()*3+1}px`,height:'18px'}}/>)}</div><span className="text-[7px] text-black/10 font-mono uppercase">fond.app · #{Math.floor(s*137)%9999}</span></div></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 7. HALL OF FAME (Rank) — "I ranked #32 in Mumbai"
// ═══════════════════════════════════════════════════════════════
function HallOfFameTemplate({content}:TP){const r=content.rank||1;const s=content.score||0;return(
<div className="relative w-full h-full flex flex-col bg-[#080808] overflow-hidden">
  <div className="absolute top-0 right-0 w-[60%] h-[50%] rounded-full bg-gold/[0.04] blur-[120px]"/>
  <div className="absolute bottom-0 left-0 w-[50%] h-[30%] rounded-full bg-primary/[0.02] blur-[80px]"/>
  <div className="relative z-10 flex flex-col h-full px-14">
    <div className="pt-14 flex items-center gap-3"><Sparkles className="h-4 w-4 text-gold"/><span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold/70">Fond</span></div>
    <div className="flex-1 flex flex-col justify-center">
      {/* The hero statement */}
      <div className="flex items-baseline gap-6">
        <span className="font-score text-[12rem] sm:text-[15rem] leading-[0.82] text-gold tracking-tight">#{r}</span>
      </div>
      <p className="mt-2 font-display italic text-[2.5rem] sm:text-[3rem] leading-[1.1] text-white/70 max-w-[85%]">in {content.city||'the world'}</p>
      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-gold/15 via-gold/10 to-transparent mt-10 mb-8"/>
      {/* Stats row */}
      <div className="flex items-center gap-12">
        <div><span className="text-[9px] uppercase tracking-[0.2em] text-white/20 block mb-1">Avg Score</span><span className="font-score text-[2.5rem] text-white">{s}</span></div>
        {content.streak&&<div><span className="text-[9px] uppercase tracking-[0.2em] text-white/20 block mb-1">Streak</span><span className="font-score text-[2.5rem] text-white flex items-center gap-1.5"><Flame className="h-5 w-5 text-orange-400"/>{content.streak}</span></div>}
      </div>
    </div>
    <div className="pb-10 flex justify-between items-end"><LoveCode username={content.username} theme="gold"/><span className="text-[9px] text-white/12 uppercase tracking-[0.15em]">Global Leaderboard</span></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 8. THE ANNOUNCEMENT — Sports broadcast rank reveal
// ═══════════════════════════════════════════════════════════════
function PodiumTemplate({content}:TP){const r=content.rank||1;const s=content.score||0;const t3=r<=3;const col=r===1?'#DCBE78':r===2?'#B4B4B8':r===3?'#CD7F32':sHex(s);return(
<div className="relative w-full h-full flex flex-col bg-[#060608] overflow-hidden">
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[50%] rounded-full opacity-[0.05] blur-[140px]" style={{backgroundColor:col}}/>
  <div className="relative z-10 flex flex-col h-full px-14">
    <div className="pt-14 flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.35em] font-bold text-white/30">The Standings</span><span className="text-[9px] uppercase tracking-[0.2em] text-white/15">{content.city||'Global'}</span></div>
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Rank — monumental */}
      <span className="font-score text-[16rem] sm:text-[20rem] leading-[0.8] tracking-tight select-none" style={{color:col,textShadow:`0 0 80px ${col}20`}}>#{r}</span>
      {/* Label */}
      <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-white/25 mt-2">{t3?'You\'re on the podium':r<=10?'Top 10':'Climbing the ranks'}</span>
      {/* Divider */}
      <div className="w-24 h-px bg-white/[0.04] my-8"/>
      {/* Identity */}
      <p className="font-display italic text-2xl text-white/60">@{content.username.replace('@','')}</p>
      {content.city&&<div className="flex items-center gap-1.5 mt-3 text-white/20 text-sm"><MapPin className="h-3.5 w-3.5"/><span>{content.city}</span></div>}
      {/* Stats */}
      <div className="flex items-center gap-10 mt-10">
        <div className="text-center"><div className="font-score text-3xl text-white">{s}</div><div className="text-[9px] text-white/20 uppercase tracking-[0.2em] mt-1">Score</div></div>
        <div className="w-px h-10 bg-white/[0.04]"/>
        <div className="text-center"><div className="text-2xl">{t3?'🏅':r<=10?'🔥':'📈'}</div><div className="text-[9px] text-white/20 uppercase tracking-[0.2em] mt-1">{t3?'Podium':r<=10?'Rising':'Climbing'}</div></div>
      </div>
    </div>
    <div className="pb-10 flex justify-center"><LoveCode username={content.username} theme="gold"/></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 9. FOND RATING — Institutional credit report
// ═══════════════════════════════════════════════════════════════
function FondRatingTemplate({content}:TP){const s=content.score||0;const t=tier(s);const outlook=s>=85?'Positive':s>=65?'Stable':s>=45?'Under Review':'Negative';const oc=outlook==='Positive'?'#64B491':outlook==='Stable'?'#DCBE78':outlook==='Under Review'?'#EBA564':'#EB6E73';return(
<div className="relative w-full h-full flex flex-col bg-[#0a080c] overflow-hidden">
  <div className="absolute top-0 left-0 w-full h-[40%] opacity-[0.04] blur-[100px] rounded-full" style={{backgroundColor:t.color}}/>
  <div className="relative z-10 flex flex-col h-full px-14">
    <div className="pt-14 flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.35em] font-bold text-white/30">Fond Rating Agency</span><span className="text-[9px] text-white/12 font-mono uppercase">{content.date||'Today'}</span></div>
    <div className="flex-1 flex flex-col justify-center">
      <p className="text-white/35 text-sm mb-8"><span className="font-semibold text-white/60">@{content.username.replace('@','')}</span>{content.city&&<span className="text-white/15"> · {content.city}</span>}</p>
      {/* Rating grade */}
      <h2 className="font-display italic text-[4.5rem] sm:text-[5.5rem] leading-[1.05] font-bold text-white/90 mb-3">{t.name}</h2>
      <div className="flex items-center gap-6">
        <div className="flex items-baseline gap-1.5"><span className="font-score text-[5rem] leading-none text-white">{s}</span><span className="text-lg text-white/20 font-medium">/100</span></div>
        <div className="flex flex-col"><span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold mb-1">Outlook</span><div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:oc}}/><span className="text-base font-bold" style={{color:oc}}>{outlook}</span></div></div>
      </div>
      {/* Divider */}
      <div className="w-full h-px bg-white/[0.04] my-8"/>
      {/* Analyst summary */}
      <p className="text-white/25 text-sm leading-relaxed max-w-[85%] italic">{t.desc} This rating reflects cumulative romantic performance and is subject to change with future gestures.</p>
    </div>
    <div className="pb-10 flex justify-between items-end"><LoveCode username={content.username} theme="dark"/><span className="text-[8px] text-white/10 font-mono uppercase tracking-[0.15em]">RAT-{Date.now().toString(36).toUpperCase()}</span></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 10. MEMBERSHIP CARD — Amex Centurion-style profile
// ═══════════════════════════════════════════════════════════════
function AvatarOrb({url,name,size,color,border}:{url?:string|null;name:string;size:string;color:string;border:string}){return(
<div className={`${size} rounded-full overflow-hidden flex items-center justify-center font-display text-7xl text-white/80 shrink-0`} style={{border,borderColor:`${color}30`,background:`radial-gradient(circle at 40% 35%,${color}15,transparent 70%)`,boxShadow:`0 0 80px -30px ${color}20`}}>
  {url?<img src={url} alt={name} loading="lazy" className="w-full h-full object-cover"/>:<span>{(name.replace('@','')||'U')[0].toUpperCase()}</span>}
</div>)}

function MembershipTemplate({content}:TP){const s=content.score||0;const t=tier(s);return(
<div className="relative w-full h-full flex flex-col bg-[#0a080c] overflow-hidden">
  <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full bg-gold/[0.03] blur-[100px]"/>
  <div className="absolute bottom-0 left-0 w-[50%] h-[30%] rounded-full bg-primary/[0.02] blur-[80px]"/>
  <div className="relative z-10 flex flex-col h-full px-14">
    <div className="pt-12 flex items-center justify-between"><Sparkles className="h-4 w-4 text-gold/60"/><span className="text-[9px] uppercase tracking-[0.3em] text-gold/40 font-bold">Member Since 2026</span></div>
    <div className="flex-1 flex flex-col items-center justify-center">
      <AvatarOrb url={content.avatarUrl} name={content.username} size="w-52 h-52" color={t.color} border="1.5px solid"/>
      {/* Identity */}
      <h2 className="font-display italic text-[2.5rem] text-white/90">@{content.username.replace('@','')}</h2>
      <p className="text-white/35 text-base mt-2">{t.name}</p>
      {/* Stats row */}
      <div className="flex items-center gap-8 mt-12">
        <div className="text-center px-6"><div className="font-score text-3xl text-white">{s}</div><div className="text-[9px] text-white/20 uppercase tracking-[0.15em] mt-1.5">Score</div></div>
        <div className="w-px h-10 bg-white/[0.04]"/>
        <div className="text-center px-6"><div className="font-score text-3xl text-gold">{content.rank||'—'}</div><div className="text-[9px] text-white/20 uppercase tracking-[0.15em] mt-1.5">Rank</div></div>
        <div className="w-px h-10 bg-white/[0.04]"/>
        <div className="text-center px-6"><div className="font-score text-3xl text-white flex items-center justify-center gap-1"><Flame className="h-5 w-5 text-orange-400"/>{content.streak||1}</div><div className="text-[9px] text-white/20 uppercase tracking-[0.15em] mt-1.5">Streak</div></div>
      </div>
      {/* City */}
      {content.city&&<div className="flex items-center gap-1.5 mt-10 text-white/15 text-sm"><MapPin className="h-3.5 w-3.5"/><span>{content.city}</span></div>}
    </div>
    <div className="pb-10 flex justify-center"><LoveCode username={content.username} theme="gold"/></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 11. PLAYER STATS — NBA 2K stat screen
// ═══════════════════════════════════════════════════════════════
function PlayerStatsTemplate({content}:TP){const s=content.score||0;const t=tier(s);return(
<div className="relative w-full h-full flex flex-col bg-[#060608] overflow-hidden">
  <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-primary/[0.03] blur-[100px]"/>
  <div className="relative z-10 flex flex-col h-full px-14">
    <div className="pt-12 flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/25">Fond Athletics</span><span className="text-[9px] text-white/10 font-mono">SEASON 2026</span></div>
    <div className="flex-1 flex flex-col justify-center">
      {/* Player header */}
      <div className="flex items-center gap-6 mb-12">
        <div className="w-24 h-24 rounded-full border border-white/[0.06] bg-white/[0.02] flex items-center justify-center font-display text-4xl text-white/70 overflow-hidden">{content.avatarUrl?<img src={content.avatarUrl} alt={content.username} loading="lazy" className="w-full h-full object-cover"/>:<span>{(content.username.replace('@','')||'U')[0].toUpperCase()}</span>}</div>
        <div><h2 className="font-display italic text-3xl text-white/90">@{content.username.replace('@','')}</h2><p className="text-white/30 text-sm mt-1">{t.name} · {content.city||'Unlisted'}</p></div>
      </div>
      {/* Stat bars */}
      <div className="space-y-6 max-w-[500px]">
        {[{l:'AVERAGE SCORE',v:s,max:100,color:sHex(s)},{l:'RANK',v:content.rank||1,max:100,color:'#DCBE78',suffix:content.city?`in ${content.city}`:''},{l:'STREAK',v:content.streak||1,max:30,color:'#f97316'},{l:'TIER',v:s>=75?85:s>=55?60:s>=40?40:20,max:100,color:t.color,suffix:t.name}].map((bar,i)=><div key={i}>
          <div className="flex justify-between items-baseline mb-2"><span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/20">{bar.l}</span><span className="text-white/60 text-sm font-medium">{bar.v}{bar.suffix?<span className="text-white/15 ml-2">{bar.suffix}</span>:null}</span></div>
          <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,(bar.v/bar.max)*100)}%`,backgroundColor:bar.color}}/></div>
        </div>)}
      </div>
    </div>
    <div className="pb-10 flex justify-between items-end"><LoveCode username={content.username} theme="gold"/><span className="text-[9px] text-white/10 font-mono uppercase">fond.app/athletics</span></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 12. FOND ID — Clean identity card (profile)
// ═══════════════════════════════════════════════════════════════
function ProfileCardTemplate({content}:TP){const s=content.score||0;const t=tier(s);return(
<div className="relative w-full h-full flex flex-col bg-[#0a080c] overflow-hidden">
  <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[70%] h-[40%] rounded-full bg-gold/[0.04] blur-[120px]"/>
  <div className="absolute bottom-0 left-0 w-[60%] h-[35%] rounded-full bg-primary/[0.03] blur-[100px]"/>
  <div className="relative z-10 flex flex-col h-full px-14">
    <div className="pt-14 flex items-center justify-center"><div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]"><Sparkles className="h-3.5 w-3.5 text-gold"/><span className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold/80">Fond Member</span></div></div>
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-44 h-44 rounded-full border-2 flex items-center justify-center mb-8 font-display text-6xl text-white/80 overflow-hidden" style={{borderColor:`${t.color}30`,background:`radial-gradient(circle at 40% 35%,${t.color}15,transparent 70%)`,boxShadow:`0 0 60px -15px ${t.color}30`}}>{content.avatarUrl?<img src={content.avatarUrl} alt={content.username} loading="lazy" className="w-full h-full object-cover"/>:<span>{(content.username.replace("@","")||"U")[0].toUpperCase()}</span>}</div>
      <h2 className="font-display italic text-3xl text-white/90 mb-1">@{content.username.replace('@','')}</h2>
      <div className="flex items-center gap-2 mt-2 mb-8"><span className="text-white/50 text-sm font-medium">{t.name}</span></div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4 text-center"><div className="font-score text-2xl text-white">{s}</div><div className="text-[9px] text-white/25 uppercase tracking-[0.15em] mt-1">Avg Score</div></div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4 text-center"><div className="font-score text-2xl text-gold">{content.rank||'—'}</div><div className="text-[9px] text-white/25 uppercase tracking-[0.15em] mt-1">Rank</div></div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4 text-center"><div className="font-score text-2xl text-white flex items-center justify-center gap-1"><Flame className="h-4 w-4 text-orange-400"/>{content.streak||1}</div><div className="text-[9px] text-white/25 uppercase tracking-[0.15em] mt-1">Streak</div></div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4 text-center"><div className="text-2xl">{t.name.split(' ').map(w=>w[0]).join('')}</div><div className="text-[9px] text-white/25 uppercase tracking-[0.15em] mt-1">Tier</div></div>
      </div>
      {content.city&&<div className="flex items-center gap-1.5 mt-6 text-white/20 text-sm"><MapPin className="h-3.5 w-3.5"/><span>{content.city}</span></div>}
    </div>
    <div className="pb-10 flex justify-center"><LoveCode username={content.username} theme="gold"/></div>
  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 12a. PROFILE PAGE — Exact replica of profile page layout
// ═══════════════════════════════════════════════════════════════
function ProfilePageTemplate({content}:TP){const s=content.score||0;const t=tier(s);const sc=sHex(s);return(
<div className="absolute inset-0 flex flex-col overflow-hidden" style={{background:'rgb(var(--background))'}}>
  {/* Ambient glows */}
  <div className="absolute w-[900px] h-[900px] left-1/2 top-[-400px] -translate-x-1/2 rounded-full opacity-[0.20] blur-[90px]" style={{background:'radial-gradient(circle, rgb(var(--primary) / 0.3), transparent 70%)'}}/>
  <div className="absolute w-[600px] h-[600px] right-[-200px] bottom-[-100px] rounded-full opacity-[0.12] blur-[80px]" style={{background:'radial-gradient(circle, rgb(var(--gold) / 0.25), transparent 70%)'}}/>

  {/* Glass card container */}
  <div className="absolute inset-[60px] rounded-[60px] bg-white/[0.05] backdrop-blur-[40px] border border-white/[0.06] flex flex-col px-[70px] py-[60px]" style={{boxShadow:'0 40px 120px rgba(0,0,0,0.5), inset 0 1px rgba(255,255,255,0.08)'}}>

    {/* Brand */}
    <div className="flex items-center gap-3 mb-2">
      <Sparkles className="w-5 h-5 text-gold/60"/>
      <span className="text-[20px] tracking-[0.4em] font-bold text-white/40 uppercase">FOND</span>
    </div>

    {/* Avatar */}
    <div className="mx-auto mt-4 mb-[22px] w-[160px] h-[160px] rounded-full overflow-hidden flex items-center justify-center text-[70px] border-2 border-white/[0.10]" style={{background:'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--gold)))', boxShadow:'0 0 70px -10px ' + sc + '50'}}>
      {content.avatarUrl?<img src={content.avatarUrl} alt={content.username} loading="lazy" className="w-full h-full object-cover"/>:<span className="opacity-80">{(content.username.replace("@","")||"U")[0].toUpperCase()}</span>}
    </div>

    {/* Username + tier + city/streak */}
    <div className="text-center">
      <div className="font-display italic text-[48px] text-white/90 leading-tight">@{content.username.replace('@','')}</div>
      <div className="inline-flex items-center mt-[10px] px-[28px] py-[10px] rounded-full border border-gold/25 bg-gold/[0.08] text-gold font-semibold text-[20px] backdrop-blur-xl">{t.name}</div>
      {(content.city||content.streak)&&<div className="flex items-center justify-center gap-3 mt-[12px]">
        {content.city&&<span className="text-[18px] text-white/40">📍 {content.city}</span>}
        {content.streak&&content.streak>0&&<span className="inline-flex items-center gap-1 text-[18px]" style={{color:'rgb(var(--score-mid))'}}><Flame className="h-5 w-5" style={{fill:'rgb(var(--score-mid))'}}/>{content.streak}d</span>}
      </div>}
    </div>

    {/* Divider */}
    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-[36px]"/>

    {/* Hero score */}
    <div className="text-center">
      <div className="font-score text-[160px] leading-none tracking-tight select-none" style={{color:sc,textShadow:'0 0 50px ' + sc + '25, 0 0 120px ' + sc + '10'}}>{s}</div>
      <div className="mt-[8px] text-[26px] font-bold tracking-[0.15em] uppercase text-white/35">Average Score</div>
      {content.rank&&content.city?<div className="mt-[14px] text-[24px] font-semibold text-gold/80">🏆 #{content.rank} in {content.city}</div>
      :content.rank?<div className="mt-[14px] text-[24px] font-semibold text-gold/80">🏆 Global Rank #{content.rank}</div>
      :null}
    </div>

    {/* Stats grid — bento colored cards like profile page */}
    <div className="mt-[36px] grid grid-cols-2 gap-[16px]">
      {content.bestScore?<div className="rounded-[20px] p-[18px] border border-gold/20 bg-gradient-to-b from-gold/[0.06] to-gold/[0.02] backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gold/[0.04] blur-xl pointer-events-none"/>
        <div className="font-score text-[40px] leading-none text-gold">{content.bestScore}</div>
        <div className="text-[11px] uppercase tracking-widest text-gold/70 font-bold mt-1">Best Score</div>
      </div>:null}
      {content.streak&&content.streak>0?<div className="rounded-[20px] p-[18px] border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-primary/[0.02] backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary/[0.04] blur-xl pointer-events-none"/>
        <div className="font-score text-[40px] leading-none" style={{color:sc}}>{content.streak}<span className="text-[16px] text-primary/60 ml-1">d</span></div>
        <div className="text-[11px] uppercase tracking-widest text-primary/70 font-bold mt-1">Streak</div>
      </div>
      :<div className="rounded-[20px] p-[18px] border border-border bg-secondary/30 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="font-score text-[40px] leading-none text-foreground">{content.totalPosts||0}</div>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Posts</div>
      </div>}
      <div className="rounded-[20px] p-[18px] border border-border bg-secondary/30 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="font-score text-[40px] leading-none text-primary">{content.partnerName?1:0}</div>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Partners</div>
      </div>
      <div className="rounded-[20px] p-[18px] border border-border bg-secondary/30 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="font-score text-[40px] leading-none text-gold">{content.rank?`#${content.rank}`:'—'}</div>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Rank</div>
      </div>
    </div>

    {/* Bio */}
    {content.bio&&<div className="mt-[30px] px-[30px] py-[18px] rounded-[24px] bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl text-center"><p className="font-display italic text-[22px] leading-[1.5] text-white/65">&ldquo;{content.bio}&rdquo;</p></div>}

    {/* Spacer */}
    <div className="flex-1"/>

    {/* Footer */}
    <div className="text-center"><div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl"><Sparkles className="w-4 h-4 text-gold/60"/><span className="text-[14px] font-bold tracking-[0.25em] uppercase text-white/30">Fond</span><span className="w-1 h-1 rounded-full bg-white/10"/><span className="text-[14px] text-white/20 font-medium">@{content.username.replace('@','')}</span></div></div>

  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// 13. FOND IDENTITY — Premium social card with Fond design DNA
// ═══════════════════════════════════════════════════════════════
function FondIdentityTemplate({content}:TP){const s=content.score||0;const t=tier(s);const sc=sHex(s);return(
<div className="absolute inset-0 flex flex-col overflow-hidden" style={{background:'rgb(var(--background))'}}>
  {/* Ambient glows — rose + gold signature */}
  <div className="absolute w-[900px] h-[900px] left-1/2 top-[-400px] -translate-x-1/2 rounded-full opacity-[0.20] blur-[90px]" style={{background:`radial-gradient(circle, rgb(var(--primary) / 0.3), transparent 70%)`}}/>
  <div className="absolute w-[600px] h-[600px] right-[-200px] bottom-[-100px] rounded-full opacity-[0.12] blur-[80px]" style={{background:'radial-gradient(circle, rgb(var(--gold) / 0.25), transparent 70%)'}}/>

  {/* Glass card container — Fond's signature frosted glass */}
  <div className="absolute inset-[60px] rounded-[60px] bg-white/[0.05] backdrop-blur-[40px] border border-white/[0.06] flex flex-col px-[70px] py-[70px]" style={{boxShadow:'0 40px 120px rgba(0,0,0,0.5), inset 0 1px rgba(255,255,255,0.08)'}}>

    {/* ── Brand — using Fond's LoveCode style ── */}
    <div className="flex items-center gap-3 mb-4">
      <Sparkles className="w-5 h-5 text-gold/60"/>
      <span className="text-[20px] tracking-[0.4em] font-bold text-white/40 uppercase">FOND</span>
    </div>

    {/* ── Avatar — Fond's rose gold gradient ── */}
    <div className="mx-auto mt-6 mb-[28px] w-[180px] h-[180px] rounded-full overflow-hidden flex items-center justify-center text-[80px] border-2 border-white/[0.10]" style={{background:'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--gold)))', boxShadow:`0 0 80px -10px ${sc}50`}}>
      {content.avatarUrl?<img src={content.avatarUrl} alt={content.username} loading="lazy" className="w-full h-full object-cover"/>:<span className="opacity-80">{(content.username.replace("@","")||"U")[0].toUpperCase()}</span>}
    </div>

    {/* ── Username — Fond's Playfair Display italic ── */}
    <div className="text-center font-display italic text-[56px] text-white/90 leading-tight">@{content.username.replace('@','')}</div>

    {/* ── Tier badge — Fond's gold pill ── */}
    <div className="self-center mt-[16px] px-[32px] py-[12px] rounded-full border border-gold/25 bg-gold/[0.08] text-gold font-semibold text-[24px] backdrop-blur-xl">{t.name}</div>

    {/* ── Divider ── */}
    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-[50px]"/>

    {/* ── Score hero — Fond's scoreColor + font-score ── */}
    <div className="text-center">
      <div className="font-score text-[180px] leading-none tracking-tight select-none" style={{color:sc,textShadow:`0 0 60px ${sc}30, 0 0 150px ${sc}15`}}>{s}</div>
      <div className="mt-[12px] text-[32px] font-bold tracking-[0.15em] uppercase text-white/40">Relationship Score</div>
      {content.rank && content.city ? (
        <div className="mt-[20px] text-[28px] font-semibold text-gold/80">🏆 #{content.rank} in {content.city}</div>
      ) : content.rank ? (
        <div className="mt-[20px] text-[28px] font-semibold text-gold/80">🏆 Global Rank #{content.rank}</div>
      ) : null}
    </div>

    {/* ── Stats grid — Fond's frosted glass cards ── */}
    <div className="mt-[50px] grid grid-cols-2 gap-[24px]">
      {content.streak && content.streak > 0 && (
        <div className="rounded-[28px] p-[24px] bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl">
          <div className="font-score text-[52px] leading-none" style={{color:sc}}><Flame className="inline h-10 w-10 -mt-1 mr-1" style={{color:'rgb(var(--score-mid))'}}/>{content.streak}</div>
          <div className="mt-[8px] text-[18px] tracking-[0.2em] uppercase text-white/40 font-medium">Day Streak</div>
        </div>
      )}
      {content.bestScore ? (
        <div className="rounded-[28px] p-[24px] bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl">
          <div className="font-score text-[52px] leading-none text-white/90">⭐ {content.bestScore}</div>
          <div className="mt-[8px] text-[18px] tracking-[0.2em] uppercase text-white/40 font-medium">Best Score</div>
        </div>
      ) : null}
      <div className="rounded-[28px] p-[24px] bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl">
        <div className="font-score text-[52px] leading-none text-white/90">❤️ {content.partnerName?1:0}</div>
        <div className="mt-[8px] text-[18px] tracking-[0.2em] uppercase text-white/40 font-medium">Partners</div>
      </div>
      <div className="rounded-[28px] p-[24px] bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl">
        <div className="font-score text-[52px] leading-none text-gold/90">💎 Top {s>90?'2':s>75?'10':s>55?'25':'50'}%</div>
        <div className="mt-[8px] text-[18px] tracking-[0.2em] uppercase text-white/40 font-medium">Leaderboard</div>
      </div>
    </div>

    {/* ── Bio quote — Fond's Playfair Display italic ── */}
    {content.bio && (
      <div className="mt-[40px] px-[36px] py-[24px] rounded-[28px] bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl text-center">
        <p className="font-display italic text-[28px] leading-[1.5] text-white/70">&ldquo;{content.bio}&rdquo;</p>
      </div>
    )}

    {/* ── Spacer ── */}
    <div className="flex-1"/>

    {/* ── Footer — Fond LoveCode style ── */}
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl">
        <Sparkles className="w-4 h-4 text-gold/60"/>
        <span className="text-[16px] font-bold tracking-[0.25em] uppercase text-white/30">Fond</span>
        <span className="w-1 h-1 rounded-full bg-white/10"/>
        <span className="text-[16px] text-white/20 font-medium">@{content.username.replace('@','')}</span>
      </div>
    </div>

  </div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// B. VERDICT CARD — Mirrors the actual post detail page layout
// ═══════════════════════════════════════════════════════════════
function VerdictCardTemplate({content}:TP){const s=content.score||0;const c=sHex(s);const t=tier(s);return(
<div className="relative w-full h-full flex flex-col bg-card overflow-hidden px-14 py-12">
  {/* Score Hero */}
  <div className="text-center py-6 relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(209,47,88,0.06),transparent)] blur-3xl -z-10"/>
    <div className="flex justify-center mb-4"><ScoreRing score={s} size={100}/></div>
    {content.partnerName&&<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated border border-border mt-2"><span className="text-sm font-medium text-foreground/80">with {content.partnerName}</span></div>}
    {content.rank&&<p className="text-sm text-gold font-medium mt-3">Ranked #{content.rank} globally 🏆</p>}
  </div>
  {/* AI Feedback */}
  {content.verdict&&<div className="rounded-3xl border border-gold/20 bg-gold/[0.06] p-6 shadow-sm relative overflow-hidden"><div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none"/><div className="relative z-10"><div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-gold"/><span className="font-sans tracking-[0.2em] uppercase text-[9px] font-bold text-gold/80">Fond AI Verdict</span></div><p className="font-display text-xl italic leading-relaxed text-foreground">"{content.verdict}"</p></div></div>}
  {/* Original Story */}
  {content.headline&&<div className="rounded-3xl border border-border bg-card p-6"><h4 className="font-sans tracking-widest uppercase text-[9px] font-bold text-muted-foreground mb-3">Original Story</h4><p className="text-foreground/85 leading-relaxed text-base whitespace-pre-wrap">{content.headline}</p></div>}
  {/* Score Breakdown */}
  <div className="rounded-3xl border border-border bg-card p-6"><h3 className="font-display text-lg italic text-foreground mb-4">Score Breakdown</h3><div className="space-y-3">
    {[{k:'Thoughtfulness',v:Math.min(s+8,100),m:30},{k:'Effort',v:Math.max(s-5,1),m:25},{k:'Creativity',v:Math.min(s+3,100),m:20},{k:'Emotional Weight',v:Math.max(s-2,1),m:15},{k:'Authenticity',v:Math.max(Math.min(s+10,100)-30,1),m:10}].map((d,i)=><div key={i}><div className="flex justify-between items-end"><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{d.k}</span><span className="font-score text-sm text-foreground leading-none">{d.v}<span className="text-muted-foreground text-[10px] font-sans">/{d.m}</span></span></div><div className="h-1.5 w-full bg-elevated rounded-full overflow-hidden mt-1"><div className="h-full bg-primary rounded-full" style={{width:`${Math.min(100,(d.v/d.m)*100)}%`}}/></div></div>)}
  </div></div>
  {/* Couple + city */}
  <div className="flex items-center justify-center gap-2 pt-3 text-xs text-muted-foreground"><span className="font-medium">@{content.username.replace('@','')}</span><span className="opacity-40">×</span><span>{content.partnerName||'partner'}</span>{content.city&&<><span className="opacity-30">·</span><span>{content.city}</span></>}</div>
  {/* Footer */}
  <div className="flex justify-center pt-3"><LoveCode username={content.username} theme="gold"/></div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// C. LEADERBOARD CARD — Mirrors the actual leaderboard in-app design
// ═══════════════════════════════════════════════════════════════
function LeaderboardCardTemplate({content}:TP){const r=content.rank||1;const s=content.score||0;const c=sHex(s);const t=tier(s);const init=(content.username.replace('@','')||'U')[0].toUpperCase();return(
<div className="relative w-full h-full flex flex-col bg-card overflow-hidden rounded-[2rem]">
  {/* Decorative ambient */}
  <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/[0.03] blur-3xl pointer-events-none"/>
  <div className="relative z-10 flex-1 flex flex-col px-12 py-10">
    {/* Header */}
    <div className="flex items-center justify-between mb-10"><span className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold">The Standings</span><span className="text-[9px] text-muted-foreground/40 font-medium">{content.city||'Global'}</span></div>
    {/* Leaderboard entry — mirrors actual leaderboard row design */}
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 relative">
      {/* Rank */}
      <div className="font-score text-3xl leading-none text-muted-foreground/50 w-12 text-center">#{r}</div>
      {/* Dual mini avatar */}
      <div className="relative h-8 w-10 shrink-0">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full ring-2 ring-card overflow-hidden bg-gradient-to-br from-rose-300 to-pink-500 flex items-center justify-center">
          <span className="text-white text-[9px] font-bold">{(content.partnerName||'P')[0].toUpperCase()}</span>
        </div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full ring-2 ring-card overflow-hidden bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center z-10">
          {content.avatarUrl?<img src={content.avatarUrl} alt={content.username} loading="lazy" className="w-full h-full object-cover"/>:<span className="text-white text-[9px] font-bold">{init}</span>}
        </div>
      </div>
      {/* Names */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{content.partnerName||content.username}</div>
        <div className="truncate text-[10px] text-muted-foreground">@{content.username.replace('@','')} · {content.city||'Unranked'}</div>
      </div>
      {/* Score — colored circle */}
      <div className="flex items-center gap-3">
        <div className="font-score text-2xl leading-none" style={{color:c}}>{s}</div>
      </div>
    </div>
    {/* Rank change indicator */}
    <div className="mt-6 flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground/50">Standing</span><span className="font-bold text-foreground">{r<=3?'Podium':r<=10?'Top 10':'Rising'}</span></div>
      <span className="text-muted-foreground/20">·</span>
      <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground/50">Score</span><span className="font-bold" style={{color:c}}>{s}</span></div>
    </div>
  </div>
  {/* Footer */}
  <div className="relative z-10 flex justify-center pb-8"><LoveCode username={content.username} theme="gold"/></div>
</div>)}

// ═══════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════
interface ShareTemplatesProps{theme:ShareTemplateTheme;content:C;format:ShareFormat;captureRef?:React.RefObject<HTMLDivElement|null>}
export function ShareTemplates({theme,content,format,captureRef}:ShareTemplatesProps){
  const dims=format==='story'?{w:1080,h:1920}:{w:1080,h:1080};
  const cr=useRef<HTMLDivElement>(null);const[sc,setSc]=useState(0.5);
  useEffect(()=>{const c=cr.current;if(!c)return;const o=new ResizeObserver(([e])=>{const rx=e.contentRect.width/dims.w;const ry=e.contentRect.height/dims.h;setSc(Math.min(rx,ry))});o.observe(c);return()=>o.disconnect()},[dims.w,dims.h]);
  return(<div ref={cr} className="relative flex items-center justify-center w-full h-full bg-black/20 overflow-hidden rounded-[2rem]"><div className="absolute left-1/2 top-1/2" style={{width:`${dims.w}px`,height:`${dims.h}px`,transform:`translate(-50%,-50%) scale(${sc})`,transformOrigin:'center center'}}><div ref={captureRef as React.RefObject<HTMLDivElement>} className="w-full h-full overflow-hidden shadow-2xl relative">{
    (()=>{switch(theme){
      case'brutal-truth':return<BrutalTruthTemplate content={content} format={format}/>;
      case'wrapped':return<WrappedTemplate content={content} format={format}/>;
      case'daily-fond':return<DailyFondTemplate content={content} format={format}/>;
      case'constellation':return<ConstellationTemplate content={content} format={format}/>;
      case'aura':return<AuraTemplate content={content} format={format}/>;
      case'receipt':return<ReceiptTemplate content={content} format={format}/>;
      case'hall-of-fame':return<HallOfFameTemplate content={content} format={format}/>;
      case'podium':return<PodiumTemplate content={content} format={format}/>;
      case'fond-rating':return<FondRatingTemplate content={content} format={format}/>;
      case'membership':return<MembershipTemplate content={content} format={format}/>;
      case'player-stats':return<PlayerStatsTemplate content={content} format={format}/>;
      case'profile-card':return<ProfileCardTemplate content={content} format={format}/>;
      case'profile-page':return<ProfilePageTemplate content={content} format={format}/>;
      case'fond-identity':return<FondIdentityTemplate content={content} format={format}/>;
      case'verdict-card':return<VerdictCardTemplate content={content} format={format}/>;
      case'leaderboard-card':return<LeaderboardCardTemplate content={content} format={format}/>;
      default:return<BrutalTruthTemplate content={content} format={format}/>;
    }})()
  }</div></div></div>);}