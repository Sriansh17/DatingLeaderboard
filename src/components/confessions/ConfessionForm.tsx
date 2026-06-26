'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';
import { Sparkles, Send, Lock, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const WRITING_PROMPTS = [
  "What's something you've never told anyone about your relationship?",
  "What did they do today that made you feel lucky?",
  "Describe a moment you felt truly seen.",
  "What's a secret you're afraid to say out loud?",
  "When did you realize you were in love?",
  "What's something small they do that means everything?",
  "What's an apology you've been meaning to give?",
  "Describe the last time they made you laugh uncontrollably.",
  "What's a boundary you wish you had set earlier?",
  "What's the most vulnerable thing you've ever felt?",
];

function lenFeedback(n: number) {
  if (n < 30) return { text: "The world is listening. Say more.", emoji: "👀", pulse: 0 };
  if (n < 80) return { text: "Getting there. Details make it real.", emoji: "✍️", pulse: 0.3 };
  if (n < 240) return { text: "Perfect. This will hit different.", emoji: "🔥", pulse: 0.6 };
  return { text: "Deep. The algorithm will feel this.", emoji: "✨", pulse: 1 };
}

export function ConfessionForm() {
  const [content, setContent] = useState('');
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * WRITING_PROMPTS.length));
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const feedback = lenFeedback(content.length);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to post confession');
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confessions'] });
      addToast('Your confession was posted anonymously.', 'success');
      router.push('/dashboard');
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });

  const shufflePrompt = () => {
    let next;
    do {
      next = Math.floor(Math.random() * WRITING_PROMPTS.length);
    } while (next === promptIndex && WRITING_PROMPTS.length > 1);
    setPromptIndex(next);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Lock className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Anonymous</span>
          </div>
        </div>
        <h1 className="font-display text-3xl italic leading-tight text-foreground">
          Confess anonymously.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No name. No partner. Just the truth. Your identity stays hidden.
        </p>
      </div>

      {/* Prompt inspiration */}
      {content.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-3 rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3"
        >
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70 mb-1">
              Need inspiration?
            </p>
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              &ldquo;{WRITING_PROMPTS[promptIndex]}&rdquo;
            </p>
          </div>
          <button
            onClick={shufflePrompt}
            className="p-1.5 rounded-full hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors active:bg-primary/15 active:text-primary/80 shrink-0"
            aria-label="Shuffle prompt"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Textarea */}
      <div className="relative group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="relative w-full resize-none rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 font-display text-2xl italic leading-[2.25rem] text-foreground outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15 focus:bg-card placeholder:text-muted-foreground/30 shadow-sm transition-all"
          placeholder="Write what you really feel..."
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
        <span className="text-muted-foreground tabular-nums">{content.length} chars</span>
      </div>

      {/* Privacy notice */}
      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3 border border-border">
        <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          This will be posted anonymously. Your username and identity will never be shown. Only the confession text is visible.
        </p>
      </div>

      {/* Submit */}
      <motion.button
        onClick={() => submitMutation.mutate()}
        disabled={content.trim().length < 10 || submitMutation.isPending}
        animate={{
          scale: content.length >= 10 ? [1, 1 + feedback.pulse * 0.015, 1] : 1,
        }}
        transition={{
          duration: 2 - feedback.pulse * 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-glow transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitMutation.isPending ? 'Posting anonymously...' : (
          <>
            Post Anonymously
            <Send className="h-4 w-4" />
          </>
        )}
      </motion.button>
    </div>
  );
}
