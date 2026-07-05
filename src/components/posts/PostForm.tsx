'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useCreatePost } from '@/lib/hooks/usePosts';
import type { Partner } from '@/types/database';
import type { AIScoreResult } from '@/types/api';
import { tierInfoForScore, scoreColor } from '@/lib/mock-data';
import { Sparkles, Share2, Shuffle, Globe, Lock } from 'lucide-react';
import { VerdictCard } from '@/components/ui/VerdictCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Confetti } from '@/components/ui/Confetti';
import { PremiumLaunchModal } from '@/components/ui/PremiumLaunchModal';
import { useShare } from '@/components/providers/ShareProvider';

type Step = "write" | "loading" | "verdict";

interface PostFormProps {
  partners: Partner[];
  userId: string;
  isPremium?: boolean;
  postLimitReached?: boolean;
  onUpgradedToPremium?: () => void;
}

const WRITING_PROMPTS = [
  "What did they do that made you stop and smile?",
  "Describe the moment you knew they really saw you.",
  "What embarrassing thing did they do that you secretly loved?",
  "How did they show up for you this week?",
  "What's the smallest thing they remembered that blew you away?",
  "When did they do something completely out of character for love?",
  "What did they cook, fix, build, or plan that proved they listen?",
  "Describe a moment where they chose you over convenience.",
  "What's a sacrifice they made you didn't notice until later?",
  "Tell us about the gesture you keep replaying in your head.",
];

const MAX_CHARS = 500;

function lenFeedback(n: number) {
  if (n === 0) return { text: "Start typing — the AI is listening.", emoji: "👀", pulse: 0 };
  if (n >= MAX_CHARS) return { text: "Max length reached. Trim to submit.", emoji: "📏", pulse: 0 };
  if (n < 80) return { text: "Keep going. Details = better verdict.", emoji: "✍️", pulse: 0.3 };
  if (n < 240) return { text: "Perfect length. The AI is paying attention.", emoji: "🔥", pulse: 0.6 };
  return { text: "Good detail. The AI rewards specifics.", emoji: "✨", pulse: 1 };
}

