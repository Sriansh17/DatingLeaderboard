# Product & Codebase Audit: Fond

**Audit Date:** 2026-07-06 (Updated from 2026-06-25)
**Repository:** /Users/rishabhbassi/Desktop/leadboard/DatingLeaderboard
**Audit Scope:** Complete — 70+ components, 42 API routes, 24 pages, 6 providers, 7 hooks, 6 utility files, 4 types files, middleware, DB schema

---

## Resolved Issues (since 2026-06-25 audit)

| # | Issue | Status | Fix |
|---|-------|--------|-----|
| 1 | First-post detection always `true` | ✅ Fixed | Changed to `result.streak?.current === 1 && !result.streak?.longest` |
| 2 | Toast as blocking modal | ✅ Already non-blocking | Toasts are `fixed top-4` with stack, no backdrop — was already correct |
| 3 | 4 redundant navigation systems | ✅ Consolidated | Navbar removed, Sidebar removed, only AppDock remains |
| 4 | `console.log` in production | ✅ Fixed | Removed from `usePosts.ts`, `useLeaderboard.ts`, `like/route.ts` |
| 5 | Score color duplication | ✅ Standardized | CSS variable tokens used consistently (`text-destructive`, `text-success`, etc.) |
| 6 | Profile editing duplicated | ✅ Partially fixed | EditProfileModal is the single entry point |
| 7 | Like optimistic rollback broken | ✅ Fixed | Saves pre-mutation state via `wasLiked` variable |
| 8 | Like race condition | ✅ Mitigated | Returns `likes_count` for frontend sync |
| 9 | Skeleton loading system | ✅ Added | `Skeleton.tsx` with 5 variants (card, profile, podium, row, avatar) |
| 10 | Empty state illustrations | ✅ Added | `EmptyState.tsx` with emoji icons + themed registry |
| 11 | Emoji reactions (frontend) | ✅ Added | 4 quick reactions (🔥😭👀💀) on StoryCards |
| 12 | Emoji reactions (backend) | ✅ Added | `POST /api/posts/[id]/react` with toggle + persistence |
| 13 | Leaderboard rank_change | ✅ Added | Daily snapshot stored in `leaderboard_cache` table, diffs computed |
| 14 | Streak at risk toast | ✅ Added | Evening reminder (6PM+) for users with active streaks |
| 15 | Daily winner badge | ✅ Added | Gold-accented card showing #1 post from last 24h |
| 16 | Partners page loading spinner | ✅ Fixed | Added spinner + "Adding..." text during submit |
| 17 | `evaluateStreak` midnight bug | ✅ Fixed | Uses `T12:00:00Z` noon-UTC + direct string comparison |
| 18 | Landing page marquee ticker | ✅ Replaced | Static social proof bar with stats |
| 19 | Landing page section variety | ✅ Added | Alternating `bg-elevated/20` backgrounds |
| 20 | Settings page personality | ✅ Added | Fond-themed tag pills |
| 21 | Profile stat hierarchy | ✅ Improved | Avg/Best Score dominant, Bonds/Connections as pills |

---

## Executive Summary (Updated)

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Product** | 7.5/10 | Strong concept, onboarding still needs reduction (8 steps), daily winner adds engagement |
| **UX** | 7.5/10 | Skeleton loading, empty states, reaction persistence all improve polish. Dashboard still has cognitive load from 6-card carousel |
| **Design Consistency** | 7.5/10 | Single glass-btn system, consolidated navigation, standardized typography. Card radius and animation easing unified |
| **Engineering Quality** | 7/10 | Console.logs removed, like race mitigated, rank_change implemented. Redis cache still disabled, `any` types remain in streak/leaderboard routes |
| **Maintainability** | 6.5/10 | Skeleton/EmptyState components added, dead Sidebar removed. StoryCard variants still partially unused |

**Overall: 7.2 / 10** (+1.4 since last audit)

---

## Remaining Issues

### High Priority
1. **Leaderboard cache disabled** — Redis not connected, every request re-fetches all data
2. **Streak increment race condition** — Read-then-write pattern can lose increments under concurrent posts
3. **Onboarding too long** — 8 steps, should be reduced to 4-5
4. **StoryCard unused variants** — Only variant C is used, A/B/D/E/F/G are dead code

