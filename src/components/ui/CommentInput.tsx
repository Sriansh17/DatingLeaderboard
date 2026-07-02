'use client';

import { useState, useRef, useEffect } from 'react';
import { SmilePlus, AtSign } from 'lucide-react';

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '😍', '💀', '👏'];

interface MentionUser {
  id: string;
  username: string;
}

function renderTextWithMentions(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium leading-none">
          {part}
        </span>
      );
    }
    return <span key={i} className="text-foreground">{part}</span>;
  });
}

export function CommentInput({
  onSubmit,
  placeholder = "Leave a love note...",
  avatarUrl,
}: {
  onSubmit: (text: string) => void;
  placeholder?: string;
  avatarUrl?: string | null;
}) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputWidth = useRef(0);

  // ─── @ Mention ────────────────────────────────────────
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    const atIndex = val.lastIndexOf('@');
    if (atIndex !== -1 && (atIndex === 0 || val[atIndex - 1] === ' ')) {
      const query = val.slice(atIndex + 1);
      if (query.length >= 1 && !query.includes(' ')) {
        setMentionQuery(query);
        setMentionOpen(true);
        return;
      }
    }
    setMentionOpen(false);
  };

  useEffect(() => {
    if (!mentionOpen || mentionQuery.length < 1) { setMentionUsers([]); return; }
    fetch(`/api/users/search?q=${encodeURIComponent(mentionQuery)}`)
      .then(r => r.json())
      .then(data => { if (data.success) setMentionUsers(data.data || []); })
      .catch(() => setMentionUsers([]));
  }, [mentionQuery, mentionOpen]);

  const selectMention = (username: string) => {
    const atIndex = text.lastIndexOf('@');
    const before = text.slice(0, atIndex);
    setText(`${before}@${username} `);
    setMentionOpen(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  const insertEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Top: avatar + input with inline mention chips */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 bg-muted/20 rounded-t-2xl border border-border border-b-0 relative">
        <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-elevated border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.4"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          )}
        </div>

        {/* Input wrapper for overlay chips */}
        <div className="flex-1 relative">
          {/* Overlay — shows styled text with mention chips */}
          {text && (
            <div className="absolute inset-0 flex items-center pointer-events-none z-10 overflow-hidden whitespace-nowrap">
              <span className="truncate">{renderTextWithMentions(text)}</span>
            </div>
          )}

          {/* Actual input — invisible text, visible caret */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
              if (e.key === 'Escape') setMentionOpen(false);
            }}
            placeholder={text ? '' : placeholder}
            maxLength={500}
            className="relative z-20 w-full bg-transparent text-base text-transparent caret-foreground outline-none py-1 placeholder:text-muted-foreground/40"
            autoComplete="off"
          />
        </div>

        {/* Mention dropdown */}
        {mentionOpen && mentionUsers.length > 0 && (
          <div className="absolute left-4 right-4 bottom-full mb-1 z-50 rounded-xl border border-border bg-popover shadow-lg py-1 max-h-32 overflow-y-auto">
            {mentionUsers.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => selectMention(u.username)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-elevated border border-border flex items-center justify-center text-[7px] font-bold text-muted-foreground">
                  {u.username[0].toUpperCase()}
                </div>
                @{u.username}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom: toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-elevated/60 rounded-b-2xl border border-border">
        <div className="flex items-center gap-1">
          {/* Emoji picker */}
          <div className="relative">
            <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 rounded-lg hover:bg-elevated text-muted-foreground/50 hover:text-foreground active:bg-elevated/80 active:text-foreground transition-colors" title="Add emoji">
              <SmilePlus className="h-4 w-4" />
            </button>
            {showEmoji && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
                <div className="absolute bottom-full left-0 mb-1 z-50 flex gap-1 rounded-xl border border-border bg-popover shadow-lg px-2.5 py-2">
                  {QUICK_EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => insertEmoji(e)} className="text-lg hover:scale-125 active:scale-110 transition-transform">{e}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* @ mention */}
          <button type="button" onClick={() => { setText(prev => prev + '@'); inputRef.current?.focus(); }} className="p-1.5 rounded-lg hover:bg-elevated text-muted-foreground/50 hover:text-foreground active:bg-elevated/80 active:text-foreground transition-colors" title="Mention someone">
            <AtSign className="h-4 w-4" />
          </button>
        </div>

        {/* Send button */}
        <button type="submit" disabled={!text.trim()} className={`flex items-center justify-center w-11 h-11 touch-target rounded-xl transition-all ${text.trim() ? 'glass-btn hover:opacity-90 active:opacity-80' : 'bg-muted text-muted-foreground/30'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
        </button>
      </div>
    </form>
  );
}
