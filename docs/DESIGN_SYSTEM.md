# Fond — Design System

> The definitive visual language for Fond. Every component, token, animation, and layout rule lives here.

---

## 1. Visual Identity Overview

Fond's visual identity is built on four pillars:

```
GLASS    — All surfaces use the glass system
ROSE     — The primary color is #D12F58 (rose)
GOLD     — Achievement color is #C7A96B
ROUND    — Every corner is generous (rounded-full / rounded-2xl / rounded-3xl)
```

Combined with three fonts (DM Sans for body, Playfair Display for headlines, Bebas Neue for scores) and one animation curve (`[0.16, 1, 0.3, 1]`), these create a consistent, premium, unmistakably-Fond appearance.

---

## 2. Color Tokens

### Token Reference

Tokens are defined as CSS custom properties in `globals.css`. They use the `rgb(R G B)` format to support alpha transparency via Tailwind's opacity modifier syntax (`/ <alpha-value>`).

#### Light Mode

| Token | RGB Value | Hex | Usage |
|---|---|---|---|
| `--background` | `252 250 248` | `#FCFAF8` | Page background |
| `--surface` | `255 255 255` | `#FFFFFF` | Card surface |
| `--elevated` | `249 246 244` | `#F9F6F4` | Hover/tap surface |
| `--foreground` | `34 31 32` | `#221F20` | Primary text |
| `--muted-foreground` | `107 100 103` | `#6B6467` | Secondary text |
| `--primary` | `209 47 88` | `#D12F58` | CTAs, active states, score highlights |
| `--primary-foreground` | `255 255 255` | `#FFFFFF` | Text on primary |
| `--border` | `234 228 225` | `#EAE4E1` | Card borders, dividers |
| `--gold` | `199 169 107` | `#C7A96B` | #1 rank, premium, streaks |
| `--destructive` | `230 90 90` | `#E65A5A` | Delete, errors |
| `--success` | `55 178 108` | `#37B26C` | Positive changes |
| `--warning` | `240 169 74` | `#F0A94A` | Streak risk, soft blocks |
| `--blush` | `255 182 193` | `#FFB6C1` | Subtle highlights, decorative |

#### Dark Mode

| Token | RGB Value | Hex | Usage |
|---|---|---|---|
| `--background` | `22 12 18` | `#160C12` | Page background |
| `--surface` | `30 16 23` | `#1E1017` | Card surface |
| `--elevated` | `40 22 32` | `#281620` | Hover/tap surface |
| `--foreground` | `250 245 243` | `#FAF5F3` | Primary text |
| `--muted-foreground` | `180 160 168` | `#B4A0A8` | Secondary text |
| `--primary` | `238 106 140` | `#EE6A8C` | CTAs, active states |
| `--primary-foreground` | `22 12 18` | `#160C12` | Text on primary |
| `--border` | `75 45 55` | `#4B2D37` | Card borders |
| `--gold` | `220 190 120` | `#DCBE78` | #1 rank, premium |
| `--destructive` | `235 110 115` | `#EB6E73` | Delete, errors |
| `--success` | `80 190 125` | `#50BE7D` | Positive changes |
| `--warning` | `245 180 95` | `#F5B45F` | Streak risk |
| `--blush` | `255 140 160` | `#FF8CA0` | Subtle highlights |

### Score Colors

| Token | Light | Dark | Threshold |
|---|---|---|---|
| `--score-low` | `#D65C5C` | `#EB6E73` | 0–54 |
| `--score-mid` | `#DE9952` | `#EBA564` | 55–74 |
| `--score-high` | `#50A078` | `#64B491` | 75–91 |
| `--score-legendary` | `#C7A96B` | `#DCBE78` | 92–100 |

### Usage Rules

