'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Share2, Star, Heart, Trophy, X, Search } from 'lucide-react';
import Link from 'next/link';

type TemplateCategory = 'story' | 'leaderboard' | 'profile' | 'crazy';

interface TemplateDef {
  id: string; name: string; tagline: string; inspiration: string;
  category: TemplateCategory; scorePreview?: number;
}

const TOP_TEN: Record<'story' | 'leaderboard' | 'profile', TemplateDef[]> = {
  story: [
    { id: 'surveillance', name: 'The Surveillance Tape', tagline: 'Your romance as a heist.', inspiration: 'CCTV footage, REC dot, evidence tags', category: 'story', scorePreview: 94 },
    { id: 'package-insert', name: 'The Package Insert', tagline: 'Your relationship, bottled as perfume.', inspiration: 'Luxury fragrance box insert', category: 'story', scorePreview: 92 },
    { id: 'black-mirror', name: 'The Episode Select', tagline: 'Your story as a Netflix episode.', inspiration: 'Black Mirror UI, star rating', category: 'story', scorePreview: 97 },
    { id: 'polaroid', name: 'The Polaroid', tagline: 'A moment, developed instantly.', inspiration: 'Instant photo, white frame', category: 'story', scorePreview: 88 },
    { id: 'tabloid', name: 'The Tabloid', tagline: 'Romance, above the fold.', inspiration: 'Supermarket tabloid, red banner', category: 'story', scorePreview: 91 },
    { id: 'passport-stamp', name: 'The Passport Stamp', tagline: 'Entry approved into their heart.', inspiration: 'Passport page, ink stamps', category: 'story', scorePreview: 94 },
    { id: 'bluebook', name: 'The Bluebook', tagline: 'A+ in romance.', inspiration: 'College exam booklet', category: 'story', scorePreview: 86 },
    { id: 'hogwarts', name: 'The Hogwarts Letter', tagline: 'You\'ve been accepted.', inspiration: 'Wax-sealed acceptance letter', category: 'story', scorePreview: 95 },
    { id: 'baseball-card-front', name: 'The Baseball Card', tagline: 'Rookie season: .940 avg.', inspiration: 'Topps trading card, foil border', category: 'story', scorePreview: 94 },
    { id: 'fine-dining', name: 'The Menu', tagline: 'Tonight\'s special: romance.', inspiration: 'Fine dining menu', category: 'story', scorePreview: 93 },
  ],
  leaderboard: [
    { id: 'f1-grid', name: 'The F1 Starting Grid', tagline: 'P2, 0.4s off the leader.', inspiration: 'Formula 1 timing tower', category: 'leaderboard', scorePreview: 94 },
    { id: 'bloomberg', name: 'The Bloomberg Terminal', tagline: '$FOND: up 12% this week.', inspiration: 'Stock ticker, green numbers', category: 'leaderboard', scorePreview: 97 },
    { id: 'airport-board', name: 'The Departures Board', tagline: 'Flight FND001 — now boarding.', inspiration: 'Split-flap airport board', category: 'leaderboard', scorePreview: 91 },
    { id: 'concert-tour', name: 'The Tour Poster', tagline: 'Sold out in 12 cities.', inspiration: 'Concert tour announcement', category: 'leaderboard', scorePreview: 94 },
    { id: 'olympic-medal', name: 'The Medal Table', tagline: 'Gold, silver, bronze romance.', inspiration: 'Olympic medal count', category: 'leaderboard', scorePreview: 96 },
    { id: 'arcade-hiscore', name: 'The High Score', tagline: 'AAA · 094,200 PTS', inspiration: 'Arcade high score screen', category: 'leaderboard', scorePreview: 94 },
    { id: 'billboard-chart', name: 'The Charts', tagline: 'Debuted at #3, climbing.', inspiration: 'Billboard Hot 100', category: 'leaderboard', scorePreview: 92 },
    { id: 'gold-record', name: 'The Gold Record', tagline: '94,000 romance streams.', inspiration: 'RIAA Gold Record award', category: 'leaderboard', scorePreview: 94 },
    { id: 'wwe-belt', name: 'The Championship Belt', tagline: 'Fond World Heavyweight.', inspiration: 'WWE title belt', category: 'leaderboard', scorePreview: 96 },
    { id: 'wine-label', name: 'The Wine Label', tagline: 'Château [You] 2026.', inspiration: 'Grand Cru wine label', category: 'leaderboard', scorePreview: 93 },
  ],
  profile: [
    { id: 'vogue-cover', name: 'The Vogue Cover', tagline: 'September issue. You.', inspiration: 'Vogue magazine cover', category: 'profile', scorePreview: 94 },
    { id: 'passport-book', name: 'The Passport Book', tagline: 'Citizen of Fond.', inspiration: 'Burgundy passport cover', category: 'profile', scorePreview: 94 },
    { id: 'business-card', name: 'The Business Card', tagline: 'Title: Legendary Partner.', inspiration: 'Embossed luxury cardstock', category: 'profile', scorePreview: 94 },
    { id: 'photobooth-strip', name: 'The Photobooth Strip', tagline: 'Four frames of us.', inspiration: 'Vintage photobooth strip', category: 'profile', scorePreview: 91 },
    { id: 'perfume-ad', name: 'The Perfume Ad', tagline: 'Available at fine romances.', inspiration: 'Full-page fashion ad', category: 'profile', scorePreview: 94 },
    { id: 'playbill', name: 'The Playbill', tagline: 'Now playing: our love story.', inspiration: 'Broadway Playbill', category: 'profile', scorePreview: 93 },
    { id: 'id-badge', name: 'The ID Badge', tagline: 'Employee #FND094.', inspiration: 'Company ID with lanyard', category: 'profile', scorePreview: 94 },
    { id: 'donor-plaque', name: 'The Donor Plaque', tagline: 'Generously donated by...', inspiration: 'Brass donor recognition plaque', category: 'profile', scorePreview: 94 },
    { id: 'baseball-card-back', name: 'The Career Stats', tagline: 'AVG .940, HR 94.', inspiration: 'Baseball card back stats', category: 'profile', scorePreview: 94 },
    { id: 'wax-seal', name: 'The Wax Seal Letter', tagline: 'Sealed with romance.', inspiration: 'Pressed wax seal on envelope', category: 'profile', scorePreview: 94 },
  ],
};

