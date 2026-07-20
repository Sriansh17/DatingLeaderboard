'use client';

import { useState, useEffect } from 'react';
import { Globe, MapPin, Diamond, ChevronLeft, ChevronRight, TrendingUp, Users, Trophy } from 'lucide-react';

interface RankCarouselProps {
  userId: string;
  city?: string | null;
  bondIds?: string[];
}

interface RankData {
  scope: string;
  label: string;
  icon: any;
  rank: number | null;
  score: number | null;
  total: number;
}

// Skeleton shown while loading — prevents layout shift
function RankSkeleton() {
  return (
    <div className="w-full p-3 rounded-2xl border border-gold/20 bg-gold/[0.04] backdrop-blur-md flex flex-col items-center justify-center h-full">
      <div className="w-6 h-[2px] bg-gold/10 rounded mb-2" />
      <div className="w-8 h-5 bg-gold/10 rounded mb-1" />
      <div className="w-12 h-[6px] bg-gold/10 rounded" />
    </div>
  );
}

export function RankCarousel({ userId, city, bondIds }: RankCarouselProps) {
  const [ranks, setRanks] = useState<RankData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    let globalData: RankData | null = null;
    let cityData: RankData | null = null;
    let bondData: RankData | null = null;

    Promise.all([
      fetch(`/api/leaderboards?type=country&limit=200`)
        .then(r => r.json())
        .then(json => {
          const entries = json.data || [];
          const userEntry = entries.find((e: any) => e.user_id === userId);
          globalData = {
            scope: 'global', label: 'Global', icon: Globe,
            rank: userEntry?.rank || null,
            score: userEntry?.average_score || null,
            total: entries.length,
          };
        })
        .catch(() => {
          globalData = { scope: 'global', label: 'Global', icon: Globe, rank: null, score: null, total: 0 };
        }),

      city
        ? fetch(`/api/leaderboards?type=city&city=${encodeURIComponent(city)}&limit=200`)
            .then(r => r.json())
            .then(json => {
              const entries = json.data || [];
              const userEntry = entries.find((e: any) => e.user_id === userId);
              cityData = {
                scope: 'city', label: city, icon: MapPin,
                rank: userEntry?.rank || null,
                score: userEntry?.average_score || null,
                total: entries.length,
              };
            })
            .catch(() => {})
        : Promise.resolve(),

      bondIds && bondIds.length > 0
        ? fetch(`/api/circles/${bondIds[0]}/leaderboard`)
            .then(r => r.json())
            .then(json => {
              const entries = json.data || [];
              const userEntry = entries.find((e: any) => e.user_id === userId);
              if (userEntry || entries.length > 0) {
                bondData = {
                  scope: 'bond', label: 'Bond', icon: Diamond,
                  rank: userEntry?.rank || null,
                  score: userEntry?.average_score || null,
                  total: entries.length,
                };
              }
            })
            .catch(() => {})
        : Promise.resolve(),
    ]).finally(() => {
      // Always return in order: Global → City → Bond
      const ordered: RankData[] = [];
      if (globalData) ordered.push(globalData);
      if (cityData) ordered.push(cityData);
      if (bondData) ordered.push(bondData);
      setRanks(ordered);
      setLoading(false);
    });
  }, [userId, city, bondIds?.[0]]);

  if (loading) return <RankSkeleton />;
  if (ranks.length === 0) return null;

  const current = ranks[activeIndex];
  const Icon = current.icon;
  const hasScore = current.score != null && current.score > 0;
  const hasRank = current.rank != null;

  return (
    <div className="w-full p-3 rounded-2xl border border-gold/20 bg-gold/[0.04] backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden h-full">
      {/* Carousel arrows — circle buttons */}
      {ranks.length > 1 && (
        <>
          <button onClick={() => setActiveIndex((activeIndex - 1 + ranks.length) % ranks.length)}
            className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10"
            aria-label="Previous rank">
            <div className="w-4 h-4 rounded-full bg-gold/15 flex items-center justify-center">
              <ChevronLeft className="w-2.5 h-2.5 text-gold" />
            </div>
          </button>
          <button onClick={() => setActiveIndex((activeIndex + 1) % ranks.length)}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10"
            aria-label="Next rank">
            <div className="w-4 h-4 rounded-full bg-gold/15 flex items-center justify-center">
              <ChevronRight className="w-2.5 h-2.5 text-gold" />
            </div>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {ranks.length > 1 && (
        <div className="flex gap-[3px] mb-1.5">
          {ranks.map((_, i) => (
            <div key={i} className={`w-[5px] h-[5px] rounded-full transition-all ${i === activeIndex ? 'bg-gold w-[14px]' : 'bg-gold/20'}`} />
          ))}
        </div>
      )}

      {/* Icon + label row — city name fits fully */}
      <div className="flex flex-col items-center mb-0.5 px-1">
        <div className="flex items-center gap-1">
          <Icon className="w-3 h-3 text-gold/70 shrink-0" />
          <span className="text-[8px] uppercase tracking-[0.15em] font-bold text-gold/70 text-center leading-tight">{current.label}</span>
        </div>
      </div>

      {/* Rank number — large and prominent */}
      <div className={`font-score leading-none ${hasRank ? 'text-3xl sm:text-4xl text-gold' : 'text-xl text-muted-foreground/50'}`}>
        {hasRank ? `#${current.rank}` : '—'}
      </div>

      {/* X participants below rank */}
      {current.total > 0 && (
        <div className="text-[8px] text-gold/50 font-medium mt-0.5">{current.total} participants</div>
      )}
    </div>
  );
}