| Role | Token | Notes |
|---|---|---|
| Primary text | `text-foreground` | Never use a hardcoded text color |
| Secondary text | `text-muted-foreground` | All non-primary text |
| Links / CTAs | `text-primary` | Only for interactive elements |
| Delete / Leave | `text-destructive` | Only for destructive actions |
| Success / positive | `text-success` | Rank increase, form success |
| Warning | `text-warning` | Streak risk, approaching limits |
| Cards | `bg-card border-border` | Always use the `glass-2` class |
| Buttons | `glass-btn` | Never use a solid background fill |
| Divider | `border-border` | Consistent 1px borders |
| Hover surface | `hover:bg-elevated` | Subtle highlight on hover |

---

## 3. Typography

### Font Stack

| Role | Font | CSS Variable | Fallback |
|---|---|---|---|
| Body | DM Sans | `--font-sans` | system-ui, sans-serif |
| Display (headlines) | Playfair Display | `--font-display` | Georgia, serif |
| Score numbers | Bebas Neue | `--font-score` | sans-serif |

### Heading Scale

```
h1: font-display text-5xl sm:text-6xl italic text-foreground tracking-tight
h2: font-display text-3xl sm:text-4xl italic text-foreground
h3: font-display text-2xl italic text-foreground
h4: font-display text-xl italic text-foreground
```

All headings use Playfair Display italic. No exceptions.

### Body Scale

```
body:    font-sans text-base text-foreground          (16px)
body-sm: font-sans text-sm text-foreground             (14px)
body-xs: font-sans text-xs text-muted-foreground       (12px)
caption: font-sans text-[10px] uppercase tracking-[0.2em] font-bold
eyebrow: font-sans text-xs uppercase tracking-[0.25em] text-gold font-bold
score:   font-score text-2xl   (scores in context)
score-lg:font-score text-5xl   (hero/leaderboard scores)
score-xl:font-score text-8xl   (verdict reveal)
```

### Font Weight Scale

```
font-sans / DM Sans:
  Regular: 400
  Medium:  500
  Semibold: 600
  Bold:    700

font-display / Playfair Display:
  Regular: 400 (italic)
  Bold:    700 (italic)

font-score / Bebas Neue:
  Regular: 400
```

### Line Heights

```
tight:    1.05     — large display text
leading:  1.1      — h1, h2
snug:     1.3      — h3, h4
normal:   1.5      — body text
relaxed:  1.625    — long-form content (verdicts, descriptions)
```

### Letter Spacing

```
tracking-tight:   -0.01em   — headings
tracking-normal:  0         — body text
tracking-wider:   0.05em    — small caps
tracking-widest:  0.1em     — labels, badges
tracking-[0.25em]:          — eyebrow text (gold section headers)
tracking-[0.2em]:           — captions, small labels
```

### Typography Rules

- **Do** use `font-display italic` for all headings
- **Do** use `text-muted-foreground` for body copy that isn't the primary focus
- **Do** use `font-score` for all score numbers
- **Do** use `text-xs uppercase tracking-[0.25em] text-gold font-bold` for page eyebrow labels
- **Do not** use bold in headings — the italic Playfair is already expressive enough
- **Do not** use underline on links unless the link is inline with body text
- **Do not** use different fonts from the three-family stack

---

## 4. Spacing Scale

Fond uses Tailwind's default spacing scale with some specific patterns enforced.

### Page Padding

| Breakpoint | Horizontal Padding |
|---|---|
| Mobile (< 640px) | `px-4` (16px) |
| Tablet (640px+) | `sm:px-8` (32px) |
| Desktop (1024px+) | Inherits from tablet |

Exception: the landing page uses `px-6` for its wider marketing layout.

### Section Spacing

```
Between major sections:  py-8 md:py-12
Between card groups:     gap-6
Between cards:           gap-4
Within cards:            p-5 sm:p-8
```

### Component Spacing

