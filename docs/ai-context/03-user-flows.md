# User Flows

## 1. Authentication Flow

### Sign Up
```
Start: Landing page (/)
  → Click "Get My Score" or "Start For Free"
  → /auth/signup
  → Fill registration form:
      - Full name
      - Username (debounced availability check)
      - Email
      - Password (strength meter: 5 criteria)
      - Confirm password
      - Phone (country code + number)
      - Date of birth (DD/MM/YYYY)
      - Country → State → City (cascading dropdowns)
  → System: Creates Supabase auth user + profile row
  → If has_onboarded === false → redirect to /onboarding
  → If has_onboarded === true → redirect to /dashboard
  → Error: Show inline validation errors
```

### Login
```
Start: Landing page or any protected route
  → Click "Open the App" or auto-redirect
  → /auth/login
  → Enter email + password
  → System: Supabase session created
  → Redirect to /dashboard (or original destination)
  → Error: Show inline error
  → "Forgot password?" → Supabase sends reset email
```

### Protected Route Guard
```
Start: User navigates to /dashboard, /posts, /partners, /profile, /settings, /leaderboards
  → Middleware (/middleware.ts via /lib/supabase/middleware.ts):
      - Checks Supabase session cookie
      - If no session → redirect to /auth/login with ?redirect= param
      - If authenticated → pass through (cookie refresh)
  → ProtectedRoute component also renders as fallback (loading spinner while checking)
  → API routes also check auth server-side
```

---

## 2. Onboarding Flow (8 Steps)

```
Start: New user signup → /onboarding

Step 1 — Intro:
  → Animated "Fond" logo with breathing glow
  → Auto-advances after animation

Step 2 — About You:
  → Avatar picker (2D DiceBear / 3D emoji via AvatarPicker)
  → Username, Age, Gender, Occupation
  → Country, City, Bio

Step 3 — Relationship Status:
  → Single / Dating / Married / It's complicated / Open relationship
  → Determines partner-flow or skip

Step 4 — Partner Introduction:
  → Partner name, emoji, avatar
  → Relationship type (spouse/partner/boyfriend/girlfriend/other)

Step 5 — Goals:
  → Multi-select: "Show off my relationship", "Get date ideas", "Win leaderboards", etc.

Step 6 — Love Languages:
  → Multi-select: Words of affirmation, Acts of service, Gifts, Quality time, Physical touch

Step 7 — Aesthetics:
  → Theme (light/dark)
  → Atmosphere (soft-blush, mesh-rose, vignette-rose, prismatic-rose, aura, minimal)
  → Particle effects toggle
  → Audio background (intro.mp3)

Step 8 — Finale:
  → "You're ready" animation
  → "Go to Dashboard" button
  → Sets has_onboarded = true
  → Redirects to /dashboard
```

---

## 3. Post Creation Flow

### Standard Post
```
Start: AppDock → FAB (+) button
  → /posts/new
  → Verify: Has user selected a partner?
      → If no partner → redirect to /partners/new with message
  → Verify: Has user reached daily limit?
      → Free users: 2 posts/day → show warning + premium upsell
      → Premium: unlimited

  Step 1 — Write:
    → Show partner selection pills
    → Show daily writing prompt (random from 10 prompts)
    → Textarea with ruled-paper aesthetic
    → Public/Private toggle
    → Character feedback (30 char minimum)
    → "Submit for Judgement" button (pulses with detail intensity)

  Step 2 — Loading / "Thinking":
    → Sparkle spinner with cycling phases:
        1. "Analyzing emotional consistency..."
        2. "Analyzing effort patterns..."
        3. "Cross-referencing romance standards..."
        4. "Generating verdict..."
    → Each phase takes ~1.2s

  Step 3 — Verdict:
    → Confetti burst
    → If first post (currently ALWAYS) → "Welcome Ceremony" overlay:
        - Breathing glow
        - Tier emoji + name reveal
        - Score reveal (AnimatedNumber)
        - "See My Verdict" button
    → VerdictCard with:
        - Animated score (#/100)
        - Tier name + emoji
        - AI verdict quote
        - Score breakdown bars (5 dimensions)
        - Suspected Fabrication badge (if flagged)
    → Actions: Share This Verdict, See My New Rank, Back to feed
```

### Flagged Post (AI Rejection)
```
  → AI detects: gibberish, impossible acts, non-gestures, self-promotion, prompt injection, fabrication
  → "Red Card" modal appears:
      - Animated red card visual
      - "Nice try. The AI has read every hallmark movie ever written."
      - "Exhibit A — AI Detector" panel with flagged reason
      - "My bad, let me tell the truth" button → back to writing
```

### Anonymous Confession
```
Start: Anonymous mode ON → FAB (+) button
  → /confessions/new
  → Writing prompts (different from standard posts)
  → Character count feedback
  → Privacy notice
  → Submit → appears in ConfessionsFeed
  → No AI scoring, no partner required
```

---

## 4. Feed Browsing Flow

