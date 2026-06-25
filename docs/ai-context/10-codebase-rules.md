# Codebase Rules

## Naming Conventions

### Files
- **Components:** PascalCase (`Button.tsx`, `StoryCard.tsx`, `PostForm.tsx`)
- **Hooks:** camelCase with `use` prefix (`useAuth.ts`, `usePosts.ts`, `useLeaderboard.ts`)
- **Utilities:** camelCase (`cn.ts`, `format.ts`, `streak.ts`, `constants.ts`)
- **Types:** camelCase (`database.ts`, `api.ts`, `ui.ts`)
- **API Routes:** route.ts (Next.js App Router convention)
- **Pages:** page.tsx (Next.js App Router convention)
- **Layouts:** layout.tsx (Next.js App Router convention)

### Variables
- **React State:** camelCase (`isLoading`, `hasCircles`, `activeTab`)
- **Functions:** camelCase, verb-first (`handleSubmit`, `fetchExplorePosts`, `shufflePrompt`)
- **Constants:** UPPER_SNAKE_CASE (`MIN_POSTS_FOR_LEADERBOARD`, `LOCAL_RADIUS_KM`, `APP_NAME`)
- **Types/Interfaces:** PascalCase (`Story`, `LeaderboardEntry`, `ApiResponse`)
- **Props interfaces:** Same as component name + `Props` (`ButtonProps`, `StoryCardProps`)

### Routes
- **App Router segments:** lowercase, kebab-case for multi-word (`/leaderboards/city`, `/posts/new`, `/circles/join/[code]`)

---

## Component Patterns

### Component Structure
```tsx
'use client';  // if client-side

import { ... } from '...';

interface ComponentNameProps {
  // Props
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // State, hooks, handlers
  // Return JSX
}
```

### Rules
1. **ALL client components** must start with `'use client'`
2. **No default exports** — use named exports throughout
3. **Props interfaces** defined co-located with component
4. **forwardRef** for input-like components (Button, Input, Textarea)
5. **"use client"** components can import server components, not vice versa

### Component Categories

| Category | Directory | Example |
|----------|-----------|---------|
| UI Primitives | `components/ui/` | Button, Card, Input, Modal, Toast |
| Layout | `components/layout/` | Navbar, AppDock, Footer |
| Feature Components | `components/{feature}/` | PostForm, PartnerCard, StoryCard |
| Providers | `components/providers/` | AuthProvider, ThemeProvider |
| Feature Pages | `app/{feature}/` | dashboard/page.tsx, posts/new/page.tsx |

---

## Folder Conventions

```
src/
  app/          # Next.js App Router pages + API routes
  components/   # React components
    ui/         # Primitive, reusable UI components
    layout/     # Navigation, structural components
    auth/       # Auth-specific components
    posts/      # Post-related components
    partners/   # Partner-related components
    ...
  lib/          # Business logic, utilities, services
    supabase/   # Supabase client configurations
    ai/         # AI scoring logic
    payments/   # Razorpay integration
    redis/      # Upstash cache
    hooks/      # Custom React hooks
    utils/      # Utility functions
  types/        # TypeScript type definitions
```

### Rules
1. **Feature components** go in `components/{feature}/` — not flat in `components/`
2. **API logic** goes in `app/api/{resource}/route.ts` — thin controllers, thick lib
3. **Shared utilities** go in `lib/utils/`
4. **Hooks** go in `lib/hooks/`
5. **Migration SQL** files go in project root (not `src/`)

---

## API Patterns

### Route Structure
```ts
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    // Business logic
    const { data, error } = await supabase.from('table').select('*');
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

### Rules
1. **Always wrap in try-catch** with error response
2. **Always check auth** at the top of protected routes
3. **Use `createServerSupabaseClient()`** for server-side Supabase access
4. **Use `createAdminClient()`** only when bypassing RLS is necessary
5. **Return `{ success: true, data }`** on success
6. **Return `{ success: false, error }`** on failure with appropriate HTTP status
7. **Paginated endpoints** use `page` and `limit` query params, return `has_more: boolean`

---

## State Management Patterns

### Query Rules
1. **Use `@tanstack/react-query`** for all server state (API calls)
2. **Query keys** should be descriptive strings (`['explore-posts']`, `['circle-feed']`)
3. **Invalidate** related queries on mutations (create → invalidate posts + leaderboards)
4. **Stale time** default: 60s (set in QueryProvider)
5. **Polling** for live data (feed: 30s, notifications: 30s)

### Context Rules
1. **Use React Context** for truly global state (auth, theme, atmosphere, anonymous mode)
2. **Consumers** use custom hooks (`useAuth()`, `useTheme()`, `useAnonymousMode()`)
3. **Provider components** go in `components/providers/`

### Local State Rules
1. **Use `useState`** for component-specific UI state
2. **Use `useRef`** for mutable values that shouldn't trigger re-renders
3. **Derive state** from props where possible (don't duplicate)

---

## Styling Patterns

### Tailwind Usage
1. **Primary utility** for all styling
2. **CSS variables** for design tokens (colors, radius, shadows)
3. **`cn()` utility** for conditional class merging (`clsx` + `tailwind-merge`)
4. **No inline styles** except dynamic values (score colors, progress widths)

### Class Naming Order (convention)
1. Layout (flex, grid, absolute, etc.)
2. Spacing (p-, m-, gap-)
3. Sizing (w-, h-)
4. Typography (font-, text-, tracking-)
5. Colors (bg-, text-, border-)
6. Visual (rounded-, shadow-, backdrop-)
7. Interactive (hover:, focus:, group-)

### Dark Mode
1. Use `dark:` prefix for dark mode overrides
2. Dark mode is class-based (`.dark` on `<html>`)
3. Always test both themes

### Animation
1. Use **Tailwind's animate-*** classes for CSS animations
2. Use **framer-motion** for complex animations (enter/exit, layout, spring)
3. Use **`cn()`** for conditional animation classes
4. Signature easing: `[0.16, 1, 0.3, 1]`

---

## TypeScript Rules

### Strictness
- Project uses `strict: true` in tsconfig
- Avoid `any` — use proper types or `unknown`
- All API types defined in `src/types/api.ts`
- All database types defined in `src/types/database.ts`
- All UI types defined in `src/types/ui.ts`

### Type Patterns
```ts
// API responses
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Props
interface ComponentProps {
  // Required props first, optional with ?
}

// Database types with joined fields
interface Post {
  id: string;
  // ... DB fields
  // Joined fields (optional)
  partner?: Partner;
  profile?: Profile;
}
```

---

## Import Rules

1. **Path alias:** Use `@/` for `src/` (configured in tsconfig)
   - Good: `import { Button } from '@/components/ui/Button'`
   - Bad: `import { Button } from '../../../components/ui/Button'`
2. **Group imports:** React → next → external libs → internal modules
3. **No barrel imports** (index.ts) — import directly from the source file

---

## Database Rules

1. **All schema changes** go in migration SQL files (not auto-migrations)
2. **`createAdminClient()`** uses service role key — use sparingly (bypasses RLS)
3. **Browser client** uses anonymous key with RLS
4. **Migration files** are numbered sequentially in root

---

## Git Rules

1. **No credentials** in code — `.env.local` is gitignored
2. **No `console.log`** in production code
3. **No build artifacts** committed
4. **Migration files** should be reviewed before running (`scripts/migrate.mjs`)