```
Button padding (sm):  px-4 py-2
Button padding (md):  px-6 py-3
Button padding (lg):  px-8 py-4

Input padding:        px-4 py-2.5
Input icon inset:     left-4

Card padding:         p-5 sm:p-8
Card title margin:    mb-6
Card content gap:     gap-4

Modal padding:        p-6
Modal title margin:   mb-6

List item padding:    px-5 py-4
List item gap:        gap-4
```

---

## 5. Border Radius Scale

```
rounded-full  — 9999px — Buttons, badges, avatars, pills
rounded-3xl   — 1.25rem — Elevated panels, profile cards, modals
rounded-2xl   — 1rem    — Standard cards, containers
rounded-xl    — 0.75rem — Inputs, selects, textareas
rounded-lg    — 0.5rem  — Secondary containers (rarely used)
```

### Usage Rules

| Element | Radius | Notes |
|---|---|---|
| Buttons | `rounded-full` | Always. No exceptions. |
| Cards | `rounded-2xl` | Standard content cards |
| Elevated panels | `rounded-3xl` | Profile panels, settings sections |
| Modals | `rounded-3xl` | All dialogs |
| Inputs | `rounded-xl` | Text inputs, selects, textareas |
| Avatars | `rounded-full` | Always circular |
| Badges | `rounded-full` | Pill-shaped |
| Chips / pills | `rounded-full` | Selection chips, partner chips |
| StoryCards | `rounded-[2rem]` | Signature large radius for posts |

---

## 6. Shadow & Elevation

```
shadow-sm     — 0 1px 2px rgba(0,0,0,0.04)    — subtle cards
shadow-md     — 0 4px 6px rgba(0,0,0,0.06)    — hover state cards
shadow-lg     — 0 10px 15px rgba(0,0,0,0.08)  — elevated panels
shadow-2xl    — 0 25px 50px rgba(0,0,0,0.12)  — modals, sheets

--shadow-glow — 0 4px 24px -4px rgba(209,47,88,0.15)   — primary button glow
--shadow-gold — 0 4px 20px -4px rgba(199,169,107,0.15)  — gold/gradient glow
```

### Usage Rules

| Element | Shadow | Notes |
|---|---|---|
| Default cards | None or `shadow-sm` | Glass cards look good without shadow |
| Hovered cards | `shadow-md` | `hover:-translate-y-0.5` also applies |
| Modals | `shadow-2xl` + backdrop blur | |
| Primary buttons | `shadow-[var(--shadow-glow)]` | Applied via `glass-btn` |
| Gold buttons | `shadow-[var(--shadow-gold)]` | Applied via `glass-btn-gold` |
| AppDock | Custom shadow chain | See `glass-dock` in globals.css |

---

## 7. The Glass System

The glass system is Fond's signature visual treatment.

### Glass Levels

```
glass-1 (subtle frost):
  - Buttons, chips, badges
  - background: rgb(var(--surface) / 0.35)
  - border: 1px solid rgb(var(--foreground) / 0.06)
  - backdrop-filter: blur(10px)

glass-2 (card glass):
  - Cards, panels, sections
  - background: rgb(var(--surface) / 0.4)
  - border: 1px solid rgb(var(--foreground) / 0.07)
  - backdrop-filter: blur(20px)

glass-3 (heavy glass):
  - Modals, elevated sheets
  - background: rgb(var(--surface) / 0.45)
  - border: 1px solid rgb(var(--foreground) / 0.08)
  - backdrop-filter: blur(30px)

glass-dock (max frost):
  - AppDock, navigation bars
  - background: rgb(var(--surface) / 0.4)
  - border: 1px solid rgb(var(--foreground) / 0.08)
  - backdrop-filter: blur(50px)
```

### Glass Button

```
glass-btn:
  - background: rgb(var(--primary) / 0.15)
  - backdrop-filter: blur(16px)
  - border: 1px solid rgb(var(--primary) / 0.25)
  - color: rgb(var(--primary))
  - box-shadow: 0 4px 24px -4px rgb(var(--primary) / 0.15)

  Hover:  background: rgb(var(--primary) / 0.25)
  Active: background: rgb(var(--primary) / 0.35)
```