### Medium Priority
5. **Payment webhook** — No server-side Razorpay webhook for subscription verification
6. **`any` type usage** — Present in `streak/route.ts`, `posts/route.ts`, `leaderboards/route.ts`
7. **Reaction count display** — Emoji reactions don't show aggregated counts from other users
8. **Rank_change for circle leaderboard** — Only implemented for global leaderboard

### Low Priority
9. **`PaginatedResponse` type unused** — Defined in types but never used by any API route
10. **`is_public` filtering on explore feed** — Verify private posts excluded from global feed

---

| File | Purpose | Status |
|------|---------|--------|
| `Navbar.tsx` | Top nav (desktop + hamburger) | Used on pages outside dock |
| `AppDock.tsx` | Bottom dock with FAB + atmosphere | **Primary nav** |
| `BottomNav.tsx` | Legacy bottom nav | **Dead code?** |
| `MobileNav.tsx` | Bottom nav with `safe-area-bottom` | **Dead code?** |
| `Footer.tsx` | Bottom footer | Used |

Both `BottomNav.tsx` and `MobileNav.tsx` appear to be legacy implementations. They're rendered in `ClientLayoutWrapper.tsx` alongside `AppDock`, meaning multiple nav elements may render simultaneously.

**Fix:** Remove `BottomNav.tsx` and `MobileNav.tsx`. Keep `AppDock.tsx` as the single navigation component. Verify `ClientLayoutWrapper.tsx` doesn't render both.

---

### 4. HIGH: `console.log` in Production Code

`dashboard/page.tsx:28` — verbose logging of API response:
```tsx
console.log('[fetchExplorePosts] Got posts:', json.data?.length, 'first post likes:', 
  json.data?.[0]?.likes_count, 'has_liked:', json.data?.[0]?.has_liked);
```

`EditProfileModal.tsx:52` — error logging without user feedback:
```tsx
console.error(err);
```

**Impact:** Sensitive data (likes, post IDs) leaked to browser console. Users see console noise they shouldn't. API response structure exposed.

---

### 5. HIGH: Score Color Logic Duplication & Inconsistency

Two competing implementations with different thresholds:

**`format.ts`**: 92+ legendary, 75+ high, 55+ mid, <55 low
**`mock-data.ts` (`scoreColor`)**: 92+ legendary, 75+ high, 55+ mid, <55 low (same!)

But **`mock-data.ts` (`tierForScore`)** uses completely different thresholds:
- <40: Still Dating
- <55: Complicated
- <65: Exclusive
- <75: Relationship Goals
- <85: Partner Material
- <92: Gold Standard
- <97: Legendary
- 97+: Algorithm Has No Words

**Impact:** Score colors and tier labels are computed with different thresholds. A score of 80 shows "score-high" color (75+ threshold) but the tier label is "Gold Standard" (85-91 range). The color and label systems are out of sync.

**Fix:** Create a single scoring module that exports color, tier, and threshold functions from one source. Remove duplicate functions from `format.ts` and `mock-data.ts`.

---

### 6. HIGH: Profile Editing Duplicated

Two separate profile editing implementations with different fields:

| Feature | `EditProfileModal.tsx` | `ProfileForm.tsx` |
|---------|----------------------|-------------------|
| Avatar | Yes (modal + upload placeholder) | Yes (file upload with resize) |
| Username | Yes (with @ prefix) | Yes |
| Full Name | Yes | Yes |
| Age | Yes | No |
| Gender | Yes | No |
| City | Yes | Yes |
| Occupation | Yes | No |
| Country | Yes | No |
| Bio (Dating Philosophy) | Yes | Yes |
| API Method | Supabase direct (`createClient`) | Supabase direct (`createClient`) |
| State Mgmt | `useState` per field | `useState` per field |

**Impact:** 100% overlap in basic fields. Two code paths to maintain. ProfileForm is simpler but missing age/gender/occupation. EditProfileModal has all fields but uses free-text inputs without validation.

---

