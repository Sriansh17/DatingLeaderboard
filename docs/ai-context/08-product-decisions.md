# Product Decisions

## Brand & Naming

### "Fond" vs "LoveBoard"
- **Decision:** The product was renamed from "LoveBoard" to "Fond" during development
- **Evidence:** Migration SQL files still reference "LoveBoard" in comments; environment variables may still use old naming
- **Rationale:** "Fond" is more distinctive, emotionally resonant, and brandable
- **Status:** Rename is complete in the UI but incomplete in database/documentation artifacts

### "Circles" vs "Bonds" vs "Cliques"
- **Decision:** The feature has been called "Circles" (routes, DB), "Bonds" (AppDock tab label), and "Cliques" (component directory name)
- **Status:** Inconsistent — three names for the same feature
- **UI surface says:** "Bond" (AppDock tab), "Circles" (page title), "Cliques" (file organization)
- **Recommendation:** Choose one (likely "Circle" based on route structure) and consolidate

---

## AI Persona & Scoring

### Why Scoring Has a Personality
- **Decision:** The AI is designed as an entertainment persona, not a utility calculator
- **Rationale:** A dry "87/100 — this was thoughtful" is less shareable than "A man who navigates Mumbai rain for taro milk tea. Rare specimen."
- **Evidence:** The system prompt explicitly creates a sassy, dramatic AI with rom-com references
- **Impact:** Users share verdict cards more than they would with bland scoring

### Why Flagging Exists
- **Decision:** The AI rejects fabricated, impossible, or low-effort posts
- **Rationale:** Ensures leaderboard integrity, prevents spam, creates a "Red Card" drama moment
- **Evidence:** `scoring.ts` guardrails with specific flag reasons

---

## Premium Gating

### Why Free Users Are Limited to 2 Posts/Day
- **Decision:** Post limit is the primary monetization lever
- **Rationale:** Creates a clear free-vs-premium value gap. 2 posts/day is enough to experience the product but not enough for heavy users
- **Impact:** Users who hit the limit are prompted to upgrade

### Why Editing Requires Premium
- **Decision:** Post editing is a premium feature
- **Rationale:** Prevents free-tier users from gaming the system (post, see score, edit to improve)
- **Note:** Archive (soft delete) is free — users can remove posts without editing

### Why Multi-Partner Requires Premium
- **Decision:** Only one partner on free tier
- **Rationale:** Simplifies free tier, creates upgrade motivation for poly/open relationships

---

## Post Privacy

### Why Posts Can Be Public or Private
- **Decision:** Users choose visibility per-post
- **Rationale:** Some gestures are too intimate to share publicly. Private posts still get AI scored but don't appear on leaderboards
- **Evidence:** `is_public` field on posts table

---

## Leaderboard Design

### Why Average Score (Not Total)
- **Decision:** Leaderboards rank by average AI score, not total points
- **Rationale:** Encourages quality over quantity. Prevents spam-posters from dominating
- **Trade-off:** Users with one lucky 95 post beat users with 50 consistent 80s

### Why Minimum 1 Post
- **Decision:** `MIN_POSTS_FOR_LEADERBOARD = 1`
- **Rationale:** Low barrier to entry — encourages new users to try

### Why Cache Is Disabled
- **Decision:** (Likely) Performance optimization was paused during development
- **Impact:** Leaderboard queries are slow on each request
- **Evidence:** Comment in code: `// Cache temporarily disabled`

---

## Anonymous Mode

### Why Anonymous Mode Exists
- **Decision:** A parallel anonymous experience for users who want to engage without identity
- **Rationale:** Caters to lurkers, drama-seekers, and users who want to vent. Increases total engagement even if those users won't post romantically
- **Evidence:** Full feature set (confessions feed, anonymous reactions, anonymous identity hashing)

### Why It Hides the Feed
- **Decision:** In anonymous mode, the dashboard feed is replaced entirely with the confessions feed
- **Rationale:** Clear mental model — "you're in the anonymous space now"
- **Trade-off:** Disorienting for users who want to browse both modes

---

## Streak System

### Why Streaks Matter
- **Decision:** Streaks drive daily engagement and create loss aversion
- **Rationale:** Users who have a 30-day streak are highly unlikely to let it die
- **Evidence:** fire emoji intensity (`getStreakEmoji`), streak restore as premium feature

### Why Streak Freeze Is Premium
- **Decision:** Streak restore (freeze) costs ₹299/yr — 1 freeze/month
- **Rationale:** Creates a low-cost premium hook. Users who break a long streak may pay to restore it

---

## Onboarding

### Why Onboarding Is Cinematic (8 Steps)
- **Decision:** First-run experience is a slow, animated, atmospheric sequence
- **Rationale:** Sets the product's luxury/romance tone immediately. Reduces cognitive load by introducing features gradually
- **Evidence:** Background audio, breathing glow animations, tier reveal

### Why It's Not Skippable (Entirely)
- **Decision:** Users must complete onboarding before accessing the dashboard
- **Rationale:** Ensures users have created a partner → can post immediately. Prevents "I don't get what to do" churn

---

## Circle Invite Flow

### Why Passcodes Exist
- **Decision:** Circles can optionally have a passcode for join
- **Rationale:** Private groups need privacy. Simple passcode is lower friction than admin approval
- **Evidence:** `passcode` field on circles table, join flow checks

### Why 10 Member Limit
- **Decision:** Circles max out at 10 members
- **Rationale:** Keeps circles intimate (like a close friend group). Prevents mega-groups that dilute the leaderboard experience

---

## Share Cards

### Why Canvas-Based (Not Screenshot)
- **Decision:** Share cards are rendered via Canvas/`html-to-image`, not DOM screenshots
- **Rationale:** Canvas gives pixel-perfect control over the output image. Lower quality variance across devices

### Why No Platform Integration
- **Current state:** Share studio exists but template files are missing
- **Apparent decision:** The feature was planned (14 templates referenced in `ShareTemplates.tsx`) but implementation was deferred
- **Impact:** "Share to Story" button has no actual Instagram/Snapchat integration

---

## Razorpay for Payments

### Why Razorpay (Not Stripe)
- **Decision:** Razorpay is the payment processor
- **Rationale:** Target market is India (₹ pricing). Razorpay dominates Indian online payments
- **Evidence:** All prices in INR, Razorpay SDK integration

### Why Premium Bypass Exists in PostForm
- **Decision:** `handleUpgradeToPremium` in `PostForm.tsx` directly sets `is_premium: true` via API
- **Status:** This appears to be a development shortcut that was never removed
- **Risk:** Any authenticated user can set themselves as premium with a direct API call
- **Recommendation:** Remove this code path
