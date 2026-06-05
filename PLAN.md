# LoveBoard — PWA Social App

> A social app where users describe what their partner did for them today, an AI scores it, and partners get ranked on local, city, and global leaderboards.

**Status: Phases 1-4 Complete ✅ | Phase 5 (Polish & PWA) Mostly Done 🔲**

**Brownie points (nice to have):**
- Wire Razorpay payment UI (API routes exist, not connected to frontend)
- Vercel deployment config

**Required for full functionality:**
- Set real Claude API key (`CLAUDE_API_KEY` in `.env.local`) — AI scoring won't work without it
- Set real Upstash Redis URL — leaderboard falls back to DB-only for now

---

## 1. Folder Structure

```
LovedBoard/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker (offline support)
│   ├── icons/                     # PWA icons (192x192, 512x512)
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── og-image.png               # Social share image
│
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── layout.tsx             # Root layout (metadata, providers)
│   │   ├── page.tsx               # Landing page
│   │   ├── loading.tsx            # Global loading state
│   │   ├── error.tsx              # Global error boundary
│   │   ├── not-found.tsx          # 404 page
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Login page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx       # Signup page
│   │   │   └── callback/
│   │   │       └── route.ts       # OAuth callback
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # User dashboard (feed + stats)
│   │   │   └── layout.tsx         # Dashboard layout (sidebar nav)
│   │   │
│   │   ├── posts/
│   │   │   ├── new/
│   │   │   │   └── page.tsx       # Create a new appreciation post
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Post detail page
│   │   │       └── edit/
│   │   │           └── page.tsx   # Edit post
│   │   │
│   │   ├── partners/
│   │   │   ├── page.tsx           # Manage partners (CRUD)
│   │   │   └── new/
│   │   │       └── page.tsx       # Add new partner
│   │   │
│   │   ├── leaderboards/
│   │   │   ├── page.tsx           # Leaderboard hub (tab switcher)
│   │   │   ├── local/
│   │   │   │   └── page.tsx       # Local leaderboard (10km radius)
│   │   │   ├── city/
│   │   │   │   └── page.tsx       # City leaderboard
│   │   │   └── global/
│   │   │       └── page.tsx       # Global leaderboard
│   │   │
│   │   ├── profile/
│   │   │   ├── page.tsx           # User profile + stats
│   │   │   └── edit/
│   │   │       └── page.tsx       # Edit profile
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx           # App settings
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...supabase]/
│   │       │       └── route.ts   # Supabase Auth handler
│   │       │
│   │       ├── posts/
│   │       │   ├── route.ts       # GET (list) / POST (create)
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts   # GET / PATCH / DELETE
│   │       │   │   └── score/
│   │       │   │       └── route.ts  # AI scoring endpoint
│   │       │   └── feed/
│   │       │       └── route.ts   # Paginated feed
│   │       │
│   │       ├── partners/
│   │       │   ├── route.ts       # GET / POST
│   │       │   └── [id]/
│   │       │       └── route.ts   # GET / PATCH / DELETE
│   │       │
│   │       ├── leaderboards/
│   │       │   ├── route.ts       # GET (with type param)
│   │       │   └── refresh/
│   │       │       └── route.ts   # Manual cache refresh (admin)
│   │       │
│   │       ├── users/
│   │       │   ├── route.ts       # GET / PATCH profile
│   │       │   └── stats/
│   │       │       └── route.ts   # User statistics
│   │       │
│   │       ├── payments/
│   │       │   └── razorpay/
│   │       │       ├── order.ts   # Create Razorpay order
│   │       │       └── verify.ts  # Verify payment signature
│   │       │
│   │       └── ai/
│   │           └── score/
│   │               └── route.ts   # Claude API scoring endpoint
│   │
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── BottomNav.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── OAuthButtons.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── posts/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostForm.tsx
│   │   │   ├── PostFeed.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   └── ScoreBadge.tsx
│   │   │
│   │   ├── partners/
│   │   │   ├── PartnerCard.tsx
│   │   │   ├── PartnerForm.tsx
│   │   │   └── PartnerSelect.tsx
│   │   │
│   │   ├── leaderboards/
│   │   │   ├── LeaderboardTable.tsx
│   │   │   ├── LeaderboardCard.tsx
│   │   │   ├── LeaderboardTabs.tsx
│   │   │   └── RankBadge.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileStats.tsx
│   │   │   └── ProfileForm.tsx
│   │   │
│   │   └── providers/
│   │       ├── AuthProvider.tsx
│   │       ├── ThemeProvider.tsx
│   │       └── QueryProvider.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server client
│   │   │   ├── admin.ts           # Admin client (service role)
│   │   │   └── middleware.ts      # Auth middleware helper
│   │   │
│   │   ├── redis/
│   │   │   └── client.ts          # Upstash Redis client
│   │   │
│   │   ├── ai/
│   │   │   └── scoring.ts         # Claude API scoring logic
│   │   │
│   │   ├── payments/
│   │   │   └── razorpay.ts        # Razorpay utilities
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts              # clsx + tailwind-merge
│   │   │   ├── format.ts          # Date/number formatters
│   │   │   ├── geo.ts             # Geolocation helpers
│   │   │   └── constants.ts       # App constants
│   │   │
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── usePosts.ts
│   │       ├── useLeaderboard.ts
│   │       ├── useGeolocation.ts
│   │       ├── useDebounce.ts
│   │       └── useMediaQuery.ts
│   │
│   ├── types/
│   │   ├── database.ts            # Supabase schema types
│   │   ├── api.ts                 # API request/response types
│   │   └── ui.ts                  # UI utility types
│   │
│   └── middleware.ts              # Next.js middleware (auth guard)
│
├── .env.local                     # Environment variables
├── .env.example                   # Environment template
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── postcss.config.js              # PostCSS configuration
├── package.json
├── PLAN.md                        # This file
└── README.md
```