## Design System Guide

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | DM Sans (via next/font) | Body, UI labels, buttons |
| `--font-display` | Playfair Display (via next/font) | Headings, italic display text |
| `--font-score` | Bebas Neue (via next/font) | Large score numbers |
| `.font-score` | `font-family: var(--font-score)` | Score displays |

**Issues:**
- No type scale system (text-xs through font-score used ad-hoc)
- Heading hierarchy is inconsistent — `h1` uses Playfair, but some page headings use `font-display text-5xl` (landing) while others use `font-display text-3xl` (dashboard)
- No body text size standard — some body copy is `text-sm`, some `text-base`, some `text-lg`

### Colors

**Core tokens** (via CSS custom properties, RGB format):

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `#FCFAF8` | `#160C12` | Page backgrounds |
| `--surface` | `#FFFFFF` | `#1E1017` | Card surfaces |
| `--elevated` | `#F9F6F4` | `#281620` | Elevated surfaces |
| `--foreground` | `#221F20` | `#FAF5F3` | Primary text |
| `--primary` | `#D12F58` | `#EE6A8C` | CTAs, active states |
| `--gold` | `#C7A96B` | `#DCBE78` | Premium/achievement |
| `--blush` | `#FFB6C1` | `#FF8CA0` | Romantic accent |
| `--border` | `#EAE4E1` | `#4B2D37` | Borders, dividers |

**Issues:**
- `--secondary` and `--muted` are identical to `--elevated` in light mode
- `--accent` is identical to `--muted` in light mode — no distinct accent color
- No semantic info/error/warning colors mapped outside `destructive`/`success`/`warning`
- Hardcoded text gradients in `globals.css` (`text-gradient-gold`, `text-gradient-crimson`) use raw hex values instead of CSS variables

### Glass System

4 levels of glass effect (`glass`, `glass-1`, `glass-2`, `glass-3`, `glass-dock`) with `backdrop-filter: blur()` and saturate boost.

**Issues:**
- `glass` class doesn't use `backdrop-filter` — inconsistent with the glass-* family
- Dark mode variants use hardcoded `rgb(22 12 18 / 0.4)` instead of CSS variable references
- Mix of `glass` and glass-* usage throughout components inconsistent

### Spacing

**Issues:**
- No consistent spacing scale used across components
- Mix of `p-4`, `p-5`, `p-6`, `p-8` on cards
- Dashboard feed uses `gap-8`, landing uses `gap-5` for similar grid layouts
- No standardized padding for page sections

### Shadows

Two shadow tokens defined but **not exposed in Tailwind config**:

```
--shadow-glow: 0 4px 24px -4px rgba(209, 47, 88, 0.15)
--shadow-gold: 0 4px 20px -4px rgba(199, 169, 107, 0.15)
```