### Glass Rules

- Every surface should be at one of the glass levels
- Never use a raw `bg-card` without a glass class
- Dark mode reduces opacity slightly (adds `rgb(22 12 18 / ...)` base)
- The `glass` CSS class (without a number) provides a simpler card treatment with just `background-color: var(--card)` and `border: 1px solid var(--border)`

---

## 8. Icons

### Icon System

**Lucide React** is the sole icon library.

### Sizing

| Context | Size | Notes |
|---|---|---|
| Button icons (sm) | `h-4 w-4` | Inline with small button text |
| Button icons (md) | `h-4 w-4` | Inline with medium button text |
| Button icons (lg) | `h-5 w-5` | Inline with large button text |
| Navigation icons | `h-5 w-5 sm:h-6 sm:w-6` | AppDock tab icons |
| Inline with text | `h-3.5 w-3.5` | Beside labels, stats |
| Section headers | `h-4 w-4` | Beside section titles |
| Empty states | `h-12 w-12` to `h-16 w-16` | Large, centered, muted |

### Usage Rules

- Every button should have an icon unless it's a text-only link
- Use the `strokeWidth={2}` default (Lucide default)
- Don't change strokeWidth unless the icon needs to be bolder (`strokeWidth={2.5}` for nav icons)
- Always use semantic names (import by name, not default)
- Don't add a second icon library

---

## 9. Component Standards

### Button

**Purpose**: Primary action trigger for all user interactions.

```
Visual:
  - rounded-full (always)
  - glass-btn (primary) or glass-btn-gold (premium actions)
  - Semibold font weight
  - Gap between icon and text: gap-2

Sizes:
  sm: px-4 py-2 text-sm
  md: px-6 py-3 text-base
  lg: px-8 py-4 text-lg

States:
  Default:  glass-btn state
  Hover:    background intensifies (+0.10 alpha), scale 1.02
  Active:   background intensifies (+0.20 alpha), scale 0.97
  Disabled: opacity-50, pointer-events-none
  Loading:  show spinner, disable interaction

Accessibility:
  - focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
  - Touch target: minimum 44px×44px
  - aria-label when icon has no text

Do:
  - Use for primary actions (submit, save, continue, sign in)
  - Include an icon alongside text
  - Use `touch-target` class on mobile

Don't:
  - Use solid background fills (no bg-primary, no bg-red-500)
  - Use for navigation links (use Link instead)
  - Stack buttons without gap-3 minimum
```

### Card

**Purpose**: Content container for feed items, sections, and panels.

```
Visual:
  - glass-2 (standard) or glass (simple)
  - rounded-2xl (standard) or rounded-3xl (elevated)
  - padding: p-5 sm:p-8

Interaction:
  - Hover: -translate-y-0.5, shadow deepens, border primary tint
  - No hover for static content cards

Accessibility:
  - Cards should be navigable via keyboard when interactive
  - Use role="button" or <a>/<Link> for clickable cards

Do:
  - Use for all content containers
  - Stack with gap-6 between cards
  - Use columns-1 md:columns-2 xl:columns-3 for card grids

Don't:
  - Nest cards (a card inside a card)
  - Use different border-radius for the same card type
```

### Input

**Purpose**: Text entry fields.

```
Visual:
  - rounded-xl
  - border border-border bg-surface
  - px-4 py-2.5 text-base
  - placeholder:text-muted-foreground

States:
  Default:  border-border
  Focus:    border-primary + ring-2 ring-primary/30
  Error:    border-destructive/50 + ring-destructive/30
  Disabled: opacity-50 cursor-not-allowed

Accessibility:
  - Always associate a label (visible or sr-only)
  - Error message below input in text-xs

Do:
  - Use the Input component from components/ui/Input.tsx
  - Show character count for textareas with maxLength

Don't:
  - Use different border-radius for the same type of input
  - Remove focus ring
```

