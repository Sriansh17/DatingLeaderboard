# Design Principles

## UX Principles

### 1. Drama as Feature
Every interaction should feel like a moment. The AI verdict is not "Score: 87/100" — it's a dramatic reading. The post flag is not "Content rejected" — it's a "Red Card." The leaderboard is not "You're #4" — it's "The Spotlight."

**Manifestations:**
- VerdictCard shows a "Verdict №" (random generated number) for mystique
- Scoring has 4 loading phases with cycling dramatic text
- "Red Card" modal animates a card slap-down
- Welcome ceremony is a cinematic overlay, not a toast

### 2. Gamification Everywhere
Scores, streaks, ranks, tiers, and comparisons are embedded in every surface.

**Manifestations:**
- ScoreRing on every StoryCard (constant visibility of score)
- Streak display on profile (loss aversion)
- "Head-to-Head" compares user vs global average
- "The Spotlight" highlights the current #1

### 3. Social Proof First
Always show that others are using the product. Never show an empty state without reassurance.

**Manifestations:**
- Landing page: auto-cycling VerdictCard, leaderboard preview, "12,402 couples ranked globally"
- Dashboard ticker: scrolling live updates
- Ticker icons: "847 stories scored today", "Busted: 3 fabrications detected"

### 4. Glass as Metaphor
The interface is a layered glass surface — cards float above backgrounds with blur and transparency. This supports the "members club / luxury" brand identity.

**Manifestations:**
- Every card uses `.glass`, `.glass-1`, or `.glass-2`
- Dock uses `.glass-dock` (maximum blur: 50px)
- Modals use heavy backdrop blur
- Light mode uses white/rose glass, dark mode uses burgundy-black glass

### 5. Slow Luxe
Animations are deliberately slow (0.5-0.8s) compared to typical micro-interactions (0.15-0.3s). This communicates a premium, unhurried feel.

**Manifestations:**
- Signature easing: `[0.16, 1, 0.3, 1]` — long tail settle
- Page transitions: blur + fade, 0.5s
- Score count-up: delayed start (1.1s pause), spring physics
- Welcome ceremony: 2+ seconds of animation

---

## Interaction Principles

### 1. Optimistic Updates
Prefer showing the result before the server confirms. Revert on error.

**Manifestations:**
- `StoryCard.tsx`: Like/heart toggles immediately, reverts if mutation fails
- `ConfessionCard.tsx`: Reaction counts update optimistically

### 2. Hover as Discovery
Desktop hover states reveal secondary information and actions.

**Manifestations:**
- AppDock: hover shows tab labels, hover on sparkle shows Atmosphere panel
- StoryCard: hover reveals animated border trace
- "The Spotlight" card: hover slides in "View" button
- Cards: hover lifts (translateY) or changes border color

### 3. Feedback Density
Multiple layers of feedback per action:
1. Visual change (immediate)
2. Number change (optimistic)
3. Toast notification (delayed)
4. Sound (planned — `intro.mp3` exists)

### 4. Progress Visibility
Loading states are never just spinners. They show progress through named stages.

**Manifestations:**
- Post scoring: 4 named phases with checkmarks on completion
- Spinner component: cycling text array for any multi-step operation

---

## Visual Principles

### 1. Score Dictates Color
All score displays use the same color mapping:
- < 55: Crimson (danger/improvement needed)
- 55-74: Amber (average/okay)
- 75-91: Jade (good/excellent)
- 92+: Gold (legendary/perfect)

### 2. Gold = Premium
Gold is reserved for premium, achievement, and high-value elements:
- Score-legendary color
- Premium upsells
- Achievement tiers ("Gold Standard")
- Decorative gradients
- Atmosphere panel trigger (sparkle)

### 3. Rose = Romance
Blush/pink/rose tones signal romantic content:
- Primary CTA
- Heart icons
- Background atmosphere options
- Score colors trending warm

### 4. Velvet = Dark Mode
Dark mode inverts the color expectations — warm burgundy-blacks instead of cool grays. The dark background is not a void but a "velvet room."

---

## Accessibility Standards

### Current State: Needs Improvement
- **ScoreRing** uses color-only differentiation (no text fallback for colorblind users)
- **Modal** has Escape-to-close but no focus trapping
- **Touch targets** often below 44px recommended minimum
- **Font readability** at small sizes (9px labels) is below standard
- **AnimatedNumber** may not announce final value to screen readers

### Established Patterns
- All interactive elements have hover and focus states
- Modals have backdrop-click-to-close + Escape key
- Forms show inline validation errors
- Loading states prevent double-submission

---

## Copy & Tone Principles

### 1. The App Speaks Like a Sassbot
The AI verdicts are irreverent, dramatic, and pop-culture-referencing. Non-AI copy (CTAs, labels, helpers) also leans into this tone where appropriate.

**Examples:**
- "Submit for Judgement" (not "Post")
- "Claim your first verdict" (not "Create a post")
- "My bad, let me tell the truth" (flagged post dismissal)
- "The Algorithm Has No Words" (highest tier name)
- "Give the AI something to work with" (length feedback)

### 2. Sports Commentary Language
Leaderboards use competition language consistently:
- "The Spotlight" (top scorer)
- "Head-to-Head" (comparison)
- "System Warning" (low scores)
- "Ranks" (tab label)
- "Secured X Points" (callout)

### 3. Small Labels Use Caps
All meta-information is in uppercase, small font size, wider tracking:
- "INSIGHT", "SYSTEM WARNING", "AI ORACLE"
- "DAILY PROMPT", "THIS WEEK"
- "THE ALGORITHM SPEAKS"

---

## When Adding New UI

Ask these questions before adding any new UI:

1. **Does this have a score?** — Every surface should connect to the scoring/ranking system
2. **Is this dramatic enough?** — Does the animation, copy, or interaction feel like a moment?
3. **Does this use the glass system?** — All cards and containers should use .glass or glass-*
4. **Are all states covered?** — Loading, empty, error, success, edge cases
5. **Does this use the easing curve?** — `[0.16, 1, 0.3, 1]` for any custom animation
6. **Is the button rounded-full?** — All buttons must use `rounded-full`
7. **Is there a toast for this?** — User actions should have feedback
8. **Does this work in both themes?** — Light and dark mode must be tested