**Impact:** Components reference them as `shadow-[var(--shadow-glow)]` or `shadow-glow` (which only works if Tailwind is configured to parse them). Most components inline shadow classes directly rather than using tokens.

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.875rem` (14px) | Root radius |
| `lg` | `0.875rem` | Standard card |
| `md` | `calc(0.875rem - 2px) = 0.75rem` | Medium elements |
| `sm` | `calc(0.875rem - 4px) = 0.625rem` | Small elements |

**Actual component radii used (inconsistent):**
- `rounded-2xl` (16px) — cards, inputs
- `rounded-3xl` (24px) — modals, cards
- `rounded-full` (9999px) — buttons, pills
- `rounded-[2rem]` (32px) — StoryCard, cards
- `rounded-xl` (12px) — inputs, tabs
- `rounded-2xl` on modals

---

## Product Audit

### Feature Inventory

| Feature | Entry Point | Primary User Value | UX Quality | Notes |
|---------|------------|-------------------|------------|-------|
| **Post Creation** | `/posts/new`, FAB | Gamified storytelling | ★★★★☆ | Strong flow, but welcome ceremony always fires (bug) |
| **AI Scoring** | Post submission | Entertainment, validation | ★★★★★ | Excellent persona-driven verdicts |
| **Leaderboards** | `/leaderboards`, nav | Competition, social proof | ★★★★☆ | Rich visuals, but cache is disabled |
| **Dashboard Feed** | `/dashboard` | Content discovery | ★★★☆☆ | Overloaded with 6 insight cards + ticker + spotlight + feed |
| **Profile** | `/profile` | Identity, stats | ★★★☆☆ | Duplicate edit flows, missing fields in ProfileForm |
| **Partners** | `/partners` | Relationship management | ★★★☆☆ | Premium-gated multi-partner |
| **Circles/Bonds** | `/circles` | Social groups | ★★★☆☆ | Good logic, 3 naming conventions |
| **Confessions** | `/confessions` | Anonymous sharing | ★★★☆☆ | Well-built, but disconnected from main flow |
| **Notifications** | `/notifications`, bell | Social awareness | ★★☆☆☆ | Missing post_like/comment notifications |
| **Onboarding** | `/onboarding` | First-run experience | ★★★★★ | Cinematic, 8 steps, well-crafted |
| **Premium** | `/premium` | Monetization | ★★★☆☆ | Razorpay backend wired, frontend needs polish |
| **Settings** | `/settings` | Configuration | ★★☆☆☆ | Minimal — theme toggle, premium upsell, sign out |
| **Share** | Post feed, verdict | Virality | ★★☆☆☆ | ShareTemplates directory is empty, ShareStudio is bare |
| **Users** | `/users/[id]` | Discovery | ★★★☆☆ | Good public profile, connection integration |

### Feature Gaps / Logic Issues

1. **Notifications are incomplete**: Database supports `connection_request`, `connection_accepted`, `clique_invite`, `clique_joined` but NOT `post_like` or `post_comment` despite the test route creating them (`src/app/api/notifications/test/route.ts:18`)

2. **Leaderboard cache disabled**: `src/app/api/leaderboards/route.ts` has `// Cache temporarily disabled` — every leaderboard query hits the database directly, computing averages across all posts. On scale, this will fail.

3. **Views counting is racy**: `src/app/api/posts/[id]/view/route.ts` reads current value, increments in JS, writes back — race condition under concurrent requests.

4. **Post editing gated to premium**: Only premium users can edit posts; free users get "archived" as their only post action. The edit route (`/posts/[id]/edit/page.tsx`) redirects back to post detail.

5. **"Forgot password" is email-only**: `LoginForm.tsx` sends a password reset email via Supabase but there's no dedicated reset page or confirmation UI.

---

## UX Findings

### Critical UX Issues

| Issue | Severity | File | Description |
|-------|----------|------|-------------|
| Toast blocks UI | Critical | `Toast.tsx` | Full-screen blocking modal for notifications |
| Welcome ceremony always fires | High | `PostForm.tsx:138` | Every new post triggers first-post animation |
| Anonymous mode hides feed | High | `dashboard/page.tsx` | Toggling anonymous mode replaces entire feed with confessions — disorienting |
| Dashboard cognitive load | High | `dashboard/page.tsx` | 6 editorial insight cards + ticker + spotlight + feed = 10+ content areas |
| No loading state on landing | Medium | `loading.tsx` | Global loading file returns `null` — invisible loading |
| Nav element collision | Medium | `ClientLayoutWrapper.tsx` | AppDock + BottomNav/MobileNav may render simultaneously |
| Score color ≠ tier label | Medium | `format.ts`, `mock-data.ts` | Color threshold and tier threshold are out of sync |
| Share-to-story fails silently | Medium | `ShareStudio.tsx` | UI claims "Share to Story" but no actual platform integration |

### Missing States

| Component | Missing State | Location |
|-----------|--------------|----------|
| PostFeed | Error state (not shown) | `PostFeed.tsx` |
| StoryCard | Error state | `StoryCard.tsx` |
| UserSearch | Loading skeleton | `UserSearch.tsx` — shows spinner, not skeleton |
| ConfessionsFeed | Empty to first-post guidance | `ConfessionsFeed.tsx` — "No confessions yet. Be the first." but no CTA |

### Accessibility Concerns

1. **ScoreRing color-only differentiation**: Score colors use hue changes (red → amber → green → gold) but no additional text or icon indicators for colorblind users
2. **AnimatedNumber**: Count-up animation creates reflow but screen readers may miss final value
3. **Modal scroll lock**: `Modal.tsx` sets `overflow: hidden` on body but doesn't manage focus trapping
4. **Small touch targets**: Some button sizes are `text-[9px]` and `px-2 py-1` (~20px height) — below recommended 44px touch target
5. **Font readability**: Playfair Display at small sizes for body text in cards reduces readability

