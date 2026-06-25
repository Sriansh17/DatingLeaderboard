# AI Development Guide

This file is the operating manual for future AI coding sessions working on Fond.

## Before Writing Code

### MUST Read These Files First

1. **`docs/ai-context/01-product-overview.md`** — Understand what Fond is and why it exists
2. **`docs/ai-context/04-design-system.md`** — Understand the visual language
3. **`docs/ai-context/05-component-catalog.md`** — Understand existing components
4. **`docs/ai-context/06-architecture.md`** — Understand how the app is built
5. **`docs/ai-context/07-api-business-rules.md`** — Understand business logic
6. **`docs/ai-context/09-design-principles.md`** — Understand how to design UI
7. **`docs/ai-context/10-codebase-rules.md`** — Understand engineering conventions
8. **`docs/ai-context/11-known-issues.md`** — Know what's broken

### Before Modifying a File

1. Read the current file in full
2. Check if a component already exists for the task
3. Check for duplicate components that should be consolidated instead
4. Check `PRODUCT_AUDIT.md` for known issues in the area

### Before Creating a New Component

1. Search the component catalog for existing components that could be reused
2. Check if a similar component already exists (e.g., `EditProfileModal` handles all profile editing — `ProfileForm` was merged into it)
3. Verify that no UI primitive already covers the need (`Button`, `Card`, `Modal`, `Tabs`, etc.)

---

## Design Rules

### Visual Rules

1. **ALL buttons use `rounded-full`** — never use squared or different corner radii for buttons
2. **ALL cards use `.glass`** (or glass-1/glass-2 for specific purposes) — defined in `globals.css`
3. **Primary CTAs** use `glass-btn` class (semi-transparent bg with backdrop-blur, colored border, glow shadow). Gold variant: `glass-btn-gold`. Defined in `globals.css`.
4. **Small labels** use the pattern: `text-[9px] or text-[10px] uppercase tracking-[0.2em] font-bold`
5. **Headings** use `font-display italic` — always italic for display text
6. **Score numbers** use `font-score` class — always
7. **Signature easing curve:** `[0.16, 1, 0.3, 1]` — use for ALL custom framer-motion animations
8. **Dark mode is class-based** (`.dark` on `<html>`) — always test both themes with `dark:` prefix

### Color Rules

1. **Do NOT hardcode hex colors** — always use CSS variable tokens (`text-primary`, `bg-gold`, `text-muted-foreground`)
2. **Score colors** use the predefined tokens: `text-score-low`, `text-score-mid`, `text-score-high`, `text-score-legendary`
3. **Gradients** should use CSS custom properties, not hardcoded hex values
4. **Use `gold` for premium/achievement** elements
5. **Use `blush` for romantic accents**

### Animation Rules

1. **Use framer-motion** for enter/exit animations, layout animations, and spring physics
2. **Use CSS animations** for looping effects (shimmer, pulse, marquee via Tailwind classes)
3. **Duration:** 0.5-0.8s for page transitions, 0.2-0.4s for micro-interactions
4. **Animation style:** Deliberately slow and dramatic — not quick and snappy
5. **Loading states** should show progress phases, not just spinners

### Layout Rules

1. **Page sections** use `max-w-[1400px] mx-auto px-6`
2. **Cards** use glass-2 or `.glass` with p-4/p-6/p-8
3. **Grids** use CSS columns for masonry (e.g., `columns-1 md:columns-2 xl:columns-3 gap-8`)
4. **Bottom padding** of `pb-12` on pages with AppDock (accounting for dock overlap)

---

## Product Rules

### Keep These Behaviors Consistent

1. **AI always has a personality** — never make the AI a dry utility. Verdicts must be dramatic, sassy, or humorous
2. **Scores drive everything** — every surface should show or reference the scoring system
3. **Gamification is the hook** — leaderboards, ranks, streaks, and tiers must remain prominent
4. **Glass aesthetic** — maintain the glassmorphism design language; no flat/solid cards
5. **Optimistic updates** — likes, reactions, and toggles update immediately, then revert on error

### Never Change These Rules

1. **Free tier: 2 posts/day, 1 partner** — this is the monetization model
2. **Post editing requires premium** — archiving (soft delete) is free
3. **Leaderboard ranking is by average score, not total** — quality over quantity
4. **Circle max members = 10** — intimate groups
5. **Anonymous mode replaces the feed** — don't mix anonymous and identified content

### Known Bug: First-Post Detection

**DO NOT FIX this without reading the full context.** The bug is in `PostForm.tsx:138`:
```tsx
const isFirst = !result.post.created_at || true;  // BUG: always true
```
The fix is to check if the user has existing posts before showing the welcome ceremony. This is marked as the highest-priority bug.

---

## Engineering Rules

### Must-Use Patterns

1. **`cn()` for class merging** — always use `cn(className, conditionalClasses)` from `@/lib/utils/cn`
2. **`@/` path alias** — always use `@/` for imports from `src/`
3. **Named exports only** — no default exports
4. **TypeScript strict** — no `any` types, use proper typing
5. **`use client`** at the top of client components
6. **`try-catch` in API routes** — always wrap with error handling
7. **Auth check at top of protected API routes**
8. **Supabase SSR client** for server-side operations

### Must-Reuse Components

