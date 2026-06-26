# Component Catalog

## UI Primitives

### Button
- **File:** `src/components/ui/Button.tsx`
- **Status:** Primary button component — use for ALL buttons
- **Props:** `variant` (primary|secondary|outline|ghost|danger), `size` (sm|md|lg), `loading`
- **Styling:** `rounded-full`, inline spinner on loading state
- **Usage:** Everywhere — landing CTAs, forms, modals, navigation
- **Design rules:** Always `rounded-full`. Primary uses `shadow-[var(--shadow-glow)]`. Disabled = `opacity-50 pointer-events-none`

### Card
- **File:** `src/components/ui/Card.tsx`
- **Props:** `hover` (boolean — adds translateY on hover), `className`
- **Styling:** Uses `.glass` base class (border, bg, shadow)
- **Usage:** Wrapping content sections throughout the app

### Input
- **File:** `src/components/ui/Input.tsx`
- **Props:** `label`, `error`, standard input attrs
- **Styling:** `rounded-xl`, border-border, focus:ring-primary/30
- **Usage:** Forms (profile edit, settings, etc.)

### Textarea
- **File:** `src/components/ui/Textarea.tsx`
- **Props:** `label`, `error`, standard textarea attrs
- **Styling:** Same as Input, non-resizable by default
- **Usage:** Bio fields, contact forms

### Modal
- **File:** `src/components/ui/Modal.tsx`
- **Props:** `isOpen`, `onClose`, `title`, `children`, `className`
- **Styling:** backdrop blur, `rounded-3xl`, glass-3 equivalent
- **Behavior:** Escape key close, scroll lock, framer-motion enter/exit (blur + scale)
- **Usage:** EditProfileModal, CommentModal, ConfirmModal, Flagged post modal

### Avatar
- **File:** `src/components/ui/Avatar.tsx`
- **Props:** `src`, `alt`, `size`, `className`
- **Styling:** Image or gradient circle with initial letter fallback
- **Usage:** Profile headers, comment cards, nav items

### Badge
- **File:** `src/components/ui/Badge.tsx`
- **Props:** `variant` (default|success|warning|danger|info)
- **Styling:** Small inline badge
- **Usage:** Notification counts, status indicators

### Spinner
- **File:** `src/components/ui/Spinner.tsx`
- **Props:** `size` (sm|md|lg|xl), `variant` (heart|sparkle|skeleton), `text` (string or cycling array)
- **Styling:** Animated heart or sparkle with cycling text labels
- **Usage:** Loading states throughout the app

### Toast
- **File:** `src/components/ui/Toast.tsx`
- **⚠️ Known issue:** Blocking full-screen modal — NOT a standard toast pattern
- **Props:** Message, variant (success|error|info|warning), duration
- **Provider:** `ToastProvider` — wraps app root
- **Hook:** `useToast()` — returns `addToast(message, variant, duration?)`

### Tabs
- **File:** `src/components/ui/Tabs.tsx`
- **Props:** `tabs` (Tab[] with id/label/icon), `activeTab`, `onTabChange`
- **Styling:** Segmented control style with rounded pill background
- **Usage:** Circles page, leaderboard scope switcher

### ScoreRing
- **File:** `src/components/ui/ScoreRing.tsx`
- **Props:** `score` (0-100), `size` (default 64)
- **Styling:** SVG circular progress ring with color based on score, `AnimatedNumber` inside
- **Usage:** StoryCard, post detail, feed cards

### VerdictCard
- **File:** `src/components/ui/VerdictCard.tsx`
- **Props:** `score`, `verdict`, `username`, `partnerNickname`, `city?`, `globalRank?`, `suspectedFabrication?`, `compact?`, `explanationStr?`
- **Styling:** Large score display with tier name, AI verdict quote, score breakdown bars, optional "Suspected Fabrication" badge
- **Usage:** Landing page hero, post creation result, leaderboard preview

### StoryCard
- **File:** `src/components/ui/StoryCard.tsx`
- **⚠️ Known issue:** 7 variant system (A-G), only `'C'` and fallback used
- **Props:** `story` (Story), `variant?` (default 'C'), `compact?`, `post?`, `onEdit?`
- **Styling:** Glass card with animated border trace, dual avatar lockup, ScoreRing, headline, AI verdict, action bar
- **Usage:** Dashboard feed, post grid

### AnimatedNumber
- **File:** `src/components/ui/AnimatedNumber.tsx`
- **Props:** `value` (number), `delay?`, `instant?`
- **Behavior:** Count-up animation using framer-motion spring
- **Usage:** Score displays, stat counters

### ThemeToggle
- **File:** `src/components/ui/ThemeToggle.tsx`
- **Usage:** Landing page, AppDock

### PageTransition
- **File:** `src/components/ui/PageTransition.tsx`
- **Props:** Children
- **Behavior:** Blur + fade on route change

### ScrollToTop
- **File:** `src/components/ui/ScrollToTop.tsx`
- **Props:** `label` (string — shown in scroll pill)
- **Behavior:** Appears after scroll threshold, scrolls to top

---

## Layout Components

### AppDock (Primary Navigation)
- **File:** `src/components/ui/AppDock.tsx`
- **Status:** ACTIVE — primary navigation system
- **Tabs:** Feed, Ranks, Bond, Partners, Profile (full mode) / Feed only (anonymous mode)
- **Features:** FAB for new post/confession, Atmosphere panel popover, theme toggle
- **Rendering:** Fixed bottom center, `backdrop-blur-2xl`, animated visibility

### Navbar
- **File:** `src/components/layout/Navbar.tsx`
- **Status:** ACTIVE — desktop top nav
- **Content:** Logo, desktop nav links, user avatar + sign out, hamburger menu on mobile

