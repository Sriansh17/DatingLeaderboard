'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Mail, Lock, User, ArrowRight, Calendar, Phone, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

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

const STATES: Record<string, string[]> = {
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

// ─── Helpers ──────────────────────────────────────────────────────────

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

// ─── Custom Fond Glass Calendar ──────────────────────────────────────

function FondCalendarInline({ current, onSelect, onClose }: { current?: string; onSelect: (d: Date) => void; onClose: () => void }) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const today = new Date();
  const init = current ? new Date(current + 'T12:00:00') : today;
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref && !ref.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const sel = current ? new Date(current + 'T12:00:00') : null;
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div ref={setRef} className="bg-card border border-border rounded-2xl shadow-2xl backdrop-blur-2xl p-4 w-72" style={{ background: 'rgb(var(--card) / 0.95)' }}>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="h-[18px] w-[18px] text-foreground" /></button>
        <span className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</span>
        <button type="button" onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronRight className="h-[18px] w-[18px] text-foreground" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/60 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} />;
          const isSel = sel && sel.getDate() === d && sel.getMonth() === month && sel.getFullYear() === year;
          const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
          const date = new Date(year, month, d, 12, 0, 0);
          return (
            <button key={d} type="button"
              onClick={() => { if (date <= new Date()) onSelect(date); }}
              disabled={date > new Date()}
              className={`text-center text-sm py-1.5 rounded-xl transition-colors cursor-pointer ${isSel ? 'bg-primary text-primary-foreground font-semibold' : isToday ? 'border border-primary/30 text-foreground font-medium' : 'text-foreground/70 hover:bg-muted'} ${date > new Date() ? 'opacity-30 cursor-not-allowed' : ''}`}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

function calcAge(iso: string): string {
  if (!iso) return '';
  const b = new Date(iso), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a > 0 && a < 150 ? String(a) : '';
}

// ─── Component ────────────────────────────────────────────────────────

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const [showCalendar, setShowCalendar] = useState(false);
  const router = useRouter();

  const handleDobText = (val: string) => {
    setDobError('');
    const digits = val.replace(/\D/g, '').slice(0, 8);
    // Only digits and slashes — placeholder shows DD/MM/YYYY
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
  const { addToast } = useToast();

  const filteredCtry = CTRY.filter(c => c.toLowerCase().includes(country.toLowerCase()));
  const filteredStates = (STATES[country] || CTRY).filter(s => s.toLowerCase().includes(stateName.toLowerCase()));
  const filteredCities = CITIES.filter(c => c.toLowerCase().includes(city.toLowerCase()));
  const age = useMemo(() => calcAge(dobIso), [dobIso]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) { addToast(error.message, 'error'); setLoading(false); return; }
    if (data.user) {
      const phone = countryCode && phoneNum ? `${countryCode}${phoneNum}` : null;
      await supabase.from('profiles').insert({
        id: data.user.id, full_name: name, phone: phone || null,
        date_of_birth: dobIso || null, age: age || null,
        country: country || null, state: stateName || null, city: city || null,
      });
    }
    router.push('/onboarding');
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
        <input type="password" placeholder="Password (min 6) *" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required
          className="w-full rounded-2xl border border-border bg-muted/30 pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-sm" />
      </div>

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
          <input
            type="text"
            inputMode="numeric"
            placeholder="DD/MM/YYYY"
            value={dobText}
            onChange={e => handleDobText(e.target.value)}
            onBlur={handleDobBlur}
            className="w-full rounded-2xl border border-border bg-muted/30 pl-12 pr-16 py-4 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors z-10"
          >
            {showCalendar ? '×' : 'Pick'}
          </button>
        </div>

        {showCalendar && (
          <div className="absolute z-50 top-full mt-2 right-0">
            <FondCalendarInline
              current={dobIso}
              onSelect={(d) => {
                const iso = d.toISOString().split('T')[0];
                setDobIso(iso);
                const d2 = new Date(iso + 'T12:00:00');
                setDobText(String(d2.getDate()).padStart(2, '0') + '/' + String(d2.getMonth() + 1).padStart(2, '0') + '/' + d2.getFullYear());
                setDobError('');
                setShowCalendar(false);
              }}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        )}
      </div>
      {dobIso && <p className="text-[11px] text-muted-foreground/70 -mt-1">Born {fmt(dobIso)} · <span className="text-foreground/80 font-medium">{age} years</span></p>}
      {dobError && <p className="text-[10px] text-destructive/80 font-medium -mt-1">{dobError}</p>}

      {/* Country, State, City — cascade: need country before state, state before city */}
      <div className="grid grid-cols-3 gap-2">
        <div className="relative col-span-1">
          <input type="text" placeholder="Country" value={country}
            onChange={e => { setCountry(e.target.value); setStateName(''); setShowCountryList(true); }}
            onFocus={() => setShowCountryList(true)} onBlur={() => setTimeout(() => setShowCountryList(false), 200)}
            className="w-full rounded-2xl border border-border bg-muted/30 px-4 py-4 pr-8 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-sm" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
          {showCountryList && country && filteredCtry.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden max-h-36 overflow-y-auto">
              {filteredCtry.map(c => (
                <button key={c} type="button" onMouseDown={() => { setCountry(c); setShowCountryList(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">{c}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative col-span-1">
          <input type="text" placeholder={country ? 'State' : 'Select country first'} value={stateName}
            onChange={e => { setStateName(e.target.value); setShowStateList(true); }}
            onFocus={() => setShowStateList(true)} onBlur={() => setTimeout(() => setShowStateList(false), 200)}
            disabled={!country}
            className="w-full rounded-2xl border border-border bg-muted/30 px-4 py-4 pr-8 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
          {showStateList && country && stateName && filteredStates.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden max-h-36 overflow-y-auto">
              {filteredStates.map(s => (
                <button key={s} type="button" onMouseDown={() => { setStateName(s); setShowStateList(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative col-span-1">
          <input type="text" placeholder={stateName ? 'City' : 'Select state first'} value={city}
            onChange={e => { setCity(e.target.value); setShowCityList(true); }}
            onFocus={() => setShowCityList(true)} onBlur={() => setTimeout(() => setShowCityList(false), 200)}
            disabled={!stateName}
            className="w-full rounded-2xl border border-border bg-muted/30 px-4 py-4 pr-8 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
          {showCityList && stateName && city && filteredCities.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden max-h-36 overflow-y-auto">
              {filteredCities.map(c => (
                <button key={c} type="button" onMouseDown={() => { setCity(c); setShowCityList(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">{c}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button type="submit" disabled={loading || !name || !email || password.length < 6}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]">
        <span>{loading ? 'Creating account...' : 'Create Account'}</span>
        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </button>
    </form>
  );
}