### Modal

**Purpose**: Overlay dialog for focused interactions.

```
Visual:
  - rounded-3xl
  - glass-3 (heavy glass with backdrop blur)
  - max-w-lg, max-h-[90vh]
  - overflow-y-auto for long content
  - Backdrop: bg-black/60 backdrop-blur-md

Interaction:
  - Enter: scale 0.97→1, blur 20px→0, 500ms
  - Exit: reverse, 300ms
  - Escape closes
  - Click-outside closes
  - Body scroll is locked

Structure:
  - Close button (top right): rounded-full with X icon
  - Title: h2 font-display italic
  - Content: children
  - No predefined footer — use inline buttons

Accessibility:
  - focus-trap within modal
  - aria-modal="true"
  - role="dialog"
  - aria-labelledby for title

Do:
  - Use Modal from components/ui/Modal.tsx
  - Keep content focused (don't put too much in one modal)

Don't:
  - Stack modals (modal on top of modal)
  - Use for navigation (the user expects a new page)
```

### Badge

**Purpose**: Status indicator, tag, or label.

```
Visual:
  - rounded-full (pill shape)
  - px-2.5 py-0.5 text-xs font-medium
  - Variants: default / success / warning / danger / info

Variants:
  default:  bg-muted text-muted-foreground
  success:  bg-success/15 text-success
  warning:  bg-warning/15 text-warning
  danger:   bg-destructive/15 text-destructive
  info:     bg-primary/15 text-primary

Do:
  - Use for statuses, counts, categories
  - Use for "Premium", "Creator", "You" labels

Don't:
  - Use for buttons (use the Button component)
  - Stack more than 3 badges in a row
```

### Tabs

**Purpose**: Switch between content categories.

```
Visual:
  - Container: bg-muted rounded-xl p-1
  - Tab: px-4 py-2 rounded-lg text-sm font-medium
  - Active tab: bg-surface text-primary shadow-sm
  - Optional: sliding pill using layoutId

Interaction:
  - Click switches active tab
  - Active tab has sliding indicator (motion.div with layoutId)
  - No hover delay — instant switch

Do:
  - Use for feed switching (Global / Bonds)
  - Keep to 2-4 tabs maximum

Don't:
  - Use for navigation (use AppDock)
  - Use more than 4 tabs
```

### Spinner

**Purpose**: Loading indicator for short waits.

```
Visual:
  - Centered flex column
  - Heart icon (variant="heart") or Sparkle icon (variant="sparkle")
  - Cycling text below (optional)
  - Sizes: sm / md / lg / xl

Usage:
  sm: inline loading (button states)
  md: section loading (default)
  lg: page section loading
  xl: full page loading

Note:
  - For content loading (feed, list, profile), use <Skeleton> instead
  - Only use <Spinner> for button loading states and short operations

Do:
  - Show with contextual text: "LOADING BONDS...", "SYNCING TIMELINE..."
  - Use the heart variant for most contexts (more on-brand)
  - Use the sparkle variant for loading AI verdicts

Don't:
  - Use for page transitions (the template.tsx handles this)
  - Use without context (always show what's loading)
```

### Skeleton

**Purpose**: Loading placeholder that matches content shape.

```
Visual:
  - glass-1 background
  - Shimmer animation (gradient sweep left→right, 1500ms)
  - Same border-radius as the content it replaces

Variants:
  card:     Full card shape (for feed loading)
  profile:  Avatar circle + text lines (for profile loading)
  podium:   3 ascending rectangles (for leaderboard top 3)
  row:      Single list row (for leaderboard list)
  avatar:   Circular placeholder (for avatars)

Usage:
  - Feed loading: 6 skeleton cards
  - Leaderboard: 3 podium + 10 rows
  - Profile: 1 profile skeleton + 6 stat tile skeletons

Do:
  - Match the exact shape and size of the content
  - Use shimmer animation for visual interest

Don't:
  - Use for short operations (< 1s expected)
  - Mix skeleton and spinner on the same page
```

