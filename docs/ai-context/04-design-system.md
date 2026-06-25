# Design System: Fond

## Design Philosophy

Fond's visual identity is **luxury romance meets competitive sport**. It combines:
- **Warm rose/blush palette** with gold accents (romance)
- **Glassmorphism** with heavy backdrop blur (modern, tactile)
- **Velvet midnight dark mode** (members-club, intimate)
- **Cursive/italic display fonts** (elegance)
- **Score/drama language** (competition)

The aesthetic is intentionally not minimalist — it's maximalist within constraints.

---

## Colors

### CSS Variable Convention
All colors use RGB format to support Tailwind opacity:
```css
--primary: 209 47 88;  /* Used as rgb(var(--primary) / <alpha-value>) */
```

### Color Tokens

| Token | Light | Dark | Hex (Light) | Hex (Dark) |
|-------|-------|------|-------------|-------------|
| `--background` | 252 250 248 | 22 12 18 | #FCFAF8 | #160C12 |
| `--surface` | 255 255 255 | 30 16 23 | #FFFFFF | #1E1017 |
| `--elevated` | 249 246 244 | 40 22 32 | #F9F6F4 | #281620 |
| `--foreground` | 34 31 32 | 250 245 243 | #221F20 | #FAF5F3 |
| `--primary` | 209 47 88 | 238 106 140 | #D12F58 | #EE6A8C |
| `--gold` | 199 169 107 | 220 190 120 | #C7A96B | #DCBE78 |
| `--blush` | 255 182 193 | 255 140 160 | #FFB6C1 | #FF8CA0 |
| `--border` | 234 228 225 | 75 45 55 | #EAE4E1 | #4B2D37 |
| `--muted-foreground` | 107 100 103 | 180 160 168 | #6B6467 | #B4A0A8 |

### Score Colors

| Token | Threshold | Light | Dark |
|-------|-----------|-------|------|
| `--score-low` | < 55 | #D65C5C | #EB6E73 |
| `--score-mid` | 55-74 | #DE9952 | #EBA564 |
| `--score-high` | 75-91 | #50A078 | #64B491 |
| `--score-legendary` | 92+ | #C7A96B | #DCBE78 |

### Semantic Colors

| Token | Light | Dark |
|-------|-------|------|
| `--destructive` | #E65A5A | #EB6E73 |
| `--success` | #37B26C | #50BE7D |
| `--warning` | #F0A94A | #F5B45F |

### Tailwind Mapping
All color tokens are mapped in `tailwind.config.ts`:
```ts
colors: {
  primary: { DEFAULT: "rgb(var(--primary) / <alpha-value>)", foreground: "..." },
  gold: "rgb(var(--gold) / <alpha-value>)",
  blush: "rgb(var(--blush) / <alpha-value>)",
  "score-low": "rgb(var(--score-low) / <alpha-value>)",
  // etc.
}
```

### Known Issues
1. `--secondary` and `--muted` are identical to `--elevated` in light mode — no distinct accent
2. `text-gradient-gold` and `text-gradient-crimson` use hardcoded hex values instead of CSS variables
3. Dark mode glass variants use hardcoded `rgb(22 12 18 / ...)` instead of variable references

---

## Typography

### Font Stacks

| Role | Font | CSS Variable | Fallback |
|------|------|-------------|----------|
| Body / UI | DM Sans | `--font-sans` | system-ui, sans-serif |
| Display / Headings | Playfair Display | `--font-display` | Georgia, serif |
| Score Numbers | Bebas Neue | `--font-score` | sans-serif |

