'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface FondCalendarProps {
  onSelect: (date: Date) => void;
  onClose: () => void;
  current?: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function FondCalendar({ onSelect, onClose, current }: FondCalendarProps) {
  const today = new Date();
  const initial = current ? new Date(current + 'T12:00:00') : today;
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const sel = current ? new Date(current + 'T12:00:00') : null;

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  return (
    <div ref={ref} className="bg-card border border-border rounded-2xl shadow-2xl backdrop-blur-2xl p-4 w-72 z-50" style={{ background: 'rgb(var(--card) / 0.95)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prev} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-foreground" /></button>
        <span className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</span>
        <button type="button" onClick={next} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-foreground" /></button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/60 py-1">{d}</div>)}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} />;
          const isSel = sel && sel.getDate() === d && sel.getMonth() === month && sel.getFullYear() === year;
          const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
          const date = new Date(year, month, d, 12, 0, 0);
          const isPast = date <= new Date();
          return (
            <button
              key={d}
              type="button"
              disabled={!isPast}
              onClick={() => onSelect(date)}
              className={`text-center text-sm py-1.5 rounded-xl transition-colors ${isSel ? 'bg-primary text-primary-foreground font-semibold' : isToday ? 'border border-primary/30 text-foreground font-medium' : 'text-foreground/70 hover:bg-muted'} ${!isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