---

## Component Audit

### Duplicate Components

| Group | Count | Files | Recommendation |
|-------|-------|-------|----------------|
| **Navigation** | 4 | `Navbar.tsx`, `AppDock.tsx`, `BottomNav.tsx`, `MobileNav.tsx` | Remove BottomNav, MobileNav. Keep AppDock + Navbar |
| **Profile Editor** | 2 | `EditProfileModal.tsx`, `ProfileForm.tsx` | Merge into single ProfileEditor with field configuration |
| **Score Display** | 3 | `ScoreBadge.tsx`, `ScoreRing.tsx`, `VerdictCard.tsx` (built-in) | ScoreBadge and ScoreRing serve different purposes — keep both |
| **Modal Variants** | 4 | `Modal.tsx`, `CommentModal.tsx`, `ConfirmModal.tsx`, `EditPostModal.tsx` | All extend Modal. Keep Modal as base, compose for others |
| **Spinner Variants** | 3 | `Spinner.tsx` (heart/sparkle/skeleton) | Single component — acceptable |
| **Avatar Components** | 2 | `Avatar.tsx`, `AvatarPicker.tsx` | Different concerns — acceptable |

### Dead/Unused Code

| File | Issue |
|------|-------|
| `StoryCard.tsx` — variants A, B, D, E, F, G branches | Only "C" and the fallback variant are ever invoked. 6 dead code paths |
| `BottomNav.tsx` | Likely replaced by AppDock |
| `MobileNav.tsx` | Likely replaced by AppDock |
| `ProfileForm.tsx` | Duplicates EditProfileModal — only 1 caller? |
| `EditPostModal.tsx` | The edit page redirects to post detail — this component may never render |
| `ShareTemplates/` directory | Empty — no template files |
| `FondCalendar.tsx` | Only referenced in signup? Limited usage |
| `test-particles/page.tsx` | Developer testing page, served publicly |

### Component Complexity Warning

**`dashboard/page.tsx`** (581 lines) — Most complex page in the app:
- 6 `useState` calls
- 3 `useEffect` calls
- 4 `useQuery` calls
- 2 fetch functions
- Inline components (`AnonymousToggle`)
- Massive return with 6 editorial card variants using complex inline logic
- **An `any` cast** at line 245: `(post.profile as any)?.country`

---

## API & Logic Audit

| Issue | Severity | File | Problem |
|-------|----------|------|---------|
| First-post detection always true | Critical | `PostForm.tsx:138` | `|| true` makes every post a "first post" |
| Leaderboard cache disabled | High | `leaderboards/route.ts` | Every request recomputes averages across all posts |
| Views count race condition | High | `posts/[id]/view/route.ts` | Read-then-write non-atomic increment |
| Post limit uses timezone offset | Medium | `posts/route.ts` | `timezone_offset_minutes` required but may be undefined |
| Comment votes set, not increment | Medium | `comments/[commentId]/route.ts` | `votes` operation directly sets count instead of incrementing |
| User search ILIKE + admin client | Medium | `users/search/route.ts` | Uses admin client bypassing RLS for search — searches via email link |
| Premium bypass via API | Medium | `payments/razorpay/verify/route.ts` | Verifies payment but `handleUpgradeToPremium` in PostForm calls PATCH without payment |
| Notifications incomplete | Medium | Type definition | Notification type def missing `post_like` and `post_comment` |
| Subscription column check unclear | Low | `users/route.ts` | Special error handling for `PGRST204` when `is_premium` column missing |

---

## Technical Debt

