# Fond — Engineering & Frontend Standards

> React/TypeScript architecture, component patterns, state management, performance, code quality, and the PR checklist.

---

## 1. Technology Stack

### Mandated

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2 (App Router) | Framework |
| TypeScript | 5.x | Language |
| React | 18.x | UI library |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 12.x | Animations |
| TanStack React Query | 5.x | Server state |
| Lucide React | 1.x | Icons |
| Supabase | Latest | Database / Auth |
| clsx + tailwind-merge | Latest | Class merging (via `cn()`) |
| Zod | 4.x | Validation |

### Prohibited

| Technology | Reason |
|---|---|
| shadcn/ui | Would duplicate existing design system |
| Radix UI | Unnecessary abstraction for current primitives |
| GSAP | Overlaps with Framer Motion, adds 30KB |
| styled-components | Next.js App Router + CSS-in-JS has hydration issues |
| Redux / Zustand | React Query + Context covers all current state needs |
| Heroicons / Phosphor | Lucide is already installed and sufficient |
| Mantine / Chakra | Heavy (100KB+) and conflicts with glass design |
| Emotion | Same as styled-components — hydration issues |
| `any` | All types must be explicit |

### Permitted with Caution

| Library | Condition |
|---|---|
| Auto Animate | Only for list reordering (leaderboard rank changes) |
| react-intersection-observer | Only to replace inline scroll-observer script in layout.tsx |
| BlurHash / Plaiceholder | For image loading placeholders |

---

## 2. Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (Next.js Route Handlers)
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard + sub-pages
│   ├── leaderboards/       # Leaderboard pages
│   ├── profile/            # Profile pages
│   ├── circles/            # Bonds / circles pages
│   ├── posts/              # Post pages
│   ├── partners/           # Partner management
│   ├── settings/           # Settings
│   ├── onboarding/         # Onboarding flow
│   ├── premium/            # Premium / subscription
│   ├── confessions/        # Anonymous confessions feature
│   ├── notifications/      # Notifications
│   ├── contact/            # Contact / creators page
│   ├── admin/              # Admin-only pages
│   ├── users/              # Public user profiles
│   ├── globals.css         # Design tokens, glass system, utilities
│   ├── layout.tsx          # Root layout with providers
│   ├── template.tsx        # Page transition wrapper
│   └── not-found.tsx       # 404 page
│
├── components/
│   ├── ui/                 # Primitive components (Button, Card, Modal, etc.)
│   ├── layout/             # Layout components (ClientLayoutWrapper, Footer)
│   ├── auth/               # Auth components (LoginForm, SignupForm)
│   ├── posts/              # Post components (PostForm, PostCard, StoryCard)
│   ├── profile/            # Profile components
│   ├── partners/           # Partner components
│   ├── circles/            # Bond / clique components
│   ├── leaderboards/       # Leaderboard components
│   ├── notifications/      # Notification components
│   ├── confessions/        # Confession components
│   ├── providers/          # React Context providers
│   └── share/              # Share card / social features
│
├── lib/
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── supabase/           # Supabase client setup
│   ├── ai/                 # AI scoring logic
│   ├── payments/           # Payment processing (Razorpay)
│   └── redis/              # Caching layer (Upstash)
│
├── types/
│   ├── database.ts         # Database types (Profile, Post, Partner, etc.)
│   ├── api.ts              # API request/response types
│   └── ui.ts               # UI type definitions (Theme, Toast, etc.)
│
└── middleware.ts           # Auth middleware
```

### File Naming

| Pattern | Example | When |
|---|---|---|
| PascalCase | `Button.tsx`, `StoryCard.tsx` | React components |
| camelCase | `usePosts.ts`, `cn.ts` | Utilities, hooks |
| kebab-case | `route.ts`, `page.tsx` | Next.js conventions |
| CONSTANT_CASE | `SUBSCRIPTION_PLANS`, `BADGES` | Constants, config |

---

## 3. Component Architecture

### Component Categories

#### Primitive Components (`components/ui/`)

Building blocks of the design system. Generic, reusable, no business logic.

```
Button, Card, Modal, Input, Select, Textarea,
Badge, Tabs, Avatar, Spinner, Skeleton,
Toast, ConfirmModal, ScoreRing, AnimatedNumber
```

**Rules:**
- Accept `className` prop for overrides (merged via `cn()`)
- Accept standard HTML props when applicable (Button receives `ButtonHTMLAttributes`)
- No direct knowledge of API, business entities, or routes
- Fully typed with explicit interfaces
- Support dark mode via Tailwind `dark:` prefix or CSS variables

#### Feature Components (`components/{feature}/`)

Composed from primitives. Contain business logic and data fetching.

```
PostForm, StoryCard, LeaderboardTable, ConfessionCard,
NotificationBell, PartnerForm, ProfileHeader
```

**Rules:**
- Use React Query for all server data
- Accept data via props when possible (keeps them testable)
- Handle loading, empty, and error states
- Export named functions, not defaults

#### Page Components (`app/**/page.tsx`)

Route entry points. Orchestrate data fetching and layout.

**Rules:**
- Minimal — compose feature components
- Handle page-level loading via React Query
- No inline business logic if it can live in a hook or feature component
- Access route params via `useParams()` (App Router style)

### Component Guidelines

#### Use `cn()` for Class Merging

```tsx
// Always import and use cn()
import { cn } from '@/lib/utils/cn';