### Global Feed
```
Start: /dashboard
  → System: Fetches explore posts (GET /api/posts/explore)
  → Shows:
      - Ticker (scrolling leaderboard updates, 120s animation)
      - Editorial widget row 1:
          1. Daily Prompt (rotating by day of week)
          2. Insight Carousel (6 cards: Insight, Warning, Oracle, Head-to-Head, Forecast, LIVE)
          3. The Spotlight (top scorer highlight)
      - Post grid (masonry columns: 1 mobile, 2 tablet, 3 desktop)
  → Each post card (StoryCard):
      - Dual avatar lockup, names, city/time
      - ScoreRing
      - Headline quote
      - AI verdict snippet
      - Action bar: Heart (optimistic), Comment count, Share
  → Click post → /posts/[id]
  → Infinite scroll (pagination)
  → Empty state: "The board is bare" + CTA to create
  → Loading: Spinner with cycling text
```

### Circle Feed
```
Start: /dashboard → toggle "Circles" pill
  → System: Fetches circle feed (GET /api/posts/circle-feed)
  → Same layout as global but filtered to user's circles
  → Empty state: "Your circles are quiet" + link to /circles
```

---

## 5. Leaderboard Browsing Flow

```
Start: /leaderboards or AppDock "Ranks" tab
  → Main leaderboard page:
      - Scope toggles: Country / City / Circle
      - Timeframe: All Time / This Week
      - Animated podium (top 3)
      - Scrollable list with:
          - Rank emoji (🥇🥇🥉 for top 3)
          - Dual-identity row (user x partner)
          - Points badge
          - Rank change indicator
      - Pinned bottom bar: user's rank + rival callout
      - Refetch on scope/timeframe change

Sub-routes:
  → /leaderboards/global — Uses LeaderboardTable
  → /leaderboards/local — Uses LeaderboardTable (requires geolocation)
  → /leaderboards/city — Uses LeaderboardTable
```

---

## 6. Profile Flow

### Own Profile
```
Start: /profile or AppDock "Profile" tab
  → Display:
      - Avatar, full name, username
      - Streak display (fire emoji + count)
      - Bio / Dating philosophy
      - City, age, gender, occupation
      - Stats grid: posts count, avg score, best score, partners
      - Quick actions: Edit Profile, Settings
      - Partners list
      - Verdict archive (scored posts)
      - Archived posts panel (with unarchive)
  → Edit profile: Modal or inline form
```

### Other User's Profile
```
Start: Click username on post card or search
  → /users/[id]
  → Display: Avatar, name, username, city, bio, stats
  → Connection button: none → pending_sent → pending_received (accept/decline) → connected (remove)
  → "Invite to Clique" button
  → Recent verdicts list (public posts)
```

---

## 7. Circles / Bonds Flow

```
Start: /circles or AppDock "Bond" tab
  → Tab bar: Inner Circle / Bonds / Requests

Inner Circle Tab:
  → List of user's circles
  → Create circle form: name, emoji, passcode (optional), expiry
  → Circle card: emoji + name, member count, invite code
  → Click → /circles/[id]:
      - Invite link (copyable)
      - Member list (with kick for creator)
      - Circle leaderboard

Bonds Tab (Connections):
  → List of connected users
  → Each shows avatar, name, city
  → Remove connection option

Requests Tab:
  → Incoming requests (accept/reject)
  → Outgoing requests (pending)

Join Flow:
  → User receives invite code
  → /circles/join/[code]
  → System verifies: code exists, not expired, passcode match, not already member, member count not exceeded
  → Adds user → sends notification to creator
```

---

## 8. Post Detail Flow

```
Start: Click post card → /posts/[id]
  → PostDetail component:
      - Score hero (large ScoreRing)
      - AI feedback card (VerdictCard)
      - Full description
      - Like/comment/views counts
      - Score breakdown bars (5 dimensions)
      - Comments section:
          - Sort: Popular / Recent
          - CommentInput with @mention + emoji picker
          - Threaded comments with upvotes, emoji reactions
          - Edit/delete for owner, report for others
      - Archive button (own posts only)
      - Share button
```

---

## 9. Premium Subscription Flow

```
Start: /premium or premium upsell prompt
  → Show 3 pricing cards: Free, Premium Monthly (₹299), Premium Yearly (₹2,499)
  → Feature comparison table
  → FAQ accordion
  → Click a paid plan:
      - System: POST /api/payments/razorpay/order
      - Razorpay checkout modal opens
      - User completes payment
      - System: POST /api/payments/razorpay/verify
      - On success: confetti animation, profile.is_premium = true
      - On failure: error toast
```

---

## 10. Error Flows

### API Auth Error
```
Request fails with 401
  → API returns { success: false }
  → Component shows error state
  → AuthProvider detects session expiry → redirect to login
```

### Rate Limit / Daily Post Limit
```
User tries to post >2/day (free)
  → PostForm.submit() checks limitReached
  → Warning toast: "Free users can only create up to 2 posts per day"
  → Submit button disabled
  → Premium upsell shown
```

### AI Scoring Failure
```
AI API fails
  → scorePost() falls back to score of 50
  → Post is created with default score
  → No user-facing error (transparent failover)
```

### Payment Failure
```
Razorpay verification fails
  → Toast: "Payment verification failed"
  → User stays on free tier
  → Can retry
```

---

## 11. Empty States

| Feature | Empty State | CTA |
|---------|-------------|-----|
| Global Feed | "The board is bare. Someone has to set the standard." | "Claim your first verdict" |
| Circle Feed | "Your circles are quiet" | "Manage Bonds" |
| Confessions Feed | "No confessions yet. Be the first." | None |
| Partners | None listed in PartnerSelect | "Add a partner" message |
| Notifications | Empty list | None |
| User Search | No results | None |
| Leaderboard (new city) | No data | None |