### StoryCard Footer

**Purpose**: Post interaction controls — heart like, emoji reactions, comments, edit, share.

```
Layout:
  ┌──────────────────────────────────────────────┐
  │  ♥ 3  🔥 😭 👀 💀      💬 2  ✏️  📤 Share  │
  │  └── left (scrollable) ──┘ └── right (fixed) ─┘
  └──────────────────────────────────────────────┘

Left section:   Heart + Emoji reactions — scrollable via overflow-x-auto
Right section:  Comment + Edit + Share — fixed position, never pushed by reactions

Visual:
  - Heart: text-destructive when active, fill-destructive
  - Emoji reactions: 50% opacity when inactive, ring+scale when active
  - Comment/Edit/Share: text-muted-foreground, hidden sm:inline labels

Interaction:
  - Heart: optimistic toggle + bounce animation (scale 1→1.3→1)
  - Emoji: optimistic toggle via POST /api/posts/[id]/react
  - Comment: opens CommentModal
  - Share: opens ShareProvider dialog

Do:
  - Keep reactions on the left, actions on the right
  - Both sections use shrink-0 to prevent wrapping
  - Add `overflow-x-auto hide-scrollbar` for narrow cards

Don't:
  - Mix reactions and actions in the same section
  - Allow the right section to wrap below the left
```

### AppDock Sparkles

**Purpose**: Theme toggle (tap) + Atmosphere panel (hover on desktop, sheet on mobile).

```
Desktop:
  - Hover on Sparkles icon → atmosphere popover appears above with 300ms transition
  - Hover bridge extends -top-28 to cover the gap between icon and popover
  - Tap toggles light/dark theme

Mobile (< md):
  - Tap Sparkles icon → bottom sheet slides up with atmosphere controls
  - No hover behavior on mobile

Do:
  - Keep the hover bridge (-top-28) to ensure smooth hover transition
  - The popover uses group-hover/sparkle: naming

Don't:
  - Show hover popover on mobile
  - Use the same interaction for both mobile and desktop
```

### Empty State

**Purpose**: What the user sees when there's no content.

```
Structure:
  - Emoji or illustration (large, centered)
  - Heading (font-display italic text-2xl)
  - Body text (text-muted-foreground text-sm)
  - CTA button (glass-btn)

Tone:
  - Playful, encouraging
  - Never apologetic
  - Always offers a next step

Examples:
  Feed empty:   "The board is bare." → "Someone has to set the standard." → "Claim your first verdict"
  Bonds empty:  "Your bonds are quiet" → "Join or create a bond." → "Manage Bonds"
  Search empty: "No results" → "Try a different search term." → "Search again"

Do:
  - Always include a CTA
  - Match the tone to the page

Don't:
  - Show raw "No data" or empty array messages
  - Leave the page blank
```

---

## 10. Motion Language

### Philosophy

Motion in Fond serves three purposes:

1. **Explain what happened** — rank changes, state transitions, navigation
2. **Provide feedback** — button presses, likes, form submissions
3. **Create delight** — confetti, badge unlocks, streak celebrations

### Easing

```
Primary easing:  cubic-bezier(0.16, 1, 0.3, 1)  — "Fond Ease"
  Used for: All enter/exit animations, transitions, hovers

Spring:           stiffness: 300, damping: 25   — bouncy interactions
  Used for: Hearts, badge drops, scale animations
```

### Duration Scale

```
Micro:    200ms   — hover states, color transitions
Standard: 400ms   — button press, tab switch, toast enter
Enter:    600ms   — page enter, card mount, modal enter
Ceremony: 800ms   — badge unlock, score reveal
```

