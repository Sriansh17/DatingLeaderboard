'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Mail, Lock, User, ArrowRight, Calendar, Phone, ChevronDown } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN +91' }, { code: '+1', label: 'US +1' }, { code: '+44', label: 'UK +44' },
  { code: '+61', label: 'AU +61' }, { code: '+81', label: 'JP +81' }, { code: '+86', label: 'CN +86' },
  { code: '+49', label: 'DE +49' }, { code: '+33', label: 'FR +33' }, { code: '+55', label: 'BR +55' },
  { code: '+971', label: 'AE +971' }, { code: '+65', label: 'SG +65' }, { code: '+82', label: 'KR +82' },
  { code: '+39', label: 'IT +39' }, { code: '+34', label: 'ES +34' }, { code: '+7', label: 'RU +7' },
];

const CTRY = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan',
  'Singapore', 'UAE', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'South Korea', 'New Zealand',
  'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Ireland',
];

const STATES_MAP: Record<string, string[]> = {
  India: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'],
  'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'],
  'Australia': ['New South Wales', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'],
};

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur',
  'Chandigarh', 'Lucknow', 'New York', 'Los Angeles', 'Chicago', 'San Francisco', 'London', 'Paris',
  'Berlin', 'Tokyo', 'Dubai', 'Singapore', 'Sydney', 'Toronto', 'Melbourne',
];

function toIso(val: string): string | null {
  const s = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (s) {
    const d = new Date(+s[3], +s[2] - 1, +s[1], 12, 0, 0);
    if (d.getDate() === +s[1] && d.getMonth() === +s[2] - 1 && d <= new Date()) return d.toISOString().split('T')[0];
  }
  const i = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (i) {
    const d = new Date(+i[1], +i[2] - 1, +i[3], 12, 0, 0);
    if (d.getDate() === +i[3] && d.getMonth() === +i[2] - 1 && d <= new Date()) return val;
  }
  return null;
}

