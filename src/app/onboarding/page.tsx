'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Heart, Sparkles, ArrowRight, User, Compass, Star, Settings } from 'lucide-react';
import { PartnerForm } from '@/components/partners/PartnerForm';

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

  if (authLoading) return null;
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handlePartnerCreated = () => {
    setStep(4);
  };

  const completeOnboarding = async () => {
    // Save preferences to local storage or append to bio (as a lightweight solution)
    const preferences = {
      status,
      goals: selectedGoals,
      loveLanguages: selectedLanguages
    };
    
    // Optional: save to Supabase profile bio
    const supabase = createClient();
    await supabase.from('profiles').update({
      bio: JSON.stringify(preferences)
    }).eq('id', user.id);

    addToast("Welcome to Love Log! Your journey begins now.", "success");
    router.push('/dashboard');
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000">
        <div className="absolute top-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-blush opacity-10 mix-blend-screen blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-primary opacity-10 mix-blend-screen blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12">
        {/* Progress bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step >= i ? 'bg-blush' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 fade-in duration-500" key={step}>
          
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center text-center">
              <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8 border border-primary/30 shadow-[0_0_50px_-10px_var(--primary)]">
                <Heart className="h-10 w-10 text-primary animate-pulse-glow" />
              </div>
              <h1 className="font-display text-5xl italic font-bold tracking-tight mb-4">
                Welcome to Love Log
              </h1>
              <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto leading-relaxed">
                A premium space designed to help you remember, celebrate, and deepen your relationship.
              </p>
              <button 
                onClick={() => setStep(2)}
                className="mx-auto w-full max-w-xs flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 font-semibold text-background shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-[1.02]"
              >
                Let's Begin <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="font-display text-4xl italic font-bold mb-2">What is your relationship status?</h1>
              <p className="text-muted-foreground mb-8">This helps us tailor your insights and reminders.</p>
              
              <div className="space-y-3">
                {['Dating', 'Engaged', 'Married', 'Long Distance', 'It\'s Complicated'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatus(s); setTimeout(() => setStep(3), 300); }}
                    className={`w-full text-left px-6 py-5 rounded-2xl border transition-all ${status === s ? 'border-blush bg-blush/10 text-blush shadow-[0_0_20px_rgba(255,107,152,0.1)]' : 'border-white/10 bg-white/5 hover:bg-white/10 text-foreground'}`}
                  >
                    <span className="font-medium text-lg">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col">
              <h1 className="font-display text-4xl italic font-bold mb-2">Introduce your partner</h1>
              <p className="text-muted-foreground mb-8">Who are we celebrating today?</p>
              
              <div className="bg-card/50 rounded-3xl border border-white/10 p-6 backdrop-blur-xl">
                <PartnerForm userId={user.id} onSuccess={handlePartnerCreated} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs uppercase tracking-widest font-semibold">
                <Compass className="h-3.5 w-3.5" /> Goals
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
                      className={`px-5 py-3 rounded-full border transition-all ${isSelected ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 text-foreground'}`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setStep(5)}
                disabled={selectedGoals.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 font-semibold text-background transition-transform hover:scale-[1.02] disabled:opacity-50 mt-auto"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blush/10 border border-blush/20 text-blush text-xs uppercase tracking-widest font-semibold">
                <Star className="h-3.5 w-3.5" /> Personalization
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
                      className={`px-5 py-3 rounded-full border transition-all ${isSelected ? 'border-blush bg-blush/20 text-blush shadow-[0_0_15px_rgba(255,107,152,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 text-foreground'}`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setStep(6)}
                disabled={selectedLanguages.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 font-semibold text-background transition-transform hover:scale-[1.02] disabled:opacity-50 mt-auto"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 6 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                <Settings className="h-8 w-8 text-foreground" />
              </div>
              <h1 className="font-display text-4xl italic font-bold mb-6 text-center">How Love Log AI Works</h1>
              
              <div className="space-y-6">
                <div className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-white/5">
                  <div className="mt-1 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-lg">Document the Magic</h3>
                    <p className="text-muted-foreground text-sm">Post the little things your partner does for you. The more detail, the better.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-white/5">
                  <div className="mt-1 h-8 w-8 rounded-full bg-blush/20 flex items-center justify-center text-blush font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Scoring & Insights</h3>
                    <p className="text-muted-foreground text-sm">Our AI analyzes your posts based on Romance, Thoughtfulness, and Effort.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-white/5">
                  <div className="mt-1 h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-lg">Climb the Leaderboard</h3>
                    <p className="text-muted-foreground text-sm">Make it public to compete with couples worldwide on the relationship leaderboard.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(7)}
                className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 font-semibold text-background transition-transform hover:scale-[1.02]"
              >
                I understand
              </button>
            </div>
          )}

          {step === 7 && (
            <div className="flex-1 flex flex-col justify-center text-center">
              <div className="mx-auto w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_var(--primary)]">
                <Sparkles className="h-10 w-10 text-primary-foreground animate-pulse" />
              </div>
              <h1 className="font-display text-5xl italic font-bold tracking-tight mb-4 text-primary">
                You're all set.
              </h1>
              <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto">
                Your relationship journal is ready. Let's make some memories.
              </p>
              <button 
                onClick={completeOnboarding}
                className="mx-auto w-full max-w-xs flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
              >
                Enter Love Log <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