### Animation Catalog

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Page enter (forward) | Opacity 0→1, y 20→0 | 600ms | Fond Ease |
| Page enter (back) | Opacity 0→1, x 20→0 | 400ms | Fond Ease |
| Card mount | Opacity 0→1, scale 0.98→1, blur 20→0 | 600ms | Fond Ease |
| Card hover | y -2px, shadow deepens | 200ms | Fond Ease |
| Button hover | Scale 1.02 | 200ms | Fond Ease |
| Button press | Scale 0.97 | 100ms | Fond Ease |
| Heart toggle | Scale 1→1.3→1 | 400ms | Spring |
| Modal enter | Scale 0.97→1, blur 20→0 | 500ms | Fond Ease |
| Modal exit | Scale 1→0.97, opacity 1→0 | 300ms | Fond Ease |
| Toast enter | x 80→0, scale 0.95→1 | 250ms | Fond Ease |
| Toast exit | x 0→80, scale 1→0.95 | 250ms | Fond Ease |
| Score count | Number roll 0→N | 1500ms | Fond Ease |
| Podium enter | y 32→0, opacity 0→1 | 550ms | Fond Ease |
| List item enter | y 20→0, opacity 0→1, scale 0.98→1 | 700ms | Fond Ease |
| Badge unlock | Scale 0→1, rotate -20→0 | 600ms | Spring |
| Confetti burst | Particle emit | 3000ms | Physics |
| Skeleton shimmer | bg-position sweep | 1500ms | Linear |
| Tab switch | Sliding pill layoutId | 400ms | Fond Ease |

### Where NOT to Animate

- Navigation tab content should not animate each item on switch
- Form validation errors should not shake
- Scroll animations should not trigger beyond viewport
- Text changes (updating a count) should use AnimatedNumber, not fade transitions

---

## 11. Responsive Strategy

### Breakpoints

```
sm:  640px   — Large phones
md:  768px   — Tablets
lg:  1024px  — Small laptops / landscape tablets
xl:  1280px  — Desktop
2xl: 1536px  — Large desktop
```

### Grid Behavior

| Page | Mobile | Tablet | Desktop |
|---|---|---|---|
| Feed (posts) | 1 column | 2 columns | 3 columns |
| Leaderboard list | full width | full width | full width |
| Profile bento | 1 column | 3 columns | 3 columns |
| Stats grid | 2 columns | 3 columns | 3 columns |
| Bonds grid | 2 columns | 3 columns | 3 columns |

### Navigation

```
Mobile:  AppDock only (bottom fixed)
Tablet:  AppDock only (bottom fixed)
Desktop: AppDock only (bottom fixed)
```

The navigation never changes. AppDock is the sole navigation on all breakpoints.

### Typography Scaling

```
h1:       text-5xl → sm:text-6xl
h2:       text-3xl → sm:text-4xl
Card p:   text-base (mobile same as desktop)
Card gap: gap-4 → sm:gap-6
Section:  py-8 → md:py-12
```

### Touch Targets

All interactive elements must have a minimum touch target of 44×44px. Use the `touch-target` utility class:

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
.touch-target-lg {
  min-height: 48px;
  min-width: 48px;
}
```

---

## 12. Accessibility Standards

### Target Level

WCAG 2.2 AA.

### Color Contrast

- Text on backgrounds: minimum 4.5:1 ratio
- Large text (18px+ / 14px+ bold): minimum 3:1 ratio
- Interactive elements (focus indicators, borders): minimum 3:1 ratio
- Dark mode contrast must also meet WCAG AA

### Focus Indicators

```
All interactive elements:
  focus:outline-none focus:ring-2 focus:ring-primary/50

Inputs, textareas, selects:
  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
