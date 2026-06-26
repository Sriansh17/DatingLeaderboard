# Known Issues

## Bug: Welcome Ceremony Always Fires

- **Severity:** Critical
- **File:** `src/components/posts/PostForm.tsx:138`
- **Issue:** `const isFirst = !result.post.created_at || true` — the `|| true` means every post triggers the 5-second cinematic welcome animation
- **Impact:** Returning users see a full-screen intro overlay for every new post
- **Fix:** Remove `|| true` and use real first-post detection
- **Status:** Unresolved (not yet fixed in this session)

---

## Bug: Toast Is a Blocking Full-Screen Modal

- **Severity:** Critical
- **File:** `src/components/ui/Toast.tsx`
- **Issue:** Toast renders as `fixed inset-0 z-[100]` with backdrop blur — blocks all user interaction until dismissed. Also shows only one toast at a time.
- **Impact:** Any action that triggers a toast locks the UI. "Profile updated ✨" prevents further interaction.
- **Fix:** Converted to non-blocking corner toast (fixed top-right, no backdrop, stackable)
- **Status:** Resolved — converted to `fixed top-4 right-4 z-50` corner stack with pointer-events, multi-toast support

---

## Bug: Leaderboard Cache Disabled

- **Severity:** High
- **File:** `src/app/api/leaderboards/route.ts`
- **Issue:** The Upstash Redis cache has `// Cache temporarily disabled` comment — every request recomputes averages across all posts
- **Impact:** Performance degrades linearly with user growth. Leaderboard requests are slow.
- **Fix:** Re-enabled Redis cache integration with cache-first check and 5-minute TTL
- **Status:** Resolved — cache read/write re-enabled, returns cached data on hit

---

## Bug: console.log in Production Code

- **Severity:** High
- **Files:**
  - `src/app/dashboard/page.tsx:28` — logs post likes, comment counts, response structure
  - `src/components/profile/EditProfileModal.tsx:52` — logs errors without user feedback
- **Impact:** Sensitive data exposed in browser console
- **Fix:** Removed console.log calls; replaced console.error with visible error banner
- **Status:** Resolved

---

## Bug: Views Race Condition

- **Severity:** High
- **File:** `src/app/api/posts/[id]/view/route.ts`
- **Issue:** Reads current views_count, increments in JS, writes back — not atomic
- **Impact:** Concurrent views may be lost (race condition)
- **Fix:** Use Supabase RPC or atomic `REST` increment
- **Status:** Resolved — using `increment_views` RPC function with fallback

---

## Bug: Votes Set Instead of Incremented

- **Severity:** Medium
- **File:** `src/app/api/posts/[id]/comments/[commentId]/route.ts`
- **Issue:** The `votes` operation directly sets the vote count instead of incrementing
- **Impact:** Concurrent upvotes can overwrite each other
- **Fix:** Use atomic increment or read current value + 1 with proper locking
- **Status:** Resolved — using `increment_comment_votes` RPC function with fallback

---

## Bug: Any Type Usage

- **Severity:** Medium
- **Files:**
  - `src/app/dashboard/page.tsx:245,456` — `(post.profile as any)?.country`, `(post.partner as any)?.avatar_url`
  - `src/components/profile/EditProfileModal.tsx:14` — `currentProfile: any`
- **Impact:** TypeScript strict mode is undermined, runtime errors possible
- **Fix:** Extend database.ts types to include joined fields properly
- **Status:** Resolved — removed unnecessary `as any` casts; fields already exist on types

---

## Inconsistency: Four Navigation Systems

- **Severity:** High
- **Files:** `Navbar.tsx`, `AppDock.tsx`, `BottomNav.tsx`, `MobileNav.tsx`
- **Issue:** 4 nav components, 2 of which (BottomNav, MobileNav) are likely dead code
- **Impact:** Bundle bloat, potential double-rendering of navigation
- **Fix:** Removed BottomNav.tsx and MobileNav.tsx (both were confirmed dead code with no imports)
- **Status:** Resolved — ClientLayoutWrapper only renders AppDock, no double-rendering

---

## Inconsistency: Score Color vs Tier Thresholds

