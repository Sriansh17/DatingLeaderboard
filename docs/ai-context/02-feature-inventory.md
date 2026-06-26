# Feature Inventory

## Active Features

### 1. AI-Powered Post Scoring
- **Purpose:** Score romantic stories out of 100 across 5 dimensions (thoughtfulness, effort, creativity, emotional weight, authenticity)
- **User Problem:** "Is this actually romantic? How romantic?" — gamifies relationship storytelling
- **Entry Points:** Post creation flow (submission triggers scoring)
- **Related Pages:** `/posts/new`, `/posts/[id]`
- **Related APIs:** `POST /api/ai/score`, `POST /api/posts` (scoring embedded)
- **Related Components:** `PostForm.tsx`, `VerdictCard.tsx`, `ScoreRing.tsx`
- **Dependencies:** DeepSeek API, system prompt in `scoring.ts`

### 2. Feed (Global & Circle)
- **Purpose:** Browse AI-scored posts from all users or circle members
- **User Problem:** "What are other couples doing?"
- **Entry Points:** `/dashboard`, AppDock "Feed" tab
- **Related Pages:** `/dashboard`
- **Related APIs:** `GET /api/posts/explore`, `GET /api/posts/circle-feed`
- **Related Components:** `StoryCard.tsx`, `PostFeed.tsx`, `Spinner.tsx`, `ScrollToTop.tsx`
- **Dependencies:** None

### 3. Leaderboards (Global/City/Local/Circle)
- **Purpose:** Rank couples by average AI score across their posts
- **User Problem:** "How do we compare to everyone else?"
- **Entry Points:** `/leaderboards`, AppDock "Ranks" tab, landing page preview
- **Related Pages:** `/leaderboards`, `/leaderboards/global`, `/leaderboards/local`, `/leaderboards/city`
- **Related APIs:** `GET /api/leaderboards`, `GET /api/circles/[id]/leaderboard`
- **Related Components:** `LeaderboardTable.tsx`, `LeaderboardCard.tsx`, `LeaderboardTabs.tsx`, `RankBadge.tsx`
- **Dependencies:** Upstash Redis (cache, currently disabled)

### 4. Partner Management
- **Purpose:** Add/remove romantic partners for story attribution
- **User Problem:** "I need to define who my partner is for scoring"
- **Entry Points:** `/partners`, AppDock "Partners" tab, post creation
- **Related Pages:** `/partners`, `/partners/new`
- **Related APIs:** `GET/POST /api/partners`, `PATCH/DELETE /api/partners/[id]`
- **Related Components:** `PartnerCard.tsx`, `PartnerForm.tsx`, `PartnerSelect.tsx`
- **Dependencies:** Premium gating (1 partner free, unlimited premium)

### 5. Comments & Reactions
- **Purpose:** Discuss posts with threaded comments, emoji reactions, upvotes
- **User Problem:** "I want to react to this story"
- **Entry Points:** Post card → comment button, post detail page
- **Related Pages:** `/posts/[id]`
- **Related APIs:** `GET/POST /api/posts/[id]/comments`, `PATCH/DELETE /api/posts/[id]/comments/[commentId]`
- **Related Components:** `CommentCard.tsx`, `CommentInput.tsx`, `CommentModal.tsx`
- **Dependencies:** None

### 6. Likes
- **Purpose:** Heart-toggle on posts with optimistic update
- **User Problem:** "I liked this story"
- **Entry Points:** StoryCard heart button, post detail
- **Related APIs:** `POST /api/posts/[id]/like`
- **Related Components:** `StoryCard.tsx` (embedded)
- **Dependencies:** None

### 7. User Profiles
- **Purpose:** Display user info, stats, partners, archived posts
- **User Problem:** "Who is this couple?"
- **Entry Points:** `/profile`, `/users/[id]`, clickable usernames
- **Related Pages:** `/profile`, `/users/[id]`, `/profile/edit`
- **Related APIs:** `GET/PATCH /api/users`, `GET /api/users/[id]`, `GET /api/users/stats`
- **Related Components:** `ProfileHeader.tsx`, `ProfileStats.tsx`, `EditProfileModal.tsx`, `ProfileForm.tsx`
- **Dependencies:** None

### 8. Connections (Bonds)
- **Purpose:** Friend/connection system for building social graph
- **User Problem:** "I want to connect with other couples"
- **Entry Points:** User profile → Connect button, `/circles` → Bonds tab
- **Related Pages:** `/circles`
- **Related APIs:** `GET/DELETE /api/connections`, `POST /api/connections/requests`, `PATCH /api/connections/requests/[id]`
- **Related Components:** `ConnectButton.tsx`
- **Dependencies:** None

### 9. Circles (Cliques/Bonds)
- **Purpose:** Private groups with passcode-protected join, member leaderboards, shared feeds
- **User Problem:** "I want a private leaderboard with my friends"
- **Entry Points:** `/circles`, AppDock "Bond" tab, invite links
- **Related Pages:** `/circles`, `/circles/[id]`, `/circles/join/[code]`
- **Related APIs:** `CRUD /api/circles`, `POST /api/circles/join`, `POST/DELETE /api/circles/[id]/members`
- **Related Components:** `InviteToCliqueModal.tsx`, `UserSearch.tsx`
- **Dependencies:** Connection system

