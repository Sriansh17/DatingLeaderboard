'use client';

import { useState } from "react";
import { leaderboard, currentUser, scoreColor } from "@/lib/mock-data";
import { ArrowDown, ArrowUp, Minus, Share2 } from "lucide-react";
import { useShare } from "@/components/providers/ShareProvider";

const scopes = ["Global", "Country", "City"] as const;

function PodiumItem({ entry, rank }: { entry: typeof leaderboard[0], rank: number }) {
  const isFirst = rank === 1;
  const height = isFirst ? 'h-40 sm:h-48' : rank === 2 ? 'h-32 sm:h-36' : 'h-28 sm:h-28';
  const color = isFirst ? 'var(--gold)' : rank === 2 ? '#C0C0C0' : '#CD7F32';
  const bgColor = isFirst ? 'from-gold/20 to-gold/5 border-gold/30' : rank === 2 ? 'from-gray-300/20 to-gray-300/5 border-gray-300/30' : 'from-orange-400/20 to-orange-400/5 border-orange-400/30';
  
  return (
    <div className={`flex flex-col items-center w-24 sm:w-32 transition-transform duration-500 hover:-translate-y-2`}>
      <div className="relative mb-3">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-elevated border-2 grid place-items-center font-display text-xl sm:text-2xl shadow-[0_0_20px_-5px_currentColor] z-10 relative" style={{ borderColor: color, color }}>
          {entry.username[1]?.toUpperCase() || 'U'}
        </div>
        {isFirst && <div className="absolute -top-5 -right-3 text-3xl animate-bounce drop-shadow-xl z-20">👑</div>}
      </div>
      <div className="text-center mb-3 w-full px-1">
        <div className="text-xs sm:text-sm font-medium text-foreground truncate">{entry.username}</div>
        <div className="text-[10px] text-muted-foreground truncate font-score" style={{ color }}>{entry.score.toFixed(1)}</div>
      </div>
      <div className={`w-full ${height} rounded-t-2xl bg-gradient-to-b ${bgColor} border-t border-x flex flex-col items-center justify-start pt-3 sm:pt-4 shadow-inner relative overflow-hidden backdrop-blur-md`}>
        <div className="absolute inset-0 bg-white/5 opacity-50" />
        <span className="font-score text-4xl sm:text-5xl leading-none relative z-10" style={{ color }}>{rank}</span>
      </div>
    </div>
  );
}

export default function RanksPage() {
  const [scope, setScope] = useState<(typeof scopes)[number]>("Global");
  const { openShare } = useShare();

  return (
    <main className="pb-32 w-full min-h-screen bg-transparent relative">
      <header className="px-5 pb-3 pt-6 max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">The Standings</p>
        <h1 className="font-display text-3xl italic text-foreground">Leaderboard</h1>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-background/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex rounded-full border border-border bg-elevated/60 p-1 max-w-7xl mx-auto">
          {scopes.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                scope === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground max-w-7xl mx-auto">
          {scope === "Global"
            ? "Top couples worldwide · resets weekly"
            : scope === "Country"
            ? "Top in your country"
            : `Top in ${currentUser.city}`}
        </p>
      </div>

      <div className="max-w-7xl mx-auto">

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 px-4 py-8 mt-2">
        {leaderboard[1] && <PodiumItem entry={leaderboard[1]} rank={2} />}
        {leaderboard[0] && <PodiumItem entry={leaderboard[0]} rank={1} />}
        {leaderboard[2] && <PodiumItem entry={leaderboard[2]} rank={3} />}
      </div>

      <ol className="space-y-2 p-4">
        {leaderboard.slice(3).map((e) => (
          <li
            key={e.rank}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div
              className="font-score text-3xl leading-none text-muted-foreground"
              style={{ width: 44 }}
            >
              {e.rank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{e.username}</div>
              <div className="truncate text-xs text-muted-foreground">
                with {e.partnerNickname} · {e.city}
              </div>
            </div>
            <div className="text-right">
              <div className="font-score text-2xl leading-none" style={{ color: scoreColor(e.score) }}>
                {e.score.toFixed(1)}
              </div>
              <div className="mt-1 flex items-center justify-end gap-0.5 text-[10px] text-muted-foreground">
                {e.change > 0 ? (
                  <ArrowUp className="h-3 w-3 text-success" />
                ) : e.change < 0 ? (
                  <ArrowDown className="h-3 w-3 text-destructive" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {Math.abs(e.change) || "—"}
              </div>
            </div>
          </li>
        ))}
        </ol>
      </div>

      {/* Pinned self */}
      <div className="fixed inset-x-0 bottom-28 z-30 mx-auto max-w-7xl px-4">
        <div className="rounded-3xl border border-white/10 bg-black/60 p-4 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
            <div className="font-score text-2xl text-blush shrink-0" style={{ width: 44 }}>
              #{currentUser.globalRank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">You · {currentUser.username}</div>
              <div className="text-xs text-muted-foreground truncate">
                #{currentUser.cityRank} in {currentUser.city} · keep climbing
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="font-score text-2xl" style={{ color: scoreColor(currentUser.bestScore) }}>
                {currentUser.bestScore.toFixed(1)}
              </div>
              <button 
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                onClick={() => {
                  openShare('rank', {
                    username: currentUser.username,
                    score: currentUser.bestScore,
                    rank: currentUser.globalRank,
                    city: currentUser.city,
                  });
                }}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
        </div>
      </div>
    </main>
  );
}