// Correct
className={cn('base-class', variantClass, className)}

// Wrong — Tailwind classes may conflict
className={`base-class ${variantClass} ${className}`}
```

#### Export Pattern

```tsx
// Primitive components — named exports
export function Button({ ... }: ButtonProps) { ... }

// Feature components — named exports (unless it's a page)
export function PostForm({ ... }: PostFormProps) { ... }

// Pages — default export (Next.js requirement)
export default function DashboardPage() { ... }
```

#### Children and Composition

- Prefer composition over configuration
- Pass `children` to Card, Modal, and other container components
- Use `React.forwardRef` for interactive elements (Button, Input)

#### Conditional Rendering

```tsx
// Correct — early return for loading/empty
if (loading) return <Skeleton variant="card" count={6} />;
if (!data) return <EmptyState {...noDataProps} />;

// Correct — ternary for simple conditions
return data.length > 0 ? <List /> : <EmptyState />;

// Avoid — nested ternaries in JSX
```

---

## 4. State Management

### State Architecture

```
┌──────────────────────────────────────────┐
│            React Query                    │
│  (All server state: posts, leaderboard,   │
│   profile, circles, notifications, etc.)   │
├──────────────────────────────────────────┤
│            React Context                  │
│  (Auth, Theme, Atmosphere, AnonymousMode) │
├──────────────────────────────────────────┤
│         Component State (useState)        │
│  (Modals, forms, toggles, UI state)      │
└──────────────────────────────────────────┘
```

### Rules

| Type | Storage | Notes |
|---|---|---|
| Server data | React Query | Posts, leaderboard, profile, circles, notifications, streak |
| Auth state | AuthProvider context | User, profile, loading, signOut |
| Theme | ThemeProvider + localStorage | Persists across sessions |
| Atmosphere | AtmosphereProvider | App "vibe" settings |
| Anonymous mode | AnonymousModeProvider | Toggle state |
| UI state (modals, dropdowns) | useState | Local to component |
| Form data | useState or React Hook Form | Local to form component |

### React Query Conventions

```tsx
// Query keys follow pattern: ['entity', ...filters]
queryKey: ['posts', userId]
queryKey: ['leaderboards', { type: 'global', limit: 10 }]
queryKey: ['circle-feed']
queryKey: ['streak']
queryKey: ['notifications']
queryKey: ['explore-posts']

// Mutations always invalidate related queries
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['posts'] });
  queryClient.invalidateQueries({ queryKey: ['explore-posts'] });
  queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
}

// Stale times
feed data:      staleTime: 0          — always refetch on mount
leaderboard:    staleTime: 5 * 60 * 1000  — fresh for 5 minutes
profile:        staleTime: 60 * 1000      — fresh for 1 minute
notifications:  staleTime: 0          — always refetch
```

### Context Provider Pattern

```tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface MyContextType {
  value: string;
  setValue: (v: string) => void;
}

const MyContext = createContext<MyContextType | null>(null);

export function useMyContext() {
  const ctx = useContext(MyContext);
  if (!ctx) throw new Error('useMyContext must be used within MyProvider');
  return ctx;
}