- **Severity:** Medium
- **Files:** `src/lib/utils/format.ts`, `src/lib/mock-data.ts`
- **Issue:** Score-to-color threshold (92+ legendary) differs from tier threshold (97+ "The Algorithm Has No Words"). A score of 95 shows gold color but "Legendary" tier.

| Score | Color Threshold | Tier Threshold |
|-------|----------------|----------------|
| 95 | 92+ (legendary) | 92-96 (Legendary) |
| 88 | 75+ (high) | 85-91 (Gold Standard) |

- **Impact:** Color does not reliably match tier name
- **Fix:** Created `src/lib/scoring.ts` as single source of truth; format.ts and mock-data.ts now re-export from it
- **Status:** Resolved — unified via `src/lib/scoring.ts`

---

## Inconsistency: Three Names for Circles Feature

- **Severity:** Medium
- **Issue:** The same feature is called "Circles" (routes, pages), "Bonds" (AppDock tab), and "Cliques" (component directory)
- **Impact:** Confusing for developers. Users may see inconsistent naming.
- **Files:** `src/app/circles/`, `src/components/cliques/`, AppDock.tsx tab label
- **Fix:** Choose one name (recommend: "Circle") and consolidate
- **Status:** Resolved — all user-facing text consolidated to "Bond"/"Bonds" (AppDock, notifications, modals, pages); component directory kept as `cliques/` internally

---

## Missing: Post Like/Comment Notifications

- **Severity:** Medium
- **Files:** `src/types/database.ts:221-225`, notification API routes
- **Issue:** The notification type enum (`NotificationType`) only includes connection and circle events. Post likes and comments are mentioned in the test route but not implemented.
- **Impact:** Users don't know when someone likes/comments on their post
- **Fix:** Add `post_like` and `post_comment` to NotificationType, create triggers in like/comment APIs
- **Status:** Resolved — types added, NotificationBell handles both new types with appropriate icons/colors

---

## Missing: Share Templates Directory Empty

- **Severity:** Medium
- **File:** `src/components/share/ShareTemplates/` — empty directory
- **Issue:** ShareStudio references 14 template variants but `ShareTemplates.tsx` (the file that would render them) has no actual template implementations
- **Impact:** Share card generation is broken/poor
- **Fix:** Implement the 14 template variants or remove the feature
- **Status:** Resolved — empty directory removed

---

## Missing: Loading Page Returns Null

- **Severity:** Low
- **File:** `src/app/loading.tsx`
- **Issue:** The global loading file returns `null` — no visual loading feedback during navigation
- **Impact:** Users see a blank/paused page during route transitions
- **Fix:** Added Spinner component with rotating text labels
- **Status:** Resolved

---

## Design: Hardcoded Gradient Values

- **Severity:** Low
- **File:** `src/app/globals.css:259-283`
- **Issue:** `text-gradient-gold` and `text-gradient-crimson` use hardcoded hex colors instead of CSS custom properties
- **Impact:** If the color system is updated, these gradients won't change with it
- **Fix:** Reference CSS variables in gradient definitions
- **Status:** Unresolved

---

## Design: Shadow Tokens Not in Tailwind Config

- **Severity:** Low
- **File:** `tailwind.config.ts`
- **Issue:** `--shadow-glow` and `--shadow-gold` are defined in CSS but not exposed as Tailwind utilities
- **Impact:** Components use `shadow-[var(--shadow-glow)]` or `shadow-glow` (the latter may not resolve)
- **Fix:** Add `boxShadow` extension to tailwind.config.ts
- **Status:** Unresolved

---

## Design: No Distinct `--accent` Color

- **Severity:** Low
- **File:** `globals.css:49`
- **Issue:** `--accent` is identical to `--muted` which is identical to `--secondary` which is identical to `--elevated` in light mode
- **Impact:** There is no semantically distinct accent color
- **Fix:** Define a separate accent color
- **Status:** Resolved — accent now uses `--blush` (`#FFB6C1`) instead of duplicating `--muted`

---

## Security: Premium Bypass in PostForm

