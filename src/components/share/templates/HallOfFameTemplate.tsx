import { Post } from '@/types/database';
import { FondTag } from './FondTag';

interface HallOfFameTemplateProps {
  post?: Post;
  profileName: string;
  rank?: number;
  city?: string;
}

export function HallOfFameTemplate({ post, profileName, rank, city }: HallOfFameTemplateProps) {
  return (
    <div className="w-[540px] h-[960px] relative overflow-hidden flex flex-col justify-between bg-black">
      {/* Premium Gold Background styling */}
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 via-black to-black" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
      
      <div className="relative z-10 p-12 pt-24 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-16">
          <span className="text-3xl">🏆</span>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-yellow-500">
            Hall of Fame
          </p>
        </div>

        {/* Big Rank Statement */}
        <h1 className="font-display text-5xl italic leading-tight text-white mb-6">
          Officially ranked<br/>
          <span className="text-yellow-500">#{rank || 'Top'}</span> in {city || 'the world'}
        </h1>

        {post && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full mt-auto mb-16">
            <p className="text-white/60 text-xs uppercase tracking-[0.2em] font-bold mb-4">
              Recent Highlight
            </p>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{post.partner?.emoji}</span>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl">{post.partner?.name}</span>
                <span className="text-white/40 text-sm">{post.partner?.relationship}</span>
              </div>
              <div className="ml-auto text-3xl font-display font-bold text-yellow-500">
                {post.ai_score}/100
              </div>
            </div>
            <p className="text-white/80 italic">
              "{post.ai_feedback}"
            </p>
          </div>
        )}
      </div>

      {/* Footer Tag */}
      <div className="relative z-10 p-8 flex justify-center pb-16">
        <FondTag url={`https://fondapp.co/@${profileName}`} username={profileName} />
      </div>
    </div>
  );
}
