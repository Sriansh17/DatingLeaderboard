import { Post } from '@/types/database';
import { FondTag } from './FondTag';

interface TheRomanticTemplateProps {
  post: Post;
  profileName: string;
}

export function TheRomanticTemplate({ post, profileName }: TheRomanticTemplateProps) {
  const score = post.ai_score || 0;
  
  return (
    <div className="w-[540px] h-[960px] relative overflow-hidden flex flex-col justify-between bg-[#1a0f14]">
      {/* Soft romantic background styling */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E92B54]/20 via-[#1a0f14] to-[#1a0f14]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px]" />
      
      <div className="relative z-10 p-12 pt-24 flex-1 flex flex-col items-center text-center">
        {/* Partner Focus */}
        <div className="w-40 h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(233,43,84,0.15)] mb-8">
          {post.partner?.emoji || '💖'}
        </div>
        
        <h2 className="font-display text-4xl italic text-white mb-2">
          {post.partner?.name || 'Someone Special'}
        </h2>
        <p className="text-[#E92B54] text-xs uppercase tracking-[0.3em] font-bold mb-16">
          A Beautiful Connection
        </p>

        {/* Story Focus */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full mb-auto relative">
          <span className="absolute -top-6 left-8 text-6xl text-white/10 font-display">"</span>
          <p className="text-white/90 text-xl leading-relaxed italic relative z-10">
            {post.ai_feedback || 'A match made in heaven. Absolute perfection.'}
          </p>
        </div>

        {/* Score */}
        <div className="mt-12 flex items-baseline gap-2">
          <span className="text-6xl font-bold text-white drop-shadow-xl">{score}</span>
          <span className="text-white/50 text-xl font-bold">/100</span>
        </div>
      </div>

      {/* Footer Tag */}
      <div className="relative z-10 p-8 flex justify-center pb-16">
        <FondTag url={`https://fondapp.co/@${profileName}`} username={profileName} />
      </div>
    </div>
  );
}