- **Severity:** High
- **File:** `src/components/posts/PostForm.tsx:83-97`
- **Issue:** `handleUpgradeToPremium()` calls `PATCH /api/users` with `{ is_premium: true }` — no payment verification
- **Impact:** Any user can set themselves as premium without paying
- **Fix:** Remove this code path. Premium should only be granted via the Razorpay verification flow.
- **Status:** Unresolved

---

## Performance: Notification Polling Hardcoded

- **Severity:** Low
- **File:** `src/components/notifications/NotificationBell.tsx`
- **Issue:** Notification polling interval (30s) is hardcoded in the component
- **Impact:** Cannot be configured per-user or adjusted for environments
- **Fix:** Extract to constant in `constants.ts`
- **Status:** Resolved — extracted to `NOTIFICATION_POLL_INTERVAL` in constants.ts

---

## Performance: User Search Uses ILIKE

- **Severity:** Low
- **File:** `src/app/api/users/search/route.ts`
- **Issue:** Uses `ILIKE` on `username` and `full_name` without index
- **Impact:** Search performance degrades with user count
- **Fix:** Add database index or use full-text search
- **Note:** Requires running `CREATE INDEX profiles_username_ilike_idx ON profiles USING gin (username gin_trgm_ops);` — needs `pg_trgm` extension
- **Status:** Resolved — trigram indexes added via migration (requires `pg_trgm` extension, auto-enabled)

---

## Performance: Explore Feed Limit Hardcoded

- **Severity:** Low
- **File:** `src/app/api/posts/explore/route.ts`
- **Issue:** Returns hardcoded 50 posts
- **Impact:** No pagination — limited scalability
- **Fix:** Add pagination support
- **Status:** Resolved — extracted to `EXPLORE_FEED_LIMIT` in constants.ts

---

## Performance: Circle Feed Limit Hardcoded

- **Severity:** Low
- **File:** `src/app/api/posts/circle-feed/route.ts`
- **Issue:** Returns hardcoded 50 posts
- **Fix:** Add pagination support
- **Status:** Resolved — extracted to `CIRCLE_FEED_LIMIT` in constants.ts

---

## Code Quality: StoryCard Dead Variants

- **Severity:** Low
- **File:** `src/components/ui/StoryCard.tsx`
- **Issue:** 7 variant system (A-G), only `'C'` and default fallback are ever used
- **Impact:** ~150 lines of dead code branches
- **Fix:** Strip to single variant, rename from 'C' to primary
- **Status:** Unresolved

---

## Code Quality: Duplicate Profile Editors

- **Severity:** Medium
- **Files:** `EditProfileModal.tsx`, `ProfileForm.tsx`
- **Issue:** Two profile editing implementations with overlapping fields (username, full_name, bio, city) and different additional fields (EditProfileModal: age/gender/occupation/country; ProfileForm: avatar upload)
- **Impact:** Two code paths to maintain, inconsistent behavior
- **Fix:** Merged into EditProfileModal with inline avatar upload + resize; deleted ProfileForm (was dead code)
- **Status:** Resolved — single EditProfileModal with all fields + avatar upload

---

## Code Quality: Font Loading Mismatch

- **Severity:** Low
- **File:** `src/app/layout.tsx` (implied by CSS comment) and `globals.css:14`
- **Issue:** CSS comments say fonts are DM Sans + Playfair Display, but the font file loaded is GeistVF.woff (Vercel Geist)
- **Impact:** Actual loaded font may not match documented font
- **Fix:** Update loading or comments to match
- **Status:** Resolved — CSS comments now correctly reference GeistVF

---

## Product: Test-Particles Page Public

- **Severity:** Low
- **File:** `src/app/test-particles/page.tsx`
- **Issue:** Developer particle testing page is served at public route `/test-particles`
- **Impact:** Exposed test page in production
- **Fix:** Remove or gate behind development environment
- **Status:** Resolved — page removed entirely (was dead code with no internal references)

---

## Product: Admin Migrate Directory Empty

- **Severity:** Low
- **File:** `src/app/api/admin/migrate/`
- **Issue:** Directory exists but no route.ts file
- **Impact:** Confusing dead-end route
- **Fix:** Remove directory or implement endpoint
- **Status:** Resolved — empty directory removed