const CRAZY: TemplateDef[] = [
  { id: 'fond-coins', name: 'Fond Coins', tagline: 'Physical metal coins for Legendary tier.', inspiration: 'Real minted coin', category: 'crazy', scorePreview: 99 },
  { id: 'split-flap', name: 'The Split-Flap Website', tagline: 'Live public board of verdicts.', inspiration: 'Airport split-flap display', category: 'crazy', scorePreview: 98 },
  { id: 'year-in-hearts', name: 'Year in Hearts', tagline: 'Your Fond year as a cinematic video.', inspiration: 'Spotify Wrapped', category: 'crazy', scorePreview: 100 },
  { id: 'fond-reality', name: 'Fond Reality', tagline: 'Multi-cam reality show control room.', inspiration: 'TV control room', category: 'crazy', scorePreview: 96 },
  { id: 'opposition-dossier', name: 'The Opposition Dossier', tagline: 'Your partner\'s CIA file.', inspiration: 'Classified intelligence dossier', category: 'crazy', scorePreview: 97 },
  { id: 'blue-screen', name: 'The Blue Screen of Death', tagline: 'For scores below 40. Funny failure.', inspiration: 'Windows BSOD', category: 'crazy', scorePreview: 88 },
  { id: 'fond-museum', name: 'The Fond Museum', tagline: 'Physical pop-up museum by tier.', inspiration: 'Immersive exhibit', category: 'crazy', scorePreview: 99 },
  { id: 'ikea-instructions', name: 'The IKEA Instructions', tagline: 'Assemble your relationship.', inspiration: 'IKEA assembly diagrams', category: 'crazy', scorePreview: 94 },
  { id: 'lock-screen', name: 'The Lock Screen Widget', tagline: 'Your score on your lock screen.', inspiration: 'iOS/Android lock screen widget', category: 'crazy', scorePreview: 95 },
  { id: 'world-map', name: 'The World Map of Romance', tagline: 'Global heatmap of romance density.', inspiration: 'Geographic heatmap', category: 'crazy', scorePreview: 96 },
];

const CATEGORY_META: Record<TemplateCategory, { label: string; icon: any; color: string }> = {
  story: { label: 'Story / Post', icon: Heart, color: '#D12F58' },
  leaderboard: { label: 'Leaderboard', icon: Trophy, color: '#C7A96B' },
  profile: { label: 'Profile', icon: Star, color: '#D12F58' },
  crazy: { label: 'Crazy Ideas', icon: Sparkles, color: '#DCBE78' },
};

function tierColor(score: number): string {
  if (score >= 92) return '#DCBE78'; if (score >= 75) return '#64B491'; if (score >= 55) return '#EBA564'; return '#EB6E73';
}

function MiniScoreRing({ score, size = 36 }: { score: number; size?: number }) {
  const sw = 2.5; const r = (size - sw) / 2; const circ = r * 2 * Math.PI; const offset = circ - (score / 100) * circ; const c = tierColor(score);
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute -rotate-90" width={size} height={size}>
        <circle strokeWidth={sw} stroke="currentColor" fill="transparent" r={r} cx={size/2} cy={size/2} className="text-white/10" />
        <circle strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" stroke={c} fill="transparent" r={r} cx={size/2} cy={size/2} style={{ filter: `drop-shadow(0 0 2px ${c})` }} />
      </svg>
      <span className="font-score text-white text-[10px] leading-none">{score}</span>
    </div>
  );
}

function SurveillancePreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#0a0a0a]"><div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.02)_2px,rgba(0,255,0,0.02)_4px)]" /><div className="absolute top-3 left-3 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-[8px] uppercase tracking-wider text-red-500 font-bold">REC</span></div><div className="absolute top-3 right-3 text-[6px] text-green-500/50 font-mono">00:42:17</div><div className="absolute inset-0 flex flex-col items-center justify-center px-4"><div className="text-[8px] uppercase tracking-[0.2em] text-green-500/60 font-bold mb-2">INCIDENT REPORT</div><div className="text-xs text-green-400/90 font-display italic text-center leading-tight">"He made me breakfast"</div><div className="mt-3 text-[16px] font-score text-green-400">94</div><div className="mt-2 px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10"><span className="text-[6px] uppercase tracking-wider text-green-500 font-bold">WITNESS CONFIRMED</span></div></div></div>); }
function PackageInsertPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f7f3ee]"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(209,47,88,0.04),transparent)]" /><div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/40 via-primary/40 to-gold/40" /><div className="flex flex-col items-center justify-center h-full px-6"><div className="text-[6px] uppercase tracking-[0.3em] text-primary/40 font-bold mb-1">EAU DE FOND</div><div className="text-sm font-display italic text-[#221F20]">He Made Me Pasta</div><div className="w-12 h-px bg-gold/30 my-3" /><div className="text-[6px] uppercase tracking-[0.15em] text-foreground/40 font-semibold mb-1.5">Notes</div><div className="space-y-1 w-full max-w-[120px]">{['Thoughtfulness', 'Effort', 'Emotion'].map(n => <div key={n} className="flex justify-between text-[7px]"><span className="text-foreground/60">{n}</span><span className="text-primary/70 font-medium">•</span></div>)}</div><div className="mt-3 text-[10px] font-score text-gold">94</div></div></div>); }
function BlackMirrorPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#0a0a0c]"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(209,47,88,0.06),transparent)]" /><div className="flex flex-col h-full px-4 py-6"><div className="text-[6px] uppercase tracking-[0.35em] text-white/30 font-bold">FOND · EPISODE 94</div><div className="flex-1 flex flex-col justify-center"><div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Staring</div><div className="text-sm font-display italic text-white/90">@username × partner</div><div className="my-2 text-[8px] text-white/30">★★★★★</div><div className="text-[7px] text-white/40 leading-relaxed line-clamp-2">"Pancakes at 2am..."</div><div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10"><span className="text-[6px] text-white/60">Rating: 94</span></div></div></div></div>); }
function PolaroidPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden flex flex-col"><div className="flex-1 bg-gradient-to-br from-primary/20 via-blush/20 to-gold/20" /><div className="bg-white h-[30%] relative px-3 pt-2"><div className="text-[6px] text-foreground/50 text-center font-medium uppercase tracking-wider">romance score</div><div className="text-[24px] font-score text-primary text-center leading-tight">88</div><div className="text-[5px] text-foreground/30 text-center font-mono">JUL 07 2026</div></div></div>); }
function TabloidPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f7f3ee]"><div className="bg-[#D12F58] py-1.5 px-3"><span className="text-[7px] uppercase tracking-[0.25em] font-bold text-white">FOND EXCLUSIVE</span></div><div className="px-3 pt-2"><div className="text-[16px] font-score text-foreground leading-none">91</div><div className="mt-2 text-[7px] font-bold uppercase text-foreground/80 leading-tight">"HE MADE DINNER AND THE AI CRIED"</div></div></div>); }
function PassportStampPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f5f0e8]"><div className="flex flex-col h-full px-4 py-5"><div className="text-[7px] font-display text-foreground/80">PASSPORT</div><div className="flex-1 flex flex-col justify-center items-center"><div className="border-2 border-[#D12F58]/40 rounded-lg px-3 py-2 rotate-[-3deg] bg-[#D12F58]/5"><div className="text-[6px] uppercase tracking-wider text-[#D12F58] font-bold">VISA APPROVED</div><div className="text-[10px] font-score text-gold mt-1 text-center">94</div></div></div></div></div>); }
function BluebookPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#b8c4d4]"><div className="flex flex-col h-full px-4 py-5"><div className="text-[6px] uppercase tracking-wider text-[#2a3a5c]/80 font-bold">EXAM BOOKLET</div><div className="flex-1 flex flex-col justify-center items-center"><div className="text-[36px] font-score text-[#2a3a5c] leading-none">A+</div><div className="text-[5px] text-[#2a3a5c]/50 mt-1">GRADE: 86/100</div></div></div></div>); }
function HogwartsPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f0e4c8]"><div className="flex flex-col h-full px-4 py-5"><div className="flex-1 flex flex-col justify-center items-center"><div className="mt-2 w-10 h-10 rounded-full bg-gradient-to-br from-[#D12F58] to-gold flex items-center justify-center shadow-lg"><span className="text-white font-score text-lg">95</span></div><div className="mt-2 text-[5px] text-foreground/40 text-center max-w-[100px]">You have been accepted</div></div></div></div>); }
function BaseballCardFrontPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f7f3ee]"><div className="border-b-2 border-gold/40 py-1 px-3 bg-gradient-to-r from-gold/10 to-transparent"><span className="text-[6px] font-bold text-gold/80 uppercase tracking-wider">FOND 2026 · ROOKIE</span></div><div className="flex flex-col items-center justify-center h-full px-4"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary flex items-center justify-center mb-1.5 border border-gold/40"><span className="text-white text-[7px] font-bold">U</span></div><div className="text-[20px] font-score text-gold leading-none">.940</div></div></div>); }
function MenuPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f5f0e8]"><div className="border border-foreground/10 mx-3 my-4 rounded-lg p-2 h-[calc(100%-2rem)]"><div className="text-[6px] font-bold text-center text-foreground/60 uppercase tracking-wider">FOND BISTRO</div><div className="w-6 h-px bg-gold/40 mx-auto my-1" /><div className="text-[5px] text-center font-display italic text-foreground/40">Tonight's Special</div><div className="mt-2 pt-1 border-t border-foreground/10"><div className="flex justify-between text-[6px]"><span className="font-bold uppercase tracking-wider text-foreground/60">Total</span><span className="font-score text-gold">93</span></div></div></div></div>); }
function F1GridPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0a0a0c]"><div className="absolute top-2 left-3 text-[6px] uppercase tracking-wider text-gold/70 font-bold">F1 TIMING</div><div className="flex flex-col justify-center h-full px-4"><div className="flex items-center gap-2 mb-1"><span className="text-[18px] font-score text-gold leading-none">P2</span><div className="text-[6px] text-white/60">@username</div></div><div className="text-[5px] text-white/30 ml-1">+0.42s</div></div></div>); }
function BloombergPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0c0e10]"><div className="absolute top-2 left-3 flex items-center gap-2"><span className="text-[6px] font-bold text-gold/70">$FOND</span><span className="text-[6px] text-green-400 font-medium">94.42</span><span className="text-[5px] text-green-500">▲ +2.4%</span></div><div className="flex flex-col justify-center h-full px-4"><div className="text-[20px] font-score text-green-400 leading-none">94</div></div></div>); }
function AirportBoardPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#111]"><div className="absolute top-2 left-3 text-[5px] uppercase tracking-wider text-gold/50 font-bold">DEPARTURES</div><div className="flex flex-col justify-center h-full px-3"><div className="bg-[#1a1a1a] rounded px-1.5 py-1"><div className="flex justify-between text-[6px]"><span className="text-gold/70 font-bold">FND094</span><span className="text-green-400/80">BOARDING</span></div><div className="text-[5px] text-white/30">@user · GATE A94</div></div></div></div>); }
function TourPosterPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a0a10] to-[#2a1520] flex flex-col items-center justify-center"><div className="text-[9px] font-display italic text-white/90">The @username</div><div className="text-[9px] font-display italic text-gold">Romance Tour</div><div className="mt-2 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30"><span className="text-[5px] text-gold font-bold uppercase">SOLD OUT</span></div></div>); }
function OlympicMedalPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#f7f3ee]"><div className="absolute top-2 left-3 text-[5px] uppercase tracking-wider text-foreground/40 font-bold">MEDAL TABLE</div><div className="flex flex-col justify-center h-full px-3">{[['🥇', 'Gold', '96'], ['🥈', '@user', '94'], ['🥉', 'Bronze', '91']].map(([m, n, s], i) => <div key={n} className={`flex items-center gap-1.5 py-1 ${i === 1 ? 'bg-gold/10 rounded px-1 -mx-1' : ''}`}><span className="text-[8px]">{m}</span><span className="text-[5px] text-foreground/70 flex-1 truncate">{n}</span><span className={`text-[8px] font-score ${i === 1 ? 'text-gold' : 'text-foreground/50'}`}>{s}</span></div>)}</div></div>); }
function ArcadeHighScorePreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0a080c]"><div className="absolute top-2 left-3"><span className="text-[5px] uppercase tracking-wider text-gold/50 font-bold">HIGH SCORES</span></div><div className="flex flex-col justify-center h-full px-3"><div className="flex items-center gap-2 py-1"><span className="text-[8px] font-score text-gold">1</span><span className="text-[7px] font-mono text-white">AAA</span><span className="flex-1" /><span className="text-[10px] font-score text-gold">094,200</span></div></div></div>); }
function BillboardChartPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#f7f3ee]"><div className="absolute top-2 left-3 text-[5px] uppercase tracking-wider text-foreground/40 font-bold">HOT 100</div><div className="flex flex-col justify-center h-full px-3">{[['1', 'Top', '97'], ['2', '@user', '94'], ['3', 'Third', '91']].map(([r, n, s], i) => <div key={n} className={`flex items-center gap-1.5 py-0.5 ${r === '2' ? 'bg-gold/10 rounded px-1 -mx-1' : ''}`}><span className={`text-[8px] font-score w-3 ${r === '2' ? 'text-gold' : 'text-foreground/50'}`}>{r}</span><span className="text-[5px] font-bold text-foreground/70 flex-1 truncate">{n}</span><span className={`text-[8px] font-score ${r === '2' ? 'text-gold' : 'text-foreground/50'}`}>{s}</span></div>)}</div></div>); }
function GoldRecordPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#1a0a10] flex flex-col items-center justify-center"><div className="w-12 h-12 rounded-full bg-gradient-to-b from-gold/40 to-gold/10 border-2 border-gold/40 flex items-center justify-center mb-1.5"><div className="text-[14px] font-score text-gold leading-none">94</div></div><div className="text-[6px] uppercase tracking-wider text-gold/70 font-bold">GOLD RECORD</div></div>); }
function WWEBeltPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0a080c] flex flex-col items-center justify-center"><div className="w-16 h-8 rounded-[40%] bg-gradient-to-b from-gold/50 to-gold/10 border-2 border-gold/40 flex items-center justify-center mb-1"><span className="text-[5px] font-bold text-gold uppercase tracking-wider">Champion</span></div><div className="text-[8px] font-score text-gold leading-none">96</div></div>); }
function WineLabelPreview() { return (<div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#f5ede0] flex flex-col items-center justify-center border border-foreground/10"><div className="text-[7px] font-display text-foreground/60">CHÂTEAU</div><div className="text-[9px] font-display italic">@username</div><div className="text-[5px] text-foreground/40">2026</div><div className="w-6 h-px bg-gold/40 my-1" /><div className="text-[8px] font-score text-gold mt-0.5">93</div></div>); }
function VogueCoverPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-white flex flex-col"><div className="bg-black/90 py-2 text-center"><span className="text-[14px] font-serif italic text-white tracking-[0.1em]">VOGUE</span></div><div className="flex-1 bg-gradient-to-b from-primary/5 via-blush/5 to-gold/10 flex flex-col items-center justify-center px-3"><div className="text-[12px] font-display italic text-foreground mt-1">@username</div><div className="text-[5px] text-foreground/40 mt-0.5">"THE 94 CLUB"</div></div></div>); }
function PassportBookPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#2c1525] flex flex-col items-center justify-center"><div className="w-full px-4"><div className="border-2 border-gold/50 rounded-lg p-3 text-center"><div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/40 mx-auto mb-1 flex items-center justify-center"><Sparkles className="w-2.5 h-2.5 text-gold" /></div><div className="text-[9px] font-display text-gold">PASSPORT</div><div className="text-[5px] text-white/40 mt-1">FOND</div></div></div></div>); }
function BusinessCardPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f5f0e8] flex flex-col items-center justify-center border border-foreground/10"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-1.5"><Sparkles className="w-2.5 h-2.5 text-white" /></div><div className="text-[7px] font-display italic text-foreground">@username</div><div className="text-[4px] text-primary/80 uppercase tracking-wider font-bold mt-0.5">Legendary Partner</div></div>); }
function PhotoboothStripPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f5f0e8] flex flex-col p-1 gap-0.5">{[1,2,3,4].map(i => <div key={i} className={`flex-1 rounded-sm ${i % 2 === 0 ? 'bg-primary/10' : 'bg-blush/20'}`} />)}</div>); }
function PerfumeAdPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-b from-blush/30 to-gold/20 flex flex-col items-center justify-center"><div className="text-[11px] font-display italic text-gold">FOND</div><div className="text-[5px] text-foreground/40 mt-1 text-center">Available at fine relationships</div></div>); }
function PlaybillPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#1a0a10] flex flex-col items-center justify-center"><div className="text-[6px] uppercase tracking-[0.2em] text-gold/50 font-bold">Now Playing</div><div className="text-[10px] font-display italic text-white/90 text-center mt-1">Our Love Story</div><div className="mt-2 text-[8px] font-score text-gold">93</div></div>); }
function IDBadgePreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f5f0e8] flex flex-col items-center justify-center border border-foreground/10"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-1 shadow-sm"><span className="text-white text-[6px] font-bold">U</span></div><div className="text-[6px] font-bold text-foreground">@username</div><div className="text-[4px] text-gold font-mono mt-1">ID: FND094</div></div>); }
function DonorPlaquePreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#2a1a10] flex flex-col items-center justify-center border border-gold/20"><div className="text-[7px] font-bold text-gold/60 uppercase tracking-wider">Donated By</div><div className="mt-1 text-[9px] font-display italic text-gold/80">@username</div><div className="w-6 h-px bg-gold/30 my-1" /><div className="text-[6px] font-score text-gold mt-1">94</div></div>); }
function BaseballCardBackPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f5f0e8] flex flex-col justify-center px-3">{[[2024, '.720', '55'], [2025, '.860', '72'], [2026, '.940', '94']].map(([y, a, h]) => <div key={y} className="flex justify-between text-[5px] font-mono"><span className="text-foreground/60">{y}</span><span className="text-foreground/70">{a}</span><span className="text-foreground/70">{h}</span></div>)}<div className="mt-1 pt-1 border-t border-foreground/10 flex justify-between text-[5px]"><span className="font-bold text-foreground/60">CAREER</span><span className="text-gold font-score">.940</span></div></div>); }
function WaxSealPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f5f0e8] flex flex-col items-center justify-center"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D12F58] to-[#D12F58]/50 flex items-center justify-center shadow-lg border border-[#D12F58]/30"><Sparkles className="w-3 h-3 text-white/90" /></div><div className="mt-2 text-[6px] font-display italic text-foreground/60">Sealed with romance</div></div>); }
function FondCoinsPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#1a1a1a] flex flex-col items-center justify-center"><div className="w-14 h-14 rounded-full bg-gradient-to-b from-gold/60 to-gold/20 border-2 border-gold/50 flex items-center justify-center shadow-[0_0_20px_rgba(220,190,120,0.3)]"><div className="text-[10px] font-score text-gold leading-tight">99</div></div><div className="mt-2 text-[6px] text-gold/60 font-bold uppercase tracking-wider">Limited Mintage</div><div className="absolute bottom-2 text-[4px] text-gold/30">✦ physical coin ✦</div></div>); }
function SplitFlapPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#0a0a0c] flex flex-col justify-center px-3"><div className="text-[5px] text-gold/60 uppercase tracking-wider mb-2 font-bold">fond.show · LIVE</div><div className="space-y-1"><div className="bg-[#1a1a1a] rounded px-2 py-1.5"><div className="flex justify-between text-[6px]"><span className="text-gold/80 font-bold">94</span><span className="text-white/50">Mumbai</span></div><div className="text-[4px] text-white/30">"She made him pasta"</div></div></div></div>); }
function YearInHeartsPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 via-gold/20 to-[#1a0a10] flex flex-col items-center justify-center"><div className="text-[7px] font-bold text-white/60 uppercase tracking-wider">Your Year</div><div className="text-[16px] font-score text-gold">2026</div><div className="mt-2"><span className="text-[4px] text-gold/60">▶ 1:30</span></div></div>); }
function FondRealityPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#0a0a0c] flex flex-col p-1.5"><div className="text-[4px] text-gold/50 uppercase tracking-wider font-bold mb-1">FOND REALITY · LIVE</div><div className="grid grid-cols-2 gap-0.5 flex-1">{[1,2,3,4].map(i => <div key={i} className="bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center border border-white/5"><span className="text-[3px] text-white/20">CAM {i}</span></div>)}</div></div>); }
function OppositionDossierPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#1a1010] flex flex-col justify-center px-4"><div className="absolute top-2 left-3 text-[4px] text-[#D12F58]/80 font-bold uppercase tracking-wider">TOP SECRET</div><div className="border border-[#D12F58]/30 rounded p-2"><div className="text-[5px] text-white/60 font-mono">SUBJECT: [partner]</div><div className="text-[5px] text-white/30 font-mono">CLEARANCE: LEVEL 94</div></div></div>); }
function BlueScreenPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#0a0a8c] flex flex-col justify-center px-3"><div className="text-[16px] font-score text-white leading-none mb-1">:(</div><div className="text-[5px] text-white/80 font-mono">Score: 34/100 · Error: 0x00000034</div></div>); }
function FondMuseumPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#1a1a1a] flex flex-col items-center justify-center"><div className="text-[10px] font-display italic text-gold">THE FOND MUSEUM</div><div className="text-[4px] text-white/30 mt-1">10 rooms · 10 tiers</div><div className="absolute bottom-2 text-[4px] text-gold/30">NYC · LA · SF</div></div>); }
function IKEAPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#f5f0e8] flex flex-col justify-center px-4"><div className="text-[6px] font-bold text-[#003399] uppercase tracking-wider mb-2">FOND · ASSEMBLY</div>{[1,2,3].map(i => <div key={i} className="flex items-center gap-2 mb-1.5"><div className="w-4 h-3 border border-foreground/20 rounded flex items-center justify-center"><span className="text-[4px] text-foreground/30">{i}</span></div><div className="flex-1 h-1 bg-foreground/10 rounded" /><div className={`w-3 h-1 ${i === 3 ? 'bg-gold' : 'bg-foreground/20'} rounded`} /></div>)}<div className="text-[5px] text-foreground/40 text-center mt-1">DIFFICULTY: MEDIUM</div></div>); }
function LockScreenPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#0a0a15] flex flex-col justify-center items-center"><div className="w-3 h-3 rounded-full border border-white/20 mb-2" /><div className="text-[5px] text-white/20 font-mono">9:41</div><div className="mt-3 flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10"><Sparkles className="w-2 h-2 text-gold" /><span className="text-[6px] font-score text-gold">94</span></div></div>); }
function WorldMapPreview() { return (<div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#0a1520] flex flex-col justify-center px-3"><div className="text-[4px] text-gold/50 uppercase tracking-wider font-bold mb-1">ROMANCE DENSITY</div><div className="grid grid-cols-5 gap-0.5">{Array.from({length: 25}).map((_, i) => <div key={i} className="aspect-square rounded-sm" style={{background: Math.random() > 0.6 ? 'rgba(209,47,88,0.25)' : 'rgba(220,190,120,0.1)'}} />)}</div></div>); }

const DETAILS: Record<string, { description: string; whyShare: string; whyWhatApp: string; motion: string; softRoseFit: string }> = {
  'surveillance': { description: 'Your romantic gesture as a heist.', whyShare: 'Makes it look like a heist.', whyWhatApp: 'Security footage for romance is unexpected.', motion: 'VHS tracking, static crackle, REC pulses.', softRoseFit: 'Rose tint over green, gold numbers.' },
  'package-insert': { description: 'Your relationship as luxury fragrance packaging.', whyShare: 'Makes you sound premium.', whyWhatApp: 'Perfume packaging for relationship scores.', motion: 'Card slides out, notes bloom.', softRoseFit: 'Cream cardstock, rose-gold, gold foil.' },
  'black-mirror': { description: 'Your story as a Netflix episode selection.', whyShare: 'Fun and cinematic.', whyWhatApp: 'Black Mirror UI for romance.', motion: 'VHS tracking, glitch in.', softRoseFit: 'Velvet midnight, rose glitch, gold stars.' },
  'polaroid': { description: 'Classic Polaroid instant photo.', whyShare: 'Sentimental and physical.', whyWhatApp: 'Looks like a real Polaroid.', motion: 'Slides out, develops.', softRoseFit: 'Off-white frame, rose gold marker.' },
  'tabloid': { description: 'Supermarket tabloid with sensational headline.', whyShare: 'Hilarious.', whyWhatApp: 'Tabloid for romance is absurd.', motion: 'Printing press text typeset.', softRoseFit: 'Rose-crimson banner, cream paper.' },
  'passport-stamp': { description: 'Passport page with VISA APPROVED stamp.', whyShare: 'Official entry approval.', whyWhatApp: 'Passport stamps for dating.', motion: 'Stamps slam down.', softRoseFit: 'Cream pages, rose-red ink, gold foil.' },
  'bluebook': { description: 'College exam blue book with A+ grade.', whyShare: 'Nostalgia hit.', whyWhatApp: 'School exam books for romance.', motion: 'Handwriting appears, grade stamp.', softRoseFit: 'Dusty periwinkle, gold A+ ink.' },
  'hogwarts': { description: 'Wizard acceptance letter with wax seal.', whyShare: 'Childhood nostalgia.', whyWhatApp: 'Universally beloved format.', motion: 'Wax melts, paper unfolds.', softRoseFit: 'Rose wax, cream paper, gold.' },
  'baseball-card-front': { description: 'Topps baseball card with foil border.', whyShare: 'Collectible flex.', whyWhatApp: 'Trading card for romance.', motion: 'Foil shimmers.', softRoseFit: 'Cream card, rose banner, gold foil.' },
  'fine-dining': { description: 'Fine dining menu with Chef\'s Special.', whyShare: 'Elegant and romantic.', whyWhatApp: 'Menu card for romantic value.', motion: 'Courses reveal one by one.', softRoseFit: 'Cream cardstock, rose-gold border.' },
  'f1-grid': { description: 'F1 starting grid with timing columns.', whyShare: 'Sleek and competitive.', whyWhatApp: 'F1 graphics for leaderboard.', motion: 'Timing columns populate.', softRoseFit: 'Velvet midnight, rose-gold columns.' },
  'bloomberg': { description: 'Bloomberg Terminal with stock ticker.', whyShare: 'Your love is a blue chip.', whyWhatApp: 'Finance UI for romance is dissonant.', motion: 'Ticker scrolls, chart draws.', softRoseFit: 'Warm charcoal, rose-gold ticker.' },
  'airport-board': { description: 'Split-flap airport departures board.', whyShare: 'Feels important.', whyWhatApp: 'Universally recognized format.', motion: 'Split-flap animation.', softRoseFit: 'Warm charcoal, rose-gold text.' },
  'concert-tour': { description: 'Concert tour poster with SOLD OUT.', whyShare: 'Tour flex.', whyWhatApp: 'Tour poster for personal rank.', motion: 'Venues riff one by one.', softRoseFit: 'Cream paper, rose-gold tour name.' },
  'olympic-medal': { description: 'Olympic medal count table.', whyShare: 'Playfully grandiose.', whyWhatApp: 'Olympic table for dating.', motion: 'Medals drop into place.', softRoseFit: 'Cream, rose-gold gold, champagne silver.' },
  'arcade-hiscore': { description: 'Classic arcade high score screen.', whyShare: 'Nostalgia and competition.', whyWhatApp: 'Arcade for romance.', motion: 'Scores drop in, glitch effect.', softRoseFit: 'Velvet midnight, rose-glow scanlines.' },
  'billboard-chart': { description: 'Billboard Hot 100 with move arrows.', whyShare: 'Celebrity flex.', whyWhatApp: 'Billboard for relationships.', motion: 'Chart reveals with bounce.', softRoseFit: 'Cream background, rose top 10.' },
  'gold-record': { description: 'RIAA Gold Record award.', whyShare: 'Music industry status.', whyWhatApp: 'Gold record for romance.', motion: 'Record mounts, plaque engraves.', softRoseFit: 'Rose-gold record, gold frame.' },
  'wwe-belt': { description: 'WWE championship belt.', whyShare: 'Maximum absurdity.', whyWhatApp: 'Wrestling belt for leaderboard.', motion: 'Plate by plate, leather closes.', softRoseFit: 'Champagne gold, rose-gold plates.' },
  'wine-label': { description: 'Grand Cru wine label.', whyShare: 'Premium vintage flex.', whyWhatApp: 'Wine label for ranking.', motion: 'Label applies, glass fills.', softRoseFit: 'Cream label, rose-gold name.' },
  'vogue-cover': { description: 'Vogue cover with masthead.', whyShare: 'Ultimate vanity flex.', whyWhatApp: 'Everyone wants to be on Vogue.', motion: 'Masthead slides in.', softRoseFit: 'Cream, rose masthead, gold line.' },
  'passport-book': { description: 'Burgundy passport cover.', whyShare: 'Citizen of Fond.', whyWhatApp: 'Passport for digital identity.', motion: 'Passport opens, emblem gleams.', softRoseFit: 'Burgundy, gold emblem, rose interior.' },
  'business-card': { description: 'Luxury embossed business card.', whyShare: 'Title: Legendary Partner.', whyWhatApp: 'Business card format.', motion: 'Card flicks from holder.', softRoseFit: 'Cream cardstock, rose-gold foil.' },
  'photobooth-strip': { description: 'Classic 4-frame photobooth strip.', whyShare: 'Inherently shareable.', whyWhatApp: 'Universally loved format.', motion: 'Flash, strip prints.', softRoseFit: 'Warm strip, rose borders.' },
  'perfume-ad': { description: 'Full-page luxury perfume ad.', whyShare: 'So premium.', whyWhatApp: 'Fashion ad for a person.', motion: 'Photo fades in.', softRoseFit: 'Warm rose gradient, gold text.' },
  'playbill': { description: 'Broadway Playbill.', whyShare: 'Now playing: your love.', whyWhatApp: 'Theatrical keepsake.', motion: 'Playbill opens, cast reveals.', softRoseFit: 'Cream, rose logo, gold credits.' },
  'id-badge': { description: 'Company ID badge.', whyShare: 'Employee of Fond.', whyWhatApp: 'Company badge as status.', motion: 'Badge slides on lanyard.', softRoseFit: 'Cream badge, rose logo, gold ID.' },
  'donor-plaque': { description: 'Brass donor plaque.', whyShare: 'Permanent and prestigious.', whyWhatApp: 'Donor plaque for romance.', motion: 'Plaque mounts, engraves.', softRoseFit: 'Warm brass, rose name, gold.' },
  'baseball-card-back': { description: 'Career stats on card back.', whyShare: 'Stats speak for themselves.', whyWhatApp: 'Achievement language.', motion: 'Card flips, stats populate.', softRoseFit: 'Cream card back, rose stats.' },
  'wax-seal': { description: 'Envelope with wax seal.', whyShare: 'Romantic and permanent.', whyWhatApp: 'Wax seals for romance.', motion: 'Wax drips, seal presses.', softRoseFit: 'Rose wax, cream envelope.' },
  'fond-coins': { description: 'Physical metal coins for Legendary tier.', whyShare: 'Conversation starter in your pocket.', whyWhatApp: 'A coin from a dating app!', motion: 'Spins on pedestal, mintage ticks.', softRoseFit: 'Rose-gold metal, velvet pouch.' },
  'split-flap': { description: 'Public website: live verdict board.', whyShare: 'A screensaver for romance.', whyWhatApp: 'Beautiful live data display.', motion: 'Flaps flip in real time.', softRoseFit: 'Warm charcoal, rose-gold flaps.' },
  'year-in-hearts': { description: 'Cinematic 90-second year recap video.', whyShare: 'Spotify Wrapped for relationships.', whyWhatApp: 'A cinematic recap of your romance.', motion: 'Zoom through your year, score ring.', softRoseFit: 'Rose + gold, warm grain, soundtrack.' },
  'fond-reality': { description: 'Multi-cam reality TV control room.', whyShare: 'You\'re a reality star.', whyWhatApp: 'Control room for relationships.', motion: 'Camera feeds cycle, drama meter.', softRoseFit: 'Velvet midnight, rose glow.' },
  'opposition-dossier': { description: 'CIA dossier on your partner.', whyShare: 'Fun and dramatic.', whyWhatApp: 'CIA file for your partner.', motion: 'File flips, stamps appear.', softRoseFit: 'Warm leather, gold seal.' },
  'blue-screen': { description: 'BSOD for scores below 40.', whyShare: 'Makes failure funny and shareable.', whyWhatApp: 'BSOD from a dating app!', motion: 'Screen turns blue, text appears.', softRoseFit: 'Warm navy, rose-tinted error.' },
  'fond-museum': { description: 'Physical pop-up museum with 10 rooms.', whyShare: 'Each room is Instagram.', whyWhatApp: 'A museum for a relationship app.', motion: 'App shows rooms being built.', softRoseFit: 'Warm gallery, rose lighting.' },
  'ikea-instructions': { description: 'IKEA assembly for your relationship.', whyShare: 'Universally funny format.', whyWhatApp: 'IKEA for relationships.', motion: 'Diagrams draw in IKEA style.', softRoseFit: 'Warm paper, rose-blue accents.' },
  'lock-screen': { description: 'Lock screen widget for your score.', whyShare: 'Screenshot and share.', whyWhatApp: 'Widget for relationship score.', motion: 'Widget fades in, numbers pulse.', softRoseFit: 'Warm widget, rose-gold accent.' },
  'world-map': { description: 'Global heatmap of romance density.', whyShare: 'Check your neighborhood.', whyWhatApp: 'Real-time romance heatmap.', motion: 'Map zooms, heatmap blooms.', softRoseFit: 'Rose tones, cream low, gold pins.' },
};

function DetailModal({ template, onClose }: { template: TemplateDef; onClose: () => void }) {
  const Preview = previewComponents[template.id]; const d = DETAILS[template.id];
  return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-3 rounded-3xl p-6 sm:p-8 hide-scrollbar">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/40 transition-all z-10"><X className="w-3.5 h-3.5" /></button>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-[200px] shrink-0"><div className="relative rounded-2xl overflow-hidden shadow-xl">{Preview && <Preview />}</div></div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: CATEGORY_META[template.category].color }}>{CATEGORY_META[template.category].label}</span>
          <h2 className="font-display italic text-2xl text-foreground mb-1">{template.name}</h2>
          <p className="text-sm text-muted-foreground mb-3">{template.tagline}</p>
          {d && <div className="space-y-3">
            <div className="glass-1 rounded-xl p-3"><p className="text-[8px] uppercase tracking-[0.15em] font-bold text-gold mb-1">Concept</p><p className="text-sm text-foreground/80">{d.description}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-1 rounded-xl p-3"><p className="text-[8px] uppercase tracking-[0.15em] font-bold text-gold mb-1">Why Share</p><p className="text-xs text-foreground/70">{d.whyShare}</p></div>
              <div className="glass-1 rounded-xl p-3"><p className="text-[8px] uppercase tracking-[0.15em] font-bold text-gold mb-1">What App?</p><p className="text-xs text-foreground/70">{d.whyWhatApp}</p></div>
              <div className="glass-1 rounded-xl p-3"><p className="text-[8px] uppercase tracking-[0.15em] font-bold text-gold mb-1">Motion</p><p className="text-xs text-foreground/70">{d.motion}</p></div>
              <div className="glass-1 rounded-xl p-3"><p className="text-[8px] uppercase tracking-[0.15em] font-bold text-gold mb-1">Soft Rose Fit</p><p className="text-xs text-foreground/70">{d.softRoseFit}</p></div>
            </div>
          </div>}
        </div>
      </div>
    </motion.div>
  </div>);
}

const previewComponents: Record<string, React.FC> = {
  'surveillance': SurveillancePreview, 'package-insert': PackageInsertPreview, 'black-mirror': BlackMirrorPreview,
  'polaroid': PolaroidPreview, 'tabloid': TabloidPreview, 'passport-stamp': PassportStampPreview,
  'bluebook': BluebookPreview, 'hogwarts': HogwartsPreview, 'baseball-card-front': BaseballCardFrontPreview,
  'fine-dining': MenuPreview,
  'f1-grid': F1GridPreview, 'bloomberg': BloombergPreview, 'airport-board': AirportBoardPreview,
  'concert-tour': TourPosterPreview, 'olympic-medal': OlympicMedalPreview, 'arcade-hiscore': ArcadeHighScorePreview,
  'billboard-chart': BillboardChartPreview, 'gold-record': GoldRecordPreview, 'wwe-belt': WWEBeltPreview,
  'wine-label': WineLabelPreview,
  'vogue-cover': VogueCoverPreview, 'passport-book': PassportBookPreview, 'business-card': BusinessCardPreview,
  'photobooth-strip': PhotoboothStripPreview, 'perfume-ad': PerfumeAdPreview, 'playbill': PlaybillPreview,
  'id-badge': IDBadgePreview, 'donor-plaque': DonorPlaquePreview, 'baseball-card-back': BaseballCardBackPreview,
  'wax-seal': WaxSealPreview,
  'fond-coins': FondCoinsPreview, 'split-flap': SplitFlapPreview, 'year-in-hearts': YearInHeartsPreview,
  'fond-reality': FondRealityPreview, 'opposition-dossier': OppositionDossierPreview, 'blue-screen': BlueScreenPreview,
  'fond-museum': FondMuseumPreview, 'ikea-instructions': IKEAPreview, 'lock-screen': LockScreenPreview,
  'world-map': WorldMapPreview,
};

export default function ShareTemplatesPreviewPage() {
  const [category, setCategory] = useState<TemplateCategory>('story');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TemplateDef | null>(null);
  const [search, setSearch] = useState('');

  const items = (category === 'crazy' ? CRAZY : TOP_TEN[category]).filter(t => {
    if (!search.trim()) return true; const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q);
  });

  const CATS: { key: TemplateCategory; label: string; icon: any }[] = [
    { key: 'story', label: 'Story / Post', icon: Heart },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { key: 'profile', label: 'Profile', icon: Star },
    { key: 'crazy', label: 'Crazy Ideas', icon: Sparkles },
  ];

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(209,47,88,0.03),transparent)]" />
        <div className="max-w-6xl mx-auto px-5 pt-10 pb-8 relative z-10">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-gold" /><span className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold">Creative Director's Deck</span></div>
          <div className="flex items-start justify-between gap-4">
            <div><h1 className="font-display italic text-4xl sm:text-5xl text-foreground leading-tight">Template Gallery</h1>
            <p className="text-muted-foreground text-sm mt-2"><strong className="text-foreground">40</strong> hand-crafted concepts across 4 categories.</p></div>
            <Link href="/creative-deck" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full glass-btn text-xs font-semibold whitespace-nowrap shrink-0">Read the Deck →</Link>
          </div>
          <div className="mt-6 space-y-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-full border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground/50" /></button>}
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {CATS.map(cat => { const Icon = cat.icon; const active = category === cat.key;
                return (<button key={cat.key} onClick={() => setCategory(cat.key)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  {active && <motion.div layoutId="pill" className="absolute inset-0 glass-btn rounded-full z-0" transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />}
                  <Icon className="w-3.5 h-3.5 relative z-10" /><span className="relative z-10">{cat.label}</span>
                </button>);
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={category + search} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {items.map((template, i) => {
              const Preview = previewComponents[template.id]; const hovered = hoveredId === template.id;
              return (
                <motion.div key={template.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => setHoveredId(template.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => setSelected(template)} className="group relative cursor-pointer">
                  <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${hovered ? 'scale-[1.02] shadow-xl' : 'shadow-md'}`}>
                    <div className={`absolute inset-[-2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-10 pointer-events-none ${hovered ? 'opacity-100' : ''}`}>
                      <motion.div animate={hovered ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-50%] w-[200%] h-[200%] origin-center" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgb(var(--primary)), rgb(var(--gold)))' }} />
                    </div>
                    {Preview && <Preview />}
                    <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5 border border-white/10"><MiniScoreRing score={template.scorePreview || 94} size={18} /></div>
                  </div>
                  <div className="mt-2 px-1"><h3 className="text-xs font-bold text-foreground truncate">{template.name}</h3><p className="text-[9px] text-muted-foreground mt-0.5 truncate">{template.tagline}</p></div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
        {items.length === 0 && <div className="py-20 text-center"><h3 className="font-display italic text-lg text-foreground mb-1">No matches</h3></div>}
      </div>

      <AnimatePresence>{selected && <DetailModal template={selected} onClose={() => setSelected(null)} />}</AnimatePresence>

      <div className="max-w-6xl mx-auto px-5 text-center"><div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50"><Sparkles className="w-3 h-3 text-gold/50" /><span>40 concepts · Fond Creative Director's Deck · July 2026</span></div></div>
    </main>
  );
}
