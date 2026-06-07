import { tierForScore, scoreColor } from "@/lib/mock-data";
import { Sparkles } from "lucide-react";

interface Props {
  score: number;
  verdict: string;
  username: string;
  partnerNickname: string;
  city?: string;
  globalRank?: number;
  suspectedFabrication?: boolean;
  compact?: boolean;
  explanationStr?: string | null;
}

export function VerdictCard({
  score,
  verdict,
  username,
  partnerNickname,
  city,
  globalRank,
  suspectedFabrication,
  compact,
  explanationStr,
}: Props) {
  const tier = tierForScore(score);
  const color = scoreColor(score);

  let breakdown: Record<string, number> | null = null;
  if (explanationStr) {
    try {
      breakdown = JSON.parse(explanationStr);
    } catch (e) {
      // Not valid JSON, ignore
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 animate-float-up shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_40px_-15px_rgba(0,0,0,0.4)]"
    >
      {/* decorative corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-10 dark:opacity-30 mix-blend-multiply dark:mix-blend-normal"
        style={{ background: color }}
      />

      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="font-display italic text-gold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Fond
        </span>
        <span>Verdict № {Math.floor(score * 137) % 9999}</span>
      </div>

      <div className={`mt-6 flex items-end gap-4 ${compact ? "" : "sm:gap-6"}`}>
        <div
          className="font-score leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:drop-shadow-none [text-shadow:none] dark:[text-shadow:0_0_30px_var(--glow-color)]"
          style={{
            fontSize: compact ? 80 : 112,
            color,
            "--glow-color": `color-mix(in oklab, ${color} 40%, transparent)`
          } as React.CSSProperties}
        >
          {score.toFixed(1)}
        </div>
        <div className="pb-2">
          <div className="font-display text-xl text-foreground">{tier}</div>
          <div className="text-xs text-muted-foreground">out of 100.0</div>
        </div>
      </div>

      <p className="mt-6 font-display text-lg italic leading-snug text-foreground">
        “{verdict}”
      </p>

      {/* Detailed Score Breakdown */}
      {breakdown && !compact && (
        <div className="mt-8 space-y-4 rounded-2xl bg-elevated/40 p-6 border border-border">
          <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            AI Score Breakdown
          </h4>
          {Object.entries(breakdown).map(([key, value]) => {
            // max values for reference: thoughtfulness 30, romance 25, effort 20, uniqueness 15, emotional_impact 10
            const maxValues: Record<string, number> = {
              thoughtfulness: 30,
              romance: 25,
              effort: 20,
              uniqueness: 15,
              emotional_impact: 10
            };
            const max = maxValues[key.toLowerCase()] || 25;
            const percentage = Math.min(100, Math.max(0, (Number(value) / max) * 100));
            const formattedKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            return (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-display text-foreground/90 text-base">{formattedKey}</span>
                  <span className="text-muted-foreground font-mono text-xs">{Number(value)}/{max}</span>
                </div>
                <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: "rgb(var(--primary))" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
        <span className="text-foreground font-medium">
          {username} <span className="text-muted-foreground">×</span>{" "}
          <span className="text-blush">{partnerNickname}</span>
        </span>
        {city && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{city}</span>
          </>
        )}
        {globalRank && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-gold">Global #{globalRank}</span>
          </>
        )}
      </div>

      {suspectedFabrication && (
        <div
          className="absolute right-4 top-20 rotate-12 rounded-md border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{ borderColor: "var(--warning)", color: "var(--warning)" }}
        >
          Suspected Fabrication
        </div>
      )}
    </div>
  );
}
