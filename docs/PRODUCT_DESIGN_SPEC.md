# Fond — Product Design Specification (PDS)

> **Your relationship has a score. What's yours?**

---

## 1. Product Vision

### What Fond Is

Fond is a social competition platform where couples post stories about their relationship, an AI judges them, and the world ranks them on a live leaderboard. It is part roast session, part love letter, part scoreboard — and entirely original.

Users describe something their partner did. The AI scores it out of 100, delivers a verdict (funny, brutal, or surprisingly tender), and that score determines their rank against every other couple in their city, country, and the planet.

### What Fond Is Not

- **Not a dating app.** Fond is for people already in relationships. You don't find matches here — you compete with them.
- **Not a journal.** Posts are public by default. The goal is sharing, not private reflection.
- **Not a dashboard.** There are no charts, analytics pipelines, or data tables. Scores are displayed like sports stats, not KPI metrics.
- **Not a messaging app.** There is no chat. Interactions happen through likes, reactions, and rankings.
- **Not enterprise software.** No admin panels, no saas dashboards, no boring CRUD interfaces.

### Product Mission

Make every relationship a little more playful. Give couples a place to celebrate, compete, and laugh at themselves — while an AI keeps score.

### Core Values

| Value | Meaning |
|---|---|
| **Playful competition** | Rankings should be fun, not stressful. The AI roasts everyone equally. |
| **Romantic confidence** | Fond celebrates relationships. Posting requires vulnerability, and we reward that. |
| **Brutal honesty** | The AI doesn't sugarcoat. A low score with a funny verdict is better than a high score with a boring one. |
| **Community over isolation** | Posts are public. Leaderboards are shared. Fond is a social experience, not a private one. |
| **Quality over quantity** | One good post beats ten mediocre ones. The AI rewards detail, thoughtfulness, and specificity. |

### Target Audience

- **Couples aged 20–35** who are active on social media and enjoy sharing their relationship online
- People who find humor in self-deprecation and don't take themselves too seriously
- Competitive couples who want to see how they stack up
- People who enjoy curated, premium digital experiences (vs. generic utility apps)

### Emotional Goals

| Moment | Desired Emotion |
|---|---|
| First visit | Curiosity — "What would my partner score?" |
| Signup | Excitement — "I'm joining something new." |
| First post | Vulnerability + anticipation — "Will the AI be nice?" |
| Verdict reveal | Delight + laughter — regardless of score |
| Seeing rank | Motivation — "I can do better." |
| Daily return | Habit — "What's my streak? Did my rank change?" |
| Premium upgrade | Investment — "This is worth paying for." |

### Long-Term Direction

- Expand from individual couples to social circles (bonds/groups competing internally)
- Seasonal leaderboard resets (monthly champions, hall of fame)
- Rich post types (photo stories, video moments, milestone templates)
- Community features (trending topics, viral verdicts, weekly highlights)
- AI coach mode (personalized suggestions based on post history)

---

## 2. Product Personality

### The Fond Voice

Fond is the friend who roasts you at dinner but has your back. It's confident without being arrogant, playful without being childish, premium without being stuffy.

### Personality Traits

| Trait | How It Shows |
|---|---|
| **Confident** | Bold typography. Direct verdicts. No hedging. |
| **Playful** | Emoji-heavy interactions. Bouncy animations. Witty AI feedback. |
| **Premium** | Glass surfaces. Gold accents. Smooth transitions. Generous spacing. |
| **Romantic** | Rose color palette. Playfair Display italic headlines. Warm gradients. |
| **Competitive** | Leaderboards are central. Rank changes are visible. Streaks matter. |
| **Warm** | Soft shadows. Rounded corners. Blur effects. No harsh edges. |

### What Fond Should Never Feel Like

