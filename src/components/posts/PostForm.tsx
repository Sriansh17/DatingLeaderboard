'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreatePost } from '@/lib/hooks/usePosts';
import type { Partner } from '@/types/database';
import type { AIScoreResult } from '@/types/api';
import { Sparkles, Share2 } from 'lucide-react';
import { VerdictCard } from '@/components/ui/VerdictCard';
import { useShare } from '@/components/providers/ShareProvider';

type Step = "write" | "loading" | "verdict";

interface PostFormProps {
  partners: Partner[];
  userId: string;
}

function lenFeedback(n: number) {
  if (n < 30) return "Give the AI something to work with.";
  if (n < 80) return "Keep going. Details = better verdict.";
  if (n < 240) return "Perfect length.";
  return "Good detail. The AI rewards specifics.";
}

export function PostForm({ partners, userId }: PostFormProps) {
  const [step, setStep] = useState<Step>("write");
  const [description, setDescription] = useState('');
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '');
  const [isPublic, setIsPublic] = useState(true);
  
  const [aiResult, setAiResult] = useState<AIScoreResult | null>(null);
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);
  const [flaggedReason, setFlaggedReason] = useState('');
  const [thinkingPhase, setThinkingPhase] = useState(0);
  
  const router = useRouter();
  const { addToast } = useToast();
  const createPost = useCreatePost();
  const { openShare } = useShare();

  const selectedPartner = partners.find(p => p.id === partnerId);
  const partnerNickname = selectedPartner?.name || "your partner";

  const submit = async () => {
    if (description.length < 30) return;
    
    setThinkingPhase(0);
    setStep("loading");
    
    try {
      const result = await createPost.mutateAsync({
        user_id: userId,
        partner_id: partnerId,
        description: description.trim(),
        is_public: isPublic,
      });

      setAiResult(result.aiResult);
      setStep("verdict");
    } catch (err: any) {
      setStep("write");
      if (err.flagged) {
        setFlaggedReason(err.message);
        setShowFlaggedModal(true);
      } else {
        addToast(err.message || 'Failed to post. Please try again.', 'error');
      }
    }
  };

  useEffect(() => {
    if (step === 'loading') {
      const t1 = setTimeout(() => setThinkingPhase(1), 1200);
      const t2 = setTimeout(() => setThinkingPhase(2), 2400);
      const t3 = setTimeout(() => setThinkingPhase(3), 3600);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step]);

  if (step === "loading") {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="grid min-h-[60vh] place-items-center px-6"
      >
        <div className="text-center relative space-y-8 w-full max-w-sm mx-auto">
          {/* Restored Sparkle Spinner */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 shadow-[0_0_40px_-10px_var(--gold)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <Sparkles className="h-8 w-8 text-gold animate-pulse relative z-10" />
          </div>

          <div className="flex flex-col items-center space-y-4 mt-12">
            <AnimatePresence mode="popLayout">
            {thinkingPhase >= 0 && (
              <motion.div 
                key="phase-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-[0.1em]"
              >
                {thinkingPhase > 0 ? (
                  <span className="text-gold">✓</span>
                ) : (
                  <span className="text-muted-foreground animate-pulse">•</span>
                )}
                <span className={thinkingPhase > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>Analyzing emotional consistency...</span>
              </motion.div>
            )}

            {thinkingPhase >= 1 && (
              <motion.div 
                key="phase-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-[0.1em]"
              >
                {thinkingPhase > 1 ? (
                  <span className="text-gold">✓</span>
                ) : (
                  <span className="text-muted-foreground animate-pulse">•</span>
                )}
                <span className={thinkingPhase > 1 ? "text-foreground font-medium" : "text-muted-foreground"}>Analyzing effort patterns...</span>
              </motion.div>
            )}

            {thinkingPhase >= 2 && (
              <motion.div 
                key="phase-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-[0.1em]"
              >
                {thinkingPhase > 2 ? (
                  <span className="text-gold">✓</span>
                ) : (
                  <span className="text-muted-foreground animate-pulse">•</span>
                )}
                <span className={thinkingPhase > 2 ? "text-foreground font-medium" : "text-muted-foreground"}>Cross-referencing romance standards...</span>
              </motion.div>
            )}

            {thinkingPhase >= 3 && (
              <motion.div 
                key="phase-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-3"
              >
                <span className="text-blush animate-pulse">•</span>
                <span className="text-blush font-medium font-display italic text-lg">Generating verdict...</span>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  if (step === "verdict" && aiResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="py-2"
      >
        <div className="mb-4 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">The Algorithm Speaks</p>
          <h1 className="font-display text-2xl italic text-foreground">Your Verdict</h1>
        </div>
        
        <VerdictCard
          score={aiResult.score}
          verdict={aiResult.feedback}
          explanationStr={aiResult.breakdown ? JSON.stringify(aiResult.breakdown) : undefined}
          username="@you"
          partnerNickname={partnerNickname}
        />
        
        <div className="mt-6 space-y-3">
          {/* Share CTA — highest-emotion moment, must be prominent */}
          <button
            onClick={() => openShare('post', {
              username: '@you',
              partnerName: partnerNickname,
              headline: description,
              verdict: aiResult.feedback,
              score: aiResult.score,
              city: '',
              date: new Date().toLocaleDateString(),
            })}
            className="w-full flex items-center justify-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 py-4 font-bold text-gold shadow-[0_0_20px_rgba(199,169,107,0.15)] transition-all hover:scale-[1.02] hover:bg-gold/20"
          >
            <Share2 className="h-4 w-4" />
            Share This Verdict
          </button>
          <button 
            onClick={() => router.push('/leaderboards')}
            className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
          >
            See My New Rank ↑
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to feed
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Step 1 of 1</p>
      <h1 className="mt-1 font-display text-3xl italic leading-tight text-foreground">
        Tell us what {partnerNickname} did.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The AI will score it. Brutally. Be specific.
      </p>

      {/* Partner Selection as glowing pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {partners.map(p => (
          <button
            key={p.id}
            onClick={() => setPartnerId(p.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              partnerId === p.id 
                ? 'border-blush bg-blush/10 text-blush' 
                : 'border-border bg-elevated/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.emoji} {p.name}
          </button>
        ))}
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={8}
        className="mt-6 w-full resize-none rounded-3xl border border-border bg-card p-8 font-display text-2xl italic leading-relaxed text-foreground outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground/40 shadow-sm transition-colors"
        placeholder={`What did ${partnerNickname} do? Be specific — the AI rewards details.`}
      />

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{lenFeedback(description.length)}</span>
        <span className="text-muted-foreground">{description.length} chars</span>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-border bg-card text-primary focus:ring-primary focus:ring-offset-background"
          />
          Make Public
        </label>
      </div>

      <button
        onClick={submit}
        disabled={description.length < 30 || createPost.isPending}
        className="mt-8 w-full flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-glow transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
      >
        {createPost.isPending ? 'Submitting...' : 'Submit for Judgement'}
      </button>

      {/* Flagged Modal — Red Card */}
      <Modal
        isOpen={showFlaggedModal}
        onClose={() => setShowFlaggedModal(false)}
        title=""
        className="max-w-md bg-background/95 border-border backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
      >
        <div className="text-center py-4 space-y-7">

          {/* Red card visual — animated slap-down */}
          <motion.div
            initial={{ rotate: -18, y: -40, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 5, y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-16 h-24 rounded-xl flex items-center justify-center shadow-[0_8px_30px_-4px_rgba(230,90,90,0.5)]"
            style={{ background: 'linear-gradient(145deg, #E65A5A, #c73d3d)' }}
          >
            <span className="text-white font-black text-3xl font-sans select-none">!</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-2"
          >
            <h3 className="font-display text-4xl italic text-foreground tracking-tight">
              Red Card.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
              Nice try. The AI has read every hallmark movie ever written.
            </p>
          </motion.div>

          {/* Evidence exhibit */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden text-left"
            style={{ background: 'rgb(var(--foreground) / 0.06)', border: '1px solid rgb(var(--destructive) / 0.2)' }}
          >
            {/* Stamped label */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-destructive/15">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-destructive">
                Exhibit A — AI Detector
              </span>
            </div>
            <div className="px-4 py-4">
              <p className="font-display text-base italic text-foreground/85 leading-relaxed">
                &ldquo;{flaggedReason}&rdquo;
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.45 }}
          >
            <button
              onClick={() => setShowFlaggedModal(false)}
              className="w-full py-4 rounded-full bg-foreground text-background text-sm font-bold hover:scale-[1.02] transition-transform shadow-lg"
            >
              My bad, let me tell the truth
            </button>
          </motion.div>

        </div>
      </Modal>
    </>
  );
}
