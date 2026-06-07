import { Post } from '@/types/database';
import { FondTag } from './FondTag';

interface BrutalTruthTemplateProps {
  post: Post;
  profileName: string;
}

export function BrutalTruthTemplate({ post, profileName }: BrutalTruthTemplateProps) {
  const score = post.ai_score || 0;
  
  return (
    <div className="w-[540px] h-[960px] relative overflow-hidden flex flex-col justify-between bg-[#0a0a0a]">
      {/* Edgy background styling */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600 via-[#0a0a0a] to-[#0a0a0a]" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#E92B54] rounded-full blur-[120px] opacity-20" />
      
      <div className="relative z-10 p-12 pt-20 flex-1 flex flex-col">
        {/* Header */}
        <p className="text-[12px] uppercase tracking-[0.3em] font-bold text-[#E92B54] mb-12">
          The Brutal Truth
        </p>

        {/* AI Quote */}
        <h1 className="font-display text-5xl italic leading-tight text-white mb-8">
          "{post.ai_feedback || 'Love is a battlefield.'}"
        </h1>

        <div className="flex items-center gap-4 mb-auto">
          <span className="text-white/50 text-sm uppercase tracking-widest">Regarding</span>
          <span className="text-white font-bold text-xl">{post.partner?.emoji} {post.partner?.name}</span>
        </div>

        {/* Big Score */}
        <div className="mt-auto mb-16 flex flex-col items-center">
          <div className="relative">
            <div className="text-[140px] font-bold text-[#E92B54] leading-none tracking-tighter mix-blend-screen drop-shadow-[0_0_40px_rgba(233,43,84,0.3)]">
              {score}
            </div>
            <div className="absolute -right-12 bottom-6 text-2xl text-white/30 font-bold">
              /100
            </div>
          </div>
          <div className="mt-6 px-6 py-2 rounded-full border border-[#E92B54]/30 bg-[#E92B54]/10 text-[#E92B54] text-xs uppercase tracking-[0.2em] font-bold">
            Final Verdict
          </div>
        </div>
      </div>

      {/* Footer Tag */}
      <div className="relative z-10 p-8 flex justify-center pb-16">
        <FondTag url={`https://fondapp.co/@${profileName}`} username={profileName} />
      </div>
    </div>
  );
}