| Need | Use This | Not |
|------|----------|-----|
| Button | `Button.tsx` | `<button>` directly (exceptions for inline actions) |
| Card wrapper | `Card.tsx` or `.glass` | Custom card divs |
| Modal | `Modal.tsx` | Custom modal |
| Spinner | `Spinner.tsx` | Custom loading elements |
| Toast notification | `useToast()` from `Toast.tsx` | Custom toast implementations |
| Page transitions | `PageTransition.tsx` or `template.tsx` | Custom animation wrappers |
| Tabs | `Tabs.tsx` | Custom tab bars |
| Score display | `ScoreRing.tsx` or `ScoreBadge.tsx` | Custom score visualizations |
| Loading data | `useQuery` from `@tanstack/react-query` | fetch + useState directly |
| Dark/light mode | `useTheme()` from `ThemeProvider` | Manual class toggling |

### Never Create Duplicates Of

- **Score color logic** — use `format.ts`'s `getScoreColor()` or migrate to single `lib/scoring.ts`
- **Profile editing** — merge into one component, don't create a third
- **Navigation** — only `AppDock.tsx` and `Navbar.tsx` should exist
- **Button variants** — only `Button.tsx` should handle button styling
- **Toast system** — only `Toast.tsx` and `useToast()` should exist
- **Modal system** — `Modal.tsx` is the base; extend it, don't replace it

---

## Forbidden Actions

### 🚫 Do NOT create new button styles
Use `Button.tsx` with its existing variants (primary, secondary, outline, ghost, danger). If you need a different button, add a variant to Button.tsx.

### 🚫 Do NOT hardcode colors
Always use CSS variable tokens. Never use `#D12F58` or `#EE6A8C` directly. Exceptions: inline styles for dynamic score colors via `scoreColor()`.

### 🚫 Do NOT bypass the Supabase service layer
Use `createServerSupabaseClient()` or `createClient()` as appropriate. Only use `createAdminClient()` when you need to bypass RLS for cross-user reads.

### 🚫 Do NOT create alternate UX patterns when one exists
Check the component catalog first. If a component exists for the pattern (modal, toast, tabs, card, etc.), reuse it.

### 🚫 Do NOT add new state management libraries
React Context + TanStack React Query is sufficient. No Redux, Zustand, or Jotai.

### 🚫 Do NOT use `any` type
Extend existing types in `src/types/` instead. The `database.ts` file already has all core types.

### 🚫 Do NOT add `console.log` in production code
Use `console.error` only for actual errors. Remove debug logs.

### 🚫 Do NOT add new external fonts
Fond uses Geist/DM Sans (sans), Playfair Display (display), and Bebas Neue (score). Adding new fonts increases load time.

### 🚫 Do NOT add new navigation components
Only AppDock (bottom dock) and Navbar (top nav) should exist. Don't create a third navigation system.

---

## Common Pitfalls to Avoid

### Architecture Pitfalls
1. **API route without auth check** — always call `supabase.auth.getUser()` first
2. **SSR client in browser** — use `createClient()` for browser, `createServerSupabaseClient()` for server
3. **Admin client abuse** — only use `createAdminClient()` when necessary (it bypasses RLS)
4. **Forgetting `force-dynamic`** — API routes that should be dynamic need the `force-dynamic` export

### Component Pitfalls
1. **Forgetting 'use client'** — any component with hooks, state, or browser APIs needs `'use client'`
2. **Missing empty states** — every list/data component should handle loading, empty, error, and populated states
3. **Missing dark mode** — every new UI element needs a `dark:` variant
4. **Hardcoded text** — all user-facing strings should be in the component, not in external files (no i18n yet)

### State Pitfalls
1. **Direct Supabase calls** in components — use React Query hooks instead (in `lib/hooks/`)
2. **Multiple sources of truth** — don't duplicate server state in local state
3. **Forgetting query invalidation** — after mutations, invalidate related queries

### Design Pitfalls
1. **Non-rounded buttons** — all buttons must be `rounded-full`
2. **Missing glass effect** — cards must use `.glass` or glass-N class
3. **Wrong easing** — use `[0.16, 1, 0.3, 1]`, not `ease-in-out` or `ease-out`
4. **Wrong font** — headings use `font-display`, body uses default sans, scores use `font-score`

---

## Debugging Checklist

When something is broken:

1. **Check console for errors** — look for 401/403/500 responses
2. **Check .env.local** — missing env vars (API keys, Supabase URL)
3. **Check auth state** — is the user authenticated? Check `useAuth()`
4. **Check React Query devtools** — is the query stale? Refetching?
5. **Check Supabase RLS** — is the policy blocking the query? (admin client bypasses this)
6. **Check middleware** — is the middleware redirecting routes?
7. **Check Supabase URL format** — `supabase.co` URL without trailing slash
8. **Check cookie handling** — SSR auth requires proper cookie forwarding

---

## Quick Reference

### Common Import Paths
```tsx
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/hooks/useAuth'
import { useUser } from '@/components/providers/AuthProvider'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { APP_NAME, ROUTES } from '@/lib/utils/constants'
import { formatRelativeTime, getScoreColor } from '@/lib/utils/format'
import type { Post, Profile, Partner } from '@/types/database'
import type { ApiResponse, AIScoreResult } from '@/types/api'
```

### Common Constants
```tsx
MIN_POSTS_FOR_LEADERBOARD = 1
LEADERBOARD_PAGE_SIZE = 50
LOCAL_RADIUS_KM = 10
POSTS_PER_PAGE = 20
DAILY_POST_LIMIT_FREE = 2
FREE_PARTNER_LIMIT = 1
CIRCLE_MAX_MEMBERS = 10
```

### Signature Framer Motion
```tsx
// Enter animation
initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}

// Spring for interactive elements
transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}

// Staggered children
variants={{
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
}}
```