| Item | File(s) | Impact | Effort |
|------|---------|--------|--------|
| **`any` types** | `dashboard/page.tsx`, `EditProfileModal.tsx`, `StoryCard.tsx` | Type safety bypassed | Low |
| **`console.log` in production** | `dashboard/page.tsx:28`, `EditProfileModal.tsx:52` | Data exposure | Low |
| **Dead navigation** | `BottomNav.tsx`, `MobileNav.tsx` | Bundle bloat | Low |
| **Unused StoryCard variants** | `StoryCard.tsx` (A, B, D, E, F, G) | Code noise, 100+ LOC | Low |
| **loading.tsx returns null** | `loading.tsx` | No loading feedback | Low |
| **Hardcoded polling interval** | `NotificationBell.tsx` | 30s interval hardcoded | Low |
| **Duplicate score color logic** | `format.ts:15-27`, `mock-data.ts:42-47` | Inconsistent thresholds | Medium |
| **Empty ShareTemplates dir** | `share/ShareTemplates.tsx` | Missing 14 templates | High |
| **Profile editing split** | `EditProfileModal.tsx`, `ProfileForm.tsx` | Code duplication | Medium |
| **Hardcoded API limit: 50** | `confessions/route.ts`, `explore/route.ts` | Magic numbers | Low |
| **Edge middleware runs on all routes** | `middleware.ts` | Stripe/health pages excluded but could be optimized | Low |

---

## Enhancement Recommendations

### 1. Fix Welcome Ceremony Overlay (Critical Bug)
**Problem:** `PostForm.tsx:138 — `const isFirst = !result.post.created_at || true` makes every post trigger the 5-second cinematic welcome animation.

**Impact:** 50th+ time users see a full-screen animation on every new post.

**Fix:** 
```tsx
// Check if this is the user's first post
const { data: existingPosts } = await supabase
  .from('posts')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId);
