import { scoreColor } from "@/lib/mock-data";
import { AnimatedNumber } from "./AnimatedNumber";

export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="absolute -rotate-90" width={size} height={size} overflow="visible">
        <circle
          className="text-elevated transition-all duration-1000 ease-in-out"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Progress ring */}
      <svg className="absolute -rotate-90" width={size} height={size} overflow="visible">
        <circle
          className="transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
      </svg>
      <div className="font-score drop-shadow-sm transition-colors duration-1000" style={{ fontSize: size * 0.4, color: color }}>
        <AnimatedNumber value={score} delay={0.2} />
      </div>
    </div>
  );
}