---

## 2. Database Schema (Supabase PostgreSQL)

```sql
-- Users table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  city        TEXT,
  location    GEOGRAPHY(Point, 4326),  -- For spatial queries
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Partners table
CREATE TABLE public.partners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  relationship    TEXT CHECK (relationship IN ('spouse', 'partner', 'boyfriend', 'girlfriend', 'other')),
  emoji           TEXT DEFAULT '💖',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table (appreciation posts)
CREATE TABLE public.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id      UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  description     TEXT NOT NULL,
  ai_score        SMALLINT CHECK (ai_score BETWEEN 1 AND 100),
  ai_feedback     TEXT,
  ai_explanation  TEXT,
  is_public       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_partner_id ON public.posts(partner_id);
CREATE INDEX idx_posts_ai_score ON public.posts(ai_score DESC);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_partners_user_id ON public.partners(user_id);

-- Leaderboard cache table (fallback when Redis is down)
CREATE TABLE public.leaderboard_cache (
  id          TEXT PRIMARY KEY,  -- 'local', 'city', 'global'
  data        JSONB NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. API Routes Overview

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/signup` | Create account | No |
| POST | `/api/auth/login` | Sign in | No |
| POST | `/api/auth/logout` | Sign out | Yes |
| GET | `/api/posts` | List user's posts | Yes |
| POST | `/api/posts` | Create post (triggers AI scoring) | Yes |
| GET | `/api/posts/[id]` | Get post detail | Yes |
| PATCH | `/api/posts/[id]` | Update post | Yes |
| DELETE | `/api/posts/[id]` | Delete post | Yes |
| GET | `/api/posts/feed` | Paginated public feed | Yes |
| GET | `/api/partners` | List user's partners | Yes |
| POST | `/api/partners` | Add partner | Yes |
| GET | `/api/leaderboards?type=local&lat=&lng=` | Get leaderboard | Yes |
| GET | `/api/users/profile` | Get profile | Yes |
| PATCH | `/api/users/profile` | Update profile | Yes |
| GET | `/api/users/stats` | Get user stats | Yes |
| POST | `/api/payments/razorpay/order` | Create order | Yes |
| POST | `/api/payments/razorpay/verify` | Verify payment | Yes |

---

## 4. AI Scoring Prompt (Claude API)

The scoring uses Claude Sonnet 4-6 to evaluate appreciation posts on these dimensions:
- **Thoughtfulness** (0-30): How much effort/thought was put into the gesture
- **Romance** (0-20): How romantic/sweet is the gesture
- **Effort** (0-25): How much effort did the partner put in
- **Uniqueness** (0-15): How unique/creative is the gesture
- **Emotional Impact** (0-10): How meaningful is it emotionally

**Total Score: 1-100**

The prompt instructs Claude to:
1. Read the user's description of what their partner did
2. Score each dimension
3. Provide a brief, warm explanation
4. Return structured JSON

---

## 5. Leaderboard Calculation

### Tiers
1. **Local** (10km radius) — Uses user's lat/lng, spatial query
2. **City** — Matches by `city` field on profile
3. **Global** — All users worldwide