### Font Loading
Fonts are loaded via `next/font` in `src/app/layout.tsx`:
```tsx
const dmSans = localFont({ src: './fonts/GeistVF.woff', variable: '--font-sans' });
```
Note: The CSS comment says DM Sans, but the font file loaded is GeistVF.woff (Vercel's Geist font). This discrepancy should be resolved.

### Usage Rules
- **Body text:** `font-sans` (DM Sans/Geist)
- **Headings h1-h4:** `font-display` (Playfair Display), italic, negative letter-spacing
- **Score numbers:** `font-score` (Bebas Neue), large sizes, `.02em` letter-spacing
- **Small labels/meta:** uppercase, tracking-wider, `text-[9px]` or `text-[10px]`
- **UI copy:** `text-[10px] uppercase tracking-[0.2em]` is the de facto pattern

### No Type Scale
Fond does not have a formal type scale. Text sizes are applied per-component:
- `text-xs` through `text-8xl` used ad-hoc
- No semantic text style tokens (e.g., `text-body`, `text-heading-1`)
- The same element type (card title) may be `text-lg` or `text-xl` depending on context

---

## Spacing

No formal spacing scale. Common patterns:
- Page sections: `px-6` horizontal, `py-12` or `py-20` vertical
- Cards: `p-4 sm:p-6 lg:p-8`
- Grids: `gap-4` or `gap-5` or `gap-8` (inconsistent)
- Buttons: `px-4 py-2` (sm), `px-6 py-3` (md), `px-8 py-4` (lg)

---

## Glass System

5 levels defined in `globals.css`:

| Class | Backdrop Blur | Opacity | Use Case |
|-------|---------------|---------|----------|
| `.glass` | None | 100% (solid) | Basic cards |
| `.glass-1` | blur(10px) | 35% surface | Buttons, chips |
| `.glass-2` | blur(20px) | 40% surface | Widgets, panels |
| `.glass-3` | blur(30px) | 45% surface | Modals, sheets |
| `.glass-dock` | blur(50px) | 40% surface | Navigation bars |

All glass levels use `backdrop-filter: blur() saturate()`, inset border highlights, and layered box-shadows.

---

## Shadows

Two shadow tokens defined in CSS but **not exposed in Tailwind config**:

```css
--shadow-glow: 0 4px 24px -4px rgba(209, 47, 88, 0.15);
--shadow-gold: 0 4px 20px -4px rgba(199, 169, 107, 0.15);
```

Some components use them as `shadow-[var(--shadow-glow)]`. Others reference `shadow-glow` as a Tailwind utility (which requires the `shadow-glow` key in tailwind.config.ts — verify this is actually working).

---

## Border Radius

| Token | Value | CSS | Common Usage |
|-------|-------|-----|-------------|
| `--radius` (lg) | 0.875rem (14px) | `rounded-lg` | Root radius reference |
| md | calc(0.875rem - 2px) | `rounded-md` | Form elements |
| sm | calc(0.875rem - 4px) | `rounded-sm` | Small elements |
| — | 12px | `rounded-xl` | Inputs, tab bars |
| — | 16px | `rounded-2xl` | Cards, buttons |
| — | 24px | `rounded-3xl` | Modals, large cards |
| — | 32px | `rounded-[2rem]` | StoryCard, hero cards |
| — | 9999px | `rounded-full` | Buttons, pills, badges |

**Inconsistency:** Same card types use different radii:
- `Card.tsx` uses `.glass` which does not set a border radius (inherits none)
- `StoryCard.tsx` uses `rounded-[2rem]` and `rounded-3xl`
- `VerdictCard.tsx` uses `rounded-3xl`

---

## Gradients

### Text Gradients (hardcoded hex values)

```css
.text-gradient-gold {
  background: linear-gradient(135deg, #E8C86A, #D4A843);
  -webkit-background-clip: text;
}
.text-gradient-crimson {
  background: linear-gradient(135deg, #FF5E7D, #FFB3C6);
  -webkit-background-clip: text;
}
```

**Issue:** These use hardcoded hex values, not CSS variables. Dark mode variants also hardcode values.

### Background Gradients (used ad-hoc)
Various components use inline `bg-gradient-to-*` with hardcoded colors (e.g., `bg-gradient-to-br from-fuchsia-100/50 via-purple-100/30 to-blue-100/50`). No gradient system exists.

---

## Icons

- **Icon Library:** Lucide React
- **Common Usage:** ArrowRight, Sparkles, Heart, Trophy, Users, Globe, Lock, EyeOff, Share2, Pencil, MessageCircle, Plus, X, Settings, Mail, Home, User
- **Custom Icons:** BondIcon (SVG inline in AppDock.tsx), BubblesIcon (SVG inline), SunIcon, MoonIcon (SVG inline)
- **No icon component wrapper** — icons are imported directly from lucide-react

---

## Motion & Animation

### Framer Motion
- **Library:** framer-motion 12
- **Common patterns:** `motion.div`, `AnimatePresence`, `initial/animate/exit`, staggered children
- **Easing:** `[0.16, 1, 0.3, 1]` (custom cubic-bezier — Fond's signature easing) used throughout
- **Duration:** 0.5-0.8s for page transitions, 0.2-0.4s for micro-interactions

### CSS Animations (in globals.css & tailwind.config.ts)

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `shimmer` | 2s | linear | Loading skeleton shine |
| `pulse-glow` | 2.4s | ease-out | FAB button, active elements |
| `float-up` | 0.6s | cubic-bezier(.16,1,.3,1) | Entry animations |
| `marquee` | 120s | linear | Ticker scroll |
| `slide-up` | 0.3s | ease-out | Tailwind utility |
| `fade-in` | 0.2s | ease-out | Tailwind utility |
| `scale-in` | 0.2s | ease-out | Tailwind utility |
| `deep-throb` | 3s | ease-in-out | Score elements |
| `diamond-glint` | 3s | ease-in-out | Gold elements |
| `halo-pulse` | 1s | ease-out | Score reveal rings |
| `particle-drift` | 3s | ease-out | Particle effects |

### Scroll Reveal
CSS-based scroll reveal via `reveal-up` and `reveal-up-stagger` classes with IntersectionObserver (inline script in layout.tsx).

### Page Transitions
- `template.tsx` wraps pages with framer-motion fade + slide
- `PageTransition.tsx` provides an alternate blur transition wrapper

---

## Key Design Rules

1. **ALL buttons use `rounded-full`** — no sharp-cornered buttons
2. **ALL cards use `.glass` base** (or glass-2 for widgets)
3. **Primary CTA uses `bg-primary text-primary-foreground` + `shadow-[var(--shadow-glow)]`**
4. **Small labels use `text-[9px] uppercase tracking-[0.2em] font-bold`**
5. **Headings use `font-display italic`**
6. **Score numbers use `font-score`**
7. **The signature easing curve is `[0.16, 1, 0.3, 1]`** — use this for all custom animations
8. **Dark mode is class-based** (`.dark` on `<html>`) — applied by ThemeProvider
