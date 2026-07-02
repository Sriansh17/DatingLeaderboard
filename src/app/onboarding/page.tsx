'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Sparkles, ArrowRight, Compass, Star, ArrowLeft, Volume2, VolumeX, Camera, ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAtmosphere } from '@/components/providers/AtmosphereProvider';
import { PartnerForm } from '@/components/partners/PartnerForm';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { AvatarSelectionModal } from '@/components/profile/AvatarSelectionModal';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimate, stagger } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 8;

const GOALS = [
  'Be more thoughtful',
  'Plan better dates',
  'Remember important moments',
  'Improve communication',
  'Create lasting memories',
];

const LOVE_LANGUAGES = [
  'Words of Affirmation',
  'Acts of Service',
  'Receiving Gifts',
  'Quality Time',
  'Physical Touch',
];

const RELATIONSHIP_STATUSES = [
  'Dating',
  'Engaged',
  'Married',
  'Long Distance',
  "It's Complicated",
];

// ─── Progress Bar — thin bar with heartbeat pulse ────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const segments = total - 1;
  const filled = step - 1;
  const pct = (filled / segments) * 100;

  return (
    <div className="flex-1 flex items-center gap-2.5">
      {/* Track */}
      <div className="relative flex-1 h-[2px] rounded-full bg-black/10 dark:bg-white/10">
        {/* Filled portion */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, rgb(var(--primary)) 0%, rgb(var(--gold)) 100%)',
          }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
        />

        {/* Heartbeat dot at the leading edge */}
        {pct > 0 && pct < 100 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            animate={{ left: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute rounded-full bg-primary/30"
              animate={{ scale: [1, 2.8], opacity: [0.6, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
              style={{ width: 10, height: 10, top: 0, left: 0 }}
            />
            {/* Core dot */}
            <div className="relative w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_2px_rgba(var(--primary),0.6)]" />
          </motion.div>
        )}
      </div>

      {/* Step counter */}
      <span className="text-[10px] font-bold tabular-nums text-muted-foreground/40 shrink-0">
        {filled}/{segments}
      </span>
    </div>
  );
}

// ─── Magnetic Spotlight Card ──────────────────────────────────────────────────

function SpotlightCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useTransform(my, [0, 1], [3, -3]);
  const rotateY = useTransform(mx, [0, 1], [-3, 3]);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    },
    [mx, my],
  );
  const onLeave = useCallback(() => {
    mx.set(0.5);
    my.set(0.5);
  }, [mx, my]);

  // spotlight position as % string — recompute on render; framer handles the rest
  const spotX = `${mx.get() * 100}%`;
  const spotY = `${my.get() * 100}%`;

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileTap={{ scale: 0.975 }}
      aria-pressed={selected}
      className={`relative w-full text-left px-6 py-5 rounded-2xl overflow-hidden transition-colors duration-300 ${
        selected ? 'border border-primary/50' : 'border border-black/8 dark:border-border'
      }`}
    >
      {/* Frosted glass base */}
      <div className="absolute inset-0 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm" />

      {/* Moving spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${spotX} ${spotY}, rgba(var(--primary), 0.12) 0%, transparent 65%)`,
          opacity: selected ? 1 : 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Selection ring + blush aura */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow:
                '0 0 0 1.5px rgb(var(--primary) / 0.45), 0 0 28px -4px rgb(var(--primary) / 0.18)',
            }}
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 font-medium text-lg text-foreground">{label}</span>
    </motion.button>
  );
}

// ─── Select Pill ──────────────────────────────────────────────────────────────