function fmt(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function calcAge(iso: string): string {
  if (!iso) return '';
  const b = new Date(iso), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a > 0 && a < 150 ? String(a) : '';
}

export function SignupForm() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  // Debounced username availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const client = createClient();
      const { data } = await client
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      setUsernameAvailable(!data);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
  const [showCountryList, setShowCountryList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);
  const [showCodePicker, setShowCodePicker] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { addToast } = useToast();

  const filteredCtry = CTRY.filter(c => c.toLowerCase().includes(country.toLowerCase()));
  const filteredStates = (STATES_MAP[country] || CTRY).filter(s => s.toLowerCase().includes(stateName.toLowerCase()));
  const filteredCities = CITIES.filter(c => c.toLowerCase().includes(city.toLowerCase()));
  const age = useMemo(() => calcAge(dobIso), [dobIso]);

  const handleDobText = (val: string) => {
    setDobError('');
    const digits = val.replace(/\D/g, '').slice(0, 8);
    let display = digits;
    if (digits.length >= 3) display = digits.slice(0, 2) + '/' + digits.slice(2);
    if (digits.length >= 5) display = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    setDobText(display);
    if (digits.length === 8) {
      const f = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
      const iso = toIso(f);
      if (iso) setDobIso(iso);
      else { setDobIso(''); setDobError('Invalid date'); }
    } else setDobIso('');
  };

  const handleDobBlur = () => {
    if (dobText && !dobIso) setDobError('Enter a valid date');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all required fields to show validation errors
    setTouched({ name: true, username: true, email: true, password: true, confirmPassword: true });
    if (!name.trim() || !username || username.length < 3 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }
    if (checkingUsername) {
      addToast('Checking username availability...', 'warning');
      return;
    }
    if (usernameAvailable === false) {
      addToast('Username is taken. Try a different one.', 'error');
      return;
    }
    if (usernameAvailable === null) {
      addToast('Please enter a valid username (3+ characters).', 'error');
      return;
    }
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
    <form onSubmit={handleSubmit} className="space-y-3.5">

      {/* Name */}
      <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
        <input type="text" placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} onBlur={() => setTouched(t => ({ ...t, name: true }))} required autoComplete="name"
          className={`w-full rounded-2xl border bg-muted/30 px-12 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-muted/50 transition-all text-base ${touched.name && !name.trim() ? 'border-rose-500/50' : 'border-border focus:border-primary/50'}`} />
      </div>
      {touched.name && !name.trim() && (
        <p className="text-[10px] text-rose-500 font-medium -mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
          Full name is required
        </p>
      )}

      {/* Username */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10 text-sm font-mono font-semibold">@</span>
        <input type="text" placeholder="Username *" value={username}
          onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())} onBlur={() => setTouched(t => ({ ...t, username: true }))} required autoComplete="username"
          className={`w-full rounded-2xl border bg-muted/30 pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-muted/50 transition-all text-base ${
            username && username.length >= 3
              ? usernameAvailable === true
                ? 'border-emerald-500/50 focus:border-emerald-500/50'
                : usernameAvailable === false
                ? 'border-rose-500/50 focus:border-rose-500/50'
                : 'border-border focus:border-primary/50'
              : touched.username && (!username || username.length < 3)
                ? 'border-rose-500/50 focus:border-rose-500/50'
                : 'border-border focus:border-primary/50'
          }`} />
        {/* Availability indicator */}
        {username && username.length >= 3 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checkingUsername ? (
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
            ) : usernameAvailable === true ? (
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : usernameAvailable === false ? (
              <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : null}
          </div>
        )}
      </div>
      {username && username.length >= 3 && usernameAvailable === false && (
        <p className="text-[10px] text-rose-500 font-medium -mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
          This username is taken. Try a different one.
        </p>
      )}
      {username && username.length >= 3 && usernameAvailable === true && (
        <p className="text-[10px] text-emerald-500 font-medium -mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Username available
        </p>
      )}
      {!username && (
        <p className="text-[10px] text-muted-foreground/50 -mt-1">
          Tip: Use your Instagram handle for a unique username
        </p>
      )}
      {touched.username && username && username.length < 3 && (
        <p className="text-[10px] text-rose-500 font-medium -mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
          Username must be at least 3 characters
        </p>
      )}

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
        <input type="email" placeholder="Email Address *" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => setTouched(t => ({ ...t, email: true }))} required autoComplete="email"
          className={`w-full rounded-2xl border bg-muted/30 px-12 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-muted/50 transition-all text-base ${touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-rose-500/50' : touched.email && !email ? 'border-rose-500/50' : 'border-border focus:border-primary/50'}`} />
      </div>
      {touched.email && !email && (
        <p className="text-[10px] text-rose-500 font-medium -mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
          Email is required
        </p>
      )}
      {touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
        <p className="text-[10px] text-rose-500 font-medium -mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
          Enter a valid email address
        </p>
      )}

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
        <input type="password" placeholder="Password *" value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          className={`w-full rounded-2xl border bg-muted/30 px-12 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-muted/50 transition-all text-base ${password && !PASSWORD_REGEX.test(password) ? 'border-rose-500/50 focus:border-rose-500/50' : 'border-border focus:border-primary/50'}`} />
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
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
        <input type="password" placeholder="Confirm Password *" value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className={`w-full rounded-2xl border bg-muted/30 px-12 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-muted/50 transition-all text-base ${confirmPassword && password !== confirmPassword ? 'border-rose-500/50 focus:border-rose-500/50' : confirmPassword && password === confirmPassword ? 'border-emerald-500/50' : 'border-border focus:border-primary/50'}`} />
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
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <input type="tel" placeholder="Phone number" value={phoneNum} onChange={e => setPhoneNum(e.target.value.replace(/\D/g, '').slice(0, 15))} autoComplete="tel"
            className="w-full rounded-2xl border border-border bg-muted/30 pl-11 pr-4 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-base" />
        </div>
      </div>

      {/* Date of Birth */}
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
        <input type="text" inputMode="numeric" placeholder="DD/MM/YYYY" value={dobText}
          onChange={e => handleDobText(e.target.value)} onBlur={handleDobBlur}
          className="w-full rounded-2xl border border-border bg-muted/30 px-12 py-4 text-base text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all" />
      </div>
      {dobIso && <p className="text-[11px] text-muted-foreground/70 -mt-1">Born {fmt(dobIso)} &middot; <span className="text-foreground/80 font-medium">{age} years</span></p>}
      {dobError && <p className="text-[10px] text-destructive/80 font-medium -mt-1">{dobError}</p>}

      {/* Country, State, City */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative col-span-1">
          <input type="text" placeholder="Country" value={country}
            onChange={e => { setCountry(e.target.value); setStateName(''); setShowCountryList(true); }}
            onFocus={() => setShowCountryList(true)} onBlur={() => setTimeout(() => setShowCountryList(false), 200)}
            autoComplete="country-name"
            className="w-full rounded-2xl border border-border bg-muted/30 px-4 py-4 pr-8 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-base" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
          {showCountryList && country && filteredCtry.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden max-h-36 overflow-y-auto">
              {filteredCtry.map(c => (
                <button key={c} type="button" onMouseDown={() => { setCountry(c); setShowCountryList(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted active:bg-muted/80 transition-colors">{c}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative col-span-1">
          <input type="text" placeholder={country ? 'State' : 'Select country first'} value={stateName}
            onChange={e => { setStateName(e.target.value); setShowStateList(true); }}
            onFocus={() => setShowStateList(true)} onBlur={() => setTimeout(() => setShowStateList(false), 200)}
            disabled={!country}
            autoComplete="address-level1"
            className="w-full rounded-2xl border border-border bg-muted/30 px-4 pr-8 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-base disabled:opacity-40 disabled:cursor-not-allowed" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
          {showStateList && country && stateName && filteredStates.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden max-h-36 overflow-y-auto">
              {filteredStates.map(s => (
                <button key={s} type="button" onMouseDown={() => { setStateName(s); setShowStateList(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted active:bg-muted/80 transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative col-span-1">
          <input type="text" placeholder={stateName ? 'City' : 'Select state first'} value={city}
            onChange={e => { setCity(e.target.value); setShowCityList(true); }}
            onFocus={() => setShowCityList(true)} onBlur={() => setTimeout(() => setShowCityList(false), 200)}
            disabled={!stateName}
            autoComplete="address-level2"
            className="w-full rounded-2xl border border-border bg-muted/30 px-4 pr-8 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-base disabled:opacity-40 disabled:cursor-not-allowed" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
          {showCityList && stateName && city && filteredCities.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden max-h-36 overflow-y-auto">
              {filteredCities.map(c => (
                <button key={c} type="button" onMouseDown={() => { setCity(c); setShowCityList(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted active:bg-muted/80 transition-colors">{c}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button type="submit" disabled={loading || !name || !username || !email || !PASSWORD_REGEX.test(password) || password !== confirmPassword}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full glass-btn py-3.5 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]">
        <span>{loading ? 'Creating account...' : 'Create Account'}</span>
        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </button>
    </form>
  );
}