- **Corporate.** No blue buttons, no sans-serif-only typography, no dense tables.
- **SaaS dashboard.** No sidebar menus, no analytics widgets, no KPI numbers.
- **Childish.** No cartoon illustrations, no bright primary colors, no comic sans.
- **Over-animated.** Animations should enhance, not compete. No spinning logos or unnecessary 3D.
- **Generic.** Every screen should feel unmistakably Fond. If it could be from any app, it's wrong.

---

## 3. Design Principles

### 01. Content First

The relationship story is the hero. Scores, ranks, and UI chrome support the content — they never compete with it. Cards should be generous with space for the user's words. Verdicts should be displayed prominently.

### 02. Motion Explains, Never Distracts

Every animation has a purpose: showing what changed, where something came from, or what the user should focus on. If an animation doesn't answer "what just happened?" it doesn't belong.

### 03. Every Interaction Deserves Feedback

Tapping, hovering, submitting, loading — every action produces an immediate, obvious response. The app should feel alive and responsive, never dead or uncertain.

### 04. Consistency Over Novelty

Use the same button style everywhere. Use the same card pattern everywhere. Use the same animation curve everywhere. Users should never need to re-learn how the app works between pages.

### 05. Progressive Disclosure

Show the most important thing first. Surface secondary actions on hover or tap. Don't overwhelm the user with every option at once. The dashboard should show the user's content first, the world's content second.

### 06. Glass Is Our Signature

Every surface is glass at some level — from `glass-1` (subtle frost) to `glass-dock` (max frost). This is Fond's most distinctive visual trait. Never render a raw, opaque background where glass belongs.

### 07. Mobile-First, Desktop-Full

Design for the smallest screen first, then expand. Navigation that works on a phone (AppDock) should be the same navigation on desktop. Never hide content on mobile — adapt it.

### 08. Scores Are Celebrated, Not Displayed

A score of 85 should feel different from a score of 54. Use color, animation, size, and positioning to make the number feel like an achievement (or a hilarious failure).

### 09. Accessibility by Default

Good design is accessible design. Sufficient contrast, readable font sizes, keyboard navigation, touch targets ≥ 44px, and reduced-motion support are not optional — they're part of the spec.

### 10. Delight Is in the Details

The bounce of a heart icon, the glow of a ranking increase, the shimmer of a loading state, the confetti on a first post — these micro-moments define Fond's character. Invest in them.

---

## 4. Product-Specific Experience: Emotional Journey

### Joining Fond

| Step | Screen | Emotion | Design Response |
|---|---|---|---|
| Landing | `/` | Curiosity | Auto-cycling verdict cards. Bold headline. Social proof ("12,402 couples"). The "Get My Score" CTA pulses gently. |
| Signup | `/auth/signup` | Anticipation | Clean form. Warm rose glow in background. Minimal fields. Progress is visible. The "Create Account" button transforms on valid input. |
| Onboarding | `/onboarding` | Discovery | Cinematic intro with ambient glow. Step-by-step with progress bar. Each step has personality (goals as selectable pills, love languages as toggle chips). Atmosphere selector lets users customize the app's vibe immediately. |
| Completion | `/onboarding` (step 8) | Belonging | "You're all set." Gold CTA with shimmer. The app now feels like *theirs* because they chose the atmosphere. |

### The Verdict Loop

| Step | Screen | Emotion | Design Response |
|---|---|---|---|
| Write | `/posts/new` | Vulnerability | Writing prompt helps overcome blank-page anxiety. Textarea feels like a journal (ruled paper lines). Character counter is playful, not clinical. |
| Submit | `/posts/new` → loading | Anticipation | Submit button pulses as content grows. On click, transitions to shimmering loading state with cycling phrases ("Analyzing emotional consistency..."). |
| Verdict | `/posts/new` → verdict | Delight | Confetti burst. Score animates up. AI verdict is displayed prominently. Share + See My Rank buttons immediately available. |
| Streak | `/posts/new` → streak info | Motivation | "12-day streak. +12% score boost." The streak is presented as a reward, not a metric. |
| Badge | `/posts/new` → badge modal | Surprise | Full-screen badge unlock ceremony with spring animation. The badge flies in from the top. |

