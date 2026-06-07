interface ProfileStatsProps {
  postCount: number;
  partnerCount: number;
  averageScore: number;
  totalScore?: number;
  bestScore?: number;
}

export function ProfileStats({
  postCount,
  partnerCount,
  averageScore,
  totalScore,
  bestScore,
}: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-surface dark:bg-black/40 border border-border dark:border-white/10 text-center">
        <p className="text-2xl font-bold text-primary">{postCount}</p>
        <p className="text-xs text-muted-foreground mt-1">Posts</p>
      </div>
      <div className="p-4 rounded-xl bg-surface dark:bg-black/40 border border-border dark:border-white/10 text-center">
        <p className="text-2xl font-bold text-primary">{partnerCount}</p>
        <p className="text-xs text-muted-foreground mt-1">Partners</p>
      </div>
      <div className="p-4 rounded-xl bg-surface dark:bg-black/40 border border-border dark:border-white/10 text-center">
        <p className="text-2xl font-bold text-primary">{averageScore}</p>
        <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
      </div>
      {totalScore !== undefined && (
        <div className="p-4 rounded-xl bg-surface dark:bg-black/40 border border-border dark:border-white/10 text-center">
          <p className="text-2xl font-bold text-purple-500">{totalScore}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Score</p>
        </div>
      )}
      {bestScore !== undefined && (
        <div className="p-4 rounded-xl bg-surface dark:bg-black/40 border border-border dark:border-white/10 text-center">
          <p className="text-2xl font-bold text-emerald-500">{bestScore}</p>
          <p className="text-xs text-muted-foreground mt-1">Best Score</p>
        </div>
      )}
    </div>
  );
}
