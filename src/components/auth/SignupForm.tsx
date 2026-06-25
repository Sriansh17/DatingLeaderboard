'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]).{8,}$/;

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]/.test(pw)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNum, setPhoneNum] = useState('');
  const [dobText, setDobText] = useState('');
  const [dobIso, setDobIso] = useState('');
  const [dobError, setDobError] = useState('');
  const [country, setCountry] = useState('');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      addToast('Password must be at least 8 characters with uppercase, lowercase, number, and special character.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) { addToast(error.message, 'error'); setLoading(false); return; }
      if (data.user) {
        const phone = countryCode && phoneNum ? `${countryCode}${phoneNum}` : null;
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id, full_name: name, phone: phone || null,
          date_of_birth: dobIso || null, age: age || null,
          country: country || null, state: stateName || null, city: city || null,
        });
        if (profileError) console.error('Profile insert error:', profileError);
      }
      router.push('/onboarding');
    } catch (err: any) {
      addToast(err?.message || 'Something went wrong', 'error');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">

      {/* Name */}
      <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <input type="text" placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} required
          className="w-full rounded-2xl border border-border bg-muted/30 pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-sm" />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <input type="email" placeholder="Email Address *" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full rounded-2xl border border-border bg-muted/30 pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-sm" />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <input type="password" placeholder="Password *" value={password}
          onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
          className={`w-full rounded-2xl border bg-muted/30 pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-muted/50 transition-all text-sm ${password && !PASSWORD_REGEX.test(password) ? 'border-rose-500/50 focus:border-rose-500/50' : 'border-border focus:border-primary/50'}`} />
      </div>
      {password && (
        <div className="space-y-1.5 -mt-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? i <= 2 ? 'bg-rose-400' : i <= 3 ? 'bg-amber-400' : i <= 4 ? 'bg-lime-400' : 'bg-emerald-400' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {[
              { label: '8+ characters', test: password.length >= 8 },
              { label: 'Uppercase letter', test: /[A-Z]/.test(password) },
              { label: 'Lowercase letter', test: /[a-z]/.test(password) },
              { label: 'Number', test: /\d/.test(password) },
              { label: 'Special character', test: /[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]/.test(password) },
            ].map((req) => (
              <p key={req.label} className={`text-[10px] font-medium flex items-center gap-1 ${req.test ? 'text-emerald-500' : 'text-muted-foreground/50'}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${req.test ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                {req.label}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <input type="password" placeholder="Confirm Password *" value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className={`w-full rounded-2xl border bg-muted/30 pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-muted/50 transition-all text-sm ${confirmPassword && password !== confirmPassword ? 'border-rose-500/50 focus:border-rose-500/50' : confirmPassword && password === confirmPassword ? 'border-emerald-500/50' : 'border-border focus:border-primary/50'}`} />
      </div>
      {confirmPassword && password !== confirmPassword && (
        <p className="text-[10px] text-rose-500 font-medium -mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
          Passwords do not match
        </p>
      )}

      {/* Phone */}
      <div className="flex gap-2">
        <div className="relative shrink-0">
          <button type="button" onClick={() => setShowCodePicker(!showCodePicker)}
            onBlur={() => setTimeout(() => setShowCodePicker(false), 200)}
            className="flex items-center gap-1 rounded-2xl border border-border bg-muted/30 px-3.5 py-4 text-sm text-foreground outline-none focus:border-primary/50 transition-all h-full">
            <span>{countryCode}</span><ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {showCodePicker && (
            <div className="absolute z-30 top-full mt-1 left-0 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden max-h-48 overflow-y-auto min-w-[110px]">
              {COUNTRY_CODES.map(cc => (
                <button key={cc.code} type="button" onMouseDown={() => { setCountryCode(cc.code); setShowCodePicker(false); }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${countryCode === cc.code ? 'text-primary font-medium' : 'text-foreground hover:bg-muted'}`}>{cc.label}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative flex-1">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <input type="tel" placeholder="Phone number" value={phoneNum} onChange={e => setPhoneNum(e.target.value.replace(/\D/g, '').slice(0, 15))}
            className="w-full rounded-2xl border border-border bg-muted/30 pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-sm" />
        </div>
      </div>

      {/* Date of Birth — simple input with DD/MM/YYYY placeholder */}
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-2xl border border-black/10 dark:border-border bg-black/5 dark:bg-white/5 px-12 py-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-blush focus:bg-black/10 dark:focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-black/10 dark:border-border bg-black/5 dark:bg-white/5 px-12 py-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-blush focus:bg-black/10 dark:focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
          <input
            id="password"
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="w-full rounded-2xl border border-black/10 dark:border-border bg-black/5 dark:bg-white/5 px-12 py-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-blush focus:bg-black/10 dark:focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
      </div>

      <button type="submit" disabled={loading || !name || !email || !PASSWORD_REGEX.test(password) || password !== confirmPassword}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]">
        <span>{loading ? 'Creating account...' : 'Create Account'}</span>
        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </button>
    </form>
  );
}