### The Rank Experience

| Step | Screen | Emotion | Design Response |
|---|---|---|---|
| View | `/leaderboards` | Competition | Podium animation (1st rises highest, 2nd middle, 3rd lowest). Staggered entry. Your rank is pinned at the bottom with a "gap to next" indicator. |
| Change | Any | Validation / Urgency | Rank increase → green badge "+3" slides in. Rank decrease → subtle red indicator. No change → idle state. |
| Self | `/leaderboards` | Focus | Your entry is highlighted in the list AND pinned at the bottom. The "one post closes the gap" callout creates urgency. |

### The Daily Habit

| Trigger | Emotion | Design Response |
|---|---|---|
| Streak visible on dashboard | Pride | Flame icon with streak count. "+X% score boost" shown prominently. |
| Daily perk available | Excitement | Gift icon pulses. Claim button is gold gradient. The perk is a mystery (random each day). |
| Streak at risk | Urgency | Evening toast: "Your 12-day streak is almost over." Soft, not pushy. |
| Badge unlocked | Achievement | Full-screen ceremony. Badge springs in. Confetti. Claim button with satisfying hover scale. |

---

## 5. Interaction Patterns

### Likes

- Optimistic update: the heart fills immediately on tap
- Bounce animation: scale 1 → 1.3 → 1 over 400ms (spring stiffness: 300, damping: 25)
- Count animates from previous to new value
- Error rollback is invisible to the user (heart returns to previous state)
- Double-tap within 800ms consolidates (prevents rapid toggle jitter)

### Ranking

- Rank changes are computed by comparing current position against a cached daily snapshot
- Moving up: entry slides up, green accent pulse on the rank number
- Moving down: entry slides down, subtle red shift
- No change: no animation, just stable positioning
- The user's own rank change is the most important — it gets the strongest visual treatment

### Navigation

- The AppDock is the primary navigation on all authenticated pages
- Active tab uses a `layoutId`-based sliding pill animation
- Tab switching is instant (no crossfade)
- Page transitions use the template.tsx fade+slide pattern
- Forward navigation (deeper) slides up. Back navigation slides right.

### Post Submission

- The submit button transforms based on content completeness:
  - Empty: disabled, neutral
  - Some text: gentle pulse glow, "starting to look good"
  - Good detail (200+ chars): stronger glow, more confident appearance
- On click: the button area morphs into the loading state (no jarring cut)
- Loading state: shimmering gold sparkle with cycling text phases
- On success: confetti burst + score animation + verdict card fades in
- On error (flagged): red card modal with humorous "Exhibit A" styling

### Modals

- Overlay fades in over 300ms
- Content scales in (0.97 → 1.0) with blur reducing (20px → 0) over 500ms
- Closing: reverse animation, faster (300ms)
- Escape key closes. Click-outside closes. Body scroll is locked.
- The close button is always visible and accessible

### Confirmation Dialogs

- Used for destructive actions (delete post, leave circle, remove connection)
- Icon + title + message + Cancel + Confirm buttons
- The confirm button is always right-aligned in the button row
- Cancel is always the secondary/outline style
- The variant determines the icon and button color (danger → red, warning → amber)

### Copy Actions

- Copy invite link: button shows checkmark animation after copy
- The checkmark icon replaces the copy icon for 2 seconds, then reverts
- A toast confirms the action

### AI Interactions

- Loading: cycling text with a pulsing gold sparkle
- The phrases build narrative: "Analyzing emotional consistency..." → "Analyzing effort patterns..." → "Cross-referencing romance standards..." → "Generating verdict..."
- Each completed phase shows a checkmark, creating a sense of progress
- The verdict reveal is always accompanied by confetti, regardless of score

---

## 6. UX Writing Guide

### Tone of Voice