export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState('default');
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}
```

**Do not:**
- Store server data in context (use React Query)
- Create a new context for every feature (use props for isolated state)
- Add `useEffect` to context unless it's syncing with an external system (auth, localStorage, websocket)

---

## 5. API Route Inventory

### All Routes

```
POST   /api/posts                    — Create post (with AI scoring)
GET    /api/posts                    — List user's posts
GET    /api/posts/explore            — Global explore feed
GET    /api/posts/feed               — Personalized feed
GET    /api/posts/circle-feed        — Circle/bond feed
GET    /api/posts/[id]               — Single post
PATCH  /api/posts/[id]               — Update post
DELETE /api/posts/[id]               — Delete post
POST   /api/posts/[id]/like          — Toggle like (returns liked + likes_count)
POST   /api/posts/[id]/view          — Increment view count
POST   /api/posts/[id]/react         — Toggle emoji reaction (🔥😭👀💀)
POST   /api/posts/[id]/comments      — Add comment
GET    /api/posts/[id]/comments      — List comments
GET    /api/leaderboards             — Leaderboard by type (global/city/country/local)
GET    /api/leaderboards/daily       — Today's top posts
POST   /api/leaderboards/refresh     — Manual cache refresh
GET    /api/circles                  — List user's circles
POST   /api/circles                 — Create circle
GET    /api/circles/[id]            — Circle detail
GET    /api/circles/[id]/leaderboard — Circle leaderboard
POST   /api/circles/join            — Join by invite code
GET    /api/streak                  — Current streak data
POST   /api/streak                  — Claim daily perk
```

### Route Structure (Standard)

```
src/app/api/{entity}/route.ts          — GET (list), POST (create)
src/app/api/{entity}/[id]/route.ts     — GET (single), PATCH (update), DELETE
src/app/api/{entity}/[id]/{action}/route.ts  — Nested actions
```

### Standard Pattern

```tsx
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data, error } = await supabase
      .from('entity')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Entity GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
```

### Rules

1. **Always authenticate** at the top of each route handler
2. **Always wrap in try-catch** with a 500 fallback
3. **Always return** `{ success: boolean, data?: T, error?: string }`
4. **Never trust the client** — validate inputs, re-check permissions server-side
5. **Use `createServerSupabaseClient()`** for SSR, `createClient()` for browser
6. **Use `createAdminClient()`** only for cross-user reads bypassing RLS
7. **Name error codes** for client-side handling (`POST_LIMIT_REACHED`, `ALREADY_CLAIMED`)
8. **Log errors** to console with contextual prefix: `[Entity] Error description`

---

## 6. Data Flow Patterns

### Standard Read Flow

```
Page mount
  → useQuery('key', fetchFn)
    → fetch('/api/entity')
      → API route: auth check → DB query → return data
    → cache in React Query
  → component renders with data
  → skeleton shown while loading
  → error UI shown on failure
```

### Standard Mutation Flow

```
User action (click submit)
  → useMutation().mutateAsync(payload)
    → POST /api/entity
      → API route: auth check → validate → process → return result
    → onSuccess: invalidate related queries, show toast
    → onError: show error toast, revert UI if optimistic
  → Form button: disable, show spinner
```

### Optimistic Update Pattern (Likes)

```tsx
const handleLike = async (postId: string) => {
  const wasLiked = isLiked;
  
  // 1. Optimistic update
  setIsLiked(!wasLiked);
  setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
  
  try {
    // 2. Server mutation
    const result = await likeMutation.mutateAsync(postId);
    // 3. Sync with server value if available
    if (result.likes_count !== undefined) {
      setLikesCount(result.likes_count);
    }
  } catch (error) {
    // 4. Rollback on error
    setIsLiked(wasLiked);
    setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
  }
};
```

---

## 7. Performance Standards

### Bundle Size

- All new dependencies must be evaluated for bundle size impact
- Preferred: tree-shakeable ESM packages
- Avoid: packages > 50KB for a single feature

### Rendering

- Use `'use client'` only when necessary (interactivity, context, effects)
- Keep page components on the server when they only render data
- Extract interactive parts into client components; wrap static layout in server components

### Animation Performance

- Animate only `transform` and `opacity` — these are GPU-composited
- Never animate `width`, `height`, `box-shadow`, or `border-radius` — these trigger layout/paint
- Use `will-change-transform` on animated elements sparingly (not on every element)
- Use `transform: translateZ(0)` for elements that need GPU compositing

### React Query

- Set appropriate `staleTime` per query type
- Use `refetchOnMount: 'always'` for frequently-changing data (feed)
- Use `refetchInterval` for auto-polling (notifications: 30s)
- Avoid `refetchOnWindowFocus` for expensive queries
- Invalidate query groups, not individual keys, after mutations

### Image Loading

- Use `next/image` for all remote images (avoids layout shift)
- Set explicit `width` and `height` on all images
- Use `loading="lazy"` for below-the-fold images
- For avatar fallbacks, use CSS background or inline SVG — never a blank `<img>` tag

### List Rendering

- Use `key` that is unique and stable (Post ID, not array index)
- Use `columns` CSS layout for masonry-style post feeds (avoids position:absolute reflow)
- For long lists (> 50 items), use windowing or pagination

---

## 8. TypeScript Standards

### Type Coverage

- All functions must have typed parameters and return types
- All React components must have typed props interfaces
- All API responses must use typed interfaces
- No `any` — use `unknown` if the type is genuinely unknown
- Use `as` assertions only when the type system can't express the narrowing

### Type Definitions

```tsx
// Interface for component props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

