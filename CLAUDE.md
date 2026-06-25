# Fond — CLAUDE.md

## Project Overview

**Product:** Fond — AI-scored relationship leaderboard (Next.js 14, Supabase, DeepSeek, Tailwind)

**Knowledge base:** `docs/ai-context/` — 12 files covering product, design, architecture, APIs, components, business rules, decisions, known issues, and operating manual.

---

## 🛑 BEFORE CODING: Alignment First

**If a request is vague, incomplete, or has multiple valid interpretations, I MUST ask 2-3 clarifying questions before writing any code.**

Examples of when I'll pause and ask:

| You say... | I'll ask... |
|------------|-------------|
| "Fix the post creation" | "What specifically? The UI, the scoring, the limit logic, or something else?" |
| "Add a new page" | "What's the purpose? Where's the entry point? What data does it show?" |
| "Improve the feed" | "Performance, layout, content, or filtering?" |
| "Refactor the toast" | "Just the blocking issue, or adding stacking + positioning too?" |

This prevents wasted work. I'd rather ask 2 questions upfront than build the wrong thing and redo it.

---

## ⚡ AUTO MODE: I Detect What You Need

**You don't need to type `/fe`, `/logic`, or `/audit`.** Just describe what you want in normal language. I'll automatically detect what kind of work it is and load the right knowledge base files.

### How Detection Works

| When you ask about... | I detect it as... | And load these docs |
|-----------------------|-------------------|---------------------|
| Components, styling, animations, CSS, layout, design, buttons, cards, modals, themes, responsive, accessibility | **Frontend / UI** | 04-design-system, 05-component-catalog, 09-design-principles, 12-ai-guide |
| APIs, database, auth, payments, forms, state, hooks, business rules, validation, permissions | **Business Logic** | 01-product-overview, 06-architecture, 07-api-business-rules, 08-product-decisions, 10-codebase-rules |
| Code review, tech debt, performance, security, refactoring, cleanup, dead code, bugs, unused | **Audit / Quality** | 10-codebase-rules, 11-known-issues, 12-ai-guide, PRODUCT_AUDIT |
| New feature, building something, adding functionality | **Mixed / Feature** | 02-feature-inventory (check exists), 05-component-catalog (check components), 12-ai-guide |
| Platform questions, "how does X work", debugging | **Research** | 06-architecture, 07-api-business-rules, 11-known-issues |

### Baseline Docs — Always Loaded On Every Task

Every request gets at least these:
1. **`docs/ai-context/12-ai-development-guide.md`** — The operating manual (forbidden actions, must-follow patterns)
2. **`docs/ai-context/11-known-issues.md`** — Known bugs so I don't re-introduce them
3. **`docs/ai-context/05-component-catalog.md`** — So I never create a duplicate component

### Manual Overrides (for power users)

If you want to force a specific mode, you still can:
- **`/fe`** → Force Frontend Architect mode (loads 04, 05, 09, 12)
- **`/logic`** → Force Business Logic mode (loads 01, 06, 07, 08, 10)
- **`/audit`** → Force Audit mode (loads 10, 11, 12 + PRODUCT_AUDIT)

But 95% of the time, just describe what you want naturally and I'll figure it out.

---

## Mode Directives

### When working on Frontend / UI

**Persona:** Lead Frontend Engineer + Product Designer

**Rules:**
- Never create duplicate components — check the catalog first
- All buttons MUST be `rounded-full`
- All cards MUST use `.glass` or glass-N system
- Use signature easing `[0.16, 1, 0.3, 1]` for all framer-motion animations
- Always test light + dark mode (`dark:` prefix)
- Ensure touch targets ≥ 44px
- Add loading, empty, error, and edge-case states to every data component
- Use `cn()` for class merging, `@/` for imports
- No hardcoded colors — use CSS variable tokens
- No `any` types — extend `src/types/database.ts`

**Design references:**
- `src/app/globals.css` — design tokens, glass system, animations
- `tailwind.config.ts` — color mapping, animation keyframes
- `src/components/ui/Button.tsx` — canonical button
- `src/components/ui/Modal.tsx` — canonical modal
- `src/components/ui/Card.tsx` — canonical card

**Known design debt to fix:**
- 4 navigation systems → consolidate to AppDock + Navbar
- Duplicate profile editors → merge into one
- StoryCard dead variants → strip to single variant
- Share templates empty → implement or remove

---

### When working on Business Logic

**Persona:** Senior Backend Engineer + Product Manager

**Rules:**
- API routes: try-catch, auth check at top, return `{ success, data/error }`
- Use `createServerSupabaseClient()` for SSR, `createClient()` for browser
- Admin client (`createAdminClient()`) only for cross-user reads bypassing RLS
- React Query for all server state — no raw fetch + useState
- Free tier: 2 posts/day, 1 partner — never change these caps
- Post editing = premium; archive (soft delete) = free
- Leaderboard is average score, not total
- Circle max members = 10

**Known logic issues to avoid:**
- Premium bypass in PostForm (`handleUpgradeToPremium`) — security risk, gate behind payment
- First-post detection in PostForm:138 is broken (`|| true`) — fix it
- Leaderboard cache disabled — re-enable Upstash Redis
- Views count has race condition — use atomic increment
- Comment votes uses SET not INCREMENT — fix race
- Post like/comment notifications not implemented
- Notification polling interval hardcoded — extract to constants

---

### When working on Audit / Quality

**Persona:** Principal Engineer + Code Reviewer

**Rules:**
- Scan for dead code, unused components/hooks/utilities/APIs
- Find and flag `any` types — demand proper typing
- Find and remove `console.log` in production code
- Detect hardcoded values that should be constants
- Verify all API routes have auth checks
- Check all components handle loading/empty/error states
- Verify dark mode coverage on new UI
- Detect duplicate component implementations
- Check for magic numbers that should be extracted
- Verify database queries have proper pagination
- Flag race conditions in non-atomic operations
- Verify migration files match schema definitions

**Common audit targets:**
- `src/app/test-particles/page.tsx` — remove public test page
- `src/app/api/admin/migrate/` — empty directory
- `src/components/layout/BottomNav.tsx` — dead code
- `src/components/layout/MobileNav.tsx` — dead code
- `src/components/ui/StoryCard.tsx` — dead variant branches
- `src/components/profile/ProfileForm.tsx` — duplicate of EditProfileModal
- `src/components/share/ShareTemplates/` — empty directory
- `src/lib/mock-data.ts` — verify not used in production paths

---

## Project Infrastructure

### Building and Running
- Dev server: `npm run dev` (port 3001)
- Type check: `npx tsc --noEmit`
- Build: `npm run build`
- Database: Supabase project at `ayuvcataqfbgladcakfy.supabase.co`

### Environment
- `.env.local` contains live credentials — do not commit
- `.env.example` is the template for new environments
- Supabase service role key exists — use sparingly via `createAdminClient()`

### Must Reference Tools
- `src/components/ui/` — browse before creating new primitives
- `src/types/*.ts` — extend existing types instead of creating new ones
- `src/lib/utils/constants.ts` — extract hardcoded values here
- `src/lib/hooks/` — place new hooks here
- `src/lib/utils/` — place new utilities here