### 10. Anonymous Confessions
- **Purpose:** Anonymous relationship confessions with emoji reactions
- **User Problem:** "I want to vent without anyone knowing it's me"
- **Entry Points:** Dashboard → Anonymous toggle, AppDock → FAB (in anonymous mode)
- **Related Pages:** `/confessions/new`
- **Related APIs:** `GET/POST /api/confessions`, `POST /api/confessions/[id]/react`, `GET/POST /api/confessions/[id]/replies`
- **Related Components:** `ConfessionCard.tsx`, `ConfessionForm.tsx`, `ConfessionsFeed.tsx`, `AnonymousModeProvider.tsx`
- **Dependencies:** None

### 11. Notifications
- **Purpose:** Real-time (polled) notifications for social interactions
- **User Problem:** "Someone connected with me / invited me"
- **Entry Points:** NotificationBell (AppDock), `/notifications`
- **Related Pages:** `/notifications`
- **Related APIs:** `GET /api/notifications`, `POST /api/notifications/read`, `POST /api/notifications/[id]/read`, `GET /api/notifications/unread-count`
- **Related Components:** `NotificationBell.tsx`, `PageBell.tsx`
- **Dependencies:** Polling interval (30s)

### 12. Streaks
- **Purpose:** Track consecutive posting days, restore via premium
- **User Problem:** "I want to keep my streak alive"
- **Entry Points:** Profile page
- **Related APIs:** None (computed client-side via `streak.ts`)
- **Related Components:** `ProfileHeader.tsx` (embedded)
- **Dependencies:** None

### 13. Premium Subscriptions
- **Purpose:** Monetization via Razorpay — unlimited posts, partners, editing
- **User Problem:** "I want more posts and partners"
- **Entry Points:** `/premium`, post limit prompts, multi-partner prompts
- **Related Pages:** `/premium`
- **Related APIs:** `POST /api/payments/razorpay/order`, `POST /api/payments/razorpay/verify`
- **Related Components:** None (page-level)
- **Dependencies:** Razorpay, Supabase

### 14. Onboarding
- **Purpose:** 8-step cinematic first-run experience
- **User Problem:** "I just signed up — what do I do?"
- **Entry Points:** Auto-redirect after signup for new users
- **Related Pages:** `/onboarding`
- **Related Components:** None (page-level, heavy framer-motion)
- **Dependencies:** `intro.mp3` audio

### 15. Share Cards
- **Purpose:** Generate shareable verdict card images (canvas-based)
- **User Problem:** "I want to share my score on Instagram"
- **Entry Points:** Post creation flow → "Share This Verdict", StoryCard → Share button
- **Related Pages:** None (modal)
- **Related APIs:** None (client-side canvas rendering)
- **Related Components:** `ShareCard.tsx`, `ShareStudio.tsx`, `LoveCode.tsx`
- **Dependencies:** `html-to-image` library

### 16. Theme & Atmosphere
- **Purpose:** Light/dark mode + visual atmosphere overlays (6 variants)
- **User Problem:** "I want the app to feel romantic / dramatic"
- **Entry Points:** AppDock → Sparkle button → Atmosphere panel
- **Related Pages:** Global (provider-based)
- **Related Components:** `ThemeProvider.tsx`, `AtmosphereProvider.tsx`, `ThemeToggle.tsx`
- **Dependencies:** localStorage, CSS variables

### 17. PWA Support
- **Purpose:** Installable as mobile app with offline support
- **User Problem:** "I want Fond on my home screen"
- **Entry Points:** Browser install prompt, InstallAppButton
- **Related Pages:** `/manifest.json`, `/sw.js`
- **Related Components:** `InstallAppButton.tsx`, `ServiceWorkerRegister.tsx`
- **Dependencies:** Service Worker API

---

## Partially Implemented Features

### 18. Share Studio (Incomplete)
- **Status:** `ShareTemplates/` directory was **empty** — has been removed. Feature remains skeletal.
- **Components:** `ShareStudio.tsx`, `LoveCode.tsx`
- **Recommendation:** Either implement the 14 template variants or remove the feature.

### 19. Admin/Migration Tooling
- **Status:** Empty `migrate/` directory has been **removed**.

### 20. Premium Bypass
- **Status:** `PostForm.tsx:83-97` has `handleUpgradeToPremium` that calls `PATCH /api/users` with `is_premium: true` directly — no payment verification
- **Risk:** Users can set themselves as premium without paying
- **Recommendation:** Remove this code path or gate behind real payment verification.

---

## Legacy / Dead Features

### 21. LoveBoard Branding
- **Status:** Supabase migration files and references still say "LoveBoard"
- **Files:** Migration SQL files reference "LoveBoard" in comments
- **Recommendation:** Update migration comments.

### 22. Bottom Navigation (Legacy)
- **Status:** `BottomNav.tsx` and `MobileNav.tsx` have been **removed**. AppDock is the single navigation component.

### 23. Test Particles Page
- **Status:** `/test-particles/page.tsx` has been **removed**.
- **Recommendation:** Remove or gate behind dev mode.