// Interface for database models (in types/database.ts)
export interface Post {
  id: string;
  user_id: string;
  description: string;
  ai_score: number | null;
  // ...
}

// Union types for variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Utility types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

### Import Patterns

```tsx
// Types: use `import type`
import type { Post, Profile } from '@/types/database';
import type { ButtonVariant } from '@/types/ui';
import type { AIScoreResult } from '@/types/api';

// Components: direct import
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

// Icons: named imports from lucide-react
import { Heart, Share2, Sparkles } from 'lucide-react';

// Utilities: named imports
import { formatRelativeTime } from '@/lib/utils/format';
```

### Aliases

Use `@/` for all imports:

```
@/app/             — page routes
@/components/      — components
@/lib/             — hooks, utils, services
@/types/           — TypeScript types
```

---

## 9. Styling Standards

### Tailwind Conventions

```tsx
// Class ordering (alphabetical by category):
// 1. Layout (display, position, grid, flex)
// 2. Sizing (w-, h-, max-w-)
// 3. Spacing (p-, m-, gap-, space-)
// 4. Typography (text-, font-, leading-, tracking-)
// 5. Visual (bg-, border-, rounded-, shadow-)
// 6. Interaction (hover:, active:, focus:, disabled:)
// 7. Responsive (sm:, md:, lg:)
// 8. Dark mode (dark:)

// Example (correct):
className={cn(
  'flex items-center justify-center',
  'w-full px-6 py-3',
  'rounded-full font-semibold',
  'bg-primary/15 border border-primary/25 text-primary',
  'hover:bg-primary/25 active:bg-primary/35',
  'focus:outline-none focus:ring-2 focus:ring-primary/50',
  'disabled:opacity-50 disabled:pointer-events-none',
  className
)}
```

### CSS Variables vs Hardcoded Values

```tsx
// Correct — use design tokens
className="text-foreground bg-card border-border"

// Wrong — hardcoded values
className="text-gray-900 bg-white border-gray-200"
```

### Dark Mode

- Every new component must support dark mode
- Use the `dark:` prefix for dark mode overrides
- Use CSS variables for colors (they change automatically)
- Only use `dark:` for overrides that CSS variables can't handle (e.g., specific gradient colors)

---

## 10. Accessibility Standards

### Required for Every Component

1. **Focus indicators**: `focus:outline-none focus:ring-2 focus:ring-primary/50`
2. **Touch targets**: minimum 44×44px for interactive elements
3. **aria-label**: on icon-only buttons
4. **alt text**: on all images
5. **Keyboard navigation**: Enter/Space activates, Tab navigates

### Form Accessibility

- Every input has a visible `<label>` (or `aria-label` if icon-only)
- Error messages are associated with inputs via `aria-describedby`
- Required fields are marked (visually and via `required` attribute)

### Motion Accessibility

- Use `motion-safe:` variants for non-essential animations
- Respect `prefers-reduced-motion` media query

---

## 11. Code Quality Standards

### Linting

- ESLint with `eslint-config-next` is the baseline
- No `console.log` in production code — remove before committing
- No unused imports — the `@typescript-eslint/no-unused-vars` rule is enforced

### Dead Code

- No unused components, hooks, utilities, or API routes
- No commented-out code
- No empty directories
- No unused imports or variables

