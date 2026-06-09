'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Heart, Sparkles, ArrowRight, User, Compass, Star, Settings, ArrowLeft, Palette } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAtmosphere } from '@/components/providers/AtmosphereProvider';
import { PartnerForm } from '@/components/partners/PartnerForm';
import { motion } from 'framer-motion';

const GOALS = [
  "Be more thoughtful",
  "Plan better dates",
  "Remember important moments",
  "Improve communication",
  "Create lasting memories"
];

const PREFERENCES = [
  "Words of Affirmation",
  "Acts of Service",
  "Receiving Gifts",
  "Quality Time",
  "Physical Touch"
];

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { addToast } = useToast();

  const [status, setStatus] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const { particlesEnabled: showBubbles, setParticlesEnabled: setShowBubbles, atmosphere, setAtmosphere } = useAtmosphere();

  if (authLoading) return null;
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handlePartnerCreated = () => {
    setStep(4);
  };

  const completeOnboarding = async () => {
    // Only set basic preferences locally if needed, do not overwrite bio
    addToast("Welcome to Fond! Your journey begins now.", "success");
    router.push('/dashboard');
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col bg-transparent text-foreground overflow-x-hidden">
      {/* We rely entirely on AtmosphereProvider for the background now! */}

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-6 sm:py-12">
        {/* Navigation / Progress bar */}
        <div className="flex items-center gap-4 mb-8 sm:mb-12">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 mt-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step >= i ? 'bg-primary' : 'bg-black/10 dark:bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 fade-in duration-500" key={step}>
          
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center text-center">
              <div className="mx-auto flex items-center justify-center mb-8">
                <Sparkles className="h-16 w-16 text-gold animate-pulse-glow" />
              </div>
              <h1 className="font-display text-7xl italic font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                Fond.
              </h1>
              <p className="text-muted-foreground text-xl mb-12 max-w-md mx-auto leading-relaxed font-medium">
                The most elegant way to document your romance, score your thoughtful moments, and cherish your love story.
              </p>
              <button 
                onClick={() => setStep(2)}
                className="mx-auto w-full max-w-xs flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] uppercase tracking-[0.2em] text-[10px]"
              >
                Begin Journey <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Step 2 of 8</div>
              <h1 className="font-display text-4xl italic font-bold mb-2">What is your relationship status?</h1>
              <p className="text-muted-foreground mb-8">This helps us tailor your insights and reminders.</p>
              
              <div className="space-y-3">
                {['Dating', 'Engaged', 'Married', 'Long Distance', 'It\'s Complicated'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatus(s); setTimeout(() => setStep(3), 300); }}
                    className={`w-full text-left px-6 py-5 rounded-2xl border transition-all ${status === s ? 'border-blush bg-blush/10 text-blush shadow-[0_0_20px_rgba(255,107,152,0.1)]' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground'}`}
                  >
                    <span className="font-medium text-lg">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col">
              <div className="mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Step 3 of 8</div>
              <h1 className="font-display text-4xl italic font-bold mb-2">Introduce your partner</h1>
              <p className="text-muted-foreground mb-8">Who are we celebrating today?</p>
              
              <div className="bg-card/50 rounded-3xl border border-border dark:border-white/10 p-6 backdrop-blur-xl shadow-sm">
                <PartnerForm userId={user.id} onSuccess={handlePartnerCreated} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Step 4 of 8</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs uppercase tracking-widest font-semibold">
                  <Compass className="h-3.5 w-3.5" /> Goals
                </div>
              </div>
              <h1 className="font-display text-4xl italic font-bold mb-2">What do you want to achieve?</h1>
              <p className="text-muted-foreground mb-8">Select all that apply.</p>
              
              <div className="flex flex-wrap gap-3 mb-12">
                {GOALS.map(goal => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => toggleSelection(goal, selectedGoals, setSelectedGoals)}
                      className={`px-5 py-3 rounded-full border transition-all ${isSelected ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground'}`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button 
                  onClick={() => setStep(5)}
                  disabled={selectedGoals.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => setStep(5)} className="text-muted-foreground font-medium text-sm py-2 hover:text-foreground transition-colors">
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Step 5 of 8</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blush/10 border border-blush/20 text-blush text-xs uppercase tracking-widest font-semibold">
                  <Star className="h-3.5 w-3.5" /> Personalization
                </div>
              </div>
              <h1 className="font-display text-4xl italic font-bold mb-2">What is their Love Language?</h1>
              <p className="text-muted-foreground mb-8">This helps our AI score your efforts more accurately.</p>
              
              <div className="flex flex-wrap gap-3 mb-12">
                {PREFERENCES.map(pref => {
                  const isSelected = selectedLanguages.includes(pref);
                  return (
                    <button
                      key={pref}
                      onClick={() => toggleSelection(pref, selectedLanguages, setSelectedLanguages)}
                      className={`px-5 py-3 rounded-full border transition-all ${isSelected ? 'border-blush bg-blush/20 text-blush shadow-[0_0_15px_rgba(255,107,152,0.2)]' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground'}`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button 
                  onClick={() => setStep(6)}
                  disabled={selectedLanguages.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => setStep(6)} className="text-muted-foreground font-medium text-sm py-2 hover:text-foreground transition-colors">
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">Step 6 of 8</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs uppercase tracking-widest font-semibold">
                  <Palette className="h-3.5 w-3.5" /> Aesthetics
                </div>
              </div>
              <h1 className="font-display text-4xl italic font-bold mb-2">Customize your vibe</h1>
              <p className="text-muted-foreground mb-8">Make Fond feel like your own.</p>
              
              <div className="space-y-8 mb-12">
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Theme Preferences</h3>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${theme === 'dark' ? 'border-primary bg-primary/10 text-primary shadow-glow' : 'border-border bg-card hover:bg-elevated text-foreground'}`}
                    >
                      <span className="text-base">🌙</span>
                      <span className="font-semibold text-sm">Dark</span>
                    </button>
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${theme === 'light' ? 'border-primary bg-primary/10 text-primary shadow-glow' : 'border-border bg-card hover:bg-elevated text-foreground'}`}
                    >
                      <span className="text-base">☀️</span>
                      <span className="font-semibold text-sm">Light</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Atmosphere Gradients</h3>
                  <div className="flex flex-wrap gap-3">
                    {([
                      { id: 'soft-blush', name: 'Soft Blush', color: 'bg-rose-300' },
                      { id: 'mesh-rose', name: 'Mesh Rose', color: 'bg-pink-500' },
                      { id: 'vignette-rose', name: 'Vignette', color: 'bg-rose-900' },
                      { id: 'prismatic-rose', name: 'Prismatic', color: 'bg-gradient-to-r from-pink-400 to-gold' },
                      { id: 'aura', name: 'Aura Glow', color: 'bg-purple-400' }
                    ] as const).map(atm => (
                      <button 
                        key={atm.id}
                        onClick={() => setAtmosphere(atm.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all ${atmosphere === atm.id ? 'border-primary bg-primary/10 text-primary shadow-glow' : 'border-border bg-card hover:bg-elevated text-foreground'}`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${atm.color}`} />
                        <span className="font-semibold text-sm">{atm.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Magic Particles</h3>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setShowBubbles(true)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${showBubbles ? 'border-gold/50 bg-gold/10 text-gold shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'border-border bg-card hover:bg-elevated text-foreground'}`}
                    >
                      <span className="text-base">✨</span>
                      <span className="font-semibold text-sm">Bubbles On</span>
                    </button>
                    <button 
                      onClick={() => setShowBubbles(false)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${!showBubbles ? 'border-primary bg-primary/10 text-primary shadow-glow' : 'border-border bg-card hover:bg-elevated text-foreground'}`}
                    >
                      <span className="text-base">☁️</span>
                      <span className="font-semibold text-sm">Minimal</span>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(7)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] mt-auto"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 7 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8 flex flex-col items-center">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-6">Step 7 of 8</div>
                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-black/10 dark:border-white/10 shadow-sm">
                  <Settings className="h-8 w-8 text-foreground" />
                </div>
              </div>
              <h1 className="font-display text-4xl italic font-bold mb-6 text-center">How Fond Works</h1>
              
              <div className="space-y-10 relative before:absolute before:inset-y-0 before:left-[35px] before:w-[2px] before:bg-gradient-to-b before:from-primary/20 before:via-blush/20 before:to-gold/20 py-4">
                <motion.div 
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="relative flex gap-8 items-start"
                >
                  <div className="shrink-0 h-[72px] w-[72px] rounded-full bg-background border-4 border-card flex items-center justify-center text-primary font-bold shadow-lg shadow-primary/20 z-10 text-2xl font-display italic">1</div>
                  <div className="pt-3">
                    <h3 className="font-display italic text-3xl text-foreground">Document the Magic</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2">Chronicle the small gestures and grand dates. The more detail, the richer the memory.</p>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                  className="relative flex gap-8 items-start"
                >
                  <div className="shrink-0 h-[72px] w-[72px] rounded-full bg-background border-4 border-card flex items-center justify-center text-blush font-bold shadow-lg shadow-blush/20 z-10 text-2xl font-display italic">2</div>
                  <div className="pt-3">
                    <h3 className="font-display italic text-3xl text-foreground">AI Scoring & Insights</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2">Our AI delicately analyzes your posts based on Romance, Thoughtfulness, and Effort.</p>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                  className="relative flex gap-8 items-start"
                >
                  <div className="shrink-0 h-[72px] w-[72px] rounded-full bg-background border-4 border-card flex items-center justify-center text-gold font-bold shadow-lg shadow-gold/20 z-10 text-2xl font-display italic">3</div>
                  <div className="pt-3">
                    <h3 className="font-display italic text-3xl text-foreground">Climb the Leaderboard</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2">Make it public to compete with couples worldwide on the relationship leaderboard.</p>
                  </div>
                </motion.div>
              </div>

              <button 
                onClick={() => setStep(8)}
                className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                I understand
              </button>
            </div>
          )}

          {step === 8 && (
            <div className="flex-1 flex flex-col justify-center text-center relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[60vw] h-[60vw] md:w-96 md:h-96 rounded-full bg-primary/30 blur-[100px]"
                />
              </div>

              <div className="relative z-10">
                <div className="mb-12 h-20 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                  {"The canvas is blank. The story is yours.".split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                      className="font-display italic text-3xl md:text-4xl text-muted-foreground/80"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
                >
                  <h1 className="font-display text-6xl italic font-bold tracking-tight mb-12 text-foreground drop-shadow-lg">
                    You're all set.
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.5, duration: 0.6 }}
                >
                  <button 
                    onClick={completeOnboarding}
                    className="mx-auto w-full max-w-sm relative overflow-hidden flex items-center justify-center gap-3 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-md py-5 font-bold text-gold shadow-[0_0_30px_rgba(255,215,0,0.15)] transition-all hover:scale-[1.02] hover:bg-gold/20 hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] group uppercase tracking-[0.2em] text-[10px]"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <span className="relative z-10 flex items-center gap-3">
                      Step Into Your Archive <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </motion.div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