const isFirst = existingPosts.length === 0;
```

### 2. Unify Score Display System
**Problem:** Score colors (format.ts), tier labels (mock-data.ts tierForScore), and scoreColor (mock-data.ts) use different thresholds. The color says "high" while the tier says "Gold Standard" — visually confusing.

**Fix:** Create a single `src/lib/scoring.ts` module:
```ts
export const SCORE_THRESHOLDS = { high: 75, legendary: 92, max: 100 };
export function getScoreTier(score: number) { ... }
export function getScoreColor(score: number) { ... }
export function getTierLabel(score: number) { ... }
```
Then delete the duplicates from format.ts, mock-data.ts.

### 3. Standardize Toast to Non-Blocking
**Problem:** Toast.tsx renders a full-screen centered modal that blocks interaction.

**Fix:** Convert to a fixed top-right stack with Z-index 50 (not 100). No backdrop blur. Support multiple simultaneous toasts. Use `pointer-events: none` on container, `pointer-events: auto` on individual toast.

### 4. Consolidate Navigation to Single System
**Problem:** 4 nav components (Navbar, AppDock, BottomNav, MobileNav) with overlapping purposes.

**Fix:** Remove BottomNav.tsx and MobileNav.tsx. Keep AppDock as mobile primary nav. Keep Navbar for desktop top nav. Ensure AppDock rendering in ClientLayoutWrapper doesn't double-render.

### 5. Remove StoryCard Dead Variants
**Problem:** 6 of 7 StoryCard variants (A, B, D, E, F, G) are never invoked. Only `'C'` and the default fallback are used.

**Fix:** Delete all unused variant branches. Rename Variant C to the primary export. Remove the `variant` prop entirely.

### 6. Enable Leaderboard Caching
**Problem:** `leaderboards/route.ts` has cache disabled. Every leaderboard query re-computes average scores across all posts.

**Fix:** Re-enable the Upstash Redis cache integration. Consider adding a trigger to invalidate cache on post creation (already wired in `usePosts.ts` on mutation success).

### 7. Fix `any` Type Usage
**Problem:** Multiple components use `as any` casts instead of proper typed access.
- `dashboard/page.tsx` — `(post.profile as any)?.country`
- `EditProfileModal.tsx` — `currentProfile: any`

**Fix:** Extend the `Post` and `Profile` types to include joined fields properly. Add country, comments_count, views_count to the Post type.

### 8. Complete Share Feature
**Problem:** ShareStudio + ShareTemplates system is partially built. ShareTemplates directory is empty. "Share to Story" button has no actual integration.

**Fix:** Either implement the 14 visual templates referenced in `ShareTemplates.tsx`, or remove the feature entirely and use a simpler link-sharing approach.

### 9. Add Notifications for Post Interactions
**Problem:** The notification system only handles connection/circle events. `post_like` and `post_comment` notification types are in the test route but not in the type definition or database schema.

**Fix:** Add `post_like` and `post_comment` to the notification type enum. Implement notification creation in the like/comment API routes.

### 10. Consolidate Profile Editing
**Problem:** Two profile editing mechanisms with different field sets.

**Fix:** Merge all fields into a single `EditProfileModal.tsx`. Use `ProfileForm.tsx` as the mobile/inline variant if needed, sharing a common form schema.

---

## Action Plan

### Immediate (Fix bugs — 1-2 days)

1. **🔴 Critical: Fix first-post detection** — `PostForm.tsx:138`, remove `|| true`
2. **🔴 Critical: Fix Toast blocking** — Convert to non-blocking corner pattern
3. **🟡 Console.log removal** — `dashboard/page.tsx:28`, `EditProfileModal.tsx:52`
4. **🟡 Remove dead nav files** — `BottomNav.tsx`, `MobileNav.tsx` (verify rendering)
5. **🟡 Enable leaderboard cache** — Re-enable Upstash Redis

### High Impact (Improve UX — 3-5 days)

6. **🟡 Unify score system** — Single `src/lib/scoring.ts` module, remove duplicates
7. **🟡 Remove StoryCard dead variants** — Keep only Variant C
8. **🟡 Add post interaction notifications** — `post_like`, `post_comment` types
9. **🟡 Fix `any` types** — Extend database.ts, clean up casts
10. **🟡 Reduce dashboard cognitive load** — Collapse insight carousel to 3 editorial cards max

### Consistency (Design system — 3-5 days)

11. **🔵 Standardize border radius usage** — Replace `rounded-[2rem]` and custom radii with theme tokens
12. **🔵 Expose shadow tokens in Tailwind config** — Add `shadow-glow`, `shadow-gold` to `tailwind.config.ts`
13. **🔵 Convert hardcoded gradient hexes** — Use CSS variables in `text-gradient-gold` and `text-gradient-crimson`
14. **🔵 Consolidate profile editing** — Merge EditProfileModal + ProfileForm
15. **🔵 Fix color-threshold sync** — Ensure score colors match tier names

### Refactoring (Technical debt — 3-5 days)

16. **⚪ Complete Share feature or remove** — ShareTemplates directory or cleanup
17. **⚪ Fix loading.tsx** — Add proper animation instead of `null`
18. **⚪ Extract magic numbers** — Poll intervals, API limits to constants
19. **⚪ Fix views race condition** — Use Supabase `rpc()` for atomic increment
20. **⚪ Fix comment votes** — Use increment instead of set

---

## Evidence Index

| Finding | Evidence File | Line |
|---------|---------------|------|
| First-post detection broken | `src/components/posts/PostForm.tsx` | 138 |
| Toast is blocking modal | `src/components/ui/Toast.tsx` | 37-57 |
| console.log production data | `src/app/dashboard/page.tsx` | 28 |
| console.error no user feedback | `src/components/profile/EditProfileModal.tsx` | 52 |
| Score color vs tier mismatch | `src/lib/utils/format.ts`, `src/lib/mock-data.ts` | 15-27, 42-47 |
| Nav dead code | `src/components/layout/BottomNav.tsx`, `MobileNav.tsx` | Both files |
| StoryCard unused variants | `src/components/ui/StoryCard.tsx` | 16-17, 358-391 |
| Leaderboard cache disabled | `src/app/api/leaderboards/route.ts` | Comment |
| Views race condition | `src/app/api/posts/[id]/view/route.ts` | 14-20 |
| Notifications incomplete | `src/types/database.ts` | 221-225 |
| Premium bypass | `src/components/posts/PostForm.tsx` | 83-97 |
| Profile editor duplication | `EditProfileModal.tsx`, `ProfileForm.tsx` | Both files |
| Hardcoded gradient hexes | `src/app/globals.css` | 259-283 |
| `any` type usage | `src/app/dashboard/page.tsx` | 245, 456 |
| Tailwind config missing shadows | `tailwind.config.ts` | — |
| Empty ShareTemplates | `src/components/share/ShareTemplates/` | Directory |
| loading.tsx returns null | `src/app/loading.tsx` | — |