| Context | Tone | Example |
|---|---|---|
| Empty state | Playful + encouraging | "The board is bare. Someone has to set the standard. Make it you." |
| Error | Direct + helpful | "Failed to save. Check your connection and try again." |
| Success | Warm + celebratory | "Post created! The algorithm has a new favorite." |
| AI verdict | Brutal + funny | "Your partner remembered your coffee order. Groundbreaking. 72/100." |
| Onboarding | Warm + guiding | "Choose your vibe. You'll live in it." |
| Confirmation | Clear + concise | "Delete this post? This can't be undone." |
| Streak | Motivating | "3-day streak. +3% score boost. Keep it going." |
| Premium | Aspirational | "Unlimited posts. Unlimited partners. Unlimited flex." |

### Error Message Patterns

- Always explain what happened
- Always offer a path forward
- Never blame the user
- Skip technical jargon

```
Don't: "500 Internal Server Error"
Do:   "Something went wrong on our end. Try again."
```

```
Don't: "Validation failed: description field is required"
Do:   "Add a few more details before submitting."
```

### Empty State Patterns

- Heading: short, thematic
- Body: conversational, slightly playful
- CTA: clear next step

Examples:

```
Heading: "No verdicts yet."
Body: "The board is waiting to judge. One post changes everything."
CTA:  "Claim your first verdict"
```

```
Heading: "Your bonds are quiet"
Body: "Join or create a bond to see posts from your group here."
CTA:  "Manage Bonds"
```

---

## 7. Future Feature Decision Framework

Before building any new feature, the team must answer these questions:

### Product Fit

1. Does this feature reinforce Fond's core loop (post → score → rank → repeat)?
2. Does it make the product more playful, premium, or competitive?
3. Does it increase daily engagement or retention?
4. Does it simplify or complicate the user experience?
5. Can the current UI support it without a redesign?

### Design Fit

6. Does it use the existing design system (glass, rounded, rose + gold)?
7. Does it require new components or can existing ones be composed?
8. Is it consistent with the motion language?
9. Is it accessible (keyboard, screen reader, reduced motion)?
10. Is it responsive across all breakpoints?

### Engineering Fit

11. Does it add unnecessary dependencies?
12. Is the data flow straightforward (API → React Query → UI)?
13. Can it be tested independently?
14. Does it introduce new failure modes?
15. Is the TypeScript typing strict and complete?

### Decision Rules

- A **no** on questions 1, 2, 3, or 5 → reconsider the feature
- A **no** on questions 6, 7, 8, 9, or 10 → the feature needs design work before engineering
- A **no** on questions 11, 12, 13, 14, or 15 → the feature needs engineering review

No feature should be merged unless all questions are answered **yes** or have a documented exception plan.

---

## 8. Decision Log

This section documents significant product decisions and their rationale.

| Date | Decision | Rationale |
|---|---|---|
| 2025-06 | AppDock is the primary navigation | Single navigation system for all breakpoints. Removes Navbar duplication. Bottom dock is mobile-friendly and visually distinctive. |
| 2025-06 | Glass-btn is the canonical button style | All buttons should share the glass aesthetic. No solid-fill buttons. The variant="primary" Button component produces the same visual as glass-btn. |
| 2025-06 | All cards use glass-2 / rounded-2xl | Consistent surface treatment. Only elevated profile panels use rounded-3xl. Standardizes the visual hierarchy. |
| 2025-06 | Scores use Bebas Neue | Distinctive, bold, readable at any size. Differentiates Fond from apps that use standard sans-serif numbers. |
| 2025-06 | Public posts by default | Fond is a social platform. Private posts are supported but not the default. The leaderboard only includes public posts. |
| 2025-06 | No chat or messaging | Fond is not a communication tool. Likes, reactions, and comments are the interaction model. |
| 2025-06 | AI verdicts are always public | The verdict is the content. It's the reason people browse. Private verdicts would break the social loop. |
| 2025-07 | Navbar removed, only AppDock | Dual navigation (Navbar + AppDock) created confusion. AppDock is sufficient for all navigation needs. |

---

*This document is a living specification. Update it as the product evolves.*