```

### Keyboard Navigation

- All interactive elements are reachable via Tab
- Tab order follows visual order (left-to-right, top-to-bottom)
- Escape closes modals, dropdowns, and overlays
- Enter/Space activates buttons and links
- Arrow keys navigate within tab sets and lists

### Reduced Motion

The `motion-safe` and `motion-reduce` Tailwind variants should be used to disable non-essential animations:

```tsx
// Example: skip animation for reduced motion users
className="motion-safe:transition-transform motion-safe:duration-300"
```

### Touch Targets

- All buttons and interactive elements: minimum 44×44px
- Navigation tabs: minimum 44×44px
- Icon-only buttons: minimum 44×44px (use `touch-target` class)
- Links in text: at minimum 44×44px click area

### Screen Readers

- All images have `alt` text
- Icon-only buttons have `aria-label`
- Live regions (`aria-live="polite"`) for dynamic content updates
- Status messages use `role="status"` or `aria-live`
- Modals use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

### Semantic HTML

- Use `<nav>` for navigation regions
- Use `<main>` for primary content
- Use `<article>` for cards/posts
- Use `<section>` for content sections
- Use `<h1>` through `<h6>` for headings (no skipping levels)
- Use `<button>` for actions, `<a>` for navigation

---

## 13. Dashboard Widgets

### Daily Winner

The top-scored post from the last 24 hours, shown as a gold-accented card:

```
Visual:
  - Border: border-gold/20
  - Background: bg-gold/[0.03]
  - Trophy emoji as icon
  - Score in gold with font-score
  - Truncated description
  - "View →" link to the post

Placement:
  - Above "Today's Best" daily leaderboard
  - Below streak bar on the dashboard
  - Only shown when feedTab === 'global'
```

### Streak at Risk Toast

Evening reminder for users with an active streak who haven't posted today:

```
Trigger:
  - Hour >= 18 (6 PM local time)
  - User has streakData.streak > 0
  - streakData.lastPostDate !== today's date

Behavior:
  - Short delay (5000ms) before showing to avoid competing with initial load
  - Toast variant: warning
  - Duration: 8000ms
  - Message: "🔥 Your X-day streak is almost over. One post saves it."
```

### Your Score Card

Compact personal score summary in the dashboard header:

```
Visual:
  - Compact card matching streak bar height and style
  - Color-coded score number (score-low/mid/high/legendary)
  - Post count
  - Comparison vs global average
  - "Above average ↑" or "Below average ↓" indicator

Placement:
  - Below the page header (h1)
  - Above the streak bar
  - Always visible on dashboard
```

---

## 14. Empty States Registry

| Page/Section | Icon | Heading | Body | CTA |
|---|---|---|---|---|
| Dashboard feed (global) | 🏆 | "The board is bare." | "Someone has to set the standard. Make it you." | "Claim your first verdict" |
| Dashboard feed (circles) | 💎 | "Your bonds are quiet" | "Join or create a bond to see posts from your group here." | "Manage Bonds" |
| Profile (posts) | 📜 | "The archives are empty" | "No verdicts yet. The board is waiting to judge." | "Claim your first verdict" |
| Profile (archived) | 🗄️ | "No archived posts." | — | — |
| Partners | 💕 | "No partners yet" | "Add your first partner before submitting a verdict." | "Add a Partner" |
| Circles list | 🌟 | "Your circle is empty" | "Create a bond or join one with an invite code." | "Create Bond" / "Join" |
| Circle leaderboard | 📊 | "No scores yet" | "Members need to create posts first." | — |
| Leaderboard (city) | 🗺️ | "No couples found here" | "No one near you has scored yet. The local throne is unclaimed." | "Submit a Post" |
| Leaderboard (country) | 🌍 | "No couples found here" | "There aren't any entries yet. Claim your spot at the top." | "Submit a Post" |
| Notifications | 🔔 | "No notifications" | "When someone likes your post or sends a request, it'll show up here." | — |
| Search | 🔍 | "No results" | "Try a different name or search term." | — |

---

*This document is the source of truth for Fond's visual design. Every component, page, and interaction should follow these specifications.*