### ClientLayoutWrapper
- **File:** `src/components/layout/ClientLayoutWrapper.tsx`
- **Purpose:** Renders AppDock conditionally (hides on landing, auth, onboarding), adds bottom padding for dock

### Footer
- **File:** `src/components/layout/Footer.tsx`
- **Status:** Minimal — branding + contact link, mobile only

---

## Feature Components

### Auth

| Component | File | Purpose |
|-----------|------|---------|
| LoginForm | `auth/LoginForm.tsx` | Email/password login with forgot password |
| SignupForm | `auth/SignupForm.tsx` | Full registration with debounced username check, password strength, cascading location dropdowns |
| ProtectedRoute | `auth/ProtectedRoute.tsx` | Route guard — shows spinner while checking, redirects to login |

### Posts

| Component | File | Purpose |
|-----------|------|---------|
| PostForm | `posts/PostForm.tsx` | 3-step post creation: write → loading → verdict |
| PostCard | `posts/PostCard.tsx` | Feed card variant (simpler than StoryCard) |
| PostFeed | `posts/PostFeed.tsx` | Map posts to PostCards with loading/empty states |
| PostDetail | `posts/PostDetail.tsx` | Full post detail with AI feedback, comments, actions |
| ScoreBadge | `posts/ScoreBadge.tsx` | Colored score label ("Amazing!", "Great!", etc.) |
| ShareCard | `posts/ShareCard.tsx` | Canvas-based share image generator |
| EditPostModal | `posts/EditPostModal.tsx` | Premium-gated post editing |
| FlagButton | `posts/FlagButton.tsx` | Report inappropriate posts |

### Partners

| Component | File | Purpose |
|-----------|------|---------|
| PartnerCard | `partners/PartnerCard.tsx` | Partner display with avatar, name, relationship badge |
| PartnerForm | `partners/PartnerForm.tsx` | Add/edit partner with avatar upload, emoji selector |
| PartnerSelect | `partners/PartnerSelect.tsx` | Grid of partner buttons for post creation |

### Profile

| Component | File | Purpose |
|-----------|------|---------|
| ProfileHeader | `profile/ProfileHeader.tsx` | Avatar, name, streak, bio, stats grid |
| ProfileStats | `profile/ProfileStats.tsx` | Posts/avg/best/partners stats |
| EditProfileModal | `profile/EditProfileModal.tsx` | Full profile editor with all fields + avatar upload |
| AvatarSelectionModal | `profile/AvatarSelectionModal.tsx` | Avatar picker grid |

### Leaderboards

| Component | File | Purpose |
|-----------|------|---------|
| LeaderboardTable | `leaderboards/LeaderboardTable.tsx` | Paginated leaderboard list |
| LeaderboardCard | `leaderboards/LeaderboardCard.tsx` | Single leaderboard row |
| LeaderboardTabs | `leaderboards/LeaderboardTabs.tsx` | Local/City/Global scope switcher |
| RankBadge | `leaderboards/RankBadge.tsx` | Rank emoji display |

### Circles & Connections

| Component | File | Purpose |
|-----------|------|---------|
| ConnectButton | `cliques/ConnectButton.tsx` | Connection request button with all states |
| InviteToCliqueModal | `cliques/InviteToCliqueModal.tsx` | Invite user to circle |
| UserSearch | `cliques/UserSearch.tsx` | Debounced user search |

### Confessions

| Component | File | Purpose |
|-----------|------|---------|
| ConfessionCard | `confessions/ConfessionCard.tsx` | Anonymous confession with reactions |
| ConfessionForm | `confessions/ConfessionForm.tsx` | Anonymous submission form |
| ConfessionsFeed | `confessions/ConfessionsFeed.tsx` | Full confessions page layout |

### Notifications

| Component | File | Purpose |
|-----------|------|---------|
| NotificationBell | `notifications/NotificationBell.tsx` | Bell icon with unread count, polls every 30s |

### Share

| Component | File | Status |
|-----------|------|--------|
| ShareCard | `posts/ShareCard.tsx` | Canvas-based share image — functional |
| ShareStudio | `share/ShareStudio.tsx` | Full-screen share editor — **templates missing** |
| LoveCode | `share/LoveCode.tsx` | Branded watermark bar |

---

## Providers

| Provider | File | Purpose |
|----------|------|---------|
| QueryProvider | `providers/QueryProvider.tsx` | TanStack React Query (60s stale, 1 retry, no refetchOnFocus) |
| ThemeProvider | `providers/ThemeProvider.tsx` | Light/dark/system theme with localStorage persistence |
| AuthProvider | `providers/AuthProvider.tsx` | Auth context via Supabase session |
| AtmosphereProvider | `providers/AtmosphereProvider.tsx` | Background gradient/blur overlays + particle effects |
| AnonymousModeProvider | `providers/AnonymousModeProvider.tsx` | Anonymous state (localStorage) |
| ShareProvider | `providers/ShareProvider.tsx` | Share modal state management |

---

## Consolidation Opportunities

| Duplicate Group | Files | Recommendation |
|----------------|-------|----------------|
| **Profile Editors** | EditProfileModal.tsx, ProfileForm.tsx | Merge into single component with field-config prop |
| **Navigation** | BottomNav.tsx, MobileNav.tsx, AppDock.tsx, Navbar.tsx | Remove BottomNav, MobileNav |
| **Score Logic** | format.ts (getScoreColor), mock-data.ts (scoreColor, tierForScore) | Single `src/lib/scoring.ts` module |
| **Modal Variants** | Modal.tsx, ConfirmModal.tsx, CommentModal.tsx | All extend Modal — no separate props needed |
| **StoryCard Variants** | 7 variant branches, only 'C' used | Strip to single variant |