### Scoring
- Each user's leaderboard score = Average of their last 10 posts' `ai_score`
- Minimum 3 posts required to appear on leaderboard
- Leaderboard refreshes every 5 minutes (cached in Redis)
- Cache key: `leaderboard:{type}:{identifier}` (e.g., `leaderboard:local:40.7128,-74.0060`)

---

## 6. PWA Configuration

- **Manifest**: `public/manifest.json` — name, icons, theme_color (#ff6b6b), display (standalone)
- **Service Worker**: Cache-first for static assets, network-first for API, offline fallback page
- **Offline**: Show cached leaderboard data when offline, queue posts for sync when back online

---

## 7. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Claude API (AI scoring)
CLAUDE_API_KEY=sk-ant-xxx...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_xxx...
RAZORPAY_KEY_SECRET=xxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 8. Component Tree (Visual Hierarchy)

```
RootLayout
├── AuthProvider
│   ├── ThemeProvider
│   │   ├── QueryProvider
│   │   │   └── [Page Content]
│   │   │       ├── LandingPage
│   │   │       │   ├── HeroSection
│   │   │       │   ├── FeaturesGrid
│   │   │       │   ├── LeaderboardPreview
│   │   │       │   └── CTASection
│   │   │       │
│   │   │       ├── AuthPage (Login/Signup)
│   │   │       │   ├── AuthForm
│   │   │       │   └── OAuthButtons
│   │   │       │
│   │   │       ├── DashboardLayout
│   │   │       │   ├── Navbar
│   │   │       │   ├── Sidebar (desktop)
│   │   │       │   ├── BottomNav (mobile)
│   │   │       │   └── [Page]
│   │   │       │       ├── Dashboard -> PostFeed + StatsCard
│   │   │       │       ├── NewPost -> PostForm + AIScorePreview
│   │   │       │       ├── PostDetail -> PostCard + ScoreBreakdown
│   │   │       │       ├── Partners -> PartnerCard[] + PartnerForm
│   │   │       │       ├── Leaderboards -> LeaderboardTabs + LeaderboardTable
│   │   │       │       └── Profile -> ProfileHeader + ProfileStats + ProfileForm
```

---

## 9. Build Phases (Execution Order)

### Phase 1: Scaffolding ✅
- [x] Initialize Next.js 14 with `create-next-app` (App Router, TypeScript, Tailwind)
- [x] Install all dependencies
- [x] Configure `next.config.ts` (PWA headers, image domains)
- [x] Create `.env.local` / `.env.example`
- [x] Set up Tailwind theme (colors, fonts, spacing)
- [x] Create PWA manifest + service worker
- [x] Set up folder structure

### Phase 2: Database & Auth ✅
- [x] Create Supabase project and run schema SQL
- [x] Build Supabase client utilities (browser + server)
- [x] Set up Auth UI (login, signup) — email/password flow only
- [x] Build auth middleware
- [x] Create profile creation flow on signup

### Phase 3: Core Features ✅
- [x] Build partner CRUD (add/manage partners)
- [x] Build post creation form
- [x] Build AI scoring API route (Claude integration)
- [x] Build post feed (paginated)
- [x] Build post detail with score breakdown

### Phase 4: Leaderboards ✅
- [x] Implement leaderboard computation logic
- [x] Set up Upstash Redis caching (falls back gracefully when not configured)
- [x] Build leaderboard UI with tabs (local/city/global)
- [x] Add geolocation for local leaderboard

### Phase 5: Polish & PWA 🔲 (Partially Done)
- [ ] Add Razorpay hooks — API routes exist, not wired in UI
- [x] Add service worker for offline support
- [x] Responsive design pass — desktop sidebar + mobile bottom nav
- [x] Loading states, error boundaries, empty states
- [x] SEO metadata
- [x] Contact page (Instagram + LinkedIn)
- [ ] Vercel deployment configuration

---

## 10. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Mgmt | React Query (TanStack Query) | Built-in caching, deduplication, background refetch |
| Forms | React Hook Form + Zod | Lightweight, type-safe validation |
| Styling | Tailwind CSS + clsx/tw-merge | Utility-first, no runtime CSS-in-JS overhead |
| Auth | Supabase Auth (built-in) | Tight PostgreSQL integration, RLS policies |
| AI | Claude API (server-side only) | API key never exposed to browser |
| Cache | Upstash Redis | Serverless-friendly, HTTP-based, no persistent connection |
| Payments | Razorpay | Indian market focus, easy integration |
| Icons | Lucide React | Lightweight, tree-shakeable icon library |
| Maps | No map library (MVP) | Use city/geo text; maps added later |
