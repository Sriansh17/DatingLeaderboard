'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Search, User, AlertCircle, RefreshCw } from 'lucide-react';

interface UserResult {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
}

interface UserSearchProps {
  onSelect?: (user: UserResult) => void;
  /** Optional filter to exclude certain user IDs */
  excludeIds?: string[];
}

export function UserSearch({ onSelect, excludeIds }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setSearched(false);
      setError('');
      return;
    }

    const search = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        if (data.success) {
          let filtered = data.data || [];
          if (excludeIds?.length) {
            filtered = filtered.filter((u: UserResult) => !excludeIds.includes(u.id));
          }
          setResults(filtered);
        } else {
          setError(data.error || 'Search failed');
        }
      } catch {
        setError('Failed to search. Try again.');
      } finally {
        setLoading(false);
        setSearched(true);
      }
    };

    search();
  }, [debouncedQuery, excludeIds]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find someone by name or username…"
          className="w-full rounded-xl border border-border bg-muted/30 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
          autoFocus
        />
      </div>

      {/* Results area */}
      <div className="min-h-[100px]">
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => setQuery(prev => prev + ' ')}
              className="text-xs text-primary hover:underline active:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <User className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No one found matching &ldquo;{debouncedQuery}&rdquo;</p>
            <p className="text-xs text-muted-foreground/60">Try a different name or username</p>
          </div>
        )}

        {!loading && !error && !searched && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground/60">Type at least 2 characters to find someone</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-1">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelect?.(user)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 active:bg-muted/50 transition-colors text-left"
              >
                <Avatar src={user.avatar_url} alt={user.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user.username}{user.city ? ` · ${user.city}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