export function PostForm({
  partners,
  userId,
  isPremium = false,
  postLimitReached = false,
  onUpgradedToPremium,
}: PostFormProps) {
  const [step, setStep] = useState<Step>("write");
  const [description, setDescription] = useState('');
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '');
  const [isPublic, setIsPublic] = useState(true);
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * WRITING_PROMPTS.length));

  const [aiResult, setAiResult] = useState<AIScoreResult | null>(null);
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);
  const [flaggedReason, setFlaggedReason] = useState('');
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFirstPost, setIsFirstPost] = useState(false);
  const [showWelcomeCeremony, setShowWelcomeCeremony] = useState(false);
  const [showVerdictCard, setShowVerdictCard] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [newBadges, setNewBadges] = useState<Array<{ id: string; name: string; emoji: string }>>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showBadgeReward, setShowBadgeReward] = useState(false);

  const router = useRouter();
  const { addToast } = useToast();
  const createPost = useCreatePost();
  const { openShare } = useShare();

  const selectedPartner = partners.find(p => p.id === partnerId);
  const partnerNickname = selectedPartner?.name || "your partner";
  const feedback = lenFeedback(description.length);
  const limitReached = !isPremium && postLimitReached;

  const handleUpgradeToPremium = () => {
    setShowPremiumModal(true);
  };

  const shufflePrompt = () => {
    let next;
    do {
      next = Math.floor(Math.random() * WRITING_PROMPTS.length);
    } while (next === promptIndex && WRITING_PROMPTS.length > 1);
    setPromptIndex(next);
  };

  const submit = async () => {
    if (limitReached) {
      addToast('Free users can only create up to 2 posts per day. Upgrade to premium for unlimited posts.', 'warning');
      return;
    }

    if (description.length === 0 || description.length > MAX_CHARS) return;
    
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

      // Track streak & badges
      if (result.streak) {
        setCurrentStreak(result.streak.current);
      }
      if (result.newBadges && result.newBadges.length > 0) {
        setNewBadges(result.newBadges);
        setShowBadgeReward(true);
      }

      // Every post gets the celebration treatment — confetti + score reveal
      const isFirst = result.streak?.current === 1 && !result.streak?.longest;
      setIsFirstPost(isFirst);
      setShowVerdictCard(false);

      setStep("verdict");
      setShowConfetti(true);
      // Show the full welcome ceremony for every post (score reveal + tier + confetti)
      // The "See My Verdict" button inside the ceremony transitions to the verdict card
      setTimeout(() => setShowWelcomeCeremony(true), 600);
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
    // Reset on fresh load
    if (step === 'write') {
      setThinkingPhase(0);
    }
  }, [step]);

  // Build a cycling loader text for the current active phase
  const LOADER_PHASES = [
    "Analyzing emotional consistency...",
    "Analyzing effort patterns...",
    "Cross-referencing romance standards...",
    "Generating verdict...",
  ];

  if (step === "loading") {
    const activeIdx = Math.min(thinkingPhase, LOADER_PHASES.length - 1);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid min-h-[60vh] place-items-center px-6"
      >
        <div className="text-center relative space-y-8 w-full max-w-sm mx-auto">
          {/* Sparkle Spinner */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full glass-btn-gold shadow-[0_0_40px_-10px_var(--gold)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full animate-ping" style={{ animationDuration: '3.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-white/20 rounded-full animate-ping" style={{ animationDuration: '2.2s' }} />
            <Sparkles className="h-8 w-8 text-gold animate-pulse relative z-10" />
          </div>

          {/* Cycling phases — active one pulses, completed ones have a subtle check */}
          <div className="flex flex-col items-center space-y-3 mt-10">
            {LOADER_PHASES.map((text, i) => {
              const isActive = i === activeIdx;
              const isDone = i < activeIdx;
              const isNext = i > activeIdx;

              if (isNext && i > activeIdx + 1) return null; // only show next + current

              return (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{
                    opacity: isDone ? 0.5 : 1,
                    y: 0,
                    filter: isDone ? 'blur(0px)' : 'blur(0px)',
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-[0.1em]"
                >
                  {isDone ? (
                    <span className="text-gold/60 text-[10px]">✓</span>
                  ) : isActive ? (
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-gold text-[10px]"
                    >
                      ●
                    </motion.span>
                  ) : null}
                  <span className={
                    isActive
                      ? "text-gold font-medium"
                      : isDone
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground/30"
                  }>
                    {text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  if (step === "verdict" && aiResult) {
    const tierInfo = tierInfoForScore(aiResult.score);
    return (
      <>
        {/* Confetti burst */}
        <Confetti active={showConfetti} particleCount={70} />

        {/* Welcome Ceremony Overlay — first post only */}
        <AnimatePresence>
          {showWelcomeCeremony && isFirstPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl"
            >
              {/* Breathing glow — same as onboarding finale */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full bg-primary/30 blur-[100px]"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.16, 0.06] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute w-[35vw] h-[35vw] max-w-[280px] max-h-[280px] rounded-full glass-btn-gold blur-[80px]"
              />

              <div className="relative z-10 text-center space-y-8">
                {/* Tier reveal — word by word */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-xs uppercase tracking-[0.3em] font-bold text-gold mb-3">
                    Welcome to
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl">{tierInfo.emoji}</span>
                    <h2 className="font-display italic text-5xl sm:text-6xl font-bold text-foreground">
                      {tierInfo.name}
                    </h2>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground">
                    Your Relationship Has a Score
                  </p>
                </motion.div>

                {/* Score reveal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="font-score text-8xl sm:text-[8rem] leading-none"
                  style={{ color: scoreColor(aiResult.score) }}
                >
                  <AnimatedNumber value={aiResult.score} delay={1.2} />
                </motion.div>

                {/* Continue button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.0, duration: 0.6 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => { setShowWelcomeCeremony(false); setShowVerdictCard(true); }}
                    className="relative overflow-hidden flex items-center justify-center gap-3 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-md px-10 py-4 text-sm font-bold text-gold shadow-[0_0_28px_-4px_rgba(199,169,107,0.2)] transition-all hover:scale-[1.02] hover:bg-gold/18 hover:shadow-[0_0_40px_-4px_rgba(199,169,107,0.35)] active:scale-[0.98] active:bg-gold/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent animate-shimmer pointer-events-none" />
                    <span className="relative z-10">See My Verdict</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showVerdictCard && (
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

              {/* Streak info */}
              {currentStreak > 0 && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 mb-3 mt-4">
                  <span>🔥</span>
                  <span className="font-medium">{currentStreak}-day streak</span>
                  <span className="mx-1">·</span>
                  <span>+{Math.min(currentStreak, 25)}% score boost</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {/* Primary actions — side by side */}
                <div className="flex gap-3">
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
                    className="flex-1 flex items-center justify-center gap-2.5 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-xl py-3.5 font-bold text-gold text-sm transition-all hover:bg-gold/20 hover:scale-[1.02] active:bg-gold/25 active:scale-[0.98]"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={() => router.push('/leaderboards')}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary/15 backdrop-blur-xl border border-primary/25 text-primary py-3.5 font-bold text-sm transition-all hover:bg-primary/25 hover:scale-[1.02] active:bg-primary/35 active:scale-[0.98]"
                  >
                    My Rank ↑
                  </button>
                </div>
                {/* Secondary — subtle link */}
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors active:text-foreground underline underline-offset-2 decoration-dotted"
                >
                  Back to feed
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
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
                : 'border-border bg-elevated/40 text-muted-foreground hover:text-foreground active:text-foreground'
            }`}
          >
            {p.emoji} {p.name}
          </button>
        ))}
      </div>

      {/* Prompt roulette — helps stuck users */}
      {description.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex items-start gap-3 rounded-2xl bg-gold/5 border border-gold/10 px-4 py-3"
        >
          <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold/70 mb-1">
              Need inspiration?
            </p>
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              &ldquo;{WRITING_PROMPTS[promptIndex]}&rdquo;
            </p>
          </div>
          <button
            onClick={shufflePrompt}
            className="p-1.5 rounded-full hover:bg-gold/10 text-gold/60 hover:text-gold transition-colors active:bg-gold/15 active:text-gold shrink-0"
            aria-label="Shuffle prompt"
          >
            <Shuffle className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Journal-style textarea */}
      <div className="relative mt-5 group">
        {/* Subtle page lines — like ruled paper */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.06]"
          aria-hidden
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-px bg-foreground"
              style={{ marginTop: '2.25rem', marginLeft: '2rem', marginRight: '2rem' }}
            />
          ))}
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          className="relative w-full resize-none rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 font-display text-2xl italic leading-[2.25rem] text-foreground outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15 focus:bg-card placeholder:text-muted-foreground/30 shadow-sm transition-all"
          placeholder={`What did ${partnerNickname} do? Be specific — the AI rewards details.`}
          maxLength={MAX_CHARS}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <motion.span
            key={feedback.emoji}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {feedback.emoji}
          </motion.span>
          {feedback.text}
        </span>
        <span className="flex items-center gap-2">
          {description.length >= MAX_CHARS - 100 && description.length < MAX_CHARS && (
            <span className="text-amber-500/70 text-[10px] font-medium">
              {MAX_CHARS - description.length} left
            </span>
          )}
          {description.length >= MAX_CHARS && (
            <span className="text-red-500/80 text-[10px] font-medium">
              Max reached
            </span>
          )}
          <span className={`tabular-nums ${
            description.length >= MAX_CHARS ? 'text-red-500/80' :
            description.length >= MAX_CHARS - 100 ? 'text-amber-500/70' :
            'text-muted-foreground'
          }`}>
            {description.length}<span className="text-muted-foreground/40">/{MAX_CHARS}</span>
          </span>
        </span>
      </div>

      {/* Public/Private toggle — prominent with context */}
      <div className="mt-5 flex items-stretch gap-2">
        <button
          onClick={() => setIsPublic(true)}
          className={`flex-1 flex items-center gap-3 rounded-2xl py-3 px-4 text-sm font-medium transition-all ${
            isPublic
              ? 'bg-primary/10 border border-primary/30 text-primary shadow-[0_0_12px_-2px_rgba(var(--primary),0.2)]'
              : 'border border-border bg-elevated/40 text-muted-foreground hover:text-foreground active:text-foreground'
          }`}
        >
          <Globe className="h-4 w-4 shrink-0 self-center" />
          <div className="text-left">
            <div className="font-semibold text-xs">Public</div>
            <div className="text-[10px] opacity-60">Appears on leaderboard</div>
          </div>
        </button>
        <button
          onClick={() => setIsPublic(false)}
          className={`flex-1 flex items-center gap-3 rounded-2xl py-3 px-4 text-sm font-medium transition-all ${
            !isPublic
              ? 'bg-muted-foreground/10 border border-muted-foreground/30 text-muted-foreground'
              : 'border border-border bg-elevated/40 text-muted-foreground hover:text-foreground active:text-foreground'
          }`}
        >
          <Lock className="h-4 w-4 shrink-0 self-center" />
          <div className="text-left">
            <div className="font-semibold text-xs">Private</div>
            <div className="text-[10px] opacity-60">Just for you</div>
          </div>
        </button>
      </div>

      {/* Submit button — pulses with intensity as detail grows */}
      <motion.button
        onClick={submit}
        disabled={limitReached || description.length === 0 || description.length > MAX_CHARS || createPost.isPending}
        animate={{
          scale: description.length > 0 && description.length <= MAX_CHARS ? [1, 1 + feedback.pulse * 0.015, 1] : 1,
          boxShadow: description.length > 0 && description.length <= MAX_CHARS
            ? [
                `0 0 0 0 rgba(var(--primary), ${0.15 + feedback.pulse * 0.25})`,
                `0 0 0 ${8 + feedback.pulse * 16}px rgba(var(--primary), 0)`,
                `0 0 0 0 rgba(var(--primary), 0)`
              ]
            : 'none'
        }}
        transition={{
          duration: 2 - feedback.pulse * 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-full glass-btn py-3.5 font-bold uppercase tracking-[0.2em] text-[10px] transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {createPost.isPending ? 'Submitting...' : (
          <>
            Submit for Judgement
            {description.length > 0 && description.length <= MAX_CHARS && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.span>
            )}
          </>
        )}
      </motion.button>

      {limitReached && (
        <p className="mt-2 text-center text-[10px] text-amber-500/70 font-medium uppercase tracking-wider">
          Daily post limit reached
        </p>
      )}

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
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-destructive">
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
              className="w-full py-4 rounded-full bg-foreground/10 backdrop-blur-xl border border-foreground/20 text-foreground text-sm font-bold hover:bg-foreground/20 transition-all hover:scale-[1.02] shadow-lg active:bg-foreground/30 active:scale-[0.98]"
            >
              My bad, let me tell the truth
            </button>
          </motion.div>

        </div>
      </Modal>

      {/* Badge Reward Modal */}
      <AnimatePresence>
        {showBadgeReward && newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
            onClick={() => setShowBadgeReward(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, filter: 'blur(12px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.85, opacity: 0, filter: 'blur(12px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm w-full rounded-3xl border border-gold/20 bg-background/95 backdrop-blur-2xl p-8 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-gold/[0.06] blur-[60px] pointer-events-none" />

              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 0.2 }}
                className="relative mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center text-4xl shadow-[0_0_40px_-10px_rgba(199,169,107,0.3)]"
              >
                {newBadges[0]?.emoji || '🏅'}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold/70 mb-1">Badge Unlocked</p>
                <h3 className="font-display text-2xl italic text-foreground mb-2">
                  {newBadges[0]?.name || 'New Badge'}
                </h3>
                {newBadges.length > 1 && (
                  <p className="text-xs text-muted-foreground/70">
                    +{newBadges.length - 1} more badge{newBadges.length > 2 ? 's' : ''} earned
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5"
              >
                <button
                  onClick={() => setShowBadgeReward(false)}
                  className="rounded-full glass-btn-gold hover:bg-gold px-6 py-2.5 text-xs font-bold text-black transition-all hover:scale-[1.02]"
                >
                  Claim Badge
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumLaunchModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        source="post-form"
      />
    </>
  );
}
