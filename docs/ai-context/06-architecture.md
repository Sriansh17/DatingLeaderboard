# Architecture: Fond

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.35 |
| Language | TypeScript | Strict mode |
| Database | Supabase PostgreSQL | — |
| Auth | Supabase Auth | SSR |
| State | TanStack React Query | 5 |
| AI Scoring | DeepSeek API | deepseek-v4-flash |
| Cache | Upstash Redis | HTTP-based |
| Payment | Razorpay | — |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 12 |
| Icons | Lucide React | — |
| Forms | React Hook Form + Zod | (Signup only) |
| Date | date-fns | — |
| CSS Utility | clsx + tailwind-merge | via `cn()` |

---

## Folder Structure

```
DatingLeaderboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Design tokens, glass system, animations
│   │   ├── loading.tsx         # Global loading (currently returns null)
│   │   ├── error.tsx           # Error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   ├── template.tsx        # Page transition wrapper
│   │   ├── middleware.ts        # Edge middleware (auth guards)
│   │   ├── auth/               # Login, Signup, OAuth callback
│   │   ├── dashboard/          # Main feed
│   │   ├── posts/              # Post detail, create, edit
│   │   ├── partners/           # Partner management
│   │   ├── leaderboards/       # Hub + local/city/global
│   │   ├── profile/            # Own profile + edit
│   │   ├── settings/           # App settings
│   │   ├── premium/            # Subscription management
│   │   ├── notifications/      # Notification list
│   │   ├── onboarding/         # 8-step first-run flow
│   │   ├── circles/            # Circle management + join
│   │   ├── confessions/        # Anonymous confessions
│   │   ├── contact/            # Creators page
│   │   ├── users/              # Public user profiles
│   │   ├── health/             # Health check endpoint
│   │   ├── test-particles/     # DEV: particle prototypes
│   │   └── api/                # All API routes
│   ├── components/
│   │   ├── ui/                 # Primitive components
│   │   ├── layout/             # Nav, footer, wrappers
│   │   ├── auth/               # Login/signup forms, guards
│   │   ├── posts/              # Post-specific components
│   │   ├── partners/           # Partner components
│   │   ├── leaderboards/       # Leaderboard components
│   │   ├── profile/            # Profile components
│   │   ├── notifications/      # Notification components
│   │   ├── confessions/        # Confession components
│   │   ├── cliques/            # Circle/connection components
│   │   ├── providers/          # Context providers
│   │   └── share/              # Share card components
│   ├── lib/
│   │   ├── supabase/           # Client, server, admin, middleware
│   │   ├── ai/                 # DeepSeek scoring
│   │   ├── payments/           # Razorpay
│   │   ├── redis/              # Upstash cache
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # cn, constants, format, geo, streak
│   ├── types/                  # database.ts, api.ts, ui.ts
│   └── middleware.ts           # Next.js Edge middleware
├── public/                     # PWA manifest, service worker, icons, audio
├── scripts/                    # DB migration runner
├── *.sql                       # Supabase migration files
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── PLAN.md, FOND_FEATURES.md, DB_MIGRATIONS.md
```

---

## Routing Architecture

### Public Routes (no auth required)
- `/` — Landing page
- `/auth/login` — Login
- `/auth/signup` — Signup
- `/auth/callback` — OAuth callback
- `/contact` — Creators page
- `/health` — Health check

### Protected Routes (auth required, enforced by middleware)
- `/dashboard` — Main feed
- `/posts/*` — Post CRUD
- `/partners/*` — Partner management
- `/profile/*` — Profile view/edit
- `/settings` — App settings
- `/leaderboards` — Leaderboard hub
- `/notifications` — Notifications
- `/onboarding` — Onboarding flow
- `/circles/*` — Circle management
- `/confessions/*` — Confession creation
- `/premium` — Subscription
- `/users/*` — Public profiles