### Component Size

- Target: components under 300 lines where possible
- If a component exceeds 400 lines, extract sub-components
- Pages can be larger (they orchestrate) but keep logic in hooks

### Duplicate UI

- Before creating a new component, check `components/ui/` for an existing one
- Before creating a new variant of an existing component, extend its props
- If two components have overlapping visuals, extract the shared pattern

---

## 12. Testing Philosophy

Fond currently has no test suite. The following principles apply when adding tests:

### What to Test

- **Critical business logic**: Scoring, streaks, leaderboard computation, post limits
- **API routes**: Auth guards, input validation, correct responses
- **Optimistic updates**: Like toggle, state rollback on error

### What NOT to Test

- **Visual appearance**: Design is verified by visual review
- **Animation**: Motion is verified by watching it
- **Third-party integrations**: Mock the edge, test our code

---

## 13. Performance Budget

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.05 |
| Time to Interactive | < 3.5s |
| Total Bundle Size (JS) | < 300KB gzip |
| API Response (leaderboard) | < 500ms (cached) |

---

## 14. PR Checklist

Every pull request must satisfy this checklist before merging:

### Product Fit

- [ ] Does the change match Fond's design personality? (premium, playful, confident)
- [ ] Does it feel consistent with the rest of the app?
- [ ] Does it improve or maintain the user experience?

### Design System

- [ ] Does it use the existing glass system?
- [ ] Are colors from design tokens, not hardcoded?
- [ ] Are buttons `rounded-full`?
- [ ] Are cards `rounded-2xl`?
- [ ] Is the easing `[0.16, 1, 0.3, 1]`?
- [ ] Is dark mode supported?

### Engineering

- [ ] Are there new dependencies? If so, are they justified?
- [ ] Are all types explicit (no `any`)?
- [ ] Are API routes authenticated?
- [ ] Are API responses shaped `{ success, data/error }`?
- [ ] Are there console.log statements in production code?
- [ ] Is the change responsive (tested at 320px, 768px, 1440px)?
- [ ] Is it accessible (keyboard, focus, touch targets)?

### Performance

- [ ] Does the change avoid animating `width`, `height`, or `box-shadow`?
- [ ] Are images using `next/image` with `loading="lazy"`?
- [ ] Is server state using React Query (not raw fetch + useState)?
- [ ] Are query `staleTime` values appropriate?

### Final

- [ ] Has the developer verified the change works end-to-end?
- [ ] Does the change break any existing functionality?
- [ ] Are there any regressions?

---

## 15. Error Handling Standards

### API Errors

```tsx
// All API routes return consistent shape:
{ success: false, error: 'Human-readable message', code?: 'ERROR_CODE' }

// Client handles:
const json = await response.json();
if (!json.success) {
  addToast(json.error, 'error');
  return;
}
```

### UI Error States

| Scenario | Pattern | Component |
|---|---|---|
| API fetch failure | Toast notification | Toast |
| API mutation failure | Toast + revert optimistic UI | Toast |
| Form validation | Inline error below field | Input error prop |
| 404 page | Full-page error | not-found.tsx |
| 500 page | Full-page error | error.tsx |
| Auth failure | Redirect to login | ProtectedRoute |
| Rate limiting | Toast with retry | Toast |
| Network offline | (Future) offline banner | — |

### Error Recovery

- Every error state should have a recovery action
- "Retry" button for API failures
- "Go back" for 404 pages
- "Sign in" for auth failures

---

## 16. Code Review Standards

### What to Look For

1. **Correctness**: Does the logic produce the expected result?
2. **Consistency**: Does it follow established patterns?
3. **Type safety**: Are there any `any` or unsafe assertions?
4. **Performance**: Does it cause unnecessary re-renders or API calls?
5. **Accessibility**: Are focus, keyboard, and screen reader needs met?
6. **Design system compliance**: Does it match the spec?

### Review Labels

| Label | Meaning |
|---|---|
| `blocking` | Must fix before merge. Bug, accessibility issue, or regression. |
| `should-fix` | Should fix before merge. Minor correctness or consistency issue. |
| `nice-to-have` | Can fix in a follow-up. Polish or cleanup. |
| `question` | Needs clarification before proceeding. |

---

*This document defines how we build Fond. Every PR, component, and feature should follow these standards. When in doubt, ask: does this make Fond better?*