function SelectPill({
  label,
  selected,
  onClick,
  color = 'primary',
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  color?: 'primary' | 'blush';
}) {
  const active =
    color === 'blush'
      ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_18px_-2px_rgb(var(--primary)/0.25)]'
      : 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_18px_-2px_rgb(var(--primary)/0.25)]';

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-medium transition-all duration-300 ${
        selected
          ? active
          : 'border-black/10 dark:border-border bg-black/4 dark:bg-white/4 hover:bg-black/8 dark:hover:bg-white/8 active:bg-black/12 dark:active:bg-white/12 text-foreground'
      }`}
    >
      <AnimatePresence>
        {selected && (
          <motion.span
            key="dot"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 6, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="block h-1.5 w-1.5 rounded-full bg-primary shrink-0"
          />
        )}
      </AnimatePresence>
      {label}
    </motion.button>
  );
}

// ─── Step transition variants ─────────────────────────────────────────────────

const variants = {
  enter: { opacity: 0, filter: 'blur(10px)', scale: 0.975, y: 16 },
  center: { opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 },
  exit: { opacity: 0, filter: 'blur(6px)', scale: 0.985, y: -10 },
};

// ─── Cinematic Intro ──────────────────────────────────────────────────────────

function CinematicIntro({ onStart, audioRef }: { onStart: () => void; audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const [scope, animate] = useAnimate();
  const [started, setStarted] = useState(false);

  const startSequence = useCallback(() => {
    if (started) return;
    setStarted(true);

    // Audio starts here — inside a real tap/click, browser always allows it
    if (audioRef.current) {
      audioRef.current.currentTime = 12; // skip past the intro build-up
      audioRef.current.play().catch(() => {});
    }

    const seq = async () => {
      await animate(scope.current, { opacity: 1 }, { duration: 0 });
      await animate('#intro-glow', { opacity: [0, 0.6], scale: [0.4, 1.2] }, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
      await animate('#intro-sparkle', { opacity: [0, 1], y: [-20, 0], scale: [0.6, 1], rotate: [-15, 0] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
      await animate('#intro-wordmark', { opacity: [0, 1], y: [40, 0], filter: ['blur(24px)', 'blur(0px)'] }, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
      await animate('#intro-tagline', { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
      await new Promise(r => setTimeout(r, 300));
      animate('#intro-brand', { y: [0, -48] }, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
      await animate('#intro-how', { opacity: [0, 1], y: [60, 0] }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
      await animate('.intro-row', { opacity: [0, 1], x: [-20, 0], filter: ['blur(8px)', 'blur(0px)'] }, { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: stagger(0.12) });
      await animate('#intro-cta', { opacity: [0, 1], y: [20, 0], scale: [0.95, 1] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
    };
    seq();
  }, [started]);

  return (
    <>
      {/* ── Full-screen tap-to-begin overlay ── */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.06 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={startSequence}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer"
          >
            {/* Breathing glow — sits behind everything */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-[55vw] h-[55vw] max-w-[420px] max-h-[420px] rounded-full bg-primary blur-[90px] pointer-events-none"
            />

            {/* Fond. wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center gap-4 select-none"
            >
              <Sparkles
                className="h-7 w-7 text-gold"
                style={{ filter: 'drop-shadow(0 0 16px rgba(199,169,107,0.9))' }}
              />
              <h1 className="font-display italic text-[72px] sm:text-[88px] font-bold tracking-tight leading-none bg-gradient-to-br from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">
                Fond.
              </h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 font-medium">
                Affection Intelligence Platform
              </p>
            </motion.div>

            {/* Tap to begin */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="absolute bottom-16 flex flex-col items-center gap-3 select-none pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                className="w-1.5 h-1.5 rounded-full bg-white/50"
              />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/35 font-medium">
                Tap to begin
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cinematic content (hidden until started) ── */}
      <div
        ref={scope}
        className="flex-1 flex flex-col justify-center items-center text-center opacity-0"
      >
        {/* Ambient glow bloom */}
        <div id="intro-glow" className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-0" aria-hidden>
          <div className="w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-primary/20 blur-[80px]" />
        </div>

        {/* Brand block */}
        <div id="intro-brand" className="flex flex-col items-center mb-2">
          <div id="intro-sparkle" className="opacity-0 mb-5">
            <Sparkles className="h-8 w-8 text-gold" style={{ filter: 'drop-shadow(0 0 12px rgba(199,169,107,0.8))' }} />
          </div>
          <h1 id="intro-wordmark" className="opacity-0 font-display text-[76px] sm:text-[92px] italic font-bold tracking-tight leading-none bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
            Fond.
          </h1>
          <p id="intro-tagline" className="opacity-0 text-muted-foreground text-base leading-relaxed mt-3 max-w-[260px]">
            The AI doesn&apos;t care about your feelings.
          </p>
        </div>

        {/* How Fond works */}
        <div id="intro-how" className="opacity-0 w-full max-w-xs mt-6">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold mb-5 text-center">
            How Fond works
          </p>
          <div className="space-y-4">
            {[
              { n: '01', headline: 'Your partner did something.', sub: 'You describe it. In one sentence or twenty.', color: 'text-primary' },
              { n: '02', headline: 'The AI judges it. Brutally.', sub: 'Scored out of 100. No mercy. No favourites.', color: 'text-gold' },
              { n: '03', headline: 'The whole world sees it.', sub: 'Compete with couples in your city — and on the planet.', color: 'text-primary' },
            ].map((row) => (
              <div key={row.n} className="intro-row opacity-0 flex items-start gap-4 text-left">
                <span className={`font-score text-3xl leading-none shrink-0 mt-0.5 ${row.color}`}>{row.n}</span>
                <div>
                  <p className="font-display italic text-base text-foreground leading-snug">{row.headline}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{row.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Glass CTA */}
        <div id="intro-cta" className="opacity-0 w-full max-w-xs mt-8">
          <button
            onClick={onStart}
            className="relative w-full overflow-hidden flex items-center justify-center gap-3 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-md py-5 text-sm font-bold text-gold shadow-[0_0_28px_-4px_rgba(199,169,107,0.2)] transition-all hover:scale-[1.02] hover:bg-gold/15 hover:shadow-[0_0_50px_-4px_rgba(199,169,107,0.4)] active:scale-[0.98] active:bg-gold/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent animate-shimmer pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2.5">
              Start my archive <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const { user, profile, loading: authLoading, refreshProfile } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const { addToast } = useToast();

  const [status, setStatus] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [ageInvalid, setAgeInvalid] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  // Prefill from profile (set during signup) — keep editable
  useEffect(() => {
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.username) setDisplayName(profile.username);
    if (profile?.age) setAge(profile.age);
    if (profile?.gender) setGender(profile.gender);
    if (profile?.occupation) setOccupation(profile.occupation);
    if (profile?.city) setCity(profile.city);
    if (profile?.country) setCountry(profile.country);
    if (profile?.bio) setBio(profile.bio);
  }, [profile?.id]);
  const { theme, setTheme } = useTheme();
  const { particlesEnabled, setParticlesEnabled, atmosphere, setAtmosphere } = useAtmosphere();

  const [rippleKey, setRippleKey] = useState(0);
  const [ripplePos, setRipplePos] = useState<{ x: number; y: number } | null>(null);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio is created here, played inside CinematicIntro on user tap
  useEffect(() => {
    const audio = new Audio('/audio/intro.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  if (authLoading) return null;
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Guard — already onboarded users go straight to dashboard (bypass with ?preview=1)
  if (profile && profile.has_onboarded && !isPreview) {
    router.replace('/dashboard');
    return null;
  }

  const goTo = (n: number) => {
    setStep(n);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAtmosphereClick = (
    id: typeof atmosphere,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const r = e.currentTarget.getBoundingClientRect();
    setRipplePos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setRippleKey((k) => k + 1);
    setTimeout(() => setAtmosphere(id), 100);
  };

  const completeOnboarding = async () => {
    // Fade out music as they finish
    if (audioRef.current) {
      const audio = audioRef.current;
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.03) {
          audio.volume = Math.max(0, audio.volume - 0.06);
        } else {
          audio.pause();
          clearInterval(fadeOut);
        }
      }, 60);
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          has_onboarded: true,
          relationship_status: status || null,
          onboarding_goals: selectedGoals.length ? selectedGoals : null,
          love_languages: selectedLanguages.length ? selectedLanguages : null,
          username: displayName || null,
          avatar_url: avatarUrl || null,
          age: age || null,
          gender: gender || null,
          occupation: occupation || null,
          bio: bio || null,
          city: city || null,
          country: country || null,
        })
        .eq('id', user.id);

      if (error) {
        console.error('[Onboarding] DB update failed:', error);
        addToast('Could not save preferences. Please try again.', 'error');
        return;
      }

      await refreshProfile();

      // Verify it was saved
      const { data: verify } = await supabase
        .from('profiles')
        .select('has_onboarded')
        .eq('id', user.id)
        .single();

      if (!verify?.has_onboarded) {
        console.warn('[Onboarding] has_onboarded not persisted after update');
      }
    } catch (err) {
      console.error('[Onboarding] Error:', err);
      addToast('Something went wrong. Please try again.', 'error');
      return;
    }

    addToast('Welcome to Fond. Your archive begins now.', 'success');
    router.push('/dashboard');
  };

  const toggle = (
    item: string,
    list: string[],
    setList: (l: string[]) => void,
  ) => setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col bg-transparent text-foreground overflow-x-hidden">

      {/* Mute toggle — top right */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        onClick={() => setMuted(m => !m)}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white/60 hover:text-white hover:bg-black/40 active:text-white/80 active:bg-black/50 transition-all"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </motion.button>

      {/* ── Ripple overlay ── */}
      <AnimatePresence>
        {ripplePos && (
          <motion.div
            key={rippleKey}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 20, opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => setRipplePos(null)}
            className="fixed pointer-events-none z-50 rounded-full"
            style={{
              left: ripplePos.x - 56,
              top: ripplePos.y - 56,
              width: 112,
              height: 112,
              background:
                'radial-gradient(circle, rgba(var(--primary), 0.22) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-6 sm:py-10">

        {/* ── Top bar ── */}
        <div className="flex items-center gap-5 mb-10 sm:mb-14">
          {step > 1 ? (
            <button
              onClick={() => goTo(step - 1)}
              className="p-2 -ml-2 rounded-full hover:bg-black/6 dark:hover:bg-white/8 active:bg-black/10 dark:active:bg-white/12 transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
            </button>
          ) : (
            <div className="w-8 shrink-0" />
          )}
          {/* Hide bar on step 1 — cinematic intro doesn't need progress */}
          {step > 1 && <ProgressBar step={step} total={TOTAL_STEPS} />}
        </div>

        {/* ── Animated step content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col"
          >

            {/* ══════════ STEP 1 — Welcome ══════════ */}
                {step === 1 && (
              <CinematicIntro onStart={() => goTo(2)} audioRef={audioRef} />
            )}

            {/* ══════════ STEP 2 — About You ══════════ */}
            {step === 2 && (
              <div className="flex-1 flex flex-col justify-center">
                <Eyebrow step={step} />
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] uppercase tracking-widest font-semibold mb-4 w-fit">
                  <Sparkles className="h-3 w-3" /> About You
                </div>
                <h1 className="font-display text-4xl italic font-bold mb-2">
                  {fullName ? `Welcome, ${fullName.split(' ')[0]}!` : 'Welcome!'}
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Choose an avatar, pick a username, and share a few details.
                </p>

                {/* Avatar selector — clickable avatar + modal */}
                <div className="flex flex-col items-center mb-6">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold mb-3 block">Choose your avatar</label>
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(true)}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-border hover:border-primary/40 active:border-primary/50 transition-colors flex items-center justify-center overflow-hidden bg-muted/20"
                  >
                    {avatarUrl ? (
                      avatarUrl.startsWith('http') ? (
                        <img src={avatarUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{avatarUrl}</span>
                      )
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </button>
                  <p className="text-[10px] text-muted-foreground/50 mt-2">Tap to choose</p>
                </div>

                {/* Username */}
                <div className="space-y-1.5 mb-5">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Username</label>
                  <div className="flex items-center border-b border-border focus-within:border-primary transition-colors">
                    <span className="text-xl font-display text-muted-foreground/50 pb-0.5">@</span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value.replace(/\s/g, ''))}
                      placeholder="username"
                      maxLength={30}
                      className="flex-1 border-0 bg-transparent py-2.5 px-1 text-xl font-display text-foreground outline-none placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Age + Gender row */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Age</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={age}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                          setAge(val);
                          const num = parseInt(val);
                          setAgeInvalid(val.length > 0 && (num < 13 || num > 120));
                        }}
                        placeholder="24"
                        className={`w-full border-b bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none transition-colors placeholder:text-muted-foreground/30 ${ageInvalid ? 'border-destructive/60' : 'border-border focus:border-primary'}`}
                      />
                      {ageInvalid && (
                        <p className="text-[10px] text-destructive/80 font-medium mt-1">Enter a valid age (13–120)</p>
                      )}
                    </div>
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Gender</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                          onBlur={() => setTimeout(() => setShowGenderDropdown(false), 200)}
                          className="w-full border-b border-border bg-transparent py-2 px-0 text-sm text-left outline-none focus:border-primary transition-colors flex items-center justify-between"
                        >
                          <span className={gender ? 'text-foreground' : 'text-muted-foreground/40'}>{gender || 'Select gender'}</span>
                          <ChevronDown className={'h-4 w-4 text-muted-foreground/40 transition-transform ' + (showGenderDropdown ? 'rotate-180' : '')} />
                        </button>
                        {showGenderDropdown && (
                          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden">
                            {['Male', 'Female', 'Non-binary', 'Gender-fluid', 'Agender', 'Prefer not to say', 'Other'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onMouseDown={() => { setGender(opt); setShowGenderDropdown(false); }}
                                className={'w-full text-left px-4 py-3 text-sm transition-colors ' + (gender === opt ? 'text-primary bg-primary/5 font-medium' : 'text-foreground hover:bg-muted active:bg-muted/80')}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Occupation</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Designer, Engineer, Student"
                      className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>

                  {/* Country — pre-filled from signup */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Your country"
                      className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>

                  {/* City — pre-filled from signup */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>

                  {/* Dating Philosophy */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Dating Philosophy</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="What's your approach to love? (optional)"
                      rows={2}
                      className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display italic text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30 resize-none"
                    />
                  </div>

                </div>


                <div className="mt-auto flex flex-col gap-3 pt-10">
                  <button
                    onClick={() => goTo(3)}
                    disabled={!displayName.trim() || !age || !gender || !occupation || !city || !country}
                    className="w-full flex items-center justify-center gap-2 rounded-full glass-btn py-3.5 font-bold transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-40 uppercase tracking-[0.2em] text-[10px]"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Avatar selection modal */}
                <AvatarSelectionModal
                  isOpen={showAvatarModal}
                  onClose={() => setShowAvatarModal(false)}
                  currentProfile={profile || { id: user?.id, avatar_url: avatarUrl }}
                  onSuccess={() => {
                    refreshProfile();
                    setShowAvatarModal(false);
                    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
                  }}
                />
              </div>
            )}


            {/* ══════════ STEP 3 — Relationship Status ══════════ */}
                {step === 3 && (
              <div className="flex-1 flex flex-col justify-center">
                <Eyebrow step={step} />
                <h1 className="font-display text-4xl italic font-bold mb-2 mt-1">
                  What&apos;s your status?
                </h1>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                  Helps us tailor your insights and frame your leaderboard story.
                </p>
                <div className="space-y-3">
                  {RELATIONSHIP_STATUSES.map((s) => (
                    <SpotlightCard
                      key={s}
                      label={s}
                      selected={status === s}
                      onClick={() => {
                        setStatus(s);
                        setTimeout(() => goTo(4), 260);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ══════════ STEP 4 — Partner ══════════ */}
                {step === 4 && (
              <div className="flex-1 flex flex-col">
                <Eyebrow step={step} />
                <h1 className="font-display text-4xl italic font-bold mb-1 mt-1">
                  Introduce your partner
                </h1>
                <p className="text-muted-foreground text-sm mb-5">
                  Who are we celebrating? You can always add more later.
                </p>
                <div className="rounded-2xl border border-black/8 dark:border-border bg-white/30 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                  <PartnerForm userId={user.id} onSuccess={() => goTo(5)} />
                </div>
                <button
                  onClick={() => goTo(5)}
                  className="mt-4 text-center text-muted-foreground text-sm font-medium hover:text-foreground active:text-foreground transition-colors py-3 touch-target"
                >
                  Skip for now
                </button>
              </div>
            )}

            {/* ══════════ STEP 5 — Goals ══════════ */}
                {step === 5 && (
              <div className="flex-1 flex flex-col justify-center">
                <Eyebrow step={step} />
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] uppercase tracking-widest font-semibold mb-4 w-fit">
                  <Compass className="h-3 w-3" /> Goals
                </div>
                <h1 className="font-display text-4xl italic font-bold mb-2">
                  What do you want here?
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Select all that apply — this shapes your AI coaching.
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  {GOALS.map((g) => (
                    <SelectPill
                      key={g}
                      label={g}
                      selected={selectedGoals.includes(g)}
                      onClick={() => toggle(g, selectedGoals, setSelectedGoals)}
                    />
                  ))}
                </div>
                <div className="mt-auto flex flex-col gap-3">
                  <button
                    onClick={() => goTo(6)}
                    disabled={selectedGoals.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-full glass-btn py-3.5 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-35 uppercase tracking-[0.2em] text-[10px]"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => goTo(6)}
                    className="text-muted-foreground text-sm font-medium py-3 hover:text-foreground active:text-foreground transition-colors touch-target"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* ══════════ STEP 6 — Love Languages ══════════ */}
                {step === 6 && (
              <div className="flex-1 flex flex-col justify-center">
                <Eyebrow step={step} />
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-widest font-semibold mb-4 w-fit">
                  <Star className="h-3 w-3" /> Love Language
                </div>
                <h1 className="font-display text-4xl italic font-bold mb-2">
                  How do they receive love?
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                  This makes the AI&apos;s scoring personal — the more accurate, the sharper the
                  insight.
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  {LOVE_LANGUAGES.map((l) => (
                    <SelectPill
                      key={l}
                      label={l}
                      selected={selectedLanguages.includes(l)}
                      onClick={() => toggle(l, selectedLanguages, setSelectedLanguages)}
                      color="blush"
                    />
                  ))}
                </div>
                <div className="mt-auto flex flex-col gap-3">
                  <button
                    onClick={() => goTo(7)}
                    disabled={selectedLanguages.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-full glass-btn py-3.5 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-35 uppercase tracking-[0.2em] text-[10px]"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => goTo(7)}
                    className="text-muted-foreground text-sm font-medium py-3 hover:text-foreground active:text-foreground transition-colors touch-target"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* ══════════ STEP 7 — Aesthetics ══════════ */}
                {step === 7 && (
              <div className="flex-1 flex flex-col">
                <Eyebrow step={step} />
                <h1 className="font-display text-4xl italic font-bold mb-1 mt-1">Choose your world.</h1>
                <p className="text-muted-foreground text-sm mb-5">You'll live in it.</p>

                {/* Theme toggle — always visible, above the grid */}
                <div className="flex items-center gap-2 mb-5">
                  {[
                    { id: 'dark' as const, label: '🌙 Dark' },
                    { id: 'light' as const, label: '☀️ Light' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        theme === t.id
                          ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_14px_-2px_rgb(var(--primary)/0.2)]'
                          : 'border-black/10 dark:border-border bg-black/4 dark:bg-white/4 hover:bg-black/8 dark:hover:bg-white/8 active:bg-black/12 dark:active:bg-white/12 text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Large atmosphere preview tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {(
                    [
                      {
                        id: 'soft-blush' as const,
                        name: 'Soft Blush',
                        bg: 'bg-gradient-to-br from-rose-200 to-rose-100 dark:from-rose-900/60 dark:to-rose-800/30',
                        accent: 'text-rose-600 dark:text-rose-300',
                      },
                      {
                        id: 'mesh-rose' as const,
                        name: 'Mesh Rose',
                        bg: 'bg-gradient-to-br from-pink-400 via-rose-300 to-amber-200 dark:from-pink-800/60 dark:via-rose-700/40 dark:to-amber-800/30',
                        accent: 'text-pink-700 dark:text-pink-300',
                      },
                      {
                        id: 'vignette-rose' as const,
                        name: 'Vignette',
                        bg: 'bg-[radial-gradient(circle_at_center,rgba(209,47,88,0.5)_0%,rgba(10,5,8,0.9)_100%)]',
                        accent: 'text-rose-400',
                      },
                      {
                        id: 'prismatic-rose' as const,
                        name: 'Prismatic',
                        bg: 'bg-[conic-gradient(from_180deg_at_50%_50%,rgba(244,63,94,0.7),rgba(251,191,36,0.7),rgba(244,63,94,0.7))]',
                        accent: 'text-white',
                      },
                      {
                        id: 'aura' as const,
                        name: 'Aura',
                        bg: 'bg-[radial-gradient(circle_at_top_left,rgba(232,69,107,0.9)_0%,transparent_60%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.8)_0%,transparent_60%)] bg-[#120E15]',
                        accent: 'text-rose-300',
                      },
                      {
                        id: 'minimal' as const,
                        name: 'Minimal',
                        bg: 'bg-card border border-black/10 dark:border-border',
                        accent: 'text-foreground',
                      },
                    ] as const
                  ).map((atm) => {
                    const isActive = atmosphere === atm.id;
                    return (
                      <button
                        key={atm.id}
                        onClick={(e) => handleAtmosphereClick(atm.id, e)}
                        className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                          isActive
                            ? 'border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.03]'
                            : 'border-transparent hover:border-white/30 hover:scale-[1.01] active:border-white/40 active:scale-[0.99]'
                        } ${atm.bg}`}
                        aria-pressed={isActive}
                        title={atm.name}
                      >
                        {/* Name label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2.5 bg-gradient-to-t from-black/20 to-transparent">
                          <span className={`text-[10px] font-bold uppercase tracking-widest drop-shadow-lg ${atm.accent}`}>
                            {atm.name}
                          </span>
                        </div>
                        {/* Selected checkmark */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="absolute top-2 right-2 h-5 w-5 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                          >
                            <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Particles toggle */}
                <label className="flex items-center gap-3 cursor-pointer mb-6 group w-fit">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={particlesEnabled}
                      onChange={(e) => setParticlesEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`h-5 w-9 rounded-full transition-colors duration-300 ${particlesEnabled ? 'bg-gold' : 'bg-black/15 dark:bg-white/15'}`} />
                    <motion.div
                      animate={{ x: particlesEnabled ? 16 : 2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                    />
                  </div>
                  <span className="text-sm text-foreground font-medium group-hover:text-foreground/80 group-focus-within:text-foreground/80 transition-colors">
                    ✨ Enable magic particles
                  </span>
                </label>

                <button
                  onClick={() => goTo(8)}
                  className="w-full flex items-center justify-center gap-2 rounded-full glass-btn py-3.5 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] mt-auto uppercase tracking-[0.2em] text-[10px]"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ══════════ STEP 8 — Finale ══════════ */}
                {step === 8 && (
              <div className="flex-1 flex flex-col justify-center text-center relative">
                {/* Heartbeat aura — 60 BPM */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                  <motion.div
                    animate={{ scale: [1, 1.14, 1], opacity: [0.2, 0.45, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                    className="w-[72vw] h-[72vw] md:w-[480px] md:h-[480px] rounded-full bg-primary/20 blur-[110px]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.18, 0.08] }}
                    transition={{ duration: 1, repeat: Infinity, ease: [0.4, 0, 0.6, 1], delay: 0.4 }}
                    className="absolute w-[48vw] h-[48vw] md:w-[300px] md:h-[300px] rounded-full bg-gold/15 blur-[80px]"
                  />
                </div>

                <div className="relative z-10">
                  {/* Word-by-word tagline */}
                  <div className="mb-12 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
                    {'The canvas is blank. The story is yours.'.split(' ').map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ delay: 0.15 + i * 0.11, duration: 0.65, ease: 'easeOut' }}
                        className="font-display italic text-2xl md:text-[2rem] text-muted-foreground/75"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-6xl md:text-7xl italic font-bold tracking-tight mb-12 text-foreground"
                  >
                    You&apos;re all set.
                  </motion.h1>

                  {/* Gold sweep CTA */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.3, duration: 0.6 }}
                  >
                    <button
                      onClick={completeOnboarding}
                      className="mx-auto w-full max-w-sm relative overflow-hidden flex items-center justify-center gap-3 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-md py-5 text-sm font-bold text-gold shadow-[0_0_28px_-4px_rgba(199,169,107,0.2)] transition-all hover:scale-[1.02] hover:bg-gold/18 hover:shadow-[0_0_40px_-4px_rgba(199,169,107,0.35)] active:scale-[0.98] active:bg-gold/25"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent animate-shimmer pointer-events-none" />
                      <span className="relative z-10 flex items-center gap-3">
                        Enter Your Archive <ArrowRight className="h-4 w-4" />
                      </span>
                    </button>
                  </motion.div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Eyebrow({ step }: { step: number }) {
  return (
    <p className="text-xs uppercase tracking-[0.25em] font-bold text-muted-foreground/60 mb-3">
      Step {step - 1} of {TOTAL_STEPS - 1}
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
      {children}
    </p>
  );
}

function ToggleChip({
  label,
  active,
  onClick,
  gold,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  gold?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
        active
          ? gold
            ? 'border-gold/50 bg-gold/10 text-gold shadow-[0_0_14px_-2px_rgba(199,169,107,0.25)]'
            : 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_14px_-2px_rgb(var(--primary)/0.2)]'
          : 'border-black/10 dark:border-border bg-black/4 dark:bg-white/4 hover:bg-black/8 dark:hover:bg-white/8 active:bg-black/12 dark:active:bg-white/12 text-foreground'
      }`}
    >
      {label}
    </button>
  );
}