### Auth Guard Logic (middleware.ts + lib/supabase/middleware.ts)
1. Edge middleware runs on all routes except static files
2. Public pages (root, auth/*, contact, health) → pass through with cookie refresh
3. API routes → cookie refresh, no redirect
4. Protected routes → redirect to `/auth/login` if no session
5. Auth pages → redirect to `/dashboard` if already logged in

---

## State Management

### Server State: TanStack React Query
- **Default config:** 60s stale time, 1 retry, no refetch on window focus
- **Key query keys:** `['explore-posts']`, `['circle-feed']`, `['leaderboard']`, `['notifications']`, `['unread-count']`
- **Mutations:** `useCreatePost` (invalidates posts + leaderboards), `useLikePost`
- **Polling:** NotificationBell polls every 30s, explore feed refetches every 30s

### Client State: React Context
- **AuthProvider** — user session + profile
- **ThemeProvider** — light/dark/system theme
- **AtmosphereProvider** — background visual atmosphere + particles
- **AnonymousModeProvider** — anonymous browsing mode
- **ShareProvider** — share modal state
- **ToastProvider** — toast notifications

### Local State: useState / useEffect
- Most component state is local (form inputs, toggles, UI state)
- No global state management library (no Redux, Zustand, etc.)

---

## API Architecture

### Pattern
All API routes follow the same pattern:
```ts
export async function GET(req: NextRequest) {
  try {
    // 1. Auth check (get user from Supabase session)
    // 2. Validate params
    // 3. Execute business logic
    // 4. Return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
```

### Auth in APIs
- Most routes create a Supabase SSR client and call `supabase.auth.getUser()`
- Some routes use `createAdminClient()` (service role) to bypass RLS for cross-user reads
- Route-level auth check is the primary enforcement; Supabase RLS exists at the DB level

### Key API Groups

| Group | Routes | Data Source |
|-------|--------|-------------|
| Auth | `GET/POST /api/auth/[...supabase]` | Supabase Auth |
| Users | `GET/PATCH /api/users`, `GET /api/users/[id]`, `GET /api/users/me`, `GET /api/users/search`, `GET /api/users/stats` | Supabase |
| Posts | `GET/POST /api/posts`, `GET/PATCH/DELETE /api/posts/[id]`, `GET/POST /api/posts/[id]/comments`, `GET /api/posts/feed`, `GET /api/posts/explore`, `GET /api/posts/circle-feed`, `POST /api/posts/[id]/like`, `POST /api/posts/[id]/view` | Supabase |
| Partners | `GET/POST /api/partners`, `PATCH/DELETE /api/partners/[id]` | Supabase |
| Leaderboards | `GET /api/leaderboards`, `POST /api/leaderboards/refresh` | Supabase + Redis |
| Circles | `CRUD /api/circles`, `POST /api/circles/join`, `POST/DELETE /api/circles/[id]/members` | Supabase |
| Connections | `GET/DELETE /api/connections`, `POST /api/connections/requests`, `PATCH /api/connections/requests/[id]` | Supabase |
| Confessions | `GET/POST /api/confessions`, `POST /api/confessions/[id]/react`, `GET/POST /api/confessions/[id]/replies` | Supabase |
| Notifications | `GET /api/notifications`, `POST /api/notifications/read`, `POST /api/notifications/[id]/read`, `GET /api/notifications/unread-count` | Supabase |
| AI | `POST /api/ai/score` | DeepSeek API |
| Payments | `POST /api/payments/razorpay/order`, `POST /api/payments/razorpay/verify` | Razorpay |

---

## Data Flow

### Post Creation Flow
```
User writes → PostForm.submit()
  → useCreatePost.mutateAsync() → POST /api/posts
    → Server: Create post row in Supabase
    → Server: Call scorePost() (DeepSeek API)
    → Server: Return { post, aiResult }
  → PostForm receives result:
    → Set aiResult (for VerdictCard)
    → Show confetti
    → Show welcome ceremony (BUG: always fires)
    → Show VerdictCard with share/rank actions
```

### Feed Loading Flow
```
Dashboard mounts
  → useQuery(['explore-posts']) → GET /api/posts/explore
    → Server: Query public posts with profile/partner joins
    → Return: Post[] with likes_count, comments_count, has_liked
  → Map posts to StoryCard components
  → Render in masonry grid
  → Poll every 30s
```

### Leaderboard Computation Flow
```
GET /api/leaderboards?type=global
  → Check Redis cache (currently disabled — always hits DB)
  → Query all profiles with posts → compute average_score per user
  → Filter by MIN_POSTS_FOR_LEADERBOARD (1)
  → For local: filter by distance (Haversine, 10km radius)
  → For city: filter by city string match
  → Sort by score desc → assign ranks → paginate
  → Return LeaderboardEntry[]
```

---

## Supabase Architecture

### Client Patterns

| Client | File | Use Case |
|--------|------|----------|
| `createClient()` | `lib/supabase/client.ts` | Browser-side (use `createBrowserClient`) |
| `createServerSupabaseClient()` | `lib/supabase/server.ts` | Server components (use `cookies()`) |
| `createAdminClient()` | `lib/supabase/admin.ts` | Admin operations with service role (bypasses RLS) |

### Key Tables
- `profiles` — User profiles, extension of auth.users
- `partners` — User-defined romantic partners
- `posts` — Stories with AI scores
- `likes` — Post likes
- `comments` — Post comments (supports threaded replies)
- `flags` — Flagged posts
- `circles` — Private groups
- `circle_members` — Circle membership
- `connections` — Bidirectional friend connections
- `connection_requests` — Pending connection requests
- `confessions` — Anonymous confessions
- `confession_reactions` — Emoji reactions on confessions
- `confession_replies` — Replies to confessions
- `notifications` — User notifications
- `subscriptions` — Premium subscription records
- `leaderboard_cache` — Cached leaderboard data

---

## External Service Dependencies

| Service | Usage | Credential Location |
|---------|-------|-------------------|
| Supabase | DB + Auth | `.env.local` (NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY) |
| DeepSeek API | AI scoring | `.env.local` (DEEPSEEK_API_KEY) |
| Upstash Redis | Leaderboard cache | `.env.local` (UPSTASH_REDIS_REST_URL, TOKEN) |
| Razorpay | Payment processing | `.env.local` (KEY_ID, KEY_SECRET) |
